# GlassOS 浏览器应用 — 设计文档

**日期:** 2026-06-29
**状态:** 已确认

## 概述

为 GlassOS 添加一个完整的多标签页浏览器应用，使用 Electron `<webview>` 标签实现 Chromium 内核级浏览体验。

## 技术架构

- **渲染引擎:** Electron `<webview>` 标签（Chromium 完整内核）
- **启用方式:** `main.js` 中 `webPreferences.webviewTag: true`
- **无需新依赖**，纯 HTML/CSS/JS + webview

### 架构图

```
main.js (主进程)
├── webviewTag: true
└── open-external IPC (已有，浏览器也用)

renderer.js
├── openBrowser() — 创建浏览器窗口
├── TabManager — 标签页管理（新建/关闭/切换）
├── BookmarkManager — 书签增删查（localStorage）
└── HomePanel — 新标签页首页面板

index.html
└── 桌面图标 + Dock 入口

styles.css
└── 浏览器 UI 玻璃风格样式
```

## UI 布局

```
┌─────────────────────────────────────┐
│ ●  ●  ●       GlassOS 浏览器    ×  │  窗口标题栏
├─────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐  [+]     │  标签栏
│ │ 🏠 新标签 │ │ 📰 页面2  │        │
│ └──────────┘ └──────────┘          │
├─────────────────────────────────────┤
│ ◀ ▶ ↻  │ [🔒 https://example.com] │  导航栏
├─────────────────────────────────────┤
│ ★ GitHub  B站  Google 百度 ... │  书签栏（可收起）
├─────────────────────────────────────┤
│                                     │
│         <webview> 内容区            │  网页渲染区
│                                     │
└─────────────────────────────────────┘
```

### 组件说明

**标签栏:**
- 每个标签页显示网站标题（从 webview 的 `page-title-updated` 事件获取）
- 点击标签切换活跃页面
- 关闭按钮移除标签和对应 webview
- 最多同时打开 10 个标签页（超过提示关闭旧的）
- `[+]` 按钮新建标签

**导航栏:**
- `◀` `▶` 前进/后退（调用 webview.goBack/goForward）
- `↻` 刷新（调用 webview.reload）
- 地址栏输入 URL 后回车跳转（自动补全 `https://`）
- 地址栏实时更新（监听 webview 的 `page-title-updated` 和 `did-navigate` 事件）

**书签栏:**
- `★` 按钮展开/收起书签栏
- 书签项显示网站名，点击在当前标签打开
- 地址栏右侧 `☆` 按钮添加/移除当前页到书签
- 右键书签项可删除
- 数据持久化到 `localStorage['glassos_bookmarks']`

**新标签页（首页面板）:**
- 不加载 webview，仅渲染 DOM
- 预设常用网站卡片：Google、GitHub、Bilibili、百度
- 一个大搜索框，输入关键词 → Google 搜索
- 用户可自定义添加卡片（URL + 标题）

## 数据流

### 标签管理
```
用户点击[+] → TabManager.create()
  → 创建 <webview> 元素，设置 src
  → 添加到 window.__tabs[] 数组
  → 渲染标签栏 UI

用户点击标签 → TabManager.switchTo(id)
  → tabs[id].webview.style.display = ''
  → 其他 webview.style.display = 'none'
  → 更新地址栏内容
  → 高亮活跃标签

用户关闭标签 → TabManager.close(id)
  → 移除 webview DOM
  → tabs.splice(id, 1)
  → 切换到相邻标签
  → 更新标签栏 UI
```

### 书签持久化
```
添加书签 → bookmarks.push({title, url})
  → localStorage.setItem('glassos_bookmarks', JSON.stringify(bookmarks))
  → 更新书签栏 DOM

删除书签 → bookmarks.splice(index, 1)
  → localStorage 更新
  → 更新书签栏 DOM

加载书签 → JSON.parse(localStorage.getItem('glassos_bookmarks') || '[]')
  → 渲染书签栏
```

### 地址栏导航
```
用户输入 URL + 回车
  → 自动补全 https://（如无协议）
  → 当前活跃 webview.loadURL(url)
  → webview 'did-start-loading' → 地址栏显示加载中
  → webview 'did-finish-load' → 更新地址栏、更新标签标题
```

## 涉及文件

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `main.js` | 小改 | 加 `webviewTag: true` |
| `index.html` | 小改 | 桌面+Dock 加浏览器图标入口 |
| `renderer.js` | 新增函数 | `openBrowser()` + TabManager + BookmarkManager + HomePanel |
| `styles.css` | 新增样式 | 浏览器 UI 组件样式（标签、地址栏、书签栏、首页卡片） |

## webview 安全注意事项

- webview 运行在独立渲染进程，与主应用隔离
- 设置 `nodeintegration="false"` 防止注入
- 不暴露 `preload` 到 webview
- 外部链接仍走 `shell.openExternal`（如需要）
- 仅允许 HTTPS 导航（可选加强）

## 边界条件

- 最多 10 个标签页，超出时提示用户
- 关闭最后一个标签页时不清除窗口（恢复到新标签页）
- webview 加载失败时显示错误提示
- 空地址栏回车不做任何导航
- 关闭浏览器窗口时清理所有 webview（防止内存泄漏）
