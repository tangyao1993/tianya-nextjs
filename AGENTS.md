# Repository Guidelines

简明协作指引，适用于本仓库（Next.js 16 + TypeScript + Tailwind 4）。请在提交前依次确认结构、命令、风格与合规性。

## 项目结构与模块
- `app/`: App Router 入口，`page.tsx` 为主界面，`layout.tsx` 定义全局布局，`globals.css` 存放全局样式与 Tailwind 重置。
- `components/`: 共享组件（如 `AIChat.tsx`、`Layout.tsx`），保持无状态 UI 与清晰属性定义。
- `data/`: 模拟数据源（`posts.ts`），修改后注意与类型同步。
- `types/`: TypeScript 类型定义（`@/*` 路径别名指向仓库根目录）。
- `public/`: 静态资源；`tiezi/` 为大体积离线资源，请勿随意改动或提交。

## 构建、开发与测试命令
- `npm install`: 安装依赖（Node 18+ 推荐）。
- `npm run dev`: 本地开发，默认端口 3000。
- `npm run build`: 生产构建，需通过以便部署。
- `npm start`: 预览生产包。
- `npm run lint`: 运行 ESLint（基于 `eslint-config-next`），提交前必跑。

## 编码风格与命名约定
- TypeScript 严格模式开启；保持函数式组件、显式 props 类型、最小状态。
- 缩进 2 空格，使用单引号与分号；优先解构，避免魔法数字。
- 组件文件与导出的组件名使用帕斯卡命名，工具/钩子使用驼峰；Tailwind 类按布局→尺寸→色彩排序，复用样式请抽取组件或常量。
- 环境变量通过 `NEXT_PUBLIC_OPENAI_API_KEY` 提供给 LangChain/AIChat，放入 `.env.local`，勿提交。

## 测试与验证
- 目前未集成自动化测试；新增核心逻辑时至少补充手动验证步骤（主要用户流、AI 调用、导航）。
- 如需添加测试，建议采用 React Testing Library + Vitest（未安装），命名 `*.test.tsx`，放置于同目录或 `__tests__/`。
- 提交前确保 `npm run lint` 和生产构建通过，检查 UI 关键路径在桌面/移动端的表现。

## 提交与 Pull Request
- 提交信息建议使用祈使句英文或简洁中文，如 `feat: add AI chat throttle`、`fix: adjust layout padding`。
- PR 描述包含变更摘要、动机/相关 Issue、验证方式（命令与截图/录屏，如有 UI 改动），标注潜在风险或待办。
- 避免将大文件或私密配置（`.env*`、数据导出原件）纳入版本控制，必要时更新 `.gitignore`。

## 安全与配置提示
- 秘钥统一放 `.env.local`，在 Vercel/自建部署时对应设置环境变量；本地请确认未泄露至日志或客户端响应。
- 引入新依赖需关注浏览器侧包体积与 tree-shaking 情况，优先选择 ESM 且支持 Next.js 的库。
- 对 `tiezi/` 等大体积资源保持只读，避免误删或强制压缩；若需新增数据，请事先讨论存储与加载策略。
