---
name: PKU Prism
description: 以课程与阅读任务为中心的中性色教学网工作区
colors:
  brand: "#9E2533"
  canvas: "#FAFAFA"
  surface: "#FFFFFF"
  subtle: "#F4F4F5"
  border: "#E4E4E7"
  control-border: "#71717A"
  text: "#18181B"
  muted: "#52525B"
  accent: "#9E2533"
  selected: "#FAEEF0"
  on-brand: "#FFFFFF"
  scrim: "rgb(0 0 0 / .24)"
  dark-canvas: "#18181B"
  dark-surface: "#202023"
  dark-subtle: "#27272A"
  dark-border: "#3F3F46"
  dark-control-border: "#A1A1AA"
  dark-text: "#F4F4F5"
  dark-muted: "#A1A1AA"
  dark-accent: "#F0A3AD"
  dark-selected: "#38272D"
typography:
  headline:
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.35
  notice-title:
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.5
  notice-title-mobile:
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.5
  course-title:
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.5
  resource-title:
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.6
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  reader:
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.6
  table-body:
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  metadata:
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
components:
  button-neutral:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "7px 60px 7px 12px"
  course-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "16px"
  shell-header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    padding: "12px 24px"
  shell-rail:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    width: "232px"
    padding: "16px 8px"
  inventory:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.table-body}"
  notice-reader:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
---

# PKU Prism 视觉规范

对应脚本：0.4.2 · 2026-10-12。此文档是 Prism 的设计依据，记录 `src/styles/`、`src/layouts/`、`src/core/frames.ts`、`src/ui/toggle.css` 与 `dist/pku-prism.user.js` 中的已实现规则。结构目标详见 [REDESIGN.md](REDESIGN.md)，页面观察与验证分别见 [research.md](research.md)、[verification.md](verification.md)。前置 Token 对应 `src/styles/tokens.css` 的语义值；深色使用 `dark-` 对应值，几何尺寸不随主题变化。

## Overview

**Creative North Star: "大学课程工作区"**

面向每日查看课程、通知与教学材料的教学网用户。延续 Linear 的紧凑层级、shadcn/ui 的语义色与状态、Notion 的阅读节奏，以中性表面与北大红组织一个安静、清晰的课程工作区。课程名称和正在阅读的内容承担视觉重心，编号、学期、日期和来源完整保留并降低权重。

共享头部只容纳全局入口、搜索、账户与外观；上下文导航独立在左侧：主页显示工具，课程页显示原生课程目录，My Blackboard 和资源库保留各自文字导航。课程身份、课程切换与面包屑中的返回链接进入侧栏，不再堆叠第二排上下文顶栏。组件以内容和操作为单位：课程入口使用卡片，公告使用目录与阅读区，教学材料和作业使用平整资源行，原生工具沿用统一的表格、表单与模块样式。局部组件只改变本地呈现，不推断业务状态。原生内容、链接、权限、表单归属和事件语义决定界面能做什么；CSS 负责表现，TypeScript 负责可逆 DOM 重组。

**Key Characteristics:**

- 中性色为主，品牌色只标识品牌、链接、选中与焦点。
- 名称优先、元信息完整，长标题可换行。
- 以分区、间距与细边框建立层级，表面平整。
- 浅深色共享布局，窄屏通过重排与折叠保留阅读空间。

## Colors

中性灰承担结构与正文，红色承担少量可操作或当前状态提示。颜色集中在 `src/styles/tokens.css`，页面与独立 Shadow DOM 控制共享同一份 Token；基础值 → 语义 Token → 页面组件构成三层结构。

### Primary

- **北大红**（`brand`）：固定品牌基色；浅色链接、选中和焦点使用 `accent`。
- **浅红强调**（`dark-accent`）：深色模式中的链接、选中和焦点，避免把原始品牌红用于深色表面上的小号文字。
- **浅红选中面**（`selected` / `dark-selected`）：当前视图、导航和公告目录项的选中背景，与文字或原生状态语义同时出现。
- **品牌面文字**（`on-brand`）：保留的语义 Token，不据此新增当前界面尚未使用的红色主按钮。

### Neutral

- **画布与内容面**（`canvas` / `surface`）：区分页面与内容容器；深色使用相应 `dark-` Token。
- **辅助面**（`subtle`）：hover 与辅助分区，不代替选中语义。
- **结构边线**（`border`）：卡片轮廓、分区和内容分隔。
- **控件边线**（`control-border`）：搜索、主题选择与必要的控件识别边界。
- **主文字与次级文字**（`text` / `muted`）：名称、正文与元信息的层级，不用透明度降低长正文的可读性。
- **抽屉遮罩**（`scrim`）：仅在窄屏侧栏展开时区分导航层与暂不可操作的主区；浅深色共用，不用于玻璃效果。

**The Semantic Contrast Rule.** 普通文字及次级文字目标 ≥4.5:1；焦点与必要的控件边界 ≥3:1。内容分隔线不承担控件识别功能，状态不能只靠颜色。

## Typography

所有角色共用 `typography.body.fontFamily` 的本机 UI 字体栈，不下载字体，不把课程编号整体设为等宽。数字可使用 tabular-nums。文字层级依靠尺寸、字重和间距，保持紧凑的工作界面语气。

| 角色 | Token 与实际用途 |
| --- | --- |
| 页面标题 | `headline`，首页“我的课程”与课程页标题 |
| 所选公告标题 | `notice-title`；手机使用 `notice-title-mobile` |
| 课程名称 | `course-title`，卡片内第一层文字 |
| 资源名称 | `resource-title`；手机名称为 14px，保持主要链接点击区域 |
| 导航与内容 | `body`；原生模块标题使用 14px / 1.5、字重 600 |
| 公告与说明正文 | `reader`，富文本保留原生内容格式，文字阅读宽度最多 76ch |
| 按钮、目录与辅助导航 | `label`；目录标题允许换行 |
| 学期、编号、数量、日期与类型 | `metadata`；来源、说明等辅助正文可使用 13px |

账户计数徽标不低于 `metadata` 的尺寸（12px）；手机可收起账户名称，但保留原生头像、数量和操作入口。

**The Complete Identifier Rule.** 名称置前，学期与编号次级显示；唯一识别信息完整保留，长文本换行，不以截断换取整齐。

## Layout

间距以 `spacing` 的 4px 单位构成；组件内部主要使用 8–16px，常见区块间距为 24px。固定宽度只用于导航与目录，内容列使用 `minmax(0, 1fr)`，允许长文本与附件换行。

### 共享框架

共享头部粘于页面顶部，最小高 64px，宽屏内边距 12px 24px。五个全局入口始终直接显示，顺序为我的主页、我的课程、我的社区、我的资源、北大课程；≤1200px 全局入口在同一个 header 内换行，≤600px 使用五等分布局及 12px 水平边距。头部实际高度由局部 ResizeObserver 测量，用于侧栏、账户浮层与遮罩的可用空间。移除旧 locationPane 为顶部导航保留的空白，不再显示教学网下拉或顶部课程面包屑。

主页、课程、My Blackboard 与资源库共用上下文侧栏，宽屏为侧栏 / 主区（232px / 弹性列）。默认展开，可通过顶部图标完全隐藏，主区随之扩展；不转换为图标栏。≤900px 默认隐藏，打开为距视口边缘 12px、宽度不超过 280px 的文字抽屉。遮罩从实际头部下缘开始；展开时主区 inert，焦点在侧栏内循环，Escape 或遮罩关闭并返回开关焦点。原生 puller 隐藏但保留，停用恢复原布局。没有原生上下文目录的页面不制造空侧栏。

### 工作区与内容区

首页宽屏为常用工具 / 课程目录 / 公告与事务（232px / 弹性列 / 280px）；901–1200px 保留 232px 工具列，辅助事务放到课程后方；≤900px 主区单列，工具进入共享抽屉。完全收起侧栏后移除其 Grid 列。≤600px 课程卡片变为单列。课程目录内边距依次为宽屏 32px、中屏 24px、窄屏水平 16px、手机水平 12px。

公告工作区为目录 / 阅读区（272px / 弹性列，间隔 24px）；≤1200px 目录缩为 228px、间隔 16px；≤736px 变为单列，目录通过 disclosure 展开。教学材料与作业保持平整列表，标题、附件和说明分别组织。

原生工具以自然内容高度和弹性列为默认，不为模块正文保留过时的固定高度。工具入口和门户模块在宽屏使用两列、≤900px 使用单列；原生工具主区常用内边距为桌面 24px、≤900px 16px。表格由局部容器横向滚动，日历保留可读网格并在内容区滚动，不把整页撑宽。通知、成绩与日历中的筛选导航在宽屏置于内容旁，窄屏移到上方并约束辅助区高度。

**The Reading Space Rule.** 窄屏将辅助导航折叠、内容改为单列，主要入口和附件保持可见；不以压缩正文行高或截断课程标识获得密度。

## Elevation & Depth

默认无阴影。画布、内容面与辅助面构成色调层级，细边框和间距表达分区。导航、课程卡片、资源标题、附件和按钮通过颜色、边框或背景表达 hover，不新增下划线；教师富文本保留原有文本装饰。不抬升、不缩放，不增加动画。切换浅深色直接替换语义色，避免原站颜色过渡产生暂时难读的中间状态。

**The Flat Surface Rule.** 课程卡片、公告阅读区、资源行与控制面板均保持平整，用背景、边线和排版表示层级。抽屉通过中性遮罩区分层次，不依靠阴影。

## Shapes

小控件使用 `rounded.sm`，行选中、搜索与普通按钮使用 `rounded.md`，课程卡片、公告阅读区和控制组使用 `rounded.lg`。边框统一为 1px。避免胶囊化和每行卡片化；资源行共享分隔边线，课程卡片内部不嵌套装饰卡片。

## Components

### Buttons

普通本地按钮使用中性表面、主文字与细边框，采用 `button-neutral`；当前视图和按下状态使用 `button-selected`，同时保留 `aria-pressed`。可用按钮的 hover 改为辅助面、加深边框并显示 pointer；禁用按钮降低不透明度，使用 not-allowed，不响应 hover 背景。桌面最小高度 36px，≤736px 主要控件最小高度 44px。原生按钮保留 disabled、提交和导航语义。

键盘 focus-visible 为 2px 实线、2px 偏移，使用 `accent`；弹出菜单的焦点环向内偏移 2px，避免被滚动容器裁切。不增加动画。

### Inputs / Fields

搜索使用中性内容面、控件边线和 `rounded.md`，桌面高 36px，≤736px 最小高 44px。占位文字使用次级文字色，搜索框预留清空按钮空间。搜索仅过滤已经加载的本页或当前课程视图，显示实际匹配数量、无结果提示与清空入口；不提交原生表单。

### Navigation

单一共享头部使用 shell-header，原生四个站点链接缩短为中文标签，保留原 Text 节点、href 与事件；新增“我的课程”定位主页课程区，课程页面将其标为当前全局入口。“搜索我的课程”定位已加载课程视图的搜索框，不冒充全站搜索。外观菜单容纳 PKU Prism 启停、系统 / 浅色 / 深色选择与原生快速链接入口；账户保留 profile flyout、异步加载、折叠组与注销事件。外观使用 details / summary，点外部关闭，Escape 返回摘要焦点。

共享上下文侧栏使用 shell-rail。课程面包屑整个原生节点移入侧栏顶部，保留课程名称、课程间切换和有用的上级返回链接；与课程目录重复的链接及无操作当前项隐藏，停用恢复。原生 paneTabs / localViewToggle 移入侧栏，课程目录与小组目录的展开事件保留。帮助开关、低频刷新、弹窗课程菜单与课程首页入口进入侧栏最底部的同一组紧凑 SVG 图标（桌面 28px、窄屏 44px），目录与身份区独立滚动；保留原生节点、事件、状态标题和可访问名称。小组及控制面板的展开项统一为左侧细线箭头、完整文字、独立右侧跳转按钮，使用原生 aria-expanded 更新箭头方向；文字与跳转各有 Grid 列，桌面跳转列 32px、窄屏 44px，去除旧背景图标与字体伪图标。顶部开关同时更新 aria-expanded、aria-controls 与 inert，抽屉不压缩为图标栏。

公告目录使用完整的 disclosure 摘要行：Flex 对齐文字与右侧细线箭头，去除浏览器默认 marker；展开状态使用向上箭头。窄屏增加细边框、内容面和 44px 最小高度。主页工具与“我的机构”使用同一个 menuWrap-inner 容器和课程目录的行样式：桌面至少 36px、窄屏至少 44px，12px 水平内边距，浅深色共享 hover 与选中 Token。保留原生 overflowULId 及父容器以兼容 SecondaryTabs 的缩放重排，列表改为静态可见，直接显示通知指示板等原链接，隐藏溢出触发器并使用普通链接语义；停用还原角色、触发器及焦点属性。主页工具不再嵌套第二个 disclosure，统一由上下文侧栏开关控制。

课程间切换仍使用原站动态菜单及事件。桌面菜单最大宽 360px、最大高 560px，长列表内部滚动，关闭入口固定在滚动区顶部。≤736px 使用距视口两侧及底部 12px 的浮层，最大高为 640px 与可用视口高度的较小值；课程入口和关闭按钮为 44px。账户 flyout 同样使用中性内容面、细边框与内部滚动；焦点环向内偏移，防止被裁切。只按已观察的原生行为识别业务菜单，不依赖动态 ID，也不接管原生事件。

### Course Cards

课程卡片沿用同一个原生链接，使用 `course-card` 的中性表面与模块圆角。名称在前，学期居中，编号置底；完整保留真实角色分组、课程名称、学期与编号。桌面卡片最小高 124px，≤600px 最小高 112px；卡片高度可随长标题增长。当前 / 历史视图与搜索只改变本地可见性。

### Notice Directory / Reader

目录项是本地选择按钮，包含完整标题和已有日期，使用选中色、边框与 `aria-current` 表示当前项。阅读区使用 `notice-reader`，保留所选原生公告全文、日期、来源与表单归属；支持“全部展开”。手机选择目录项后收起目录并把焦点交给正文标题。只移除原站正文外的空白占位和起始空行，不改写正文内部格式，不创造未读状态。

### Resource Rows

资源和已观察的作业索引按平整行排列，原生标题入口、类型、附件和可展开说明各自可扫描。附件与标题始终可用，说明默认折叠，按需逐项或全部展开；手机隐藏冗余类型标签，主要标题、附件与说明按钮保持 44px 点击区域。附件列表不继承正文行的额外缩进。不创造截止时间、提交状态或完成进度；未观察的提交表单不推测结构。

### Assignment Forms / Review

已观察的原生作业提交页在宽屏以填写区 / 作业信息双列组织，≤1100px 按原生顺序堆叠。文件选择、TinyMCE、备注、取消 / 保存 / 提交控件与原 form 保持原位；底部操作区进入正常流。提交历史为原生文档查看器 / 尝试详情并列，≤736px 上下排列，保留原生收起与最大化事件。只统一布局与主题，没有执行任何填写、上传或提交。

### My Blackboard Overview

总览与全屏通知流分开识别；总览使用两列信息区，窄屏一列。移除原生米黄标题和装饰网格，课程标题、截止日期保持可见，列表按内容自然增长。独立课程成绩页与嵌入成绩视图共享表头、筛选及选中状态 Token；筛选与排序回到自然布局，窄屏成绩表保留局部横向滚动。成绩隐藏 / 悬停显示继续由原站控制，不将隐藏数值提前显示。

### Native Tools / Tables

任务、邮箱、通讯录、目标、社区、资源库、日历、通知与成绩共用原生工具基线。保留原生控件、排序、分页、搜索、富文本和表单归属；只统一语义色、字体、边线和布局。表格采用 `inventory`，标题行用辅助面、单元格常用内边距（12px）、正文（13px / 1.6），hover 使用辅助面。空状态沿用原生内容；必要的本地说明只描述当前显示结果，不推断权限或后台数据。

门户模块使用内容面、模块圆角与自然高度；操作条和分页使用平整表面。工具链接使用强调色或主文字，原生按钮使用相同的中性状态语言。较密集的原生控件可保留 32px 最小高度；新增手机导航与本地主要控件使用 44px，不能把局部适配宣称为所有历史表单已经完成触控改造。

### ClassIn Native Form

已观察的原生 ClassIn 绑定页按路由与表单结构守卫单独识别。移除 Bootstrap 固定黑色与过宽容器，标签与输入在宽屏分列、窄屏上下排列；说明和二维码各占独立阅读行。保留中英文区的原生可见性、全部字段、短信与保存按钮、返回事件，不读取或填写手机号 / 验证码，不触发绑定操作。

### Prism Appearance Control

独立 Shadow DOM 中组合启停按钮与系统 / 浅色 / 深色原生选择框，共享页面 Token。在共享框架中，控制进入头部“外观” popover，控制组自身移除外层边框与内边距；桌面控件最小高 32px，≤736px 为 44px。没有共享框架或停用后，控制恢复独立入口，继续提供启用能力。默认跟随系统主题；主题和启停偏好只写入 Prism 自有键，支持系统变化与跨标签同步，存储不可用时本页仍可操作。

同源且识别为原生教学网页面的 iframe 递归注入共享 CSS 和浅深色属性，监听 load 处理后续内容；已观察的 TinyMCE 可编辑文档只适配表面，不读取或修改正文。移动包含 iframe 的连接节点采用 moveBefore，挂载与回滚均保留原 Document；不支持此 API 的浏览器保留含 iframe 页面的原生布局。不在 frame 内重组业务 DOM，销毁时移除自有样式、恢复属性并清理 load 监听器。跨域 LTI 和文档查看器内部不在适配范围内。

停用先将移动的控制恢复，再回滚框架与页面结构并移除样式；新增监听器、局部观察器和运行时高度变量均有清理逻辑。重复注入先清理旧实例。打印隐藏控制和本地导航工具，内容使用浅色并展开阅读。

## Do's and Don'ts

### Do:

- **Do** 复用语义 Token；浅深色改变颜色，保持几何尺寸一致。
- **Do** 优先呈现名称、正文与主要业务入口，完整保留课程、角色和资源标识。
- **Do** 为本地搜索、选中和展开提供可访问状态、数量反馈及清空入口。
- **Do** 在已识别 Blackboard 页面的 `html[data-pku-prism='enabled']` 与对应页面标记范围内改造；深度重组另设 DOM 守卫，移动原生节点而不复制业务节点，停用恢复位置、属性和文本。
- **Do** 用真实 DOM 与构建产物核验布局；原生工具共享基线，未知结构先观察再专项适配，验证范围与环境限制写入验证记录。

### Don't:

- **Don't** 使用渐变、毛玻璃、装饰性 Emoji、重阴影、入场动画或新增动画。
- **Don't** 增加外部字体请求、联网依赖、React 或组件框架。
- **Don't** 以装饰性卡片、胶囊和文字截断削弱内容层级。
- **Don't** 从本地呈现推断未读、截止时间、提交或完成状态，不改写原生业务语义。
- **Don't** 修改原站 body class、覆盖原生事件或操作跨域 iframe；所有新增节点和监听器必须可清理。

### 依据与验收

[frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) 用于信息层级和截图自评；[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) 用于数据密集界面、对比度和响应式规则；[Impeccable](https://github.com/pbakaus/impeccable) 用于 Operate 工作界面原则与成组视觉核验。[Moodle Course index](https://docs.moodle.org/503/en/Course_index) 与 [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/base/sidebar) 用于可完整收起的上下文目录和窄屏抽屉；全局 / 上下文分工遵循用户指定的 GitHub 参考方向。用户确认的中性色、本机 UI 字体、模块圆角和无动画约束优先于通用建议，不重复访谈。

历史 0.3 验证覆盖 18 个真实页面；本轮 0.4 重新核验 8 个顶层页面，新增作业提交、提交历史和 My Blackboard 总览适配，不代表穷尽全部后台路由。检查水平溢出、长名称、元信息、焦点、原生菜单、启停清理、偏好同步、编辑器 Document 保持与重复注入；运行 npm run check，核对原生节点身份、链接、表单归属与停用后的完整恢复。只改变浏览器本地呈现，不改后端、不提交原生业务表单。跨域内容、未核验路线和环境限制写入验证记录。MCP 临时注入用于验证，不等于 Tampermonkey 持久安装；截图检查不等于全部业务回归。
