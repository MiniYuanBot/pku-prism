import { detectPage } from './core/page';
import { mountPrism } from './core/prism';

function start(): (() => void) | undefined {
  if (window.top !== window) return;
  if (location.origin !== 'https://course.pku.edu.cn') return;
  const page = detectPage(document, location.pathname);
  if (page) return mountPrism(page);
}

const dispose = start();
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => dispose?.());
}
