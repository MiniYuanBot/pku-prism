import type { DomSession } from '../core/dom-session';
import { button, element, searchControl, status } from './components';

export function redesignPortal(session: DomSession): void {
  const container = document.querySelector<HTMLElement>('.containerPortal');
  const current = document.querySelector<HTMLElement>('#column1 .portlet:has(.courseListing)');
  const history = current?.nextElementSibling as HTMLElement | null;
  const tools = document.querySelector<HTMLElement>('#column0 .portlet');
  const context = document.querySelector<HTMLElement>('#column2');
  const tabs = document.querySelector<HTMLElement>('#appTabList');
  if (!container || !current || !history?.querySelector('.courseListing') || !tools || !context || !tabs) return;

  const workspace = session.own(element('div', 'prism-workspace'), container, container.firstChild);
  const navigation = element('aside', 'prism-workspace-nav');
  navigation.setAttribute('aria-label', '教学网工作区');
  const main = element('section', 'prism-course-catalog');
  main.id = 'pku-prism-courses';
  main.setAttribute('aria-label', '我的课程');
  const heading = element('header', 'prism-catalog-heading');
  heading.append(element('h1', 'prism-page-heading', '我的课程'));
  const view = element('div', 'prism-view-switch');
  view.setAttribute('role', 'group');
  view.setAttribute('aria-label', '课程范围');
  const currentButton = button(`当前学期 ${current.querySelectorAll('.courseListing > li').length}`);
  const historyButton = button(`历史课程 ${history.querySelectorAll('.courseListing > li').length}`);
  view.append(currentButton, historyButton);
  heading.append(view);
  const toolbar = element('div', 'prism-catalog-toolbar');
  const count = status();
  const empty = element('p', 'prism-empty', '没有匹配的课程。请更换关键词或清空搜索。');
  empty.hidden = true;
  const stage = element('div', 'prism-course-stage');
  stage.id = 'prism-course-stage';
  currentButton.setAttribute('aria-controls', stage.id);
  historyButton.setAttribute('aria-controls', stage.id);
  let active = current;
  let query = '';
  const groups = [current, history].flatMap(module => [...module.querySelectorAll<HTMLElement>('.courseListing')].map(list => ({
    module, list, items: [...list.children].filter((li): li is HTMLElement => li instanceof HTMLElement && !li.hidden)
      .map(li => ({ li, text: li.innerText.toLocaleLowerCase() })),
  })));
  function render() {
    session.hidden(current!, active !== current);
    session.hidden(history!, active !== history);
    currentButton.setAttribute('aria-pressed', String(active === current));
    historyButton.setAttribute('aria-pressed', String(active === history));
    let total = 0;
    let matches = 0;
    for (const group of groups) {
      let visible = 0;
      for (const item of group.items) {
        const show = item.text.includes(query);
        session.hidden(item.li, !show);
        if (show) visible++;
      }
      // Each observed role section contains only its heading and course list.
      if (group.list.parentElement?.children.length === 2) session.hidden(group.list.parentElement, !visible);
      if (group.module === active) { total += group.items.length; matches += visible; }
    }
    count.textContent = query ? `${matches} / ${total} 门课程 · 仅搜索当前视图` : `${total} 门课程`;
    empty.hidden = matches > 0;
  }
  const search = searchControl(session, '搜索当前视图的课程名称或编号', value => { query = value; render(); });
  search.input.id = 'pku-prism-course-search';
  toolbar.append(search.group, count);
  main.append(heading, toolbar, stage, empty);
  const support = element('aside', 'prism-workspace-context');
  support.setAttribute('aria-label', '公告与事务');
  workspace.append(navigation, main, support);
  session.move(tools, navigation);
  session.move(current, stage);
  session.move(history, stage);
  session.move(context, support);
  for (const column of container.querySelectorAll<HTMLElement>(':scope > .column-3')) session.hidden(column, true);
  session.attribute(container, 'data-prism-layout', 'workspace');
  session.listen(currentButton, 'click', () => { active = current; render(); });
  session.listen(historyButton, 'click', () => { active = history; render(); });
  render();
  if (location.hash === '#pku-prism-course-search') search.input.focus();
}
