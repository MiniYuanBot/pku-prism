/** A reversible presentation transaction. Native nodes and event containers stay intact. */
export class DomSession {
  private undos: Array<() => void> = [];
  private attributes = new Map<Element, Map<string, { original: string | null; last: string | null }>>();

  own<T extends HTMLElement>(node: T, parent: Node, before: Node | null = null): T {
    parent.insertBefore(node, before);
    this.defer(() => node.remove());
    return node;
  }

  move(node: Node, parent: Node, before: Node | null = null): void {
    if (!node.parentNode) throw new Error('Cannot move a detached native node');
    const marker = document.createComment('pku-prism:original-position');
    node.parentNode.insertBefore(marker, node);
    this.defer(() => {
      // If Blackboard replaced the original region, do not resurrect stale content.
      if (marker.isConnected) {
        this.place(marker.parentNode!, node, marker);
        marker.remove();
      }
      else marker.remove();
    });
    this.place(parent, node, before);
  }

  private place(parent: Node, node: Node, before: Node | null): void {
    // insertBefore disconnects/reloads live iframes (including TinyMCE documents).
    const stable = parent as Node & { moveBefore?: (node: Node, before: Node | null) => void };
    if (stable.moveBefore && parent.isConnected && node.isConnected) stable.moveBefore(node, before);
    else parent.insertBefore(node, before);
  }

  attribute(node: Element, name: string, value: string | null): void {
    let fields = this.attributes.get(node);
    if (!fields) this.attributes.set(node, fields = new Map());
    let record = fields.get(name);
    if (!record) {
      record = { original: node.getAttribute(name), last: value };
      fields.set(name, record);
      const saved = record;
      this.defer(() => {
        if (node.getAttribute(name) !== saved.last) return;
        if (saved.original === null) node.removeAttribute(name);
        else node.setAttribute(name, saved.original);
      });
    }
    record.last = value;
    if (value === null) node.removeAttribute(name);
    else node.setAttribute(name, value);
  }

  hidden(node: HTMLElement, value: boolean): void { this.attribute(node, 'hidden', value ? '' : null); }

  text(node: Text, value: string): void {
    const original = node.data;
    node.data = value;
    this.defer(() => { if (node.data === value) node.data = original; });
  }

  listen(target: EventTarget, type: string, listener: EventListener): void {
    target.addEventListener(type, listener);
    this.defer(() => target.removeEventListener(type, listener));
  }

  defer(undo: () => void): void { this.undos.push(undo); }

  restore(): void {
    for (const undo of this.undos.splice(0).reverse()) undo();
    this.attributes.clear();
  }
}
