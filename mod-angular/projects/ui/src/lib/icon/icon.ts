import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

export type ModIconStyle = 'stroke' | 'solid' | 'bulk' | 'duotone' | 'twotone';

/**
 * DGA font icon. Requires the icon stylesheet (`@mod-internal/ui/styles/icons.css`)
 * in the application's global styles.
 *
 *   <mod-icon name="menu-01" />
 *   <mod-icon name="search-01" size="20" label="Search" />
 *   <mod-icon name="star" variant="solid" />
 *
 * `name` is the icon name without the `dga-icon-` prefix.
 */
@Component({
  selector: 'mod-icon',
  template: '',
  styles: `
    mod-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      flex-shrink: 0;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[style.font-size.px]': 'size()',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
})
export class ModIcon {
  /** Icon name without the `dga-icon-` prefix, e.g. `menu-01`. */
  readonly name = input.required<string>();
  /** Icon style variant. Omit for the default stroke style. */
  readonly variant = input<ModIconStyle | undefined>(undefined);
  /** Older name of `variant`; used when `variant` is not set. */
  readonly iconStyle = input<ModIconStyle | undefined>(undefined);
  /** Size in pixels (`size="24"` or `[size]="24"`). Omit to inherit the surrounding font size. */
  readonly size = input<number | undefined, unknown>(undefined, {
    transform: (value) => (value === undefined || value === null || value === '' ? undefined : numberAttribute(value)),
  });
  /** Accessible label. When omitted the icon is hidden from assistive tech. */
  readonly label = input<string>('');

  protected readonly classes = computed(() => {
    const style = this.variant() ?? this.iconStyle();
    return `icon dga-icon-${this.name()}${style ? ` ${style} rounded` : ''}`;
  });
}
