import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { ModButton } from '../button/button';

export type ModSecondNavHeaderVariant = 'gray' | 'primary';

/** Contextual info item (icon + text) on the leading side. */
export interface ModSecondNavHeaderItem {
  id?: string;
  label: string;
  /** Icon name without the `dga-icon-` prefix. */
  icon?: string;
}

/** Icon-only action button on the trailing side. */
export interface ModSecondNavHeaderAction {
  id?: string;
  /** Accessible name of the icon button. */
  label: string;
  /** Icon name without the `dga-icon-` prefix. */
  icon: string;
  disabled?: boolean;
  /** Toggle state (sets aria-pressed). */
  selected?: boolean;
}

/**
 * DGA second nav header: 40px bar with contextual info and icon actions.
 *
 *   <mod-second-nav-header variant="gray" [items]="info" [actions]="tools"
 *                          (actionSelect)="run($event)" />
 *
 * Extra content can be projected: default content goes after the info items,
 * elements marked `modSecondNavHeaderAction` go after the action buttons.
 */
@Component({
  selector: 'mod-second-nav-header',
  imports: [ModButton],
  template: `
    <div
      class="second-nav-header"
      [class.second-nav-header--gray]="variant() === 'gray'"
      [class.second-nav-header--primary]="variant() === 'primary'"
    >
      <div class="second-nav-header__content">
        @for (item of items(); track item.id ?? item.label) {
          <div class="second-nav-header__item">
            @if (item.icon) {
              <span
                class="second-nav-header__item-icon icon dga-icon-{{ item.icon }}"
                aria-hidden="true"
              ></span>
            }
            <span class="second-nav-header__item-text">{{ item.label }}</span>
          </div>
        }
        <ng-content />
      </div>
      <div class="second-nav-header__actions">
        @for (action of actions(); track action.id ?? action.label) {
          <button
            mod-button
            type="button"
            variant="subtle"
            size="medium"
            iconOnly
            [onColor]="variant() === 'primary'"
            [selected]="!!action.selected"
            [disabled]="!!action.disabled"
            [attr.aria-label]="action.label"
            (click)="actionSelect.emit(action)"
          >
            <span class="icon dga-icon-{{ action.icon }}" aria-hidden="true"></span>
          </button>
        }
        <ng-content select="[modSecondNavHeaderAction]" />
      </div>
      @if (divider()) {
        <div class="second-nav-header__divider"></div>
      }
    </div>
  `,
  styleUrl: './second-nav-header.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModSecondNavHeader {
  readonly variant = input<ModSecondNavHeaderVariant>('gray');
  readonly items = input<ModSecondNavHeaderItem[]>([]);
  readonly actions = input<ModSecondNavHeaderAction[]>([]);
  /** 1px line along the bottom edge. */
  readonly divider = input(true, { transform: booleanAttribute });

  readonly actionSelect = output<ModSecondNavHeaderAction>();
}
