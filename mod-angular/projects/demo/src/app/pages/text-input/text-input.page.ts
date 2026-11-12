import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ModTextInput,
  ModTextInputAddonStyle,
  ModTextInputAppearance,
  ModTextInputSize,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type State = 'default' | 'disabled' | 'readonly';
type AddonType = 'text' | 'dropdown';

const TEXT = {
  en: {
    label: 'Label',
    placeholder: 'Placeholder',
    value: 'Input text',
    helper: 'This is a hint text to help the user.',
    errorHelper: 'This field is required.',
    prefix: 'https://',
    suffix: '.com',
    dropdownPrefix: '+966',
    dropdownSuffix: 'SAR',
  },
  ar: {
    label: 'التسمية',
    placeholder: 'نص العنصر النائب',
    value: 'نص الإدخال',
    helper: 'هذا نص تلميح لمساعدة المستخدم.',
    errorHelper: 'هذا الحقل مطلوب.',
    prefix: 'https://',
    suffix: '.com',
    dropdownPrefix: '٩٦٦+',
    dropdownSuffix: 'ر.س',
  },
};

@Component({
  selector: 'demo-text-input-page',
  imports: [ModTextInput, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './text-input.page.html',
})
export class TextInputPage {
  protected readonly states: DemoOption<State>[] = [
    { value: 'default', label: 'Default' },
    { value: 'disabled', label: 'Disabled' },
    { value: 'readonly', label: 'Read-only' },
  ];
  protected readonly appearances: DemoOption<ModTextInputAppearance>[] = [
    { value: 'default', label: 'Default' },
    { value: 'filled-darker', label: 'Filled darker' },
    { value: 'filled-lighter', label: 'Filled lighter' },
  ];
  protected readonly sizes: DemoOption<ModTextInputSize>[] = [
    { value: 'large', label: 'Large' },
    { value: 'medium', label: 'Medium' },
  ];
  protected readonly addonTypes: DemoOption<AddonType>[] = [
    { value: 'text', label: 'Text' },
    { value: 'dropdown', label: 'Dropdown' },
  ];
  protected readonly addonStyles: DemoOption<ModTextInputAddonStyle>[] = [
    { value: 'solid', label: 'Solid' },
    { value: 'subtle', label: 'Subtle' },
  ];

  protected readonly rtl = signal(false);
  protected readonly state = signal<State>('default');
  protected readonly appearance = signal<ModTextInputAppearance>('default');
  protected readonly size = signal<ModTextInputSize>('large');
  protected readonly filled = signal(true);
  protected readonly error = signal(false);
  protected readonly showLabel = signal(true);
  protected readonly required = signal(false);
  protected readonly helperText = signal(false);
  protected readonly leadingIcon = signal(false);
  protected readonly trailingIcon = signal(false);
  protected readonly prefix = signal(false);
  protected readonly suffix = signal(false);
  protected readonly addonType = signal<AddonType>('text');
  protected readonly addonStyle = signal<ModTextInputAddonStyle>('solid');

  protected readonly t = computed(() => (this.rtl() ? TEXT.ar : TEXT.en));

  /** Text in the preview field: the sample value while "Filled" is on. */
  protected readonly value = signal(TEXT.en.value);

  protected readonly groupLabel =
    'font-size: var(--font-size-xs); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); margin-bottom: var(--spacing-md); text-transform: uppercase; letter-spacing: 0.5px;';

  protected setRtl(on: boolean): void {
    this.rtl.set(on);
    if (this.filled()) this.value.set(this.t().value);
  }

  protected setFilled(on: boolean): void {
    this.filled.set(on);
    this.value.set(on ? this.t().value : '');
  }

  protected readonly props: DemoProp[] = [
    { name: 'value', type: 'string (model)', default: "''", description: 'Current value of the input. Two-way bindable with [(value)]; also works with Angular forms.' },
    { name: 'label', type: 'string', default: "''", description: 'Label text displayed above the input.' },
    { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text shown when the field is empty.' },
    { name: 'type', type: "'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'", default: "'text'", description: 'HTML input type.' },
    { name: 'size', type: "'large' | 'medium'", default: "'large'", description: 'Input height — medium (32px) or large (40px).' },
    { name: 'appearance', type: "'default' | 'filled-darker' | 'filled-lighter'", default: "'default'", description: 'Visual style variant controlling background color.' },
    { name: 'helperText', type: 'string', default: "''", description: 'Descriptive hint text displayed below the field.' },
    { name: 'helperIcon', type: 'boolean', default: 'true', description: 'Shows the state icon before the helper text.' },
    { name: 'error', type: 'boolean', default: 'false', description: 'Applies error styling (red border, error helper text).' },
    { name: 'success', type: 'boolean', default: 'false', description: 'Applies success styling (green border, success helper text).' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Marks the field as required (asterisk on label).' },
    { name: 'optional', type: 'boolean', default: 'false', description: 'Appends the "(Optional)" marker to the label.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents user interaction.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the content non-editable but copyable.' },
    { name: 'leadingIcon', type: 'string', default: "''", description: 'Icon name shown inside the field, at the start.' },
    { name: 'trailingIcon', type: 'string', default: "''", description: 'Icon name shown inside the field, at the end.' },
    { name: 'prefix', type: 'string', default: "''", description: 'Prefix addon text shown before the field.' },
    { name: 'suffix', type: 'string', default: "''", description: 'Suffix addon text shown after the field.' },
    { name: 'addonStyle', type: "'solid' | 'subtle'", default: "'solid'", description: 'Prefix/suffix visual style — solid (gray bg) or subtle (transparent).' },
    { name: 'prefixDropdown', type: 'boolean', default: 'false', description: 'Renders the prefix as an interactive dropdown button with chevron.' },
    { name: 'suffixDropdown', type: 'boolean', default: 'false', description: 'Renders the suffix as an interactive dropdown button with chevron.' },
    { name: 'prefixSelected', type: 'boolean', default: 'false', description: 'Selected state of a dropdown-type prefix.' },
    { name: 'suffixSelected', type: 'boolean', default: 'false', description: 'Selected state of a dropdown-type suffix.' },
    { name: 'prefixIcon', type: 'string', default: "''", description: 'Icon name shown inside a dropdown-type prefix.' },
    { name: 'maxLength', type: 'number', description: 'Maximum number of characters (native maxlength).' },
    { name: 'showCount', type: 'boolean', default: 'false', description: 'Shows the character counter under the field.' },
    { name: 'name', type: 'string', default: "''", description: 'Native name attribute.' },
    { name: 'autocomplete', type: 'string', default: "''", description: 'Native autocomplete attribute.' },
    { name: 'inputMode', type: 'string', default: "''", description: 'Native inputmode attribute.' },
    { name: 'ariaLabel', type: 'string', default: "''", description: 'Accessible name when no visible label is rendered.' },
    { name: 'inputId', type: 'string', default: 'generated', description: 'Id for the native input.' },
    { name: '(prefixClick)', type: 'void', description: 'Emitted when a dropdown-type prefix is clicked.' },
    { name: '(suffixClick)', type: 'void', description: 'Emitted when a dropdown-type suffix is clicked.' },
    { name: '(blurred)', type: 'void', description: 'Emitted when the input loses focus.' },
  ];
}
