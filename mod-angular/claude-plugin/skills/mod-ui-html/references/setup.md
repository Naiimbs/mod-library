# Setting up the MOD HTML design system

## Getting the files

The system lives in the `design-system/` folder of the mod-library repository. Copy that
folder into the project's static assets (for example `public/design-system/` or
`wwwroot/design-system/`). Keep its internal layout: the stylesheets import each other and
the fonts by relative path.

You do not need `index.html`, `js/router.js`, `js/main.js`, `css/code-view.css`,
`components/classes/` or `components/components-overview/`: they run the documentation
site.

## Stylesheets, in this order

```html
<!-- 1. Theme and tokens -->
<link rel="stylesheet" href="/design-system/utilities/DGATheme.css">
<link rel="stylesheet" href="/design-system/css/tokens.css">
<link rel="stylesheet" href="/design-system/css/base.css">
<link rel="stylesheet" href="/design-system/utilities/accessibility.css">

<!-- 2. One line per component the page uses -->
<link rel="stylesheet" href="/design-system/components/buttons/buttons.css">
<link rel="stylesheet" href="/design-system/components/modal/modal.css">

<!-- 3. Icons -->
<link rel="stylesheet" href="/design-system/css/icons-fonts.css">

<!-- 4. Dark mode last, so its rules win -->
<link rel="stylesheet" href="/design-system/css/dark-mode.css">
```

`DGATheme.css` is the vendored official DGA theme, wrapped in a cascade layer so the
component stylesheets always win over its own `.btn`, `.tab-item` and similar rules. Do
not edit it.

For production, bundle the stylesheets you use into one file with the project's tooling;
keep the order.

## Font

The documentation site loads IBM Plex Sans Arabic from Google Fonts. If the project may
not call external URLs, self-host the font files and declare them with `@font-face`, or
use the font the project already ships.

## Scripts

Load the script of each interactive component the page uses, at the end of `<body>`:

```html
<script src="/design-system/js/components/modal.js"></script>
```

The component reference names the script and its `data-*` hooks
(`data-modal-open="ID"`, `data-modal-close`, ...). Each script also contains a `...Demo`
class for the documentation page; it is harmless but can be removed from a production copy.

## Direction, language and theme

```html
<html lang="ar" dir="rtl" data-theme="light">
```

Switch `dir`/`lang` for English. Set `data-theme="dark"` for dark mode; to remember the
choice, set it from `localStorage` in a small inline script in `<head>`, before the
stylesheets render, to avoid a flash.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Component looks like a plain element | Its `components/<name>/<name>.css` is not loaded, or a class is misspelled |
| Default browser button look, or DGA defaults winning | `tokens.css` or `base.css` missing, or loaded before `DGATheme.css` |
| Icons show as empty squares or nothing | `css/icons-fonts.css` not loaded, the font path changed, or the icon name does not exist |
| Modal or menu does not open | Its script is not loaded, or the trigger lacks the `data-*` attribute |
| Dark mode only partly applies | `dark-mode.css` not loaded last |
| Layout breaks in Arabic | Physical `left`/`right` in your own CSS; use logical properties |
