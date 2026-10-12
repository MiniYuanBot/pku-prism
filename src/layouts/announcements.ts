import type { DomSession } from '../core/dom-session';
import { button, element, responsiveDisclosure, searchControl, status } from './components';

export function redesignAnnouncements(session: DomSession): void {
  const list = document.querySelector<HTMLElement>('#announcementList');
  const items = [...list?.children ?? []].filter((li): li is HTMLElement => li instanceof HTMLElement && !!li.querySelector('h3.item') && !li.hidden);
  if (!list?.parentElement || !items.length) return;
  const workspace = session.own(element('div', 'prism-ann-workspace'), list.parentElement, list);
  const toolbar = element('div', 'prism-list-toolbar');
  const all = button('全部展开');
  all.setAttribute('aria-pressed', 'false');
  const count = status();
  const directory = element('details', 'prism-ann-directory');
  const summary = element('summary', 'prism-nav-summary', '公告目录');
  const entries = element('div', 'prism-ann-entries');
  entries.setAttribute('role', 'group');
  entries.setAttribute('aria-label', '选择要阅读的公告');
  directory.append(summary, entries);
  const reader = element('section', 'prism-ann-reader');
  reader.setAttribute('aria-label', '公告正文');
  const empty = element('p', 'prism-empty', '没有匹配的公告。请更换关键词或清空搜索。');
  empty.hidden = true;
  reader.append(empty);
  let selected = 0;
  let expanded = false;
  let query = '';
  const records = items.map((li, index) => {
    // Blackboard surrounds the authored body with empty, fixed-height paragraphs.
    // Do not alter blank paragraphs or formatting inside the actual rich text body.
    for (const paragraph of li.querySelectorAll<HTMLElement>(':scope > .details > p')) {
      if (!paragraph.textContent?.trim() && [...paragraph.children].every(child => child.tagName === 'BR')) session.hidden(paragraph, true);
    }
    // A leading blank line contributes no content; keep all subsequent rich-text line breaks.
    const firstParagraph = li.querySelector('.vtbegenerated > p:first-child');
    for (const node of firstParagraph?.childNodes ?? []) {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) continue;
      if (node instanceof HTMLBRElement) session.hidden(node, true);
      else break;
    }
    const title = li.querySelector<HTMLElement>('h3.item')!;
    const date = li.querySelector('.details > p')?.textContent ?? '';
    const shortDate = date.match(/\d{4}年\d+月\d+日/u)?.[0] ?? date;
    const entry = button('', 'prism-ann-entry');
    entry.append(element('span', 'prism-ann-entry-title', title.innerText), element('span', 'prism-ann-entry-date', shortDate));
    entries.append(entry);
    if (!li.id) session.attribute(li, 'id', `prism-ann-${index}`);
    entry.setAttribute('aria-controls', li.id);
    session.attribute(title, 'tabindex', '-1');
    session.listen(entry, 'click', () => {
      selected = index;
      expanded = false;
      render();
      if (matchMedia('(max-width: 736px)').matches) directory.open = false;
      title.focus({ preventScroll: true });
    });
    return { li, entry, text: li.innerText.toLocaleLowerCase() };
  });
  function render() {
    const matches = records.map(record => record.text.includes(query));
    if (!matches[selected]) selected = matches.indexOf(true);
    records.forEach((record, index) => {
      record.entry.hidden = !matches[index];
      record.entry.setAttribute('aria-current', String(!expanded && selected === index));
      session.hidden(record.li, !matches[index] || (!expanded && index !== selected));
    });
    const number = matches.filter(Boolean).length;
    count.textContent = query ? `${number} / ${items.length} 条公告 · 搜索本页内容` : `${items.length} 条公告`;
    summary.textContent = `公告目录 · ${number}`;
    empty.hidden = number > 0;
    all.textContent = expanded ? '逐条阅读' : '全部展开';
    all.setAttribute('aria-pressed', String(expanded));
  }
  const search = searchControl(session, '搜索本页公告标题或正文', value => { query = value; render(); });
  toolbar.append(search.group, count, all);
  workspace.append(toolbar, directory, reader);
  session.move(list, reader);
  session.attribute(list, 'data-prism-layout', 'reader');
  session.listen(all, 'click', () => { expanded = !expanded; render(); });
  responsiveDisclosure(session, directory, 736);
  render();
}
