import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import {
  ModButton,
  ModInlineAlert,
  ModInlineAlertActions,
  ModInlineAlertMobileActions,
  ModInlineAlertVariant,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

const TITLES: Record<'en' | 'ar', Record<ModInlineAlertVariant, string>> = {
  en: { neutral: 'Neutral alert', info: 'Info alert', error: 'Error alert', warning: 'Warning alert', success: 'Success alert' },
  ar: { neutral: 'تنبيه عام', info: 'تنبيه معلومات', error: 'تنبيه خطأ', warning: 'تنبيه تحذير', success: 'تنبيه نجاح' },
};

@Component({
  selector: 'demo-inline-alert-page',
  imports: [ModInlineAlert, ModInlineAlertActions, ModInlineAlertMobileActions, ModButton, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Inline Alert</h1>
      <p class="content-description">
        Inline alerts surface page-level messages in the flow of content. Five semantic types (neutral, info, error,
        warning, success) with an accent edge, an optional colored background, an optional dismiss button, and optional
        action buttons. Ported from the DGA library's <code>mod-inline-alert</code> component.
      </p>
    </div>

    <demo-live
      heading="Inline Alert"
      description="Alerts communicate a state that affects the page or a section of it. Use the type that matches the severity of the message."
      [rtl]="rtl()"
    >
      <mod-inline-alert
        style="max-width: 560px"
        [variant]="variant()"
        [colored]="colored()"
        [heading]="t().title"
        [message]="helper() ? t().helper : ''"
        [dismissible]="close()"
        [closeLabel]="t().closeLabel"
        [(visible)]="visible"
      >
        @if (actions()) {
          <div modInlineAlertActions style="display: contents">
            <button mod-button type="button" variant="subtle" size="small">{{ t().action1 }}</button>
            <button mod-button type="button" variant="transparent" size="small">{{ t().action2 }}</button>
          </div>
        }
        @if (actions()) {
          <div modInlineAlertMobileActions style="display: contents">
            <button mod-button type="button" variant="secondary-outline">{{ t().action1 }}</button>
            <button mod-button type="button" variant="transparent">{{ t().action2 }}</button>
          </div>
        }
      </mod-inline-alert>

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Type" [options]="variants" [(value)]="variant" />
      <demo-switch label="Colored background" [(checked)]="colored" />
      <demo-switch label="Helper text" [(checked)]="helper" />
      <demo-switch label="Close button" [(checked)]="close" />
      <demo-switch label="Action buttons" [(checked)]="actions" />
    </demo-live>

    <demo-props
      description="Inputs, models and outputs of mod-inline-alert. Dismissing the live-demo alert with its close button re-renders it when any control changes."
      [props]="props"
    />

    <demo-showcase
      heading="Types"
      description="Five semantic types. The accent edge and the featured icon communicate severity; the layout stays identical."
      align="stretch"
    >
      <mod-inline-alert variant="neutral" heading="Neutral alert" message="A general message that does not carry a semantic state." />
      <mod-inline-alert variant="info" heading="Info alert" message="Something the user should know before they continue." />
      <mod-inline-alert variant="success" heading="Success alert" message="The request was submitted successfully." />
      <mod-inline-alert variant="warning" heading="Warning alert" message="Review the highlighted fields before submitting." />
      <mod-inline-alert variant="error" heading="Error alert" message="The request could not be completed. Try again later." />
    </demo-showcase>

    <demo-showcase
      heading="Colored Background"
      description="The colored variant fills the alert with the type's 25-tint and softens the border to the 200-tint."
      align="stretch"
    >
      <mod-inline-alert colored variant="info" heading="Info alert" message="Something the user should know before they continue." />
      <mod-inline-alert colored variant="success" heading="Success alert" message="The request was submitted successfully." />
      <mod-inline-alert colored variant="warning" heading="Warning alert" message="Review the highlighted fields before submitting." />
      <mod-inline-alert colored variant="error" heading="Error alert" message="The request could not be completed. Try again later." />
    </demo-showcase>

    <demo-showcase
      heading="With Action Buttons"
      description="Alerts can carry actions, indented to align with the text column. Under 600px the actions stack full-width below the message."
      align="stretch"
    >
      <mod-inline-alert
        variant="warning"
        heading="Your session is about to expire"
        message="You will be signed out in 5 minutes. Extend the session to keep working."
      >
        <ng-container modInlineAlertActions>
          <button mod-button type="button" variant="subtle" size="small">Extend session</button>
          <button mod-button type="button" variant="transparent" size="small">Sign out</button>
        </ng-container>
        <ng-container modInlineAlertMobileActions>
          <button mod-button type="button" variant="secondary-outline">Extend session</button>
          <button mod-button type="button" variant="transparent">Sign out</button>
        </ng-container>
      </mod-inline-alert>
    </demo-showcase>

    <demo-showcase
      heading="Dismissible"
      description="An icon-only transparent button in the header dismisses the alert. On mobile it anchors to the top corner."
      align="stretch"
    >
      <mod-inline-alert colored dismissible variant="success" heading="Profile updated" message="Your changes were saved." />
    </demo-showcase>

    <demo-showcase
      heading="Title Only"
      description="Without helper text the header centers the icon against the single line."
      align="stretch"
    >
      <mod-inline-alert variant="info" heading="A new version of this service is available." />
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="The accent edge, icon, and dismiss button mirror automatically in right-to-left layouts."
      align="stretch"
    >
      <div dir="rtl" lang="ar">
        <mod-inline-alert
          colored
          dismissible
          variant="success"
          heading="تم إرسال الطلب بنجاح"
          message="سيتم إشعارك عند اكتمال المعالجة."
          closeLabel="إغلاق"
        />
      </div>
    </demo-showcase>
  `,
})
export class InlineAlertPage {
  protected readonly variants: DemoOption<ModInlineAlertVariant>[] = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'info', label: 'Info' },
    { value: 'error', label: 'Error' },
    { value: 'warning', label: 'Warning' },
    { value: 'success', label: 'Success' },
  ];

  protected readonly rtl = signal(false);
  protected readonly variant = signal<ModInlineAlertVariant>('info');
  protected readonly colored = signal(false);
  protected readonly helper = signal(true);
  protected readonly close = signal(false);
  protected readonly actions = signal(false);
  protected readonly visible = signal(true);

  protected readonly t = computed(() => {
    const ar = this.rtl();
    return {
      title: TITLES[ar ? 'ar' : 'en'][this.variant()],
      helper: ar
        ? 'نص مساعد يوضح ما حدث وما يمكن للمستخدم فعله بعد ذلك.'
        : 'Supporting text explains what happened and what the user can do next.',
      action1: ar ? 'إجراء أساسي' : 'Primary action',
      action2: ar ? 'تجاهل' : 'Dismiss',
      closeLabel: ar ? 'إغلاق' : 'Dismiss',
    };
  });

  constructor() {
    // A dismissed alert comes back when any control changes, as in the original demo.
    effect(() => {
      this.rtl();
      this.variant();
      this.colored();
      this.helper();
      this.close();
      this.actions();
      this.visible.set(true);
    });
  }

  protected readonly props: DemoProp[] = [
    { name: 'variant', type: "'neutral' | 'info' | 'error' | 'warning' | 'success'", default: "'neutral'", description: 'Semantic type: sets the accent edge and featured icon colors.' },
    { name: 'colored', type: 'boolean', default: 'false', description: "Fills the alert with the type's 25-tint and softens the border to the 200-tint." },
    { name: 'heading', type: 'string', default: "''", description: 'Alert title.' },
    { name: 'message', type: 'string', default: "''", description: 'Supporting helper text under the title.' },
    { name: 'showIcon', type: 'boolean', default: 'true', description: 'Shows the featured icon.' },
    { name: 'icon', type: 'string', default: 'per variant', description: 'Icon name without the dga-icon- prefix. Defaults: help-circle, alert-02 (warning), tick-02 (success).' },
    { name: 'centered', type: 'boolean | undefined', default: 'undefined', description: 'Vertically centers the header row. Defaults to true when there is no message (title only).' },
    { name: 'dismissible', type: 'boolean', default: 'false', description: 'Shows the icon-only close button in the header.' },
    { name: 'closeLabel', type: 'string', default: "'Dismiss'", description: 'Accessible label of the close button.' },
    { name: 'visible', type: 'model<boolean>', default: 'true', description: 'Whether the alert is shown. Set back to true to show it again.' },
    { name: '(dismissed)', type: 'void', description: 'Emits after the user dismisses the alert.' },
    { name: '[modInlineAlertActions]', type: 'directive', description: 'Marks the projected desktop action buttons, indented to align with the text column.' },
    { name: '[modInlineAlertMobileActions]', type: 'directive', description: 'Marks the projected full-width actions shown under 600px.' },
  ];
}
