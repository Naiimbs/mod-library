---
description: Port a design-system component into the @mod-internal/ui library, with its demo page
argument-hint: "<component name as in design-system/components/, e.g. slider>"
---

Port the design-system component `$ARGUMENTS` into the `@mod-internal/ui` library, using
the `mod-ui-dev` skill and `mod-angular/projects/ui/CONVENTIONS.md`.

1. Check it is not already in `projects/ui/src/lib/` (search by name and by its CSS
   classes). If it is, report what exists and stop.
2. Read the source: `design-system/components/$ARGUMENTS/$ARGUMENTS.html`, its `.css`,
   and `design-system/js/components/$ARGUMENTS.js` if present. List its variants, sizes,
   states, slots and behaviour before writing code.
3. Write the library component (`lib/$ARGUMENTS/`), export it from `public-api.ts`, and run
   `npm run gen:dark-text` if its CSS colours text with the primary greens.
4. Write the demo page as the conventions describe, run `npm run gen:routes`, and add it to
   `DEMO_NAV`.
5. Run `npm run build:ui` (this also refreshes the Claude skill references) and fix every
   error and warning.
6. Report: the public API (inputs, models, outputs, slots), anything from the source you
   could not reproduce, and classes it borrows from another component's CSS.
