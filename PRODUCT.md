# PKU Prism

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

独立的 Tampermonkey UserScript，重设计北京大学教学网的课程、公告与教学内容工作界面。按日常学习任务组织导航与内容，保留原有业务功能。

## Operating Context

TypeScript + CSS + Vite；通过 Chrome DevTools MCP 观察用户已登录的真实教学网页面，开发与验证只进行阅读和本地视觉调整。

## Capabilities and Constraints

用户明确授权代理自主完成设计、技术选择、实现、调试与迭代，包括可逆 DOM 重组与局部自定义组件。表现层优先 CSS，支持随时禁用并恢复节点位置。不得绕过认证、读取或泄露凭证、提交作业、修改成绩或执行教学数据写入。未知页面先观察后适配。

## Brand Commitments

名称 PKU Prism。参考 Linear、shadcn/ui、Notion；中性色为主，北大红 #9E2533 点缀，支持浅深色、合理密度。避免渐变、毛玻璃、重阴影、装饰性 Emoji 和无意义动画。细节见 `docs/DESIGN.md`。

## Evidence on Hand

真实 DOM 观察见 `docs/research.md`，验证记录见 `docs/verification.md`。PKU-Art 只作实现参考，不复制其源码或资源。

## Product Principles

- 保留原站功能、内容、权限和导航。
- 通过信息层级与阅读节奏改善效率。
- 样式有范围，JavaScript 可清理，允许立即恢复原站。
- 真实页面与验证结果优先于推测。
