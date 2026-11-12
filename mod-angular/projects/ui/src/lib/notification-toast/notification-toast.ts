import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  output,
} from '@angular/core';

export type ModToastVariant = 'neutral' | 'info' | 'critical' | 'warning' | 'success';

/**
 * Marks the action buttons of a `<mod-toast>`. Put it on an `<ng-container>`
 * wrapping the buttons so they become direct children of the actions row:
 *
 *   <ng-container modToastActions>
 *     <button mod-button variant="subtle" size="medium">Undo</button>
 *   </ng-container>
 */
@Directive({ selector: '[modToastActions]' })
export class ModToastActions {}

/**
 * A single DGA notification toast. Use it directly for a static / inline
 * toast, or use `ModToastService` + `<mod-toast-container>` for transient
 * toasts.
 *
 *   <mod-toast variant="success" heading="Saved" message="Your changes were saved." (dismissed)="hide()" />
 */
@Component({
  selector: 'mod-toast',
  template: `
    <div class="notification-toast__header">
      <div class="notification-toast__icon" aria-hidden="true">
        @switch (variant()) {
          @case ('info') {
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="#1570EF" stroke-width="2" />
              <path d="M12 16v-4m0-4h.01" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          }
          @case ('critical') {
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#D92D20" stroke-width="2" fill="none" />
              <path d="M12 9v4m0 4h.01" stroke="#D92D20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          }
          @case ('warning') {
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="#DC6803" stroke-width="2" />
              <path d="M12 8v4m0 4h.01" stroke="#DC6803" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          }
          @case ('success') {
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="#079455" stroke-width="2" />
              <path d="M8 12l2.5 2.5L16 9.5" stroke="#079455" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          }
          @default {
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="#6A7880" stroke-width="2" />
              <path d="M12 16v-4m0-4h.01" stroke="#6A7880" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          }
        }
      </div>
      @if (!mobile()) {
        <div class="notification-toast__text">
          <p class="notification-toast__title">{{ heading() }}</p>
          @if (message()) {
            <p class="notification-toast__helper">{{ message() }}</p>
          }
        </div>
      }
      @if (dismissible()) {
        <button type="button" class="notification-toast__close" [attr.aria-label]="closeLabel()" (click)="dismissed.emit()">
          <svg
            class="notification-toast__close-icon"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      }
    </div>
    @if (mobile()) {
      <div class="notification-toast__text">
        <p class="notification-toast__title">{{ heading() }}</p>
        @if (message()) {
          <p class="notification-toast__helper">{{ message() }}</p>
        }
      </div>
    }
    @if (actions()) {
      <div class="notification-toast__actions">
        <ng-content select="[modToastActions]" />
      </div>
    }
    <div class="notification-toast__line"></div>
  `,
  styleUrl: './notification-toast.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'role()',
  },
})
export class ModToast {
  readonly variant = input<ModToastVariant>('neutral');
  /** Toast title. */
  readonly heading = input.required<string>();
  /** Helper text under the title. */
  readonly message = input<string>('');
  /** Narrow mobile layout (343px, stacked actions, accent line on top). */
  readonly mobile = input(false, { transform: booleanAttribute });
  /** Shows the close button. */
  readonly dismissible = input(true, { transform: booleanAttribute });
  /** Accessible label of the close button. */
  readonly closeLabel = input<string>('Dismiss');
  /**
   * Announce the toast itself (`role="alert"` for critical, `role="status"`
   * otherwise). `<mod-toast-container>` turns this off because the container
   * is the live region.
   */
  readonly announce = input(true, { transform: booleanAttribute });

  /**
   * Emits when the close button is pressed. The toast does not hide itself:
   * remove it from the template (the toast service does this for you).
   */
  readonly dismissed = output<void>();

  protected readonly actions = contentChild(ModToastActions);

  protected readonly classes = computed(() => {
    const list = ['notification-toast', `notification-toast--${this.variant()}`];
    if (this.mobile()) list.push('notification-toast--mobile');
    return list.join(' ');
  });

  protected readonly role = computed(() => {
    if (!this.announce()) return null;
    return this.variant() === 'critical' ? 'alert' : 'status';
  });
}
