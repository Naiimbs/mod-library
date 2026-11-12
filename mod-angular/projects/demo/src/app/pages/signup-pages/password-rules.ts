import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ModIcon } from '@mod-internal/ui';

export type PasswordRule = 'length' | 'number' | 'upper' | 'special';

const RULES: readonly PasswordRule[] = ['length', 'number', 'upper', 'special'];

/** Which of the password rules the given text meets. */
export function checkPassword(value: string): Record<PasswordRule, boolean> {
  return {
    length: value.length >= 8,
    number: /[0-9]/.test(value),
    upper: /[A-Z]/.test(value),
    special: /[^A-Za-z0-9\s]/.test(value),
  };
}

/** Form validator: fails with `{ passwordRules: true }` until every rule is met. */
export function passwordRulesValidator(control: AbstractControl): ValidationErrors | null {
  const raw: unknown = control.value;
  const value = typeof raw === 'string' ? raw : '';
  if (!value) return null; // "required" reports the empty case
  const state = checkPassword(value);
  return RULES.every((rule) => state[rule]) ? null : { passwordRules: true };
}

/**
 * Live checklist of the password rules: each rule shows a tick as soon as the
 * typed password meets it. Texts come from the example so the list follows
 * the example's language.
 */
@Component({
  selector: 'demo-password-rules',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModIcon],
  template: `
    <p class="pw-rules__title">{{ heading() }}</p>
    <ul class="pw-rules__list" [attr.aria-label]="heading()">
      @for (rule of rules(); track rule.key) {
        <li class="pw-rules__item" [class.pw-rules__item--met]="rule.met">
          <mod-icon [name]="rule.met ? 'checkmark-circle-02' : 'circle'" />
          <span>{{ rule.label }}</span>
          <span class="pw-rules__state">({{ rule.met ? metLabel() : notMetLabel() }})</span>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
      padding: var(--spacing-lg) var(--spacing-xl);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      background: var(--gray-50);
    }

    .pw-rules__title {
      margin: 0 0 var(--spacing-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--gray-700);
    }

    .pw-rules__list {
      display: grid;
      gap: var(--spacing-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .pw-rules__item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      font-size: var(--font-size-sm);
      line-height: 20px;
      color: var(--gray-600);
    }

    .pw-rules__item .icon {
      flex-shrink: 0;
      font-size: 18px;
      color: var(--gray-300);
    }

    .pw-rules__item--met {
      color: var(--gray-900);
    }

    .pw-rules__item--met .icon {
      color: var(--mod-primary-text);
    }

    /* The met / not met state is read by screen readers; sighted users get the icon. */
    .pw-rules__state {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
})
export class DemoPasswordRules {
  /** The password typed so far. */
  readonly password = input('');
  readonly heading = input.required<string>();
  readonly labels = input.required<Readonly<Record<PasswordRule, string>>>();
  readonly metLabel = input('met');
  readonly notMetLabel = input('not met');

  protected readonly rules = computed(() => {
    const state = checkPassword(this.password());
    const labels = this.labels();
    return RULES.map((key) => ({ key, label: labels[key], met: state[key] }));
  });
}
