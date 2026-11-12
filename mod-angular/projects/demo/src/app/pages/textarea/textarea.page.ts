import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModTextarea, ModTextareaAppearance } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type State = 'default' | 'disabled' | 'readonly';

const TEXT = {
  en: {
    label: 'Description',
    placeholder: 'Enter your text here...',
    value: 'Entered text content that the user has typed into the field.',
    helper: 'This is a hint text to help the user.',
    errorHelper: 'This field is required.',
  },
  ar: {
    label: 'الوصف',
    placeholder: 'أدخل النص هنا...',
    value: 'نص تم إدخاله في حقل النص المتعدد الأسطر',
    helper: 'هذا نص تلميح لمساعدة المستخدم.',
    errorHelper: 'هذا الحقل مطلوب.',
  },
};

@Component({
  selector: 'demo-textarea-page',
  imports: [ModTextarea, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Textarea</h1>
      <p class="content-description">
        A text area enables users to input and edit multiple lines of text, providing a larger space than a
        regular text input field, making it suitable for longer text entries such as comments, descriptions, or
        messages.
      </p>
    </div>

    <demo-live
      heading="Textarea"
      description="A multi-line text input for longer form content like comments, descriptions, or messages."
      align="center"
      [rtl]="rtl()"
    >
      <div style="width: 100%; max-width: 400px">
        <mod-textarea
          [label]="showLabel() ? t().label : ''"
          [ariaLabel]="showLabel() ? '' : t().label"
          [placeholder]="filled() ? '' : t().placeholder"
          [(value)]="value"
          [rows]="rows()"
          [appearance]="appearance()"
          [disabled]="state() === 'disabled'"
          [readonly]="state() === 'readonly'"
          [error]="error()"
          [resizable]="resize()"
          [required]="required()"
          [helperText]="helperText() ? (error() ? t().errorHelper : t().helper) : ''"
        />
      </div>

      <demo-switch label="RTL" [checked]="rtl()" (checkedChange)="setRtl($event)" />
      <demo-select label="State" [options]="states" [(value)]="state" />
      <demo-select label="Style" [options]="appearances" [(value)]="appearance" />
      <demo-switch label="Filled" [checked]="filled()" (checkedChange)="setFilled($event)" />
      <demo-switch label="Error" [(checked)]="error" />
      <demo-switch label="Resize" [(checked)]="resize" />
      <demo-switch label="Show Label" [(checked)]="showLabel" />
      <demo-switch label="Required" [(checked)]="required" />
      <demo-switch label="Helper Text" [(checked)]="helperText" />
      <demo-select label="Rows" [options]="rowOptions" [(value)]="rows" />
    </demo-live>

    <demo-props heading="Props" [props]="props" />

    <demo-showcase
      heading="States"
      description="All interactive states of the textarea component — default, filled, disabled, read-only, and focus (click to see)."
      align="stretch"
    >
      <div class="showcase-row" style="gap: var(--spacing-4xl); align-items: flex-start;">
        <mod-textarea style="max-width: 280px" label="Default" placeholder="Placeholder text" />
        <mod-textarea
          style="max-width: 280px"
          label="Filled"
          value="Entered text content that the user has typed into the field."
        />
        <mod-textarea style="max-width: 280px" label="Disabled" placeholder="Placeholder text" disabled />
      </div>
      <div class="showcase-row" style="gap: var(--spacing-4xl); align-items: flex-start; margin-top: var(--spacing-xl);">
        <mod-textarea style="max-width: 280px" label="Disabled filled" value="Entered text" disabled />
        <mod-textarea
          style="max-width: 280px"
          label="Read-only"
          value="Read-only content that cannot be edited."
          readonly
        />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Error State"
      description="Error styling with helper text for validation feedback."
      align="stretch"
    >
      <div class="showcase-row" style="gap: var(--spacing-4xl); align-items: flex-start;">
        <mod-textarea
          style="max-width: 320px"
          label="Description"
          required
          error
          value="Invalid value"
          helperText="This field is required. Please enter a description."
        />
        <mod-textarea
          style="max-width: 320px"
          label="Comments"
          required
          error
          placeholder="Enter your comments"
          helperText="Please provide your comments."
        />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Filled Darker Style"
      description="A subtle gray background variant for use on white surfaces."
      align="stretch"
    >
      <div class="showcase-row" style="gap: var(--spacing-4xl); align-items: flex-start;">
        <mod-textarea style="max-width: 280px" appearance="filled-darker" label="Default" placeholder="Placeholder text" />
        <mod-textarea style="max-width: 280px" appearance="filled-darker" label="Filled" value="Entered text" />
        <mod-textarea
          style="max-width: 280px"
          appearance="filled-darker"
          label="Disabled"
          placeholder="Placeholder text"
          disabled
        />
      </div>
      <div class="showcase-row" style="gap: var(--spacing-4xl); align-items: flex-start; margin-top: var(--spacing-xl);">
        <mod-textarea
          style="max-width: 280px"
          appearance="filled-darker"
          label="Error"
          value="Invalid value"
          error
          helperText="This field has an error."
        />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Filled Lighter Style"
      description="A near-white background variant for use on gray surfaces."
      align="stretch"
      subtle
    >
      <div class="showcase-row" style="gap: var(--spacing-4xl); align-items: flex-start;">
        <mod-textarea style="max-width: 280px" appearance="filled-lighter" label="Default" placeholder="Placeholder text" />
        <mod-textarea style="max-width: 280px" appearance="filled-lighter" label="Filled" value="Entered text" />
        <mod-textarea
          style="max-width: 280px"
          appearance="filled-lighter"
          label="Disabled"
          placeholder="Placeholder text"
          disabled
        />
      </div>
      <div class="showcase-row" style="gap: var(--spacing-4xl); align-items: flex-start; margin-top: var(--spacing-xl);">
        <mod-textarea
          style="max-width: 280px"
          appearance="filled-lighter"
          label="Error"
          value="Invalid value"
          error
          helperText="This field has an error."
        />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="Right-to-left support for Arabic and other RTL languages."
      align="stretch"
    >
      <div dir="rtl" class="showcase-row" style="gap: var(--spacing-4xl); align-items: flex-start; width: 100%;">
        <mod-textarea
          style="max-width: 320px"
          label="الوصف"
          required
          value="نص تم إدخاله في حقل النص المتعدد الأسطر"
          helperText="يرجى إدخال وصف مفصل."
          [helperIcon]="false"
        />
        <mod-textarea style="max-width: 320px" label="التعليقات" required error helperText="يرجى إدخال تعليقاتك." />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="With Helper Text"
      description="Helper text provides additional context or instructions below the textarea."
      align="stretch"
    >
      <div class="showcase-row" style="gap: var(--spacing-4xl); align-items: flex-start;">
        <mod-textarea
          style="max-width: 320px"
          label="Bio"
          placeholder="Tell us about yourself..."
          helperText="Write a short description about yourself."
        />
        <mod-textarea
          style="max-width: 320px"
          label="Feedback"
          required
          placeholder="Share your feedback..."
          helperText="Maximum 500 characters."
          [helperIcon]="false"
        />
      </div>
    </demo-showcase>
  `,
})
export class TextareaPage {
  protected readonly states: DemoOption<State>[] = [
    { value: 'default', label: 'Default' },
    { value: 'disabled', label: 'Disabled' },
    { value: 'readonly', label: 'Read-only' },
  ];
  protected readonly appearances: DemoOption<ModTextareaAppearance>[] = [
    { value: 'default', label: 'Default' },
    { value: 'filled-darker', label: 'Filled darker' },
    { value: 'filled-lighter', label: 'Filled lighter' },
  ];
  protected readonly rowOptions: DemoOption<number>[] = [
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 6, label: '6' },
    { value: 8, label: '8' },
  ];

  protected readonly rtl = signal(false);
  protected readonly state = signal<State>('default');
  protected readonly appearance = signal<ModTextareaAppearance>('default');
  protected readonly filled = signal(true);
  protected readonly error = signal(false);
  protected readonly resize = signal(true);
  protected readonly showLabel = signal(true);
  protected readonly required = signal(false);
  protected readonly helperText = signal(false);
  protected readonly rows = signal(4);

  protected readonly t = computed(() => (this.rtl() ? TEXT.ar : TEXT.en));

  /** Text in the preview field: the sample value while "Filled" is on. */
  protected readonly value = signal(TEXT.en.value);

  protected setRtl(on: boolean): void {
    this.rtl.set(on);
    if (this.filled()) this.value.set(this.t().value);
  }

  protected setFilled(on: boolean): void {
    this.filled.set(on);
    this.value.set(on ? this.t().value : '');
  }

  protected readonly props: DemoProp[] = [
    { name: 'value', type: 'string (model)', default: "''", description: 'Current value of the textarea. Two-way bindable with [(value)]; also works with Angular forms.' },
    { name: 'label', type: 'string', default: "''", description: 'Label text displayed above the textarea.' },
    { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text shown when the field is empty.' },
    { name: 'appearance', type: "'default' | 'filled-darker' | 'filled-lighter'", default: "'default'", description: 'Visual style variant controlling background color.' },
    { name: 'rows', type: 'number', default: '3', description: 'Number of visible text lines.' },
    { name: 'cols', type: 'number', description: 'Visible width of the textarea in character widths.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents user interaction.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the content non-editable but copyable.' },
    { name: 'error', type: 'boolean', default: 'false', description: 'Applies error styling (red border).' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Marks the field as required (asterisk on label).' },
    { name: 'resizable', type: 'boolean', default: 'true', description: 'Enables vertical resizing of the textarea.' },
    { name: 'helperText', type: 'string', default: "''", description: 'Descriptive hint text displayed below the field.' },
    { name: 'helperIcon', type: 'boolean', default: 'true', description: 'Shows the state icon before the helper text.' },
    { name: 'maxLength', type: 'number', description: 'Maximum number of characters (native maxlength).' },
    { name: 'name', type: 'string', default: "''", description: 'Native name attribute.' },
    { name: 'ariaLabel', type: 'string', default: "''", description: 'Accessible name when no visible label is rendered.' },
    { name: 'inputId', type: 'string', default: 'generated', description: 'Id for the native textarea.' },
    { name: '(blurred)', type: 'void', description: 'Emitted when the textarea loses focus.' },
  ];
}
