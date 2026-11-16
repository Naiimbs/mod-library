# @mod-internal/ui

The Design System for Angular: a complete component library in the brand
colours and the Saudi MOD typeface.

- **60+ components** — buttons, form inputs, date pickers, tables, navigation, modals,
  toasts, page templates
- **Angular 20, 21 and 22** — standalone components, signals, OnPush
- **Arabic and English** — full RTL support, typeface covers both scripts
- **Dark mode** — one attribute on `<html>`
- **Forms ready** — every input works with reactive forms, `ngModel` and two-way binding
- **No runtime dependencies** besides Angular itself

```html
<button mod-button variant="primary">Save</button>
<mod-text-input label="Full name" [(value)]="name" />
```

---

## Contents

1. [Brand](#brand)
2. [Requirements](#requirements)
3. [Quick start](#quick-start) — the five steps, in short
4. [Step by step](#step-by-step)
   - [1. Get the package](#1-get-the-package)
   - [2. Install it in your application](#2-install-it-in-your-application)
   - [3. Add the styles](#3-add-the-styles)
   - [4. Use your first component](#4-use-your-first-component)
   - [5. Check that it works](#5-check-that-it-works)
5. [Using the library](#using-the-library)
   - [Buttons and icons](#buttons-and-icons)
   - [Forms](#forms)
   - [Tables](#tables)
   - [Modal, toast and tooltip](#modal-toast-and-tooltip)
   - [Arabic and RTL](#arabic-and-rtl)
   - [Dark mode](#dark-mode)
   - [Brand colours and tokens in your own styles](#brand-colours-and-tokens-in-your-own-styles)
   - [Applications that use NgModules](#applications-that-use-ngmodules)
6. [Component reference](#component-reference)
7. [Troubleshooting](#troubleshooting)
8. [Updating the library](#updating-the-library)
9. [Working on the library itself](#working-on-the-library-itself)

---

## Brand

| Colour | Value | CSS variable | Where the library uses it |
| --- | --- | --- | --- |
| Dark green | `#29504D` | `--mod-dark-green`, `--mod-primary` | **Primary colour**: buttons, selected items, links, checked controls, dark surfaces |
| Light green | `#00A05A` | `--mod-light-green` | Accent only: small marks and rules |
| Grey | `#B2BEC4` | `--mod-grey` | Borders and dividers |
| White | `#FFFFFF` | `--mod-white` | Surfaces, text on green |

### Primary colour and its states

The whole `--sa-*` scale is generated from the dark green, and each state of a primary
control has a named token:

| State | Token | Value (light mode) |
| --- | --- | --- |
| Default fill | `--mod-primary` | `--sa-600` `#29504D` |
| Hover | `--mod-primary-hover` | `--sa-700` `#214341` |
| Pressed | `--mod-primary-pressed` | `--sa-800` `#1A3634` |
| Text on a primary fill | `--mod-on-primary` | `#FFFFFF` (8.9:1) |
| Text / link on a surface | `--mod-primary-text`, `--mod-primary-text-hover` | `--sa-600`, `--sa-700` |
| Selected / quiet fill | `--mod-primary-subtle` | `--sa-50` `#EEF4F4` |
| Quiet hover, quiet pressed | `--mod-primary-subtle-hover`, `--mod-primary-subtle-pressed` | `--sa-100`, `--sa-200` |
| Focus outline (2px, 2px away) | `--mod-focus` | `--sa-600` |
| Focus halo of text fields | `--mod-focus-ring` | 3px, dark green at 24% |
| Disabled | `--mod-disabled-bg`, `--mod-disabled-text`, `--mod-disabled-border` | neutral greys |

In dark mode the primary is lifted to `#46807A` (the scale's 500) so it stays visible on
dark surfaces, and primary-coloured text uses `--sa-300` `#A0C1BD`.

**Typeface:** Saudi MOD, in seven weights (Thin to Heavy). It ships inside the package and
loads automatically — you do not add any font link.

---

## Requirements

| | |
| --- | --- |
| Angular | 20.x, 21.x or 22.x |
| Node.js | 20.19+, 22.12+ or 24+ |
| `@angular/forms` | Required. It is installed by default in projects created with `ng new`. |

Projects on Angular 19 or older must upgrade first:
`ng update @angular/core @angular/cli`.

---

## Quick start

For readers who know Angular and want the short version. Each step is explained in detail
in [Step by step](#step-by-step).

1. Build the package (once, in this repository):

   ```bash
   npm run build:ui
   ```

   ```bash
   npm run pack:ui
   ```

2. Install it in your application:

   ```bash
   npm install path/to/mod-internal-ui-0.1.0.tgz
   ```

3. Add the styles to `angular.json` (`architect → build → options → styles`):

   ```json
   "styles": [
     "node_modules/@mod-internal/ui/styles/mod.css",
     {
       "input": "node_modules/@mod-internal/ui/styles/icons.css",
       "bundleName": "mod-icons",
       "inject": false
     },
     "src/styles.css"
   ]
   ```

4. Load the icons from `src/index.html`, inside `<head>`:

   ```html
   <link rel="stylesheet" href="mod-icons.css">
   ```

5. Import components where you use them:

   ```ts
   import { ModButton, ModTextInput } from '@mod-internal/ui';
   ```

---

## Step by step

### 1. Get the package

The package is not on a public registry. There are two ways to get it.

**Option A — build a tarball (simplest).** In the `mod-angular` folder of this repository:

```bash
npm install
```

```bash
npm run build:ui
```

```bash
npm run pack:ui
```

This creates `dist/ui/mod-internal-ui-0.1.0.tgz`. That one file is the whole library;
share it with your team, or copy it into your project (for example into a `vendor/`
folder) and commit it so everyone installs the same version.

**Option B — publish to a private registry.** If your organisation has an npm registry
(Azure Artifacts, Nexus, GitHub Packages, Verdaccio), publish once and install by name
everywhere:

```bash
npm run build:ui
```

```bash
npm publish dist/ui --registry https://your-registry.example.com/
```

Map the scope to that registry in your application's `.npmrc`:

```
@mod-internal:registry=https://your-registry.example.com/
```

### 2. Install it in your application

With the tarball:

```bash
npm install ./vendor/mod-internal-ui-0.1.0.tgz
```

Or from your registry:

```bash
npm install @mod-internal/ui
```

### 3. Add the styles

Open `angular.json` in your application. Find `projects → <your app> → architect → build →
options → styles` and make it look like this:

```json
"styles": [
  "node_modules/@mod-internal/ui/styles/mod.css",
  {
    "input": "node_modules/@mod-internal/ui/styles/icons.css",
    "bundleName": "mod-icons",
    "inject": false
  },
  "src/styles.css"
]
```

Then open `src/index.html` and add this line inside `<head>`:

```html
<link rel="stylesheet" href="mod-icons.css">
```

Restart `ng serve` after changing `angular.json`.

What the two files are:

| File | Size | Contents |
| --- | --- | --- |
| `mod.css` | about 150 kB, plus 7 font files | Colour and spacing tokens, the brand theme, the Saudi MOD typeface, a CSS reset, dark mode. **Required.** |
| `icons.css` | about 9 MB (400 kB compressed), plus 61 font files | The icon fonts. Needed by `<mod-icon>` and by every component that shows an icon: dropdown, checkbox, modal close button, alerts and others. |

The icon file is loaded as a separate bundle on purpose. If you put it in the `styles`
array as a plain string it still works, but it counts toward Angular's initial bundle
budget and a production build then fails with the default limit.

Each component brings its own styles. You do not import anything else.

**Smaller option: `mod-core.css`.** About 120 kB of `mod.css` is the base theme's utility
classes (`.text-md-semibold`, `.background-primary-25`, `.border-*`, ...) and widget styles
that no component uses. If your application only uses the components and not those
classes, load `mod-core.css` instead of `mod.css`:

```json
"styles": [
  "node_modules/@mod-internal/ui/styles/mod-core.css",
  ...
]
```

It has the same tokens, typeface, reset and dark mode, and the components render the same
with it. Only the utility classes are missing. Use `mod.css` if your templates use them.

### 4. Use your first component

Components are standalone. Import the ones you need into the `imports` array of the
component that uses them.

```ts
import { Component, signal } from '@angular/core';
import { ModButton, ModIcon, ModTextInput } from '@mod-internal/ui';

@Component({
  selector: 'app-root',
  imports: [ModButton, ModIcon, ModTextInput],
  template: `
    <button mod-button variant="primary" (click)="save()">
      <mod-icon name="add-01" /> Save
    </button>

    <mod-text-input label="Full name" placeholder="Enter your name" [(value)]="name" />
    <p>Hello {{ name() }}</p>
  `,
})
export class App {
  protected readonly name = signal('');

  protected save(): void {}
}
```

### 5. Check that it works

Run `ng serve` and open the page. You should see:

- a **dark green button** with a plus icon, which turns a darker green when you hover it;
- a labelled text field; typing in it updates the "Hello …" line;
- all text in the **Saudi MOD** typeface.

If the button is unstyled, the icon is missing, or the font looks wrong, see
[Troubleshooting](#troubleshooting).

---

## Using the library

### Buttons and icons

The button is an attribute on the native element, so it keeps native keyboard and form
behaviour:

```html
<button mod-button>Primary (default)</button>
<button mod-button variant="neutral">Neutral</button>
<button mod-button variant="secondary-solid">Secondary solid</button>
<button mod-button variant="secondary-outline">Secondary outline</button>
<button mod-button variant="subtle">Subtle</button>
<button mod-button variant="transparent">Transparent</button>

<button mod-button size="medium">Medium</button>
<button mod-button size="small">Small</button>

<button mod-button destructive>Delete</button>
<button mod-button loading>Saving</button>
<button mod-button disabled>Disabled</button>
<button mod-button iconOnly aria-label="Add"><mod-icon name="add-01" /></button>

<a mod-button variant="secondary-outline" href="/help">A link that looks like a button</a>
```

On dark green or other dark backgrounds, add `onColor`:

```html
<button mod-button onColor>On a dark surface</button>
```

Icons use the icon name without the `dga-icon-` prefix:

```html
<mod-icon name="search-01" />
<mod-icon name="settings-01" [size]="24" label="Settings" />
```

To find icon names, run the demo app (`npm start`) and open the **Icons** page; it has a
searchable list with click-to-copy.

Links, chips and header actions follow the same attribute pattern: `<a mod-link>`,
`<button mod-chip>`.

### Forms

Every input works in three ways. Pick whichever your project uses.

**Two-way binding (no forms module needed):**

```html
<mod-text-input label="Name" [(value)]="name" />
<mod-checkbox [(checked)]="agreed">I agree</mod-checkbox>
<mod-dropdown label="Region" [options]="regions" [(value)]="region" />
```

**Reactive forms:**

```ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ModButton,
  ModCheckbox,
  ModDatePicker,
  ModDropdown,
  ModDropdownOption,
  ModTextInput,
} from '@mod-internal/ui';

@Component({
  selector: 'app-request-form',
  imports: [ReactiveFormsModule, ModButton, ModTextInput, ModDropdown, ModDatePicker, ModCheckbox],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mod-text-input
        label="Email"
        type="email"
        formControlName="email"
        required
        [error]="form.controls.email.touched && form.controls.email.invalid"
        [helperText]="form.controls.email.touched && form.controls.email.invalid ? 'Enter a valid email' : ''"
      />
      <mod-dropdown label="Region" placeholder="Select a region" [options]="regions" formControlName="region" />
      <mod-date-picker label="Start date" formControlName="start" />
      <mod-checkbox formControlName="terms">I accept the terms</mod-checkbox>
      <button mod-button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `,
})
export class RequestForm {
  protected readonly regions: ModDropdownOption<string>[] = [
    { value: 'riyadh', label: 'Riyadh' },
    { value: 'makkah', label: 'Makkah' },
  ];

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    region: new FormControl<string | null>(null, Validators.required),
    start: new FormControl<Date | null>(null),
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  protected submit(): void {}
}
```

**Template-driven forms:** import `FormsModule` and use `[(ngModel)]` on the same
components.

Things to know:

- **Validation messages are yours to show.** The components do not read validator state.
  Bind the error flag and the message yourself, as the email field above does. Error
  inputs differ slightly between components (some take a message string); the props table
  on each demo page lists them.
- **Value types:** text input gives a `string` (a `number` or `null` when
  `type="number"`), checkbox a `boolean`, dropdown the option's `value` (an array with
  `multiple`), date picker a `Date | null`, file upload a `File[]`.
- **Form controls:** `mod-text-input`, `mod-textarea`, `mod-search-box`, `mod-dropdown`,
  `mod-checkbox`, `mod-checkbox-group`, `mod-radio-group`, `mod-rating`,
  `mod-date-picker`, `mod-date-range-picker`, `mod-file-upload`.

### Tables

```ts
import { Component, signal } from '@angular/core';
import { ModTable, ModTableColumn } from '@mod-internal/ui';

interface Request {
  id: number;
  title: string;
  status: string;
}

@Component({
  selector: 'app-requests',
  imports: [ModTable],
  template: `
    <mod-table [columns]="columns" [rows]="rows" [rowKey]="rowKey" selectable [(selected)]="selected" />
  `,
})
export class Requests {
  protected readonly columns: ModTableColumn<Request>[] = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'status', header: 'Status' },
  ];
  protected readonly rows: Request[] = [
    { id: 1, title: 'Leave request', status: 'Approved' },
    { id: 2, title: 'Equipment request', status: 'Pending' },
  ];
  protected readonly rowKey = (row: Request): number => row.id;
  protected readonly selected = signal<Request[]>([]);
}
```

Set `rowKey` when rows are reloaded from a server: selection is then matched by that key,
so reloaded copies of the same record stay selected and removed rows leave the selection.

### Modal, toast and tooltip

```ts
import { Component, inject, signal } from '@angular/core';
import {
  ModButton,
  ModModal,
  ModModalActions,
  ModToastContainer,
  ModToastService,
  ModTooltipDirective,
} from '@mod-internal/ui';

@Component({
  selector: 'app-root',
  imports: [ModButton, ModModal, ModModalActions, ModToastContainer, ModTooltipDirective],
  template: `
    <button mod-button variant="secondary-outline" modTooltip="Removes the request" (click)="confirmOpen.set(true)">
      Delete
    </button>

    <mod-modal [(open)]="confirmOpen" heading="Delete request?" description="This cannot be undone.">
      <mod-modal-actions>
        <button mod-button variant="secondary-outline" (click)="confirmOpen.set(false)">Cancel</button>
        <button mod-button destructive (click)="remove()">Delete</button>
      </mod-modal-actions>
    </mod-modal>

    <mod-toast-container position="top-end" />
  `,
})
export class App {
  private readonly toast = inject(ModToastService);
  protected readonly confirmOpen = signal(false);

  protected remove(): void {
    this.confirmOpen.set(false);
    this.toast.show({ title: 'Deleted', variant: 'critical' });
  }
}
```

- **Toast:** place **one** `<mod-toast-container />` in your root component. After that,
  inject `ModToastService` anywhere and call `show()`. Variants: `neutral`, `info`,
  `success`, `warning`, `critical`. Toasts dismiss themselves after five seconds; pass
  `duration: 0` to keep one until the user closes it.
- **Modal:** traps keyboard focus, closes on Escape and on a backdrop click (both can be
  turned off with `closeOnEscape` / `closeOnBackdrop`), locks page scrolling while open,
  and returns focus to where it was.
- **Tooltip:** add `modTooltip="text"` to any element. It shows on hover and on keyboard
  focus.

### Arabic and RTL

Direction is a plain HTML attribute. Set it once on the root element:

```html
<html lang="ar" dir="rtl">
```

Or switch at runtime:

```ts
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'ar';
```

Every component mirrors itself. `dir="rtl"` also works on any container, to mirror only
part of a page.

**Texts are not translated for you.** Labels, placeholders, aria-labels and built-in
words ("Browse files", "Clear", month names) are inputs with English defaults. Pass the
Arabic text through those inputs:

```html
<mod-file-upload
  instructions="اسحب الملفات وأفلتها هنا"
  browseLabel="استعراض الملفات"
  removeLabel="إزالة الملف"
/>
```

Each demo page's props table lists the text inputs a component has.

### Dark mode

Add one attribute to the root element:

```html
<html data-theme="dark">
```

```ts
document.documentElement.setAttribute('data-theme', 'dark');   // dark
document.documentElement.removeAttribute('data-theme');        // light
```

### Brand colours and tokens in your own styles

Use the library's CSS variables in your own components so your pages match and follow
dark mode automatically. Avoid hard-coding colour values.

```css
.panel {
  background: var(--mod-dark-green);
  color: var(--mod-white);
  border: 1px solid var(--mod-grey);
  border-radius: var(--radius-md);
  padding: var(--spacing-3xl);
  font-family: var(--font-family-primary);
}
```

| You need | Use |
| --- | --- |
| Exact brand colours | `--mod-light-green`, `--mod-dark-green`, `--mod-grey`, `--mod-white` |
| Primary action colour and its hover / pressed | `--color-primary`, `--color-primary-hover`, `--color-primary-active` |
| Green tints for backgrounds (light to dark) | `--sa-25`, `--sa-50`, `--sa-100`, `--sa-200` |
| Neutral greys (light to dark) | `--gray-25` … `--gray-950` |
| Status colours | `--success-600`, `--error-600`, `--warning-600`, `--info-600` (each has a 25–950 scale) |
| Spacing | `--spacing-xs` (4px), `--spacing-md` (8px), `--spacing-xl` (16px), `--spacing-3xl` (24px), `--spacing-4xl` (32px) |
| Corner radius | `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg`, `--radius-full` |
| Typeface | `--font-family-primary` |

Two notes on the scales:

- `--sa-600` is the brand dark green (the primary). 700 is its hover and 800 its pressed
  state; 25–500 are tints of the same hue.
- For green **text** use `--mod-primary-text`, which follows dark mode. On a dark-green
  surface use `--sa-300`.

The demo app's **Styles** and **Classes** pages show every token and utility class with
its live value and copy it on click.

### Applications that use NgModules

The components are standalone, and standalone components can be imported directly into a
module:

```ts
import { NgModule } from '@angular/core';
import { ModButton, ModTextInput } from '@mod-internal/ui';

@NgModule({
  declarations: [RequestPageComponent],
  imports: [ModButton, ModTextInput],
})
export class RequestsModule {}
```

---

## Component reference

Everything is exported from `@mod-internal/ui`. The class name is the selector in
PascalCase: `mod-text-input` → `ModTextInput`.

| Group | Selectors |
| --- | --- |
| Actions | `button[mod-button]`, `a[mod-button]`, `a[mod-link]`, `button[mod-chip]`, `mod-icon` |
| Form inputs | `mod-text-input`, `mod-textarea`, `mod-search-box`, `mod-dropdown`, `mod-checkbox`, `mod-checkbox-group`, `mod-radio`, `mod-radio-group`, `mod-rating`, `mod-file-upload`, `mod-otp-input` |
| Dates | `mod-date-picker`, `mod-date-range-picker`, `mod-calendar`, `mod-date-field` |
| Navigation | `mod-nav-header`, `[mod-header-action]`, `mod-second-nav-header`, `mod-nav-drawer`, `mod-sidebar`, `mod-sidebar-nav`, `mod-slideout-menu`, `mod-footer`, `mod-breadcrumbs`, `mod-tabs` + `mod-tab`, `mod-pagination` |
| Menus | `mod-menu`, `mod-menu-item`, `mod-menu-group`, `mod-menu-divider`, `mod-menu-switch`, `mod-menu-anchor` + `[modMenuTrigger]` |
| Feedback | `mod-modal` + `mod-modal-actions`, `[modTooltip]`, `mod-tooltip`, `mod-notification`, `mod-toast` + `mod-toast-container` + `ModToastService`, `mod-inline-alert`, `mod-progress-bar`, `mod-circular-progress`, `mod-progress-indicator`, `mod-skeleton` |
| Data display | `mod-card`, `mod-table`, `mod-tag`, `mod-status-tag`, `mod-avatar`, `mod-avatar-group`, `mod-accordion` + `mod-accordion-item`, `mod-filters` |
| Application UI | `mod-app-shell` (side bar, top bar and main area; slots `[modAppShellLogo]`, `[modAppShellLogoMark]`, `[modAppShellFooter]`, `[modAppShellTitle]`, `[modAppShellSearch]`, `[modAppShellActions]`), `mod-page-header`, `mod-stat-card`, `mod-bar-list`, `mod-column-chart`, `mod-description-list` + `mod-description-item`, `mod-timeline` + `mod-timeline-item`, `mod-empty-state` |
| Government | `mod-digital-stamp` |
| Page templates | `mod-auth-layout` + `mod-auth-header` (sign-in, sign-up, verification and password pages), `mod-error-page` (404 / 403 / 500), `mod-form-template` (+ `mod-form-row`, `mod-form-feedback`, `mod-service-tabs`), `mod-service-page`, `mod-screen` (+ `mod-screen-grid`, `mod-screen-placeholder`) |

**Ready-made pages**

The demo app has a **Shared page examples** section with complete pages built from these
components, each in English and Arabic and with a Code tab to copy from: log in (the
default sign-in first), sign up, verification, forgot password, 404 / 403 / 500 sections,
and HTML email templates.

**Where to find each component's inputs and outputs**

- **The demo app.** Run `npm start` in `mod-angular` and open http://localhost:4200. Every
  component page has a live demo with a control panel, a props table and examples.
- **Your editor.** The package includes type definitions, so inputs, outputs and their
  allowed values appear in autocomplete.

**Conventions shared by all components**

- Boolean inputs can be written as bare attributes: `<button mod-button destructive>`.
- Two-way values use the banana-in-a-box syntax: `[(value)]`, `[(checked)]`, `[(open)]`,
  `[(page)]`, `[(selected)]`.
- Icon inputs take the icon name without the `dga-icon-` prefix.

---

## Troubleshooting

**The build fails with `bundle initial exceeded maximum budget`**
`icons.css` is in the `styles` array as a plain string. Load it as a separate bundle as
shown in [step 3](#3-add-the-styles), or raise the `initial` budget in `angular.json`.
If the icons are already separate and you are still near the limit, load `mod-core.css`
instead of `mod.css` (about 120 kB smaller, see step 3).

**Icons show as empty squares, or not at all**
The icon stylesheet is not loaded. Check that the `mod-icons` entry is in `angular.json`
and that `index.html` has `<link rel="stylesheet" href="mod-icons.css">`. Restart
`ng serve` after editing `angular.json`.

**Components are unstyled, or colours are missing**
`mod.css` is not loaded. Every component reads its colours and spacing from it. Check the
path in `angular.json` and restart `ng serve`.

**Text is not in the Saudi MOD typeface**
The fonts load from `mod.css`, so first check that file is loaded (see above). If your own
stylesheet sets `font-family` on `body`, remove it or use
`font-family: var(--font-family-primary)`.

**`'mod-…' is not a known element`**
The component class is missing from the `imports` array of the component (or module) whose
template uses it.

**`Can't bind to 'formControlName'`**
Add `ReactiveFormsModule` (or `FormsModule` for `ngModel`) to the same `imports` array.

**A production build became slow after adding the icons**
Expected. Minifying the 9 MB icon stylesheet took about two minutes on the test machine.
`ng serve` is not affected the same way.

**The build runs out of memory**
The icon stylesheet is large. Close other heavy applications, or give Node more memory:
`NODE_OPTIONS=--max-old-space-size=4096`.

**`npm install` reports a peer dependency conflict**
The package supports Angular 20 to 22. Upgrade older projects first.

**Plain markup with design-system classes (`class="btn btn-primary"`) is unstyled**
Component styles load when the Angular component is rendered. Use the component
(`<button mod-button>`) instead of raw class names.

**Green text is hard to read in dark mode**
You are using a dark-green step (`--sa-700` to `--sa-950`, or `--color-primary-hover`) as a
text colour. Use `--sa-600`, or `--sa-300` on dark surfaces.

---

## Updating the library

1. Raise `version` in `projects/ui/package.json`.
2. Run `npm run build:ui`, then `npm run pack:ui` (or publish to your registry).
3. In the application, install the new tarball, or run
   `npm install @mod-internal/ui@latest`.

---

## Working on the library itself

Run these in the `mod-angular` folder.

| Command | What it does |
| --- | --- |
| `npm start` | Runs the demo app at http://localhost:4200 against the library source |
| `npm run build:ui` | Checks the vendored theme, regenerates `DGATheme.core.css`, then builds the library to `dist/ui` |
| `npm run gen:core-theme` | Regenerates `DGATheme.core.css` (the reduced base theme behind `mod-core.css`) on its own |
| `npm run gen:skill` | Regenerates the Claude skill references in `claude-plugin/skills/mod-ui/references/` from the library source |
| `npm run pack:ui` | Creates the installable `.tgz` in `dist/ui` |
| `npm run gen:dark-text` | Regenerates the dark-mode text rules; run it after changing component styles that use the dark greens as a text colour |
| `npm run check:vendor` | Verifies the edits this library needs inside the vendored base theme |
| `npm run gen:routes` | Regenerates the demo routes after adding a page folder |

Where things are:

| Path | Contents |
| --- | --- |
| `projects/ui/src/lib/<component>/` | One folder per component: code, template, styles |
| `projects/ui/src/styles/css/mod-theme.css` | The brand: colours, scales, typeface |
| `projects/ui/src/styles/assets/fonts-mod/` | The Saudi MOD font files |
| `projects/ui/src/styles/utilities/DGATheme.css` | The vendored base theme the tokens build on |
| `projects/ui/src/styles/utilities/DGATheme.core.css` | Generated by `tools/gen-core-theme.mjs`: the base theme reduced to the rules components can match. Do not edit |
| `projects/demo/` | The demo and documentation app |

`CONVENTIONS.md`, next to this file, describes how components are structured.

**Known limitations**

- The light green is an accent only: white text on it is about 3.4:1, below WCAG AA, so do
  not use it as a fill behind text.
- The library has no automated tests yet.
- Version 0.1.0: input names may still change between versions.
