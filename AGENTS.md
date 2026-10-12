# PKU Prism 工作约定

这是独立的 TypeScript + CSS + Vite Tampermonkey UserScript 项目。

- 用户用自然语言提出需求与评价视觉效果；代理自主完成实现选择、页面分析、编码、调试和测试。
- 修改页面样式前，使用 Chrome DevTools MCP 检查真实 DOM；已确认的结构见 `docs/research.md`。不要猜测未检查页面的选择器。
- 用户已要求真正的 UI/UX Redesign：按任务重组信息架构，可移动原生 DOM 与增加局部组件；表现层仍优先 CSS。样式限定在 `html[data-pku-prism='enabled']` 与对应页面标记下；保留原站节点身份、链接、表单归属、权限和事件。
- 保留随时停用与完整清理能力。新增 JavaScript 必须有清理逻辑，重复注入不能产生重复节点或监听器。
- 不绕过认证，不读取或导出 cookie、token、认证存储或隐藏表单值，不提交作业、修改成绩或执行课程数据写入。
- 截图用于视觉核验，个人调试资料放在已忽略的 `.local/`。文档只记录去除个人信息的结构与结果。
- 运行 `npm run check`。修改运行时后，使用构建产物在实际页面进行 MCP 验证与截图检查；可复用 `scripts/browser-smoke.js`。
- 视觉规范以 `docs/DESIGN.md` 为准：中性色 Dashboard、北大红 #9E2533、浅深色、紧凑层级；无渐变、毛玻璃、重阴影、装饰性 Emoji 或新增动画。用户已授权自主实现细节，不重复询问方向。
- 网络、端口或扩展安装未完成的验证应如实记录，区分 MCP 临时注入与 Tampermonkey 持久安装。
- PKU-Art 仅作实现参考，源码和资源未复制。保持项目简洁，不默认增加框架、全页观察器或联网依赖。
