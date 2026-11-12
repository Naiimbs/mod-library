import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

export type ModStatusTagVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error';
export type ModStatusTagSize = 'md' | 'sm' | 'xs';
export type ModStatusTagAppearance = 'subtle' | 'inverted' | 'ghost';

/**
 * DGA status tag — a dot plus a label that communicates a status.
 *
 *   <mod-status-tag variant="success">Active</mod-status-tag>
 *   <mod-status-tag variant="error" appearance="inverted" size="sm">Rejected</mod-status-tag>
 *
 * Colour alone does not convey the status to assistive tech: use a
 * self-explanatory label, or set `statusLabel` to add screen-reader-only
 * text before the label (e.g. "Status:").
 */
@Component({
  selector: 'mod-status-tag',
  template: `
    <span class="status-tag__dot" aria-hidden="true"></span>
    <span class="status-tag__label">
      @if (statusLabel(); as sr) {
        <span class="status-tag__sr-only">{{ sr }} </span>
      }
      <ng-content />
    </span>
  `,
  styleUrl: './status-tag.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
})
export class ModStatusTag {
  readonly variant = input<ModStatusTagVariant>('neutral');
  readonly size = input<ModStatusTagSize>('md');
  /** Visual style: light background, solid background or no background. */
  readonly appearance = input<ModStatusTagAppearance>('subtle');
  /** Optional screen-reader-only prefix for the label. */
  readonly statusLabel = input<string>('');

  protected readonly classes = computed(
    () =>
      `status-tag status-tag--${this.size()} status-tag--${this.appearance()} status-tag--${this.variant()}`,
  );
}
