import type { DomSession } from '../core/dom-session';
import { button, element, searchControl, status } from './components';

export function redesignContent(session: DomSession): void {
  const list = document.querySelector<HTMLElement>('#content_listContainer');
  const items = [...list?.children ?? []].filter((li): li is HTMLElement => li instanceof HTMLElement && !!li.querySelector('.item h3') && !li.hidden);
  if (!list?.parentElement || !items.length) return;
  const toolbar = session.own(element('div', 'prism-list-toolbar'), list.parentElement, list);
  const count = status();
  const empty = session.own(element('p', 'prism-empty', '没有匹配的内容。请更换关键词或清空搜索。'), list.parentElement, list.nextSibling);
  empty.hidden = true;
  const expandAll = button('展开全部说明');
  expandAll.setAttribute('aria-pressed', 'false');
  const disclosures: Array<{ body: HTMLElement; trigger: HTMLButtonElement; title: string; open: boolean }> = [];
  const records = items.map((li, index) => {
    const item = li.querySelector<HTMLElement>('.item')!;
    const title = item.querySelector('h3')!;
    const description = li.querySelector<HTMLElement>('.details > .vtbegenerated');
    const type = li.querySelector('.item_icon')?.getAttribute('alt');
    const actions = session.own(element('div', 'prism-resource-actions'), item);
    if (type) actions.append(element('span', 'prism-resource-type', type));
    if (description?.innerText.trim()) {
      const trigger = button('查看说明', 'prism-button prism-description-toggle');
      if (!description.id) session.attribute(description, 'id', `prism-description-${index}`);
      trigger.setAttribute('aria-controls', description.id);
      trigger.setAttribute('aria-label', `查看说明：${title.textContent?.trim()}`);
      actions.append(trigger);
      const disclosure = { body: description, trigger, title: title.textContent?.trim() ?? '', open: false };
      disclosures.push(disclosure);
      session.listen(trigger, 'click', () => { disclosure.open = !disclosure.open; renderDisclosures(); });
    }
    return { li, text: `${title.textContent} ${description?.innerText ?? ''}`.toLocaleLowerCase() };
  });
  function renderDisclosures() {
    for (const disclosure of disclosures) {
      session.hidden(disclosure.body, !disclosure.open);
      disclosure.trigger.textContent = disclosure.open ? '收起说明' : '查看说明';
      disclosure.trigger.setAttribute('aria-label', `${disclosure.trigger.textContent}：${disclosure.title}`);
      disclosure.trigger.setAttribute('aria-expanded', String(disclosure.open));
    }
    const allOpen = disclosures.every(disclosure => disclosure.open);
    expandAll.textContent = allOpen ? '收起全部说明' : '展开全部说明';
    expandAll.setAttribute('aria-pressed', String(allOpen));
  }
  const search = searchControl(session, '搜索本页内容名称或说明', query => {
    let matches = 0;
    for (const record of records) {
      const show = record.text.includes(query);
      session.hidden(record.li, !show);
      if (show) matches++;
    }
    count.textContent = query ? `${matches} / ${items.length} 项 · 搜索本页内容` : `${items.length} 项内容`;
    empty.hidden = matches > 0;
  });
  toolbar.append(search.group, count);
  if (disclosures.length) toolbar.append(expandAll);
  session.listen(expandAll, 'click', () => {
    const open = !disclosures.every(disclosure => disclosure.open);
    disclosures.forEach(disclosure => { disclosure.open = open; });
    renderDisclosures();
  });
  session.attribute(list, 'data-prism-layout', 'resources');
  search.reset();
  renderDisclosures();
}
