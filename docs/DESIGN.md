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
  notice-reader:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
---

# PKU Prism 视觉规范

版本：2.1 · 2026-10-12。此文档是 Prism 的设计依据，记录 `src/styles/`、`src/layouts/`、`src/ui/toggle.css` 与生产脚本中的已实现规则。结构目标详见 [REDESIGN.md](REDESIGN.md)，页面观察与验证分别见 [research.md](research.md)、[verification.md](verification.md)。前置 Token 对应 `src/styles/tokens.css` 的语义值；深色使用 `dark-` 对应值，几何尺寸不随主题变化。

## Overview

**Creative North Star: "大学课程工作区"**

面向每日查看课程、通知与教学材料的教学网用户。延续 Linear 的紧凑层级、shadcn/ui 的语义色与状态、Notion 的阅读节奏，以中性表面与北大红组织一个安静、清晰的课程工作区。课程名称和正在阅读的内容承担视觉重心，编号、学期、日期和来源完整保留并降低权重。

组件以内容和操作为单位：课程入口使用卡片，通知使用目录与阅读区，教学材料和作业使用平整资源行。局部组件只改变本地呈现，不推断业务状态。原生内容、链接、权限、表单归属和事件语义决定界面能做什么；CSS 负责表现，TypeScript 负责可逆 DOM 重组。

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

**The Complete Identifier Rule.** 名称置前，学期与编号次级显示；唯一识别信息完整保留，长文本换行，不以截断换取整齐。

## Layout

间距以 `spacing` 的 4px 单位构成；组件内部主要使用 8–16px，常见区块间距为 24px。固定宽度只用于导航与目录，内容列使用 `minmax(0, 1fr)`，允许长文本与附件换行。

### 工作区与内容区

首页宽屏为工作区导航 / 课程目录 / 公告与事务（200px / 弹性列 / 280px），课程目录内部为两列卡片。宽度 1038–1200px 时导航缩为 180px，辅助事务放到课程后方；≤1037px 为单列，工作区导航通过 disclosure 展开。≤600px 的课程卡片变为单列。课程目录内边距依次为宽屏 32px、中屏 24px、窄屏水平 16px、手机水平 12px。

课程页沿用原生课程导航及其展开逻辑。公告工作区为目录 / 阅读区（272px / 弹性列，间隔 24px）；≤1200px 目录缩为 228px、间隔 16px；≤736px 变为单列，目录通过 disclosure 展开。教学材料与作业保持平整列表，标题、附件和说明分别组织。

课程页内容边距为桌面 24px、≤1037px 16px、≤736px 12px。手机保留当前课程名称并放在页面标题上方；原生侧栏展开时覆盖内容，不挤压阅读列。Prism 外观控制在桌面固定于右下角，在≤736px 已适配页面进入标题区的正常文档流，避免覆盖列表或阅读内容。

**The Reading Space Rule.** 窄屏将辅助导航折叠、内容改为单列，主要入口和附件保持可见；不以压缩正文行高或截断课程标识获得密度。

## Elevation & Depth

默认无阴影。画布、内容面与辅助面构成色调层级，细边框和间距表达分区。hover 只改变颜色、边框或链接下划线；不抬升、不缩放，不增加动画。切换浅深色直接替换语义色，避免原站颜色过渡产生暂时难读的中间状态。

**The Flat Surface Rule.** 课程卡片、公告阅读区、资源行与控制面板均保持平整，用背景、边线和排版表示层级。

## Shapes

小控件使用 `rounded.sm`，行选中、搜索与普通按钮使用 `rounded.md`，课程卡片、公告阅读区和控制组使用 `rounded.lg`。边框统一为 1px。避免胶囊化和每行卡片化；资源行共享分隔边线，课程卡片内部不嵌套装饰卡片。

## Components

### Buttons

普通本地按钮使用中性表面、主文字与细边框，采用 `button-neutral`；当前视图和按下状态使用 `button-selected`，同时保留 `aria-pressed`。hover 改为辅助面并加深边框。桌面最小高度 36px，≤736px 主要控件最小高度 44px。原生按钮保留 disabled、提交和导航语义。

键盘 focus-visible 为 2px 实线、2px 偏移，使用 `accent`；链接保留可识别的 hover 下划线。不增加动画。

### Inputs / Fields

搜索使用中性内容面、控件边线和 `rounded.md`，桌面高 36px，≤736px 最小高 44px。占位文字使用次级文字色，搜索框预留清空按钮空间。搜索仅过滤已经加载的本页或当前课程视图，显示实际匹配数量、无结果提示与清空入口；不提交原生表单。

### Navigation

首页把完整原生全局导航容器与工具模块移动到工作区侧栏；课程页继续使用紧凑全局页签与原生课程导航。当前项使用选中色和当前页语义，hover 使用辅助面。原站侧栏保留自己的展开 / 收起按钮及事件，窄屏工作区导航使用本地 disclosure。

### Course Cards

课程卡片沿用同一个原生链接，使用 `course-card` 的中性表面与模块圆角。名称在前，学期居中，编号置底；完整保留真实角色分组、课程名称、学期与编号。桌面卡片最小高 124px，≤600px 最小高 112px；卡片高度可随长标题增长。当前 / 历史视图与搜索只改变本地可见性。

### Notice Directory / Reader

目录项是本地选择按钮，包含完整标题和已有日期，使用选中色、边框与 `aria-current` 表示当前项。阅读区使用 `notice-reader`，保留所选原生公告全文、日期、来源与表单归属；支持“全部展开”。手机选择目录项后收起目录并把焦点交给正文标题。只移除原站正文外的空白占位和起始空行，不改写正文内部格式，不创造未读状态。

### Resource Rows

资源和已观察的作业按平整行排列，原生标题入口、类型、附件和可展开说明各自可扫描。附件与标题始终可用，说明默认折叠，按需逐项或全部展开；手机隐藏冗余类型标签，主要标题、附件与说明按钮保持 44px 点击区域。附件列表不继承正文行的额外缩进。不创造截止时间、提交状态或完成进度；未观察的提交表单不推测结构、不自动改造。

### Prism Appearance Control

独立 Shadow DOM 中组合启停按钮与系统 / 浅色 / 深色原生选择框，共享页面 Token。桌面按钮与选择框最小高 32px，手机为 44px；桌面控制组有边框，手机进入标题区后移除外层边框。默认跟随系统主题；主题和启停偏好只写入 Prism 自有键，支持系统变化与跨标签同步，存储不可用时本页仍可操作。

停用先将移动的控制恢复，再回滚页面结构并移除样式；控制继续提供重新启用入口。重复注入先清理旧实例。打印隐藏控制和本地导航工具，内容使用浅色并展开阅读。

## Do's and Don'ts

### Do:

- **Do** 复用语义 Token；浅深色改变颜色，保持几何尺寸一致。
- **Do** 优先呈现名称、正文与主要业务入口，完整保留课程、角色和资源标识。
- **Do** 为本地搜索、选中和展开提供可访问状态、数量反馈及清空入口。
- **Do** 在已识别页面的 `html[data-pku-prism='enabled']` 范围内改造；移动原生节点而不复制业务节点，停用恢复位置、属性和文本。
- **Do** 用真实 DOM 与构建产物核验布局；未知页保留原站，验证范围与环境限制写入验证记录。

### Don't:

- **Don't** 使用渐变、毛玻璃、装饰性 Emoji、重阴影、入场动画或新增动画。
- **Don't** 增加外部字体请求、联网依赖、React 或组件框架。
- **Don't** 以装饰性卡片、胶囊和文字截断削弱内容层级。
- **Don't** 从本地呈现推断未读、截止时间、提交或完成状态，不改写原生业务语义。
- **Don't** 修改原站 body class、覆盖原生事件或操作跨域 iframe；所有新增节点和监听器必须可清理。

### 依据与验收

[frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) 用于信息层级和截图自评；[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) 用于数据密集界面、对比度和响应式规则；[Impeccable](https://github.com/pbakaus/impeccable) 用于 Operate 工作界面原则与成组视觉核验。用户确认的中性色、本机 UI 字体、模块圆角和无动画约束优先于通用建议，不重复访谈。

在真实已登录页面对比原生与 Prism，覆盖首页、公告、教学内容 / 作业的浅深色及窄屏；检查水平溢出、长名称、元信息、焦点、原生菜单、启停清理、偏好同步与重复注入。运行 `npm run check`，并核对原生节点身份、链接、表单归属与停用后的完整恢复。未核验页面和环境限制写入验证记录，截图检查不能等同于全部业务回归。
