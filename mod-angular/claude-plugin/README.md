# mod-ui: Claude skill for @mod-internal/ui

A Claude Code plugin with one skill, `mod-ui`. It makes Claude use the real
`@mod-internal/ui` components with their real inputs when it works in an Angular
project: setup and styles, forms, tables, modals and toasts, Arabic/RTL, dark mode,
design tokens and icon names.

| Path | What it is |
| --- | --- |
| `.claude-plugin/plugin.json` | Plugin manifest |
| `skills/mod-ui/SKILL.md` | The instructions Claude loads when the skill triggers |
| `skills/mod-ui/references/setup.md` | Install, `angular.json` styles, budgets, troubleshooting (hand-written) |
| `skills/mod-ui/references/components.md` | Every component, directive and service: inputs, models, outputs, slots, types, examples (generated) |
| `skills/mod-ui/references/component-index.md` | One line per component (generated) |
| `skills/mod-ui/references/tokens.md` | Every CSS variable with its light value (generated) |
| `skills/mod-ui/references/icons.md` | 4,029 icon names by category (generated) |
| `skills/mod-ui/evals/` | Test cases (`claude plugin eval` format) |

## Install

**As a plugin from GitHub** (needs `.claude-plugin/marketplace.json` at the repository
root, pointing at this folder). In Claude Code:

```
/plugin marketplace add Naiimbs/mod-library
/plugin install mod-ui@mod-library
```

**In one project only:** copy `skills/mod-ui/` to `<project>/.claude/skills/mod-ui/` and
commit it, so everyone working on that project gets it.

**For yourself on every project:** copy `skills/mod-ui/` to `~/.claude/skills/mod-ui/`.

**On claude.ai:** upload `mod-ui.skill` (built with the skill-creator `package_skill`
script) under Settings → Capabilities → Skills.

## Keeping it current

The generated references come from the library source. They are rebuilt by
`npm run build:ui`, or on their own with:

```bash
npm run gen:skill
```

Edit `SKILL.md` and `references/setup.md` by hand. Bump `version` in
`.claude-plugin/plugin.json` when the skill changes, so installed copies update.
