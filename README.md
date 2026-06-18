# 动森贪吃蛇

一款基于 Web、单机运行、采用《集合啦！动物森友会》视觉风格的贪吃蛇游戏。

## 技术栈

- **框架**：Vue 3 + TypeScript + `<script setup>`
- **构建**：Vite 5
- **UI 库**：animal-island-vue
- **渲染**：Canvas 2D（游戏区）+ Vue 组件（HUD/菜单）
- **状态**：Pinia
- **路由**：Vue Router 4
- **测试**：Vitest
- **包管理**：pnpm

## 快速开始

```bash
pnpm install
pnpm dev
```

浏览器打开 `http://localhost:5173/` 即可看到主菜单。

## 脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm test` | 运行单测 |
| `pnpm typecheck` | 类型检查 |
| `pnpm lint` | ESLint 检查 |

## 项目结构

```
src/
├── game/               # 纯 TS 游戏内核（无 Vue 依赖）
│   ├── core/           # Snake、Board、Food、Rng、EventBus、GameLoop、InputController
│   ├── constants.ts    # 运行时常量
│   └── types.ts        # 公共类型定义
├── views/              # Vue 页面
├── router/             # 路由配置
├── stores/             # Pinia 状态管理
├── styles/             # 全局样式与设计 token
└── components/         # Vue 组件
```

## 阶段路线

- **阶段 1**：核心引擎可玩（当前）
- **阶段 2**：动森视觉化
- **阶段 3**：关卡与玩法深度
- **阶段 4**：移动端 + 音频
