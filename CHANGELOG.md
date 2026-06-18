# Changelog

## [0.1.0] - 2026-06-18

### 新增

- **项目脚手架**：Vite 5 + Vue 3 + TypeScript 5 + Pinia + Vue Router 4 完整配置，含 ESLint、Prettier、EditorConfig
- **游戏内核模块**：
  - `types.ts` — 全部公共类型（Cell、Dir、SnakeState、Food、Island 等）与游戏常量
  - `constants.ts` — localStorage key 常量集中定义
  - `Rng.ts` — mulberry32 种子化随机数生成器
  - `Snake.ts` — 蛇身状态机（移动/转向/生长/撞身判定）
  - `Board.ts` — 棋盘边界判定与空格随机查找
  - `Food.ts` — 食物工厂（按权重生成 + 过期判定）
  - `EventBus.ts` — 类型安全事件总线（GameEvents：eat/die/start/pause/resume/tick）
  - `GameLoop.ts` — 固定步长更新 + RAF 渲染插值，支持暂停/恢复
  - `InputController.ts` — 键盘输入转方向指令（WASD/方向键/SpaceP/Esc/R）
- **单测覆盖**：50 个测试覆盖全部核心模块，含种子确定性、边界异常、状态机时序
- **Vue 层**：主入口装配、路由配置、极简 HomeView（标题+开始按钮）

### 技术债务

- `Snake.body` 使用数组 `unshift` 而非循环数组实现（≤30 节时性能可接受）
- 部分运行时常量暂留在 `types.ts` 中，后续可拆分到 `constants.ts`
