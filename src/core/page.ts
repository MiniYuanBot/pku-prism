export type PageKind = 'portal' | 'announcements' | 'content';

// Match both a known route and observed DOM. Uninspected pages receive no styles.
export function detectPage(document: Document, pathname: string): PageKind | null {
  if (pathname === '/webapps/portal/execute/tabs/tabAction' && document.querySelector('.containerPortal #column1')) {
    return 'portal';
  }
  if (pathname === '/webapps/blackboard/execute/announcement' && document.querySelector('#announcementList')) {
    return 'announcements';
  }
  if (pathname === '/webapps/blackboard/content/listContent.jsp' && document.querySelector('#content_listContainer')) {
    return 'content';
  }
  return null;
}
