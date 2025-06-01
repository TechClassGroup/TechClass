# TechClass

欢迎使用 TechClass —— 您的智能课表管理与作业展示助手！

无论您是学生还是教师，Techclass
都将为您提供高效、便捷的课程管理体验。通过简洁直观的编辑界面，您可以快速生成个性化课表，轻松设置课程时间、内容及任课老师信息。支持按天、周、月、年多种模式编辑，满足不同需求。独特的单双周区分功能，让您的课程安排一目了然。

不仅如此，Techclass 还能帮助您展示作业、查看老师信息及重要通知，确保您不错过任何关键内容。界面设计简洁大方，采用可移动布局，您可以根据个人喜好自由搭建专属界面，打造最适合自己的展示环境。

项目尚未开发完善，欢迎实时跟进进度~  
可以加入 Q 群 -> 637116921 <-

## 特性

- 智能课表管理：支持按天、周、月、年模式编辑及单双周区分
- 作业与通知展示：集中查看作业、教师信息及重要通知
- 可定制界面：自由拖拽布局，自定义主题与深色模式
- 多平台支持：同时提供 Web 与桌面 (Tauri) 版本

## 技术栈

- Vue 3 + TypeScript + Vite
- Tailwind CSS
- Pinia 状态管理
- Tauri (Rust) 桌面应用
- VuePress Theme Hope 文档站点

## 目录结构

```text
.
├─ App/            前端应用 (Vue + Tauri)
├─ docs/           文档 (VuePress)
├─ LICENSE         许可证说明
├─ README.md       项目说明
└─ ...             其他配置和脚本
```

## 安装与运行

### 前提条件

- Node.js v16+
- pnpm 包管理器
- Rust 工具链（用于 Tauri 构建）

### 本地开发

```bash
# 安装根依赖
pnpm install

# 启动 Web 应用
pnpm --filter App dev

# 启动桌面应用
pnpm --filter App tauri dev

# 本地预览文档
pnpm docs:dev
```

### 构建与发布

```bash
# 构建 Web 应用
pnpm --filter App build

# 构建桌面应用
pnpm --filter App tauri build

# 构建文档站点
pnpm docs:build
```

## 贡献

欢迎提交 Issue 和 Pull Request，一起完善 TechClass！

## License

GPL v3