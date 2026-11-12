import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { FontIconsView } from './font-icons.view';
import { LibraryIconsView } from './library-icons.view';

/**
 * Icons page: two collections behind tabs — the DGA icon font and the full SVG icon
 * library — sharing one copy toast. Both views stay mounted (the inactive one is hidden
 * with CSS), as on the original page, so each keeps its search / scroll state.
 */
@Component({
  selector: 'demo-icons-page',
  imports: [FontIconsView, LibraryIconsView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './icons.page.css',
  host: { style: 'display: block' },
  template: `
    <!-- Collection tabs: DGA icon font vs. full SVG library -->
    <div class="icons-collection-tabs" role="tablist" aria-label="Icon collections">
      <button
        type="button"
        id="icons-tab-font"
        class="icons-collection-tab"
        role="tab"
        [class.active]="!library()"
        [attr.aria-selected]="!library()"
        (click)="library.set(false)"
      >
        DGA Font Icons
      </button>
      <button
        type="button"
        id="icons-tab-library"
        class="icons-collection-tab"
        role="tab"
        [class.active]="library()"
        [attr.aria-selected]="library()"
        (click)="library.set(true)"
      >
        Icon Library
        <span class="icons-collection-tab-count">4,378</span>
      </button>
    </div>

    <demo-font-icons [class.icons-view-hidden]="library()" (toast)="showToast($event)" />
    <demo-library-icons [class.icons-view-hidden]="!library()" (toast)="showToast($event)" />

    <!-- Copy Toast -->
    <div id="icons-copy-toast" class="icons-copy-toast" [class.is-visible]="toastVisible()" aria-live="polite">
      {{ toastText() }}
    </div>
  `,
})
export class IconsPage {
  protected readonly library = signal(false);

  protected readonly toastText = signal('Copied to clipboard!');
  protected readonly toastVisible = signal(false);
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.toastTimer));
  }

  protected showToast(message: string): void {
    this.toastText.set(message);
    this.toastVisible.set(true);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 2000);
  }
}
