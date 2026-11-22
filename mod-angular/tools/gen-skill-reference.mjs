// Generates the component reference of the Claude skill for @mod-internal/ui
// (claude-plugin/skills/mod-ui/references/) from the library source, so the
// skill always matches the real API: selectors, inputs, outputs, two-way
// models, content slots, services and exported types.
//
//   node tools/gen-skill-reference.mjs      (also runs in npm run build:ui)
//
// Reads projects/ui/src/lib/**. Uses the TypeScript compiler API only to read
// the files; nothing is compiled.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const libDir = join(root, 'projects/ui/src/lib');
const publicApi = readFileSync(join(root, 'projects/ui/src/public-api.ts'), 'utf8');
const outDir = join(root, 'claude-plugin/skills/mod-ui/references');
const version = JSON.parse(readFileSync(join(root, 'projects/ui/package.json'), 'utf8')).version;

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );

// Folders in public-api.ts order (the order the library documents them in).
const folders = [...publicApi.matchAll(/\.\/lib\/([\w-]+)\/index/g)].map((m) => m[1]);

const oneLine = (s) => s.replace(/\s+/g, ' ').trim();
const cell = (s) => oneLine(s).replace(/\|/g, '\\|');

function jsDocOf(node, sf) {
  const docs = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc);
  if (!docs.length) return '';
  const doc = docs[docs.length - 1];
  const text = typeof doc.comment === 'string' ? doc.comment : (doc.comment ?? []).map((c) => c.text ?? '').join('');
  return text.trim();
}

/** Splits a class JSDoc into prose and indented example lines. */
function splitDoc(doc) {
  const prose = [];
  let examples = [];
  for (const line of doc.split('\n')) {
    if (/^\s{2,}\S/.test(line)) examples.push(line.replace(/\s+$/, ''));
    else prose.push(line);
  }
  const indent = Math.min(...examples.map((l) => l.match(/^\s*/)[0].length));
  examples = examples.map((l) => l.slice(indent));
  const lang = examples.length && !examples[0].startsWith('<') ? 'ts' : 'html';
  return { prose: oneLine(prose.join(' ')), examples, lang };
}

function decoratorInfo(cls) {
  for (const dec of ts.getDecorators(cls) ?? []) {
    const call = dec.expression;
    if (!ts.isCallExpression(call)) continue;
    const kind = call.expression.getText();
    if (!['Component', 'Directive', 'Injectable', 'Pipe'].includes(kind)) continue;
    const meta = {};
    const arg = call.arguments[0];
    if (arg && ts.isObjectLiteralExpression(arg)) {
      for (const p of arg.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        const key = p.name.getText();
        const v = p.initializer;
        if (ts.isStringLiteralLike(v) || ts.isNoSubstitutionTemplateLiteral(v)) meta[key] = v.text;
        else meta[key] = v.getText();
      }
    }
    return { kind, meta };
  }
  return null;
}

function signalMember(prop) {
  const init = prop.initializer;
  if (!init || !ts.isCallExpression(init)) return null;
  const callee = init.expression.getText();
  const kinds = {
    input: 'input',
    'input.required': 'input',
    model: 'model',
    'model.required': 'model',
    output: 'output',
  };
  const kind = kinds[callee];
  if (!kind) return null;
  const required = callee.endsWith('.required');
  const typeArg = init.typeArguments?.[0]?.getText();
  const args = init.arguments;
  let def = !required && args[0] ? args[0].getText() : '';
  let alias = '';
  let type = typeArg ?? '';
  const opts = args.find((a) => ts.isObjectLiteralExpression(a));
  if (opts) {
    for (const p of opts.properties) {
      if (!ts.isPropertyAssignment(p)) continue;
      if (p.name.getText() === 'alias') alias = p.initializer.getText().replace(/['"]/g, '');
      if (p.name.getText() === 'transform' && /booleanAttribute/.test(p.initializer.getText())) type = type || 'boolean';
      if (p.name.getText() === 'transform' && /numberAttribute/.test(p.initializer.getText())) type = type || 'number';
    }
    if (required && args[0] === opts) def = '';
  }
  if (!type && def) {
    if (/^['"`]/.test(def)) type = 'string';
    else if (/^(true|false)$/.test(def)) type = 'boolean';
    else if (/^-?\d/.test(def)) type = 'number';
  }
  if (kind === 'output') type = typeArg ?? 'void';
  return { kind, name: alias || prop.name.getText(), required, type, def };
}

function slotsOf(meta, file) {
  let template = '';
  if (meta.templateUrl) {
    const p = join(dirname(file), meta.templateUrl);
    if (existsSync(p)) template = readFileSync(p, 'utf8');
  } else if (meta.template) template = meta.template;
  const slots = [];
  for (const m of template.matchAll(/<ng-content(?:\s+select="([^"]+)")?\s*\/?>/g)) slots.push(m[1] ?? '(default)');
  return [...new Set(slots)];
}

function publicMethods(cls, sf) {
  const out = [];
  for (const m of cls.members) {
    const mods = ts.getCombinedModifierFlags(m);
    if (mods & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) continue;
    if (m.name && ts.isPrivateIdentifier(m.name)) continue;
    if (ts.isMethodDeclaration(m)) {
      const params = m.parameters.map((p) => p.getText()).join(', ');
      const ret = m.type ? `: ${m.type.getText()}` : '';
      out.push({ sig: `${m.name.getText()}(${params})${ret}`, doc: jsDocOf(m, sf) });
    } else if (ts.isPropertyDeclaration(m) && !signalMember(m)) {
      const doc = jsDocOf(m, sf);
      if (doc) out.push({ sig: m.name.getText(), doc });
    }
  }
  return out;
}

const sections = [];
const index = [];
for (const folder of folders) {
  const dir = join(libDir, folder);
  const files = walk(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts') && !f.endsWith('index.ts'));
  const classes = [];
  const types = [];
  for (const file of files) {
    const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    for (const st of sf.statements) {
      const exported = ts.getCombinedModifierFlags(st) & ts.ModifierFlags.Export;
      if (!exported) continue;
      if (ts.isTypeAliasDeclaration(st)) types.push(`type ${st.name.text} = ${oneLine(st.type.getText())}`);
      if (ts.isInterfaceDeclaration(st)) {
        const fields = st.members.map((m) => oneLine(m.getText()).replace(/\/\*\*.*?\*\/\s*/g, '')).join(' ');
        types.push(`interface ${st.name.text} { ${fields} }`);
      }
      if (ts.isClassDeclaration(st) && st.name) {
        const dec = decoratorInfo(st);
        if (!dec) continue;
        const members = st.members.filter(ts.isPropertyDeclaration).map((p) => {
          const s = signalMember(p);
          return s ? { ...s, doc: jsDocOf(p, sf) } : null;
        }).filter(Boolean);
        classes.push({
          name: st.name.text,
          kind: dec.kind,
          selector: dec.meta.selector ?? '',
          exportAs: dec.meta.exportAs ?? '',
          cva: /NG_VALUE_ACCESSOR/.test(dec.meta.providers ?? ''),
          doc: splitDoc(jsDocOf(st, sf)),
          members,
          slots: dec.kind === 'Component' ? slotsOf(dec.meta, file) : [],
          methods: dec.kind === 'Injectable' ? publicMethods(st, sf) : [],
        });
      }
    }
  }
  if (!classes.length) continue;

  const lines = [`## ${folder}`, ''];
  for (const c of classes) {
    const head = c.selector ? `\`${c.selector}\`` : `\`${c.name}\` (service, \`providedIn: 'root'\`)`;
    lines.push(`### ${c.name} — ${head}`, '');
    if (c.doc.prose) lines.push(c.doc.prose, '');
    if (c.doc.examples.length) lines.push('```' + c.doc.lang, ...c.doc.examples, '```', '');
    const notes = [];
    if (c.cva) notes.push('Works with `ngModel`, `formControl` and `formControlName` (ControlValueAccessor).');
    if (c.exportAs) notes.push(`Template reference: \`#x="${c.exportAs}"\`.`);
    if (c.slots.length) notes.push(`Content slots: ${c.slots.map((s) => `\`${s}\``).join(', ')}.`);
    if (notes.length) lines.push(...notes, '');
    if (c.members.length) {
      lines.push('| Binding | Kind | Type | Default | Notes |', '| --- | --- | --- | --- | --- |');
      for (const m of c.members) {
        const binding = m.kind === 'output' ? `(${m.name})` : m.kind === 'model' ? `[(${m.name})]` : `[${m.name}]`;
        const kind = m.kind + (m.required ? ', required' : '');
        lines.push(`| \`${binding}\` | ${kind} | \`${cell(m.type || '?')}\` | ${m.def ? `\`${cell(m.def)}\`` : ''} | ${cell(m.doc)} |`);
      }
      lines.push('');
    }
    if (c.methods.length) {
      lines.push('| Member | Notes |', '| --- | --- |');
      for (const m of c.methods) lines.push(`| \`${cell(m.sig)}\` | ${cell(m.doc)} |`);
      lines.push('');
    }
    index.push(`| ${c.selector ? `\`${c.selector}\`` : '(service)'} | \`${c.name}\` | ${folder} | ${cell(c.doc.prose).slice(0, 110)} |`);
  }
  if (types.length) lines.push('Exported types:', '', '```ts', ...types, '```', '');
  sections.push({ folder, text: lines.join('\n') });
}

mkdirSync(outDir, { recursive: true });
const header = (title) =>
  `<!-- GENERATED by tools/gen-skill-reference.mjs from projects/ui/src/lib (library ${version}). Do not edit by hand. -->\n\n# ${title}\n\n`;

writeFileSync(
  join(outDir, 'components.md'),
  header('@mod-internal/ui component reference') +
    'Every public component, directive and service, grouped by library folder. Search this file for the selector or class you need (for example `mod-dropdown` or `ModToastService`) instead of reading it top to bottom.\n\n' +
    '`[x]` is an input, `[(x)]` a two-way model (also usable as `[x]` + `(xChange)`), `(x)` an output. Boolean inputs accept the bare attribute (`disabled`) because they use `booleanAttribute`.\n\n' +
    '## Contents\n\n' +
    sections.map((s) => `- [${s.folder}](#${s.folder})`).join('\n') +
    '\n\n' +
    sections.map((s) => s.text).join('\n'),
);
writeFileSync(
  join(outDir, 'component-index.md'),
  header('@mod-internal/ui component index') +
    'One line per public component, directive and service. Import the class from `@mod-internal/ui`; the full API of each is in `components.md` (search for the class name).\n\n' +
    '| Selector | Class | Folder | What it is |\n| --- | --- | --- | --- |\n' +
    index.join('\n') +
    '\n',
);
// Design tokens: light-mode values declared on :root in the token stylesheets.
const tokenFiles = ['css/mod-theme.css', 'css/tokens.css', 'css/navigation-tokens.css'];
const tokenRows = [];
const seen = new Set();
for (const rel of tokenFiles) {
  const ast = postcss.parse(readFileSync(join(root, 'projects/ui/src/styles', rel), 'utf8'));
  ast.walkRules((rule) => {
    if (!rule.selectors.some((s) => s.trim() === ':root')) return;
    if (rule.parent?.type === 'atrule') return; // skip media / dark-mode overrides
    rule.walkDecls(/^--/, (d) => {
      if (seen.has(d.prop)) return;
      seen.add(d.prop);
      tokenRows.push(`| \`${d.prop}\` | \`${cell(d.value)}\` | ${rel} |`);
    });
  });
}
writeFileSync(
  join(outDir, 'tokens.md'),
  header('@mod-internal/ui design tokens') +
    'CSS custom properties available once `mod.css` or `mod-core.css` is loaded, with their light-mode values. Dark mode (`data-theme="dark"` on `<html>`) overrides many of them, so reference the variable, never its value. Search for a prefix (`--mod-primary`, `--spacing`, `--radius`, `--color-error`) rather than reading everything.\n\n' +
    '| Token | Light value | Defined in |\n| --- | --- | --- |\n' +
    tokenRows.join('\n') +
    '\n',
);

// Icon names, grouped by the category stylesheet they come from.
const iconDir = join(root, 'projects/ui/src/styles/utilities/Icons_Css');
let iconCount = 0;
const iconGroups = readdirSync(iconDir)
  .filter((f) => f.endsWith('.css'))
  .sort()
  .map((f) => {
    const names = [...new Set([...readFileSync(join(iconDir, f), 'utf8').matchAll(/\.dga-icon-([a-z0-9-]+)::?before/g)].map((m) => m[1]))].sort();
    iconCount += names.length;
    return names.length ? `## ${f.replace(/\.css$/, '')}\n\n${names.join(' ')}\n` : '';
  })
  .filter(Boolean);
writeFileSync(
  join(outDir, 'icons.md'),
  header('@mod-internal/ui icon names') +
    `${iconCount} icon names for \`<mod-icon name="...">\` and the \`leadingIcon\` / \`trailingIcon\` / \`icon\` inputs (always without the \`dga-icon-\` prefix). Grouped by category; search for a word (\`delete\`, \`calendar\`, \`warning\`, \`user\`) and use a name exactly as listed. Never guess a name: an unknown name renders nothing.\n\n` +
    iconGroups.join('\n'),
);

// Page templates: the copyable source of every demo example (what the demo's Code tab
// shows), described by the heading and description the demo page gives it.
const pagesDir = join(root, 'projects/demo/src/app/pages');
const templatesDir = join(outDir, 'templates');
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const unquote = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"');

// Every exported `*_CODE` constant in the demo, evaluated statically: string and
// template literals, `+`, `a ? b : c`, other constants, and calls to code-builder
// functions (`loginCode({...})`) declared in the same file or imported from a sibling.
const codeByConst = new Map();
const parsed = new Map();
const parse = (file) => {
  if (parsed.has(file)) return parsed.get(file);
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const decls = new Map();
  const imports = new Map();
  const exported = new Set();
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st)) {
      const isExported = ts.getCombinedModifierFlags(st) & ts.ModifierFlags.Export;
      for (const d of st.declarationList.declarations) {
        if (!ts.isIdentifier(d.name) || !d.initializer) continue;
        decls.set(d.name.text, d.initializer);
        if (isExported) exported.add(d.name.text);
      }
    } else if (ts.isFunctionDeclaration(st) && st.name) {
      decls.set(st.name.text, st);
    } else if (ts.isImportDeclaration(st) && st.moduleSpecifier.text.startsWith('.')) {
      const target = join(dirname(file), st.moduleSpecifier.text + '.ts');
      for (const el of st.importClause?.namedBindings?.elements ?? []) {
        imports.set(el.name.text, { file: target, name: (el.propertyName ?? el.name).text });
      }
    }
  }
  const info = { file, decls, imports, exported };
  parsed.set(file, info);
  return info;
};
const lookup = (info, name) => {
  if (info.decls.has(name)) return { info, node: info.decls.get(name) };
  const imp = info.imports.get(name);
  if (imp && existsSync(imp.file)) return lookup(parse(imp.file), imp.name);
  return undefined;
};
const evaluate = (node, info, env = new Map()) => {
  const fail = () => {
    throw new Error(`${relative(root, info.file)}: cannot evaluate \`${node.getText().slice(0, 60)}\``);
  };
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node)) return evaluate(node.expression, info, env);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    let out = node.head.text;
    for (const span of node.templateSpans) out += String(evaluate(span.expression, info, env) ?? '') + span.literal.text;
    return out;
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    return String(evaluate(node.left, info, env) ?? '') + String(evaluate(node.right, info, env) ?? '');
  }
  if (ts.isConditionalExpression(node)) {
    return evaluate(node.condition, info, env) ? evaluate(node.whenTrue, info, env) : evaluate(node.whenFalse, info, env);
  }
  if (ts.isIdentifier(node)) {
    if (env.has(node.text)) return env.get(node.text);
    if (node.text === 'undefined') return undefined;
    const found = lookup(info, node.text);
    return found ? evaluate(found.node, found.info) : fail();
  }
  if (ts.isPropertyAccessExpression(node)) {
    const obj = evaluate(node.expression, info, env);
    return obj && typeof obj === 'object' ? obj[node.name.text] : fail();
  }
  if (ts.isObjectLiteralExpression(node)) {
    const obj = {};
    for (const p of node.properties) {
      if (ts.isPropertyAssignment(p)) obj[p.name.getText().replace(/^['"]|['"]$/g, '')] = evaluate(p.initializer, info, env);
      else if (ts.isShorthandPropertyAssignment(p)) obj[p.name.text] = evaluate(p.name, info, env);
      else fail();
    }
    return obj;
  }
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    const found = lookup(info, node.expression.text);
    const fn = found?.node;
    if (!fn || !ts.isFunctionDeclaration(fn) || !fn.body) fail();
    const ret = fn.body.statements.length === 1 && ts.isReturnStatement(fn.body.statements[0]) ? fn.body.statements[0].expression : undefined;
    if (!ret) fail();
    const fnEnv = new Map(fn.parameters.map((p, i) => [p.name.getText(), node.arguments[i] ? evaluate(node.arguments[i], info, env) : undefined]));
    return evaluate(ret, found.info, fnEnv);
  }
  return fail();
};
for (const file of walk(pagesDir).filter((f) => f.endsWith('.ts'))) {
  const info = parse(file);
  for (const name of info.exported) {
    if (/_CODE$/.test(name)) codeByConst.set(name, evaluate(info.decls.get(name), info));
  }
}

const templateRows = [];
const usedConsts = new Set();
mkdirSync(templatesDir, { recursive: true });
for (const pageFile of walk(pagesDir).filter((f) => f.endsWith('.page.ts'))) {
  const src = readFileSync(pageFile, 'utf8');
  const html = existsSync(pageFile.replace(/\.ts$/, '.html')) ? readFileSync(pageFile.replace(/\.ts$/, '.html'), 'utf8') : '';
  const text = src + '\n' + html;
  const pageTitle = /class="content-title">([^<]+)</.exec(text)?.[1]?.trim();
  const propToConst = new Map([...src.matchAll(/readonly\s+(\w+)\s*=\s*([A-Z0-9_]+_CODE)\b/g)].map((m) => [m[1], m[2]]));
  for (const m of text.matchAll(/<demo-example\b([^>]*)>/g)) {
    const attrs = m[1];
    const prop = /\[code\]="(\w+)"/.exec(attrs)?.[1];
    const constName = prop && propToConst.get(prop);
    if (!constName || !codeByConst.has(constName)) continue;
    const heading = unquote(/\bheading="([^"]*)"/.exec(attrs)?.[1] ?? constName);
    const description = unquote(oneLine(/\bdescription="([^"]*)"/.exec(attrs)?.[1] ?? ''));
    const badge = /\bbadge="([^"]*)"/.exec(attrs)?.[1] ?? '';
    const page = pageFile.split(/[\\/]/).at(-2);
    const fileName = `${page}--${slug(heading)}.md`;
    usedConsts.add(constName);
    writeFileSync(
      join(templatesDir, fileName),
      `<!-- GENERATED by tools/gen-skill-reference.mjs from projects/demo/src/app/pages/${page} (library ${version}). Do not edit by hand. -->\n\n` +
        `# ${pageTitle}: ${heading}${badge ? ` (${badge})` : ''}\n\n${description}\n\n` +
        'A complete standalone component built only from `@mod-internal/ui`, Angular and plain CSS with the library tokens. ' +
        'Copy it, rename the selector and class, replace the sample text and data with the project\'s own (and its translation mechanism), and keep the structure.\n\n' +
        '```ts\n' + codeByConst.get(constName).trimEnd() + '\n```\n',
    );
    templateRows.push({ group: pageTitle, heading, badge, description, fileName });
  }
}

// Email templates: framework-independent functions that return a complete HTML email.
const emailDir = join(pagesDir, 'email-templates');
if (existsSync(emailDir)) {
  const emailPage = readFileSync(join(emailDir, 'email-templates.page.ts'), 'utf8');
  const layout = readFileSync(join(emailDir, 'email-layout.ts'), 'utf8');
  for (const m of emailPage.matchAll(/this\.example\(\s*'([\w-]+)',\s*'([^']*)',\s*'((?:[^'\\]|\\.)*)'/g)) {
    const [, id, heading, description] = m;
    const file = join(emailDir, `${id}.email.ts`);
    if (!existsSync(file)) continue;
    const fileName = `email-templates--${id}.md`;
    writeFileSync(
      join(templatesDir, fileName),
      `<!-- GENERATED by tools/gen-skill-reference.mjs from projects/demo/src/app/pages/email-templates (library ${version}). Do not edit by hand. -->\n\n` +
        `# Email template: ${heading}\n\n${description.replace(/\\'/g, "'")}\n\n` +
        'Plain TypeScript functions that return a complete HTML email (inline styles, tables, Arabic and English), so any back end can send it. ' +
        'Two files: `' + id + '.email.ts` and the shared `email-layout.ts`. Replace the sample values with real data and keep escaping it as the functions do.\n\n' +
        `## ${id}.email.ts\n\n` + '```ts\n' + readFileSync(file, 'utf8').trimEnd() + '\n```\n\n' +
        '## email-layout.ts\n\n' + '```ts\n' + layout.trimEnd() + '\n```\n',
    );
    templateRows.push({ group: 'Email templates', heading, badge: '', description: description.replace(/\\'/g, "'"), fileName });
  }
}
// Remove files of templates that no longer exist.
for (const f of readdirSync(templatesDir)) {
  if (!templateRows.some((r) => r.fileName === f)) rmSync(join(templatesDir, f));
}
const unused = [...codeByConst.keys()].filter((c) => !usedConsts.has(c));
if (unused.length) console.warn(`skill reference: code constants not shown on any demo page: ${unused.join(', ')}`);

const groups = [...new Set(templateRows.map((r) => r.group))];
writeFileSync(
  join(outDir, 'templates.md'),
  header('@mod-internal/ui page templates') +
    'Complete, working screens built with the library: sign-in, sign-up, verification, password reset, error and status pages, dashboards, settings, informational pages and emails. ' +
    'Start a new screen from the closest template instead of from an empty file: open its file in `templates/` and adapt it. ' +
    'Every template works in Arabic and English and from desktop to mobile.\n\n' +
    groups
      .map(
        (g) =>
          `## ${g}\n\n| Template | File | What it is |\n| --- | --- | --- |\n` +
          templateRows
            .filter((r) => r.group === g)
            .map((r) => `| ${cell(r.heading)}${r.badge ? ` (${cell(r.badge)})` : ''} | \`templates/${r.fileName}\` | ${cell(r.description)} |`)
            .join('\n'),
      )
      .join('\n\n') +
    '\n',
);

console.log(
  `skill reference: ${index.length} entries in ${sections.length} folders, ${tokenRows.length} tokens, ${iconCount} icons, ${templateRows.length} page templates -> ${relative(root, outDir)}`,
);
