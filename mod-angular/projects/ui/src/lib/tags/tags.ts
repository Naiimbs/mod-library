import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export type ModTagVariant = 'neutral' | 'success' | 'error' | 'warning' | 'info' | 'on-color';
export type ModTagSize = 'md' | 'sm' | 'xs';

/**
 * DGA tag — a non-interactive label.
 *
 *   <mod-tag variant="success">Approved</mod-tag>
 *   <mod-tag variant="info" icon="information-circle">Info</mod-tag>
 *   <mod-tag iconOnly icon="tag-01" aria-label="Tagged" />
 *
 * `icon` / `trailingIcon` take a font icon name without the `dga-icon-`
 * prefix. Inline SVG icons can be projected instead, wrapped in
 * `<span class="tag__icon">`.
 */
@Component({
  selector: 'mod-tag',
  template: `
    @if (icon(); as name) {
      <span class="tag__icon" [class]="'dga-icon-' + name" aria-hidden="true"></span>
    }
    <ng-content />
    @if (trailingIcon(); as name) {
      <span class="tag__icon" [class]="'dga-icon-' + name" aria-hidden="true"></span>
    }
  `,
  styleUrl: './tags.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
})
export class ModTag {
  readonly variant = input<ModTagVariant>('neutral');
  readonly size = input<ModTagSize>('sm');
  /** Transparent background, border only. */
  readonly outline = input(false, { transform: booleanAttribute });
  /** Fully rounded (pill) shape. */
  readonly rounded = input(false, { transform: booleanAttribute });
  /** Square tag that contains only an icon. Provide an aria-label. */
  readonly iconOnly = input(false, { transform: booleanAttribute });
  /** Leading font icon name (without the `dga-icon-` prefix). */
  readonly icon = input<string>('');
  /** Trailing font icon name (without the `dga-icon-` prefix). */
  readonly trailingIcon = input<string>('');

  protected readonly classes = computed(() => {
    const size = this.size();
    const list = ['tag', `tag--${this.variant()}`];
    if (size !== 'sm') list.push(`tag--${size}`);
    if (this.outline()) list.push('tag--outline');
    if (this.rounded()) list.push('tag--rounded');
    if (this.iconOnly()) list.push('tag--icon-only');
    return list.join(' ');
  });
}
