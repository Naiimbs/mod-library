import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  Injectable,
  input,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** Tiles are rendered in chunks of this size; a sentinel at the end loads the next one. */
export const ICONS_CHUNK_SIZE = 240;

/** The seven styles of the DGA icon font (modifier classes next to `icon dga-icon-NAME`). */
export interface IconFontVariant {
  readonly label: string;
  readonly classes: string;
}

export const ICON_FONT_VARIANTS: readonly IconFontVariant[] = [
  { label: 'Stroke Rounded', classes: '' },
  { label: 'Twotone Rounded', classes: 'twotone rounded' },
  { label: 'Duotone Rounded', classes: 'duotone rounded' },
  { label: 'Solid Rounded', classes: 'solid rounded' },
  { label: 'Bulk Rounded', classes: 'bulk rounded' },
  { label: 'Stroke Sharp', classes: 'stroke sharp' },
  { label: 'Solid Sharp', classes: 'solid sharp' },
];

/** "add-remove-delete" / "Add Remove Delete" -> "Add + Remove + Delete" (as the original sidebar). */
export function formatPackLabel(label: string): string {
  return label
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/ /g, ' + ');
}

/** Saves text as a file through a temporary object URL. */
export function downloadText(doc: Document, text: string, type: string, filename: string): void {
  const win = doc.defaultView;
  if (!win) return;
  const url = win.URL.createObjectURL(new win.Blob([text], { type }));
  const anchor = doc.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  doc.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  win.URL.revokeObjectURL(url);
}

/**
 * Emits when the host element scrolls into view (plus `rootMargin`). Used on the grid
 * sentinels for infinite scroll.
 */
@Directive({ selector: '[demoInView]' })
export class InView {
  readonly demoInView = output<void>();
  readonly rootMargin = input('0px');

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) this.demoInView.emit();
        },
        { rootMargin: this.rootMargin() },
      );
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}

/**
 * Loads and caches the library SVG files (public/library-icons/{name}-{variant}.svg),
 * and shares one IntersectionObserver between all lazily loaded tiles.
 */
@Injectable()
export class LibrarySvgStore {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cache = new Map<string, Promise<string>>();
  private readonly loaded = new Map<string, string>();
  private readonly callbacks = new Map<Element, () => void>();
  private observer: IntersectionObserver | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.observer?.disconnect();
      this.callbacks.clear();
    });
  }

  /** SVG markup already fetched for this file, if any. */
  peek(file: string): string | undefined {
    return this.loaded.get(file);
  }

  load(file: string): Promise<string> {
    const win = this.document.defaultView;
    if (!this.browser || !win) return Promise.reject(new Error('SVG files are only loaded in the browser'));
    let pending = this.cache.get(file);
    if (!pending) {
      pending = win
        .fetch('library-icons/' + file)
        .then((response) => (response.ok ? response.text() : Promise.reject(new Error(String(response.status)))))
        .then((svg) => {
          this.loaded.set(file, svg);
          return svg;
        });
      // a failed request may be retried later
      pending.catch(() => this.cache.delete(file));
      this.cache.set(file, pending);
    }
    return pending;
  }

  /** Calls `callback` once when `el` gets near the viewport. Returns an unsubscribe function. */
  whenNearViewport(el: Element, callback: () => void): () => void {
    if (!this.browser || typeof IntersectionObserver === 'undefined') {
      if (this.browser) callback();
      return () => undefined;
    }
    this.observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const run = this.callbacks.get(entry.target);
          this.release(entry.target);
          run?.();
        }
      },
      { rootMargin: '300px' },
    );
    this.callbacks.set(el, callback);
    this.observer.observe(el);
    return () => this.release(el);
  }

  private release(el: Element): void {
    this.callbacks.delete(el);
    this.observer?.unobserve(el);
  }
}

/**
 * Inlines a library SVG into its host so it follows `currentColor`. With `lazy`, the file
 * is only fetched when the host gets near the viewport; the host stays empty until then
 * (the CSS shows a skeleton for `.libicons-svg:empty`).
 *
 * The markup comes from this app's own static assets, so it is trusted as HTML.
 */
@Directive({
  selector: '[demoLibSvg]',
  host: { '[innerHTML]': 'html()' },
})
export class LibSvg {
  /** File name inside public/library-icons, e.g. "home-01-stroke.svg". */
  readonly file = input.required<string>({ alias: 'demoLibSvg' });
  readonly lazy = input(false, { transform: booleanAttribute });

  private readonly store = inject(LibrarySvgStore);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly html = signal<SafeHtml | string>('');

  constructor() {
    effect((onCleanup) => {
      const file = this.file();
      let cancelled = false;
      const show = (svg: string): void => {
        if (!cancelled) this.html.set(this.sanitizer.bypassSecurityTrustHtml(svg));
      };

      const cached = this.store.peek(file);
      if (cached !== undefined) {
        show(cached);
        return;
      }

      this.html.set('');
      const fetchNow = (): void => {
        this.store.load(file).then(show, () => undefined); // on failure the tile keeps its skeleton
      };
      let stop: (() => void) | undefined;
      if (this.lazy()) stop = this.store.whenNearViewport(this.el, fetchNow);
      else fetchNow();
      onCleanup(() => {
        cancelled = true;
        stop?.();
      });
    });
  }
}
