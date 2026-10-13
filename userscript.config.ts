import { version } from './package.json';

const repository = 'https://github.com/MiniYuanBot/pku-prism';
const releaseScript = `${repository}/releases/latest/download/pku-prism.user.js`;

export function userscriptHeader(development = false): string {
  return [
    '// ==UserScript==',
    `// @name         PKU Prism${development ? ' (Dev)' : ''}`,
    // Keep the released identity so an upgrade targets the existing Prism script.
    '// @namespace    pku-prism',
    `// @version      ${version}`,
    '// @description  北京大学教学网课程工作台与阅读界面重设计，可随时恢复原站。',
    `// @homepageURL  ${repository}`,
    `// @supportURL   ${repository}/issues`,
    `// @updateURL    ${development ? 'none' : releaseScript}`,
    `// @downloadURL  ${development ? 'none' : releaseScript}`,
    '// @match        https://course.pku.edu.cn/webapps/*',
    '// @exclude      https://course.pku.edu.cn/webapps/login/*',
    '// @run-at       document-end',
    '// @grant        none',
    '// @noframes',
    '// @license      MIT',
    '// @author       miniyuan',
    '// ==/UserScript==',
  ].join('\n');
}
