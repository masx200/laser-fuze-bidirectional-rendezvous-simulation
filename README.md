# 激光引信双向交会仿真系统

一个基于 React + Three.js 的 3D 可视化仿真项目,用于模拟激光引信的双向交会过程。

## 项目简介

本项目实现了一个激光引信双向交会仿真系统,通过 3D 可视化展示目标追踪和激光引信交会的全过程。系统提供了直观的 3D 场景展示,包含目标物体、追踪器以及激光束的实时渲染。

## 技术栈

- **React 19.2.3** - 前端框架
- **Three.js 0.182.0** - 3D 图形库
- **TypeScript** - 类型安全的开发体验
- **Vite 6.2.0** - 现代化的构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架

## 功能特性

- 🎯 实时 3D 场景渲染
- 🚀 目标追踪模拟
- 🔦 激光束可视化
- 🎮 交互式场景控制(旋转、缩放、平移)
- 📊 实时数据监控
- 💫 流畅的动画效果
- 🎨 CRT 风格的视觉效果

## 快速开始

### 环境要求

- Node.js (推荐 18.x 或更高版本)
- npm 或 pnpm

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 配置环境变量

在项目根目录创建 `.env.local` 文件,并配置:

```env
GEMINI_API_KEY=your_api_key_here
```

### 运行开发服务器

```bash
npm run dev
# 或
pnpm dev
```

访问 `http://localhost:5173` 查看应用。

### 构建生产版本

```bash
npm run build
# 或
pnpm build
```

### 预览生产构建

```bash
npm run preview
# 或
pnpm preview
```

## 项目结构

```
激光引信双向交会仿真/
├── index.html          # HTML 入口文件
├── index.tsx           # React 应用主组件
├── index.css           # 全局样式
├── package.json        # 项目依赖配置
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 构建配置
├── .env.local          # 环境变量配置
└── README.md           # 项目说明文档
```

## 使用说明

1. **场景导航**
   - 左键拖拽:旋转视角
   - 右键拖拽:平移视角
   - 滚轮:缩放场景

2. **交互功能**
   - 实时查看 3D 仿真场景
   - 监控目标追踪数据
   - 观察激光交会过程

## 开发说明

### 添加新功能

1. 在 `index.tsx` 中修改或添加新的 React 组件
2. 使用 Three.js API 创建新的 3D 对象或效果
3. 通过 Tailwind CSS 快速构建 UI

### 自定义配置

- **Vite 配置**: 修改 `vite.config.ts`
- **TypeScript 配置**: 修改 `tsconfig.json`
- **样式定制**: 修改 `index.css` 或组件内的 Tailwind 类名

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

建议使用最新版本的浏览器以获得最佳性能和体验。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request!

## 联系方式

如有问题或建议,请通过 GitHub Issues 联系。

---

**项目链接**: [https://github.com/masx200/laser-fuze-bidirectional-rendezvous-simulation](https://github.com/masx200/laser-fuze-bidirectional-rendezvous-simulation)
