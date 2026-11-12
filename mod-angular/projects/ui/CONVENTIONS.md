# @mod-internal/ui — porting conventions

How a component from the vanilla design system (`design-system/design-system/` in the
`design-system` repo, branch `v2.0.0`) becomes an Angular component in this library.
`lib/button/` and `lib/icon/` are the reference implementations.

## Source of truth

For a source component `<name>`:

- `components/<name>/<name>.css` — the styles. Copy into `lib/<name>/<name>.css`.
- `components/<name>/<name>.html` — the docs page. It shows the real markup for every
  variant, size and state. The Angular template must render the **same markup and class
  names**, so the copied CSS and the shared `dark-mode.css` keep working.
- `js/components/<name>.js` — behaviour. Part of it is the docs "live demo" manager
  (controls, `live-demo__*`, context menu): ignore that. Port only the real component
  behaviour (open/close, keyboard, selection, validation, etc.).

## Component rules

- Angular 20, standalone, no NgModules. Must also compile on Angular 21/22: use only
  stable APIs.
- Signals API: `input()`, `input.required()`, `output()`, `model()`, `computed()`,
  `viewChild()`. Boolean inputs use `{ transform: booleanAttribute }`. No `@Input`/`@Output`
  decorators, no `@HostBinding`/`@HostListener` (use the `host` object).
- `changeDetection: ChangeDetectionStrategy.OnPush` and
  `encapsulation: ViewEncapsulation.None` on every component; styles via `styleUrl`.
- New control flow (`@if`, `@for` with `track`, `@switch`). No `*ngIf`/`*ngFor`, no
  `CommonModule`.
- Selector `mod-<name>` (element). Use an attribute selector on the native element only
  where that is clearly better for accessibility (as `button[mod-button]` does).
  Class name `Dga<PascalName>`, file `lib/<name>/<name>.ts`. Split into several
  components/directives in the same folder when the source has distinct parts
  (e.g. `ModTabs` + `ModTab`).
- Element-selector hosts are unknown elements and default to `display: inline`. Give the
  host `display: block` (or `inline-block`/`contents`, whichever keeps the source layout)
  with a rule appended to the component CSS.
- Form controls implement `ControlValueAccessor` (provide `NG_VALUE_ACCESSOR`), support
  `disabled` via `setDisabledState`, and also expose the value as a `model()` so they work
  without forms. Generate stable unique ids for label/`aria-describedby` wiring.
- Accessibility at least as good as the source: roles, `aria-*`, keyboard support, visible
  focus. Never remove a focus style.
- RTL: the source handles it in CSS with `[dir="rtl"]`. Keep those rules; do not add
  direction logic in TypeScript unless the source JS has it.
- Icons: font icons render as `<span class="icon dga-icon-NAME" aria-hidden="true">` or
  `<mod-icon name="NAME" />`; inline SVGs from the source can be kept inline in templates.
- User-visible text (labels, aria-labels, "No results", month names…) must be overridable
  through inputs with English defaults. No hardcoded Arabic/English switch.
- No new npm dependencies (no CDK, no Material). Overlays follow the source's own
  positioning approach.
- Strict TypeScript: no `any`, no non-null `!` unless unavoidable. No `console.log`.
- Clean up listeners/timers (`DestroyRef`), and do not touch `document`/`window` at
  construction time without injecting `DOCUMENT` (keep it SSR-safe).
- CSS: keep source class names and values exactly. Remove rules that only style the docs
  page (`.live-demo*`, `.showcase*`, `.props-table*`, page-specific demo grids). If the
  source relies on a class defined in another component's CSS, note it in the report.
- `lib/<name>/index.ts` re-exports everything public from the folder (components, types).

## Demo page

The demo app reproduces the original docs site: same shell, and every component page has
the original structure — header, **Live demo** card (preview canvas + controls panel),
props table, then showcase sections.

Each component gets `projects/demo/src/app/pages/<name>/<name>.page.ts` exporting
`<PascalName>Page` (standalone, OnPush, selector `demo-<name>-page`; move the template to
`<name>.page.html` when it is long), importing components from `@mod-internal/ui` and the demo kit
from `../../shared/demo-kit` (`DEMO_KIT`: `demo-live`, `demo-select`, `demo-switch`,
`demo-text`, `demo-showcase`, `demo-props`). `pages/button/button.page.ts` is the reference.

Page structure, mirroring `components/<name>/<name>.html` in the source:

1. `<div class="content-header">` with `<h1 class="content-title">` and
   `<p class="content-description">` — same text as the source page.
2. `<demo-live heading="…" description="…">` — the canvas renders the **Angular component**
   bound to signals; the panel has the **same controls, labels, option lists, order and
   defaults** as the source page's `.live-demo__sidebar` (selects -> `demo-select`,
   switches -> `demo-switch`). The control logic comes from the demo manager class in
   `js/components/<name>.js` (mutual exclusions, Arabic labels when RTL is on, dark canvas
   for on-color…). The RTL switch binds to `[rtl]` on `demo-live`.
3. `<demo-props [props]="…">` — the component's Angular inputs / outputs / models (this
   replaces the source's CSS-class table).
4. One `<demo-showcase heading="…" description="…">` per showcase section of the source
   page, same titles and descriptions, same examples in the same order, rendered with the
   Angular components (`.showcase-row`, `.showcase-label` are available for layout).

If a source control or example cannot be expressed with the component's current API, add
the missing input to the library component rather than dropping the control.
