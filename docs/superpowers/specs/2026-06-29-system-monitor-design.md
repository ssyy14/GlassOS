# GlassOS 系统监视器 — 设计文档

**日期:** 2026-06-29
**状态:** 已确认

## 概述

为 GlassOS 添加全功能系统监视器应用，展示 CPU、内存、磁盘、网络的实时使用情况，包含进度条和迷你历史曲线。

## 数据架构

### 主进程 (main.js)

扩展已有 `get-system-info` IPC handler，新增磁盘和网络数据：

- CPU: `os.cpus()` 计算使用率
- 内存: `os.totalmem()` / `os.freemem()`
- 磁盘: `exec('wmic logicaldisk get size,freespace,caption')` (Win) 或 `df -h` (Unix)
- 网络: `os.networkInterfaces()` 获取接口列表 + 速率估算（两次采样差值）
- 进程: `exec('tasklist')` (Win) 或 `ps aux` (Unix)

### 渲染进程 (renderer.js)

- `openMonitor()` 创建监视器窗口
- `setInterval` 每 1.5s 调用 `ipcRenderer.invoke('get-system-info')`
- 收到数据后更新 DOM：进度条宽度、百分比文字、颜色、历史曲线

## UI 布局

```
┌─────────────────────────────────────┐
│ ●  ●  ●       系统监视器        ×  │
├─────────────────────────────────────┤
│  CPU 卡片（进度条 + 核心数/进程 + 迷你曲线）│
│  内存卡片（进度条 + 已用/总计 GB）        │
│  磁盘卡片（每分区独立进度条）              │
│  网络卡片（上传/下载速率 + 接口名）        │
└─────────────────────────────────────┘
```

- 窗口大小: 480 × 520
- 每 1.5s 自动刷新
- 进度条颜色：< 60% 绿色，60-85% 黄色，> 85% 红色
- CPU 迷你历史曲线：Canvas 绘制最近 30 个采样点

## 涉及文件

| 文件 | 改动 |
|------|------|
| `main.js` | 扩展 `get-system-info` handler |
| `renderer.js` | `openMonitor()` + 实时刷新逻辑 |
| `styles.css` | 监视器卡片及进度条样式 |
| `index.html` | 桌面 + Dock + Launchpad + 右键菜单 添加入口 |

## 边界条件

- 磁盘列表动态生成（可能 C/D/E 多个分区）
- 网络速率首次为 0（需要两次采样才能计算）
- 关闭窗口时清除定时器
- 多个监视器窗口可以同时打开（每个独立定时器）
