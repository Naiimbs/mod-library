---
name: mod-ui
description: Build Angular UI with @mod-internal/ui, the in-house design-system component library (mod-* components, Saudi MOD typeface, brand greens, Arabic/RTL). Use this skill whenever the task touches an Angular project that depends on @mod-internal/ui or should use it, for example adding or changing a page, form, table, dialog, toast, navigation, sign-in or dashboard screen, installing or upgrading the library, wiring its styles in angular.json, fixing unstyled or broken mod-* components, bundle-budget errors after adding it, or styling with its CSS tokens. Also use it when you see mod-* selectors, `mod-button`, `Mod*` imports, `mod.css` or `mod-core.css` in the code, even if the user does not name the library.
---

# @mod-internal/ui

An Angular component library (Angular 20 to 22, standalone components, signals) in the
brand colours and the Saudi MOD typeface. It ships 127 components, directives and one
service, all imported from `@mod-internal/ui`.

The point of this skill is that you use the real components with their real inputs,
instead of hand-writing look-alike HTML and CSS or guessing input names. Guessed inputs
compile into silent no-ops in some cases and template errors in others, and hand-made
markup drifts from the brand and loses accessibility and RTL support the components
already have.

## How to work

1. **Check the setup first** when you touch a project for the first time: is
   `@mod-internal/ui` in `package.json`, and does `angular.json` load its styles? If not,
   or if something renders unstyled, follow `references/setup.md`.
2. **Find the component** in `references/component-index.md` (one line per component).
3. **Look up its exact API** in `references/components.md`: search for the class name
   (for example `### ModDropdown`). It lists every input, two-way model, output, content
   slot, value types and an example, generated from the library source. Do not rely on
   memory for input names: check them here.
4. **Import the class** into the `imports` array of the standalone component (or the
   NgModule) that uses it.
5. **Style your own layout with tokens** from `references/tokens.md`, never with raw
   colour values.

## The rules that matter most

**Use the component, not its CSS classes.** Component styles load only when the Angular
component renders. Markup such as `class="btn btn-primary"` copied from the design system
renders unstyled. Write `<button mod-button variant="primary">` instead.

**Some components are attributes on native elements**, so keyboard, focus and form
behaviour stay native:

```html
<button mod-button variant="secondary-outline" (click)="cancel()">Cancel</button>
<a mod-button href="/help">Help</a>
<a mod-link href="/terms">Terms</a>
<button mod-chip>Filter</button>
<span modTooltip="Removes the request">...</span>
```

Writing `<mod-button>` is wrong; there is no such element.

**Signals API.** Inputs are signal inputs. Bind them with `[x]="..."` or a plain attribute
for strings and booleans (`disabled`, `required`, `destructive` work as bare attributes).
Values marked `model` in the reference are two-way: `[(value)]="name"` where `name` is a
`signal()`, or `[value]` + `(valueChange)`.

**Forms.** Form components (`mod-text-input`, `mod-textarea`, `mod-search-box`,
`mod-dropdown`, `mod-checkbox`, `mod-checkbox-group`, `mod-radio-group`, `mod-rating`,
`mod-date-picker`, `mod-date-range-picker`, `mod-file-upload`) work three ways: `[(value)]`
(or `[(checked)]`) with signals, reactive forms (`formControlName`), or `[(ngModel)]`.
Use whichever the project already uses. The components do not read validator state:
bind `[error]` and `[helperText]` yourself, as in this example:

```html
<mod-text-input
  label="Email"
  type="email"
  formControlName="email"
  required
  [error]="form.controls.email.touched && form.controls.email.invalid"
  [helperText]="form.controls.email.touched && form.controls.email.invalid ? 'Enter a valid email' : ''"
/>
```

Value types: text input `string` (`number | null` with `type="number"`), checkbox
`boolean`, dropdown the option's `value` (array with `multiple`), date picker
`Date | null`, file upload `File[]`.

**Text and Arabic.** Every user-visible word a component shows (labels, placeholders,
aria-labels, "Browse files", "Clear", month names) is an input with an English default.
In an Arabic or bilingual app, pass translated text through those inputs, using the
project's own translation mechanism (a `| t` or `| translate` pipe, `$localize`, a
service), and add the keys to its translation files:

```html
<mod-file-upload [instructions]="'upload.drop' | t" [browseLabel]="'upload.browse' | t" />
```

Search the component's table in `components.md` for inputs whose name ends in `Label`
or `Text`, or that hold words, to find all of them.

**Direction and theme are HTML attributes**, not component inputs: `dir="rtl"` and
`lang="ar"` on `<html>` (or any container) mirror every component; `data-theme="dark"`
on `<html>` switches dark mode. Do not add direction logic in TypeScript.

**Icons** use the name without the `dga-icon-` prefix: `<mod-icon name="search-01" />`.
Take names from `references/icons.md` (search it for a word such as `delete` or
`calendar`); an unknown name renders nothing, so do not guess.
Inside a button, project it: `<button mod-button><mod-icon name="add-01" /> Add</button>`.
Icon-only buttons need `iconOnly` and an `aria-label`. Icons need the separate icon
stylesheet (see setup).

**Overlays.** Toasts: put exactly one `<mod-toast-container />` in the root component,
then `inject(ModToastService).show({ title, message?, variant, duration? })` anywhere.
Modals: `<mod-modal [(open)]="isOpen" heading="...">` with buttons in
`<mod-modal-actions>`; a button with `modModalClose` closes it.

**Tokens, not colours.** In your own CSS use the variables: `--mod-primary` (with
`-hover`, `-pressed`), `--mod-primary-text` for green text (it follows dark mode),
`--mod-on-primary`, `--color-*` status colours, `--spacing-*`, `--radius-*`,
`--font-family-primary`. Hard-coded hex values break dark mode and the brand.

## Project rules come first

The host project may have stricter rules than this skill: no external URLs, all strings
through its localization layer, colour values only in one tokens file, licence checks,
bundle budgets. Read its CLAUDE.md or contributing notes and follow them. If the project
already has its own component for something (a `shared/ui` folder), ask or follow the
project's direction before replacing it, and never show two versions of the same
component on one screen.

Do not change a project's official logos, images or brand assets when integrating the
library; the library ships none.

## Reference files

| File | Read it when |
| --- | --- |
| `references/setup.md` | Installing or upgrading the package, editing `angular.json` styles, `mod.css` vs `mod-core.css`, bundle budget errors, troubleshooting unstyled components, fonts or icons |
| `references/component-index.md` | Choosing a component; one line each |
| `references/components.md` | Writing a template: exact inputs, outputs, models, slots, types and an example per component. Search by class name; it is long |
| `references/tokens.md` | Styling your own elements: every CSS variable with its light value |
| `references/icons.md` | Choosing an icon name for `mod-icon` or an icon input; 4,029 names by category |

`component-index.md`, `components.md`, `tokens.md` and `icons.md` are generated from the
library source by `tools/gen-skill-reference.mjs` in the library repository.
