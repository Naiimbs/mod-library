import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  NgZone,
  signal,
  viewChild,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { copyToClipboard } from './clipboard';
import { TdBlock, TdConfig, TdEnv, TdItem, TdPreview, TdSection } from './token-docs.model';

/** Renders the live preview of one token. The host is layout-neutral (display: contents). */
@Component({
  selector: 'demo-td-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span [class]="preview().cls" [style]="preview().style ?? null">
      @if (preview().text; as text) {
        {{ text }}
      }
      @if (preview().inner; as inner) {
        @if (inner.bold) {
          <b [class]="inner.cls ?? ''">{{ inner.text }}</b>
        } @else {
          @for (n of repeat(inner.count ?? 1); track n) {
            <i [class]="inner.cls ?? ''" [style]="inner.style ?? null"></i>
          }
        }
      }
    </span>
  `,
})
export class TdPreviewView {
  readonly preview = input.required<TdPreview>();

  protected repeat(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }
}

/**
 * Shared shell of the Styles and Classes pages: header with filter, sticky section nav
 * with scroll-spy, click-to-copy on every token, toast. Port of TokenDocsPage in the
 * original js/components/token-docs.js.
 *
 * Token values are never hardcoded: the sections are built after the first render from
 * getComputedStyle, so the docs always match the loaded CSS.
 */
@Component({
  selector: 'demo-token-docs',
  imports: [TdPreviewView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './token-docs.html',
  styleUrl: './token-docs.css',
  host: {
    class: 'token-docs',
    dir: 'ltr',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class TokenDocs {
  readonly config = input.required<TdConfig>();

  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);

  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('search');
  private readonly sectionEls = viewChildren<ElementRef<HTMLElement>>('sectionEl');

  protected readonly sections = signal<readonly TdSection[]>([]);
  protected readonly query = signal('');
  protected readonly activeId = signal('');
  protected readonly copied = signal<ReadonlySet<string>>(new Set());

  protected readonly toastText = signal('');
  protected readonly toastVisible = signal(false);
  protected readonly toastHidden = signal(true);

  private readonly allItems = computed(() => this.sections().flatMap((s) => s.blocks.flatMap((b) => b.items)));

  /** Names matching the filter, or null when no filter is active. */
  private readonly hits = computed<ReadonlySet<string> | null>(() => {
    const q = this.query();
    if (!q) return null;
    return new Set(this.allItems().filter((item) => item.name.toLowerCase().includes(q)).map((item) => item.name));
  });

  protected readonly isEmpty = computed(() => this.hits()?.size === 0);

  protected readonly searchCount = computed(() => {
    const hits = this.hits();
    return hits ? `${hits.size} of ${this.allItems().length}` : '';
  });

  private readonly copyTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private toastTimer: ReturnType<typeof setTimeout> | undefined;
  private toastHideTimer: ReturnType<typeof setTimeout> | undefined;
  private navLock = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.sections.set(this.buildSections());
      this.activeId.set(this.sections()[0]?.id ?? '');

      const win = this.document.defaultView;
      if (!win) return;
      let ticking = false;
      const onScroll = (): void => {
        if (ticking) return;
        ticking = true;
        win.requestAnimationFrame(() => {
          ticking = false;
          this.spy(win);
        });
      };
      // Outside the zone: the handler only writes a signal when the current section changes.
      this.zone.runOutsideAngular(() => win.addEventListener('scroll', onScroll, { passive: true }));
      destroyRef.onDestroy(() => win.removeEventListener('scroll', onScroll));
    });

    destroyRef.onDestroy(() => {
      this.copyTimers.forEach((timer) => clearTimeout(timer));
      clearTimeout(this.toastTimer);
      clearTimeout(this.toastHideTimer);
    });
  }

  /* ---------- live theme access ---------- */

  private buildSections(): TdSection[] {
    const doc = this.document;
    const win = doc.defaultView;
    if (!win) return [];
    const rootStyle = win.getComputedStyle(doc.documentElement);

    // Probe element: tells whether a utility class really exists in the loaded CSS
    // (e.g. the theme ships no *-sad-* utilities).
    const probe = doc.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;';
    doc.body.appendChild(probe);

    const env: TdEnv = {
      resolve: (name) => rootStyle.getPropertyValue(name).trim(),
      classApplies: (cls, prop) => {
        probe.className = '';
        const base = win.getComputedStyle(probe)[prop];
        probe.className = cls;
        const applied = win.getComputedStyle(probe)[prop];
        probe.className = '';
        return applied !== base;
      },
    };

    try {
      return this.config().sections(env);
    } finally {
      probe.remove();
    }
  }

  /* ---------- filter ---------- */

  protected onSearch(value: string): void {
    this.query.set(value.trim().toLowerCase());
  }

  protected itemShown(item: TdItem): boolean {
    return this.hits()?.has(item.name) ?? true;
  }

  protected blockShown(block: TdBlock): boolean {
    const hits = this.hits();
    return !hits || block.items.some((item) => hits.has(item.name));
  }

  protected sectionShown(section: TdSection): boolean {
    return section.blocks.some((block) => this.blockShown(block));
  }

  /** "/" focuses the filter field. */
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== '/') return;
    const tag = this.document.activeElement?.tagName ?? '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    event.preventDefault();
    this.searchInput().nativeElement.focus();
  }

  /* ---------- copy to clipboard, with visual feedback + toast ---------- */

  protected copy(name: string): void {
    void copyToClipboard(this.document, name).then(() => this.flashCopied(name));
  }

  private flashCopied(name: string): void {
    this.copied.update((set) => new Set(set).add(name));
    clearTimeout(this.copyTimers.get(name));
    this.copyTimers.set(
      name,
      setTimeout(() => {
        this.copyTimers.delete(name);
        this.copied.update((set) => {
          const next = new Set(set);
          next.delete(name);
          return next;
        });
      }, 1200),
    );

    this.toastText.set(name);
    this.toastHidden.set(false);
    this.toastVisible.set(true);
    clearTimeout(this.toastTimer);
    clearTimeout(this.toastHideTimer);
    this.toastTimer = setTimeout(() => {
      this.toastVisible.set(false);
      this.toastHideTimer = setTimeout(() => this.toastHidden.set(true), 200);
    }, 1600);
  }

  /* ---------- section nav: smooth scroll + scroll-spy ---------- */

  protected goTo(id: string): void {
    const win = this.document.defaultView;
    const target = this.sectionEls().find((ref) => ref.nativeElement.dataset['section'] === id)?.nativeElement;
    if (!win || !target) return;
    this.navLock = Date.now();
    this.activeId.set(id);
    const reduced = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = target.getBoundingClientRect().top + win.scrollY - 96;
    win.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  }

  private spy(win: Window): void {
    // skip spy updates for a beat after a nav click
    if (this.navLock && Date.now() - this.navLock < 700) return;
    const visible = this.sectionEls()
      .map((ref) => ref.nativeElement)
      .filter((el) => !el.hidden);
    if (!visible.length) return;
    const atBottom = win.scrollY + win.innerHeight >= this.document.documentElement.scrollHeight - 2;
    let current = visible[0];
    if (atBottom) {
      current = visible[visible.length - 1];
    } else {
      const line = 132; // px below viewport top = "current section" line
      for (const el of visible) {
        if (el.getBoundingClientRect().top <= line) current = el;
      }
    }
    const id = current.dataset['section'] ?? '';
    if (id !== this.activeId()) this.activeId.set(id);
  }
}
