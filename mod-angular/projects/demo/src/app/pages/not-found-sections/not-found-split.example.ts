import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ModButton, ModErrorMedia, ModErrorPage, ModIcon } from '@mod-internal/ui';

const TEXT = {
  en: {
    code: '404 error',
    title: 'This page is missing',
    text: 'We looked everywhere, but the page you asked for is not in the system. Return to the home page and continue from there.',
    home: 'Back to home',
    back: 'Go back',
  },
  ar: {
    code: 'خطأ 404',
    title: 'هذه الصفحة مفقودة',
    text: 'بحثنا في كل مكان، لكن الصفحة التي طلبتها غير موجودة في النظام. عد إلى الصفحة الرئيسية وتابع من هناك.',
    home: 'العودة إلى الرئيسية',
    back: 'رجوع',
  },
} as const;

/**
 * Split 404 (`split`): text on the start side, illustration on the end side.
 * The illustration is built from two icons of the library icon set
 * (file-not-found and search-01) on a tinted circle; it is decorative, so it
 * is hidden from assistive technology. Stacks on narrow containers.
 */
@Component({
  selector: 'demo-not-found-split',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModErrorPage, ModErrorMedia, ModButton, ModIcon],
  styles: `
    :host {
      display: block;
    }

    .nf-ill {
      position: relative;
      display: grid;
      place-items: center;
      width: min(100%, 360px);
      aspect-ratio: 1;
      margin-inline: auto;
      border-radius: 50%;
      background: var(--sa-50);
      color: var(--mod-dark-green);
    }

    .nf-ill__main {
      font-size: clamp(96px, 30cqw, 160px);
    }

    .nf-ill__badge {
      position: absolute;
      inset-block-end: 8%;
      inset-inline-end: 8%;
      display: grid;
      place-items: center;
      width: 88px;
      height: 88px;
      border: 1px solid var(--gray-300);
      border-radius: 50%;
      background: var(--alpha-white);
      color: var(--mod-primary-text);
      font-size: 40px;
    }
  `,
  template: `
    <mod-error-page split fullHeight [code]="t().code" [heading]="t().title" [description]="t().text">
      <a mod-button href="#" (click)="$event.preventDefault()">{{ t().home }}</a>
      <a mod-button variant="secondary-outline" href="#" (click)="$event.preventDefault()">{{ t().back }}</a>

      <div modErrorMedia class="nf-ill" aria-hidden="true">
        <mod-icon class="nf-ill__main" name="file-not-found" />
        <span class="nf-ill__badge"><mod-icon name="search-01" /></span>
      </div>
    </mod-error-page>
  `,
})
export class NotFoundSplitExample {
  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const NOT_FOUND_SPLIT_CODE = `import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModButton, ModErrorMedia, ModErrorPage, ModIcon } from '@mod-internal/ui';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ModErrorPage, ModErrorMedia, ModButton, ModIcon],
  styles: \`
    .nf-ill {
      position: relative;
      display: grid;
      place-items: center;
      width: min(100%, 360px);
      aspect-ratio: 1;
      margin-inline: auto;
      border-radius: 50%;
      background: var(--sa-50);
      color: var(--mod-dark-green);
    }

    .nf-ill__main {
      font-size: clamp(96px, 30cqw, 160px);
    }

    .nf-ill__badge {
      position: absolute;
      inset-block-end: 8%;
      inset-inline-end: 8%;
      display: grid;
      place-items: center;
      width: 88px;
      height: 88px;
      border: 1px solid var(--gray-300);
      border-radius: 50%;
      background: var(--alpha-white);
      color: var(--mod-primary-text);
      font-size: 40px;
    }
    .nf-ill__window { fill: var(--alpha-white); stroke: var(--gray-300); stroke-width: 2; }
    .nf-ill__dot { fill: var(--sa-300); }
    .nf-ill__gap { fill: none; stroke: var(--sa-600); stroke-width: 2; stroke-dasharray: 8 8; }
    .nf-ill__handle { fill: none; stroke: var(--mod-dark-green); stroke-width: 14; stroke-linecap: round; }
    .nf-ill__ring { fill: none; stroke: var(--gray-300); stroke-width: 4; }
  \`,
  template: \`
    <mod-error-page
      split
      fullHeight
      code="404 error"
      heading="This page is missing"
      description="We looked everywhere, but the page you asked for is not in the system. Return to the home page and continue from there."
    >
      <a mod-button routerLink="/">Back to home</a>
      <button mod-button variant="secondary-outline" type="button" (click)="back()">Go back</button>

      <!-- Decorative illustration made of library icons; an <img modErrorMedia alt=""> works too. -->
      <div modErrorMedia class="nf-ill" aria-hidden="true">
        <mod-icon class="nf-ill__main" name="file-not-found" />
        <span class="nf-ill__badge"><mod-icon name="search-01" /></span>
      </div>
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
