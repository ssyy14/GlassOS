# GlassOS 玻璃特效个性化设置 — 设计文档

**日期:** 2026-06-29
**状态:** 已确认

## 概述

为 GlassOS 添加全面的玻璃特效个性化设置系统。扩展现有简单的三开关设置面板为手风琴式分类面板，通过 CSS 变量体系驱动所有视觉效果，支持实时调节与持久化。同时新增水面荡漾特效。

## CSS 变量架构

扩展现有 `:root` / `body.light-mode` 变量体系，新增以下 CSS 变量。所有变量通过 JS 动态写入 `document.documentElement.style`，实时驱动样式。

### 模糊强度组
- `--blur-bg` (默认: 80px) — 背景层模糊
- `--blur-window` (默认: 40px) — 窗口模糊
- `--blur-topbar` (默认: 30px) — 顶栏模糊
- `--blur-dock` (默认: 12px) — Dock 模糊

### 饱和度组
- `--saturate-bg` (默认: 200%) — 背景层饱和度
- `--saturate-window` (默认: 180%) — 窗口饱和度
- `--saturate-topbar` (默认: 160%) — 顶栏饱和度

### 玻璃厚度组
- `--glass-thickness` (默认: 0.05, 范围 0.02~0.15) — 窗口背景基础透明度

### 光球组
- `--orb-opacity` (默认: 1) — 光球总透明度（已存在，深色模式覆盖为 0.3）
- `--orb-size` (默认: 1, 范围 0.5~1.5) — 光球大小倍率
- `--orb-speed` (默认: 1, 范围 0.2~2) — 光球动画速度倍率
- `--orb1-color` 到 `--orb4-color` — 各光球颜色

### 鼠标特效组
- `--mouse-light-intensity` (默认: 0.04) — 鼠标跟随光强度
- `--mouse-glass-intensity` (默认: 0.02) — 鼠标玻璃扭曲强度

### 背景元素组
- `--caustic-opacity` (默认: 0.35) — 焦散波纹透明度
- `--streak-opacity` (默认: 0.5) — 光线扫描透明度
- `--glass-pulse` (默认: 1) — 玻璃面板呼吸动画开关
- `--vignette-opacity` (默认: 1) — 暗角强度
- `--grid-opacity` (默认: 0.5) — 网格线强度
- `--noise-opacity` (默认: 0.03) — 噪点强度

### 水面效果组
- `--water-surface` (默认: 0) — 桌面水面层开关
- `--ripple-multi` (默认: 1) — 多点涟漪开关
- `--wave-distort` (默认: 1) — 鼠标波浪扭曲开关
- `--edge-shimmer` (默认: 1) — 边缘流光开关

## 设置面板 UI

将现有 `openSettings()` 中的简单三开关布局替换为手风琴式折叠面板：

### 折叠分组
1. **外观** — 深色模式、动态壁纸、窗口启动动画
2. **玻璃特效** — 模糊强度（背景/窗口/顶栏滑块）、玻璃厚度滑块、色彩饱和度滑块、透明度开关
3. **光球设置** — 大小滑块、速度滑块、透明度滑块、四个颜色选择器
4. **鼠标特效** — 跟随光效开关+强度滑块、玻璃扭曲开关+强度滑块
5. **背景元素** — 焦散波纹、光线扫描、暗角、网格线、噪点（各含开关+强度滑块）
6. **水面效果** — 桌面水面层、多点涟漪、鼠标波浪、边缘流光（各含开关，部分有强度滑块）
7. **预设方案** — 清透/深邃/彩色/极简 四个按钮，点击一键切换
8. **关于** — 系统名称、版本、渲染引擎（保持不变）

### 交互行为
- 点击分组标题展开/收起
- 滑块使用 `input` 事件实时生效（直接改 CSS 变量）
- 所有设置变更即时写入 localStorage
- 预设方案按钮点击后批量写入所有变量并更新 UI 控件状态

## 数据流与持久化

```
滑块 input 事件
  → settings[key] = value
  → document.documentElement.style.setProperty(`--var-name`, value)
  → 所有使用 var(--var-name) 的 CSS 规则立即响应
  → localStorage.setItem('glassos_settings', JSON.stringify(allSettings))

页面加载
  → loadSettings()
  → 读取 localStorage['glassos_settings']
  → 合并默认值（处理新增键）
  → 逐项 setProperty 应用到 :root
  → 初始化水面效果 Canvas/SVG（如已开启）
```

### 预设方案实现
预设就是预定义的 settings 对象快照，点击时：
1. 遍历快照键值批量 setProperty
2. 更新 settings 对象
3. 写 localStorage
4. 刷新所有滑块/开关的 DOM 状态

## 水面效果实现

### 桌面水面层
- 创建一个全屏 `<canvas>` 元素，`pointer-events: none`, `z-index: 2`
- 使用 simplex noise 算法生成持续波动的纹理
- 以半透明叠加在背景层上方
- 受 `--water-surface` 变量控制显示/隐藏

### 多点涟漪
- 扩展现有 `.bg-ripple` 机制
- 点击桌面时创建 2-3 个同心圆元素
- 不同延迟（0s, 0.15s, 0.3s）和速度，模拟真实水滴
- 动画结束后自动移除 DOM 元素
- 受 `--ripple-multi` 控制：值为 0 时退回单圈涟漪

### 鼠标波浪扭曲
- 创建一个跟随鼠标的圆形区域 `<div>`
- 使用 CSS `backdrop-filter: blur()` + 轻微缩放变换
- 仅当鼠标移动时可见，停止后渐隐
- 受 `--wave-distort` 控制

### 窗口边缘流光
- 为 `.glass-window` 的 `::before` 伪元素添加 `conic-gradient`
- `@keyframes` 旋转动画实现流光沿边框流动
- 受 `--edge-shimmer` 控制，关闭时动画暂停、伪元素隐藏

## 涉及文件

| 文件 | 改动 |
|------|------|
| `styles.css` | 新增/扩展 CSS 变量，新增水面效果样式，将硬编码值替换为 var() 引用 |
| `renderer.js` | 重写 `openSettings()` 为手风琴面板，新增滑块/颜色选择器逻辑、预设方案、settings 读写 |
| `index.html` | 可能新增水面 Canvas 容器元素 |

## 不需要改动
- `main.js` — 纯渲染层改动，不需要主进程变更
- `preload.js` — 不需要新的 IPC 通道
- 现有应用（访达、终端等）— 不受影响

## 深色/浅色模式兼容

浅色模式下各 CSS 变量有独立的合理默认值，在 `body.light-mode` 块中定义。预设方案不区分深色/浅色 — 用户切换主题后桌面系统已有的变量覆盖机制自然生效。

当用户在浅色模式下选择预设时，预设只写非主题相关的变量（如模糊、光球颜色等），深色模式切换的变量（如 `--glass-bg`）保持由 CSS 主题控制。

## 预设方案定义

| 预设 | 特点 |
|------|------|
| **清透** | 低模糊(50%倍率)、高透明度、光球全开、水面开 |
| **深邃** | 高模糊(120%倍率)、低透明度、光球半开、暗角强 |
| **彩色** | 默认模糊、高饱和度(150%)、光球全开且颜色鲜艳 |
| **极简** | 低模糊、关闭光球、关闭水面、关闭鼠标特效 |
