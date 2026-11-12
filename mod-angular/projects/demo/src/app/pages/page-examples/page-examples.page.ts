import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModIcon } from '@mod-internal/ui';

type ExampleId =
  | 'login-pages'
  | 'signup-pages'
  | 'verification-pages'
  | 'forgot-password-pages'
  | 'not-found-sections'
  | 'email-templates';

interface ExampleCard {
  /** Route of the page (same ids as DEMO_PAGE_EXAMPLES in nav.ts). */
  id: ExampleId;
  name: string;
  description: string;
  count: number;
}

@Component({
  selector: 'demo-page-examples-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ModIcon],
  styles: `
    .pe-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--spacing-3xl);
      margin: 0 0 var(--spacing-6xl);
      padding: 0;
      list-style: none;
    }

    .pe-card {
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

    .pe-card:hover {
      border-color: var(--sa-600);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--gray-900) 8%, transparent);
    }

    .pe-card:focus-visible {
      outline: 2px solid var(--border-black);
      outline-offset: 2px;
    }

    .pe-card__body {
      display: grid;
      gap: var(--spacing-xs);
      padding: var(--spacing-xl) var(--spacing-2xl) var(--spacing-2xl);
    }

    .pe-card__name {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin: 0;
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .pe-card__text {
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: 1.6;
      color: var(--gray-600);
    }

    .pe-card__count {
      margin: var(--spacing-md) 0 0;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--gray-500);
    }

    /* --- Schematic thumbnails: plain boxes in the brand tokens --- */
    .pe-thumb {
      display: flex;
      align-items: stretch;
      justify-content: center;
      height: 148px;
      padding: var(--spacing-xl);
      border-block-end: 1px solid var(--gray-200);
      background: var(--gray-100);
    }

    .pe-sheet {
      display: flex;
      flex: 1;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm);
      background: var(--alpha-white);
      overflow: hidden;
    }

    .pe-sheet--center {
      align-items: center;
      justify-content: center;
    }

    .pe-col {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-lg);
    }

    .pe-col--narrow {
      flex: 0 1 120px;
    }

    .pe-panel {
      flex: 1;
      background: var(--mod-dark-green);
    }

    .pe-bar {
      display: block;
      height: 6px;
      border-radius: var(--radius-full);
      background: var(--gray-300);
    }

    .pe-bar--title {
      width: 60%;
      background: var(--gray-700);
    }

    .pe-bar--short {
      width: 40%;
    }

    .pe-field {
      display: block;
      height: 12px;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm);
    }

    .pe-button {
      display: block;
      height: 12px;
      border-radius: var(--radius-sm);
      background: var(--sa-600);
    }

    .pe-button--outline {
      border: 1px solid var(--gray-300);
      background: transparent;
    }

    .pe-row {
      display: flex;
      gap: var(--spacing-xs);
    }

    .pe-row > * {
      flex: 1;
    }

    .pe-digit {
      height: 22px;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm);
    }

    .pe-digit--active {
      border-color: var(--sa-600);
      box-shadow: 0 0 0 2px var(--sa-100);
    }

    .pe-badge {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      margin: 0 auto var(--spacing-xs);
      border-radius: var(--radius-full);
      background: var(--sa-50);
      color: var(--mod-primary-text);
      font-size: 16px;
    }

    .pe-code {
      font-size: 34px;
      font-weight: var(--font-weight-bold);
      line-height: 1;
      text-align: center;
      color: var(--sa-200);
    }

    .pe-envelope {
      display: grid;
      place-items: center;
      width: 72px;
      height: 72px;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      background: var(--alpha-white);
      color: var(--mod-primary-text);
      font-size: 36px;
    }



    /* --- How to use --- */
    .pe-section-title {
      margin: 0 0 var(--spacing-md);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .pe-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--spacing-xl);
      margin: var(--spacing-xl) 0 0;
      padding: 0;
      list-style: none;
      counter-reset: pe-step;
    }

    .pe-steps li {
      counter-increment: pe-step;
      padding: var(--spacing-2xl);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      background: var(--alpha-white);
      font-size: var(--font-size-sm);
      line-height: 1.6;
      color: var(--gray-600);
    }

    .pe-steps li::before {
      content: counter(pe-step);
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

    .pe-steps strong {
      display: block;
      margin-block-end: var(--spacing-xs);
      font-size: var(--font-size-md);
      color: var(--gray-900);
    }

    @media (prefers-reduced-motion: reduce) {
      .pe-card {
        transition: none;
      }
    }
  `,
  template: `
    <div class="content-header">
      <h1 class="content-title">Shared page examples</h1>
      <p class="content-description">
        Complete pages built from the library components: sign-in, sign-up, verification, password recovery, error
        sections and emails. Every example comes in English and Arabic, adapts from desktop to mobile, and can be
        copied into your application from its Code tab.
      </p>
    </div>

    <ul class="pe-grid">
      @for (card of cards; track card.id) {
        <li>
          <a class="pe-card" [routerLink]="'/' + card.id">
            <div class="pe-thumb" aria-hidden="true">
              @switch (card.id) {
                @case ('login-pages') {
                  <div class="pe-sheet">
                    <div class="pe-col">
                      <span class="pe-bar pe-bar--title"></span>
                      <span class="pe-field"></span>
                      <span class="pe-field"></span>
                      <span class="pe-button"></span>
                    </div>
                    <div class="pe-panel"></div>
                  </div>
                }
                @case ('signup-pages') {
                  <div class="pe-sheet pe-sheet--center">
                    <div class="pe-col pe-col--narrow">
                      <span class="pe-bar pe-bar--title"></span>
                      <span class="pe-row"><span class="pe-field"></span><span class="pe-field"></span></span>
                      <span class="pe-field"></span>
                      <span class="pe-field"></span>
                      <span class="pe-button"></span>
                    </div>
                  </div>
                }
                @case ('verification-pages') {
                  <div class="pe-sheet pe-sheet--center">
                    <div class="pe-col pe-col--narrow">
                      <span class="pe-bar pe-bar--title"></span>
                      <span class="pe-row">
                        <span class="pe-digit"></span>
                        <span class="pe-digit"></span>
                        <span class="pe-digit pe-digit--active"></span>
                        <span class="pe-digit"></span>
                        <span class="pe-digit"></span>
                        <span class="pe-digit"></span>
                      </span>
                      <span class="pe-button"></span>
                    </div>
                  </div>
                }
                @case ('forgot-password-pages') {
                  <div class="pe-sheet pe-sheet--center">
                    <div class="pe-col pe-col--narrow">
                      <span class="pe-badge"><mod-icon name="lock-key" /></span>
                      <span class="pe-bar"></span>
                      <span class="pe-field"></span>
                      <span class="pe-button"></span>
                    </div>
                  </div>
                }
                @case ('not-found-sections') {
                  <div class="pe-sheet pe-sheet--center">
                    <div class="pe-col pe-col--narrow">
                      <span class="pe-code">404</span>
                      <span class="pe-bar"></span>
                      <span class="pe-row"><span class="pe-button"></span><span class="pe-button pe-button--outline"></span></span>
                    </div>
                  </div>
                }
                @case ('email-templates') {
                  <div class="pe-sheet pe-sheet--center">
                    <span class="pe-envelope"><mod-icon name="mail-01" /></span>
                  </div>
                }
              }
            </div>
            <div class="pe-card__body">
              <h2 class="pe-card__name">
                {{ card.name }}
                <span class="sidebar-link__badge">New</span>
              </h2>
              <p class="pe-card__text">{{ card.description }}</p>
              <p class="pe-card__count">{{ card.count }} examples</p>
            </div>
          </a>
        </li>
      }
    </ul>

    <h2 class="pe-section-title">How to use an example</h2>
    <p class="content-description">
      The examples are ordinary standalone components that import from <code>&#64;mod-internal/ui</code>. Nothing else is
      needed beyond the library styles your application already loads.
    </p>
    <ol class="pe-steps">
      <li><strong>Open the Code tab</strong>Each example has a Preview and a Code view. Use the width and language switches to check it first.</li>
      <li><strong>Copy the component</strong>Select “Copy code” and paste it into a new component file in your application.</li>
      <li><strong>Replace the texts</strong>Change the titles, labels and messages to your system’s wording, in both languages.</li>
      <li><strong>Connect the submit handler</strong>Replace the commented placeholder call with your own service, and keep the error states.</li>
    </ol>
  `,
})
export class PageExamplesPage {
  protected readonly cards: ExampleCard[] = [
    {
      id: 'login-pages',
      name: 'Log in pages',
      description: 'Sign-in layouts, from the split default to compact cards.',
      count: 5,
    },
    {
      id: 'signup-pages',
      name: 'Sign up pages',
      description: 'Account registration forms with validation.',
      count: 4,
    },
    {
      id: 'verification-pages',
      name: 'Verification pages',
      description: 'One-time code entry and email confirmation.',
      count: 4,
    },
    {
      id: 'forgot-password-pages',
      name: 'Forgot password pages',
      description: 'Request a reset link and set a new password.',
      count: 4,
    },
    {
      id: 'not-found-sections',
      name: '404 sections',
      description: 'Not found, no permission and server error sections.',
      count: 6,
    },
    {
      id: 'email-templates',
      name: 'Email templates',
      description: 'Transactional HTML emails in the MOD identity.',
      count: 4,
    },
  ];
}
