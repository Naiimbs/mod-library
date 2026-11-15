import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { ModHeaderAction, ModNavHeader, ModNavHeaderItem } from '@mod-internal/ui';
import { DEMO_APP_EXAMPLES, DEMO_NAV, DEMO_PAGE_EXAMPLES } from './nav';

/** Pages that hide the sidebar, as in the original router.js. */
const FULL_PAGE_VIEWS = ['icons', 'classes', 'styles', 'service-page'];

/** Same shell as the original docs site: fixed header, sidebar, content. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ModNavHeader, ModHeaderAction],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  protected readonly nav = DEMO_NAV;
  protected readonly pageExamples = DEMO_PAGE_EXAMPLES;
  protected readonly appExamples = DEMO_APP_EXAMPLES;
  protected readonly appExamplesOpen = signal(true);
  /** Collapsed state of the two sidebar groups. */
  protected readonly examplesOpen = signal(true);
  protected readonly componentsOpen = signal(true);

  protected readonly rtl = signal(false);
  protected readonly dark = signal(this.readTheme() === 'dark');

  /** Current page id (first URL segment), e.g. `button`. */
  protected readonly page = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split(/[/?#]/).filter(Boolean)[0] ?? ''),
    ),
    { initialValue: '' },
  );

  protected readonly fullPage = computed(() => FULL_PAGE_VIEWS.includes(this.page()));

  /** Same items, order and targets as the original header. */
  protected readonly headerItems = computed<ModNavHeaderItem[]>(() => {
    const ar = this.rtl();
    return [
      { id: 'home', label: ar ? 'الرئيسية' : 'Home', href: '#/nav-header' },
      { id: 'styles', label: ar ? 'الأنماط' : 'Styles', href: '#/styles' },
      { id: 'classes', label: ar ? 'الفئات' : 'Classes', href: '#/classes' },
      { id: 'components', label: ar ? 'المكونات' : 'Components', href: '#/components-overview' },
      { id: 'screens', label: ar ? 'قوالب الشاشات' : 'Screen Templates', href: '#/screens' },
      { id: 'icons', label: ar ? 'الأيقونات' : 'Icons', href: '#/icons' },
    ];
  });

  protected readonly activeHeaderItem = computed(() => {
    const page = this.page();
    if (page === 'styles' || page === 'classes' || page === 'icons') return page;
    if (page === 'screens' || page === 'service-page') return 'screens';
    return 'components';
  });

  protected readonly text = computed(() =>
    this.rtl()
      ? { about: 'عن الفريق', search: 'بحث', language: 'English', logo: 'شعار المنصة' }
      : { about: 'About Team', search: 'Search', language: 'عربي', logo: 'Design System' },
  );

  constructor() {
    this.applyTheme();
  }

  protected prevent(event: Event): void {
    event.preventDefault();
  }

  protected toggleRtl(event: Event): void {
    event.preventDefault();
    this.rtl.update((v) => !v);
    const root = this.document.documentElement;
    root.dir = this.rtl() ? 'rtl' : 'ltr';
    root.lang = this.rtl() ? 'ar' : 'en';
  }

  protected toggleDark(event: Event): void {
    event.preventDefault();
    this.dark.update((v) => !v);
    this.applyTheme();
    try {
      localStorage.setItem('mod-theme', this.dark() ? 'dark' : 'light');
    } catch {
      /* private mode */
    }
  }

  private applyTheme(): void {
    const root = this.document.documentElement;
    if (this.dark()) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  }

  private readTheme(): string | null {
    try {
      return localStorage.getItem('mod-theme');
    } catch {
      return null;
    }
  }
}
