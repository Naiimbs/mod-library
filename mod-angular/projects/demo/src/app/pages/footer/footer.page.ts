import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModFooter, ModFooterGroup, ModFooterIconAction, ModFooterLink, ModFooterLogo } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type Lang = 'en' | 'ar';

interface FooterContent {
  groups: ModFooterGroup[];
  socialTitle: string;
  social: ModFooterIconAction[];
  accessibilityTitle: string;
  accessibility: ModFooterIconAction[];
  legalLinks: ModFooterLink[];
  caption: string;
  extraLinks: ModFooterLink[];
  logos: ModFooterLogo[];
}

const LABELS = {
  en: {
    group: 'Group Label',
    link: 'Footer Link',
    socialTitle: 'Social Media',
    accessibilityTitle: 'Accessibility Tools',
    legalCaption: 'All Right Reserved For Digital Government Authority © 2024',
    terms: 'Terms and Conditions',
    privacy: 'Privacy Policy',
    logoText: 'Platform Logo',
    tools: ['Increase font size', 'High contrast', 'Screen reader'],
  },
  ar: {
    group: 'عنوان مجموعة',
    link: 'رابط الجزء السفلي',
    socialTitle: 'تواصل معنا',
    accessibilityTitle: 'أدوات الاتاحة والوصول',
    legalCaption: 'جميع الحقوق محفوظة لهيئة الحكومة الرقمية © 2024',
    terms: 'الشروط والأحكام',
    privacy: 'سياسة الخصوصية',
    logoText: 'شعار المنصة',
    tools: ['تكبير الخط', 'تباين عالي', 'قارئ الشاشة'],
  },
};

function links(label: string, count: number): ModFooterLink[] {
  return Array.from({ length: count }, () => ({ label }));
}

function content(lang: Lang, legalCount = 8): FooterContent {
  const t = LABELS[lang];
  return {
    groups: Array.from({ length: 5 }, () => ({ label: t.group, links: links(t.link, 5) })),
    socialTitle: t.socialTitle,
    social: [
      { label: 'X (Twitter)', icon: 'new-twitter' },
      { label: 'Instagram', icon: 'instagram' },
      { label: 'YouTube', icon: 'youtube' },
      { label: 'LinkedIn', icon: 'linkedin-01' },
    ],
    accessibilityTitle: t.accessibilityTitle,
    accessibility: [
      { label: t.tools[0], icon: 'text-font' },
      { label: t.tools[1], icon: 'eye' },
      { label: t.tools[2], icon: 'view' },
    ],
    legalLinks: links(t.link, legalCount),
    caption: t.legalCaption,
    extraLinks: [{ label: t.terms }, { label: t.privacy }],
    logos: [{ text: t.logoText }, { text: t.logoText }],
  };
}

@Component({
  selector: 'demo-footer-page',
  imports: [ModFooter, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Footer</h1>
      <p class="content-description">
        A footer serves several functions, including providing navigation, housing links to important
        information, offering contact details, and sometimes integrating social media icons and accessibility
        tools. Supports Default and Dark Green backgrounds, LTR/RTL layouts, and responsive breakpoints.
      </p>
    </div>

    <demo-live
      heading="Footer"
      description="Configure the footer appearance and sections."
      align="stretch"
      [rtl]="rtl()"
    >
      <div style="width: 100%;">
        <mod-footer
          [dark]="background() === 'dark'"
          [groups]="navLinks() ? live().groups : []"
          [socialTitle]="live().socialTitle"
          [socialLinks]="navLinks() && socialMedia() ? live().social : []"
          [accessibilityTitle]="live().accessibilityTitle"
          [accessibilityTools]="navLinks() && accessibility() ? live().accessibility : []"
          [legalLinks]="legalLinks() ? live().legalLinks : []"
          [legalCaption]="live().caption"
          [extraLinks]="live().extraLinks"
          [logos]="logos() ? live().logos : []"
        />
      </div>

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Background" [options]="backgrounds" [(value)]="background" />
      <demo-switch label="Nav Links" [(checked)]="navLinks" />
      <demo-switch label="Social Media" [(checked)]="socialMedia" />
      <demo-switch label="Accessibility" [(checked)]="accessibility" />
      <demo-switch label="Legal Links" [(checked)]="legalLinks" />
      <demo-switch label="Logos" [(checked)]="logos" />
    </demo-live>

    <demo-props heading="Props" [props]="props" />

    <demo-showcase
      heading="Default (LTR)"
      description="backgroundColor: Default, rtl: false, breakpoint: 600+"
      align="stretch"
    >
      <div style="width: 100%;">
        <mod-footer
          [groups]="en.groups"
          [socialTitle]="en.socialTitle"
          [socialLinks]="en.social"
          [accessibilityTitle]="en.accessibilityTitle"
          [accessibilityTools]="en.accessibility"
          [legalLinks]="en.legalLinks"
          [legalCaption]="en.caption"
          [extraLinks]="en.extraLinks"
          [logos]="en.logos"
        />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Dark Green (LTR)"
      description="backgroundColor: Dark green, rtl: false, breakpoint: 600+"
      align="stretch"
    >
      <div style="width: 100%;">
        <mod-footer
          dark
          [groups]="en.groups"
          [socialTitle]="en.socialTitle"
          [socialLinks]="en.social"
          [accessibilityTitle]="en.accessibilityTitle"
          [accessibilityTools]="en.accessibility"
          [legalLinks]="en.legalLinks"
          [legalCaption]="en.caption"
          [extraLinks]="en.extraLinks"
          [logos]="en.logos"
        />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="backgroundColor: Default, rtl: true, breakpoint: 600+"
      align="stretch"
    >
      <div style="width: 100%;" dir="rtl" lang="ar">
        <mod-footer
          [groups]="ar.groups"
          [socialTitle]="ar.socialTitle"
          [socialLinks]="ar.social"
          [accessibilityTitle]="ar.accessibilityTitle"
          [accessibilityTools]="ar.accessibility"
          [legalLinks]="ar.legalLinks"
          [legalCaption]="ar.caption"
          [extraLinks]="ar.extraLinks"
          [logos]="ar.logos"
        />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Dark Green (RTL)"
      description="backgroundColor: Dark green, rtl: true, breakpoint: 600+"
      align="stretch"
    >
      <div style="width: 100%;" dir="rtl" lang="ar">
        <mod-footer
          dark
          [groups]="ar.groups"
          [socialTitle]="ar.socialTitle"
          [socialLinks]="ar.social"
          [accessibilityTitle]="ar.accessibilityTitle"
          [accessibilityTools]="ar.accessibility"
          [legalLinks]="ar.legalLinks"
          [legalCaption]="ar.caption"
          [extraLinks]="ar.extraLinks"
          [logos]="ar.logos"
        />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Mobile Breakpoint (<600px)"
      description="breakpoint: <600 — 2-column grid for nav groups, side-by-side social/accessibility, centered legal, space-between logos. Resize your browser to <600px to see the responsive layout."
      align="stretch"
    >
      <div style="width: 100%; max-width: 560px;">
        <mod-footer
          mobilePreview
          [groups]="mobile.groups"
          [socialTitle]="mobile.socialTitle"
          [socialLinks]="mobile.social"
          [accessibilityTitle]="mobile.accessibilityTitle"
          [accessibilityTools]="mobile.accessibility"
          [legalLinks]="mobile.legalLinks"
          [legalCaption]="mobile.caption"
          [extraLinks]="mobile.extraLinks"
          [logos]="mobile.logos"
        />
      </div>
    </demo-showcase>
  `,
})
export class FooterPage {
  protected readonly backgrounds: DemoOption<'default' | 'dark'>[] = [
    { value: 'default', label: 'Default' },
    { value: 'dark', label: 'Dark Green' },
  ];

  protected readonly rtl = signal(false);
  protected readonly background = signal<'default' | 'dark'>('default');
  protected readonly navLinks = signal(true);
  protected readonly socialMedia = signal(true);
  protected readonly accessibility = signal(true);
  protected readonly legalLinks = signal(true);
  protected readonly logos = signal(true);

  protected readonly en = content('en');
  protected readonly ar = content('ar');
  protected readonly mobile = content('en', 5);

  protected readonly live = computed(() => (this.rtl() ? this.ar : this.en));

  protected readonly props: DemoProp[] = [
    { name: 'dark', type: 'boolean', default: 'false', description: 'Background style — default (neutral gray #F1F4F5) or dark green (#29504D).' },
    { name: 'mobilePreview', type: 'boolean', default: 'false', description: 'Force the <600px layout regardless of the viewport width.' },
    { name: 'groups', type: 'ModFooterGroup[]', default: '[]', description: 'Navigation link groups: { label, links: { id?, label, href?, external? }[] }.' },
    { name: 'socialTitle', type: 'string', default: "'Social Media'", description: 'Heading of the social media icon row.' },
    { name: 'socialLinks', type: 'ModFooterIconAction[]', default: '[]', description: 'Social media icon buttons: { id?, label, icon, href? }. The row is hidden when empty.' },
    { name: 'accessibilityTitle', type: 'string', default: "'Accessibility Tools'", description: 'Heading of the accessibility tools icon row.' },
    { name: 'accessibilityTools', type: 'ModFooterIconAction[]', default: '[]', description: 'Accessibility icon buttons. The row is hidden when empty.' },
    { name: 'legalLinks', type: 'ModFooterLink[]', default: '[]', description: 'Underlined links row above the caption.' },
    { name: 'legalCaption', type: 'string', default: "''", description: 'Copyright line.' },
    { name: 'extraLinks', type: 'ModFooterLink[]', default: '[]', description: 'Links under the caption (terms, privacy…).' },
    { name: 'logos', type: 'ModFooterLogo[]', default: '[]', description: 'Logos in the legal row: { src?, alt?, height?, text? }. Without src the placeholder glyph is shown.' },
    { name: 'ariaLabel', type: 'string', description: 'Accessible name of the footer landmark.' },
    { name: '(linkSelect)', type: 'ModFooterLink', description: 'Any text link (group, legal or extra) was activated.' },
    { name: '(actionSelect)', type: 'ModFooterIconAction', description: 'A social media or accessibility icon button was activated.' },
    { name: 'default content', type: 'content slot', description: 'Appended to the link-group row (use <div class="footer__group">).' },
    { name: '[modFooterLogo]', type: 'content slot', description: 'Appended to the logos row.' },
  ];
}
