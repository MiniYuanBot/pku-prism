import type { DomSession } from '../core/dom-session';

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
