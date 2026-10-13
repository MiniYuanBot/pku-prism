import type { DomSession } from '../core/dom-session';

export function icon(name: 'sidebar' | 'search' | 'refresh' | 'external' | 'help' | 'home' | 'preview' | 'edit' | 'lock' | 'unlock'): SVGSVGElement {
  const paths = {
    sidebar: 'M4 4h16v16H4z M9 4v16',
    search: 'M16 16l5 5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    refresh: 'M20 7v5h-5 M20 12a8 8 0 1 1-2-6',
    external: 'M14 3h7v7 M21 3l-11 11 M10 3H3v18h18v-7',
    help: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M9 8a3 3 0 0 1 6 0c0 2-3 2-3 4 M12 16h.01',
    home: 'M3 10l9-7 9 7 M5 9v12h14V9 M9 21v-8h6v8',
    preview: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    edit: 'M16 3l5 5 M3 21l5-1L21 7a2.8 2.8 0 0 0-4-4L4 16l-1 5',
    lock: 'M6 11h12v10H6z M8 11V7a4 4 0 0 1 8 0v4',
    unlock: 'M6 11h12v10H6z M8 11V7a4 4 0 0 1 7.5-2',
  };
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', paths[name]);
  svg.append(path);
  return svg;
}

export function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function button(text: string, className = 'prism-button'): HTMLButtonElement {
  const node = element('button', className, text);
  node.type = 'button';
  return node;
}

/** Search is deliberately limited to the loaded view, and never submits its native form. */
export function searchControl(session: DomSession, placeholder: string, onSearch: (query: string) => void) {
  const group = element('div', 'prism-search');
  const input = element('input', 'prism-search-input');
  input.type = 'search';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  input.autocomplete = 'off';
  const clear = button('清空', 'prism-search-clear');
  clear.hidden = true;
  const update = () => {
    clear.hidden = !input.value;
    onSearch(input.value.trim().toLocaleLowerCase());
  };
  session.listen(input, 'input', update);
  session.listen(input, 'keydown', (event) => {
    if ((event as KeyboardEvent).key === 'Enter') event.preventDefault();
  });
  session.listen(clear, 'click', () => { input.value = ''; update(); input.focus(); });
  group.append(input, clear);
  return { group, input, reset() { input.value = ''; update(); } };
}

export function status(): HTMLElement {
  const node = element('p', 'prism-result-count');
  node.setAttribute('role', 'status');
  node.setAttribute('aria-live', 'polite');
  node.setAttribute('aria-atomic', 'true');
  return node;
}

export function responsiveDisclosure(session: DomSession, details: HTMLDetailsElement, breakpoint = 1037): void {
  const narrow = matchMedia(`(max-width: ${breakpoint}px)`);
  const update = () => { details.open = !narrow.matches; };
  session.listen(narrow, 'change', update);
  update();
}
