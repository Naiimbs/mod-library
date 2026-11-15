import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModIcon } from '@mod-internal/ui';

type ExampleId =
  | 'dashboards-01'
  | 'dashboards-02'
  | 'settings-pages-01'
  | 'settings-pages-02'
  | 'informational-pages-01'
  | 'informational-pages-02';

interface ExampleCard {
  /** Route of the page (same ids as the Application UI entries in nav.ts). */
  id: ExampleId;
  name: string;
  /** Section the example belongs to, shown above the name. */
  group: string;
  description: string;
}

interface BuildingBlock {
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'demo-app-examples-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ModIcon],
  styles: `
    .ax-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--spacing-3xl);
      margin: 0 0 var(--spacing-6xl);
      padding: 0;
      list-style: none;
    }

    .ax-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      background: var(--alpha-white);
      color: inherit;
      text-decoration: none;
      overflow: hidden;
      transition: border-color 150ms ease, box-shadow 150ms ease;
    }

    .ax-card:hover {
      border-color: var(--sa-600);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--gray-900) 8%, transparent);
    }

    .ax-card:focus-visible {
      outline: 2px solid var(--border-black);
      outline-offset: 2px;
    }

    .ax-card__body {
      display: grid;
      gap: var(--spacing-xs);
      padding: var(--spacing-xl) var(--spacing-2xl) var(--spacing-2xl);
    }

    .ax-card__group {
      margin: 0;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--gray-500);
    }

    .ax-card__name {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin: 0;
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .ax-card__text {
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: 1.6;
      color: var(--gray-600);
    }

    /* --- Schematic thumbnails: plain boxes in the brand tokens --- */
    .ax-thumb {
      display: flex;
      height: 148px;
      padding: var(--spacing-xl);
      border-block-end: 1px solid var(--gray-200);
      background: var(--gray-100);
    }

    /* The application frame: side bar and page. */
    .ax-sheet {
      display: flex;
      flex: 1;
      min-width: 0;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm);
      background: var(--alpha-white);
      overflow: hidden;
    }

    .ax-side {
      display: flex;
      flex: none;
      flex-direction: column;
      gap: var(--spacing-sm);
      width: 34px;
      padding: var(--spacing-md) var(--spacing-sm);
      background: var(--mod-dark-green);
    }

    .ax-side span {
      display: block;
      height: 4px;
      border-radius: var(--radius-full);
      background: var(--mod-white);
      opacity: 0.35;
    }

    .ax-side span:first-child {
      width: 60%;
      height: 8px;
      margin-block-end: var(--spacing-xs);
      opacity: 0.9;
    }

    .ax-side .ax-side__active {
      opacity: 0.9;
    }

    .ax-page {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: var(--spacing-sm);
      min-width: 0;
      padding: var(--spacing-md);
    }

    .ax-row {
      display: flex;
      gap: var(--spacing-sm);
      min-height: 0;
    }

    .ax-row > * {
      flex: 1;
      min-width: 0;
    }

    .ax-row--grow {
      flex: 1;
    }

    .ax-row--center {
      align-items: center;
    }

    .ax-row .ax-fixed {
      flex: none;
    }

    .ax-col {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      min-width: 0;
    }

    .ax-col--rail {
      flex: 0 0 32%;
    }

    .ax-bar {
      display: block;
      height: 5px;
      border-radius: var(--radius-full);
      background: var(--gray-300);
    }

    .ax-bar--title {
      width: 45%;
      height: 6px;
      background: var(--gray-700);
    }

    .ax-bar--short {
      width: 60%;
    }

    .ax-bar--brand {
      background: var(--sa-600);
    }

    .ax-box {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 3px;
      padding: var(--spacing-xs) var(--spacing-sm);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-sm);
      background: var(--alpha-white);
    }

    .ax-box--tile {
      min-height: 24px;
    }

    .ax-box--fill {
      flex: 1;
    }

    /* Column chart. */
    .ax-chart {
      display: flex;
      flex: 1;
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-around;
      gap: 3px;
    }

    .ax-chart span {
      flex: 1;
      min-height: 4px;
      border-radius: 2px 2px 0 0;
      background: var(--sa-600);
    }

    .ax-chart span:nth-child(even) {
      background: var(--sa-200);
    }

    .ax-field {
      display: block;
      height: 11px;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm);
    }

    .ax-button {
      display: block;
      flex: none;
      width: 34px;
      height: 10px;
      border-radius: var(--radius-sm);
      background: var(--sa-600);
    }

    .ax-switch {
      display: block;
      flex: none;
      width: 16px;
      height: 8px;
      border-radius: var(--radius-full);
      background: var(--gray-300);
    }

    .ax-switch--on {
      background: var(--sa-600);
    }

    .ax-dot {
      display: block;
      flex: none;
      width: 9px;
      height: 9px;
      border: 2px solid var(--gray-300);
      border-radius: var(--radius-full);
      background: var(--alpha-white);
    }

    .ax-dot--done {
      border-color: var(--sa-600);
      background: var(--sa-600);
    }

    .ax-dot--current {
      border-color: var(--sa-600);
    }

    .ax-line {
      display: block;
      height: 2px;
      background: var(--gray-300);
    }

    .ax-line--done {
      background: var(--sa-600);
    }

    .ax-mark {
      display: grid;
      flex: none;
      place-items: center;
      width: 22px;
      height: 22px;
      border-radius: var(--radius-full);
      background: var(--sa-50);
      color: var(--mod-primary-text);
      font-size: 13px;
    }

    .ax-mark--small {
      width: 16px;
      height: 16px;
      font-size: 10px;
    }

    /* --- Building blocks and steps --- */
    .ax-section-title {
      margin: 0 0 var(--spacing-md);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .ax-blocks {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--spacing-xl);
      margin: var(--spacing-xl) 0 var(--spacing-6xl);
      padding: 0;
      list-style: none;
    }

    .ax-blocks li {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-lg);
      padding: var(--spacing-xl) var(--spacing-2xl);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      background: var(--alpha-white);
      font-size: var(--font-size-sm);
      line-height: 1.6;
      color: var(--gray-600);
    }

    .ax-blocks mod-icon {
      margin-block-start: 2px;
      font-size: 20px;
      color: var(--mod-primary-text);
    }

    .ax-blocks strong,
    .ax-steps strong {
      display: block;
      margin-block-end: var(--spacing-xs);
      font-size: var(--font-size-md);
      color: var(--gray-900);
    }

    .ax-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--spacing-xl);
      margin: var(--spacing-xl) 0 0;
      padding: 0;
      list-style: none;
      counter-reset: ax-step;
    }

    .ax-steps li {
      counter-increment: ax-step;
      padding: var(--spacing-2xl);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      background: var(--alpha-white);
      font-size: var(--font-size-sm);
      line-height: 1.6;
      color: var(--gray-600);
    }

    .ax-steps li::before {
      content: counter(ax-step);
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      margin-block-end: var(--spacing-lg);
      border-radius: var(--radius-full);
      background: var(--sa-50);
      color: var(--mod-primary-text);
      font-weight: var(--font-weight-semibold);
    }

    @media (prefers-reduced-motion: reduce) {
      .ax-card {
        transition: none;
      }
    }
  `,
  template: `
    <div class="content-header">
      <h1 class="content-title">Application UI examples</h1>
      <p class="content-description">
        Full application screens adapted from a hospital referral portal, the Medical Referrals and Patient Transfer
        System, and built only from the library components: dashboards, settings pages and informational pages inside
        the application shell. Every example comes in English and Arabic, adapts from desktop to mobile, and can be
        copied into your application from its Code tab.
      </p>
    </div>

    <ul class="ax-grid">
      @for (card of cards; track card.id) {
        <li>
          <a class="ax-card" [routerLink]="'/' + card.id">
            <div class="ax-thumb" aria-hidden="true">
              <div class="ax-sheet">
                <div class="ax-side">
                  <span></span>
                  <span class="ax-side__active"></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="ax-page">
                  @switch (card.id) {
                    @case ('dashboards-01') {
                      <span class="ax-bar ax-bar--title"></span>
                      <div class="ax-row">
                        <span class="ax-box ax-box--tile"><span class="ax-bar ax-bar--short"></span><span class="ax-bar ax-bar--brand"></span></span>
                        <span class="ax-box ax-box--tile"><span class="ax-bar ax-bar--short"></span><span class="ax-bar ax-bar--brand"></span></span>
                        <span class="ax-box ax-box--tile"><span class="ax-bar ax-bar--short"></span><span class="ax-bar ax-bar--brand"></span></span>
                      </div>
                      <div class="ax-row ax-row--grow">
                        <span class="ax-box ax-box--fill">
                          <span class="ax-chart">
                            <span style="height: 45%"></span>
                            <span style="height: 30%"></span>
                            <span style="height: 70%"></span>
                            <span style="height: 50%"></span>
                            <span style="height: 90%"></span>
                            <span style="height: 60%"></span>
                          </span>
                        </span>
                        <span class="ax-box ax-col--rail">
                          <span class="ax-bar ax-bar--brand"></span>
                          <span class="ax-bar ax-bar--brand ax-bar--short"></span>
                          <span class="ax-bar ax-bar--short"></span>
                        </span>
                      </div>
                    }
                    @case ('dashboards-02') {
                      <div class="ax-row ax-row--center">
                        <span class="ax-bar ax-bar--title"></span>
                        <span class="ax-button ax-fixed"></span>
                      </div>
                      <div class="ax-row">
                        <span class="ax-box ax-box--tile"><span class="ax-bar ax-bar--brand ax-bar--short"></span></span>
                        <span class="ax-box ax-box--tile"><span class="ax-bar ax-bar--short"></span></span>
                        <span class="ax-box ax-box--tile"><span class="ax-bar ax-bar--short"></span></span>
                      </div>
                      <span class="ax-box ax-box--fill">
                        <span class="ax-row ax-row--center"><span class="ax-mark ax-mark--small ax-fixed"><mod-icon name="inbox" /></span><span class="ax-bar"></span></span>
                        <span class="ax-row ax-row--center"><span class="ax-mark ax-mark--small ax-fixed"><mod-icon name="calendar-03" /></span><span class="ax-bar"></span></span>
                      </span>
                    }
                    @case ('settings-pages-01') {
                      <span class="ax-bar ax-bar--title"></span>
                      <div class="ax-row">
                        <span class="ax-bar ax-bar--brand"></span>
                        <span class="ax-bar"></span>
                        <span class="ax-bar"></span>
                        <span></span>
                      </div>
                      <span class="ax-box ax-box--fill">
                        <span class="ax-row ax-row--center"><span class="ax-mark ax-fixed"><mod-icon name="user" /></span><span class="ax-bar ax-bar--short"></span></span>
                        <span class="ax-row"><span class="ax-field"></span><span class="ax-field"></span></span>
                        <span class="ax-field"></span>
                        <span class="ax-button"></span>
                      </span>
                    }
                    @case ('settings-pages-02') {
                      <div class="ax-row ax-row--center">
                        <span class="ax-bar ax-bar--title"></span>
                        <span class="ax-button ax-fixed"></span>
                      </div>
                      <span class="ax-box ax-box--fill">
                        <span class="ax-row ax-row--center"><span class="ax-bar"></span><span class="ax-switch ax-switch--on ax-fixed"></span></span>
                        <span class="ax-row ax-row--center"><span class="ax-bar"></span><span class="ax-switch ax-fixed"></span></span>
                        <span class="ax-row ax-row--center"><span class="ax-bar"></span><span class="ax-switch ax-switch--on ax-fixed"></span></span>
                        <span class="ax-row ax-row--center"><span class="ax-bar"></span><span class="ax-switch ax-switch--on ax-fixed"></span></span>
                      </span>
                    }
                    @case ('informational-pages-01') {
                      <div class="ax-row ax-row--center">
                        <span class="ax-bar ax-bar--title"></span>
                        <span class="ax-button ax-fixed"></span>
                      </div>
                      <div class="ax-row ax-row--center">
                        <span class="ax-dot ax-dot--done ax-fixed"></span>
                        <span class="ax-line ax-line--done"></span>
                        <span class="ax-dot ax-dot--done ax-fixed"></span>
                        <span class="ax-line ax-line--done"></span>
                        <span class="ax-dot ax-dot--current ax-fixed"></span>
                        <span class="ax-line"></span>
                        <span class="ax-dot ax-fixed"></span>
                      </div>
                      <div class="ax-row ax-row--grow">
                        <span class="ax-box ax-box--fill">
                          <span class="ax-row"><span class="ax-bar"></span><span class="ax-bar"></span><span class="ax-bar"></span></span>
                          <span class="ax-row"><span class="ax-bar"></span><span class="ax-bar"></span><span class="ax-bar"></span></span>
                          <span class="ax-bar ax-bar--short"></span>
                        </span>
                        <span class="ax-box ax-col--rail">
                          <span class="ax-row ax-row--center"><span class="ax-dot ax-dot--done ax-fixed"></span><span class="ax-bar"></span></span>
                          <span class="ax-row ax-row--center"><span class="ax-dot ax-dot--done ax-fixed"></span><span class="ax-bar"></span></span>
                          <span class="ax-row ax-row--center"><span class="ax-dot ax-fixed"></span><span class="ax-bar"></span></span>
                        </span>
                      </div>
                    }
                    @case ('informational-pages-02') {
                      <div class="ax-row ax-row--center">
                        <span class="ax-mark ax-fixed"><mod-icon name="user" /></span>
                        <span class="ax-col">
                          <span class="ax-bar ax-bar--title"></span>
                          <span class="ax-bar ax-bar--short"></span>
                        </span>
                        <span class="ax-button ax-fixed"></span>
                      </div>
                      <div class="ax-row ax-row--grow">
                        <span class="ax-box ax-box--fill">
                          <span class="ax-row"><span class="ax-bar"></span><span class="ax-bar"></span><span class="ax-bar"></span></span>
                          <span class="ax-row"><span class="ax-bar"></span><span class="ax-bar"></span><span class="ax-bar"></span></span>
                          <span class="ax-row"><span class="ax-bar ax-bar--brand"></span><span class="ax-bar"></span><span class="ax-bar"></span></span>
                        </span>
                        <span class="ax-box ax-col--rail">
                          <span class="ax-row ax-row--center"><span class="ax-dot ax-dot--done ax-fixed"></span><span class="ax-bar"></span></span>
                          <span class="ax-row ax-row--center"><span class="ax-dot ax-fixed"></span><span class="ax-bar"></span></span>
                        </span>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>
            <div class="ax-card__body">
              <p class="ax-card__group">{{ card.group }}</p>
              <h2 class="ax-card__name">
                {{ card.name }}
                <span class="sidebar-link__badge">New</span>
              </h2>
              <p class="ax-card__text">{{ card.description }}</p>
            </div>
          </a>
        </li>
      }
    </ul>

    <h2 class="ax-section-title">Building blocks</h2>
    <p class="content-description">
      The examples are assembled from these library components, together with the tables, tags, buttons, menus and
      form controls documented in the Components section.
    </p>
    <ul class="ax-blocks">
      @for (block of blocks; track block.name) {
        <li>
          <mod-icon [name]="block.icon" />
          <span><strong>{{ block.name }}</strong>{{ block.description }}</span>
        </li>
      }
    </ul>

    <h2 class="ax-section-title">How to use an example</h2>
    <p class="content-description">
      The examples are ordinary standalone components that import from <code>&#64;mod-internal/ui</code>. Nothing else is
      needed beyond the library styles your application already loads.
    </p>
    <ol class="ax-steps">
      <li><strong>Open the Code tab</strong>Each example has a Preview and a Code view. Use the width and language switches to check it first.</li>
      <li><strong>Copy the component</strong>Select “Copy code” and paste it into a new component file in your application.</li>
      <li><strong>Replace the data</strong>Swap the sample records, menu and texts for your own, in both languages, and load them from your services.</li>
      <li><strong>Connect the handlers</strong>Replace the commented placeholder calls with your router and API calls, and keep the status messages.</li>
    </ol>
  `,
})
export class AppExamplesPage {
  protected readonly cards: ExampleCard[] = [
    {
      id: 'dashboards-01',
      name: 'Reports dashboard',
      group: 'Dashboards 01',
      description: 'KPI tiles, a monthly chart, ranked breakdowns and the latest referrals.',
    },
    {
      id: 'dashboards-02',
      name: 'Coordinator dashboard',
      group: 'Dashboards 02',
      description: 'The home of a hospital coordinator: the pending queue, today’s appointments and activity.',
    },
    {
      id: 'settings-pages-01',
      name: 'Account settings',
      group: 'Settings pages 01',
      description: 'Tabbed forms for the profile, the password and the notifications of the signed-in user.',
    },
    {
      id: 'settings-pages-02',
      name: 'System setup',
      group: 'Settings pages 02',
      description: 'Setup screens of the general admin: reference lists and system settings.',
    },
    {
      id: 'informational-pages-01',
      name: 'Referral case',
      group: 'Informational pages 01',
      description: 'A record page: status, case steps, details, attachments and timeline.',
    },
    {
      id: 'informational-pages-02',
      name: 'User profile',
      group: 'Informational pages 02',
      description: 'A profile page: identity, roles and scope, permissions and activity.',
    },
  ];

  protected readonly blocks: BuildingBlock[] = [
    {
      name: 'App shell',
      icon: 'sidebar-left-01',
      description: 'The frame of the application: side bar with groups, top bar, and a drawer on narrow widths.',
    },
    {
      name: 'Page header',
      icon: 'text-align-left',
      description: 'Title, description, breadcrumbs, status tags, actions and tabs of a page.',
    },
    {
      name: 'Stat card',
      icon: 'analytics-01',
      description: 'One KPI with its unit, trend against the previous period and a loading state.',
    },
    {
      name: 'Bar list',
      icon: 'left-to-right-list-bullet',
      description: 'Ranked or plain horizontal bars for breakdowns such as “top hospitals”.',
    },
    {
      name: 'Column chart',
      icon: 'chart-column',
      description: 'Vertical bars for one or two series over categories, with an accessible data table.',
    },
    {
      name: 'Description list',
      icon: 'list-view',
      description: 'Read-only label and value pairs in one to three columns.',
    },
    {
      name: 'Timeline',
      icon: 'clock-01',
      description: 'Who did what and when, with tones and icons for the outcome.',
    },
    {
      name: 'Empty state',
      icon: 'inbox',
      description: 'What to show, and what to do next, when a list or section has no data.',
    },
  ];
}
