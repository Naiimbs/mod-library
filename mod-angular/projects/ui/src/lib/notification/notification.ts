import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  model,
  output,
} from '@angular/core';

export type ModNotificationVariant = 'critical' | 'warning' | 'success' | 'info' | 'neutral';

/**
 * Marks the actions of a `<mod-notification>`:
 *
 *   <ng-container modNotificationActions>
 *     <a class="notification__link" href="/more">Learn more</a>
 *     <button mod-button variant="neutral" size="medium">Action</button>
 *   </ng-container>
 *
 * Use it on an `<ng-container>` (or a single element) so the projected
 * controls become direct children of `.notification__actions`.
 */
@Directive({ selector: '[modNotificationActions]' })
export class ModNotificationActions {}

/**
 * DGA notification banner. The message is the projected content.
 *
 *   <mod-notification variant="warning" leadText="Important:" dismissible (dismissed)="onClose()">
 *     Scheduled maintenance tonight.
 *   </mod-notification>
 */
@Component({
  selector: 'mod-notification',
  template: `
    <div class="notification__body">
      <div class="notification__content">
        @if (showIcon()) {
          <span class="notification__icon" aria-hidden="true">
            @switch (variant()) {
              @case ('critical') {
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#D92D20" />
                  <path d="M12 8v4m0 4h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              }
              @case ('warning') {
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="#DC6803" />
                  <path d="M12 9v4m0 4h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              }
              @case ('success') {
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#079455" />
                  <path d="M8 12l2.5 2.5L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              }
              @case ('info') {
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#1570EF" />
                  <path d="M12 16v-4m0-4h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              }
              @default {
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#6A7880" />
                  <path d="M12 16v-4m0-4h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              }
            }
          </span>
        }
        @if (leadText()) {
          <span class="notification__lead-text">{{ leadText() }}</span>
        }
        <span class="notification__text"><ng-content /></span>
        @if (actions()) {
          <div class="notification__actions">
            <ng-content select="[modNotificationActions]" />
          </div>
        }
      </div>
      @if (dismissible()) {
        <button type="button" class="notification__close" [attr.aria-label]="closeLabel()" (click)="dismiss()">
          <svg
            class="notification__close-icon"
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
    <div class="notification__line"></div>
  `,
  styleUrl: './notification.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"notification notification--" + variant()',
    '[style.display]': 'visible() ? null : "none"',
    '[attr.role]': 'role()',
  },
})
export class ModNotification {
  readonly variant = input<ModNotificationVariant>('info');
  /** Bold lead-in text, e.g. "Important:". */
  readonly leadText = input<string>('');
  readonly showIcon = input(true, { transform: booleanAttribute });
  /** Shows the close button. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  /** Accessible label of the close button. */
  readonly closeLabel = input<string>('Dismiss');
  /** Whether the notification is shown. Set back to `true` to show it again. */
  readonly visible = model(true);

  /** Emits after the user dismisses the notification. */
  readonly dismissed = output<void>();

  protected readonly actions = contentChild(ModNotificationActions);

  protected readonly role = computed(() => {
    const variant = this.variant();
    return variant === 'critical' || variant === 'warning' ? 'alert' : 'status';
  });

  /** Hides the notification and emits `dismissed`. */
  dismiss(): void {
    if (!this.visible()) return;
    this.visible.set(false);
    this.dismissed.emit();
  }
}
