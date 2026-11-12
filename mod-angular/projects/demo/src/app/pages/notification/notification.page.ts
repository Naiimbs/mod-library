import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModButton, ModNotification, ModNotificationActions, ModNotificationVariant } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

const TEXT = 'This is a very important banner message that requires attention';
const TEXT_AR = 'هذه رسالة تنبيهية مهمة للغاية تستدعي التركيز.';

@Component({
  selector: 'demo-notification-page',
  imports: [ModNotification, ModNotificationActions, ModButton, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .stack {
      display: flex;
      flex-direction: column;
      gap: 16px;
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
      <h1 class="content-title">Notification</h1>
      <p class="content-description">
        Notifications are prominent UI elements used to convey important information or alerts to users. They typically
        appear at the top of a webpage or application screen, drawing immediate attention to their content.
      </p>
    </div>

    <demo-live heading="Notification" description="Configure the notification appearance and features." [rtl]="rtl()">
      <mod-notification
        [variant]="variant()"
        [leadText]="leadText() ? l().lead : ''"
        [showIcon]="icon()"
        [dismissible]="dismissible()"
        [closeLabel]="l().close"
        [(visible)]="visible"
      >
        {{ l().text }}
        @if (link() || button()) {
          <div modNotificationActions style="display: contents">
            @if (link()) {
              <a href="#" class="notification__link" (click)="$event.preventDefault()">{{ l().link }}</a>
            }
            @if (button()) {
              <button mod-button variant="neutral" size="medium" type="button">
                @if (rtl()) {
                  {{ l().button }}
                }
                <span class="btn__icon"
                  ><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3.33 8h9.34M8 3.33L12.67 8 8 12.67"
                      stroke="currentColor"
                      stroke-width="1.33"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg
                ></span>
                @if (!rtl()) {
                  {{ l().button }}
                }
              </button>
            }
          </div>
        }
      </mod-notification>
      @if (!visible()) {
        <button class="reset" type="button" (click)="visible.set(true)">{{ l().reset }}</button>
      }

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Style" [options]="variants" [(value)]="variant" />
      <demo-switch label="Icon" [(checked)]="icon" />
      <demo-switch label="Lead Text" [(checked)]="leadText" />
      <demo-switch label="Link" [(checked)]="link" />
      <demo-switch label="Action Button" [(checked)]="button" />
      <demo-switch label="Dismissible" [(checked)]="dismissible" />
    </demo-live>

    <demo-props heading="Props" [props]="props" />

    <demo-showcase
      heading="Variants"
      description="Five style variants for different severity levels: critical, warning, success, info, and neutral."
    >
      <div class="stack">
        @for (v of variants; track v.value) {
          <mod-notification [variant]="v.value" leadText="Important:" dismissible>{{ text }}</mod-notification>
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="With Link"
      description="Notifications can include a text link for additional context or navigation."
    >
      <div class="stack">
        @for (v of linkVariants; track v) {
          <mod-notification [variant]="v" leadText="Important:" dismissible>
            {{ text }}
            <ng-container modNotificationActions>
              <a href="#" class="notification__link" (click)="$event.preventDefault()">Learn more</a>
            </ng-container>
          </mod-notification>
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="With Action Button"
      description="Notifications can include an action button for quick user responses."
    >
      <div class="stack">
        <mod-notification variant="warning" leadText="Important:" dismissible>
          {{ text }}
          <ng-container modNotificationActions>
            <a href="#" class="notification__link" (click)="$event.preventDefault()">Learn more</a>
            <button mod-button variant="neutral" size="medium" type="button">
              <span class="btn__icon"
                ><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3.33 8h9.34M8 3.33L12.67 8 8 12.67"
                    stroke="currentColor"
                    stroke-width="1.33"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  /></svg
              ></span>
              Action Button
            </button>
          </ng-container>
        </mod-notification>
        <mod-notification variant="success" leadText="Important:" dismissible>
          {{ text }}
          <ng-container modNotificationActions>
            <button mod-button variant="neutral" size="medium" type="button">
              <span class="btn__icon"
                ><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3.33 8h9.34M8 3.33L12.67 8 8 12.67"
                    stroke="currentColor"
                    stroke-width="1.33"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  /></svg
              ></span>
              Action Button
            </button>
          </ng-container>
        </mod-notification>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Without Icon"
      description="Notifications can omit the feedback icon for a simpler appearance."
    >
      <div class="stack">
        @for (v of linkVariants; track v) {
          <mod-notification [variant]="v" leadText="Important:" [showIcon]="false" dismissible>{{ text }}</mod-notification>
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Without Lead Text"
      description="Notifications can omit the bold heading for a simpler layout."
    >
      <div class="stack">
        <mod-notification variant="warning" dismissible>{{ text }}</mod-notification>
        <mod-notification variant="neutral" dismissible>{{ text }}</mod-notification>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="Notifications fully support right-to-left layout with Arabic text."
    >
      <div class="stack" dir="rtl" lang="ar">
        @for (v of variants; track v.value) {
          <mod-notification [variant]="v.value" leadText="مهم:" closeLabel="إغلاق" dismissible>{{ textAr }}</mod-notification>
        }
      </div>
    </demo-showcase>
  `,
})
export class NotificationPage {
  protected readonly text = TEXT;
  protected readonly textAr = TEXT_AR;

  protected readonly variants: DemoOption<ModNotificationVariant>[] = [
    { value: 'critical', label: 'Critical' },
    { value: 'warning', label: 'Warning' },
    { value: 'success', label: 'Success' },
    { value: 'info', label: 'Info' },
    { value: 'neutral', label: 'Neutral' },
  ];
  protected readonly linkVariants: ModNotificationVariant[] = ['critical', 'info'];

  protected readonly rtl = signal(false);
  protected readonly variant = signal<ModNotificationVariant>('critical');
  protected readonly icon = signal(true);
  protected readonly leadText = signal(true);
  protected readonly link = signal(false);
  protected readonly button = signal(false);
  protected readonly dismissible = signal(true);
  protected readonly visible = signal(true);

  protected readonly l = computed(() =>
    this.rtl()
      ? { lead: 'مهم:', text: TEXT_AR, link: 'تفاصيل', button: 'إجراء', close: 'إغلاق', reset: 'إظهار الإشعار' }
      : { lead: 'Important:', text: TEXT, link: 'Learn more', button: 'Action Button', close: 'Dismiss', reset: 'Show notification' },
  );

  protected readonly props: DemoProp[] = [
    { name: 'variant', type: "'critical' | 'warning' | 'success' | 'info' | 'neutral'", default: "'info'", description: 'Visual style variant of the notification.' },
    { name: 'leadText', type: 'string', default: "''", description: 'Bold heading text displayed before the content.' },
    { name: '(content)', type: 'projected content', description: 'Helper/body text of the notification.' },
    { name: 'showIcon', type: 'boolean', default: 'true', description: 'Show or hide the feedback icon.' },
    { name: '[modNotificationActions]', type: 'directive', description: 'Marks the projected link (.notification__link) and/or action button.' },
    { name: 'dismissible', type: 'boolean', default: 'false', description: 'Show a close/dismiss button.' },
    { name: 'closeLabel', type: 'string', default: "'Dismiss'", description: 'Accessible label of the close button.' },
    { name: 'visible', type: 'model<boolean>', default: 'true', description: 'Whether the notification is shown. Set back to true to show it again.' },
    { name: '(dismissed)', type: 'void', description: 'Emits after the user dismisses the notification.' },
  ];
}
