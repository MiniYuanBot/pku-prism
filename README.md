# PKU Prism

重设计北京大学教学网课程工作界面的独立 Tampermonkey UserScript，使用 TypeScript、CSS 和 Vite。采用中性色与北大红的紧凑 Dashboard 风格，支持浅色、深色和跟随系统。视觉依据见 [docs/DESIGN.md](docs/DESIGN.md)，信息架构与安全边界见 [docs/REDESIGN.md](docs/REDESIGN.md)。

## 开发

需要 Node.js 20.19+ 或 22.12+，推荐 Node.js 22 LTS。

```sh
npm ci
npm run dev
```

打开 `http://localhost:5173`，安装页面提供的开发脚本，再访问教学网。开发脚本从本机 Vite 加载模块，支持热更新；不要同时启用开发脚本和正式脚本。开发脚本只应在开发期间启用。

```sh
npm run check       # 页面识别测试、TypeScript 检查、构建和产物校验
npm run build:watch # 持续构建，供 MCP 注入调试
npm run preview     # 在 4173 端口提供 dist 安装文件
```

运行 `npm run build` 后，将 [dist/pku-prism.user.js](dist/pku-prism.user.js) 的内容导入 Tampermonkey 新建脚本，或通过本地预览服务器打开 `http://localhost:4173/pku-prism.user.js` 安装。

正式脚本为单文件 IIFE，包含 CSS，不依赖运行时 CDN、框架或开发服务器。UserScript 元数据由本项目的轻量 Vite 插件生成。

## 当前行为

- 只匹配 `https://course.pku.edu.cn/webapps/*`，排除登录页与 iframe。
- 同时核验路由和真实 DOM 标记，在首页、公告、教学内容及同结构的课程作业列表运行；作业提交页保持原样。
- 首页将原生全局导航和工具移入工作区侧栏；主区提供当前 / 历史课程切换、本地搜索、角色分组与课程卡片，公告与事务在辅助区。
- 公告采用目录 + 完整阅读区，支持选择、搜索与全部展开；课程内容采用资源列表，作业标题和附件常显，说明按需展开。
- 课程名称优先显示，完整保留学期和编号；手机显示当前课程名称，导航与公告目录可折叠。
- 桌面右下角、手机页面标题区可启停与选择颜色模式；仅使用 `pku-prism:enabled` 与 `pku-prism:theme` 两个自有偏好键，支持跨标签同步。
- 停用回滚 DOM 位置、属性与原始 Text 节点，并移除样式与自定义组件；保留控制供重新启用。重复注入先清理旧实例。
- 保留原生链接与表单节点、事件、提交逻辑和课程数据，不读取认证信息，不发送网络请求。

也可以在 Tampermonkey 中彻底关闭脚本，再刷新页面。未知页面保持原状；后续逐页观察、适配和验证。

## 目录

```text
src/main.ts              启动、站点限制和 HMR 清理
src/core/page.ts         路由与 DOM 识别
src/core/prism.ts        样式与开关生命周期
src/core/settings.ts     独立偏好键与标签页同步
src/core/course-labels.ts 可逆的课程文本分层
src/core/dom-session.ts  节点移动、属性与事件的可逆事务
src/layouts/             工作台、公告阅读器与资源列表组件
src/ui/                  Shadow DOM 启停和主题控制
src/styles/              共享 Token、外壳和页面样式
scripts/                 产物校验和真实浏览器冒烟检查
tests/                   路由、偏好、文本与 DOM 回滚边界测试
docs/                    设计规范、页面研究与验证记录
```

## 浏览器验证

通过 Chrome DevTools MCP 观察实际页面并临时执行构建产物。可将 `scripts/browser-smoke.js` 中的 `smokePrism` 函数放入 `evaluate_script`，以构建产物的字符串为参数调用。MCP 的 `args` 用于元素 UID，传代码时应把字符串作为 JavaScript 字面量嵌入函数，不要放入 `args`。

冒烟检查覆盖课程视图、搜索 / 无结果 / 清空、公告选择与全部阅读、作业说明展开、搜索不提交原生表单、主题与偏好同步、原始链接和表单归属、祖先事件，以及停用后的完整原生 DOM / Text 节点恢复。测试结束清理实例并恢复 Prism 自有偏好键，不读取任何表单值。

截图只用于本地视觉检查；不把真实课程内容、姓名、成绩或整页 HTML 纳入仓库。`.local/` 可存放个人调试文件且已忽略。

当前环境验证：`npm run check` 已通过，真实浏览器注入与开关验证见 [docs/verification.md](docs/verification.md)。本次终端网络和监听端口受沙箱限制，依赖使用本机已有安装离线准备；`npm ci` 的联网安装与 Vite HMR 的端到端流程尚未验证。MCP 临时注入不等于已安装 Tampermonkey 脚本。

## 实现参考

研究了 [PKU-Art](https://github.com/zhuozhiyongde/PKU-Art) 的按页 CSS 加载和主题管理思路。本项目代码独立编写，未复制其源码或资源。详见 [页面与实现研究](docs/research.md)。
