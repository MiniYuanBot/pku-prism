import { detectPage } from './page';

/** Theme same-origin native frames without touching embedded apps, credentials or content. */
export function themeFrames(css: string, state: () => { enabled: boolean; theme: 'light' | 'dark' }) {
  const frames = new Map<HTMLIFrameElement, () => void>();
  const documents = new Map<Document, { style: HTMLStyleElement; original: Array<string | null> }>();
  const attributes = ['data-pku-prism', 'data-pku-prism-page', 'data-pku-prism-theme', 'data-pku-prism-frame'];
  const clear = (doc: Document) => {
    const owned = documents.get(doc);
    if (!owned) return;
    owned.style.remove();
    attributes.forEach((name, i) => owned.original[i] === null ? doc.documentElement.removeAttribute(name) : doc.documentElement.setAttribute(name, owned.original[i]!));
    documents.delete(doc);
  };
  function refresh() {
    const current = state();
    const isCurrent = (doc: Document) => {
      try { return (doc.defaultView?.frameElement as HTMLIFrameElement | null)?.contentDocument === doc; } catch { return false; }
    };
    for (const doc of [...documents.keys()]) if (!current.enabled || !isCurrent(doc)) clear(doc);
    const visit = (doc: Document) => {
      for (const frame of doc.querySelectorAll<HTMLIFrameElement>('iframe')) {
        if (!frames.has(frame)) {
          const listener = () => refresh();
          frame.addEventListener('load', listener);
          frames.set(frame, () => frame.removeEventListener('load', listener));
        }
        let child: Document | null;
        try {
          child = frame.contentDocument;
          if (!child?.body || child.location.origin !== location.origin) continue;
        } catch { continue; }
        const page = detectPage(child, child.location.pathname);
        if (current.enabled && page) {
          if (!documents.has(child)) {
            const style = child.createElement('style');
            style.id = 'pku-prism-frame-styles';
            style.textContent = css;
            documents.set(child, { style, original: attributes.map(name => child!.documentElement.getAttribute(name)) });
            child.head.append(style);
          }
          const root = child.documentElement;
          root.setAttribute(attributes[0]!, 'enabled');
          root.setAttribute(attributes[1]!, page);
          root.setAttribute(attributes[2]!, current.theme);
          root.setAttribute(attributes[3]!, '');
        }
        visit(child);
      }
    };
    visit(document);
  }
  return { refresh, destroy() { frames.forEach(stop => stop()); frames.clear(); [...documents.keys()].forEach(clear); } };
}
