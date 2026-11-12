import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

type ExampleView = 'preview' | 'code';
type ExampleWidth = 'desktop' | 'tablet' | 'mobile';

/**
 * Frame for one "shared page example": a title, a toolbar (Preview / Code,
 * viewport width, Arabic / English) and the example itself rendered in a
 * browser-like frame.
 *
 *   <demo-example heading="Split with image" description="…" [code]="code" [(rtl)]="rtl">
 *     <demo-login-split [lang]="rtl() ? 'ar' : 'en'" />
 *   </demo-example>
 *
 * The preview sets `dir` on its frame and constrains its width, so the page
 * examples (which respond to their container width) can be checked at tablet
 * and mobile sizes without resizing the window. `--mod-auth-min-height` and
 * `--mod-error-min-height` are set on the frame so full-height layouts fit.
 */
@Component({
  selector: 'demo-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'demo-example' },
  template: `
    <div class="demo-example__head">
      <div class="demo-example__titles">
        <h2 class="demo-example__title">
          {{ heading() }}
          @if (badge()) {
            <span class="sidebar-link__badge">{{ badge() }}</span>
          }
        </h2>
        @if (description()) {
          <p class="demo-example__desc">{{ description() }}</p>
        }
      </div>

      <div class="demo-example__tools">
        <div class="demo-example__seg" role="group" aria-label="View">
          <button type="button" [attr.aria-pressed]="view() === 'preview'" (click)="view.set('preview')">Preview</button>
          <button type="button" [attr.aria-pressed]="view() === 'code'" (click)="view.set('code')">Code</button>
        </div>
        @if (view() === 'preview') {
          @if (!fixedWidth()) {
            <div class="demo-example__seg" role="group" aria-label="Preview width">
              <button type="button" [attr.aria-pressed]="width() === 'desktop'" aria-label="Desktop width" title="Desktop" (click)="width.set('desktop')">
                <span class="icon dga-icon-computer" aria-hidden="true"></span>
              </button>
              <button type="button" [attr.aria-pressed]="width() === 'tablet'" aria-label="Tablet width" title="Tablet" (click)="width.set('tablet')">
                <span class="icon dga-icon-tablet-01" aria-hidden="true"></span>
              </button>
              <button type="button" [attr.aria-pressed]="width() === 'mobile'" aria-label="Mobile width" title="Mobile" (click)="width.set('mobile')">
                <span class="icon dga-icon-smart-phone-01" aria-hidden="true"></span>
              </button>
            </div>
          }
          @if (!hideLanguage()) {
            <button type="button" class="demo-example__lang" [attr.aria-pressed]="rtl()" (click)="rtl.set(!rtl())">
              <span class="icon dga-icon-language-square" aria-hidden="true"></span>
              {{ rtl() ? 'English' : 'عربي' }}
            </button>
          }
        } @else {
          <button type="button" class="demo-example__lang" (click)="copy()">
            <span class="icon" [class]="copied() ? 'dga-icon-tick-02' : 'dga-icon-copy-01'" aria-hidden="true"></span>
            {{ copied() ? 'Copied' : 'Copy code' }}
          </button>
        }
      </div>
    </div>

    <div class="demo-example__stage" [hidden]="view() !== 'preview'">
      <div
        class="demo-example__frame"
        [class.demo-example__frame--tablet]="width() === 'tablet'"
        [class.demo-example__frame--mobile]="width() === 'mobile'"
        [attr.dir]="rtl() ? 'rtl' : 'ltr'"
        [attr.lang]="rtl() ? 'ar' : 'en'"
        [style.--mod-auth-min-height]="minHeight()"
        [style.--mod-error-min-height]="minHeight()"
      >
        <ng-content />
      </div>
    </div>

    @if (view() === 'code') {
      <pre class="demo-example__code" tabindex="0"><code>{{ code() }}</code></pre>
    }
  `,
  styles: `
    :host {
      display: block;
      margin-block-end: var(--spacing-5xl);
      border: 1px solid var(--color-border-secondary);
      border-radius: var(--radius-lg);
      background: var(--color-bg-primary);
      overflow: hidden;
    }

    .demo-example__head {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--spacing-xl);
      padding: var(--spacing-3xl) var(--spacing-4xl);
      border-block-end: 1px solid var(--color-border-secondary);
    }

    .demo-example__title {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin: 0 0 var(--spacing-xs);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-900);
    }

    .demo-example__desc {
      margin: 0;
      max-width: 72ch;
      font-size: var(--font-size-sm);
      line-height: 1.6;
      color: var(--color-text-secondary);
    }

    .demo-example__tools {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-md);
    }

    .demo-example__seg {
      display: inline-flex;
      padding: 2px;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm);
      background: var(--gray-50);
    }

    .demo-example__seg button,
    .demo-example__lang {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      min-height: 32px;
      padding: 0 var(--spacing-lg);
      border-radius: 3px;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--gray-600);
    }

    .demo-example__seg .icon,
    .demo-example__lang .icon {
      font-size: 18px;
    }

    .demo-example__seg button[aria-pressed='true'] {
      background: var(--alpha-white);
      color: var(--gray-900);
      box-shadow: 0 1px 2px rgba(16, 24, 40, 0.1);
    }

    .demo-example__lang {
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm);
      background: var(--alpha-white);
    }

    .demo-example__seg button:hover,
    .demo-example__lang:hover {
      color: var(--gray-900);
    }

    .demo-example__seg button:focus-visible,
    .demo-example__lang:focus-visible {
      outline: 2px solid var(--border-black);
      outline-offset: 2px;
    }

    .demo-example__stage {
      padding: var(--spacing-3xl);
      background: var(--gray-100);
      overflow-x: auto;
    }

    .demo-example__frame {
      margin-inline: auto;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      background: var(--alpha-white);
      overflow: hidden;
      transition: max-width 200ms ease;
    }

    .demo-example__frame--tablet {
      max-width: 820px;
    }

    .demo-example__frame--mobile {
      max-width: 390px;
    }

    .demo-example__code {
      margin: 0;
      max-height: 640px;
      padding: var(--spacing-3xl) var(--spacing-4xl);
      overflow: auto;
      background: #0c1317;
      color: #e3e8eb;
      font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
      font-size: 13px;
      line-height: 1.7;
      direction: ltr;
      text-align: left;
      white-space: pre;
      tab-size: 2;
    }

    @media (prefers-reduced-motion: reduce) {
      .demo-example__frame {
        transition: none;
      }
    }
  `,
})
export class DemoExample {
  private readonly destroyRef = inject(DestroyRef);

  readonly heading = input.required<string>();
  readonly description = input('');
  readonly badge = input('');
  /** Source shown in the Code tab. */
  readonly code = input('');
  /** Arabic / RTL preview (two-way bindable so the example can switch its texts). */
  readonly rtl = model(false);
  /** Min height given to full-height layouts inside the frame. */
  readonly minHeight = input('720px');
  /** Hides the width switch (for examples that have a fixed width, e.g. emails). */
  readonly fixedWidth = input(false, { transform: booleanAttribute });
  /** Hides the language switch (for examples that show both languages themselves). */
  readonly hideLanguage = input(false, { transform: booleanAttribute });

  protected readonly view = signal<ExampleView>('preview');
  protected readonly width = signal<ExampleWidth>('desktop');
  protected readonly copied = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 1600);
    } catch {
      /* clipboard not available (insecure context) */
    }
  }
}
