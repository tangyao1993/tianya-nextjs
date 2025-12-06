# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 16 的天涯论坛神帖展示网站，名为"天涯Next.js"。项目使用 React 19、TypeScript、Tailwind CSS v4，并集成了 LangChain 和 OpenAI API 提供AI伴读功能。

## 核心架构

### 技术栈
- **前端框架**: Next.js 16 (App Router)
- **UI库**: React 19 + TypeScript
- **样式**: Tailwind CSS v4 (使用 PostCSS 插件)
- **字体**: Geist Sans & Geist Mono (next/font)
- **AI集成**: LangChain + OpenAI API
- **构建工具**: Turbopack (已启用)

### 项目结构
```
app/                    # Next.js App Router 目录
  ├── layout.tsx       # 根布局文件，配置字体和元数据
  ├── page.tsx         # 主页面，包含完整的首页和详情页逻辑
  └── globals.css      # 全局样式文件，使用 Tailwind v4 语法
components/            # React 组件
  ├── Layout.tsx       # 页眉和页脚布局组件
  └── AIChat.tsx       # AI聊天弹窗组件，集成 LangChain
types/                 # TypeScript 类型定义
  └── index.ts         # 核心接口定义 (Post, ChatMessage, ViewState等)
data/                  # 数据文件
  └── posts.ts         # 模拟帖子数据 (MOCK_POSTS)
```

### 应用架构
- **单页应用**: 使用 `ViewState` 枚举管理视图状态 (HOME/DETAIL)
- **状态管理**: 使用 React hooks 进行本地状态管理
- **AI功能**: 通过 LangChain 调用 OpenAI GPT-3.5-turbo 模型
- **响应式设计**: 基于 Tailwind CSS 的移动优先设计

## 常用开发命令

### 开发环境
```bash
npm run dev          # 启动开发服务器 (localhost:3000)
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 运行 ESLint 检查
```

### 构建和部署
- 项目使用标准的 Next.js 构建流程
- 已配置 Turbopack 用于更快的开发构建
- 支持 Vercel 平台部署

## 开发注意事项

### 环境变量配置
AI功能需要配置以下环境变量：
```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### 路径别名
项目已配置路径别名：
- `@/*` 映射到项目根目录

### 样式系统
- 使用 Tailwind CSS v4 的 `@theme inline` 语法
- 自定义 CSS 变量用于主题切换 (支持暗色模式)
- 使用 Geist 字体作为主要字体

### TypeScript 配置
- 严格模式已启用
- 目标编译版本：ES2017
- 使用 Next.js 的增量编译功能

### AI功能限制
- 每日每位用户限3次AI提问
- 使用 LangChain 管理对话流
- 错误处理包含API配置检查

## 组件说明

### 主要组件
- **HomeView**: 首页展示帖子列表，支持分类筛选
- **DetailView**: 帖子详情页，包含AI聊天入口
- **CategoryBadge**: 分类标签组件，不同分类有不同颜色
- **AIChat**: AI聊天弹窗，集成LangChain和OpenAI

### 数据流
1. 用户在首页浏览帖子列表
2. 点击帖子进入详情页
3. 详情页可调用AI助手进行问答
4. AI助手基于帖子内容提供智能回答

## 代码风格
- 使用 TypeScript 严格模式
- React 函数组件 + hooks
- Tailwind CSS 原子类命名
- ESLint 配置基于 Next.js Core Web Vitals


## IMPORTANT: Sound Notification

After finishing responding to my request or running a command, run this command to notify me by sound:

```bash
afplay /System/Library/Sounds/Funk.aiff
```