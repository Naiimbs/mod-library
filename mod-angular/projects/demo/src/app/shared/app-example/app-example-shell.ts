/**
 * Shared frame of the "Application UI" examples: the referral-portal-like application
 * shell (`mod-app-shell`) with the real menu groups, the emblem placeholder, the
 * system name, the data-scope tag, the language button, the notification bell
 * and the user menu. The page content goes in the default slot.
 *
 *   <demo-app-example-shell [lang]="lang()" role="admin" [(activeId)]="page" (languageToggle)="languageToggle.emit()">
 *     <mod-page-header heading="Users" />
 *     …
 *   </demo-app-example-shell>
 *
 * Inputs
 * - `lang`: 'en' | 'ar'. Texts only; the direction comes from the `dir` of the preview frame.
 * - `role`: 'directorate' | 'coordinator' | 'admin' (default 'admin'). Chooses the menu and the signed-in user
 *   (see `APP_USERS` and `appMenu()` in app-example-data.ts).
 * - `activeId` (model): id of the current side bar item (`AppNavId`), e.g. 'dashboard', 'users', 'notification-settings'.
 * - `pending`: number shown as the badge of "Pending actions" (coordinator menu). Default 0 (no badge).
 * - `collapsed` (model): side bar collapsed to the icon rail.
 *
 * Outputs
 * - `languageToggle`: the language button was pressed. Re-emit it from the example and let the page flip
 *   the `rtl` model of `<demo-example>` (see dashboards-01.page.ts).
 * - `itemSelect`: a side bar item was chosen (after `activeId` changed).
 *
 * Slots
 * - default: the page (rendered inside the shell's `<main>`; start it with one `<mod-page-header>`, which holds the h1).
 *
 * Height: the shell fills the preview frame. `<demo-example minHeight="900px">` sets `--mod-auth-min-height`
 * on the frame and this component maps it to `--mod-app-shell-height`.
 *
 * Layout helpers (global classes defined here, usable in any example rendered inside this shell). The widths are
 * those of the shell's main area (container `mod-app-content`), not of the window:
 * - `.app-ex-stack`: vertical stack with a 24px gap.
 * - `.app-ex-kpis`: responsive row of `mod-stat-card` tiles (auto-fit, min 200px).
 * - `.app-ex-cols`: two equal columns, one under 860px. `.app-ex-cols--main`: 2fr + 1fr.
 * - `.app-ex-panel`: white bordered section card; inside it `.app-ex-panel__head` (with `h2.app-ex-panel__title`,
 *   `.app-ex-panel__meta` and any action at the end) and `.app-ex-panel__body`. `.app-ex-panel--flush` removes the
 *   body padding (tables, lists).
 * - `.app-ex-toolbar`: wrapping row for filters (`.app-ex-toolbar__label` for its caption).
 * - `.app-ex-seg`: segmented button group (buttons with `aria-pressed`).
 * - `.app-ex-sr`: visually hidden text.
 */
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {
  ModAppShell,
  ModAppShellActions,
  ModAppShellFooter,
  ModAppShellItem,
  ModAppShellLogo,
  ModAppShellLogoMark,
  ModAppShellTitle,
  ModAvatar,
  ModButton,
  ModIcon,
  ModMenu,
  ModMenuAnchor,
  ModMenuDivider,
  ModMenuItem,
  ModMenuTrigger,
  ModTag,
} from '@mod-internal/ui';
import { APP_NOTICES, APP_TEXT, APP_USERS, AppLang, AppRole, HOSPITALS, appMenu } from './app-example-data';

@Component({
  selector: 'demo-app-example-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ModAppShell,
    ModAppShellLogo,
    ModAppShellLogoMark,
    ModAppShellFooter,
    ModAppShellTitle,
    ModAppShellActions,
    ModAvatar,
    ModButton,
    ModIcon,
    ModMenu,
    ModMenuAnchor,
    ModMenuDivider,
    ModMenuItem,
    ModMenuTrigger,
    ModTag,
  ],
  template: `
    <mod-app-shell
      class="app-ex-shell"
      [groups]="groups()"
      [(activeId)]="activeId"
      [(collapsed)]="collapsed"
      [navLabel]="t().navLabel"
      [collapseLabel]="t().collapse"
      [expandLabel]="t().expand"
      [openMenuLabel]="t().openMenu"
      [closeMenuLabel]="t().closeMenu"
      [skipLabel]="t().skip"
      (itemSelect)="itemSelect.emit($event)"
    >
      <span modAppShellLogo class="app-ex-brand">
        <img src="examples/emblem-placeholder.svg" width="40" height="41" [alt]="t().logoAlt" />
        <span class="app-ex-brand__name">{{ t().appShort }}</span>
      </span>
      <img modAppShellLogoMark src="examples/emblem-placeholder.svg" width="36" height="37" [alt]="t().logoAlt" />
      <span modAppShellFooter>{{ t().version }}</span>

      <span modAppShellTitle class="app-ex-title">
        <span class="app-ex-title__name" [attr.title]="t().appName">{{ t().appName }}</span>
        <mod-tag class="app-ex-title__scope" variant="neutral" size="sm" icon="hospital-01" [attr.title]="t().scopeTitle">
          <span class="app-ex-sr">{{ t().scopeTitle }}: </span>{{ scope() }}
        </mod-tag>
      </span>

      <button
        modAppShellActions
        mod-button
        variant="subtle"
        size="medium"
        type="button"
        [attr.lang]="lang() === 'ar' ? 'en' : 'ar'"
        [attr.aria-label]="t().switchLabel"
        (click)="languageToggle.emit()"
      >
        <mod-icon name="language-square" /> <span class="app-ex-hide-narrow">{{ t().switchTo }}</span>
      </button>

      <mod-menu-anchor modAppShellActions [(open)]="bellOpen">
        <button
          mod-button
          modMenuTrigger
          class="app-ex-bell"
          variant="subtle"
          size="medium"
          iconOnly
          type="button"
          [attr.aria-label]="unread() ? t().unread(unread()) : t().notifications"
        >
          <mod-icon name="notification-03" />
          @if (unread()) {
            <span class="app-ex-bell__count" aria-hidden="true">{{ unread() }}</span>
          }
        </button>
        <mod-menu class="app-ex-menu-end app-ex-notices" [aria-label]="t().notifications">
          @for (notice of notices(); track notice.id) {
            <mod-menu-item icon="notification-03" [trailText]="notice.time">{{ notice.text }}</mod-menu-item>
          }
          <mod-menu-divider />
          <mod-menu-item icon="tick-02" [disabled]="!unread()" (activated)="unread.set(0)">{{ t().markAllRead }}</mod-menu-item>
        </mod-menu>
      </mod-menu-anchor>

      <mod-menu-anchor modAppShellActions [(open)]="userOpen">
        <button modMenuTrigger class="app-ex-user" type="button" [attr.aria-label]="t().userMenu + ': ' + user().name">
          <mod-avatar size="32" [initials]="user().initials" />
          <span class="app-ex-user__text app-ex-hide-narrow">
            <span class="app-ex-user__name">{{ user().name }}</span>
            <span class="app-ex-user__role">{{ user().role }}</span>
          </span>
          <mod-icon class="app-ex-hide-narrow" name="arrow-down-01" />
        </button>
        <mod-menu class="app-ex-menu-end" [aria-label]="t().userMenu">
          @if (user().hospital) {
            <mod-menu-item icon="hospital-01">{{ t().myHospital }}</mod-menu-item>
          }
          <mod-menu-item icon="logout-03">{{ t().signOut }}</mod-menu-item>
        </mod-menu>
      </mod-menu-anchor>

      <ng-content />
    </mod-app-shell>
  `,
  styles: `
    demo-app-example-shell {
      display: block;
    }

    .app-ex-shell {
      --mod-app-shell-height: var(--mod-auth-min-height, 900px);
    }

    .app-ex-sr {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* --- Shell pieces --- */
    .app-ex-brand {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      min-width: 0;
    }

    .app-ex-brand__name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .app-ex-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      min-width: 0;
    }

    .app-ex-title__name {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .app-ex-title__scope {
      flex: none;
    }

    .app-ex-bell {
      position: relative;
    }

    .app-ex-bell__count {
      position: absolute;
      inset-block-start: 2px;
      inset-inline-end: 2px;
      min-width: 16px;
      padding: 0 4px;
      border-radius: var(--radius-full);
      background: var(--mod-dark-green);
      color: var(--mod-white);
      font-size: 11px;
      line-height: 16px;
      font-weight: var(--font-weight-semibold);
    }

    /* Menus opened from the end of the top bar grow towards the start. */
    .menu-anchor .menu.app-ex-menu-end {
      inset-inline-start: auto;
      inset-inline-end: 0;
    }

    .app-ex-notices {
      width: min(360px, 80vw);
    }

    .app-ex-notices .menu-item__label {
      white-space: normal;
    }

    .app-ex-user {
      display: flex;
      border: 0;
      background: transparent;
      font: inherit;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--radius-sm);
      color: var(--gray-700);
      text-align: start;
      cursor: pointer;
    }

    .app-ex-user:hover {
      background: var(--gray-100);
    }

    .app-ex-user:focus-visible {
      outline: 2px solid var(--border-black);
      outline-offset: 2px;
    }

    .app-ex-user__text {
      display: grid;
      max-width: 200px;
    }

    .app-ex-user__name {
      font-size: 14px;
      line-height: 20px;
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .app-ex-user__role {
      font-size: 12px;
      line-height: 16px;
      color: var(--gray-500);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @container mod-app-shell (max-width: 899px) {
      .app-ex-hide-narrow,
      .app-ex-title__scope {
        display: none;
      }
    }

    /* --- Layout helpers for the page content --- */
    .app-ex-stack {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-3xl);
    }

    .app-ex-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-xl);
    }

    .app-ex-cols {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--spacing-3xl);
      align-items: start;
    }

    .app-ex-cols--main {
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    }

    .app-ex-panel {
      min-width: 0;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      background: var(--alpha-white);
      color: var(--gray-900);
    }

    .app-ex-panel__head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md) var(--spacing-xl);
      padding: var(--spacing-xl) var(--spacing-2xl);
      border-block-end: 1px solid var(--gray-200);
    }

    .app-ex-panel__title {
      margin: 0;
      font-size: 16px;
      line-height: 24px;
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .app-ex-panel__meta {
      margin: 0;
      font-size: 13px;
      line-height: 20px;
      color: var(--gray-500);
    }

    .app-ex-panel__body {
      padding: var(--spacing-2xl);
    }

    .app-ex-panel--flush .app-ex-panel__body {
      padding: 0;
      overflow-x: auto;
    }

    .app-ex-panel--flush .table-wrapper {
      border: 0;
      border-radius: 0;
    }

    .app-ex-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-md) var(--spacing-lg);
    }

    .app-ex-toolbar__label {
      font-size: 14px;
      line-height: 20px;
      font-weight: var(--font-weight-medium);
      color: var(--gray-600);
    }

    .app-ex-seg {
      display: inline-flex;
      padding: 2px;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm);
      background: var(--gray-50);
    }

    .app-ex-seg button {
      min-height: 32px;
      padding: 0 var(--spacing-lg);
      border-radius: 3px;
      font-size: 14px;
      font-weight: var(--font-weight-medium);
      color: var(--gray-600);
      white-space: nowrap;
      cursor: pointer;
    }

    .app-ex-seg button:hover {
      color: var(--gray-900);
    }

    .app-ex-seg button[aria-pressed='true'] {
      background: var(--alpha-white);
      color: var(--gray-900);
      box-shadow: 0 1px 2px rgba(16, 24, 40, 0.1);
    }

    .app-ex-seg button:focus-visible {
      outline: 2px solid var(--border-black);
      outline-offset: 2px;
    }

    @container mod-app-content (max-width: 859px) {
      .app-ex-cols,
      .app-ex-cols--main {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    @container mod-app-content (max-width: 479px) {
      .app-ex-kpis {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--spacing-lg);
      }

      .app-ex-panel__head,
      .app-ex-panel__body {
        padding-inline: var(--spacing-xl);
      }
    }
  `,
})
export class AppExampleShell {
  readonly lang = input<AppLang>('en');
  readonly role = input<AppRole>('admin');
  readonly activeId = model<string>('');
  readonly pending = input(0);
  readonly collapsed = model(false);

  readonly languageToggle = output<void>();
  readonly itemSelect = output<ModAppShellItem>();

  protected readonly bellOpen = signal(false);
  protected readonly userOpen = signal(false);
  protected readonly unread = signal(APP_NOTICES.length);

  protected readonly t = computed(() => APP_TEXT[this.lang()]);
  protected readonly groups = computed(() => appMenu(this.lang(), this.role(), this.pending()));

  protected readonly user = computed(() => {
    const lang = this.lang();
    const user = APP_USERS[this.role()];
    return {
      name: user.name[lang],
      initials: user.initials[lang],
      role: user.role[lang],
      hospital: user.hospital,
    };
  });

  /** The data scope of the user: the own hospital, or all hospitals. */
  protected readonly scope = computed(() => {
    const hospital = this.user().hospital;
    return hospital ? HOSPITALS[hospital][this.lang()] : this.t().scopeAll;
  });

  protected readonly notices = computed(() => {
    const lang = this.lang();
    return APP_NOTICES.map((notice) => ({ id: notice.id, text: notice.text[lang], time: notice.time[lang] }));
  });
}
