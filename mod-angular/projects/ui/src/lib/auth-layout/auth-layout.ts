import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { ModIcon } from '../icon/icon';

export type ModAuthLayoutVariant = 'split' | 'centered';
export type ModAuthHeaderAlign = 'center' | 'start';

/** Angles (degrees) of the icon nodes and of the dots on the brand-panel ring. */
const NODE_ANGLES = [-43, -24, -9];
const DOT_ANGLES = [-52, -33, -2];

/** Marks the logo of a `<mod-auth-layout>` (top start corner). */
@Directive({ selector: '[modAuthLogo]' })
export class ModAuthLogo {}

/** Marks top-end actions of a `<mod-auth-layout>`, e.g. the language switch. */
@Directive({ selector: '[modAuthActions]' })
export class ModAuthActions {}

/** Marks the footer line of a `<mod-auth-layout>`, e.g. the copyright. */
@Directive({ selector: '[modAuthFooter]' })
export class ModAuthFooter {}

/** Marks extra content shown under the text of the brand panel (split variant). */
@Directive({ selector: '[modAuthPanel]' })
export class ModAuthPanel {}

/**
 * Page layout for sign-in, sign-up, verification and password pages.
 *
 *   <mod-auth-layout
 *     panelImage="assets/facility.jpg"
 *     panelTitle="Referral system"
 *     panelText="One path between hospitals."
 *     [panelIcons]="['medical-file', 'hospital-bed-01', 'patient']"
 *   >
 *     <img modAuthLogo src="assets/logo.png" alt="Ministry of Defense" />
 *     <button modAuthActions mod-button variant="secondary-outline" size="medium">عربي</button>
 *
 *     <mod-auth-header heading="Sign in" description="Enter your user name and password" underline />
 *     …form…
 *
 *     <span modAuthFooter>© Ministry of Defense 2026</span>
 *   </mod-auth-layout>
 *
 * `variant="split"` (default) shows the form next to a brand panel: a photo
 * under a dark-green tint, an optional ring of process icons, a title and one
 * line of text. `variant="centered"` shows only the form, centred on the page.
 * The panel moves above the form on narrow containers.
 *
 * The layout fills the viewport height; set the `--mod-auth-min-height` CSS
 * variable on the element to embed it in a smaller area.
 */
@Component({
  selector: 'mod-auth-layout',
  imports: [ModIcon],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModAuthLayout {
  readonly variant = input<ModAuthLayoutVariant>('split');
  /** Puts the brand panel on the start side instead of the end side. */
  readonly panelStart = input(false, { transform: booleanAttribute });
  /** Draws the form area as a bordered card (useful with `variant="centered"`). */
  readonly card = input(false, { transform: booleanAttribute });
  /** Flat gray page background behind the form area instead of the white gradient (pairs with `card`). */
  readonly muted = input(false, { transform: booleanAttribute });

  /** Brand panel photo. Decorative: it is hidden from assistive technology. */
  readonly panelImage = input('');
  /** CSS `object-position` of the photo. */
  readonly panelImagePosition = input('50% 40%');
  readonly panelTitle = input('');
  readonly panelText = input('');
  /** Up to three icon names (without the `dga-icon-` prefix) placed on the ring. Empty hides the ring. */
  readonly panelIcons = input<readonly string[]>([]);

  protected readonly classes = computed(() => {
    const list = ['auth-layout', `auth-layout--${this.variant()}`];
    if (this.panelStart()) list.push('auth-layout--panel-start');
    if (this.card()) list.push('auth-layout--card');
    if (this.muted()) list.push('auth-layout--muted');
    return list.join(' ');
  });

  protected readonly nodes = computed(() =>
    this.panelIcons()
      .slice(0, NODE_ANGLES.length)
      .map((icon, index) => ({ icon, angle: `${NODE_ANGLES[index]}deg` })),
  );

  protected readonly dots = DOT_ANGLES.map((angle) => `${angle}deg`);
}

/**
 * Heading block of an auth page: optional featured icon, title and one line
 * of supporting text.
 *
 *   <mod-auth-header icon="mail-01" heading="Check your email" description="We sent a code to name@mod.gov.sa" />
 */
@Component({
  selector: 'mod-auth-header',
  imports: [ModIcon],
  template: `
    @if (icon()) {
      <span class="auth-header__icon" aria-hidden="true">
        <mod-icon [name]="icon()" />
      </span>
    }
    @switch (level()) {
      @case (2) {
        <h2 class="auth-header__title" [class.auth-header__title--underline]="underline()">{{ heading() }}</h2>
      }
      @case (3) {
        <h3 class="auth-header__title" [class.auth-header__title--underline]="underline()">{{ heading() }}</h3>
      }
      @default {
        <h1 class="auth-header__title" [class.auth-header__title--underline]="underline()">{{ heading() }}</h1>
      }
    }
    @if (description()) {
      <p class="auth-header__text">{{ description() }}</p>
    }
    <ng-content />
  `,
  styleUrl: './auth-layout.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'auth-header',
    '[class.auth-header--start]': 'align() === "start"',
  },
})
export class ModAuthHeader {
  readonly heading = input.required<string>();
  /**
   * Heading level of the title. 1 (default) for a standalone auth page; use 2
   * or 3 when the page or dialog around it already has an h1.
   */
  readonly level = input<1 | 2 | 3>(1);
  readonly description = input('');
  /** Featured icon name without the `dga-icon-` prefix. */
  readonly icon = input('');
  readonly align = input<ModAuthHeaderAlign>('center');
  /** Short green rule under the title. */
  readonly underline = input(false, { transform: booleanAttribute });
}
