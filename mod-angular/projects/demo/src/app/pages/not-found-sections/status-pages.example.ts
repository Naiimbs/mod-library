import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { ModButton, ModErrorPage } from '@mod-internal/ui';

type Status = '403' | '500';

const TEXT = {
  en: {
    switchLabel: 'Status',
    tabs: { '403': '403 — No permission', '500': '500 — Server error' },
    '403': {
      code: '403 error',
      title: 'You do not have permission',
      text: 'Your account is not authorised to view this page. If you need it for your work, request access from the system administrator.',
      primary: 'Request access',
      secondary: 'Back',
    },
    '500': {
      code: '500 error',
      title: 'Something went wrong',
      text: 'We could not complete your request because of a problem on our side. Please try again in a few moments; if it continues, contact technical support.',
      primary: 'Try again',
      secondary: 'Contact support',
    },
  },
  ar: {
    switchLabel: 'الحالة',
    tabs: { '403': '403 — لا توجد صلاحية', '500': '500 — خطأ في الخادم' },
    '403': {
      code: 'خطأ 403',
      title: 'لا تملك صلاحية الوصول',
      text: 'حسابك غير مخوّل بعرض هذه الصفحة. إذا كانت مطلوبة لأداء عملك، فاطلب الصلاحية من مدير النظام.',
      primary: 'طلب صلاحية',
      secondary: 'رجوع',
    },
    '500': {
      code: 'خطأ 500',
      title: 'حدث خطأ غير متوقع',
      text: 'تعذّر إكمال طلبك بسبب خلل من جهتنا. يُرجى المحاولة مرة أخرى بعد قليل، وإذا استمرت المشكلة فتواصل مع الدعم الفني.',
      primary: 'إعادة المحاولة',
      secondary: 'التواصل مع الدعم',
    },
  },
} as const;

const STATUSES: readonly Status[] = ['403', '500'];

/**
 * The same section for other statuses: 403 (no permission) and 500 (server
 * error). Only the code, the texts and the two actions change. The small
 * switch above the section belongs to the demo, not to the page.
 */
@Component({
  selector: 'demo-status-pages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModErrorPage, ModButton],
  styles: `
    :host {
      display: block;
    }

    .status-switch {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      padding: var(--spacing-lg) var(--spacing-xl);
      border-block-end: 1px solid var(--gray-200);
      background: var(--gray-50);
    }
  `,
  template: `
    <div class="status-switch" role="group" [attr.aria-label]="t().switchLabel">
      @for (item of statuses; track item) {
        <button
          mod-button
          variant="secondary-outline"
          size="small"
          type="button"
          [selected]="status() === item"
          (click)="status.set(item)"
        >
          {{ t().tabs[item] }}
        </button>
      }
    </div>

    <mod-error-page [code]="page().code" [heading]="page().title" [description]="page().text">
      <a mod-button href="#" (click)="$event.preventDefault()">{{ page().primary }}</a>
      <a mod-button variant="secondary-outline" href="#" (click)="$event.preventDefault()">{{ page().secondary }}</a>
    </mod-error-page>
  `,
})
export class StatusPagesExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);

  protected readonly statuses = STATUSES;
  protected readonly status = signal<Status>('403');
  protected readonly page = computed(() => this.t()[this.status()]);
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const STATUS_PAGES_CODE = `import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModButton, ModErrorPage } from '@mod-internal/ui';

type Status = '403' | '500';

const PAGES = {
  '403': {
    code: '403 error',
    title: 'You do not have permission',
    text: 'Your account is not authorised to view this page. If you need it for your work, request access from the system administrator.',
  },
  '500': {
    code: '500 error',
    title: 'Something went wrong',
    text: 'We could not complete your request because of a problem on our side. Please try again in a few moments; if it continues, contact technical support.',
  },
} as const;

/**
 * One page for both statuses:
 *   { path: 'forbidden', component: StatusPage, data: { status: '403' } }
 *   { path: 'error', component: StatusPage, data: { status: '500' } }
 * (with withComponentInputBinding() the route data fills the "status" input).
 */
@Component({
  selector: 'app-status-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ModErrorPage, ModButton],
  template: \`
    <mod-error-page [code]="page().code" [heading]="page().title" [description]="page().text">
      @if (status() === '403') {
        <a mod-button routerLink="/access-request">Request access</a>
        <button mod-button variant="secondary-outline" type="button" (click)="back()">Back</button>
      } @else {
        <button mod-button type="button" (click)="retry()">Try again</button>
        <a mod-button variant="secondary-outline" routerLink="/support">Contact support</a>
      }
    </mod-error-page>
  \`,
})
export class StatusPage {
  private readonly location = inject(Location);

  readonly status = input<Status>('500');
  protected readonly page = computed(() => PAGES[this.status()]);

  protected back(): void {
    this.location.back();
  }

  protected retry(): void {
    // Reload the page, or repeat the request that failed.
    window.location.reload();
  }
}
`;
