import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

// Test route/DOM safety without an additional test framework or DOM dependency.
const source = readFileSync(new URL('../src/core/page.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { detectPage } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const documentWith = (...selectors) => ({ querySelector: (selector) => selectors.includes(selector) ? {} : null });

test('deep adapters require the inspected route and DOM', () => {
  assert.equal(detectPage(documentWith('.containerPortal #column1', '.courseListing'), '/webapps/portal/execute/tabs/tabAction'), 'portal');
  assert.equal(detectPage(documentWith('.containerPortal #column1'), '/webapps/portal/execute/tabs/tabAction'), 'portal-tools');
  assert.equal(detectPage(documentWith('#announcementList'), '/webapps/blackboard/execute/announcement'), 'announcements');
  assert.equal(detectPage(documentWith('#content_listContainer'), '/webapps/blackboard/content/listContent.jsp'), 'content');
});

test('leaves authentication and documents without a native Blackboard marker alone', () => {
  const allMarkers = documentWith('.containerPortal #column1', '#announcementList', '#content_listContainer');
  for (const path of ['/webapps/login/', '/webapps/portal/unknown', '/webapps/gradebook/do/student/viewCourses', '/webapps/assignment/uploadAssignment', '/unknown']) {
    assert.equal(detectPage(allMarkers, path), null);
  }
  assert.equal(detectPage(documentWith(), '/webapps/portal/execute/tabs/tabAction'), null);
  assert.equal(detectPage(documentWith('#content_listContainer'), '/webapps/blackboard/execute/announcement'), null);
});

test('native tool and assignment pages get the shared baseline without a deep adapter', () => {
  const native = documentWith('body#learn-oe-body', '#containerdiv');
  for (const path of ['/webapps/gradebook/do/student/viewCourses', '/webapps/assignment/uploadAssignment', '/webapps/discussionboard/do/conference', '/webapps/blackboard/execute/personalInfo']) {
    assert.equal(detectPage(native, path), 'tools');
  }
  assert.equal(detectPage(documentWith('body#learn-oe-body', '#content_listContainer'), '/webapps/unknown'), 'shell');
});

test('recognizes native calendars, collections and embedded Blackboard streams', () => {
  for (const [marker, kind] of [['#calendar', 'calendar'], ['.mybb-div', 'mybb'], ['.stream_pages', 'stream'], ['body.content-system-page', 'collection']]) {
    assert.equal(detectPage(documentWith('body#learn-oe-body', marker), '/webapps/native'), kind);
  }
});

test('authentication remains excluded even if it contains native markers', () => {
  const native = documentWith('body#learn-oe-body', '#containerdiv');
  for (const path of ['/webapps/login', '/webapps/login/', '/webapps/auth/callback', '/webapps/sso/login', '/outside']) {
    assert.equal(detectPage(native, path), null);
  }
});

test('assignment variants and editable frames require their observed route and markers', () => {
  const path = '/webapps/assignment/uploadAssignment';
  for (const [marker, kind] of [['#uploadAssignmentFormId', 'assignment-submit'], ['#inlineGrader', 'assignment-review']]) {
    assert.equal(detectPage(documentWith('body#learn-oe-body', marker), path), kind);
    assert.equal(detectPage(documentWith(marker), path), null);
    assert.equal(detectPage(documentWith('body#learn-oe-body', marker), '/webapps/other'), 'shell');
  }
  const editor = documentWith('body#tinymce.mce-content-body[contenteditable="true"]');
  assert.equal(detectPage(editor, path), 'editor');
  assert.equal(detectPage(editor, '/webapps/other'), null);
  assert.equal(detectPage(documentWith('body#learn-oe-body', '#mybb_column_wrapper', '.stream_pages'), '/webapps/bb-social-learning-BBLEARN/execute/mybbOverview'), 'overview');
});

test('ClassIn binding styles require both the native wrapper and inspected form route', () => {
  const path = '/webapps/bb-ClassIn-BBLEARN/userPhone/isBindPhone.do';
  const marker = '#panelbutton1 #searchForm #enInputContent';
  assert.equal(detectPage(documentWith('body#learn-oe-body', marker), path), 'classin');
  assert.equal(detectPage(documentWith(marker), path), null);
  assert.equal(detectPage(documentWith('body#learn-oe-body', marker), '/webapps/other'), 'shell');
});
