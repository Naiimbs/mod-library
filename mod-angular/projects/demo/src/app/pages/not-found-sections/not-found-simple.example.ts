import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ModButton, ModErrorPage } from '@mod-internal/ui';

const TEXT = {
  en: {
    code: '404 error',
    title: 'Page not found',
    text: 'Sorry, the page you are looking for does not exist or has been moved. Check the address, or return to the home page.',
    home: 'Back to home',
    back: 'Go back',
  },
  ar: {
    code: 'خطأ 404',
    title: 'الصفحة غير موجودة',
    text: 'عذرًا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. تحقق من صحة العنوان، أو عد إلى الصفحة الرئيسية.',
    home: 'العودة إلى الرئيسية',
    back: 'رجوع',
  },
} as const;

/**
 * Simple centred 404: a small status label, the title, one sentence of help
 * and two actions. The lightest version, for pages inside an existing shell.
 */
@Component({
  selector: 'demo-not-found-simple',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModErrorPage, ModButton],
  styles: ':host { display: block; }',
  template: `
    <mod-error-page [code]="t().code" [heading]="t().title" [description]="t().text">
      <a mod-button href="#" (click)="$event.preventDefault()">{{ t().home }}</a>
      <a mod-button variant="secondary-outline" href="#" (click)="$event.preventDefault()">{{ t().back }}</a>
    </mod-error-page>
  `,
})
export class NotFoundSimpleExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const NOT_FOUND_SIMPLE_CODE = `import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModButton, ModErrorPage } from '@mod-internal/ui';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ModErrorPage, ModButton],
  template: \`
    <mod-error-page
      code="404 error"
      heading="Page not found"
      description="Sorry, the page you are looking for does not exist or has been moved. Check the address, or return to the home page."
    >
      <a mod-button routerLink="/">Back to home</a>
      <button mod-button variant="secondary-outline" type="button" (click)="back()">Go back</button>
    </mod-error-page>
  \`,
})
export class NotFound {
  private readonly location = inject(Location);

  protected back(): void {
    this.location.back();
  }
}

// app.routes.ts — keep this route last:
// { path: '**', component: NotFound }
`;
