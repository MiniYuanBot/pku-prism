import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

// Test route/DOM safety without an additional test framework or DOM dependency.
const source = readFileSync(new URL('../src/core/page.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { detectPage } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const documentWith = (...selectors) => ({ querySelector: (selector) => selectors.includes(selector) ? {} : null });

test('recognizes inspected pages only when route and DOM agree', () => {
  assert.equal(detectPage(documentWith('.containerPortal #column1'), '/webapps/portal/execute/tabs/tabAction'), 'portal');
  assert.equal(detectPage(documentWith('#announcementList'), '/webapps/blackboard/execute/announcement'), 'announcements');
  assert.equal(detectPage(documentWith('#content_listContainer'), '/webapps/blackboard/content/listContent.jsp'), 'content');
});

test('leaves authentication, grades, assignment forms, and unknown pages alone', () => {
  const allMarkers = documentWith('.containerPortal #column1', '#announcementList', '#content_listContainer');
  for (const path of ['/webapps/login/', '/webapps/portal/unknown', '/webapps/gradebook/do/student/viewCourses', '/webapps/assignment/uploadAssignment', '/unknown']) {
    assert.equal(detectPage(allMarkers, path), null);
  }
  assert.equal(detectPage(documentWith(), '/webapps/portal/execute/tabs/tabAction'), null);
  assert.equal(detectPage(documentWith('#content_listContainer'), '/webapps/blackboard/execute/announcement'), null);
});
