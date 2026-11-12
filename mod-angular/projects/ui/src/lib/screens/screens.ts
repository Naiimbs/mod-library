import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export type ModScreenGridColumns = 1 | 2 | 3 | 4;
export type ModScreenPlaceholderSize = 'sm' | 'md' | 'lg';

/**
 * Screen template frame: a bordered preview surface with an optional header
 * bar and a content area.
 *
 *   <mod-screen dashboard>
 *     <img modScreenLogo src="logo.svg" alt="Portal" />
 *     <button modScreenActions mod-button size="small">Sign in</button>
 *     <mod-screen-grid [columns]="2">
 *       <mod-screen-placeholder size="sm" />
 *       <mod-screen-placeholder size="sm" />
 *       <mod-screen-placeholder size="lg" full />
 *     </mod-screen-grid>
 *   </mod-screen>
 *
 * Without projected `[modScreenLogo]` / `[modScreenActions]` content the
 * header shows the source's skeleton logo and avatar placeholders.
 */
@Component({
  selector: 'mod-screen',
  template: `
    @if (!hideHeader()) {
      <div class="screen-header">
        <ng-content select="[modScreenLogo]"><div class="screen-header__logo"></div></ng-content>
        <div class="screen-header__actions">
          <ng-content select="[modScreenActions]"><div class="screen-header__avatar"></div></ng-content>
        </div>
      </div>
    }
    <div class="screen-content"><ng-content /></div>
  `,
  styleUrl: './screens.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'screen-preview', '[class.screen-dashboard]': 'dashboard()' },
})
export class ModScreen {
  /** Fixed-height dashboard layout (header + clipped content). */
  readonly dashboard = input(false, { transform: booleanAttribute });
  /** Removes the header bar. */
  readonly hideHeader = input(false, { transform: booleanAttribute });
}

/** Grid of screen regions (`.screen-grid`), 1–4 equal columns. */
@Component({
  selector: 'mod-screen-grid',
  template: '<ng-content />',
  styleUrl: './screens.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
})
export class ModScreenGrid {
  readonly columns = input<ModScreenGridColumns>(1);

  protected readonly classes = computed(() => {
    const columns = this.columns();
    return columns > 1 ? `screen-grid screen-grid--${columns}` : 'screen-grid';
  });
}

/** Skeleton block standing in for a screen region (`.screen-placeholder`). */
@Component({
  selector: 'mod-screen-placeholder',
  template: '<ng-content />',
  styleUrl: './screens.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
})
export class ModScreenPlaceholder {
  readonly size = input<ModScreenPlaceholderSize>('sm');
  /** Spans every column of the parent grid. */
  readonly full = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(
    () =>
      `screen-placeholder screen-placeholder--${this.size()}${this.full() ? ' screen-placeholder--full' : ''}`,
  );
}
