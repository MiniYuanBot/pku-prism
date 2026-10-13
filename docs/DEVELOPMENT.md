# 技术与开发说明

PKU Prism 使用 TypeScript、CSS 和 Vite。安装与日常使用见 [README](../README.md)，项目工作约定见 [AGENTS.md](../AGENTS.md)。

## 适配范围与限制

首页、课程公告、教学内容及同结构的作业列表使用较深的布局适配，包括课程卡片、局部过滤、公告目录与完整阅读区、资源列表和说明展开。其他原生页面主要使用共享导航与基础样式；作业提交页、提交历史和总览保留原站业务控件。

任务、邮箱、通讯录、个人信息、目标、社区、资源库、日历、通知和成绩等页面有对应原生容器适配。普通页面的基线样式不能代替新结构的专项适配，现有验证没有穷尽所有教学网路由、课程定制和后台业务流程。

脚本只匹配 `https://course.pku.edu.cn/webapps/*`，排除认证路由，并要求页面具有原生 Blackboard 标记。独立脚本不在 iframe 启动；父页面只为同源、带原生标记的内容 frame 注入主题 CSS。没有对应标记的页面和跨域 LTI 应用内部保持原样。

## 与 Course Fetch 的主题同步

Course Fetch 0.6.0 读取当前页面根元素的公开状态：`data-pku-prism="enabled"` 和 `data-pku-prism-theme="light|dark"`。Prism 启用时，其面板跟随实际浅深色；没有启用 Prism 时，恢复 Course Fetch 自己保存的偏好。同源框架可以向父页面读取这两个属性，跨域框架使用独立偏好。

两个脚本分别管理自己的偏好，不读取对方的私有存储或认证信息。Course Fetch 的实现与使用说明见[对应项目](https://github.com/MiniYuanBot/course-fetch)。

## 本地开发

需要 Node.js 20（≥20.19）或 ≥22.12。

```sh
npm ci
npm run dev
```

打开 `http://localhost:5173`，安装页面提供的开发脚本，再访问教学网。开发脚本从本机 Vite 加载模块，支持热更新，只应在开发期间启用。不要同时启用开发脚本和正式脚本。

```sh
npm run check       # 页面识别测试、TypeScript 检查、构建和产物校验
npm run build:watch # 持续构建，供 MCP 注入调试
npm run preview     # 在 4173 端口提供 dist 安装文件
```

运行 `npm run build` 后，将本机 `dist/pku-prism.user.js` 的内容导入 Tampermonkey，或启动预览服务器，通过 `http://localhost:4173/pku-prism.user.js` 安装。

正式脚本为单文件 IIFE，包含 CSS，不依赖运行时 CDN、框架或开发服务器。UserScript 元数据由本项目的轻量 Vite 插件生成。若浏览器的 CSP 或本地网络策略阻止开发模块加载，可以使用构建产物进行 MCP 临时注入。

## 发布 Release

README 使用固定的安装地址：

```text
https://github.com/MiniYuanBot/pku-prism/releases/latest/download/pku-prism.user.js
```

发布时需把构建产物作为 Release 附件上传，文件名保持 `pku-prism.user.js`。GitHub 自动生成的源码压缩包不能代替用户脚本附件。

1. 发布新版本前，修改 `package.json` 的 `version`，同步 `package-lock.json` 中的根项目版本。UserScript 的 `@version` 由构建读取 `package.json` 生成；首次发布可以使用当前版本。
2. 运行 `npm ci` 与 `npm run check`。后者会测试、检查 TypeScript、构建并校验单文件产物。
3. 将对应代码提交并推送，创建与版本一致的标签，例如版本 `0.4.3` 对应 `v0.4.3`。
4. 在 GitHub 创建 Release，选择标签，填写更新内容，上传本机 `dist/pku-prism.user.js`，确认附件名后发布。
5. 发布后检查 README 的安装链接能否取得脚本，并通过 Tampermonkey 安装或更新，再刷新教学网验证。

`dist/` 仍由 `.gitignore` 排除，Release 附件从本机构建目录上传，不需要把产物加入源码仓库。已经发布的旧附件不会随着本地构建更新；每次发布都需上传对应版本的新产物。

正式脚本的 `@updateURL` 与 `@downloadURL` 均指向上述最新版附件地址。Tampermonkey 可从该地址检查版本并下载更新；自动检查是否启用及其时间间隔由扩展设置决定。开发脚本将两个地址设为 `none`，避免开发版本参与正式更新。

## 安装与更新标识

正式脚本保留已发布版本的 `@name PKU Prism` 与 `@namespace pku-prism`，不为了与 Course Fetch 的元数据格式一致而改动已有标识。主页与问题反馈分别通过 `@homepageURL` 和 `@supportURL` 指向本项目及其 Issues；作者为 `miniyuan`，许可证声明与项目的 MIT LICENSE 一致。

版本号由 `package.json` 生成，发布修复时应提高版本号。同版本重复安装可能显示 Reinstall；安装链接本身不会把相同版本变成升级。更新会替换旧版脚本代码，编辑器中的手工改动不会自动合并。

0.4.2 的已发布附件没有显式更新地址。如果旧安装无法取得新版，应先手动安装一次 0.4.3 或更高版本，使元数据包含固定的 Release 更新地址，再使用扩展的更新检查。

元数据测试与构建校验会检查正式版标识、包版本、主页、反馈地址、两个更新地址、许可证及原有站点限制；开发版使用独立名称 `PKU Prism (Dev)` 并禁用更新。不新增脚本权限或扩大站点匹配范围。

字段定义见 [Tampermonkey 官方元数据说明](https://www.tampermonkey.net/documentation.php#meta:namespace)、[更新地址说明](https://www.tampermonkey.net/documentation.php#meta:updateURL)。

## 源码结构

```text
src/main.ts              启动、站点限制和 HMR 清理
src/core/page.ts         路由与 DOM 识别
src/core/prism.ts        样式与开关生命周期
src/core/settings.ts     独立偏好键与标签页同步
src/core/course-labels.ts 可逆的课程文本分层
src/core/dom-session.ts  节点移动、属性与事件的可逆事务
src/core/frames.ts       同源原生内容 frame 的主题与清理
src/layouts/             共享框架、工作台、公告阅读器与资源列表组件
src/ui/                  Shadow DOM 启停和主题控制
src/styles/              共享 Token、外壳和页面样式
scripts/                 产物校验和真实浏览器冒烟检查
tests/                   路由、偏好、文本与 DOM 回滚边界测试
docs/                    设计规范、页面研究与验证记录
```

## 运行范围与清理

- 样式限定在启用标记与对应页面标记下。移动节点时保留原节点、原链接、事件和表单归属，不重建业务控件。
- 偏好只使用 `pku-prism:enabled` 和 `pku-prism:theme` 两个自有键，支持跨标签同步。脚本不读取认证信息，不主动发送网络请求。
- 停用时回滚 DOM 位置、属性和原始 Text 节点，移除样式与自定义组件；保留控制供重新启用。重复注入先清理旧实例。

## 浏览器验证

修改运行时后，先运行 `npm run check`，再通过 Chrome DevTools MCP 观察实际页面，临时执行构建产物并截图检查。未观察过的页面结构先记录在 [research.md](research.md)，再适配。

可将 `scripts/browser-smoke.js` 中的 `smokePrism` 函数放入 `evaluate_script`，以构建产物的字符串为参数调用。MCP 的 `args` 用于元素 UID；传代码时应把字符串作为 JavaScript 字面量嵌入函数，不要放入 `args`。

冒烟检查覆盖课程视图、搜索 / 无结果 / 清空、公告选择与全部阅读、作业说明展开、搜索不提交原生表单、主题与偏好同步、原始链接和表单归属、祖先事件，以及停用后的完整原生 DOM / Text 节点恢复。测试结束后清理实例并恢复 Prism 自有偏好键，不读取任何表单值。

验证只进行阅读和可逆的界面操作，不提交作业、修改成绩或发送邮件。MCP 临时注入不等于 Tampermonkey 持久安装；网络、端口、扩展权限或安装流程未验证时，应在记录中说明。历史会话中 `npm ci` 联网安装与 Vite HMR 端到端流程曾受到环境限制，详见 [verification.md](verification.md)。

当前主要通过 Chrome DevTools MCP 检查实际页面并临时注入构建产物，其他浏览器尚未完成同等范围的回归。检查原生节点、链接、事件与表单归属，不代表已实际验证作业提交、成绩修改或邮件发送等后台业务。

## 文件管理

- `src/`、`scripts/`、`tests/`、配置文件、锁文件和项目文档随源码提交。
- `node_modules/`、`dist/`、缓存、覆盖率、日志与本机环境文件由 `.gitignore` 排除。保留 `package-lock.json`，便于 `npm ci` 使用一致的依赖版本。
- 原始截图、个人调试资料和临时脚本放在 `.local/`，不保存认证信息、隐藏字段或整页 HTML。
- `docs/images/` 只存放经过检查的脱敏界面截图。拍摄前在浏览器中临时替换个人内容，截图后恢复页面，说明哪些内容是示例。
- 本机安装的 `.agents/skills/`、`.claude/` 和 `.codex/` 不随项目分发。项目约定 `AGENTS.md`、`PRODUCT.md` 与共享设计记录 `.impeccable/design.json` 保留。

## 设计与实现参考

界面参考 Linear、shadcn/ui 和 Notion，使用中性色与北大红 `#9E2533`。研究了 [PKU-Art](https://github.com/zhuozhiyongde/PKU-Art) 的按页 CSS 加载和主题管理思路，代码独立编写，未复制其源码或资源。

- [设计规范](DESIGN.md)：字体、颜色、间距与组件规则。
- [布局设计](REDESIGN.md)：页面分区、导航与重组方式。
- [页面研究](research.md)：已观察的真实 DOM 和适配依据。
- [截图说明](images/README.md)：README 配图的示例内容与脱敏方式。
