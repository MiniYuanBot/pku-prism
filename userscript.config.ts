import { version } from './package.json';

export function userscriptHeader(development = false): string {
  return [
    '// ==UserScript==',
    `// @name         PKU Prism${development ? ' (Dev)' : ''}`,
    '// @namespace    pku-prism',
    `// @version      ${version}`,
    '// @description  北京大学教学网课程工作台与阅读界面重设计，可随时恢复原站。',
    '// @match        https://course.pku.edu.cn/webapps/*',
    '// @exclude      https://course.pku.edu.cn/webapps/login/*',
    '// @run-at       document-end',
    '// @grant        none',
    '// @noframes',
    ...(development ? ['// @updateURL    none', '// @downloadURL  none'] : []),
    '// ==/UserScript==',
  ].join('\n');
}
