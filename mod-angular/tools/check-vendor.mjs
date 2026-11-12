// Guards the two edits this library needs inside the vendored base theme
// (projects/ui/src/styles/utilities/DGATheme.css). If that file is re-synced
// from the DGA source these edits are lost silently, so the library build
// runs this check first.
//
//   node tools/check-vendor.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'projects/ui/src/styles/utilities/DGATheme.css'), 'utf8');
const problems = [];

if (/\/DGA_UI\/IBMPlexSansArabic/.test(css)) {
  problems.push(
    'The IBMPlexSansArabic* @font-face rules point at /DGA_UI/*.woff again. ' +
      'Point their src at ../assets/fonts-mod/SaudiMOD-<Weight>.otf (format("opentype")).',
  );
}
for (const weight of ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold']) {
  if (!css.includes(`fonts-mod/SaudiMOD-${weight}.otf`)) {
    problems.push(`Missing Saudi MOD mapping for the ${weight} weight.`);
  }
}
if (/url\(\s*["']?\.\.\/img\//.test(css)) {
  problems.push('url(../img/...) references are back; replace them with none (the files do not exist).');
}
if (/^\s*display:\s*flex\s+-ms-flex-wrap/m.test(css)) {
  problems.push('The invalid "display: flex -ms-flex-wrap: wrap;" line is back; comment it out.');
}

if (problems.length) {
  console.error('DGATheme.css is missing required MOD edits:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('DGATheme.css: MOD edits present');