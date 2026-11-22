---
description: Install and wire up @mod-internal/ui in this Angular project (package, angular.json styles, icons, budgets)
argument-hint: "[path to mod-internal-ui-<version>.tgz]"
---

Set up `@mod-internal/ui` in this Angular project, following the `mod-ui` skill and its
`references/setup.md` exactly.

Tarball path given by the user (may be empty): $ARGUMENTS

1. Confirm this is an Angular 20 to 22 project (`package.json`, `angular.json`). If it is
   not Angular, say so and suggest the `mod-ui-html` skill instead; stop.
2. If `@mod-internal/ui` is already installed, report its version and check the setup
   instead of reinstalling.
3. Otherwise find the tarball: the path above, or a `mod-internal-ui-*.tgz` in the
   project (for example `vendor/`). If there is none, ask for it; do not guess a path.
   Copy it into `vendor/` if it is outside the project, and install it from there.
4. Add the styles to the build target in `angular.json` as `setup.md` describes
   (`mod-core.css` unless the project uses the DGA utility classes, and the icon
   stylesheet as its own non-injected bundle plus its `<link>`). Do not raise budgets to
   make the build pass; fix the setup instead.
5. Put one `<mod-toast-container />` in the root component if the app will use toasts.
6. Build the project once and report the result, with any warning you could not fix.

Follow the project's own CLAUDE.md where it is stricter. Summarise what you changed.
