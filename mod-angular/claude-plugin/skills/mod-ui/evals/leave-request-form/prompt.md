---
tags: [skill-creator]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

our angular 21 app already has @mod-internal/ui installed and its styles are wired. i need a new standalone component LeaveRequestForm (file leave-request-form.ts, inline template) with a reactive form: employee name (required), leave type dropdown (annual / sick / emergency, required), start date and end date, notes textarea (max 500 chars with a counter), and a checkbox to accept the leave policy (must be checked). submit + cancel buttons, submit disabled while invalid. show the validation messages under the fields once touched. the ui is arabic first so every visible string goes through our translate pipe: `import { TranslatePipe } from '../core/i18n/translate.pipe'`, used as `'key' | t`. write the component and put the new translation keys (ar and en) in leave-request-form.i18n.json
