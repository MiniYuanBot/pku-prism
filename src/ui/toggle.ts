import tokens from '../styles/tokens.css?inline';
import css from './toggle.css?inline';
import type { Theme } from '../core/settings';
export const controlId = 'pku-prism-control';
export const destroyEvent = 'pku-prism:destroy';
export function createToggle(onToggle: () => void, onTheme: (theme: Theme) => void) {
  const host = document.createElement('div');
  host.id = controlId;
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = tokens + css;
  const group = document.createElement('div');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'PKU Prism 外观设置');
  const button = document.createElement('button');
  button.type = 'button';
  button.addEventListener('click', onToggle);
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Prism 颜色模式');
  for (const [value, label] of [['system', '跟随系统'], ['light', '浅色'], ['dark', '深色']]) {
    const option = document.createElement('option');
    option.value = value!;
    option.textContent = label!;
    select.append(option);
  }
  const change = () => onTheme(select.value as Theme);
  select.addEventListener('change', change);
  group.append(button, select);
  shadow.append(style, group);
  return {
    host,
    update(enabled: boolean, theme: Theme, resolved: 'light' | 'dark') {
      host.dataset.theme = resolved;
      button.textContent = `Prism ${enabled ? '已启用' : '已停用'}`;
      button.setAttribute('aria-label', '启用 PKU Prism 美化');
      button.setAttribute('aria-pressed', String(enabled));
      button.title = enabled ? '停用美化，恢复原始界面' : '启用美化';
      select.value = theme;
    },
    destroy() {
      button.removeEventListener('click', onToggle);
      select.removeEventListener('change', change);
      host.remove();
    },
  };
}
