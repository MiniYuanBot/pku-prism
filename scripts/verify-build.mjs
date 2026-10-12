import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const script = readFileSync(new URL('../dist/pku-prism.user.js', import.meta.url), 'utf8');
assert.ok(script.startsWith('// ==UserScript==\n'), 'UserScript metadata must be first');
assert.match(script, /\/\/ @match\s+https:\/\/course\.pku\.edu\.cn\/webapps\/\*/);
assert.match(script, /\/\/ @grant\s+none/);
assert.match(script, /\/\/ @noframes/);
assert.doesNotMatch(script, /localhost|127\.0\.0\.1|@require|@connect|sourceMappingURL|import\.meta/);
new Script(script); // The distribution must parse as a standalone classic script.
console.log('Verified: standalone userscript, scoped metadata, no dev URLs or runtime dependencies.');
