export type Theme = 'system' | 'light' | 'dark';
const enabledKey = 'pku-prism:enabled';
const themeKey = 'pku-prism:theme';
function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* In-memory controls still work. */ }
}
export function parseTheme(value: string | null): Theme {
  return value === 'light' || value === 'dark' ? value : 'system';
}
export function resolveTheme(theme: Theme, systemDark: boolean): 'light' | 'dark' {
  return theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
}
export const readEnabled = (): boolean => read(enabledKey) !== 'false';
export const writeEnabled = (enabled: boolean): void => write(enabledKey, String(enabled));
export const readTheme = (): Theme => parseTheme(read(themeKey));
export const writeTheme = (theme: Theme): void => write(themeKey, theme);
export function watchSettings(onChange: (enabled: boolean, theme: Theme) => void): () => void {
  let storage: Storage;
  try { storage = localStorage; } catch { return () => {}; }
  const listener = (event: StorageEvent) => {
    if (event.storageArea === storage && (event.key === enabledKey || event.key === themeKey || event.key === null)) {
      onChange(readEnabled(), readTheme());
    }
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
