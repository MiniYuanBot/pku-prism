import css from '../styles/index.css?inline';
import { createToggle, controlId, destroyEvent } from '../ui/toggle';
import { enhanceCourseLabels } from './course-labels';
import { redesignPage } from '../layouts';
import type { PageKind } from './page';
import { themeFrames } from './frames';
import { readEnabled, readTheme, resolveTheme, watchSettings, writeEnabled, writeTheme } from './settings';
export function mountPrism(page: PageKind): () => void {
  document.getElementById(controlId)?.dispatchEvent(new Event(destroyEvent));
  let enabled = readEnabled();
  let theme = readTheme();
  let restoreLabels: (() => void) | undefined;
  let restoreLayout: (() => void) | undefined;
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const root = document.documentElement;
  const style = document.createElement('style');
  style.id = 'pku-prism-styles';
  style.textContent = css;
  const toggle = createToggle(() => {
    enabled = !enabled;
    writeEnabled(enabled);
    render();
  }, (value) => {
    theme = value;
    writeTheme(theme);
    render();
  });
  const frames = themeFrames(css, () => ({ enabled, theme: resolveTheme(theme, systemTheme.matches) }));
  function clearPage() {
    restoreLayout?.();
    restoreLayout = undefined;
    restoreLabels?.();
    restoreLabels = undefined;
    style.remove();
    delete root.dataset.pkuPrism;
    delete root.dataset.pkuPrismPage;
    delete root.dataset.pkuPrismTheme;
  }
  function render() {
    const resolved = resolveTheme(theme, systemTheme.matches);
    if (enabled) {
      root.dataset.pkuPrism = 'enabled';
      root.dataset.pkuPrismPage = page;
      root.dataset.pkuPrismTheme = resolved;
      if (!style.isConnected) (document.head ?? root).append(style);
      if (page === 'portal' && !restoreLabels) restoreLabels = enhanceCourseLabels();
      if (!restoreLayout) restoreLayout = redesignPage(page, toggle.host);
    } else clearPage();
    toggle.update(enabled, theme, resolved);
    frames.refresh();
  }
  const stopWatching = watchSettings((value, preference) => {
    enabled = value;
    theme = preference;
    render();
  });
  systemTheme.addEventListener('change', render);
  function destroy() {
    stopWatching();
    systemTheme.removeEventListener('change', render);
    toggle.host.removeEventListener(destroyEvent, destroy);
    clearPage();
    frames.destroy();
    toggle.destroy();
  }
  toggle.host.addEventListener(destroyEvent, destroy);
  document.body.append(toggle.host);
  render();
  return destroy;
}
