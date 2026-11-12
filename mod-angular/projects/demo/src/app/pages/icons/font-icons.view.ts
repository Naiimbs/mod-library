import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  linkedSignal,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { copyToClipboard } from '../styles/clipboard';
import { MOD_ICON_REGISTRY, IconCategory } from './icons-data';
import { downloadText, formatPackLabel, ICON_FONT_VARIANTS, ICONS_CHUNK_SIZE, IconFontVariant, InView } from './icons.shared';

type CodeTab = 'html' | 'css' | 'json' | 'svg';

interface Pack {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly preview: string | null;
}

/** Flat render queue: group headers (when browsing all packs) + icons. */
type GridEntry =
  | { readonly kind: 'header'; readonly key: string; readonly label: string; readonly count: number }
  | { readonly kind: 'icon'; readonly key: string; readonly cls: string };

const CATEGORY_OF = new Map<string, IconCategory>();
/** "dga-icon-arrow-left-01" -> "arrow left 01", for multi-word search. */
const SEARCH_NAME = new Map<string, string>();
for (const category of MOD_ICON_REGISTRY) {
  for (const cls of category.icons) {
    CATEGORY_OF.set(cls, category);
    SEARCH_NAME.set(cls, cls.replace('dga-icon-', '').replace(/[-_]+/g, ' ').toLowerCase());
  }
}
const TOTAL_ICONS = MOD_ICON_REGISTRY.reduce((sum, category) => sum + category.icons.length, 0);

function iconMatches(cls: string, words: readonly string[]): boolean {
  if (!words.length) return true;
  const name = SEARCH_NAME.get(cls) ?? cls;
  return words.every((word) => name.includes(word));
}

/**
 * "DGA Font Icons" tab: pack sidebar, multi-word search, style filter, chunked grid with
 * infinite scroll, per-tile quick copy and the detail modal. Port of IconsShowcase in
 * the original js/components/icons.js. The host element is the `.icons-page` container.
 */
@Component({
  selector: 'demo-font-icons',
  imports: [InView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './font-icons.view.html',
  host: {
    class: 'icons-page',
    id: 'icons-view-font',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class FontIconsView {
  /** Message for the page-level toast. */
  readonly toast = output<string>();

  private readonly document = inject(DOCUMENT);
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchEl');

  protected readonly variants = ICON_FONT_VARIANTS;
  protected readonly tabs: readonly { id: CodeTab; label: string }[] = [
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'json', label: 'JSON' },
    { id: 'svg', label: 'SVG' },
  ];
  protected readonly packs: readonly Pack[] = [
    { id: 'all', label: 'All Icons', count: TOTAL_ICONS, preview: null },
    ...MOD_ICON_REGISTRY.map((category) => ({
      id: category.id,
      label: formatPackLabel(category.label),
      count: category.icons.length,
      preview: category.icons[0] ?? null,
    })),
  ];

  /* ---------- browse state ---------- */

  protected readonly pack = signal('all');
  /** Raw text of the search field; `search` follows it after a 200ms debounce. */
  protected readonly inputValue = signal('');
  protected readonly search = signal('');
  protected readonly variantIndex = signal(0);

  protected readonly gridVariant = computed(() => this.variants[this.variantIndex()] ?? this.variants[0]);

  /** Every word of the query must appear in the icon's normalized name. */
  protected readonly words = computed(() =>
    this.search()
      .toLowerCase()
      .replace(/[-_]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean),
  );

  private readonly pending = computed<GridEntry[]>(() => {
    const words = this.words();
    const pack = this.pack();
    const entries: GridEntry[] = [];
    for (const category of MOD_ICON_REGISTRY) {
      if (pack !== 'all' && pack !== category.id) continue;
      const matching = words.length ? category.icons.filter((cls) => iconMatches(cls, words)) : category.icons;
      if (!matching.length) continue;
      if (pack === 'all') {
        entries.push({
          kind: 'header',
          key: 'header/' + category.id,
          label: formatPackLabel(category.label),
          count: matching.length,
        });
      }
      for (const cls of matching) entries.push({ kind: 'icon', key: category.id + '/' + cls, cls });
    }
    return entries;
  });

  /** Number of queue entries currently rendered; resets when the queue or the style changes. */
  private readonly rendered = linkedSignal(() => {
    this.pending();
    this.variantIndex();
    return ICONS_CHUNK_SIZE;
  });

  protected readonly visible = computed(() => this.pending().slice(0, this.rendered()));
  protected readonly hasMore = computed(() => this.rendered() < this.pending().length);
  /** Changes with every chunk, so the sentinel is re-created and observed afresh. */
  protected readonly sentinelKey = computed(() => [this.rendered()]);

  protected readonly total = computed(() => this.pending().reduce((n, entry) => n + (entry.kind === 'icon' ? 1 : 0), 0));
  protected readonly totalLabel = computed(() => this.total().toLocaleString());

  protected readonly packLabel = computed(() => {
    const pack = this.pack();
    if (pack === 'all') return 'all packs';
    return formatPackLabel(MOD_ICON_REGISTRY.find((category) => category.id === pack)?.label ?? pack);
  });

  /** Matches across all packs, while a pack is selected and a query is active (else 0). */
  protected readonly allPacksCount = computed(() => {
    const words = this.words();
    if (this.pack() === 'all' || !words.length) return 0;
    let n = 0;
    for (const category of MOD_ICON_REGISTRY) {
      for (const cls of category.icons) if (iconMatches(cls, words)) n++;
    }
    return n;
  });
  protected readonly allPacksLabel = computed(() => this.allPacksCount().toLocaleString());

  /* ---------- modal state ---------- */

  protected readonly activeIcon = signal<string | null>(null);
  protected readonly activeVariantIndex = signal(0);
  protected readonly activeTab = signal<CodeTab>('html');

  protected readonly activeVariant = computed<IconFontVariant>(
    () => this.variants[this.activeVariantIndex()] ?? this.variants[0],
  );

  /** Icon class plus the style modifier classes of the selected variant. */
  protected readonly fullClass = computed(() => {
    const classes = this.activeVariant().classes;
    const icon = this.activeIcon() ?? '';
    return classes ? icon + ' ' + classes : icon;
  });

  protected readonly modalSubtitle = computed(() => {
    const category = CATEGORY_OF.get(this.activeIcon() ?? '');
    return 'Icon Pack: ' + formatPackLabel(category?.label ?? '');
  });

  protected readonly code = computed(() => {
    const icon = this.activeIcon() ?? '';
    const variant = this.activeVariant();
    const fullClass = this.fullClass();
    const category = CATEGORY_OF.get(icon);
    const fontFamily = category ? 'dga-fonts-icons-' + category.id : '';

    switch (this.activeTab()) {
      case 'html':
        return '<span class="icon ' + fullClass + '"></span>';
      case 'css':
        return (
          '.' + icon + ' {\n' +
          "    font-family: '" + fontFamily + "' !important;\n" +
          '}\n\n' +
          '/* Usage */\n' +
          '.icon.' + icon + (variant.classes ? '.' + variant.classes.replace(/ /g, '.') : '') + ' {\n' +
          '    speak: never;\n' +
          '    font-style: normal;\n' +
          '    font-weight: normal;\n' +
          '    font-variant: normal;\n' +
          '    text-transform: none;\n' +
          '    line-height: 1;\n' +
          '    -webkit-font-smoothing: antialiased;\n' +
          '    -moz-osx-font-smoothing: grayscale;\n' +
          '}'
        );
      case 'json':
        return JSON.stringify(
          {
            name: this.iconName(icon),
            class: fullClass,
            variant: variant.label,
            pack: category ? category.label : '',
            fontFamily,
            html: '<span class="icon ' + fullClass + '"></span>',
          },
          null,
          2,
        );
      case 'svg':
        return this.svgMarkup(fullClass);
    }
  });

  private debounceTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.debounceTimer);
      if (this.activeIcon()) this.document.body.style.overflow = '';
    });
  }

  /** "dga-icon-arrow-left-01" -> "Arrow Left 01". */
  protected iconName(cls: string): string {
    return cls
      .replace('dga-icon-', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  protected iconClass(cls: string, variant: IconFontVariant): string {
    return 'icon ' + cls + (variant.classes ? ' ' + variant.classes : '');
  }

  /* ---------- search / filters ---------- */

  protected onInput(value: string): void {
    this.inputValue.set(value);
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.search.set(value), 200);
  }

  /** Esc inside the field clears the query. */
  protected onSearchEscape(event: Event): void {
    if (!this.inputValue()) return;
    event.stopPropagation();
    this.resetSearch();
  }

  protected clearSearch(): void {
    this.resetSearch();
    this.searchInput().nativeElement.focus();
  }

  private resetSearch(): void {
    clearTimeout(this.debounceTimer);
    this.inputValue.set('');
    this.search.set('');
  }

  protected selectPack(id: string): void {
    this.pack.set(id);
  }

  protected loadMore(): void {
    this.rendered.update((n) => Math.min(n + ICONS_CHUNK_SIZE, this.pending().length));
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
      return;
    }
    // "/" focuses search, matching the other docs pages
    if (event.key !== '/') return;
    const tag = this.document.activeElement?.tagName ?? '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    event.preventDefault();
    this.searchInput().nativeElement.focus();
  }

  /* ---------- copy / modal ---------- */

  /** Quick copy of the class name from a tile, without opening the modal. */
  protected quickCopy(cls: string, event: Event): void {
    event.stopPropagation();
    this.copy(cls);
  }

  protected copy(text: string): void {
    void copyToClipboard(this.document, text).then(() => this.toast.emit('Copied ' + text));
  }

  protected openModal(cls: string): void {
    this.activeVariantIndex.set(0); // default: Stroke Rounded
    this.activeTab.set('html');
    this.activeIcon.set(cls);
    this.document.body.style.overflow = 'hidden';
  }

  protected closeModal(): void {
    if (!this.activeIcon()) return;
    this.activeIcon.set(null);
    this.document.body.style.overflow = '';
  }

  protected onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModal();
  }

  protected downloadSvg(): void {
    const icon = this.activeIcon();
    if (!icon) return;
    downloadText(this.document, this.svgMarkup(this.fullClass()), 'image/svg+xml', icon + '.svg');
    this.toast.emit('Downloaded ' + icon + '.svg');
  }

  private svgMarkup(fullClass: string): string {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n' +
      '    <foreignObject width="24" height="24">\n' +
      '        <span xmlns="http://www.w3.org/1999/xhtml"\n' +
      '              class="icon ' + fullClass + '"\n' +
      '              style="font-size: var(--font-size-2xl);line-height:1;">\n' +
      '        </span>\n' +
      '    </foreignObject>\n' +
      '</svg>'
    );
  }
}
