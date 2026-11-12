import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ModButton, ModErrorPage } from '@mod-internal/ui';

const TEXT = {
  en: {
    title: 'We could not find this page',
    text: 'The link may be out of date, or the page may have been removed. You can go back to where you were or start again from the home page.',
    home: 'Back to home',
    back: 'Go back',
  },
  ar: {
    title: 'لم نتمكن من العثور على هذه الصفحة',
    text: 'قد يكون الرابط قديمًا أو أن الصفحة قد أُزيلت. يمكنك الرجوع إلى حيث كنت، أو البدء من الصفحة الرئيسية.',
    home: 'العودة إلى الرئيسية',
    back: 'رجوع',
  },
} as const;

/**
 * 404 with the status code as a large watermark number above the title
 * (`largeCode`). The number scales with the width of the section.
 */
@Component({
  selector: 'demo-not-found-large-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModErrorPage, ModButton],
  styles: ':host { display: block; }',
  template: `
    <mod-error-page code="404" largeCode [heading]="t().title" [description]="t().text">
      <a mod-button href="#" (click)="$event.preventDefault()">{{ t().home }}</a>
      <a mod-button variant="secondary-outline" href="#" (click)="$event.preventDefault()">{{ t().back }}</a>
    </mod-error-page>
  `,
})
export class NotFoundLargeCodeExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const NOT_FOUND_LARGE_CODE_CODE = `import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModButton, ModErrorPage } from '@mod-internal/ui';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ModErrorPage, ModButton],
  template: \`
    <mod-error-page
      code="404"
      largeCode
      heading="We could not find this page"
      description="The link may be out of date, or the page may have been removed. You can go back to where you were or start again from the home page."
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
`;
