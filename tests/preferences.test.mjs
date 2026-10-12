import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';
async function moduleAt(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const settings = await moduleAt('../src/core/settings.ts');
const { splitCourseLabel } = await moduleAt('../src/core/course-labels.ts');
test('invalid or missing theme follows system; explicit theme overrides it', () => {
  for (const input of [null, '', 'unknown', 'system']) assert.equal(settings.parseTheme(input), 'system');
  assert.equal(settings.resolveTheme('system', true), 'dark');
  assert.equal(settings.resolveTheme('system', false), 'light');
  assert.equal(settings.resolveTheme('light', true), 'light');
  assert.equal(settings.resolveTheme('dark', false), 'dark');
});
test('unavailable storage does not prevent in-page settings', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
  try {
    assert.equal(settings.readEnabled(), true);
    assert.equal(settings.readTheme(), 'system');
    assert.doesNotThrow(() => settings.writeEnabled(false));
    assert.doesNotThrow(() => settings.writeTheme('dark'));
    assert.doesNotThrow(settings.watchSettings(() => {}));
  } finally { delete globalThis.localStorage; }
});
test('course labels retain every character and unknown formats remain unchanged', () => {
  for (const text of ['26271-00048: 操作系统(26-27学年第1学期)', '20261： 编译：原理', '20261: C++(课程介绍)(26-27学年第1学期)']) {
    const parts = splitCourseLabel(text);
    assert.equal(parts.code + parts.name + parts.term, text);
  }
  assert.equal(splitCourseLabel('无编号的课程'), null);
  assert.equal(splitCourseLabel('编号: '), null);
});
