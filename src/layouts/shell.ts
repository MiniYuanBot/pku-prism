import type { DomSession } from '../core/dom-session';
import { button, element, icon } from './components';
import { redesignContextControls } from './context-controls';

/** Global destinations stay in the header; native context belongs to the sidebar. */
export function redesignShell(session: DomSession, control: HTMLElement): void {
  const top = document.querySelector<HTMLElement>('#topTabs');
  const tabs = document.querySelector<HTMLElement>('.tabWrapper-right');
  if (!top || !tabs) return;
  const nativeMobile = matchMedia('(max-width: 1037px)');
  const startedMobile = nativeMobile.matches;
  session.defer(() => {
    if (nativeMobile.matches === startedMobile) return;
    const menu = (window as Window & { globalNavMenu?: { mobileMenuMods?: () => void; reverseMobileMenuMods?: () => void } }).globalNavMenu;
    if (nativeMobile.matches) menu?.mobileMenuMods?.(); else menu?.reverseMobileMenuMods?.();
  });
  const header = session.own(element('header', 'prism-shell-header'), document.body, document.body.firstChild);
  header.setAttribute('aria-label', '教学网全局导航');
  session.attribute(document.body, 'data-prism-shell', '');
  const brand = element('span', 'prism-shell-brand', 'PKU Prism');
  const sites = element('nav', 'prism-shell-site-panel');
  sites.setAttribute('aria-label', '教学网站点');
  const utilities = element('div', 'prism-shell-utilities');
  const appearance = element('details', 'prism-shell-appearance');
  const summary = element('summary', 'prism-shell-summary', '外观');
  summary.setAttribute('aria-label', 'PKU Prism 外观设置');
  appearance.append(summary);
  const appearancePanel = element('div', 'prism-shell-appearance-panel');
  appearancePanel.append(element('p', 'prism-settings-title', 'PKU Prism'));
  appearance.append(appearancePanel);
  const account = element('div', 'prism-shell-account');
  utilities.append(appearance, account);
  header.append(brand, sites, utilities);
  session.move(tabs, sites);
  const siteLinks = [...tabs.querySelectorAll<HTMLAnchorElement>('#appTabList td > a')];
  for (const link of siteLinks) {
    for (const label of link.querySelectorAll('span')) for (const node of label.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      const short = node.textContent?.replace(/^(\s*(?:我的主页|我的社区|我的资源|北大课程))\s*[（(][A-Za-z ]+[)）](\s*)$/, '$1$2');
      if (short !== undefined && short !== node.textContent) session.text(node as Text, short);
    }
    session.attribute(link, 'aria-current', link.closest('td')?.classList.contains('active') ? 'page' : null);
  }
  const home = siteLinks.find(link => link.textContent?.trim() === '我的主页');
  const homeHref = home?.getAttribute('href');
  if (home && homeHref) {
    const cell = session.own(element('td', 'prism-courses-tab'), home.parentNode!.parentNode!, home.parentElement!.nextSibling);
    const courses = element('a', 'prism-courses-link', '我的课程');
    courses.href = `${homeHref}#pku-prism-courses`;
    cell.append(courses);
    const coursePage = !!document.querySelector('#courseMenuPalette');
    const current = () => {
      const inCourses = coursePage || location.hash === '#pku-prism-courses';
      courses.toggleAttribute('aria-current', inCourses);
      if (inCourses) courses.setAttribute('aria-current', 'page');
      for (const link of siteLinks) session.attribute(link, 'aria-current', !inCourses && link.closest('td')?.classList.contains('active') ? 'page' : null);
    };
    session.listen(window, 'hashchange', current);
    current();
    const search = element('a', 'prism-icon-button prism-global-search');
    search.href = `${homeHref}#pku-prism-course-search`;
    search.title = '搜索我的课程';
    search.setAttribute('aria-label', '搜索我的课程');
    search.append(icon('search'));
    utilities.insertBefore(search, appearance);
    session.listen(search, 'click', event => {
      const input = document.querySelector<HTMLInputElement>('#pku-prism-course-search');
      if (!input) return;
      event.preventDefault();
      input.focus();
      input.scrollIntoView({ block: 'center' });
    });
  }
  const user = document.querySelector<HTMLElement>('.global-nav-bar-wrap');
  if (user) session.move(user, account);
  const globalNav = document.querySelector<HTMLElement>('#global-nav');
  if (globalNav && user) session.move(globalNav, user);
  session.move(control, appearancePanel);
  session.attribute(control, 'data-header', '');
  const quickLinks = document.querySelector<HTMLElement>('#quick_links_wrap');
  if (quickLinks) session.move(quickLinks, appearancePanel);
  session.hidden(top, true);
  const nativeHeader = document.querySelector<HTMLElement>('#globalNavPageNavArea');
  if (nativeHeader?.contains(top)) session.hidden(nativeHeader, true);
  session.listen(document, 'pointerdown', event => { if (!appearance.contains(event.target as Node)) appearance.open = false; });
  session.listen(appearance, 'keydown', event => {
    if ((event as KeyboardEvent).key === 'Escape') { appearance.open = false; summary.focus(); }
  });

  const heightToken = '--prism-header-height';
  const originalHeight = document.body.style.getPropertyValue(heightToken);
  const originalPriority = document.body.style.getPropertyPriority(heightToken);
  let height = '';
  const measure = () => {
    height = `${Math.ceil(header.getBoundingClientRect().height)}px`;
    document.body.style.setProperty(heightToken, height);
  };
  const observer = new ResizeObserver(measure);
  observer.observe(header); measure();
  session.defer(() => {
    observer.disconnect();
    if (document.body.style.getPropertyValue(heightToken) !== height) return;
    if (originalHeight) document.body.style.setProperty(heightToken, originalHeight, originalPriority); else document.body.style.removeProperty(heightToken);
  });

  let rail = document.querySelector<HTMLElement>('#navigationPane, .prism-workspace-nav, #side_nav');
  let body = rail?.closest<HTMLElement>('.prism-workspace, .mybb-div') ?? null;
  const content = document.querySelector<HTMLElement>('#contentPanel');
  if (rail?.id === 'navigationPane' && content && rail.parentElement === content.parentElement) {
    // Older browsers keep native iframe-containing layout instead of resetting editors.
    if (content.querySelector('iframe') && !('moveBefore' in Element.prototype)) rail = null;
    else {
      body = session.own(element('div', 'prism-shell-body'), rail.parentElement!, rail);
      session.move(rail, body); session.move(content, body);
    }
  }
  if (rail && body) {
    session.attribute(rail, 'data-prism-context-rail', '');
    if (!rail.id) session.attribute(rail, 'id', 'pku-prism-context-rail');
    const crumbs = document.querySelector<HTMLElement>('#breadcrumbs');
    if (crumbs) {
      session.move(crumbs, rail, rail.firstChild);
      const courseLinks = [...rail.querySelectorAll<HTMLAnchorElement>('#courseMenuPalette_contents a')];
      for (const item of crumbs.querySelectorAll<HTMLElement>('.path > ol > li:not(.coursePath)')) {
        const link = item.querySelector<HTMLAnchorElement>('a[href]');
        if (!link || courseLinks.some(other => other.href === link.href)) session.hidden(item, true);
      }
    }
    for (const region of document.querySelectorAll<HTMLElement>('#paneTabs, .localViewToggle')) session.move(region, rail);
    const heading = document.querySelector('#courseMenu_link');
    if (heading) for (const node of heading.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) session.text(node as Text, '课程目录');
    }
    redesignContextControls(session, rail);
    const toggle = button('', 'prism-icon-button prism-rail-toggle');
    toggle.append(icon('sidebar'));
    toggle.setAttribute('aria-controls', rail.id);
    header.insertBefore(toggle, brand);
    const backdrop = element('button', 'prism-rail-backdrop');
    backdrop.type = 'button'; backdrop.tabIndex = -1; backdrop.setAttribute('aria-label', '关闭侧栏'); body.append(backdrop);
    session.defer(() => backdrop.remove());
    const narrow = matchMedia('(max-width: 900px)');
    const panels = [...body.children].filter((node): node is HTMLElement => node instanceof HTMLElement && node !== rail && node !== backdrop);
    const setOpen = (open: boolean) => {
      session.attribute(body!, 'data-prism-rail', open ? 'open' : 'closed');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '收起侧边栏' : '展开侧边栏');
      toggle.title = open ? '收起侧边栏' : '展开侧边栏';
      session.attribute(rail!, 'inert', !open ? '' : null);
      for (const panel of panels) session.attribute(panel, 'inert', narrow.matches && open ? '' : null);
    };
    const close = () => { setOpen(false); toggle.focus(); };
    session.listen(toggle, 'click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true'; setOpen(open);
      if (open && narrow.matches) rail!.querySelector<HTMLElement>('a[href], button, [role="button"]')?.focus();
    });
    session.listen(toggle, 'keydown', event => { if ((event as KeyboardEvent).key === 'Escape') close(); });
    session.listen(backdrop, 'click', close);
    session.listen(rail, 'keydown', event => {
      const key = (event as KeyboardEvent).key;
      if (key === 'Escape') close();
      if (key === 'Tab' && narrow.matches && toggle.getAttribute('aria-expanded') === 'true') {
        const items = [...rail!.querySelectorAll<HTMLElement>('a[href], button, input:not([type="hidden"]), select, [tabindex="0"]')].filter(e => !e.closest('[hidden], [inert]') && e.getClientRects().length);
        const first = items[0], last = items.at(-1);
        if ((event as KeyboardEvent).shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!(event as KeyboardEvent).shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    });
    session.listen(rail, 'click', event => {
      const link = (event.target as Element).closest('a[href]');
      const href = link?.getAttribute('href');
      if (narrow.matches && href && !/^(#|javascript:)/i.test(href)) setOpen(false);
    });
    session.listen(narrow, 'change', () => setOpen(!narrow.matches));
    setOpen(!narrow.matches);
  }
  // Blackboard reparents these two native regions at its mobile breakpoint.
  const paneTabs = document.querySelector<HTMLElement>('#paneTabs');
  const paneTabsParent = paneTabs?.parentElement;
  const keepRegions = () => {
    if (globalNav && user && globalNav.parentElement !== user) user.append(globalNav);
    if (paneTabs && paneTabsParent && paneTabs.parentElement !== paneTabsParent) paneTabsParent.append(paneTabs);
  };
  const regions = new MutationObserver(keepRegions);
  for (const region of [tabs, user, rail]) if (region) regions.observe(region, { childList: true, subtree: true });
  session.defer(() => regions.disconnect());
}
