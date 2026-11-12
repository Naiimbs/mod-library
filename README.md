# MOD Internal Design System

An Angular component library in the MOD brand colours and the Saudi MOD typeface, with a
demo app that shows every component live.

- **Package:** `@mod-internal/ui`
- **Location in this repository:** [`mod-angular/`](mod-angular/)
- **Angular:** 20, 21 and 22
- **Languages:** Arabic and English, with full RTL support
- **Dark mode:** built in

```html
<button mod-button variant="primary">Save</button>
<mod-text-input label="Full name" [(value)]="name" />
```

> This branch (`feature/mod-library-angular`) contains the MOD Internal library only. The
> DGA Angular library lives on its own branch, `feature/angular-library`.

## Brand

| Colour | Value | CSS variable | Where the library uses it |
| --- | --- | --- | --- |
| Dark green | `#29504D` | `--mod-dark-green`, `--mod-primary` | **Primary colour**: buttons, selected items, links, checked controls, dark surfaces |
| Light green | `#00A05A` | `--mod-light-green` | Accent only: small marks and rules |
| Grey | `#B2BEC4` | `--mod-grey` | Borders and dividers |
| White | `#FFFFFF` | `--mod-white` | Surfaces, text on green |

**Typeface:** Saudi MOD, seven weights. It ships inside the package and loads
automatically; no font link is needed.

## What is in `mod-angular/`

| Path | What it is |
| --- | --- |
| [`mod-angular/projects/ui/`](mod-angular/projects/ui/) | The `@mod-internal/ui` library: components, brand theme, fonts and icon styles |
| [`mod-angular/projects/demo/`](mod-angular/projects/demo/) | Demo and documentation app: a live demo with a control panel, a props table and examples for each component |
| [`mod-angular/projects/ui/src/styles/css/mod-theme.css`](mod-angular/projects/ui/src/styles/css/mod-theme.css) | The MOD brand: colours, scales and typeface |
| `mod-angular/tools/` | Helper scripts used by the npm commands |
| [`design-system/`](design-system/) | The vanilla HTML/CSS/JS design system this branch is based on (unchanged) |

## Use the library in your Angular project

The complete guide is
**[mod-angular/projects/ui/README.md](mod-angular/projects/ui/README.md)**. It covers
installation, styles, forms, tables, modal and toast, Arabic and RTL, dark mode, brand
tokens, the full component list and troubleshooting.

The essentials:

**1. Build the package** (once, from this repository):

```bash
cd mod-angular
```

```bash
npm install
```

```bash
npm run build:ui
```

```bash
npm run pack:ui
```

This creates `mod-angular/dist/ui/mod-internal-ui-0.1.0.tgz`.

**2. Install it in your application:**

```bash
npm install path/to/mod-internal-ui-0.1.0.tgz
```

**3. Add the styles** to your `angular.json` (`architect → build → options → styles`):

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

**4. Load the icons** from `src/index.html`, inside `<head>`:

```html
<link rel="stylesheet" href="mod-icons.css">
```

**5. Use the components:**

```ts
import { Component, signal } from '@angular/core';
import { ModButton, ModIcon, ModTextInput } from '@mod-internal/ui';

@Component({
  selector: 'app-root',
  imports: [ModButton, ModIcon, ModTextInput],
  template: `
    <button mod-button variant="primary">
      <mod-icon name="add-01" /> Save
    </button>

    <mod-text-input label="Full name" placeholder="Enter your name" [(value)]="name" />
  `,
})
export class App {
  protected readonly name = signal('');
}
```

Run `ng serve`. You should see a dark green button that turns darker on hover, a
labelled text field, and all text in the Saudi MOD typeface.

## Run the demo

```bash
cd mod-angular
```

```bash
npm install
```

```bash
npm start
```

Open http://localhost:4200. Every component page has a live demo with a control panel, a
props table and examples. The **Styles**, **Classes** and **Icons** pages list every
token, utility class and icon, with click-to-copy.

Requirements: Node.js 20.19+, 22.12+ or 24+. The demo build uses a large icon stylesheet
and needs roughly 2 GB of free memory.

## Components

- **Actions:** button, link, chip, icon
- **Form inputs:** text input, textarea, search box, dropdown, checkbox, radio, rating,
  file upload, date picker, date range picker
- **Navigation:** nav header, second nav header, nav drawer, sidebar, slideout menu,
  footer, breadcrumbs, tabs, pagination, menus
- **Feedback:** modal, tooltip, notification, toast, inline alert, progress bar, progress
  indicator, skeleton
- **Data display:** card, table, tag, status tag, avatar, accordion, filters
- **Government:** digital stamp
- **Page templates:** form template, service page, screens

Selectors use the `mod-` prefix (`<mod-text-input>`, `<button mod-button>`) and classes the
`Mod` prefix (`ModTextInput`, `ModButton`). The complete selector list is in the
[guide](mod-angular/projects/ui/README.md#component-reference).

## Commands

Run these in `mod-angular/`.

| Command | What it does |
| --- | --- |
| `npm start` | Demo app against the library source, with hot reload |
| `npm run build:ui` | Check the vendored theme, then build the library to `dist/ui` |
| `npm run pack:ui` | Create the installable `.tgz` in `dist/ui` |
| `npm run build` | Build the library and the demo app |
| `npm run gen:dark-text` | Regenerate the dark-mode text rules after changing component styles |
| `npm run check:vendor` | Verify the edits needed inside the vendored base theme |
| `npm run gen:routes` | Regenerate demo routes after adding a page folder |

## Known limitations

- The light green is an accent only: white text on it is about 3.4:1, below WCAG AA.
- The library has no automated tests yet.
- Version 0.1.0: input names may still change between versions.
- Icon classes keep the `dga-icon-*` names of the icon font they come from.
