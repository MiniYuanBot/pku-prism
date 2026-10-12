import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';
const { outputText } = ts.transpileModule(readFileSync(new URL('../src/core/dom-session.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { DomSession } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

// Minimal tree fixture for transaction semantics; real DOM, forms and events are checked in Chrome.
class Tree extends EventTarget {
  parentNode = null;
  children = [];
  fields = new Map();
  constructor(name, root = false) { super(); this.name = name; this.root = root; }
  get isConnected() { return this.root || !!this.parentNode?.isConnected; }
  insertBefore(node, before) {
    node.remove();
    const index = before === null ? this.children.length : this.children.indexOf(before);
    assert.ok(index >= 0);
    this.children.splice(index, 0, node);
    node.parentNode = this;
    return node;
  }
  append(...nodes) { nodes.forEach(node => this.insertBefore(node, null)); }
  remove() {
    if (this.parentNode) this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1);
    this.parentNode = null;
  }
  replaceWith(node) { const parent = this.parentNode; parent.insertBefore(node, this); this.remove(); }
  getAttribute(name) { return this.fields.get(name) ?? null; }
  setAttribute(name, value) { this.fields.set(name, value); }
  removeAttribute(name) { this.fields.delete(name); }
}
globalThis.document = { createComment: () => new Tree('marker') };

test('nested moves restore exact node identity, order and original containers', () => {
  const root = new Tree('document', true), form = new Tree('form'), list = new Tree('list'), item = new Tree('item'), sibling = new Tree('sibling');
  root.append(form); form.append(list, sibling); list.append(item);
  const session = new DomSession();
  const shell = session.own(new Tree('shell'), form, list);
  session.move(list, shell);
  const details = session.own(new Tree('details'), shell);
  session.move(item, details);
  session.restore();
  assert.deepEqual(root.children, [form]);
  assert.deepEqual(form.children, [list, sibling]);
  assert.deepEqual(list.children, [item]);
  assert.equal(item.parentNode, list);
  assert.equal(shell.parentNode, null);
  assert.doesNotThrow(() => session.restore());
});
test('repeated filtering restores original attributes rather than the preceding filter', () => {
  const node = new Tree('row'); node.setAttribute('hidden', 'original'); node.setAttribute('id', 'native');
  const session = new DomSession();
  session.hidden(node, false); session.hidden(node, true); session.hidden(node, false);
  session.attribute(node, 'id', 'prism'); session.attribute(node, 'tabindex', '-1');
  session.restore();
  assert.equal(node.getAttribute('hidden'), 'original');
  assert.equal(node.getAttribute('id'), 'native');
  assert.equal(node.getAttribute('tabindex'), null);
});
test('native attribute updates retain ownership during cleanup', () => {
  const node = new Tree('row'), session = new DomSession();
  session.attribute(node, 'id', 'prism'); node.setAttribute('id', 'native-update');
  session.restore();
  assert.equal(node.getAttribute('id'), 'native-update');
});
test('a replaced native region is not resurrected by rollback', () => {
  const root = new Tree('document', true), original = new Tree('original'), target = new Tree('target'), item = new Tree('item');
  root.append(original, target); original.append(item);
  const session = new DomSession(); session.move(item, target);
  original.remove(); session.restore();
  assert.equal(original.isConnected, false);
  assert.equal(item.parentNode, target);
  assert.equal(original.children.length, 0);
});
test('owned listeners are removed even after repeated state changes', () => {
  const target = new EventTarget(), session = new DomSession(); let calls = 0;
  session.listen(target, 'probe', () => calls++);
  target.dispatchEvent(new Event('probe')); session.restore(); target.dispatchEvent(new Event('probe'));
  assert.equal(calls, 1);
});
