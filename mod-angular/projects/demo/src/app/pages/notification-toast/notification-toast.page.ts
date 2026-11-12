import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ModButton,
  ModToast,
  ModToastActions,
  ModToastContainer,
  ModToastPosition,
  ModToastService,
  ModToastVariant,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

const TITLE = 'Notification/Alert message title';
const HELPER = 'When a Notification/Alert needs a further detailed explanation, it goes here.';
const TITLE_AR = 'عنوان رسالة الاشعار أو التنبيه';
const HELPER_AR = 'يكتب المحتوى الإضافي هنا في حال ان رسالة الاشعار أو التنبيه تحتاج الى شرح أو تفصيل.';

@Component({
  selector: 'demo-notification-toast-page',
  imports: [ModToast, ModToastActions, ModToastContainer, ModButton, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .stack {
      display: flex;
      flex-direction: column;
      gap: 24px;
      align-items: flex-start;
      width: 100%;
    }
    .wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      align-items: flex-start;
      width: 100%;
    }
    .reset {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--color-gray-100);
      border: 1px solid var(--color-gray-300);
      border-radius: 4px;
      cursor: pointer;
      font-family: var(--font-family-primary);
      font-size: 14px;
      color: var(--color-gray-700);
      margin-top: 8px;
    }
  `,
  template: `
    <div class="content-header">
      <h1 class="content-title">Notification Toast</h1>
      <p class="content-description">
        Notifications are peripheral messages in digital products that communicate information or feedback to the user.
        These are transient, non-modal messages that appear at the top of the screen to provide brief alerts,
        disappearing after a set duration.
      </p>
    </div>

    <demo-live heading="Notification Toast" description="Configure the toast appearance and features." [rtl]="rtl()">
      @if (visible()) {
        <mod-toast
          [variant]="variant()"
          [heading]="l().title"
          [message]="helperText() ? l().helper : ''"
          [mobile]="mobile()"
          [dismissible]="closeButton()"
          [closeLabel]="l().close"
          (dismissed)="visible.set(false)"
        >
          @if (actions()) {
            <div modToastActions style="display: contents">
              <button
                mod-button
                type="button"
                [variant]="mobile() ? 'secondary-solid' : 'subtle'"
                [size]="mobile() ? 'large' : 'medium'"
                [class.btn-full-width]="mobile()"
              >
                {{ l().button }}
              </button>
              @if (secondaryAction()) {
                <button
                  mod-button
                  type="button"
                  [variant]="mobile() ? 'secondary-solid' : 'subtle'"
                  [size]="mobile() ? 'large' : 'medium'"
                  [class.btn-full-width]="mobile()"
                >
                  {{ l().button }}
                </button>
              }
            </div>
          }
        </mod-toast>
      } @else {
        <button class="reset" type="button" (click)="visible.set(true)">{{ l().reset }}</button>
      }

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Type" [options]="variants" [(value)]="variant" />
      <demo-switch label="Mobile" [(checked)]="mobile" />
      <demo-switch label="Helper Text" [(checked)]="helperText" />
      <demo-switch label="Actions" [(checked)]="actions" />
      <demo-switch label="Secondary Action" [(checked)]="secondaryAction" />
      <demo-switch label="Close Button" [(checked)]="closeButton" />
    </demo-live>

    <demo-props heading="Props" [props]="props" />

    <demo-showcase
      heading="Types"
      description="Five type variants control the accent line color and icon style."
    >
      <div class="stack">
        @for (v of variants; track v.value) {
          <mod-toast [variant]="v.value" [heading]="title" [message]="helper">
            <ng-container modToastActions>
              <button mod-button variant="subtle" size="medium" type="button">Button</button>
              <button mod-button variant="subtle" size="medium" type="button">Button</button>
            </ng-container>
          </mod-toast>
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Mobile Layout"
      description="On smaller screens, the toast uses a stacked vertical layout with full-width buttons and a horizontal top accent line."
    >
      <div class="wrap">
        @for (v of variants; track v.value) {
          <mod-toast mobile [variant]="v.value" [heading]="title" [message]="helper">
            <ng-container modToastActions>
              <button mod-button variant="secondary-solid" class="btn-full-width" type="button">Button</button>
              <button mod-button variant="secondary-solid" class="btn-full-width" type="button">Button</button>
            </ng-container>
          </mod-toast>
        }
      </div>
    </demo-showcase>

    <demo-showcase heading="Without Helper Text" description="Toast with only the title, no supporting description.">
      <div class="stack">
        <mod-toast variant="info" [heading]="title">
          <ng-container modToastActions>
            <button mod-button variant="subtle" size="medium" type="button">Button</button>
            <button mod-button variant="subtle" size="medium" type="button">Button</button>
          </ng-container>
        </mod-toast>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Without Actions"
      description="Toast without action buttons, used for informational-only messages."
    >
      <div class="stack">
        <mod-toast variant="success" [heading]="title" [message]="helper" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Without Close Button"
      description="Toast without the dismiss button, typically auto-dismissed after a set duration."
    >
      <div class="stack">
        <mod-toast variant="warning" [heading]="title" [message]="helper" [dismissible]="false">
          <ng-container modToastActions>
            <button mod-button variant="subtle" size="medium" type="button">Button</button>
            <button mod-button variant="subtle" size="medium" type="button">Button</button>
          </ng-container>
        </mod-toast>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="Right-to-left layout with Arabic text. The accent line moves to the right side on desktop."
    >
      <div class="stack" dir="rtl" lang="ar">
        @for (v of variants; track v.value) {
          <mod-toast [variant]="v.value" [heading]="titleAr" [message]="helperAr" closeLabel="إغلاق">
            <ng-container modToastActions>
              <button mod-button variant="subtle" size="medium" type="button">إجراء</button>
              <button mod-button variant="subtle" size="medium" type="button">إجراء</button>
            </ng-container>
          </mod-toast>
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Toast Service"
      description="Angular addition: ModToastService pushes transient toasts into a mod-toast-container placed once in the app. Toasts auto-dismiss after the duration; the timer pauses on hover and focus."
    >
      <div class="showcase-row">
        @for (v of variants; track v.value) {
          <button mod-button variant="secondary-outline" (click)="show(v.value)">{{ v.label }}</button>
        }
        <button mod-button variant="subtle" (click)="toasts.clear()">Clear all</button>
      </div>
      <div class="showcase-row">
        <span class="showcase-label">Position</span>
        @for (p of positions; track p) {
          <button mod-button variant="secondary-outline" size="small" [selected]="position() === p" (click)="position.set(p)">
            {{ p }}
          </button>
        }
      </div>
      <mod-toast-container [position]="position()" />
    </demo-showcase>
  `,
})
export class NotificationToastPage {
  protected readonly toasts = inject(ModToastService);

  protected readonly title = TITLE;
  protected readonly helper = HELPER;
  protected readonly titleAr = TITLE_AR;
  protected readonly helperAr = HELPER_AR;

  protected readonly variants: DemoOption<ModToastVariant>[] = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'info', label: 'Info' },
    { value: 'critical', label: 'Critical' },
    { value: 'warning', label: 'Warning' },
    { value: 'success', label: 'Success' },
  ];
  protected readonly positions: ModToastPosition[] = [
    'top-start',
    'top-center',
    'top-end',
    'bottom-start',
    'bottom-center',
    'bottom-end',
  ];

  protected readonly rtl = signal(false);
  protected readonly variant = signal<ModToastVariant>('neutral');
  protected readonly mobile = signal(false);
  protected readonly helperText = signal(true);
  protected readonly actions = signal(true);
  protected readonly secondaryAction = signal(true);
  protected readonly closeButton = signal(true);
  protected readonly visible = signal(true);
  protected readonly position = signal<ModToastPosition>('top-end');

  protected readonly l = computed(() =>
    this.rtl()
      ? { title: TITLE_AR, helper: HELPER_AR, button: 'إجراء', close: 'إغلاق', reset: 'إظهار الإشعار' }
      : { title: TITLE, helper: HELPER, button: 'Button', close: 'Dismiss', reset: 'Show toast' },
  );

  protected show(variant: ModToastVariant): void {
    this.toasts.show({
      variant,
      title: TITLE,
      message: HELPER,
      actions: [{ label: 'Button' }, { label: 'Button' }],
    });
  }

  protected readonly props: DemoProp[] = [
    { name: 'variant', type: "'neutral' | 'info' | 'critical' | 'warning' | 'success'", default: "'neutral'", description: 'Visual style variant of the toast notification.' },
    { name: 'heading', type: 'string', description: 'Required. Bold title text displayed prominently.' },
    { name: 'message', type: 'string', default: "''", description: 'Supporting description text below the title. Empty hides it.' },
    { name: 'mobile', type: 'boolean', default: 'false', description: 'Narrow mobile layout (343px, stacked actions, accent line on top).' },
    { name: '[modToastActions]', type: 'directive', description: 'Marks the projected action buttons.' },
    { name: 'dismissible', type: 'boolean', default: 'true', description: 'Show the close/dismiss button.' },
    { name: 'closeLabel', type: 'string', default: "'Dismiss'", description: 'Accessible label of the close button.' },
    { name: 'announce', type: 'boolean', default: 'true', description: 'Gives the toast role="alert" (critical) or role="status".' },
    { name: '(dismissed)', type: 'void', description: 'Emits when the close button is pressed. The toast does not hide itself.' },
    { name: 'mod-toast-container [position]', type: "'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'", default: "'top-end'", description: 'Vertical and horizontal position on the screen where service toasts stack.' },
    { name: 'mod-toast-container [mobile]', type: 'boolean', default: 'false', description: 'Render service toasts in the mobile layout.' },
    { name: 'mod-toast-container [ariaLabel]', type: 'string', default: "'Notifications'", description: 'Accessible name of the live region.' },
    { name: 'ModToastService.show(options)', type: '{ title, message?, variant?, duration?, dismissible?, closeLabel?, actions? }', description: 'Shows a transient toast and returns a ref with dismiss(). duration defaults to 5000 ms; 0 keeps it.' },
  ];
}
