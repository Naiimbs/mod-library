import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModCheckbox, ModCheckboxGroup, ModCheckboxSize, ModCheckboxVariant } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type State = 'default' | 'disabled' | 'readonly';

const TEXT = {
  en: {
    options: ['Email notifications', 'SMS notifications', 'Push notifications'],
    helpers: [
      'Receive updates about your account via email.',
      'Get text messages for important alerts.',
      'Receive real-time alerts on your device.',
    ],
    alert: 'This selection requires additional verification.',
  },
  ar: {
    options: ['إشعارات البريد الإلكتروني', 'إشعارات الرسائل النصية', 'إشعارات الدفع'],
    helpers: [
      'تلقي تحديثات حول حسابك عبر البريد الإلكتروني.',
      'الحصول على رسائل نصية للتنبيهات المهمة.',
      'تلقي تنبيهات فورية على جهازك.',
    ],
    alert: 'هذا الاختيار يتطلب تحقق إضافي.',
  },
};

@Component({
  selector: 'demo-checkbox-page',
  imports: [ModCheckbox, ModCheckboxGroup, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkbox.page.html',
})
export class CheckboxPage {
  protected readonly states: DemoOption<State>[] = [
    { value: 'default', label: 'Default' },
    { value: 'disabled', label: 'Disabled' },
    { value: 'readonly', label: 'Read-only' },
  ];
  protected readonly variants: DemoOption<ModCheckboxVariant>[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'neutral', label: 'Neutral' },
  ];
  protected readonly sizes: DemoOption<ModCheckboxSize>[] = [
    { value: 'medium', label: 'Medium' },
    { value: 'small', label: 'Small' },
    { value: 'xsmall', label: 'x Small' },
  ];

  protected readonly rtl = signal(false);
  protected readonly state = signal<State>('default');
  protected readonly variant = signal<ModCheckboxVariant>('primary');
  protected readonly size = signal<ModCheckboxSize>('medium');
  protected readonly indeterminate = signal(false);
  protected readonly helperText = signal(true);
  protected readonly alertMessage = signal(false);

  /** Indexes of the checked options in the live demo. */
  protected readonly selection = signal<number[]>([]);
  /** The "Checked" switch drives the first option, as in the original demo. */
  protected readonly checked = computed(() => this.selection().includes(0));

  protected readonly t = computed(() => (this.rtl() ? TEXT.ar : TEXT.en));

  protected readonly groupLabel =
    'font-size: var(--font-size-xs); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-xs);';

  protected setChecked(on: boolean): void {
    this.selection.update((list) => (on ? [...list.filter((i) => i !== 0), 0] : list.filter((i) => i !== 0)));
  }

  // "Indeterminate" showcase: a working select-all.
  protected readonly selectAllOptions = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
  ];
  protected readonly selectAll = signal<string[]>(['a', 'b']);
  protected readonly allSelected = computed(() => this.selectAll().length === this.selectAllOptions.length);
  protected readonly someSelected = computed(() => this.selectAll().length > 0 && !this.allSelected());

  protected toggleAll(on: boolean): void {
    this.selectAll.set(on ? this.selectAllOptions.map((option) => option.value) : []);
  }

  protected readonly notifications = signal<string[]>(['email', 'push']);
  protected readonly vertical = signal<string[]>(['a', 'c']);
  protected readonly horizontal = signal<string[]>(['left']);
  protected readonly rtlSelection = signal<string[]>(['a']);

  protected readonly props: DemoProp[] = [
    { name: 'checked', type: 'boolean (model)', default: 'false', description: 'Whether the checkbox is selected. Two-way bindable with [(checked)]; also works with Angular forms. Inside a group the group owns the state.' },
    { name: 'indeterminate', type: 'boolean (model)', default: 'false', description: 'Shows a partial selection state (minus icon). Cleared when the user toggles the checkbox.' },
    { name: 'label', type: 'string', default: "''", description: 'Label text displayed next to the checkbox. Rich labels can be projected as content.' },
    { name: 'helperText', type: 'string', default: "''", description: 'Descriptive text displayed below the label.' },
    { name: 'alertText', type: 'string', default: "''", description: 'Error or warning message with icon.' },
    { name: 'variant', type: "'primary' | 'neutral'", default: "'primary'", description: 'Visual style — primary (green fill) or neutral (black fill).' },
    { name: 'size', type: "'medium' | 'small' | 'xsmall'", default: "'medium'", description: 'Hitbox size — medium (24px), small (20px), or x-small (16px).' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents user interaction.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Keeps the current state and ignores toggling.' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Native required attribute.' },
    { name: 'value', type: 'T', description: 'The value contributed to the parent mod-checkbox-group when this checkbox is checked.' },
    { name: 'name', type: 'string', default: "''", description: 'Groups checkboxes for form submission.' },
    { name: 'ariaLabel', type: 'string', default: "''", description: 'Accessible name when there is no visible label.' },
  ];

  protected readonly groupProps: DemoProp[] = [
    { name: 'value', type: 'T[] (model)', default: '[]', description: 'Values of the checked checkboxes. Two-way bindable with [(value)]; also works with Angular forms.' },
    { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout of the group.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every checkbox in the group.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes every checkbox in the group read-only.' },
    { name: 'name', type: 'string', default: 'generated', description: 'Name applied to every native checkbox in the group.' },
    { name: 'ariaLabel', type: 'string', default: "''", description: 'Accessible name of the group.' },
    { name: 'ariaLabelledby', type: 'string', default: "''", description: 'Id of the element labelling the group.' },
  ];
}
