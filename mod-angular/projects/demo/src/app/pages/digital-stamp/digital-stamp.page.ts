import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModDigitalStamp, ModDigitalStampExtension } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type Device = 'desktop' | 'mobile';

interface ExtensionInfo {
  value: ModDigitalStampExtension;
  kind: string;
  /** Arabic title and description of the URL-extension card. */
  titleAr: string;
  descriptionAr: string;
}

const EXTENSIONS: ExtensionInfo[] = [
  {
    value: '.gov.sa',
    kind: 'Government',
    titleAr: 'روابط المواقع الإلكترونية الرسمية الحكومية تنتهي بـ',
    descriptionAr: 'جميع روابط المواقع الرسمية التابعة للجهات الحكومية في المملكة العربية السعودية تنتهي بـ .gov.sa',
  },
  {
    value: '.edu.sa',
    kind: 'Educational',
    titleAr: 'روابط المواقع الإلكترونية الرسمية التعليمية تنتهي بـ',
    descriptionAr: 'جميع روابط المواقع الرسمية التابعة للجهات التعليمية في المملكة العربية السعودية تنتهي بـ .edu.sa',
  },
  {
    value: '.med.sa',
    kind: 'Medical',
    titleAr: 'روابط المواقع الإلكترونية الرسمية الطبية تنتهي بـ',
    descriptionAr: 'جميع روابط المواقع الرسمية التابعة للجهات الطبية في المملكة العربية السعودية تنتهي بـ .med.sa',
  },
  {
    value: '.org.sa',
    kind: 'Non-profit / NGO',
    titleAr: 'روابط المواقع الإلكترونية الرسمية للمنظمات غير الربحية تنتهي بـ',
    descriptionAr: 'جميع روابط المواقع الرسمية التابعة للمنظمات غير الربحية في المملكة العربية السعودية تنتهي بـ .org.sa',
  },
  {
    value: '.sch.sa',
    kind: 'Schools',
    titleAr: 'روابط المواقع الإلكترونية الرسمية للمدارس تنتهي بـ',
    descriptionAr: 'جميع روابط المواقع الرسمية التابعة للمدارس في المملكة العربية السعودية تنتهي بـ .sch.sa',
  },
  {
    value: '.sa',
    kind: 'Authorities & initiatives',
    titleAr: 'روابط المواقع الإلكترونية الرسمية للهيئات والمبادرات السعودية تنتهي بـ',
    descriptionAr: 'جميع روابط المواقع الرسمية التابعة للهيئات والمبادرات السعودية تنتهي بـ .sa',
  },
];

/** Copy that does not change per extension. Empty strings fall back to the component's English defaults. */
const COPY_AR = {
  text: 'موقع حكومي مسجل لدى هيئة الحكومة الرقمية.',
  toggle: 'كيف تتحقق؟',
  httpsTitle: 'المواقع الإلكترونية الحكومية الموثوقة تستخدم بروتوكول',
  httpsDescription: 'تحقق من أن الموقع يستخدم بروتوكول HTTPS',
  registration: 'مسجل لدى هيئة الحكومة الرقمية برقم:',
};

@Component({
  selector: 'demo-digital-stamp-page',
  imports: [ModDigitalStamp, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Digital Stamp</h1>
      <p class="content-description">
        A trust indicator that confirms users are interacting with a verified and secure Saudi government source. The
        component renders as a thin notification bar across the top of a page; tapping "How you know?" expands it to
        show verification cards (URL extension + HTTPS) and the DGA registration record. Modeled on Figma frames
        17504:520 (main) and 25079:5361 (extension variants).
      </p>
    </div>

    <demo-live
      heading="Digital Stamp"
      description="The stamp ships in two device layouts (desktop bar / mobile bar) and six URL-extension variants. Toggle Opened to reveal the verification cards and the DGA registration record."
      align="stretch"
      [rtl]="rtl()"
    >
      @if (rtl()) {
        <mod-digital-stamp
          style="width: 100%"
          registrationNumber="20230103200"
          registrationHref="#"
          [mobile]="device() === 'mobile'"
          [extension]="extension()"
          [text]="ar.text"
          [toggleLabel]="ar.toggle"
          [domainTitle]="extensionInfo().titleAr"
          [domainDescription]="extensionInfo().descriptionAr"
          [httpsTitle]="ar.httpsTitle"
          [httpsDescription]="ar.httpsDescription"
          [registrationLabel]="ar.registration"
          [(opened)]="opened"
          (click)="keepHere($event)"
        />
      } @else {
        <mod-digital-stamp
          style="width: 100%"
          registrationNumber="20230103200"
          registrationHref="#"
          [mobile]="device() === 'mobile'"
          [extension]="extension()"
          [(opened)]="opened"
          (click)="keepHere($event)"
        />
      }

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Device" [options]="devices" [(value)]="device" />
      <demo-switch label="Opened" [(checked)]="opened" />
      <demo-select label="Extension" [options]="extensionOptions" [(value)]="extension" />
      <p demoControl class="live-demo__sidebar-desc" style="padding: var(--spacing-md) 0 0;">
        Click the stamp's <strong>How you know?</strong> button (or the Opened toggle) to switch between the collapsed
        and expanded views. The Extension select swaps the URL-extension verification card content per Figma frame
        25079:5361.
      </p>
    </demo-live>

    <demo-props
      description="Inputs and models of the mod-digital-stamp component. All copy defaults to English and is overridable for other languages."
      [props]="props"
    />

    <demo-showcase
      heading="Anatomy"
      description='The collapsed bar has three parts: the Saudi flag indicator, the attestation text, and the "How you know?" toggle. Tapping the toggle reveals two verification cards (URL extension and HTTPS) and the DGA registration record.'
      align="stretch"
    >
      <span class="showcase-label">Collapsed</span>
      <mod-digital-stamp registrationNumber="20230103200" registrationHref="#" (click)="keepHere($event)" />
    </demo-showcase>

    <demo-showcase
      heading="Opened State"
      description="Click the toggle below to expand the stamp. The opened state reveals two verification cards side-by-side (URL extension and HTTPS) and a registration row with the DGA logo and a link to the registration record. The chevron rotates 180°."
      align="stretch"
    >
      <mod-digital-stamp
        registrationNumber="20230103200"
        registrationHref="#"
        [opened]="true"
        (click)="keepHere($event)"
      />
    </demo-showcase>

    <demo-showcase
      heading="URL Extensions"
      description="Six extension variants per Figma frame 25079:5361. Each variant changes the URL-extension card's title, description, and the highlighted suffix. The HTTPS card and registration row stay the same."
      align="stretch"
    >
      <div style="display: flex; flex-direction: column; align-items: stretch; gap: var(--spacing-3xl); width: 100%;">
        @for (e of extensions; track e.value) {
          <span class="showcase-label">{{ e.value }} — {{ e.kind }}</span>
          <mod-digital-stamp
            registrationHref="#"
            [registrationNumber]="$first ? '20230103200' : ''"
            [extension]="e.value"
            [opened]="true"
            (click)="keepHere($event)"
          />
        }
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Mobile Layout"
      description='The compact mobile bar drops the "How you know?" toggle below the flag + text row to fit narrow viewports. When opened, the verification cards stack vertically instead of sitting side-by-side. Triggered by the mobile input.'
      align="center"
    >
      <span class="showcase-label">Collapsed</span>
      <div
        style="max-width: 390px; width: 100%; border: 1px solid var(--gray-200); border-radius: var(--radius-md); overflow: hidden;"
      >
        <mod-digital-stamp mobile registrationNumber="20230103200" registrationHref="#" (click)="keepHere($event)" />
      </div>
      <span class="showcase-label">Opened</span>
      <div
        style="max-width: 390px; width: 100%; border: 1px solid var(--gray-200); border-radius: var(--radius-md); overflow: hidden;"
      >
        <mod-digital-stamp
          mobile
          registrationNumber="20230103200"
          registrationHref="#"
          [opened]="true"
          (click)="keepHere($event)"
        />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Support"
      description='Arabic and other right-to-left layouts mirror the bar so the flag sits at the trailing edge, the "How you know?" link reads from the right, and the verification cards reverse direction. Triggered by dir="rtl" on the stamp or any ancestor.'
      subtle
      align="stretch"
    >
      <div dir="rtl" style="display: contents">
        <span class="showcase-label">مفتوح</span>
        <mod-digital-stamp
          registrationNumber="20230103200"
          registrationHref="#"
          [text]="ar.text"
          [toggleLabel]="ar.toggle"
          [domainTitle]="extensions[0].titleAr"
          [domainDescription]="extensions[0].descriptionAr"
          [httpsTitle]="ar.httpsTitle"
          [httpsDescription]="ar.httpsDescription"
          [registrationLabel]="ar.registration"
          [opened]="true"
          (click)="keepHere($event)"
        />
      </div>
    </demo-showcase>
  `,
})
export class DigitalStampPage {
  protected readonly ar = COPY_AR;
  protected readonly extensions = EXTENSIONS;
  protected readonly extensionOptions: DemoOption<ModDigitalStampExtension>[] = EXTENSIONS.map((e) => ({
    value: e.value,
    label: e.value,
  }));
  protected readonly devices: DemoOption<Device>[] = [
    { value: 'desktop', label: 'Desktop' },
    { value: 'mobile', label: 'Mobile' },
  ];

  protected readonly rtl = signal(false);
  protected readonly device = signal<Device>('desktop');
  protected readonly opened = signal(false);
  protected readonly extension = signal<ModDigitalStampExtension>('.gov.sa');

  protected readonly extensionInfo = computed(
    () => EXTENSIONS.find((e) => e.value === this.extension()) ?? EXTENSIONS[0],
  );

  /** The registration number is a placeholder "#" link, as in the original page: do not navigate. */
  protected keepHere(event: Event): void {
    if (event.target instanceof Element && event.target.closest('a[href="#"]')) event.preventDefault();
  }

  protected readonly props: DemoProp[] = [
    { name: '[(opened)]', type: 'boolean', default: 'false', description: 'Expanded state: reveals the verification cards and the registration row, and rotates the chevron.' },
    { name: 'mobile', type: 'boolean', default: 'false', description: 'Forces the mobile layout (toggle below the flag + text row, stacked cards) regardless of the viewport width.' },
    { name: 'extension', type: "'.gov.sa' | '.edu.sa' | '.med.sa' | '.org.sa' | '.sch.sa' | '.sa'", default: "'.gov.sa'", description: 'Domain extension the site is registered under; sets the highlighted suffix and the default card copy.' },
    { name: 'text', type: 'string', default: "'A government website registered with the Digital Government Authority.'", description: 'Attestation text of the bar.' },
    { name: 'toggleLabel', type: 'string', default: "'How you know?'", description: 'Label of the expand / collapse toggle.' },
    { name: 'domainTitle', type: 'string', default: "''", description: 'Title of the URL-extension card. Empty = English default for the extension.' },
    { name: 'domainDescription', type: 'string', default: "''", description: 'Description of the URL-extension card. Empty = English default for the extension.' },
    { name: 'httpsTitle', type: 'string', default: "'Official Secure websites use'", description: 'Title of the HTTPS card.' },
    { name: 'httpsTag', type: 'string', default: "'HTTPS'", description: 'Highlighted suffix of the HTTPS card title.' },
    { name: 'httpsDescription', type: 'string', default: "'Ensure the website is using the HTTPS protocol.'", description: 'Description of the HTTPS card.' },
    { name: 'registrationLabel', type: 'string', default: "'Registered on Digital Government Authority:'", description: 'Label of the registration row.' },
    { name: 'registrationNumber', type: 'string', default: "''", description: 'Registration number. The registration row is hidden when empty.' },
    { name: 'registrationHref', type: 'string', default: "''", description: 'Link target of the registration number; plain text when empty.' },
    { name: 'toggle() / open() / close()', type: 'methods', description: 'Programmatic control of the expanded state through a template reference.' },
  ];
}
