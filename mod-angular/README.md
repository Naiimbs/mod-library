# MOD Internal design system for Angular

Angular workspace for `@mod-internal/ui`: a component library in the MOD brand colours and
the Saudi MOD typeface, plus a demo app with a live example of every component.

| Path | What it is |
| --- | --- |
| `projects/ui` | The `@mod-internal/ui` library: components, brand theme, fonts and icon styles |
| `projects/demo` | Demo and documentation app: a live demo with a control panel, a props table and examples for each component |
| `tools/` | Helper scripts used by the npm commands below |

## Use the library in an Angular project

The full guide is **[projects/ui/README.md](projects/ui/README.md)**: install, styles,
first component, forms, tables, modal and toast, Arabic and RTL, dark mode, brand tokens,
the component list and troubleshooting.

The short version:

```bash
npm install
```

```bash
npm run build:ui
```

```bash
npm run pack:ui
```

This creates `dist/ui/mod-internal-ui-0.1.0.tgz`. In your application:

```bash
npm install path/to/mod-internal-ui-0.1.0.tgz
```

Then add `node_modules/@mod-internal/ui/styles/mod.css` and the icon bundle to the
`styles` of your `angular.json`, as shown in the guide, and import components from
`@mod-internal/ui`:

```ts
import { ModButton, ModTextInput } from '@mod-internal/ui';
```

```html
<button mod-button variant="primary">Save</button>
<mod-text-input label="Full name" [(value)]="name" />
```

## Run the demo

```bash
npm install
```

```bash
npm start
```

Open http://localhost:4200.

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | Demo app against the library source, with hot reload |
| `npm run build:ui` | Check the vendored theme, regenerate the reduced theme for `mod-core.css`, then build the library to `dist/ui` |
| `npm run gen:core-theme` | Regenerate `DGATheme.core.css`, the reduced base theme behind `mod-core.css` |
| `npm run gen:skill` | Regenerate the Claude skill's component, token and icon references in `claude-plugin/` (see [claude-plugin/README.md](claude-plugin/README.md)) |
| `npm run pack:ui` | Create the installable `.tgz` in `dist/ui` |
| `npm run build` | Build the library and the demo app |
| `npm run gen:dark-text` | Regenerate the dark-mode text rules after changing component styles |
| `npm run check:vendor` | Verify the edits needed inside the vendored base theme |
| `npm run gen:routes` | Regenerate demo routes after adding a page folder |

Requirements: Node.js 20.19+, 22.12+ or 24+, and npm. The demo build uses a large icon
stylesheet and needs roughly 2 GB of free memory.

## Brand

| Colour | Value | CSS variable |
| --- | --- | --- |
| Light green | `#00A05A` | `--mod-light-green` |
| Dark green | `#29504D` | `--mod-dark-green` |
| Grey | `#B2BEC4` | `--mod-grey` |
| White | `#FFFFFF` | `--mod-white` |

The colour scales and the typeface are defined in
[`projects/ui/src/styles/css/mod-theme.css`](projects/ui/src/styles/css/mod-theme.css).

Conventions for structuring components are in
[projects/ui/CONVENTIONS.md](projects/ui/CONVENTIONS.md).
