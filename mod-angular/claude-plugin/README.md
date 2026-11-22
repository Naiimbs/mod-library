# mod-ui: Claude Code plugin for the MOD design system

Makes Claude use the real MOD components, with their real inputs and markup, instead of
hand-written look-alikes.

## Skills

| Skill | Use it for |
| --- | --- |
| `mod-ui` | Angular projects using `@mod-internal/ui`: setup, the generated component API, 29 complete page templates and 4 HTML emails, forms, Arabic/RTL, dark mode, tokens and icon names |
| `mod-ui-html` | Projects without Angular (plain HTML, server templates, React, Vue, prototypes): the HTML/CSS design system's classes and example markup for 42 component pages |
| `mod-ui-dev` | Working on the library itself: porting components, demo pages, page templates, theme, generators, releases and the demo site |

Claude picks the skill from the task; you do not need to name it.

## Commands

| Command | What it does |
| --- | --- |
| `/mod-ui:setup [tgz]` | Installs the package and wires `angular.json` styles and icons in the current project |
| `/mod-ui:new-page <screen>` | Builds a screen from the closest page template |
| `/mod-ui:add-component <name>` | Ports a design-system component into the library, with its demo page |
| `/mod-ui:release <version>` | Bumps, builds and packs a library release and updates the docs |

## Files

| Path | What it is |
| --- | --- |
| `.claude-plugin/plugin.json` | Plugin manifest |
| `commands/` | The slash commands |
| `skills/mod-ui/` | Angular skill. `references/setup.md` is hand-written; the rest of `references/` (components, index, tokens, icons, `templates.md` and `templates/`) is generated |
| `skills/mod-ui-html/` | HTML skill. `references/setup.md` is hand-written; `components/`, the index, tokens and icons are generated |
| `skills/mod-ui-dev/` | Library-maintenance skill (hand-written) |
| `skills/mod-ui/evals/` | Test cases (`claude plugin eval` format) |
| `*.skill` | The three skills packaged for claude.ai |

## Install

**From GitHub** (the repository root has `.claude-plugin/marketplace.json`). In Claude Code:

```
/plugin marketplace add Naiimbs/mod-library
/plugin install mod-ui@mod-library
```

**In one project only:** copy the skill folders you need from `skills/` to
`<project>/.claude/skills/` and commit them.

**On claude.ai:** upload a `.skill` file under Settings → Capabilities → Skills.

## Keeping it current

Never edit generated references by hand. From `mod-angular/`:

```bash
npm run gen:skill
```

```bash
npm run gen:skill-html
```

`gen:skill` reads the library source and the demo pages (it also runs in
`npm run build:ui`); `gen:skill-html` reads `../design-system`. Then rebuild the `.skill`
files:

```bash
python -c "import zipfile,os;[(lambda n:(lambda z:[z.write(os.path.join(d,f),os.path.relpath(os.path.join(d,f),'skills').replace(os.sep,'/')) for d,s,fs in os.walk('skills/'+n) if 'evals' not in d for f in fs])(zipfile.ZipFile(n+'.skill','w',zipfile.ZIP_DEFLATED)))(n) for n in ['mod-ui','mod-ui-html','mod-ui-dev']]"
```

(run it inside `claude-plugin/`). Bump `version` in `.claude-plugin/plugin.json` whenever
a skill or command changes, so installed copies update.
