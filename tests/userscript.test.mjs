import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../userscript.config.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const exports = {};
runInNewContext(outputText, {
  exports,
  require(path) { assert.equal(path, './package.json'); return pkg; },
});
const { userscriptHeader } = exports;
const fields = (header) => new Map([...header.matchAll(/^\/\/ @([\w-]+)(?:[ \t]+(.*))?$/gm)].map((m) => [m[1], (m[2] ?? '').trim()]));
const repository = 'https://github.com/MiniYuanBot/pku-prism';
const releaseScript = `${repository}/releases/latest/download/pku-prism.user.js`;

test('release metadata preserves installed identity and pins both update URLs to the latest Release asset', () => {
  const header = userscriptHeader();
  const meta = fields(header);
  assert.ok(header.startsWith('// ==UserScript==\n'));
  assert.ok(header.endsWith('// ==/UserScript=='));
  assert.equal(meta.get('name'), 'PKU Prism');
  assert.equal(meta.get('namespace'), 'pku-prism', '保持首发标识，升级不能产生第二份脚本');
  assert.equal(meta.get('version'), pkg.version);
  assert.equal(meta.get('homepageURL'), repository);
  assert.equal(meta.get('supportURL'), `${repository}/issues`);
  assert.equal(meta.get('updateURL'), releaseScript);
  assert.equal(meta.get('downloadURL'), releaseScript);
  assert.equal(meta.get('license'), 'MIT');
  assert.match(readFileSync(new URL('../LICENSE', import.meta.url), 'utf8'), /^MIT License/);
  assert.equal(meta.get('author'), 'miniyuan');
});

test('development metadata has a separate name and cannot update to a production Release', () => {
  const meta = fields(userscriptHeader(true));
  assert.equal(meta.get('name'), 'PKU Prism (Dev)');
  assert.notEqual(meta.get('name'), fields(userscriptHeader()).get('name'));
  assert.equal(meta.get('namespace'), 'pku-prism');
  assert.equal(meta.get('version'), pkg.version);
  assert.equal(meta.get('updateURL'), 'none');
  assert.equal(meta.get('downloadURL'), 'none');
});

test('both script variants retain the existing site restrictions and require no additional privileges', () => {
  for (const development of [false, true]) {
    const header = userscriptHeader(development);
    const meta = fields(header);
    assert.equal(meta.get('match'), 'https://course.pku.edu.cn/webapps/*');
    assert.equal(meta.get('exclude'), 'https://course.pku.edu.cn/webapps/login/*');
    assert.equal(meta.get('grant'), 'none');
    assert.equal(meta.get('run-at'), 'document-end');
    assert.ok(meta.has('noframes'));
    assert.doesNotMatch(header, /@require|@connect|localhost/);
  }
});
