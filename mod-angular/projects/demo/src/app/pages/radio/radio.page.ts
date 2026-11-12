import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModRadio, ModRadioGroup, ModRadioVariant } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type State = 'default' | 'disabled' | 'readonly';

const TEXT = {
  en: {
    options: ['Standard delivery', 'Express delivery', 'Same-day delivery'],
    helpers: [
      'Free shipping. Arrives in 5-7 business days.',
      'SAR 25.00. Arrives in 1-2 business days.',
      'SAR 50.00. Available in select cities only.',
    ],
    alert: 'This selection requires additional verification.',
  },
  ar: {
    options: ['توصيل عادي', 'توصيل سريع', 'توصيل في نفس اليوم'],
    helpers: ['شحن مجاني. يصل خلال 5-7 أيام عمل.', '25 ريال. يصل خلال 1-2 يوم عمل.', '50 ريال. متاح في مدن محددة فقط.'],
    alert: 'هذا الاختيار يتطلب تحقق إضافي.',
  },
};

@Component({
  selector: 'demo-radio-page',
  imports: [ModRadio, ModRadioGroup, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './radio.page.html',
})
export class RadioPage {
  protected readonly states: DemoOption<State>[] = [
    { value: 'default', label: 'Default' },
    { value: 'disabled', label: 'Disabled' },
    { value: 'readonly', label: 'Read-only' },
  ];
  protected readonly variants: DemoOption<ModRadioVariant>[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'neutral', label: 'Neutral' },
  ];

  protected readonly rtl = signal(false);
  protected readonly state = signal<State>('default');
  protected readonly variant = signal<ModRadioVariant>('primary');
  protected readonly helperText = signal(true);
  protected readonly alertMessage = signal(false);

  /** Index of the selected option in the live demo. */
  protected readonly selection = signal<number | null>(null);
  /** The "Selected" switch drives the first option, as in the original demo. */
  protected readonly selected = computed(() => this.selection() === 0);

  protected readonly t = computed(() => (this.rtl() ? TEXT.ar : TEXT.en));

  protected readonly groupLabel =
    'font-size: var(--font-size-xs); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-xs);';

  protected setSelected(on: boolean): void {
    this.selection.set(on ? 0 : null);
  }

  protected readonly stylePrimary = signal<string | null>('b');
  protected readonly styleNeutral = signal<string | null>('b');
  protected readonly delivery = signal<string | null>('standard');
  protected readonly alertChoice = signal<string | null>('b');
  protected readonly vertical = signal<string | null>('small');
  protected readonly horizontal = signal<string | null>('left');
  protected readonly rtlChoice = signal<string | null>('a');

  protected readonly props: DemoProp[] = [
    { name: 'value', type: 'T', description: 'The value this radio contributes to its mod-radio-group when selected.' },
    { name: 'checked', type: 'boolean (model)', default: 'false', description: 'Whether the radio button is selected, when used without a group. Two-way bindable with [(checked)].' },
    { name: 'label', type: 'string', default: "''", description: 'Label text displayed next to the radio button. Rich labels can be projected as content.' },
    { name: 'helperText', type: 'string', default: "''", description: 'Descriptive text displayed below the label.' },
    { name: 'alertText', type: 'string', default: "''", description: 'Error or warning message with icon.' },
    { name: 'variant', type: "'primary' | 'neutral'", default: "group's variant", description: 'Visual style — primary (green dot) or neutral (black dot).' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents user interaction.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Keeps the current selection and ignores clicks.' },
    { name: 'name', type: 'string', default: "''", description: 'Native name when used without a group; groups radio buttons so only one can be selected at a time.' },
    { name: 'ariaLabel', type: 'string', default: "''", description: 'Accessible name when there is no visible label.' },
  ];

  protected readonly groupProps: DemoProp[] = [
    { name: 'value', type: 'T | null (model)', default: 'null', description: 'Value of the selected radio. Two-way bindable with [(value)]; also works with Angular forms.' },
    { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout of the group.' },
    { name: 'variant', type: "'primary' | 'neutral'", default: "'primary'", description: 'Default colour style for the radios in the group.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every radio in the group.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes every radio in the group read-only.' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Marks the group as required.' },
    { name: 'name', type: 'string', default: 'generated', description: 'Native name shared by the radios.' },
    { name: 'ariaLabel', type: 'string', default: "''", description: 'Accessible name of the group.' },
    { name: 'ariaLabelledby', type: 'string', default: "''", description: 'Id of the element labelling the group.' },
  ];
}
