---
name: mod-ui-html
description: Build pages with the MOD HTML/CSS design system (the vanilla `design-system/` folder of mod-library, on the official DGA theme) when there is no Angular. Use it for plain HTML, server-rendered templates (Razor, Thymeleaf, Jinja, Blade, JSP), static sites, React or Vue projects without @mod-internal/ui, prototypes and HTML mock-ups in the Saudi government (DGA) look. Also use it when you see `DGATheme.css`, `tokens.css` from design-system, `dga-icon-*` spans, or classes such as `btn btn-primary`, `modal-backdrop`, `nav-header__*`, `status-tag`. For Angular projects, use the mod-ui skill instead.
---

# MOD HTML design system

The original, framework-free version of the design system: one CSS file per component,
BEM-style classes, a few small JavaScript managers for behaviour, and the official DGA
theme for tokens. It covers 42 component pages, from buttons and inputs to the
navigation header, data tables, modals, toasts and complete service-page screens.

The point of this skill is that you use the system's real class names and markup
structure, copied from its examples, instead of inventing look-alike CSS. Invented markup
drifts from the brand, breaks in RTL and dark mode, and loses the accessibility attributes
the examples already carry.

**In an Angular project, stop and use the `mod-ui` skill**: there the components are
Angular components, and these classes render unstyled because component styles only load
with the component.

## How to work

1. **Check the setup** the first time: are the theme, token, base and icon stylesheets
   loaded, in the right order? See `references/setup.md`.
2. **Find the component** in `references/component-index.md`.
3. **Open its file** in `references/components/` (for example `components/modal.md`). It
   has the class table (every class, modifier and data attribute with what it does) and
   example markup for each variant. Copy the example closest to what you need and change
   only text, links and data.
4. **Load its stylesheet** (named at the top of the file) and, when the file names one,
   its behaviour script.
5. **Style your own layout with tokens** from `references/tokens.md`.

## Rules

**Copy structure, not just class names.** Most components need their inner elements in
order (`modal > modal-header > modal-header__top`). Keep the `aria-*`, `role`, `type` and
`id`/`for` pairs from the example.

**Leave out documentation wrappers.** `showcase-*`, `live-demo*`, `component-preview*`
and `content-*` classes belong to the documentation site. Inline `style` attributes on
example wrappers are layout for the doc page, not part of the component.

**Behaviour comes from the component's script.** Interactive components (modal, menus,
tabs, accordion, dropdown, date picker, nav header, nav drawer, slide-out menu, pagination,
file upload, search box, rating, filters) need `js/components/<name>.js`, wired by the
`data-*` attributes listed in the component file; `component-index.md` marks them. Only the
manager classes are needed in production; classes with `Demo` in the name drive the
documentation page. Everything else (toasts, alerts, tags, inputs) is CSS only: show,
hide and update it from your own code. If the project has its own framework (React, Vue),
reproduce the behaviour there and keep the markup and classes.

**Tokens, not colours.** Use `--color-primary` (with `-hover`, `-active`), `--color-*`
status colours, `--spacing-*`, `--radius-*` in your own CSS. Saudi green marks action,
selection and feedback only; it is not decoration. Hard-coded hex values break dark mode.

**Icons** are font glyphs: `<span class="dga-icon-search-01" aria-hidden="true"></span>`.
Take names from `references/icons.md`; an unknown name renders nothing. Icon-only buttons
need an `aria-label`.

**Arabic and RTL.** `dir="rtl"` and `lang="ar"` on `<html>` mirror the components. Use
logical properties (`margin-inline-start`, `padding-inline`, `inset-inline-end`) in your
own CSS, never `left`/`right`. Every screen must work in both directions.

**Dark mode** is `data-theme="dark"` on `<html>`, with `css/dark-mode.css` loaded last.

**Accessibility** is WCAG 2.1 AA: visible focus, keyboard reach, 4.5:1 body text,
`prefers-reduced-motion` alternatives. The examples meet it; keep what they have.

## Project rules come first

Follow the host project's CLAUDE.md or contributing notes (no external URLs, string
localisation, licence checks). If it already has its own version of a component, follow
its direction instead of adding a second one. Do not replace official logos or brand
assets.

## Reference files

| File | Read it when |
| --- | --- |
| `references/setup.md` | Adding the design system to a project; stylesheet order, fonts, icons, scripts, troubleshooting |
| `references/component-index.md` | Choosing a component; one line each, with its stylesheet and whether it needs JS |
| `references/components/<name>.md` | Writing markup: class table and examples for one component |
| `references/tokens.md` | Styling your own elements: every CSS variable with its value |
| `references/icons.md` | Choosing an icon; 4,029 names by category |

For complete screens, start from `components/service-page.md` (a full service page),
`components/form-template.md` (a full form page with header and footer) or
`components/screens.md`.

Everything except `setup.md` is generated from the design system by
`tools/gen-html-skill-reference.mjs` in the library repository.
