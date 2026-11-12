import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ModButton, ModErrorPage } from '@mod-internal/ui';

const TEXT = {
  en: {
    code: '404 error',
    title: 'Page not found',
    text: 'The page you requested is not available. It may have been moved, or the address may be incorrect.',
    home: 'Back to home',
    back: 'Go back',
  },
  ar: {
    code: 'خطأ 404',
    title: 'الصفحة غير موجودة',
    text: 'الصفحة التي طلبتها غير متاحة. ربما تم نقلها، أو أن العنوان المُدخل غير صحيح.',
    home: 'العودة إلى الرئيسية',
    back: 'رجوع',
  },
} as const;

/**
 * Dark 404 (`dark`): the brand dark green as a full-height background with
 * light text. The buttons use `onColor` so they stay readable on the green.
 */
@Component({
  selector: 'demo-not-found-dark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModErrorPage, ModButton],
  styles: ':host { display: block; }',
  template: `
    <mod-error-page dark fullHeight [code]="t().code" [heading]="t().title" [description]="t().text">
      <a mod-button onColor href="#" (click)="$event.preventDefault()">{{ t().home }}</a>
      <a mod-button variant="secondary-outline" onColor href="#" (click)="$event.preventDefault()">{{ t().back }}</a>
    </mod-error-page>
  `,
})
export class NotFoundDarkExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const NOT_FOUND_DARK_CODE = `import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModButton, ModErrorPage } from '@mod-internal/ui';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ModErrorPage, ModButton],
  template: \`
    <!-- fullHeight fills the viewport; set --mod-error-min-height on a parent to change it. -->
    <mod-error-page
      dark
      fullHeight
      code="404 error"
      heading="Page not found"
      description="The page you requested is not available. It may have been moved, or the address may be incorrect."
    >
      <a mod-button onColor routerLink="/">Back to home</a>
      <button mod-button variant="secondary-outline" onColor type="button" (click)="back()">Go back</button>
    </mod-error-page>
  \`,
})
export class NotFound {
  private readonly location = inject(Location);

  protected back(): void {
    this.location.back();
  }
}
`;
