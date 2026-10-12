# 页面与实现研究

勘察日期：2026-10-12。通过 Chrome DevTools MCP 直接检查已登录的 Blackboard Learn。此文件只记录结构信息；不保存账户信息、课程标识、认证凭证或表单值。

## PKU-Art

研究入口：[仓库](https://github.com/zhuozhiyongde/PKU-Art)、[构建配置](https://github.com/zhuozhiyongde/PKU-Art/blob/main/vite.config.js)、[入口](https://github.com/zhuozhiyongde/PKU-Art/blob/main/src/main.js)、[样式路由](https://github.com/zhuozhiyongde/PKU-Art/blob/main/src/style.js)、[主题管理](https://github.com/zhuozhiyongde/PKU-Art/blob/main/src/theme.js)。

- Vite + `vite-plugin-monkey` 构建 UserScript，CSS 通过 `?inline` 导入并以 `<style>` 注入。
- `style.js` 按 URL 正则匹配通用样式和页面样式，区分首页、公告、课程内容及其他工具页。
- `theme.js` 用根节点 class 驱动日夜模式，并管理偏好持久化、系统主题变化及 iframe 同步。
- `main.js` 还启用了侧栏、课程编号和下载等功能模块，范围比当前 Prism 更广。
- 仓库采用 GPL-3.0；Prism 本阶段仅参考实现思路，独立编写代码与样式。

Prism 采用 CSS 字符串注入和按页面拆分的思路。现阶段仅有 Vite、TypeScript 和 Node 类型三项开发依赖，自有小型 Vite 适配器负责元数据与开发入口。正式脚本不请求 CDN。入口在 `document-end` 运行，以便直接核验 DOM；未引入全页 MutationObserver。

## 实际页面

先观察了 960 × 839 与 1440 × 839 的原生布局；设计实现后覆盖 375、768、1024、1440px。已查看首页、课程公告、教学内容和课程作业列表，并截图核验。

| 区域 | 已确认的选择器 | 结构与注意点 |
| --- | --- | --- |
| 页面外壳 | `body#learn-oe-body` | 保留网站原有 body class 与事件 |
| 全局导航 | `.global-nav-bar-wrap`、`#globalNavPageNavArea`、`#topTabs` | 账户、导航和退出入口，不移除 |
| 主内容 | `#globalNavPageContentArea`、`#content` | 原生布局容器 |
| 首页分栏 | `.containerPortal`、`#column0`、`#column1`、`#column2` | 浮动布局；960px 下为 100%，1440px 下为约 20% / 40% / 40% |
| 首页模块 | `.portlet`、`.portlet h2` | 当前共 6 个模块，包含工具、课程和信息区 |
| 课程列表 | `.courseListing` | 同时存在教师与学生身份列表；不能只按第一份列表处理 |
| 课程侧栏 | `#navigationPane`、`#courseMenuPalette`、`#courseMenuPalette_contents` | 保留导航项目、折叠状态与菜单功能 |
| 侧栏开关 | `#menuPuller.clickpuller` | 原生“显示课程菜单”入口；不能隐藏 |
| 折叠标记 | `body.bodynavcollapsed`、`.navigationPane.navcollapsed`、`.contentPane.contcollapsed` | 原生脚本会修改这些状态 |
| 面包屑与标题 | `#breadcrumbs`、`#pageTitleDiv` | 课程页面共有区域 |
| 课程内容壳 | `#contentPanel`、`#containerdiv` | 保留宽度及侧栏联动关系 |
| 公告列表 | `#announcementList.announcementList` | 页内存在原生表单；样式不得改变其提交行为 |
| 教学内容列表 | `#content_listContainer.contentList` | 条目是 `li.liItem`，包含图标、标题、详情 |
| 内容条目 | `.item_icon`、`.item > h3`、`.details`、`.moduleSample` | 动态 ID 与内容无关，优先用稳定容器选择器 |
| 作业列表 | `#content_listContainer`、`.contextItemDetailsHeaders`、`.vtbegenerated` | 与教学内容同路由和条目结构；标题链接到原生提交页，附件与说明保留 |
| 公告筛选 | `#annFilter1Id`、`#annFilter2Id` | 机构 / 课程页签；手机端原生 content-box 宽度加上 padding 会溢出，改为 border-box |
| 手机全局菜单 | `.hamburger`、`.hamburger-inner`、`.main-nav-open` | 保留原生开关；当前页签留出 56px，避免与按钮叠放 |
| 手机面包屑 | `#breadcrumbs .path`、`.placeholder`、`#breadcrumb_controls_id` | 原生 JS 设置宽度；统一盒模型，保持控件可用 |

原站 CSSOM 确认了 `737px–1037px` 与 `≤736px` 两组媒体查询，均包含首页分栏 `width: 100%` 规则。不能把当前单列界面误认为所有屏幕下的布局。

已观察页面中存在名为 `lti_storage_frame` 的跨域 Blackboard 存储 iframe。它不是内容展示区，Prism 不读取或操作。成绩、作业提交、录播与其他 iframe 内容尚未适配。没有打开作业提交表单或触发附件下载。

原站课程导航通过内嵌 `courseMenuCustomCSS` 对多层后代直接设置背景与白色文字；内容标题包含黑 / 蓝色内联 span。Prism 只对已确认的导航、标题及列表容器使用局部 `!important`，保留正文中原有强调格式。原站通用 Open Sans 规则需在已适配文本区域显式覆盖为系统 UI 字体。

原生侧栏在视口变化时会自动折叠并播放动画；截图与几何检查需等待约 800ms。Prism 不更改这些 class。窄屏展开侧栏时覆盖阅读区，避免挤窄正文；原生开关继续负责状态。列表原有颜色过渡会让主题切换时暂时失去对比度，因此仅关闭这些已适配容器的颜色过渡，保留菜单动作。

## 后续实现约束

所有页面规则以 `html[data-pku-prism='enabled']` 开头，并按 `data-pku-prism-page` 限定。避免全局覆盖 `a`、`button`、`input`、`table`，避免通过移除或隐藏未知控件来获得视觉效果。

优先用 CSS 调整布局、颜色、字重、间距、边框与状态。JavaScript 承担页面识别、样式生命周期、主题与开关，以及 CSS 无法完成的课程文本分层：仅处理单 Text 节点且格式匹配的原生链接；保留完整文字、原链接、事件和原 Text 节点，停用时恢复。未知格式保持原样，不重建课程列表。

视觉方向和首批适配已经落实，见 `DESIGN.md` 与 `verification.md`。后续新页面仍先观察真实 DOM，再编码、截图和验证可逆性。

## 0.2 结构重设计补充

重设计前再次通过 Chrome DevTools MCP 检查相同页面。首页课程角色区是 h3 + courseListing 的独立容器；移动整个 portlet 与 appTabList 保留其内部事件容器。首页改为工作区侧栏、课程视图和事务辅助区，不再沿原 column 的显示顺序堆叠。

公告列表直接属于 announcementForm。新目录与阅读区插入同一 form 内，再移动原 ul；原生表单控件归属保持不变。来源 announcementInfo 原为 absolute，必须明确重置 position 与高度。原生日期周围有无内容的固定高度 p，正文第一个 p 可能以 br 开头；只可逆地隐藏开头空白，不截断实际正文。

作业和教学内容共用 content_listContainer。原生 .item 的 clearfix::after 会成为 Flex 的多余子项，需在局部清除；附件 attachments > li 在窄屏继承到 40px 顶部 padding，直接影响行密度。描述在 .details > .vtbegenerated，附件位于同级 contextItemDetailsHeaders，说明可折叠而附件保持可用。公开标题图标的 alt 可用于显示内容类型，不据此推断业务进度。

手机面包屑隐藏了 root.coursePath 的课程名称，故页头补充来自原生课程链接的纯文本上下文。页面标题区还可能包含隐藏字段 form，重排不得移除该 form。外观控制在手机进入页头正常流；其生命周期须先恢复位置再销毁，防止回滚复活已销毁控制。

实际点击文件夹进入下一级后返回，原生读取导航正常。未点击作业提交入口或附件下载，未读取任何隐藏表单值。
