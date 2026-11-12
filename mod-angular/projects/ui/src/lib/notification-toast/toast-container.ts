import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';
import { ModButton } from '../button/button';
import { ModToast, ModToastActions } from './notification-toast';
import { ModToastAction, ModToastItem, ModToastService } from './toast.service';

export type ModToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

/**
 * Host for the toasts shown through `ModToastService`. Place it once, near
 * the root of the application:
 *
 *   <mod-toast-container position="top-end" />
 *
 * It is a polite live region. Auto-dismiss timers pause while a toast is
 * hovered or contains focus.
 */
@Component({
  selector: 'mod-toast-container',
  imports: [ModToast, ModToastActions, ModButton],
  template: `
    @for (toast of service.toasts(); track toast.id) {
      @if (toast.actions.length) {
        <mod-toast
          [variant]="toast.variant"
          [heading]="toast.title"
          [message]="toast.message"
          [mobile]="mobile()"
          [dismissible]="toast.dismissible"
          [closeLabel]="toast.closeLabel"
          [announce]="false"
          (dismissed)="service.dismiss(toast.id)"
          (mouseenter)="service.pause(toast.id)"
          (mouseleave)="service.resume(toast.id)"
          (focusin)="service.pause(toast.id)"
          (focusout)="service.resume(toast.id)"
        >
          <ng-container modToastActions>
            @for (action of toast.actions; track $index) {
              <button
                mod-button
                type="button"
                [variant]="mobile() ? 'secondary-solid' : 'subtle'"
                [size]="mobile() ? 'large' : 'medium'"
                [class.btn-full-width]="mobile()"
                (click)="run(toast, action)"
              >
                {{ action.label }}
              </button>
            }
          </ng-container>
        </mod-toast>
      } @else {
        <mod-toast
          [variant]="toast.variant"
          [heading]="toast.title"
          [message]="toast.message"
          [mobile]="mobile()"
          [dismissible]="toast.dismissible"
          [closeLabel]="toast.closeLabel"
          [announce]="false"
          (dismissed)="service.dismiss(toast.id)"
          (mouseenter)="service.pause(toast.id)"
          (mouseleave)="service.resume(toast.id)"
          (focusin)="service.pause(toast.id)"
          (focusout)="service.resume(toast.id)"
        />
      }
    }
  `,
  styleUrl: './notification-toast.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'region',
    'aria-live': 'polite',
    'aria-relevant': 'additions text',
    '[class]': '"toast-container--" + position()',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class ModToastContainer {
  protected readonly service = inject(ModToastService);

  /** Screen corner / edge where toasts stack. `start`/`end` follow the text direction. */
  readonly position = input<ModToastPosition>('top-end');
  /** Render toasts in the narrow mobile layout. */
  readonly mobile = input(false, { transform: booleanAttribute });
  /** Accessible name of the region. */
  readonly ariaLabel = input<string>('Notifications');

  protected run(toast: ModToastItem, action: ModToastAction): void {
    action.handler?.();
    if (action.dismissOnClick !== false) this.service.dismiss(toast.id);
  }
}
