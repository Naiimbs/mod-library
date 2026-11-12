import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { ModButton } from '../button/button';

export interface ModFooterLink {
  id?: string;
  label: string;
  /** Plain href. When omitted the click is not navigated, only emitted. */
  href?: string;
  /** Opens the link in a new tab. */
  external?: boolean;
}

/** A column of links with a heading. */
export interface ModFooterGroup {
  label: string;
  links: ModFooterLink[];
}

/** Icon button in the social media / accessibility tools rows. */
export interface ModFooterIconAction {
  id?: string;
  /** Accessible name of the icon button. */
  label: string;
  /** Icon name without the `dga-icon-` prefix. */
  icon: string;
  /** Renders an anchor that opens in a new tab instead of a button. */
  href?: string;
}

/** Logo in the legal row. Without `src` the placeholder glyph is shown. */
export interface ModFooterLogo {
  src?: string;
  /** Alt text for `src`. */
  alt?: string;
  /** Image height in px (default 32). */
  height?: number;
  /** Caption next to the placeholder glyph. */
  text?: string;
}

/**
 * DGA footer: link groups, social media and accessibility icon rows, legal
 * links, copyright caption and logos. Light (gray) or dark green.
 *
 *   <mod-footer [groups]="groups" [socialLinks]="social" [legalLinks]="legal"
 *               legalCaption="All rights reserved © 2026" (linkSelect)="go($event)" />
 *
 * Slots: default content is appended to the link-group row (use
 * `<div class="footer__group">`), elements marked `modFooterLogo` are appended
 * to the logos row.
 */
@Component({
  selector: 'mod-footer',
  imports: [ModButton, NgTemplateOutlet],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModFooter {
  /** Dark green background variant. */
  readonly dark = input(false, { transform: booleanAttribute });
  /** Force the <600px layout regardless of viewport width. */
  readonly mobilePreview = input(false, { transform: booleanAttribute });

  readonly groups = input<ModFooterGroup[]>([]);
  readonly socialTitle = input('Social Media');
  readonly socialLinks = input<ModFooterIconAction[]>([]);
  readonly accessibilityTitle = input('Accessibility Tools');
  readonly accessibilityTools = input<ModFooterIconAction[]>([]);
  /** Underlined links row above the caption. */
  readonly legalLinks = input<ModFooterLink[]>([]);
  /** Copyright line. */
  readonly legalCaption = input('');
  /** Links under the caption (terms, privacy…). */
  readonly extraLinks = input<ModFooterLink[]>([]);
  readonly logos = input<ModFooterLogo[]>([]);
  /** Accessible name of the footer landmark. */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Any text link (group, legal or extra) was activated. */
  readonly linkSelect = output<ModFooterLink>();
  /** A social media or accessibility icon button was activated. */
  readonly actionSelect = output<ModFooterIconAction>();

  protected readonly hasExtra = computed(
    () => this.socialLinks().length > 0 || this.accessibilityTools().length > 0,
  );

  protected onLink(link: ModFooterLink, event: Event): void {
    if (!link.href) event.preventDefault();
    this.linkSelect.emit(link);
  }
}
