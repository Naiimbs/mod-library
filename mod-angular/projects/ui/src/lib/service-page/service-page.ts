import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  contentChild,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

/** Government top bar content (digital stamp + `.sp-govbar__meta`). */
@Directive({ selector: '[modServicePageGovbar]' })
export class ModServicePageGovbar {}

/** Navigation header (and its mobile panel), projected as-is. */
@Directive({ selector: '[modServicePageHeader]' })
export class ModServicePageHeader {}

/** Breadcrumb, wrapped in `.sp-breadcrumb-row`. */
@Directive({ selector: '[modServicePageBreadcrumb]' })
export class ModServicePageBreadcrumb {}

/** Info sidebar content, wrapped in `aside.sp-aside > .sp-aside__card`. */
@Directive({ selector: '[modServicePageAside]' })
export class ModServicePageAside {}

/** Related services content, wrapped in `section.sp-related > .sp-related__inner`. */
@Directive({ selector: '[modServicePageRelated]' })
export class ModServicePageRelated {}

/** Comments & suggestions content, wrapped in `section.sp-comments-wrap`. */
@Directive({ selector: '[modServicePageComments]' })
export class ModServicePageComments {}

/** Rating bar content, wrapped in `section.sp-ratingbar > .sp-ratingbar__inner`. */
@Directive({ selector: '[modServicePageRating]' })
export class ModServicePageRating {}

/** "Was this page useful?" content, wrapped in `section.sp-useful > .sp-useful__inner`. */
@Directive({ selector: '[modServicePageUseful]' })
export class ModServicePageUseful {}

/** Footer, projected as-is. */
@Directive({ selector: '[modServicePageFooter]' })
export class ModServicePageFooter {}

/**
 * Government service page layout. The host element is the `.service-page`
 * wrapper; every region is a content-projection slot and a region's wrapper
 * is only rendered when its slot is filled.
 *
 *   <mod-service-page>
 *     <ng-container modServicePageGovbar>…</ng-container>
 *     <header modServicePageHeader class="sp-nav navigation-header">…</header>
 *     <nav modServicePageBreadcrumb class="breadcrumb">…</nav>
 *
 *     …service details (default slot, inside section.sp-details)…
 *
 *     <ng-container modServicePageAside>…</ng-container>
 *     <ng-container modServicePageRelated>…</ng-container>
 *     <ng-container modServicePageComments>…</ng-container>
 *     <ng-container modServicePageRating>…</ng-container>
 *     <ng-container modServicePageUseful>…</ng-container>
 *     <footer modServicePageFooter class="footer footer--dark sp-footer">…</footer>
 *   </mod-service-page>
 */
@Component({
  selector: 'mod-service-page',
  templateUrl: './service-page.html',
  styleUrl: './service-page.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'service-page' },
})
export class ModServicePage {
  /** Accessible name of the info sidebar. */
  readonly asideLabel = input('Service information');
  /** Accessible name of the related services section. */
  readonly relatedLabel = input('Related services');
  /** Accessible name of the rating bar. */
  readonly ratingLabel = input('Service rating');
  /** Accessible name of the page feedback bar. */
  readonly usefulLabel = input('Page feedback');

  protected readonly govbarSlot = contentChild(ModServicePageGovbar);
  protected readonly breadcrumbSlot = contentChild(ModServicePageBreadcrumb);
  protected readonly asideSlot = contentChild(ModServicePageAside);
  protected readonly relatedSlot = contentChild(ModServicePageRelated);
  protected readonly commentsSlot = contentChild(ModServicePageComments);
  protected readonly ratingSlot = contentChild(ModServicePageRating);
  protected readonly usefulSlot = contentChild(ModServicePageUseful);
}

/**
 * Horizontal scroll-snap carousel with page dots, used for the related
 * services cards. Project the cards (class `sp-card`) as content.
 */
@Component({
  selector: 'mod-service-page-carousel',
  template: `
    <div class="sp-cards" #track (scroll)="paint()"><ng-content /></div>
    <div class="sp-cards__dots" role="group" [attr.aria-label]="label() || null">
      @for (page of pages(); track page) {
        <button
          type="button"
          class="sp-cards__dot"
          [class.sp-cards__dot--active]="page === activePage()"
          [attr.aria-label]="pageLabel() + ' ' + (page + 1)"
          [attr.aria-current]="page === activePage() ? 'true' : null"
          (click)="goTo(page)"
        ></button>
      }
    </div>
  `,
  styleUrl: './service-page.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModServicePageCarousel {
  /** Accessible name of the dots group. */
  readonly label = input('Related services pages');
  /** Prefix of each dot's accessible name ("Go to page 2"). */
  readonly pageLabel = input('Go to page');

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly pageCount = signal(1);

  protected readonly activePage = signal(0);
  protected readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.refresh();
      const view = this.view;
      if (!view) return;
      const track = this.track().nativeElement;
      if (typeof view.ResizeObserver === 'function') {
        const observer = new view.ResizeObserver(() => this.refresh());
        observer.observe(track);
        for (const child of Array.from(track.children)) observer.observe(child);
        destroyRef.onDestroy(() => observer.disconnect());
      } else {
        const onResize = () => this.refresh();
        view.addEventListener('resize', onResize);
        destroyRef.onDestroy(() => view.removeEventListener('resize', onResize));
      }
    });
  }

  /** Recomputes the number of pages (call after changing the projected cards). */
  refresh(): void {
    const track = this.track().nativeElement;
    const width = Math.max(1, track.clientWidth);
    this.pageCount.set(Math.max(1, Math.ceil((track.scrollWidth - track.clientWidth) / width) + 1));
    this.paint();
  }

  /** Scrolls to the given zero-based page. */
  goTo(page: number): void {
    const track = this.track().nativeElement;
    const rtl = this.view?.getComputedStyle(track).direction === 'rtl';
    track.scrollTo({ left: page * track.clientWidth * (rtl ? -1 : 1), behavior: 'smooth' });
  }

  protected paint(): void {
    const track = this.track().nativeElement;
    const count = this.pageCount();
    const progress = Math.abs(track.scrollLeft) / Math.max(1, track.scrollWidth - track.clientWidth);
    this.activePage.set(Math.min(count - 1, Math.round(progress * (count - 1))));
  }
}
