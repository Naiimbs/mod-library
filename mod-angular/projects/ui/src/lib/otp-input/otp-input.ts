import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type ModOtpInputSize = 'medium' | 'large';
export type ModOtpInputMode = 'numeric' | 'alphanumeric';

let nextId = 0;

/**
 * One-time code input: one box per character.
 *
 *   <mod-otp-input [(value)]="code" (completed)="verify($event)" />
 *   <mod-otp-input [length]="4" formControlName="code" />
 *
 * Typing moves to the next box, Backspace to the previous one, the arrow keys
 * move between boxes, and pasting a code fills all boxes. The value is the
 * typed characters as one string (shorter than `length` until complete).
 * The boxes always run left to right, also on right-to-left pages.
 */
@Component({
  selector: 'mod-otp-input',
  template: `
    <div
      class="otp-input"
      role="group"
      dir="ltr"
      [class.otp-input--lg]="size() === 'large'"
      [class.otp-input--error]="error()"
      [class.otp-input--disabled]="isDisabled()"
      [attr.aria-label]="ariaLabel()"
      (paste)="onPaste($event)"
    >
      @for (char of chars(); track $index; let i = $index) {
        @if (groupSize() > 0 && i > 0 && i % groupSize() === 0) {
          <span class="otp-input__separator" aria-hidden="true"></span>
        }
        <input
          #box
          class="otp-input__box"
          type="text"
          [class.otp-input__box--filled]="char !== ''"
          [attr.id]="i === 0 ? firstId : null"
          [value]="char"
          [disabled]="isDisabled()"
          [attr.inputmode]="mode() === 'numeric' ? 'numeric' : 'text'"
          [attr.pattern]="mode() === 'numeric' ? '[0-9]*' : null"
          [attr.autocomplete]="i === 0 ? 'one-time-code' : 'off'"
          [attr.aria-label]="digitLabel()(i + 1, length())"
          [attr.aria-invalid]="error() ? 'true' : null"
          (input)="onInput(i, $event)"
          (keydown)="onKeydown(i, $event)"
          (focus)="onFocus($event)"
          (blur)="onBlur()"
        />
      }
    </div>
  `,
  styleUrl: './otp-input.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ModOtpInput), multi: true },
  ],
})
export class ModOtpInput implements ControlValueAccessor {
  /** The code typed so far. Two-way bindable; also driven by Angular forms. */
  readonly value = model<string>('');
  /** Number of boxes. */
  readonly length = input(6, { transform: numberAttribute });
  /** `numeric` accepts digits only; `alphanumeric` also accepts letters. */
  readonly mode = input<ModOtpInputMode>('numeric');
  readonly size = input<ModOtpInputSize>('medium');
  /** Shows a short dash after every N boxes (e.g. 3 for "123-456"). 0 = none. */
  readonly groupSize = input(0, { transform: numberAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Accessible name of the whole group. */
  readonly ariaLabel = input('Verification code');
  /** Accessible name of each box. */
  readonly digitLabel = input<(position: number, length: number) => string>(
    (position, length) => `Digit ${position} of ${length}`,
  );

  /** Emits the full code when the last empty box is filled. */
  readonly completed = output<string>();

  /** Id of the first box, for an external `<label for>`. */
  readonly firstId = `mod-otp-input-${nextId++}`;

  private readonly boxes = viewChildren<ElementRef<HTMLInputElement>>('box');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private readonly count = computed(() => Math.max(1, Math.floor(this.length()) || 1));

  /** One entry per box: the character, or '' when empty. */
  protected readonly chars = computed(() => {
    const value = this.value();
    return Array.from({ length: this.count() }, (_, i) => value[i] ?? '');
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  /** Moves focus to the first empty box (or the last box when full). */
  focus(): void {
    this.focusBox(Math.min(this.value().length, this.count() - 1));
  }

  protected onInput(index: number, event: Event): void {
    const box = event.target as HTMLInputElement;
    // A single typed character is taken from the event, so it replaces the
    // box's digit even when the caret was placed next to it. Anything else
    // (SMS / password-manager autofill, IME) arrives as the whole box value;
    // the boxes have no maxlength so that a full code can land in one box.
    const data = event instanceof InputEvent ? event.data : null;
    const typed = this.sanitize(data !== null && data.length === 1 ? data : box.value);
    if (!typed) {
      // Not an accepted character: restore what the box showed.
      box.value = this.chars()[index];
      return;
    }
    this.insert(index, typed);
  }

  protected onKeydown(index: number, event: KeyboardEvent): void {
    switch (event.key) {
      case 'Backspace': {
        event.preventDefault();
        const chars = this.chars();
        // Remove this box's character, or the previous one when this box is
        // empty. Later characters move one box to the left: the code has no gaps.
        const target = chars[index] !== '' ? index : index - 1;
        if (target < 0) return;
        this.commit(this.removeAt(target));
        this.focusBox(target);
        break;
      }
      case 'Delete':
        event.preventDefault();
        this.commit(this.removeAt(index));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusBox(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusBox(index + 1);
        break;
      case 'Home':
        event.preventDefault();
        this.focusBox(0);
        break;
      case 'End':
        event.preventDefault();
        this.focus();
        break;
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    if (this.isDisabled()) return;
    const text = this.sanitize(event.clipboardData?.getData('text') ?? '');
    if (text) this.insert(0, text);
  }

  protected onFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  protected onBlur(): void {
    this.onTouched();
  }

  /**
   * Writes `text` starting at `index`, replacing the characters it covers and
   * keeping the ones after it. The code has no gaps: in an empty box beyond
   * the end, typing continues at the end.
   */
  private insert(index: number, text: string): void {
    const current = this.value();
    const start = Math.min(index, current.length);
    const next = (current.slice(0, start) + text + current.slice(start + text.length)).slice(0, this.count());
    this.commit(next);
    this.focusBox(Math.min(start + text.length, this.count() - 1));
    if (next.length === this.count() && next !== current) this.completed.emit(next);
  }

  private removeAt(index: number): string {
    const current = this.value();
    return current.slice(0, index) + current.slice(index + 1);
  }

  private commit(next: string): void {
    if (next === this.value()) {
      // Re-sync a box whose native value drifted from the model.
      this.boxes().forEach((ref, i) => (ref.nativeElement.value = this.chars()[i]));
      return;
    }
    this.value.set(next);
    this.onChange(next);
  }

  private sanitize(text: string): string {
    const pattern = this.mode() === 'numeric' ? /[^0-9]/g : /[^0-9a-zA-Z]/g;
    // Arabic-Indic and Persian digits are accepted and stored as 0-9.
    const western = text.replace(/[٠-٩۰-۹]/g, (d) => String(d.charCodeAt(0) & 0xf));
    return western.replace(pattern, '');
  }

  private focusBox(index: number): void {
    const box = this.boxes()[Math.max(0, Math.min(index, this.count() - 1))]?.nativeElement;
    if (!box) return;
    box.focus();
    box.select();
  }

  writeValue(value: string | number | null | undefined): void {
    const text = value === null || value === undefined ? '' : this.sanitize(String(value));
    this.value.set(text.slice(0, this.count()));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
