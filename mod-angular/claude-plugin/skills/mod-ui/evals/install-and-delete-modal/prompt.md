---
tags: [skill-creator]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

I need to add our design system library @mod-internal/ui to an existing Angular 22 app. The tarball is vendor/mod-internal-ui-0.1.0.tgz in the repo. Current angular.json build styles are ["src/styles/tokens.css", "src/styles.scss"] and the production initial budget is maximumError 1MB, we're at about 900kB today. We don't use any utility classes from the design system, just the components. Write setup.md with the exact install command, the new styles array, and anything else that has to change. Then write requests-page.ts: a standalone RequestsPage that lists requests in the library's table, has a Delete button per selected row that opens a confirmation modal, and shows a success toast after deleting. English only is fine for this one.
