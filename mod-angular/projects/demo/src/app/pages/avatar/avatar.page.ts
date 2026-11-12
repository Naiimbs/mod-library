import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModAvatar, ModAvatarGroup, ModAvatarSize, ModAvatarType } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

const DEMO_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 68 68'%3E%3Crect width='68' height='68' fill='%230fad68'/%3E%3Ccircle cx='34' cy='26' r='12' fill='%23ebfaf3'/%3E%3Cellipse cx='34' cy='58' rx='21' ry='16' fill='%23ebfaf3'/%3E%3C/svg%3E";

@Component({
  selector: 'demo-avatar-page',
  imports: [ModAvatar, ModAvatarGroup, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Avatar</h1>
      <p class="content-description">
        Avatars represent a person or entity as an image, initials, or an icon. Seven sizes, circular or square shape,
        an optional inner border ring, and avatar groups with spaced or stacked layouts. Ported from the DGA library's
        <code>nds-avatar</code> and <code>mod-avatar-group</code> components.
      </p>
    </div>

    <demo-live
      heading="Avatar"
      description="Use the image type when a photo exists, initials as the fallback, and the icon type for anonymous or system entities."
    >
      @if (group()) {
        <mod-avatar-group [stacked]="stacked()" [overflow]="5" [size]="size()">
          @for (initials of groupInitials; track initials) {
            <mod-avatar
              [size]="size()"
              [src]="type() === 'image' ? img : ''"
              alt="Sample user photo"
              [initials]="type() === 'text' ? initials : ''"
              [square]="square()"
              [bordered]="border()"
            />
          }
        </mod-avatar-group>
      } @else {
        <mod-avatar
          [size]="size()"
          [src]="type() === 'image' ? img : ''"
          alt="Sample user photo"
          [initials]="type() === 'text' ? 'am' : ''"
          [square]="square()"
          [bordered]="border()"
        />
      }

      <demo-select label="Type" [options]="types" [(value)]="type" />
      <demo-select label="Size" [options]="sizes" [(value)]="size" />
      <demo-switch label="Square" [(checked)]="square" />
      <demo-switch label="Border ring" [(checked)]="border" />
      <demo-switch label="Group" [checked]="group()" (checkedChange)="setGroup($event)" />
      <demo-switch label="Stacked group" [checked]="stacked()" (checkedChange)="setStacked($event)" />
    </demo-live>

    <demo-props
      description="Inputs of mod-avatar and mod-avatar-group. The avatar type is derived from the inputs: src renders an image, otherwise initials render text, otherwise the icon is shown. Enabling Stacked group in the live demo also enables Group."
      [props]="props"
    />

    <demo-showcase
      heading="Sizes"
      description="Seven sizes from 120px to 24px. Initials and icons scale with the container; the 120 size thickens its outer border to 4px."
    >
      <div class="showcase-row" style="align-items: flex-end;">
        @for (s of sizes; track s.value) {
          <mod-avatar initials="sa" [size]="s.value" />
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Types"
      description="Image avatars cover-fit their photo; text avatars show uppercase initials; icon avatars use a glyph for anonymous or system entities."
    >
      <div class="showcase-row" style="align-items: flex-end;">
        <mod-avatar [src]="img" alt="Sample user photo" [size]="68" />
        <mod-avatar initials="am" [size]="68" />
        <mod-avatar icon="user" [size]="68" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Shape & Border Ring"
      description="The square modifier switches to an 8px radius. The border modifier adds a subtle inner ring that keeps light photos separated from light backgrounds."
    >
      <div class="showcase-row" style="align-items: flex-end;">
        <mod-avatar initials="am" [size]="68" />
        <mod-avatar initials="am" [size]="68" bordered />
        <mod-avatar initials="am" [size]="68" square />
        <mod-avatar initials="am" [size]="68" square bordered />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Avatar Group"
      description='Groups lay avatars in a row with a 4px gap, or stack them with a -10px overlap. End the group with a "+N" counter for overflow.'
    >
      <div class="showcase-row">
        <mod-avatar-group>
          <mod-avatar initials="am" [size]="40" />
          <mod-avatar initials="sk" [size]="40" />
          <mod-avatar icon="user" [size]="40" />
        </mod-avatar-group>
        <span class="showcase-label" style="width:auto;margin:0;">Spaced</span>
      </div>
      <div class="showcase-row">
        <mod-avatar-group stacked [overflow]="5" [size]="40">
          <mod-avatar initials="am" [size]="40" />
          <mod-avatar initials="sk" [size]="40" />
          <mod-avatar initials="rh" [size]="40" />
        </mod-avatar-group>
        <span class="showcase-label" style="width:auto;margin:0;">Stacked with overflow counter</span>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="Stacked groups overlap toward the reading direction using logical margins."
    >
      <div class="showcase-row" dir="rtl" lang="ar">
        <mod-avatar-group stacked [overflow]="3" [size]="40">
          <mod-avatar initials="أح" [size]="40" />
          <mod-avatar initials="مد" [size]="40" />
        </mod-avatar-group>
      </div>
    </demo-showcase>
  `,
})
export class AvatarPage {
  protected readonly img = DEMO_IMG;
  protected readonly groupInitials = ['am', 'sk', 'rh'];

  protected readonly types: DemoOption<ModAvatarType>[] = [
    { value: 'text', label: 'Text (initials)' },
    { value: 'icon', label: 'Icon' },
    { value: 'image', label: 'Image' },
  ];
  protected readonly sizes: DemoOption<ModAvatarSize>[] = ([120, 80, 68, 48, 40, 32, 24] as const).map((value) => ({
    value,
    label: String(value),
  }));

  protected readonly type = signal<ModAvatarType>('text');
  protected readonly size = signal<ModAvatarSize>(48);
  protected readonly square = signal(false);
  protected readonly border = signal(false);
  protected readonly group = signal(false);
  protected readonly stacked = signal(false);

  // Stacked implies group; turning group off turns stacked off (as in the original demo).
  protected setGroup(on: boolean): void {
    this.group.set(on);
    if (!on) this.stacked.set(false);
  }

  protected setStacked(on: boolean): void {
    this.stacked.set(on);
    if (on) this.group.set(true);
  }

  protected readonly props: DemoProp[] = [
    { name: 'size', type: '120 | 80 | 68 | 48 | 40 | 32 | 24', default: '48', description: 'mod-avatar. Diameter in pixels.' },
    { name: 'src', type: 'string', default: "''", description: 'mod-avatar. Image URL. When set the avatar renders the image (cover-fit).' },
    { name: 'alt', type: 'string', default: "''", description: 'mod-avatar. Alternative text for the image.' },
    { name: 'initials', type: 'string', default: "''", description: 'mod-avatar. Initials (rendered uppercase) when there is no image.' },
    { name: 'icon', type: 'string', default: "'user'", description: 'mod-avatar. Icon name without the dga-icon- prefix, used when there is no image or initials.' },
    { name: 'square', type: 'boolean', default: 'false', description: 'mod-avatar. Rounded-square shape (8px radius) instead of a circle.' },
    { name: 'bordered', type: 'boolean', default: 'false', description: 'mod-avatar. Subtle inner border ring.' },
    { name: 'label', type: 'string', default: "''", description: "mod-avatar. Accessible name for text and icon avatars (e.g. the person's full name)." },
    { name: 'stacked', type: 'boolean', default: 'false', description: 'mod-avatar-group. Overlaps the avatars by -10px instead of the 4px gap.' },
    { name: 'overflow', type: 'number', default: '0', description: 'mod-avatar-group. Number shown in the "+N" counter. 0 hides it.' },
    { name: 'size', type: '120 | 80 | 68 | 48 | 40 | 32 | 24', default: '40', description: 'mod-avatar-group. Size of the "+N" counter; match the projected avatars.' },
    { name: 'label', type: 'string', default: "''", description: 'mod-avatar-group. Accessible name for the group.' },
    { name: 'overflowLabel', type: 'string', default: "''", description: 'mod-avatar-group. Accessible name for the "+N" counter, e.g. "5 more members".' },
  ];
}
