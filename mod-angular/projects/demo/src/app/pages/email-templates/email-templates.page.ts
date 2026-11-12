import { ChangeDetectionStrategy, Component, type Signal, type WritableSignal, computed, inject, signal } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { DemoExample } from '../../shared/demo-example';
import type { EmailLang } from './email-layout';
import { requestUpdateEmail } from './request-update.email';
import { resetPasswordEmail } from './reset-password.email';
import { verificationCodeEmail } from './verification-code.email';
import { welcomeEmail } from './welcome.email';

interface EmailExample {
  id: string;
  heading: string;
  description: string;
  /** Accessible name of the preview iframe. */
  frameTitle: string;
  badge: string;
  rtl: WritableSignal<boolean>;
  /** The complete HTML document, shown in the Code tab. */
  html: Signal<string>;
  /** The same HTML as a trusted value for the iframe `srcdoc`. */
  preview: Signal<SafeHtml>;
}

@Component({
  selector: 'demo-email-templates-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DemoExample],
  styles: `
    .email-frame {
      display: block;
      width: 100%;
      height: 640px;
      border: 0;
    }

    .email-notes {
      margin: 0 0 var(--spacing-4xl);
      padding: var(--spacing-xl) var(--spacing-3xl);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      background: var(--gray-50);
      font-size: var(--font-size-sm);
      line-height: 1.7;
      color: var(--gray-700);
    }

    .email-notes ul {
      margin: 0;
      padding-inline-start: var(--spacing-2xl);
    }
  `,
  template: `
    <div class="content-header">
      <h1 class="content-title">Email templates</h1>
      <p class="content-description">
        Transactional emails in the MOD identity, in English and Arabic. Each template is a function that returns a
        complete HTML document, so it can be sent from any back end. Copy the HTML from the Code tab.
      </p>
    </div>

    <div class="email-notes">
      <ul>
        <li>Written for email clients: table layout, inline styles, literal colours, no JavaScript and no external CSS.</li>
        <li>No images: the header is a text wordmark, so nothing is blocked when images are turned off. If you add an image, give it alt text.</li>
        <li>Arabic uses <code>dir="rtl"</code> and right alignment; codes, numbers and links stay left to right.</li>
        <li>Replace the sample values (name, code, links, request number) with your own data, and escape them as the functions do.</li>
      </ul>
    </div>

    @for (example of examples; track example.id) {
      <demo-example
        fixedWidth
        [heading]="example.heading"
        [description]="example.description"
        [badge]="example.badge"
        [code]="example.html()"
        [rtl]="example.rtl()"
        (rtlChange)="example.rtl.set($event)"
      >
        <iframe class="email-frame" sandbox="" [title]="example.frameTitle" [srcdoc]="example.preview()"></iframe>
      </demo-example>
    }
  `,
})
export class EmailTemplatesPage {
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly examples: EmailExample[] = [
    this.example(
      'verification-code',
      'Verification code',
      'The 6-digit one-time code, large and letter-spaced, with its expiry and a "do not share" note.',
      'Verification code email preview',
      verificationCodeEmail,
      'Default',
    ),
    this.example(
      'reset-password',
      'Reset password',
      'A button to choose a new password, the same link as text in case the button does not work, and a note for people who did not request it.',
      'Reset password email preview',
      resetPasswordEmail,
    ),
    this.example(
      'welcome',
      'Welcome / account created',
      'Greets the new user by name and lists three short next steps before the sign-in button.',
      'Welcome email preview',
      welcomeEmail,
    ),
    this.example(
      'request-update',
      'Request update',
      'A status notification — here an approved referral request — with a small details table (request number, date, status) and a button to open the request.',
      'Request update email preview',
      requestUpdateEmail,
    ),
  ];

  private example(
    id: string,
    heading: string,
    description: string,
    frameTitle: string,
    build: (lang: EmailLang) => string,
    badge = '',
  ): EmailExample {
    const rtl = signal(false);
    const html = computed(() => build(rtl() ? 'ar' : 'en'));
    // Trusted on purpose: the HTML is produced by our own template function from
    // constant sample data and contains no user input. It is also rendered in a
    // fully sandboxed iframe (sandbox=""), so nothing in it can run or reach the app.
    const preview = computed(() => this.sanitizer.bypassSecurityTrustHtml(html()));
    return { id, heading, description, frameTitle, badge, rtl, html, preview };
  }
}
