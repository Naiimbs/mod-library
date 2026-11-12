import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { ModButton, ModErrorLinks, ModErrorPage, ModSearchBox, ModIcon } from '@mod-internal/ui';

const TEXT = {
  en: {
    code: '404 error',
    title: 'Page not found',
    text: 'The page you are looking for is not here. Search the system, or choose one of the destinations below.',
    home: 'Back to home',
    searchPlaceholder: 'Search the system...',
    searchLabel: 'Search the system',
    clearLabel: 'Clear search',
    searchButton: 'Search',
    noResults: 'No results for',
    linksLabel: 'Helpful links',
    links: [
      { icon: 'home-01', title: 'Home', text: 'Your dashboard and the latest notifications.' },
      { icon: 'task-01', title: 'My requests', text: 'Follow the requests you submitted and their status.' },
      { icon: 'customer-support', title: 'Support', text: 'Contact technical support or report a problem.' },
    ],
  },
  ar: {
    code: 'خطأ 404',
    title: 'الصفحة غير موجودة',
    text: 'الصفحة التي تبحث عنها غير موجودة هنا. ابحث في النظام، أو اختر إحدى الوجهات التالية.',
    home: 'العودة إلى الرئيسية',
    searchPlaceholder: 'ابحث في النظام...',
    searchLabel: 'البحث في النظام',
    clearLabel: 'مسح البحث',
    searchButton: 'بحث',
    noResults: 'لا توجد نتائج عن',
    linksLabel: 'روابط مفيدة',
    links: [
      { icon: 'home-01', title: 'الرئيسية', text: 'لوحة المعلومات وآخر الإشعارات.' },
      { icon: 'task-01', title: 'طلباتي', text: 'تابع الطلبات التي قدّمتها وحالة كل منها.' },
      { icon: 'customer-support', title: 'الدعم الفني', text: 'تواصل مع الدعم الفني أو أبلغ عن مشكلة.' },
    ],
  },
} as const;

/**
 * 404 that helps the user continue: a search box and a short list of the
 * most useful destinations (icon, title, one-line description, arrow) in the
 * `modErrorLinks` slot.
 *
 * Demo behaviour: pressing Enter in the search box shows a "no results" line.
 */
@Component({
  selector: 'demo-not-found-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModErrorPage, ModErrorLinks, ModButton, ModSearchBox, ModIcon],
  styles: `
    :host {
      display: block;
    }

    .nf-search {
      display: grid;
      gap: var(--spacing-md);
      padding-block: var(--spacing-3xl);
    }

    .nf-search__status {
      margin: 0;
      min-height: 20px;
      font-size: var(--font-size-sm);
      line-height: 20px;
      color: var(--gray-600);
    }

    .nf-links__label {
      margin: 0 0 var(--spacing-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--gray-600);
    }

    .nf-links {
      margin: 0;
      padding: 0;
      list-style: none;
      border-block-start: 1px solid var(--gray-200);
    }

    .nf-links li {
      border-block-end: 1px solid var(--gray-200);
    }

    .nf-link {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--spacing-xl);
      padding: var(--spacing-xl) var(--spacing-md);
      color: inherit;
      text-decoration: none;
    }

    .nf-link:hover {
      background: var(--gray-50);
    }

    .nf-link:focus-visible {
      outline: 2px solid var(--border-black);
      outline-offset: -2px;
    }

    .nf-link__icon {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--sa-50);
      color: var(--mod-primary-text);
      font-size: 20px;
    }

    .nf-link__title {
      display: block;
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      line-height: 24px;
      color: var(--gray-900);
    }

    .nf-link__text {
      display: block;
      font-size: var(--font-size-sm);
      line-height: 20px;
      color: var(--gray-600);
    }

    .nf-link__arrow {
      font-size: 20px;
      color: var(--gray-500);
    }

    :host-context([dir='rtl']) .nf-link__arrow {
      transform: scaleX(-1);
    }
  `,
  template: `
    <mod-error-page [code]="t().code" [heading]="t().title" [description]="t().text">
      <a mod-button href="#" (click)="$event.preventDefault()">{{ t().home }}</a>

      <div modErrorLinks>
        <div class="nf-search">
          <mod-search-box
            searchButton
            [placeholder]="t().searchPlaceholder"
            [ariaLabel]="t().searchLabel"
            [clearLabel]="t().clearLabel"
            [searchLabel]="t().searchButton"
            [(value)]="query"
            (search)="onSearch($event)"
            (cleared)="searched.set('')"
          />
          <p class="nf-search__status" role="status">
            @if (searched()) {
              {{ t().noResults }} “{{ searched() }}”
            }
          </p>
        </div>

        <p class="nf-links__label" [id]="labelId">{{ t().linksLabel }}</p>
        <ul class="nf-links" [attr.aria-labelledby]="labelId">
          @for (link of t().links; track link.icon) {
            <li>
              <a class="nf-link" href="#" (click)="$event.preventDefault()">
                <span class="nf-link__icon"><mod-icon [name]="link.icon" /></span>
                <span>
                  <span class="nf-link__title">{{ link.title }}</span>
                  <span class="nf-link__text">{{ link.text }}</span>
                </span>
                <mod-icon class="nf-link__arrow" name="arrow-right-01" />
              </a>
            </li>
          }
        </ul>
      </div>
    </mod-error-page>
  `,
})
export class NotFoundSearchExample {
  private static nextId = 0;

  readonly lang = input<'en' | 'ar'>('en');
  protected readonly t = computed(() => TEXT[this.lang()]);

  protected readonly labelId = `demo-not-found-links-${NotFoundSearchExample.nextId++}`;
  protected readonly query = signal('');
  protected readonly searched = signal('');

  protected onSearch(query: string): void {
    // Stand-in for the real search: the demo always answers "no results".
    this.searched.set(query.trim());
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const NOT_FOUND_SEARCH_CODE = `import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ModButton, ModErrorLinks, ModErrorPage, ModSearchBox, ModIcon } from '@mod-internal/ui';

interface HelpfulLink {
  icon: string;
  title: string;
  text: string;
  route: string;
}

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ModErrorPage, ModErrorLinks, ModButton, ModSearchBox, ModIcon],
  styles: \`
    .nf-search { padding-block: var(--spacing-3xl); }

    .nf-links__label {
      margin: 0 0 var(--spacing-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--gray-600);
    }

    .nf-links {
      margin: 0;
      padding: 0;
      list-style: none;
      border-block-start: 1px solid var(--gray-200);
    }
    .nf-links li { border-block-end: 1px solid var(--gray-200); }

    .nf-link {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--spacing-xl);
      padding: var(--spacing-xl) var(--spacing-md);
      color: inherit;
      text-decoration: none;
    }
    .nf-link:hover { background: var(--gray-50); }
    .nf-link:focus-visible { outline: 2px solid var(--border-black); outline-offset: -2px; }

    .nf-link__icon {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--sa-50);
      color: var(--mod-primary-text);
      font-size: 20px;
    }
    .nf-link__title {
      display: block;
      font-weight: var(--font-weight-semibold);
      line-height: 24px;
      color: var(--gray-900);
    }
    .nf-link__text {
      display: block;
      font-size: var(--font-size-sm);
      line-height: 20px;
      color: var(--gray-600);
    }
    .nf-link__arrow { font-size: 20px; color: var(--gray-500); }
    :host-context([dir='rtl']) .nf-link__arrow { transform: scaleX(-1); }
  \`,
  template: \`
    <mod-error-page
      code="404 error"
      heading="Page not found"
      description="The page you are looking for is not here. Search the system, or choose one of the destinations below."
    >
      <a mod-button routerLink="/">Back to home</a>

      <div modErrorLinks>
        <div class="nf-search">
          <mod-search-box
            searchButton
            placeholder="Search the system..."
            ariaLabel="Search the system"
            [(value)]="query"
            (search)="search($event)"
          />
        </div>

        <p class="nf-links__label" id="not-found-links">Helpful links</p>
        <ul class="nf-links" aria-labelledby="not-found-links">
          @for (link of links; track link.route) {
            <li>
              <a class="nf-link" [routerLink]="link.route">
                <span class="nf-link__icon"><mod-icon [name]="link.icon" /></span>
                <span>
                  <span class="nf-link__title">{{ link.title }}</span>
                  <span class="nf-link__text">{{ link.text }}</span>
                </span>
                <mod-icon class="nf-link__arrow" name="arrow-right-01" />
              </a>
            </li>
          }
        </ul>
      </div>
    </mod-error-page>
  \`,
})
export class NotFound {
  private readonly router = inject(Router);

  protected readonly query = signal('');
  protected readonly links: HelpfulLink[] = [
    { icon: 'home-01', title: 'Home', text: 'Your dashboard and the latest notifications.', route: '/' },
    { icon: 'task-01', title: 'My requests', text: 'Follow the requests you submitted and their status.', route: '/requests' },
    { icon: 'customer-support', title: 'Support', text: 'Contact technical support or report a problem.', route: '/support' },
  ];

  protected search(query: string): void {
    const q = query.trim();
    if (q) void this.router.navigate(['/search'], { queryParams: { q } });
  }
}
`;
