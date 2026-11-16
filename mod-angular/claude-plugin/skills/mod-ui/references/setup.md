# Setting up @mod-internal/ui in an Angular application

## Requirements

| | |
| --- | --- |
| Angular | 20.x, 21.x or 22.x (peer range `>=20.0.0 <23.0.0`) |
| `@angular/forms` | Required (installed by default with `ng new`) |
| Node.js | 20.19+, 22.12+ or 24+ |

Older Angular projects must upgrade first (`ng update @angular/core @angular/cli`).
An `npm install` peer-dependency conflict usually means the Angular version is outside
the range.

## 1. Get the package

It is not on the public npm registry. Two ways:

- **Tarball.** In the library repository's `mod-angular` folder run `npm install`,
  `npm run build:ui`, `npm run pack:ui`. That writes
  `dist/ui/mod-internal-ui-<version>.tgz`. Copy it into the application (for example a
  `vendor/` folder), commit it, and install it:

  ```bash
  npm install ./vendor/mod-internal-ui-0.1.0.tgz
  ```

- **Private registry**, if the organisation has one: `npm publish dist/ui --registry <url>`
  once, then `@mod-internal:registry=<url>` in the application's `.npmrc` and
  `npm install @mod-internal/ui`.

Check that only the new dependency entry was added to `package-lock.json`.

## 2. Add the styles to angular.json

In `projects → <app> → architect → build → options → styles`. The library goes **first**,
so the application's own styles load after it and win where they overlap:

```json
"styles": [
  "node_modules/@mod-internal/ui/styles/mod-core.css",
  {
    "input": "node_modules/@mod-internal/ui/styles/icons.css",
    "bundleName": "mod-icons",
    "inject": false
  },
  "src/styles.css"
]
```

Keep the application's existing style entries after these. Then in `src/index.html`,
inside `<head>`:

```html
<link rel="stylesheet" href="mod-icons.css">
```

Restart `ng serve` after changing `angular.json`. If the project also has a `test`
target with its own `styles`, add the core stylesheet there too when component tests
render library components.

### Which core stylesheet

| File | Use it when | Size |
| --- | --- | --- |
| `mod-core.css` | The app only uses the components (the usual case) | about 44 kB in the bundle |
| `mod.css` | The app's templates also use the base theme's utility classes (`.text-md-semibold`, `.background-primary-25`, `.border-*`, `.gap-*` ...) | about 150 kB |

Both contain the tokens, the Saudi MOD typeface, a CSS reset and dark mode. The
components render the same with either. Use one, not both.

### Why the icons are a separate bundle

`icons.css` is about 9 MB (400 kB compressed) of icon fonts. As a plain string in
`styles` it counts toward the initial bundle budget and the production build fails
(`bundle initial exceeded maximum budget`). With `"inject": false` plus the `<link>` it
loads separately.

## 3. Check it

Build (`ng build`) and run the app. A `mod-button` should be dark green, `<mod-icon>`
should show a glyph, and text inside components should use the Saudi MOD typeface unless
the app overrides `--font-family-primary`.

## Living alongside an existing design

- **The reset is global.** It sets `margin: 0; padding: 0` on every element and styles
  `body`. Loading the app's styles after the library keeps the app's `body` rules. Check
  headings, paragraphs and lists on existing pages after adding the library.
- **The vendored base theme is in a cascade layer** (`@layer dga-vendor`), so unlayered
  application CSS always beats it, even for shared class names such as `.btn`, `.card`,
  `.panel`.
- **Keep the app's typeface inside library components** by setting the token in the
  app's own tokens file: `:root { --font-family-primary: var(--app-font); }`.
- **Brand colours.** Map the app's colour tokens to the library tokens (or the reverse)
  in the app's tokens file so both match.
- The package contains no images or logos, so installing it never touches the app's
  brand assets.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Components render as plain HTML, no colours | The core stylesheet is not loaded. Check the `styles` entry path and restart `ng serve` |
| Plain markup with design-system classes (`class="btn btn-primary"`) is unstyled | Component CSS only loads with the component. Use `<button mod-button>` |
| Icons show as empty boxes or nothing | `icons.css` bundle or the `<link rel="stylesheet" href="mod-icons.css">` is missing |
| `bundle initial exceeded maximum budget` | `icons.css` is a plain string in `styles`: make it the separate bundle. Still close to the limit: switch `mod.css` to `mod-core.css` |
| Wrong font | The core stylesheet is not loaded, or the app overrides `--font-family-primary` or `body { font-family }` |
| Green text unreadable in dark mode | A dark-green step (`--sa-700`…`--sa-950`, `--color-primary-hover`) is used as text colour. Use `--mod-primary-text` |
| `'mod-x' is not a known element` | The class is not in the component's `imports` array, or the selector is an attribute (`button[mod-button]`, `a[mod-link]`, `button[mod-chip]`) |
| `Can't bind to 'x' since it isn't a known property` | The input name is wrong. Check `components.md` for the exact name |
| Toast `show()` does nothing | No `<mod-toast-container />` in the root component |

## Upgrading

Rebuild the tarball in the library repository, replace the old file in `vendor/`, run
`npm install ./vendor/<new file>`, and rebuild. Re-check `components.md` for changed
inputs.
