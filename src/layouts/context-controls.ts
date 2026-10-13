import type { DomSession } from '../core/dom-session';
import { element, icon } from './components';

/** Keep native help and expanders; only change their presentation. */
export function redesignContextControls(session: DomSession, rail: HTMLElement): void {
  redesignHomeContext(session, rail);
  const toolbarRegion = rail.querySelector<HTMLElement>('#courseMenuPalette > .actionBarMicro');
  const toolbar = toolbarRegion?.querySelector('.nav');
  if (toolbarRegion && toolbar) {
    const footer = session.own(element('div', 'prism-context-footer'), rail);
    footer.setAttribute('role', 'group');
    footer.setAttribute('aria-label', '侧栏操作');
    session.move(toolbarRegion, footer);
    const home = rail.querySelector<HTMLAnchorElement>('#courseMenu_combo');
    const heading = home?.closest<HTMLElement>('h3');
    if (home && heading) {
      const cell = session.own(element('li', 'prism-context-home'), toolbar, toolbar.firstChild);
      session.move(home, cell);
      session.hidden(heading, true);
      session.attribute(home, 'aria-label', home.title || '转到课程首页');
      session.attribute(home, 'data-prism-icon-action', 'home');
      const glyph = icon('home'); home.append(glyph); session.defer(() => glyph.remove());
    }
    const identity = rail.querySelector<HTMLElement>(':scope > #breadcrumbs');
    const content = session.own(element('div', 'prism-context-body'), rail, identity ? identity.nextSibling : rail.firstChild);
    for (const node of [...rail.children]) {
      if (node !== identity && node !== content && node !== footer) session.move(node, content);
    }
  }
  const help = rail.querySelector<HTMLAnchorElement>('#helpTextToggleLink');
  const helpWrap = help?.closest<HTMLElement>('#helpTextToggle');
  if (toolbar && helpWrap && help) {
    const cell = session.own(element('li', 'prism-context-help'), toolbar, toolbar.firstChild);
    session.move(helpWrap, cell);
    session.attribute(help, 'aria-label', '切换页面帮助');
    session.attribute(help, 'data-prism-icon-action', 'help');
    const glyph = icon('help'); help.append(glyph); session.defer(() => glyph.remove());
  }
  for (const link of rail.querySelectorAll<HTMLAnchorElement>('.actionBarMicro .nav a')) {
    const name = link.title.includes('刷新') ? 'refresh' : link.title.includes('窗口') ? 'external' : null;
    if (!name) continue;
    session.attribute(link, 'aria-label', link.title);
    session.attribute(link, 'data-prism-icon-action', name);
    const glyph = icon(name); link.append(glyph); session.defer(() => glyph.remove());
  }
  redesignCourseManagement(session, rail, toolbar ?? null);
}

/** Move the intact native action region; keep its forms, handlers and live status. */
function redesignCourseManagement(session: DomSession, rail: HTMLElement, toolbar: Element | null): void {
  const panel = rail.querySelector<HTMLElement>('#controlPanelPalette');
  const label = panel?.querySelector<HTMLElement>('#controlPanelPalette_link');
  const divider = panel?.previousElementSibling;
  if (label && divider instanceof HTMLElement && divider.matches('h2.navDivider')) {
    const name = divider.textContent?.trim() || '课程管理';
    for (const node of label.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes('控制面板')) {
        session.text(node as Text, node.textContent.replace('控制面板', name));
      }
    }
    session.hidden(divider, true);
  }
  const controls = rail.querySelector<HTMLElement>('#breadcrumb_controls_id.breadcrumb-controls');
  if (!toolbar || !controls) return;
  const cell = session.own(element('li', 'prism-context-course-actions'), toolbar);
  session.move(controls, cell);
  session.attribute(controls, 'data-prism-course-actions', '');
  for (const [selector, name] of [['#startStudentPreviewLink', 'preview'], ['#editModeToggleLink', 'edit']] as const) {
    const link = controls.querySelector<HTMLElement>(selector);
    if (!link) continue;
    session.attribute(link, 'data-prism-icon-action', name);
    const glyph = icon(name); link.append(glyph); session.defer(() => glyph.remove());
    if (name === 'edit') {
      session.attribute(link, 'aria-label', '编辑模式');
      const status = link.querySelector<HTMLElement>('#statusText');
      if (status) session.attribute(link, 'aria-describedby', [link.getAttribute('aria-describedby'), status.id].filter(Boolean).join(' '));
    }
  }
  const availability = controls.querySelector<HTMLElement>('.course-availability-button');
  if (availability) {
    session.attribute(availability, 'data-prism-icon-action', 'availability');
    for (const state of ['lock', 'unlock'] as const) {
      const glyph = icon(state); glyph.setAttribute('data-prism-lock', state);
      availability.append(glyph); session.defer(() => glyph.remove());
    }
  }
}

/** Expose the native overflow links as ordinary sidebar navigation, without cloning handlers. */
function redesignHomeContext(session: DomSession, rail: HTMLElement): void {
  if (!rail.matches('.prism-workspace-nav')) return;
  const tools = rail.querySelector<HTMLElement>(':scope > .portlet');
  const tabs = rail.querySelector<HTMLElement>(':scope > #paneTabs');
  if (!tools || !tabs) return;
  for (const link of tools.querySelectorAll('a')) for (const node of link.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === 'Application Authorization') {
      session.text(node as Text, node.textContent.replace('Application Authorization', '应用授权'));
    }
  }
  const menu = session.own(element('div', 'prism-home-menu menuWrap-inner'), rail, tools);
  session.move(tools, menu);
  session.move(tabs, menu);
  session.attribute(tools, 'data-prism-context-section', '');
  session.attribute(tabs, 'data-prism-context-section', '');
  session.attribute(tabs, 'aria-label', '我的机构');
  for (const link of tabs.querySelectorAll<HTMLAnchorElement>('li.active > a')) session.attribute(link, 'aria-current', 'page');
  const overflow = tabs.querySelector<HTMLElement>('#overflowLiId');
  const list = overflow?.querySelector<HTMLElement>('#overflowULId');
  if (!overflow || !list) return;
  // Native SecondaryTabs reparents overflow children on resize. Keep its containers
  // intact; only expose the list inline and hide the disclosure control itself.
  const trigger = overflow.querySelector<HTMLElement>('#overflowIconId');
  if (trigger) session.hidden(trigger, true);
  // Disable only the obsolete flyout's keyboard/focus behavior. Its native anchor
  // click handlers (including anchors whose href was moved into ohref) stay intact.
  const flyout = (trigger as HTMLElement & { flyoutMenu?: { enabled: boolean } } | null)?.flyoutMenu;
  if (flyout) {
    const enabled = flyout.enabled;
    flyout.enabled = false;
    session.defer(() => { if (!flyout.enabled) flyout.enabled = enabled; });
  }
  const keyboardLinks = new WeakSet<HTMLAnchorElement>();
  const normalize = () => {
    if (list.getAttribute('aria-hidden') !== 'false') session.attribute(list, 'aria-hidden', 'false');
    session.attribute(list, 'aria-labelledby', null);
    session.attribute(list, 'role', null);
    for (const item of tabs.querySelectorAll('li[role="presentation"]')) session.attribute(item, 'role', null);
    for (const link of tabs.querySelectorAll<HTMLAnchorElement>('a:not(#overflowIconId)')) {
      session.attribute(link, 'role', 'link');
      session.attribute(link, 'tabindex', '0');
      if (link.hasAttribute('href') || keyboardLinks.has(link)) continue;
      keyboardLinks.add(link);
      session.listen(link, 'keydown', event => {
        if (!['Enter', ' '].includes((event as KeyboardEvent).key) || event.defaultPrevented) return;
        event.preventDefault(); link.click();
      });
    }
  };
  normalize();
  // SecondaryTabs moves items on resize; FlyoutMenu.close still writes aria-hidden
  // on mouseout even when disabled. Reconcile only this small native navigation.
  const observer = new MutationObserver(normalize);
  observer.observe(tabs, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-hidden'] });
  session.defer(() => observer.disconnect());
}
