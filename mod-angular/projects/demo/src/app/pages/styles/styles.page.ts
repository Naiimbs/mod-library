import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TokenDocs } from './token-docs';
import {
  TD_DISPLAY_SIZES,
  TD_RADII,
  TD_SAMPLE_TEXT,
  TD_SPACINGS,
  TD_TEXT_SIZES,
  TD_WIDTH_CLASSES,
  TdConfig,
  TdEnv,
  tdColorScales,
  TdItem,
  tdItem,
  TdPreview,
  TdSection,
} from './token-docs.model';

const SPECIAL_COLORS = [
  '--text-default',
  '--border-black',
  '--alpha-white',
  '--alpha-white-80',
  '--alpha-white-70',
  '--alpha-white-60',
  '--alpha-white-30',
];
const FONT_WEIGHTS = ['light', 'regular', 'medium', 'semibold', 'bold'];
const HEIGHTS = ['s', 'm', 'l'];

/** STYLES page: CSS variables with their live resolved values. */
function stylesSections(env: TdEnv): TdSection[] {
  /** One item per variable that is defined in the loaded CSS. */
  const defined = (names: readonly string[], preview: (value: string) => TdPreview): TdItem[] =>
    names.flatMap((name) => {
      const value = env.resolve(name);
      return value ? [tdItem(name, value, preview(value))] : [];
    });
  const vars = (prefix: string, keys: readonly string[]): string[] => keys.map((key) => `--${prefix}-${key}`);

  return [
    {
      id: 'color',
      title: 'Color',
      note: 'Values resolve live from the loaded theme. Click a swatch to copy its variable.',
      blocks: [
        ...tdColorScales(env, (family, shade, value) =>
          tdItem(`--${family}-${shade}`, value, { cls: 'td-swatch', style: { 'background-color': value } }, String(shade)),
        ),
        {
          kind: 'cards',
          title: 'Special',
          items: defined(SPECIAL_COLORS, (value) => ({
            cls: 'td-card__preview td-card__preview--alpha',
            inner: { style: { 'background-color': value } },
          })),
        },
      ],
    },
    {
      id: 'radius',
      title: 'Border Radius',
      blocks: [
        {
          kind: 'cards',
          items: defined(vars('radius', TD_RADII), (value) => ({
            cls: 'td-card__preview td-card__preview--radius',
            style: { 'border-radius': value },
          })),
        },
      ],
    },
    {
      id: 'spacing',
      title: 'Spacing',
      blocks: [
        {
          kind: 'table',
          items: defined(vars('spacing', TD_SPACINGS), (value) => ({
            cls: 'td-bar-track',
            inner: { cls: 'td-bar', style: { width: value === '0px' ? '2px' : value } },
          })),
        },
      ],
    },
    {
      id: 'text',
      title: 'Text',
      blocks: [
        {
          kind: 'types',
          ungrouped: true,
          items: defined(vars('text', TD_TEXT_SIZES), (value) => ({
            cls: '',
            style: { 'font-size': value },
            text: TD_SAMPLE_TEXT,
          })),
        },
      ],
    },
    {
      id: 'display',
      title: 'Display',
      blocks: [
        {
          kind: 'types',
          ungrouped: true,
          items: defined(vars('display', TD_DISPLAY_SIZES), (value) => ({
            cls: '',
            style: { 'font-size': value, 'font-weight': 'var(--font-weight-semibold)', 'line-height': '1.15' },
            text: 'Aa',
          })),
        },
      ],
    },
    {
      id: 'font-weight',
      title: 'Font Weight',
      blocks: [
        {
          kind: 'types',
          ungrouped: true,
          items: defined(vars('font-weight', FONT_WEIGHTS), (value) => ({
            cls: '',
            style: { 'font-size': '22px', 'font-weight': value },
            text: TD_SAMPLE_TEXT,
          })),
        },
      ],
    },
    {
      id: 'height',
      title: 'Height',
      blocks: [
        {
          kind: 'table',
          items: defined(vars('height', HEIGHTS), (value) => ({ cls: 'td-height-demo', style: { height: value } })),
        },
      ],
    },
    {
      id: 'width',
      title: 'Width',
      blocks: [
        {
          kind: 'table',
          items: defined(vars('width', TD_WIDTH_CLASSES), (value) => ({
            cls: 'td-bar-track',
            inner: { cls: 'td-bar', style: { width: `min(${value},100%)` } },
          })),
        },
      ],
    },
  ];
}

@Component({
  selector: 'demo-styles-page',
  imports: [TokenDocs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<demo-token-docs id="styles-page" [config]="config" />`,
  host: { style: 'display: block' },
})
export class StylesPage {
  protected readonly config: TdConfig = {
    title: 'Styles',
    subtitle:
      'Design token CSS variables with their live resolved values. Click any swatch or name to copy the variable.',
    searchPlaceholder: 'Filter variables…',
    sections: stylesSections,
  };
}
