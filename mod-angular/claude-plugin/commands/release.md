---
description: Release a new version of @mod-internal/ui (bump, build, pack, update docs and the plugin)
argument-hint: "<new version, e.g. 0.1.11>"
---

Release `@mod-internal/ui` version `$ARGUMENTS`, following "Releasing a version" in the
`mod-ui-dev` skill. Work in `mod-angular/`.

1. Read the current version from `projects/ui/package.json`. If no version was given,
   propose the next one from what changed and ask before going on.
2. Summarise what changed since the last version (git log or diff of `projects/ui`), and
   flag breaking changes: removed or renamed components, inputs, outputs or CSS classes.
   A breaking change needs a major bump (or a minor one while below 1.0); ask if the
   requested version does not match.
3. Bump the version, run `npm run build:ui` and `npm run pack:ui`, and confirm the `.tgz`
   exists in `dist/ui/`.
4. Update the version in install examples (`README.md`, `projects/ui/README.md`,
   `claude-plugin/skills/mod-ui/references/setup.md`), and bump
   `claude-plugin/.claude-plugin/plugin.json` if the skills or references changed.
5. Report the tarball path, the change summary and anything left for the user (commit,
   tag, distributing the file). Do not commit, tag or push unless asked.
