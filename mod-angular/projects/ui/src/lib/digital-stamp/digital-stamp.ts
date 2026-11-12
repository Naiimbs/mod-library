import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';

export type ModDigitalStampExtension =
  | '.gov.sa'
  | '.edu.sa'
  | '.med.sa'
  | '.org.sa'
  | '.sch.sa'
  | '.sa';

interface ExtensionCopy {
  modifier: string;
  title: string;
  description: string;
}

/** English copy per domain extension, taken from the source design system. */
const EXTENSION_COPY: Record<ModDigitalStampExtension, ExtensionCopy> = {
  '.gov.sa': {
    modifier: '',
    title: 'Official Saudi Government websites URL ends with',
    description:
      'Website belongs to an official government organization in the Kingdom of Saudi Arabia always ends with .gov.sa.',
  },
  '.edu.sa': {
    modifier: 'digital-stamp--edu',
    title: 'Official Saudi educational websites URL ends with',
    description:
      'Website belongs to an official educational organization in the Kingdom of Saudi Arabia always ends with .edu.sa.',
  },
  '.med.sa': {
    modifier: 'digital-stamp--med',
    title: 'Official Saudi medical websites URL ends with',
    description:
      'Website belongs to an official medical organization in the Kingdom of Saudi Arabia always ends with .med.sa.',
  },
  '.org.sa': {
    modifier: 'digital-stamp--org',
    title: 'Official Saudi non-profit organizations websites URL ends with',
    description:
      'Website belongs to an official non-profit organization in the Kingdom of Saudi Arabia always ends with .org.sa.',
  },
  '.sch.sa': {
    modifier: 'digital-stamp--sch',
    title: 'Official Saudi school websites URL ends with',
    description:
      'Website belongs to an official school in the Kingdom of Saudi Arabia always ends with .sch.sa.',
  },
  '.sa': {
    modifier: 'digital-stamp--sa',
    title: 'Official Saudi authorities and initiatives websites URL ends with',
    description:
      'Website belongs to an official Saudi authority or initiative in the Kingdom of Saudi Arabia always ends with .sa.',
  },
};

let nextId = 0;

/**
 * DGA digital stamp — the bar at the top of a government site that explains
 * how the visitor can verify the site is official.
 *
 *   <mod-digital-stamp registrationNumber="20230103200" [(opened)]="open" />
 *
 * All copy defaults to English and is overridable through inputs; when
 * `domainTitle` / `domainDescription` are left empty they follow `extension`.
 */
@Component({
  selector: 'mod-digital-stamp',
  imports: [NgTemplateOutlet],
  templateUrl: './digital-stamp.html',
  styleUrl: './digital-stamp.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModDigitalStamp {
  /** Expanded state (two-way bindable). */
  readonly opened = model(false);
  /** Forces the mobile layout regardless of the viewport width. */
  readonly mobile = input(false, { transform: booleanAttribute });
  /** Domain extension the site is registered under. */
  readonly extension = input<ModDigitalStampExtension>('.gov.sa');

  readonly text = input('A government website registered with the Digital Government Authority.');
  readonly toggleLabel = input('How you know?');
  /** Title of the domain card. Empty = English default for `extension`. */
  readonly domainTitle = input('');
  /** Description of the domain card. Empty = English default for `extension`. */
  readonly domainDescription = input('');
  readonly httpsTitle = input('Official Secure websites use');
  readonly httpsTag = input('HTTPS');
  readonly httpsDescription = input('Ensure the website is using the HTTPS protocol.');
  readonly registrationLabel = input('Registered on Digital Government Authority:');
  /** Registration number shown as a link. The row is hidden when empty. */
  readonly registrationNumber = input('');
  /** Link target of the registration number. */
  readonly registrationHref = input('');

  protected readonly detailsId = `mod-digital-stamp-${nextId++}`;

  protected readonly classes = computed(() => {
    const list = ['digital-stamp'];
    if (this.mobile()) list.push('digital-stamp--mobile');
    if (this.opened()) list.push('digital-stamp--opened');
    const modifier = EXTENSION_COPY[this.extension()].modifier;
    if (modifier) list.push(modifier);
    return list.join(' ');
  });

  protected readonly resolvedDomainTitle = computed(
    () => this.domainTitle() || EXTENSION_COPY[this.extension()].title,
  );

  protected readonly resolvedDomainDescription = computed(
    () => this.domainDescription() || EXTENSION_COPY[this.extension()].description,
  );

  /** Toggles the expanded state. */
  toggle(): void {
    this.opened.update((value) => !value);
  }

  /** Expands the stamp. */
  open(): void {
    this.opened.set(true);
  }

  /** Collapses the stamp. */
  close(): void {
    this.opened.set(false);
  }
}
