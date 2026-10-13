# 页面与实现研究

勘察日期：2026-10-12；导航徽标与焦点补充：2026-10-14。通过 Chrome DevTools MCP 直接检查已登录的 Blackboard Learn。此文件只记录结构信息；不保存账户信息、课程标识、认证凭证或表单值。

早期记录描述 0.2.x 的观察与取舍；当前适配方式和范围以末尾 0.3 记录为准。

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

## 0.2.1 交互样式补充

通过真实 hover 检查发现，Prism 的 shell 曾对 portlet、公告与内容列表统一注入下划线；该规则范围过宽。导航与资源操作现在明确覆盖各交互状态，富文本内容保留作者格式。首页与公告页本地按钮的 pointer 原先可测得，本轮明确 enabled hover、子元素 cursor 继承和 disabled 状态，避免将不同现象混为一处样式冲突。

本地 summary 默认仍是 list-item，带浏览器 marker；首页桌面还使用 pointer-events:none，但没有同步移除键盘展开行为。现在两个页面共用完整 Flex 摘要行与箭头，保持原生 details 点击和键盘行为。

课程间导航由 `#breadcrumbs .coursePath .courseArrow .contextMenuContainer` 下的原生 `a.cmimg` 触发。生成的 `.cmdiv` 动态插入 body，ID 每次生成均可能变化；内部课程链接执行 `breadcrumbs.navCourse`，关闭控件是 `.contextmenubar_top a.close-menu`。原站关闭按钮对所有状态声明白底 !important，且手机 courseArrow 可能偏离原课程名称。样式按菜单行为限定，保留原生事件与链接，恢复手机原生课程名称和切换入口；没有新增菜单实现或动态观察器。

## 0.3 共享框架与原生工具

本轮检查 18 个已登录的顶层页面，包括用户预先打开的工具页面，并只读进入课程内容文件夹、讨论区和工具目录。页面识别此前只覆盖少数路由，导致其他课程工具和内嵌页面完全缺少主题；现在深度重排仍受路由与 DOM 守卫保护，其他 `body#learn-oe-body` 原生页面获得共同基线，认证路由始终排除。

| 实际区域 | 稳定结构 | 适配决定 |
| --- | --- | --- |
| 顶部站点与账户 | `#topTabs`、`.tabWrapper-right`、`#appTabList`、`#paneTabs`、`.localViewToggle`、`.global-nav-bar-wrap` | 移动完整容器至一个共享头部；站点和次级视图进入 popover，保留原生账户 flyout |
| 课程 / 资源侧栏 | `#navigationPane` 与 `#contentPanel` 同级；`#menuWrap`、`#courseMenuPalette`、`#ccShortcutViewId_contents` | 整体移动到 Grid；明确按钮控制桌面侧栏和手机抽屉，旧 puller 只隐藏 |
| 账户飞出菜单 | `#global-nav-flyout`、`#flyoutMenuContent`、`#global-list-tools`、`.accordion_content`、`#bottomButtons` | 分为工具导航与原生 accordion；样式覆盖稍后加载的后代，不改请求或事件 |
| 社区 / 课程目录 | `.containerPortal`、`.column-2`、`.column-3`、`.portlet`、`.collapsible` | 模块改为自适应 Grid 和自然高度，去除小幅内层溢出 |
| My Blackboard | `.mybb-div`、`#side_nav`、`#mybbListTools`、`#iframe_wrap`、`#mybbCanvas` | 文字导航 + 原生 frame；移除旧 700px 最小高度及无用外层滚动 |
| 通知流 | `.stream_full` 的 `.stream_header`、`.current_filter`、`.left_stream_wrapper` | 明确筛选 / 列表列与行，避免 heading 成为意外 Grid 子项，把列表推到下方 |
| 成绩 | `#stream_mygrades`、`.stream_left`、`.stream_right`、`.stream-detail-page`、`.filterBarHorizontal`、`.sorter`、`.gradeTableNew` | 手机列表在上、详情在下；筛选和排序恢复正常流，保留原生详情、数值和内部滚动 |
| 日历 | `#outer_left_stream_alerts`、`#streamHeader_calendar`、`#calendar_content`、`#calendar` | 桌面筛选 / 月网格并列；手机先显示视图与月份，宽网格在自身容器滚动 |
| 原生工具 | `.landingPageColumn`、`.inventory`、`.inventoryListTableContainerDiv`、`.rumble`、`.pagingprefs`、`.column-nav-inner` | 统一目录、表格、操作条和表单表现，保留业务语义 |

原站响应式脚本会把账户菜单移进站点表格，并把 `.tabWrapper-right` 设为 fixed / max-height:0。共享框架需要完整重置这些几何属性，并仅观察已移动的几个局部导航容器；停用时断开观察，必要时调用原站自身的响应式布局方法恢复当前断点。没有全页 DOM 观察器。头部实际高度随内容换行变化，由局部 ResizeObserver 测量。

页面和成绩详情使用多层同源 iframe；父页面可递归添加 CSS 主题，原生 frame 的 load 后再次适配。仅处理同源且匹配原生标记的文档，跳过跨域 frame，不在子文档内重组业务 DOM。原生 LTI 包装页有同源方向框架和跨域应用内容，后者无法由父页面样式控制。

实际资源标题含 `style="color:#000000"` 的 span，必须在标题区域覆盖继承色；正文富文本不作统一清色。原生按钮和分页带有固定颜色及颜色过渡，会在切换主题时短暂出现旧底色；已适配的这些控件使用成对前景 / 背景与即时颜色切换。原生 clearfix 的零高点号仍会产生 22px 行框溢出，在已用 Grid / flow-root 取代清浮动的 My Blackboard 容器内取消该伪元素。

账户 flyout 的工具 accordion 实际加载出原生工具链接；课程 accordion 在本次会话持续呈现原生加载状态。Prism 只补充可读的加载提示，不接管数据加载，也不把未返回的课程内容宣称为已验证。

## 0.4 两层导航、作业与总览

本轮重新观察用户打开的课程公告、作业提交历史、作业提交页与 My Blackboard 总览，并只读打开主页、社区、资源库与课程目录。所有全局入口来自原生 `#appTabList td > a`，包含英文后缀的 Text 节点可原位简化并恢复；浅色 hover 变白来自原生嵌套 span 的状态色，必须在导航内同步前景继承。

- 全局 header 保留四个原生站点链接，添加定位主页课程区的“我的课程”与课程搜索。`#breadcrumbs`、`#paneTabs`、`.localViewToggle` 移入当前原生上下文侧栏；课程路径中重复入口和无链接当前项隐藏，保留可用的上级返回链接。课程刷新和弹窗菜单来自 `.actionBarMicro .nav a`，保留节点及事件，以 SVG 和原生可访问标题压缩空间。旧 `.locationPane` 顶部 margin 是空导航带的来源，统一框架内清除。
- 主页 `.prism-workspace-nav`、课程 / 资源 `#navigationPane`、My Blackboard `#side_nav` 共用完整收起和 ≤900px 抽屉机制；主页原有 1037px 单列断点改为 900px，避免平板宽度把工具区放到主区上方。移除侧栏 Grid 列时需匹配原布局规则的 specificity，否则栏隐藏后主区仍只有原侧栏宽度。
- 本次动态 `.cmdiv` 课程菜单的业务项没有 href，使用 `role=menuitem` 及原生事件；其分组标签为 `.labelMenuItem`。旧选择器只匹配 `breadcrumbs.navCourse` 链接，因而漏掉该变体。样式同时识别两种已观察结构，不写生成 ID。原生 onfocus / onmouseover 负责延迟初始化，点击打开菜单；不替换该逻辑。移动端浮层以左右 inset 约束，避免经典滚动条使 vw 宽度偏出视口。
- `#quick_links_wrap` 是原生无障碍快捷链接入口，移入顶部外观设置下方；其 `.lb-wrapper:has(.ax-content)` 弹窗保留跳转、键盘快捷键和 Escape，只适配表面和滚动。原账户 flyout 仍可打开；窄屏固定在统一头部下方并约束两侧。
- 作业 `uploadAssignment` 路由同时出现 `#uploadAssignmentFormId` 填写页和 `#inlineGrader` 提交历史页。前者重排原生步骤，后者保留文档查看器与原生尝试详情。TinyMCE 文档为同源 `body#tinymce.mce-content-body[contenteditable=true]`，只适配 CSS。没有读取编辑内容、字段值或执行提交。
- 普通 insertBefore 移动包含连接 iframe 的区域，会使编辑器文档重载为 about:blank；改用 moveBefore，并在回滚使用同一机制。实测主题切换、停用及重复注入后两个编辑器仍保留原 Document。无该 API 时不重排含 iframe 的原生区域。
- 总览同源内容以 `#mybb_column_wrapper` 区分于全屏 stream。原生 `.stream_details` 在手机隐藏课程名称，应恢复其阅读布局；成绩 `.hidden` / `.hidden-msg` 继续沿用原生悬停揭示，不把值提前显示。总览列与列表恢复自然高度，清除原生米黄表面和装饰网格。

以上只记录去除个人信息的结构。原生作业、成绩、通信及认证数据均未写入；跨域文档 / LTI 内部仍不处理。

## 0.4.1 ClassIn 文字与原生目录组合项

通过 MCP 检查用户当前 ClassIn 绑定页与教师课程公告页。ClassIn 的 `.containerOptions` / `#panelbutton1` / `#searchForm` 引入 Bootstrap 样式，标签和说明继承固定 `#111`，页头直接文本继承 `#333`；`#containerdiv.container` 的固定宽度导致整页约 87px 横向溢出。适配以原生 body、具体路由和 `#panelbutton1 #searchForm #enInputContent` 三项共同守卫，统一文字 / 按钮主题，标签与字段采用响应式 Grid，保留原生中英文区可见性。空返回容器还有 400px 最小高度，局部取消后回到自然高度。没有读取、填写字段或触发短信 / 绑定操作。

课程小组与教师控制面板的组合项结构一致：`li > h4 > a[aria-expanded]`、可选的兄弟 `.submenuLink`、原生 `.submenu`。旧小组标题的左 padding 只有 12px，展开背景图与文字重叠；教师面板原来预留 30px，因而较好。展开后原站把 class 改为 `comboLink_active` / `submenuLink_active`，不能只匹配初始类。改为 aria-expanded 驱动的细线箭头、完整标签和独立跳转列；保留原节点、标题、href、组折叠和异步内容。原生跳转链接有字体伪图标与 img，统一隐藏装饰并加入单份 SVG；侧栏文本换行，横向裁切仅约束已确认的原生装饰溢出，实际操作盒子都在侧栏边界内。

`#helpTextToggleLink` 原为灰底问号，移动完整 `#helpTextToggle` 至原生小操作条，替换显示为帮助 SVG。原点击事件及动态 title 仍控制帮助说明的显示 / 隐藏，停用恢复原位。教师课程的不可用 / 预览 / 编辑控件保留，不触发业务状态切换，仅约束原生按钮和移动设置入口在侧栏内的几何位置。公告来源区 span 的固定灰色也改为 muted Token，富文本正文格式保持原样。


## 0.4.2 独立成绩页与主页侧栏

- 实际 `/webapps/bb-mygrades-BBLEARN/myGrades` 顶层页识别为 tools，`.gradeTableNew .grades_header` 位于 `#containerdiv`，不在 `.stream-detail-page` 内，原表头白底与 `#filterby a.active` 的深色字因此漏掉；筛选列表还保留绝对定位，撑宽整页。共享结构规则覆盖两种成绩视图，筛选与排序恢复正常文档流。
- 原课程 `.actionBarMicro` 内含 `.nav.clearfix.u_floatThis-right`，在折叠目录时整个操作区还会隐藏。整体移到侧栏最后的独立 footer，保留原帮助、刷新和弹窗节点。`#courseMenu_combo` 所在空 h3 在此页面恰好叫 anonymous_element_6；只依稳定功能链接识别，把链接变为 footer 的课程首页图标，隐藏空标题，绝不按生成 ID 全站删除。
- 主页 `#paneTabs` 包含“我的机构”和 `#overflowLiId`；原触发器 `#overflowIconId` 展开原生 `#overflowULId.more[role=menu]`。已观察列表有“通知指示板”，白色绝对定位浮层没有正确继承主题。读取原生 secondaryTabs.js 确认其 resize 处理会拆下 overflowLiId、将 overflowULId 的 li 重新分配后复原，因此保留这两个容器不动；将列表改为静态可见、普通链接语义，仅隐藏触发器链接。主页工具 portlet 与 paneTabs 放入同一 menuWrap-inner，共用课程目录的行样式。

- FlyoutMenu.initARIA 会把真实 href 存入原节点 ohref 并移除 href，且将菜单项设为 tabindex=-1；所以不能克隆或重建链接。直接展示后，以普通 link / tabindex=0 保留原点击回调，无 href 的键盘激活转发原 click。旧 flyout 的 enabled 标志在启用期间关闭，停用恢复；其 close 在 mouseout 时仍写 aria-hidden，局部观察器仅协调此导航及该属性。

## 2026-10-14 账户计数与链接焦点

- 首页与课程公告路由实测：`#global-nav-link` 内包含头像、账户名称 Text、`#badgeTotal` 和展开图标；徽标内部是隐藏的 `#badgeAXLabel.hideoff` 与显示数字的 `#badgeTotalCount.badge`。仅调整外层字号不能修复布局：外层实际为 0×0px，内部计数仍继承 shared.css 的 `.nav-link .badge { position: absolute; right: 22px; top: 5px; }`，相对头部定位到了按钮外。两层均改为正常 Flex 流，计数保留原节点与原生 visibility。
- MCP 的匹配样式确认 core.css 对 `input:focus, button:focus, select:focus, a:focus` 使用 `2px solid #0076d0`，app_nav.css 另对导航等区域设置浅紫色 `:focus` 轮廓。问题链接实测 `:focus=true`、`:focus-visible=false` 却仍有蓝色 2px 实线，说明旧站没有区分鼠标焦点与需要显示的键盘焦点。原有 Prism 只声明 `:focus-visible` 的颜色，没有清除互斥状态下的旧站轮廓。
- 共享基线在已识别页面清除 `:focus:not(:focus-visible)` 的轮廓，并为 `:focus-visible` 使用主题色；不执行 blur、不拦截鼠标事件、不加入焦点状态监听器。实际鼠标点击账户按钮和鼠标操作后程序聚焦课程链接均无轮廓；真实 Tab 到课程链接时仍显示主题色 2px 实线。

## 2026-10-14 外观展开与课程导航密度

- 外观由自有 details / summary、标题、Shadow DOM 启停 / 主题控件，以及原生 `#quick_links_wrap` 构成。原生入口实际为 `#quick_links_lightbox_link`，仍调用原生快速链接对话框。展开布局沿用同一份节点；现有 header ResizeObserver 增加对站点区、工具区和账户区的局部观察，以账户和站点文字的实际宽度计算可用空间，计入站点链接已换到第二行的情况。
- 学生及教师课程中，`#menuWrap .menuWrap-inner` 包含课程目录与小组 / 控制面板 navPalette；教师页另有原生 `h2.navDivider` 管理区标识。旧 `#courseMenuPalette .navPaletteContent` 仍带 14px 上下内边距，h3 又叠加水平内边距、下 margin 和左箭头。直接重置这些已观察容器，分区使用 12px 间距，导航行统一 32px / 窄屏 44px。管理区标识保留文字并缩减原先 18px 顶 padding、14px 底 margin。
- 展开项均由 `.navPaletteTitle h3 > a[aria-expanded]` 或 `li > h4 > a[aria-expanded]` 控制，兄弟 `.submenu` 保持原生异步加载与显隐。箭头从 before 移到 after，父标题与子项依次采用 12px、24px 水平内边距，submenu 再增加 12px。小组及教师面板的 `.submenuLink` 会切换到 `.submenuLink_active`，两者都在 menuWrap 内隐藏；移到 footer 的原生课程首页入口不在该范围内。
- 首页应用授权链接为 `.portletList a` 中的独立 Text 节点；仅将精确匹配的英文名称翻译为“应用授权”，使用 DomSession.text 回滚，不重建链接或替换整段 HTML。

## 2026-10-14 助教管理控件与目录层级

- 助教公告页实测 `.breadcrumb-controls.clearfix#breadcrumb_controls_id` 是 breadcrumbs 的直接子节点，包含 `#enterStudentPreviewForm`、`#student-preview-control #startStudentPreviewLink`、`.lock-unlock-toggle .course-availability-button`、`.modeSwitchWrap #editModeToggleLink`、旧移动端齿轮与预览 ribbon。预览表单只有原生隐藏控件，未读取其值。把整个区域移入 footer 的原生操作条，内部表单归属和事件容器保持不变，不逐个拆散业务控件。
- 学生预览与可用性使用原生 onclick，编辑模式使用原 href 回调。可用性链接保留原 `role=checkbox`、aria-checked、title 和 class；不推导或改写后台状态，图标仅跟随已观察的 course-available class。编辑模式 read-on 的状态规则另经原站 CSSOM 确认；原 statusText 作为 aria-describedby，旧标签与状态文字仅在视觉上收起。
- 可用性还有 `input#courseAvailabilityToggle[type=checkbox]`，原本与链接形成两个可访问的复选框及重复 Tab 停靠点。图标化后只隐藏该 input 的显示，保留原节点供原生 widget 使用；可操作、带原角色的链接继续可达。旧齿轮只有展开原管理面板的作用，当前入口已经直接显示，因此隐藏该重复入口。
- 原 `h2.navDivider` 紧邻 `#controlPanelPalette`，与内部 `#controlPanelPalette_link` 重复显示“课程管理 / 控制面板”。隐藏静态标题，把其名称用于原生展开链接的 Text 节点；保持同一个 aria-controls / aria-expanded 和原事件，形成与课程目录同级的单一“课程管理”分区，管理项与子项延续 12px 逐级缩进。

## 2026-10-14 侧栏固定区域与隐藏滚动条

- 沿用此前 MCP 已确认的 `#navigationPane`、原生 `#breadcrumbs`、`#menuWrap` 和底部操作条结构。本轮 Chrome MCP 无法连接，未把代码推断记作新的实页观测。
- 旧布局把课程名称与目录一起放入 `.prism-context-body`，滚动时名称会离开顶部；此前已观察到经典滚动条带来 15px 的可用宽度差，可能引起目录换行和高度变化。此次从布局上消除这两项变化来源，尚待实页确认用户所述跳动是否完全消失。
- 保留 `#breadcrumbs` 为侧栏直接子节点，与 `.prism-context-body`、`.prism-context-footer` 形成上中下三段。上下两段不参与收缩，中间使用 `min-height: 0` 的弹性滚动区；隐藏滚动条及其占位，关闭滚动锚定，限制纵向滚动传播。移动原生节点仍由 DomSession 记录并完整回滚，没有新增监听器或观察器。
