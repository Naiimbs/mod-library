/* Data model + shared token lists for the Styles and Classes pages
   (ported from the original js/components/token-docs.js). */

export type TdStyle = Readonly<Record<string, string>>;

/** Live preview of a token: an outer element plus optional inner element(s). */
export interface TdPreview {
  /** Classes of the outer <span> (docs class and/or the utility class being demonstrated). */
  readonly cls: string;
  readonly style?: TdStyle;
  readonly text?: string;
  readonly inner?: {
    /** Render a <b> (text sample) instead of <i> (bar / box). */
    readonly bold?: boolean;
    readonly cls?: string;
    readonly style?: TdStyle;
    readonly text?: string;
    /** Number of <i> elements, default 1. */
    readonly count?: number;
  };
}

export interface TdItem {
  /** Token name: what is copied, filtered on, and shown as the title. */
  readonly name: string;
  /** Visible label (shade number for scale cells, the name elsewhere). */
  readonly label: string;
  /** Resolved value, read live from the loaded CSS. */
  readonly value: string;
  readonly preview: TdPreview;
}

export interface TdBlock {
  readonly kind: 'family' | 'cards' | 'shadow' | 'table' | 'types';
  /** Optional group title rendered above the block. */
  readonly title?: string;
  /** Color family label + key (kind 'family'). */
  readonly label?: string;
  readonly key?: string;
  /** Wide card grid (kind 'cards'). */
  readonly wide?: boolean;
  /** Type rows sit directly in the section, without a group wrapper (kind 'types'). */
  readonly ungrouped?: boolean;
  readonly items: readonly TdItem[];
}

export interface TdSection {
  readonly id: string;
  readonly title: string;
  readonly note?: string;
  readonly blocks: readonly TdBlock[];
}

/** Access to the live theme; only available in the browser, after render. */
export interface TdEnv {
  /** Resolved value of a CSS custom property on :root ('' when not defined). */
  resolve(name: string): string;
  /** Whether a utility class exists in the loaded CSS (it changes `prop` on a probe element). */
  classApplies(cls: string, prop: 'backgroundColor' | 'color' | 'borderTopColor'): boolean;
}

export interface TdConfig {
  readonly title: string;
  readonly subtitle: string;
  readonly searchPlaceholder: string;
  readonly sections: (env: TdEnv) => TdSection[];
}

export interface TdColorFamily {
  readonly key: string;
  readonly label: string;
  readonly shades: readonly number[];
}

const FULL_SCALE = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export const TD_COLOR_FAMILIES: readonly TdColorFamily[] = [
  { key: 'sa', label: 'Primary — Brand Green', shades: FULL_SCALE },
  { key: 'sad', label: 'Dark Green', shades: [100, 200, 300, 400, 500] },
  { key: 'gray', label: 'Neutral', shades: FULL_SCALE },
  { key: 'gold', label: 'Gold', shades: FULL_SCALE },
  { key: 'lavender', label: 'Lavender', shades: FULL_SCALE },
  { key: 'success', label: 'Success', shades: FULL_SCALE },
  { key: 'error', label: 'Error', shades: FULL_SCALE },
  { key: 'warning', label: 'Warning', shades: FULL_SCALE },
  { key: 'info', label: 'Info', shades: FULL_SCALE },
];

export const TD_GRADIENTS = [
  'gradient-sa600-sa500-90deg',
  'gradient-sa700-sa600-45deg',
  'gradient-sa950-sa600-45deg',
  'gradient-sa800-sa600-90deg',
  'gradient-sa800-sa700-26deg',
  'gradient-sa900-sa600-45deg',
] as const;

export const TD_RADII = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;
export const TD_SHADOWS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
export const TD_WIDTH_CLASSES = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const;
export const TD_TEXT_SIZES = ['s', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
export const TD_DISPLAY_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
export const TD_WEIGHTS = ['regular', 'medium', 'semibold', 'bold'] as const;
export const TD_SPACINGS = [
  'none', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl', '10xl', '11xl',
] as const;

export const TD_SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog';

export function tdItem(name: string, value: string, preview: TdPreview, label: string = name): TdItem {
  return { name, label, value, preview };
}

/**
 * One block per color family that has at least one cell. `makeCell` returns null for
 * shades to skip; shades whose variable is not defined are skipped up front.
 */
export function tdColorScales(
  env: TdEnv,
  makeCell: (family: string, shade: number, value: string) => TdItem | null,
): TdBlock[] {
  const blocks: TdBlock[] = [];
  for (const family of TD_COLOR_FAMILIES) {
    const items: TdItem[] = [];
    for (const shade of family.shades) {
      const value = env.resolve(`--${family.key}-${shade}`);
      if (!value) continue;
      const cell = makeCell(family.key, shade, value);
      if (cell) items.push(cell);
    }
    if (items.length) blocks.push({ kind: 'family', label: family.label, key: family.key, items });
  }
  return blocks;
}
