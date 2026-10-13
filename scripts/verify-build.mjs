import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const script = readFileSync(new URL('../dist/pku-prism.user.js', import.meta.url), 'utf8');
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
assert.ok(script.startsWith('// ==UserScript==\n'), 'UserScript metadata must be first');
const header = script.slice(0, script.indexOf('// ==/UserScript=='));
const repository = 'https://github.com/MiniYuanBot/pku-prism';
const fields = new Map([...header.matchAll(/^\/\/ @([\w-]+)(?:[ \t]+(.*))?$/gm)].map((match) => [match[1], (match[2] ?? '').trim()]));
for (const [field, value] of Object.entries({
  name: 'PKU Prism', namespace: 'pku-prism', version,
  homepageURL: repository, supportURL: `${repository}/issues`,
  updateURL: `${repository}/releases/latest/download/pku-prism.user.js`,
  downloadURL: `${repository}/releases/latest/download/pku-prism.user.js`,
  license: 'MIT', author: 'miniyuan',
})) assert.equal(fields.get(field), value, `Unexpected @${field}`);
assert.match(script, /\/\/ @match\s+https:\/\/course\.pku\.edu\.cn\/webapps\/\*/);
assert.match(script, /\/\/ @grant\s+none/);
assert.match(script, /\/\/ @noframes/);
assert.doesNotMatch(script, /localhost|127\.0\.0\.1|@require|@connect|sourceMappingURL|import\.meta/);
new Script(script); // The distribution must parse as a standalone classic script.
console.log('Verified: standalone userscript, stable identity and Release update URLs, scoped metadata, no dev URLs or runtime dependencies.');
