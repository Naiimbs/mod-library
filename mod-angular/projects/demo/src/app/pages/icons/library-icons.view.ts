import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  linkedSignal,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { copyToClipboard } from '../styles/clipboard';
import { MOD_ICON_REGISTRY } from './icons-data';
import { downloadText, ICON_FONT_VARIANTS, ICONS_CHUNK_SIZE, InView, LibrarySvgStore, LibSvg } from './icons.shared';
import { MOD_LIBRARY_ICONS, MOD_LIBRARY_ICONS_SOLID_ONLY, MOD_LIBRARY_ICONS_STROKE_ONLY } from './library-icons-data';

type SvgVariant = 'stroke' | 'solid';
type CodeTab = 'component' | 'font' | 'svg';

/** SVG variants come from library-icons/{name}-{variant}.svg; font variants render
    through the icon font classes for the same name. */
type LibVariant =
  | { readonly id: string; readonly label: string; readonly kind: 'svg'; readonly variant: SvgVariant }
  | { readonly id: string; readonly label: string; readonly kind: 'font'; readonly classes: string };

const LIBICONS_VARIANTS: readonly LibVariant[] = [
  { id: 'svg-stroke', label: 'SVG Stroke', kind: 'svg', variant: 'stroke' },
  { id: 'svg-solid', label: 'SVG Solid', kind: 'svg', variant: 'solid' },
  ...ICON_FONT_VARIANTS.map(
    (v): LibVariant => ({
      id: 'font-' + v.label.toLowerCase().replace(/ /g, '-'),
      label: v.label,
      kind: 'font',
      classes: v.classes,
    }),
  ),
];

interface Pack {
  readonly id: string;
  readonly label: string;
  readonly icons: readonly string[];
}

const STROKE_ONLY = new Set(MOD_LIBRARY_ICONS_STROKE_ONLY);
const SOLID_ONLY = new Set(MOD_LIBRARY_ICONS_SOLID_ONLY);

/* Categories: same packs as the icon font. Font classes are "dga-icon-{name}" and SVG
   files are "{name}-{variant}.svg", so pack membership maps 1:1 by name. Anything the
   font does not carry lands in "Other". */
const FONT_NAMES = new Set<string>();
const PACK_LABEL_OF = new Map<string, string>();
const PACKS: Pack[] = [];
{
  const svgNames = new Set(MOD_LIBRARY_ICONS);
  for (const category of MOD_ICON_REGISTRY) {
    const members: string[] = [];
    for (const cls of category.icons) {
      const name = cls.replace(/^dga-icon-/, '');
      FONT_NAMES.add(name);
      if (svgNames.has(name) && !PACK_LABEL_OF.has(name)) {
        PACK_LABEL_OF.set(name, category.label);
        members.push(name);
      }
    }
    if (members.length) PACKS.push({ id: category.id, label: category.label, icons: members });
  }
  const leftover = MOD_LIBRARY_ICONS.filter((name) => !PACK_LABEL_OF.has(name));
  if (leftover.length) {
    PACKS.push({ id: 'other', label: 'Other', icons: leftover });
    for (const name of leftover) PACK_LABEL_OF.set(name, 'Other');
  }
}

function svgFileFor(name: string, variant: SvgVariant): string {
  let v = variant;
  if (v === 'solid' && STROKE_ONLY.has(name)) v = 'stroke';
  else if (v === 'stroke' && SOLID_ONLY.has(name)) v = 'solid';
  return name + '-' + v + '.svg';
}

/**
 * "Icon Library" tab: the full DGA icon set in nine styles (SVG stroke/solid + the seven
 * icon-font styles), pack sidebar, search, chunked grid with lazily inlined currentColor
 * SVGs, and a detail modal with variant previews, code tabs, copy and SVG download.
 * Port of LibraryIconsShowcase in the original js/components/library-icons.js.
 * The host element is the `.icons-page` container.
 */
@Component({
  selector: 'demo-library-icons',
  imports: [InView, LibSvg],
  providers: [LibrarySvgStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './library-icons.view.html',
  host: {
    class: 'icons-page',
    id: 'icons-view-library',
    '(document:keydown.escape)': 'closeModal()',
  },
})
export class LibraryIconsView {
  /** Message for the page-level toast. */
  readonly toast = output<string>();

  private readonly document = inject(DOCUMENT);
  private readonly store = inject(LibrarySvgStore);
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('search');

  protected readonly variants = LIBICONS_VARIANTS;
  protected readonly tabs: readonly { id: CodeTab; label: string }[] = [
    { id: 'component', label: 'Component' },
    { id: 'font', label: 'Font' },
    { id: 'svg', label: 'SVG' },
  ];
  protected readonly packs: readonly { id: string; label: string; count: number; preview: string | null }[] = [
    { id: 'all', label: 'All Icons', count: MOD_LIBRARY_ICONS.length, preview: null },
    ...PACKS.map((pack) => {
      const first = pack.icons[0];
      return {
        id: pack.id,
        label: pack.label,
        count: pack.icons.length,
        preview: first !== undefined && FONT_NAMES.has(first) ? first : null,
      };
    }),
  ];

  /* ---------- browse state ---------- */

  protected readonly pack = signal('all');
  /** Raw text of the search field; `search` follows it after a 150ms debounce. */
  protected readonly inputValue = signal('');
  private readonly search = signal('');
  protected readonly variantIndex = signal(0);

  protected readonly variant = computed<LibVariant>(() => this.variants[this.variantIndex()] ?? this.variants[0]);

  /** Icons of the selected pack that the selected style can render. */
  private readonly base = computed<readonly string[]>(() => {
    const pack = this.pack();
    const names = pack === 'all' ? MOD_LIBRARY_ICONS : (PACKS.find((p) => p.id === pack)?.icons ?? []);
    // font styles can only render icons the font actually has
    return this.variant().kind === 'font' ? names.filter((name) => FONT_NAMES.has(name)) : names;
  });

  private readonly filtered = computed<readonly string[]>(() => {
    const words = this.search().split(/\s+/).filter(Boolean);
    const base = this.base();
    return words.length ? base.filter((name) => words.every((word) => name.includes(word))) : base;
  });

  /** Number of tiles currently rendered; resets whenever the filter changes. */
  private readonly rendered = linkedSignal(() => {
    this.filtered();
    return ICONS_CHUNK_SIZE;
  });

  protected readonly visible = computed(() => this.filtered().slice(0, this.rendered()));
  protected readonly hasMore = computed(() => this.rendered() < this.filtered().length);
  /** Changes with every chunk, so the sentinel is re-created and observed afresh. */
  protected readonly sentinelKey = computed(() => [this.rendered()]);

  protected readonly resultsText = computed(() => {
    const pack = this.pack();
    const variant = this.variant();
    const packLabel = pack === 'all' ? 'All Icons' : (PACKS.find((p) => p.id === pack)?.label ?? '');
    const count = this.filtered().length;
    let text =
      (this.search() ? count + ' of ' + this.base().length : String(count)) +
      ' icons · ' + packLabel + ' · ' + variant.label;
    if (variant.kind === 'font') text += ' (icon font)';
    return text;
  });

  /* ---------- modal state ---------- */

  protected readonly modalName = signal<string | null>(null);
  protected readonly modalVariantIndex = signal(0);
  protected readonly modalTab = signal<CodeTab>('component');

  protected readonly modalVariant = computed<LibVariant>(
    () => this.variants[this.modalVariantIndex()] ?? this.variants[0],
  );

  protected readonly modalSubtitle = computed(() => {
    const name = this.modalName() ?? '';
    const availability = FONT_NAMES.has(name) ? 'SVG + icon font' : 'SVG only';
    return 'Icon Pack: ' + (PACK_LABEL_OF.get(name) ?? 'Other') + ' · ' + availability;
  });

  /** SVG file behind the current modal selection (font styles fall back to the stroke SVG). */
  private readonly modalSvgFile = computed(() => {
    const variant = this.modalVariant();
    return svgFileFor(this.modalName() ?? '', variant.kind === 'svg' ? variant.variant : 'stroke');
  });

  /** Text of the SVG code tab; loaded on demand. */
  private readonly svgCode = signal('Loading SVG…');

  protected readonly code = computed(() => {
    const name = this.modalName() ?? '';
    const variant = this.modalVariant();
    switch (this.modalTab()) {
      case 'component': {
        const variantAttr = variant.kind === 'svg' ? variant.variant : variant.classes.includes('solid') ? 'solid' : 'stroke';
        return '<mod-icon name="' + name + '" variant="' + variantAttr + '" size="24"></mod-icon>';
      }
      case 'font':
        return FONT_NAMES.has(name)
          ? '<span class="icon dga-icon-' + name + (variant.kind === 'font' && variant.classes ? ' ' + variant.classes : '') + '"></span>'
          : '/* This icon is not part of the icon font — use the SVG or the component. */';
      case 'svg':
        return this.svgCode();
    }
  });

  private debounceTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // Keep the SVG code tab in sync with the selected icon / variant.
    effect((onCleanup) => {
      if (this.modalName() === null || this.modalTab() !== 'svg') return;
      const file = this.modalSvgFile();
      const cached = this.store.peek(file);
      if (cached !== undefined) {
        this.svgCode.set(cached);
        return;
      }
      let cancelled = false;
      this.svgCode.set('Loading SVG…');
      this.store.load(file).then(
        (svg) => {
          if (!cancelled) this.svgCode.set(svg);
        },
        () => {
          if (!cancelled) this.svgCode.set('Could not load the SVG.');
        },
      );
      onCleanup(() => {
        cancelled = true;
      });
    });

    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.debounceTimer);
      if (this.modalName() !== null) this.document.body.style.overflow = '';
    });
  }

  /* ---------- template helpers ---------- */

  protected spaced(name: string): string {
    return name.replace(/-/g, ' ');
  }

  protected inFont(name: string): boolean {
    return FONT_NAMES.has(name);
  }

  protected fontClass(name: string, classes: string): string {
    return 'icon dga-icon-' + name + (classes ? ' ' + classes : '');
  }

  protected svgFile(name: string, variant: SvgVariant): string {
    return svgFileFor(name, variant);
  }

  /* ---------- search / filters ---------- */

  protected onInput(value: string): void {
    this.inputValue.set(value);
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.search.set(value.trim().toLowerCase()), 150);
  }

  protected clearSearch(): void {
    clearTimeout(this.debounceTimer);
    this.inputValue.set('');
    this.search.set('');
    this.searchInput().nativeElement.focus();
  }

  protected loadMore(): void {
    this.rendered.update((n) => Math.min(n + ICONS_CHUNK_SIZE, this.filtered().length));
  }

  /* ---------- copy / modal ---------- */

  /** Quick copy of the icon name from a tile, without opening the modal. */
  protected quickCopy(name: string, event: Event): void {
    event.stopPropagation();
    this.copyName(name);
  }

  protected copyName(name: string): void {
    this.copy(name, 'Copied "' + name + '"');
  }

  protected copy(text: string, message: string): void {
    void copyToClipboard(this.document, text).then(() => this.toast.emit(message));
  }

  protected openModal(name: string): void {
    // start the modal on the grid's current style when possible
    this.modalVariantIndex.set(this.variant().kind === 'font' && !FONT_NAMES.has(name) ? 0 : this.variantIndex());
    this.modalTab.set('component');
    this.modalName.set(name);
    this.document.body.style.overflow = 'hidden';
  }

  protected closeModal(): void {
    if (this.modalName() === null) return;
    this.modalName.set(null);
    this.document.body.style.overflow = '';
  }

  protected onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModal();
  }

  protected downloadSvg(): void {
    const file = this.modalSvgFile();
    this.store.load(file).then(
      (svg) => {
        downloadText(this.document, svg, 'image/svg+xml', file);
        this.toast.emit('Downloaded ' + file);
      },
      () => this.toast.emit('Could not download the SVG.'),
    );
  }
}
