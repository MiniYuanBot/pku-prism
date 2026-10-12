export function splitCourseLabel(text: string): { code: string; name: string; term: string } | null {
  const match = text.match(/^([^:：]+[:：]\s*)(.+?)(\([^()]*学期\))?$/u);
  return match && match[2]!.trim() ? { code: match[1]!, name: match[2]!, term: match[3] ?? '' } : null;
}
// Keep the original link and Text node: no navigation or event handling changes.
export function enhanceCourseLabels(): () => void {
  const restored: Array<() => void> = [];
  for (const link of document.querySelectorAll<HTMLAnchorElement>('.courseListing a')) {
    const original = link.firstChild;
    if (link.childNodes.length !== 1 || original?.nodeType !== Node.TEXT_NODE) continue;
    const parts = splitCourseLabel(original.textContent ?? '');
    if (!parts) continue;
    const spans = Object.entries(parts).map(([role, text]) => {
      const span = document.createElement('span');
      span.className = `prism-course-${role}`;
      span.textContent = text;
      return span;
    });
    link.replaceChildren(...spans);
    restored.push(() => {
      // A native asynchronous update owns its new content; do not overwrite it.
      if (spans.every((span) => span.parentNode === link) && link.childNodes.length === spans.length) {
        link.replaceChildren(original);
      }
    });
  }
  return () => restored.forEach((restore) => restore());
}
