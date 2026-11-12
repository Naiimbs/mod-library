import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

export type ModAvatarSize = 120 | 80 | 68 | 48 | 40 | 32 | 24;
export type ModAvatarType = 'image' | 'text' | 'icon';

function toAvatarSize(value: unknown): ModAvatarSize {
  const n = numberAttribute(value, 48);
  const sizes: readonly ModAvatarSize[] = [120, 80, 68, 48, 40, 32, 24];
  return sizes.find((s) => s === n) ?? 48;
}

/**
 * DGA avatar. The content type is derived from the inputs: `src` renders an
 * image, otherwise `initials` renders text, otherwise the icon is shown.
 *
 *   <mod-avatar src="/me.png" alt="Sara Ahmed" size="68" />
 *   <mod-avatar initials="sa" size="40" bordered />
 *   <mod-avatar icon="user" square />
 */
@Component({
  selector: 'mod-avatar',
  template: `
    @switch (type()) {
      @case ('image') {
        <img [src]="src()" [alt]="alt()" />
      }
      @case ('text') {
        <span class="avatar__text" [attr.aria-hidden]="label() ? 'true' : null">{{ initials() }}</span>
      }
      @default {
        <span class="avatar__icon"><span [class]="'icon dga-icon-' + icon()" aria-hidden="true"></span></span>
      }
    }
  `,
  styleUrl: './avatar.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'hostRole()',
    '[attr.aria-label]': 'hostLabel()',
  },
})
export class ModAvatar {
  /** Diameter in pixels: 120, 80, 68, 48, 40, 32 or 24. */
  readonly size = input(48 as ModAvatarSize, { transform: toAvatarSize });
  /** Image URL. When set the avatar renders the image. */
  readonly src = input<string>('');
  /** Alternative text for the image. */
  readonly alt = input<string>('');
  /** Initials (rendered uppercase) when there is no image. */
  readonly initials = input<string>('');
  /** Icon name without the `dga-icon-` prefix, used when there is no image or initials. */
  readonly icon = input<string>('user');
  /** Rounded-square shape instead of a circle. */
  readonly square = input(false, { transform: booleanAttribute });
  /** Subtle inner ring. */
  readonly bordered = input(false, { transform: booleanAttribute });
  /** Accessible name for text and icon avatars (e.g. the person's full name). */
  readonly label = input<string>('');

  protected readonly type = computed<ModAvatarType>(() =>
    this.src() ? 'image' : this.initials() ? 'text' : 'icon',
  );

  protected readonly classes = computed(() => {
    const list = ['avatar', `avatar--${this.type()}`, `avatar--${this.size()}`];
    if (this.square()) list.push('avatar--square');
    if (this.bordered()) list.push('avatar--border');
    return list.join(' ');
  });

  protected readonly hostRole = computed(() =>
    this.type() !== 'image' && this.label() ? 'img' : null,
  );
  protected readonly hostLabel = computed(() =>
    this.type() !== 'image' && this.label() ? this.label() : null,
  );
}

/**
 * Group of avatars, optionally stacked (overlapping), with an optional
 * "+N" overflow chip.
 *
 *   <mod-avatar-group stacked [overflow]="5" size="40">
 *     <mod-avatar initials="am" size="40" />
 *     <mod-avatar initials="sk" size="40" />
 *   </mod-avatar-group>
 */
@Component({
  selector: 'mod-avatar-group',
  template: `
    <ng-content />
    @if (overflow() > 0) {
      <span
        [class]="'avatar avatar--text avatar--' + size() + ' avatar-group__more'"
        [attr.role]="overflowLabel() ? 'img' : null"
        [attr.aria-label]="overflowLabel() || null"
      >
        <span class="avatar__text">+{{ overflow() }}</span>
      </span>
    }
  `,
  styleUrl: './avatar.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'stacked() ? "avatar-group avatar-group--stacked" : "avatar-group"',
    '[attr.role]': 'label() ? "group" : null',
    '[attr.aria-label]': 'label() || null',
  },
})
export class ModAvatarGroup {
  /** Overlap the avatars. */
  readonly stacked = input(false, { transform: booleanAttribute });
  /** Number shown in the "+N" chip. 0 hides the chip. */
  readonly overflow = input(0, { transform: numberAttribute });
  /** Size of the "+N" chip; match the size of the projected avatars. */
  readonly size = input(40 as ModAvatarSize, { transform: toAvatarSize });
  /** Accessible name for the group. */
  readonly label = input<string>('');
  /** Accessible name for the "+N" chip, e.g. "5 more members". */
  readonly overflowLabel = input<string>('');
}
