import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ModButton,
  ModCard,
  ModCardActions,
  ModCardCustom,
  ModCardEffect,
  ModCardTags,
  ModCardType,
  ModTag,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type CardState = 'default' | 'focused' | 'selected' | 'disabled';

interface CardLabels {
  title: string;
  body: string;
  primary: string;
  secondary: string;
  customTitle: string;
  customBody: string;
  tag: string;
  ratingCount: string;
}

const LABELS: Record<'en' | 'ar', CardLabels> = {
  en: {
    title: 'Card Title',
    body: 'Card content placeholder text goes here',
    primary: 'Action',
    secondary: 'Action',
    customTitle: 'Swap with content component',
    customBody: 'Replace this slot with any component',
    tag: 'Tag',
    ratingCount: '12 reviews',
  },
  ar: {
    title: 'عنوان البطاقة',
    body: 'نص محتوى البطاقة يظهر هنا',
    primary: 'إجراء',
    secondary: 'إجراء',
    customTitle: 'استبدل هذا العنصر بأي عنصر آخر',
    customBody: 'يمكن استبدال هذه المنطقة بأي مكون',
    tag: 'وسم',
    ratingCount: '12 تقييم',
  },
};

@Component({
  selector: 'demo-cards-page',
  imports: [ModCard, ModCardActions, ModCardCustom, ModCardTags, ModButton, ModTag, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cards.page.html',
})
export class CardsPage {
  protected readonly effects: DemoOption<ModCardEffect>[] = [
    { value: 'shadow', label: 'With shadow' },
    { value: 'no-shadow', label: 'No shadow (border)' },
    { value: 'stroke', label: 'Stroke' },
  ];
  protected readonly types: DemoOption<ModCardType>[] = [
    { value: 'default', label: 'Default' },
    { value: 'expandable', label: 'Expandable' },
    { value: 'selectable', label: 'Selectable' },
  ];
  protected readonly states: DemoOption<CardState>[] = [
    { value: 'default', label: 'Default' },
    { value: 'focused', label: 'Focused' },
    { value: 'selected', label: 'Selected (selectable)' },
    { value: 'disabled', label: 'Disabled' },
  ];
  protected readonly effectExamples: DemoOption<ModCardEffect>[] = [
    { value: 'shadow', label: 'With Shadow (default)' },
    { value: 'no-shadow', label: 'No Shadow' },
    { value: 'stroke', label: 'Stroke' },
  ];

  protected readonly rtl = signal(false);
  protected readonly effect = signal<ModCardEffect>('shadow');
  protected readonly type = signal<ModCardType>('default');
  protected readonly state = signal<CardState>('default');
  protected readonly showTitle = signal(true);
  protected readonly showDescription = signal(true);
  protected readonly showIcon = signal(true);
  protected readonly showImage = signal(false);
  protected readonly showCustom = signal(false);
  protected readonly showTags = signal(false);
  protected readonly showRating = signal(false);
  protected readonly primaryAction = signal(true);
  protected readonly secondaryAction = signal(true);
  protected readonly expanded = signal(false);

  protected readonly t = computed(() => (this.rtl() ? LABELS.ar : LABELS.en));

  // The footer is only valid on the Default card type, as in the original demo.
  protected readonly showFooter = computed(
    () => (this.primaryAction() || this.secondaryAction()) && this.type() === 'default',
  );

  // "Focused" simulates :focus-visible on the interactive card types.
  private readonly focusedDemo = computed(() => this.state() === 'focused' && this.type() !== 'default');

  protected readonly focusShadow = computed(() => {
    if (!this.focusedDemo()) return null;
    const inset = 'inset 0 0 0 2px var(--border-black)';
    return this.effect() === 'shadow'
      ? `${inset}, rgba(16, 24, 40, 0.1) 0px 4px 8px -2px, rgba(16, 24, 40, 0.06) 0px 2px 4px -2px`
      : inset;
  });

  protected readonly focusBorder = computed(() =>
    this.focusedDemo() && this.effect() !== 'shadow' ? 'transparent' : null,
  );

  /** SVG placeholder (flag against a soft sky), so the image slot needs no network request. */
  protected readonly placeholder =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='xMidYMid slice'>" +
        '<defs>' +
        "<linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>" +
        "<stop offset='0%' stop-color='#c9e3ec'/>" +
        "<stop offset='100%' stop-color='#e6eef0'/>" +
        '</linearGradient>' +
        '</defs>' +
        "<rect width='400' height='300' fill='url(#sky)'/>" +
        "<ellipse cx='80' cy='90' rx='90' ry='18' fill='#ffffff' fill-opacity='0.55'/>" +
        "<ellipse cx='320' cy='130' rx='110' ry='20' fill='#ffffff' fill-opacity='0.45'/>" +
        "<rect x='120' y='40' width='4' height='240' fill='#a08862'/>" +
        "<circle cx='122' cy='40' r='5' fill='#a08862'/>" +
        "<path d='M124 70 Q170 60, 220 75 Q270 90, 310 80 L310 170 Q270 180, 220 165 Q170 150, 124 160 Z' fill='#136e3a'/>" +
        "<path d='M170 105 Q195 95, 220 105 Q245 115, 270 105' stroke='#ffffff' stroke-width='2.5' fill='none' stroke-linecap='round'/>" +
        "<path d='M170 145 L260 145' stroke='#ffffff' stroke-width='2' fill='none' stroke-linecap='round'/>" +
        '</svg>',
    );

  protected readonly props: DemoProp[] = [
    { name: 'type', type: "'default' | 'expandable' | 'selectable'", default: "'default'", description: 'Static surface, expandable card with a chevron, or selectable card with a checkbox indicator.' },
    { name: 'effect', type: "'shadow' | 'no-shadow' | 'stroke'", default: "'shadow'", description: 'Drop shadow, neutral border, or black border.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Greyed-out state; disables pointer and keyboard interaction.' },
    { name: 'heading', type: 'string', default: "''", description: 'Card title.' },
    { name: 'description', type: 'string', default: "''", description: 'Body copy under the title.' },
    { name: 'icon', type: 'string', default: "''", description: 'Font icon name (without dga-icon-) for the featured icon slot.' },
    { name: 'image', type: 'string', default: "''", description: 'Image URL for the image slot (4:3, inside the card padding).' },
    { name: 'imageAlt', type: 'string', default: "''", description: 'Alternative text of the image.' },
    { name: 'rating', type: 'number | null', default: 'null', description: 'Star rating (halves supported). null hides the rating slot.' },
    { name: 'ratingMax', type: 'number', default: '5', description: 'Number of stars.' },
    { name: 'ratingCount', type: 'string', default: "''", description: 'Text under the stars, e.g. "12 reviews".' },
    { name: 'ratingLabel', type: 'string', default: "'<rating> out of <max>'", description: 'Accessible label of the stars.' },
    { name: '[(selected)]', type: 'boolean', default: 'false', description: 'Selected state of a selectable card (two-way).' },
    { name: '[(expanded)]', type: 'boolean', default: 'false', description: 'Expanded state of an expandable card (two-way); rotates the chevron.' },
    { name: 'expandLabel', type: 'string', default: "'Expand card'", description: 'Accessible label of the chevron while collapsed.' },
    { name: 'collapseLabel', type: 'string', default: "'Collapse card'", description: 'Accessible label of the chevron while expanded.' },
    { name: '[modCardImage]', type: 'slot', description: 'Custom image slot content.' },
    { name: '[modCardIcon]', type: 'slot', description: 'Custom featured icon (inline SVG or mod-icon).' },
    { name: '[modCardCustom]', type: 'slot', description: 'Custom component drop zone between the content and the tags row.' },
    { name: '[modCardTags]', type: 'slot', description: 'Row of tags.' },
    { name: '[modCardActions]', type: 'slot', description: 'Footer holding the action buttons.' },
  ];
}
