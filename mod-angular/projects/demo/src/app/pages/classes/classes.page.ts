import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TokenDocs } from '../styles/token-docs';
import {
  TD_DISPLAY_SIZES,
  TD_GRADIENTS,
  TD_RADII,
  TD_SAMPLE_TEXT,
  TD_SHADOWS,
  TD_SPACINGS,
  TD_TEXT_SIZES,
  TD_WEIGHTS,
  TD_WIDTH_CLASSES,
  TdConfig,
  TdEnv,
  tdColorScales,
  tdItem,
  TdSection,
} from '../styles/token-docs.model';

const COLUMNS = Array.from({ length: 12 }, (_, i) => i + 1);

/** CLASSES page: utility classes applied live. */
function classesSections(env: TdEnv): TdSection[] {
  return [
    {
      id: 'background',
      title: 'Background Color',
      note: 'Applied live from DGATheme.css. Click a swatch to copy its class.',
      blocks: [
        ...tdColorScales(env, (family, shade, value) => {
          const cls = `background-color-${family}-${shade}`;
          return env.classApplies(cls, 'backgroundColor')
            ? tdItem(cls, value, { cls: `td-swatch ${cls}` }, String(shade))
            : null;
        }),
        {
          kind: 'cards',
          title: 'Gradients',
          wide: true,
          items: TD_GRADIENTS.map((gradient) => tdItem(gradient, '', { cls: `td-card__preview ${gradient}` })),
        },
      ],
    },
    {
      id: 'text-color',
      title: 'Text Color',
      blocks: tdColorScales(env, (family, shade, value) => {
        const cls = `text-${family}-${shade}`;
        return env.classApplies(cls, 'color')
          ? tdItem(cls, value, { cls: 'td-swatch td-swatch--text', inner: { bold: true, cls, text: 'Aa' } }, String(shade))
          : null;
      }),
    },
    {
      id: 'border-color',
      title: 'Border Color',
      blocks: tdColorScales(env, (family, shade, value) => {
        const cls = `border-color-${family}-${shade}`;
        return env.classApplies(cls, 'borderTopColor')
          ? tdItem(cls, value, { cls: `td-swatch td-swatch--border ${cls}` }, String(shade))
          : null;
      }),
    },
    {
      id: 'radius',
      title: 'Border Radius',
      blocks: [
        {
          kind: 'cards',
          items: TD_RADII.filter((radius) => env.resolve(`--radius-${radius}`)).map((radius) =>
            tdItem(`border-radius-${radius}`, env.resolve(`--radius-${radius}`), {
              cls: `td-card__preview td-card__preview--radius border-radius-${radius}`,
            }),
          ),
        },
      ],
    },
    {
      id: 'shadow',
      title: 'Shadow',
      blocks: [
        {
          kind: 'shadow',
          items: TD_SHADOWS.map((shadow) =>
            tdItem(`shadow-${shadow}`, '', { cls: `td-card__preview td-card__preview--shadow shadow-${shadow}` }),
          ),
        },
      ],
    },
    {
      id: 'gap',
      title: 'Gap',
      blocks: [
        {
          kind: 'table',
          items: TD_SPACINGS.filter((gap) => env.resolve(`--spacing-${gap}`) !== '').map((gap) =>
            tdItem(`gap-${gap}`, env.resolve(`--spacing-${gap}`), { cls: `td-gap-demo gap-${gap}`, inner: { count: 3 } }),
          ),
        },
      ],
    },
    {
      id: 'width',
      title: 'Width',
      blocks: [
        {
          kind: 'table',
          items: TD_WIDTH_CLASSES.filter((width) => env.resolve(`--width-${width}`)).map((width) =>
            tdItem(`width-${width}`, env.resolve(`--width-${width}`), {
              cls: 'td-bar-track',
              inner: { cls: `td-bar width-${width}` },
            }),
          ),
        },
      ],
    },
    {
      id: 'column',
      title: 'Column',
      note: 'Spans inside the 12-column grid.',
      blocks: [
        {
          kind: 'table',
          items: COLUMNS.map((n) => tdItem(`col-${n}`, `${n} / 12`, { cls: 'td-col-demo', inner: { cls: `col-${n}` } })),
        },
      ],
    },
    {
      id: 'typography',
      title: 'Typography',
      blocks: [
        {
          kind: 'types',
          title: 'Text',
          items: TD_TEXT_SIZES.flatMap((size) =>
            TD_WEIGHTS.map((weight) =>
              tdItem(`text-${size}-${weight}`, env.resolve(`--text-${size}`), {
                cls: `text-${size}-${weight}`,
                text: TD_SAMPLE_TEXT,
              }),
            ),
          ),
        },
        {
          kind: 'types',
          title: 'Display',
          items: TD_DISPLAY_SIZES.flatMap((size) =>
            TD_WEIGHTS.map((weight) =>
              tdItem(`display-${size}-${weight}`, env.resolve(`--display-${size}`), {
                cls: `display-${size}-${weight}`,
                text: 'Aa',
              }),
            ),
          ),
        },
      ],
    },
  ];
}

@Component({
  selector: 'demo-classes-page',
  imports: [TokenDocs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<demo-token-docs id="classes-page" [config]="config" />`,
  host: { style: 'display: block' },
})
export class ClassesPage {
  protected readonly config: TdConfig = {
    title: 'Classes',
    subtitle: 'Utility classes from the DGA base theme, rendered live. Click any swatch or name to copy the class.',
    searchPlaceholder: 'Filter classes…',
    sections: classesSections,
  };
}
