import { DomSession } from '../core/dom-session';
import type { PageKind } from '../core/page';
import { redesignAnnouncements } from './announcements';
import { redesignContent } from './content';
import { redesignPortal } from './portal';
import { redesignShell } from './shell';

export function redesignPage(page: PageKind, control: HTMLElement): () => void {
  const session = new DomSession();
  try {
    if (page === 'portal') redesignPortal(session);
    if (page === 'announcements') redesignAnnouncements(session);
    if (page === 'content') redesignContent(session);
    redesignShell(session, control);
    const title = document.querySelector('#pageTitleText')?.textContent?.trim();
    for (const link of document.querySelectorAll<HTMLAnchorElement>('#courseMenuPalette_contents > li > a')) {
      if (link.textContent?.trim() === title || (page === 'announcements' && link.textContent?.trim() === '课程通知')) {
        session.attribute(link, 'data-prism-current', 'true');
      }
    }
  } catch {
    // An unfamiliar Blackboard variant keeps the baseline theme, never a partial rearrangement.
    session.restore();
    console.warn('[PKU Prism] 页面结构已变化，已恢复原生布局。');
  }
  return () => session.restore();
}
