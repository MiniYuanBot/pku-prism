export type PageKind = 'portal' | 'portal-tools' | 'announcements' | 'content' | 'calendar' | 'mybb' | 'overview' | 'assignment-submit' | 'assignment-review' | 'classin' | 'editor' | 'stream' | 'collection' | 'tools' | 'shell';

// Deep transformations require their own DOM guard; native Blackboard pages share a baseline.
export function detectPage(document: Document, pathname: string): PageKind | null {
  if (!pathname.startsWith('/webapps/') || /^\/webapps\/(login|auth|sso)(\/|$)/i.test(pathname)) return null;
  if (pathname === '/webapps/portal/execute/tabs/tabAction' && document.querySelector('.containerPortal #column1')) {
    return document.querySelector('.courseListing') ? 'portal' : 'portal-tools';
  }
  if (pathname === '/webapps/blackboard/execute/announcement' && document.querySelector('#announcementList')) {
    return 'announcements';
  }
  if (pathname === '/webapps/blackboard/content/listContent.jsp' && document.querySelector('#content_listContainer')) {
    return 'content';
  }
  if (pathname === '/webapps/assignment/uploadAssignment' && document.querySelector('body#tinymce.mce-content-body[contenteditable="true"]')) return 'editor';
  if (!document.querySelector('body#learn-oe-body')) return null;
  if (pathname === '/webapps/bb-ClassIn-BBLEARN/userPhone/isBindPhone.do' && document.querySelector('#panelbutton1 #searchForm #enInputContent')) return 'classin';
  if (pathname === '/webapps/assignment/uploadAssignment') {
    if (document.querySelector('#uploadAssignmentFormId')) return 'assignment-submit';
    if (document.querySelector('#inlineGrader')) return 'assignment-review';
  }
  if (document.querySelector('#mybb_column_wrapper')) return 'overview';
  if (document.querySelector('#calendar')) return 'calendar';
  if (document.querySelector('.mybb-div')) return 'mybb';
  if (document.querySelector('.stream_pages')) return 'stream';
  if (document.querySelector('body.content-system-page')) return 'collection';
  if (document.querySelector('#containerdiv')) return 'tools';
  return 'shell';
}
