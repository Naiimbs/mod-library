---
description: Build a new screen with @mod-internal/ui, starting from the closest page template
argument-hint: "<what the screen is, e.g. 'sign-in page with SSO' or 'settings page for notifications'>"
---

Build this screen in the current Angular project with `@mod-internal/ui`, using the
`mod-ui` skill: $ARGUMENTS

1. Read `references/templates.md` of the `mod-ui` skill and pick the closest template.
   Say which one you picked and why in one line. If none is close, compose the screen from
   components and say so.
2. Open the template file, and copy it into the project where its other screens live,
   following the project's naming, routing and folder conventions.
3. Adapt it: rename selector and class, replace sample text with the project's wording
   through its translation mechanism (Arabic and English), replace sample data with the
   real service or a clearly marked placeholder, and remove parts the screen does not need.
4. Check every component input you use against `references/components.md`, and every
   icon name against `references/icons.md`.
5. Wire the route if the project uses a routes file. Build once and fix errors.

Keep the template's structure, responsive behaviour and accessibility attributes.
