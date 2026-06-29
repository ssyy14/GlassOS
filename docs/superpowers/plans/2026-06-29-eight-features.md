# GlassOS 八大功能增强 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 GlassOS 液态玻璃桌面系统新增启动台、深色模式、通知中心、壁纸切换、窗口分屏、音乐播放器、回收站、右键菜单增强等 8 个功能，全部保持毛玻璃主题。

**Architecture:** 纯前端实现（HTML/CSS/JS），新增 DOM 结构到 index.html，样式到 styles.css，逻辑到 renderer.js，音频引擎独立为 player.js。深色模式使用 CSS 变量切换，其余功能复用现有 `createWindow` / Dock / 桌面图标体系。

**Tech Stack:** Electron + 原生 HTML/CSS/JS（无框架）

---

## 文件改动清单

| 文件 | 改动类型 | 职责 |
|------|---------|------|
| `index.html` | 修改 | 新增 Launchpad 覆盖层、通知面板、回收站图标 |
| `styles.css` | 修改 | 新增全部组件样式 + CSS 变量主题系统 |
| `renderer.js` | 修改 | 新增全部应用逻辑 |
| `player.js` | 新建 | Web Audio API 音乐引擎 |

---

### Task 1: 回收站

**文件:**
- 修改: `index.html`（桌面图标区）
- 修改: `styles.css`
- 修改: `renderer.js`

- [ ] **Step 1: 在 index.html 桌面图标区新增回收站图标**

在 `desktopIcons` div 末尾，dock 之前添加：
```html
<div class="desktop-icon trash-icon" id="trashIcon" data-app="trash" ondblclick="openTrash()">
  <div class="desktop-icon-img" id="trashIconImg">🗑️</div>
  <div class="desktop-icon-label">回收站</div>
</div>
```

- [ ] **Step 2: 在 styles.css 添加回收站样式**

```css
/* ========== 回收站 ========== */
.trash-icon {
  position: fixed !important;
  bottom: 100px;
  right: 24px;
}
.trash-window .trash-list {
  height: 100%;
  overflow-y: auto;
  padding: 8px;
}
.trash-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  margin: 3px 0;
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  cursor: default;
}
.trash-item:hover { background: rgba(255,255,255,0.06); }
.trash-restore-btn {
  background: rgba(88,166,255,0.2);
  border: 1px solid rgba(88,166,255,0.3);
  color: #58a6ff;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 6px;
}
.trash-restore-btn:hover { background: rgba(88,166,255,0.35); }
```

- [ ] **Step 3: 在 renderer.js 添加回收站逻辑**

在 `openApp` 的 switch 中新增 case，并在文件末尾添加函数：

```javascript
// 在 openApp 的 switch 中：
case 'trash': openTrash(); break;

// 回收站数据存储
window._trashItems = JSON.parse(localStorage.getItem('glassos_trash') || '[]')

function saveTrash() {
  localStorage.setItem('glassos_trash', JSON.stringify(window._trashItems))
}

function openTrash() {
  const items = window._trashItems
  const listHtml = items.length === 0
    ? '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.25);font-size:14px">回收站为空</div>'
    : items.map((item, i) => `
      <div class="trash-item">
        <span>${item.icon} ${item.label}</span>
        <div>
          <button class="trash-restore-btn" onclick="restoreTrashItem(${i})">还原</button>
        </div>
      </div>`).join('')

  const content = `<div class="trash-list">${listHtml}</div>`
  createWindow('trash', '回收站', 400, 380, content)

  window.restoreTrashItem = (i) => {
    const item = window._trashItems[i]
    if (!item) return
    // 还原：重新创建桌面图标
    const desktopIcons = document.getElementById('desktopIcons')
    const div = document.createElement('div')
    div.className = 'desktop-icon'
    div.dataset.app = item.appId
    div.ondblclick = () => openApp(item.appId)
    div.innerHTML = `<div class="desktop-icon-img">${item.icon}</div><div class="desktop-icon-label">${item.label}</div>`
    desktopIcons.appendChild(div)
    // 从回收站移除
    window._trashItems.splice(i, 1)
    saveTrash()
    closeWindow('trash')
    openTrash()
    updateTrashIcon()
  }

  // 清空按钮
  if (items.length > 0) {
    const winEl = document.getElementById('win-trash')
    if (winEl) {
      const body = winEl.querySelector('.win-body')
      const clearBtn = document.createElement('button')
      clearBtn.textContent = '清空回收站'
      clearBtn.style.cssText = 'position:absolute;bottom:12px;right:12px;background:rgba(255,95,87,0.2);border:1px solid rgba(255,95,87,0.3);color:#ff5f57;border-radius:8px;padding:6px 16px;font-size:12px;cursor:pointer;'
      clearBtn.onclick = () => {
        window._trashItems = []
        saveTrash()
        closeWindow('trash')
        openTrash()
        updateTrashIcon()
      }
      body.appendChild(clearBtn)
    }
  }
}

function moveToTrash(appId) {
  const icon = document.querySelector(`.desktop-icon[data-app="${appId}"]`)
  if (!icon) return
  const label = icon.querySelector('.desktop-icon-label')?.textContent || appId
  const img = icon.querySelector('.desktop-icon-img')?.textContent || '📄'
  window._trashItems.push({ appId, label, icon: img })
  saveTrash()
  icon.remove()
  updateTrashIcon()
}

function updateTrashIcon() {
  const icon = document.getElementById('trashIconImg')
  if (icon) {
    icon.textContent = window._trashItems.length > 0 ? '🗑️' : '🗑️'
    icon.style.opacity = window._trashItems.length > 0 ? '1' : '0.6'
  }
}

// 初始化
updateTrashIcon()
```

- [ ] **Step 4: 修改删除快捷方式的右键菜单，改为移入回收站**

找到右键菜单中的 `{ label: '删除快捷方式', ... action: () => icon.remove() }`，改为：

```javascript
{ label: '移入回收站', icon: '🗑', action: () => moveToTrash(appName) },
```

---

### Task 2: CSS 变量主题系统 + 深色/浅色模式

**文件:**
- 修改: `styles.css`
- 修改: `renderer.js`
- 修改: `index.html`（顶栏图标）

- [ ] **Step 1: 在 styles.css 开头定义 CSS 变量（深色默认）**

在 `* { margin: 0; ... }` 之后、`body { ... }` 之前插入：

```css
:root {
  --bg-primary: #050508;
  --bg-desktop: linear-gradient(160deg, rgba(15,15,25,0.9) 0%, rgba(10,10,18,0.95) 100%);
  --glass-bg: rgba(255,255,255,0.05);
  --glass-border: rgba(255,255,255,0.1);
  --glass-highlight: rgba(255,255,255,0.08);
  --glass-glow: rgba(255,255,255,0.04);
  --text-primary: rgba(255,255,255,0.9);
  --text-secondary: rgba(255,255,255,0.6);
  --text-muted: rgba(255,255,255,0.35);
  --topbar-bg: rgba(255,255,255,0.04);
  --dock-bg: rgba(255,255,255,0.04);
  --win-bg: rgba(255,255,255,0.05);
  --win-shadow: 0 20px 60px rgba(0,0,0,0.4);
  --win-shadow-focused: 0 25px 70px rgba(0,0,0,0.5);
  --input-bg: rgba(0,0,0,0.3);
  --input-border: rgba(255,255,255,0.08);
  --btn-bg: rgba(255,255,255,0.06);
  --btn-hover: rgba(255,255,255,0.12);
  --divider: rgba(255,255,255,0.06);
  --sidebar-border: rgba(255,255,255,0.06);
  --scrollbar-thumb: rgba(255,255,255,0.15);
  --orb-opacity: 1;
}
```

- [ ] **Step 2: 添加浅色模式变量覆盖**

```css
body.light-mode {
  --bg-primary: #f0f0f5;
  --bg-desktop: linear-gradient(160deg, rgba(240,240,248,0.9) 0%, rgba(230,230,240,0.95) 100%);
  --glass-bg: rgba(0,0,0,0.03);
  --glass-border: rgba(0,0,0,0.08);
  --glass-highlight: rgba(0,0,0,0.04);
  --glass-glow: rgba(0,0,0,0.02);
  --text-primary: rgba(0,0,0,0.85);
  --text-secondary: rgba(0,0,0,0.55);
  --text-muted: rgba(0,0,0,0.3);
  --topbar-bg: rgba(255,255,255,0.6);
  --dock-bg: rgba(255,255,255,0.5);
  --win-bg: rgba(255,255,255,0.4);
  --win-shadow: 0 20px 60px rgba(0,0,0,0.15);
  --win-shadow-focused: 0 25px 70px rgba(0,0,0,0.2);
  --input-bg: rgba(0,0,0,0.04);
  --input-border: rgba(0,0,0,0.1);
  --btn-bg: rgba(0,0,0,0.05);
  --btn-hover: rgba(0,0,0,0.1);
  --divider: rgba(0,0,0,0.06);
  --sidebar-border: rgba(0,0,0,0.06);
  --scrollbar-thumb: rgba(0,0,0,0.15);
  --orb-opacity: 0.3;
}
```

- [ ] **Step 3: 替换现有硬编码颜色为 CSS 变量**

将以下样式的颜色值替换为变量（批量替换）：

- `body { background: var(--bg-primary); color: var(--text-primary); }`
- `.bg-layer { background: var(--bg-desktop); }`
- `.glass-window { background: var(--win-bg); box-shadow: var(--win-shadow); }`
- `.glass-window.focused { box-shadow: var(--win-shadow-focused); }`
- `.dock { background: var(--dock-bg); }`
- `.topbar { background: var(--topbar-bg); }`
- `.desktop-icon-label { color: var(--text-primary); }`
- 所有 `rgba(255,255,255,0.xx)` 的 border，映射到 `var(--glass-border)`
- 所有 `rgba(255,255,255,0.0x)` 的 background，映射到 `var(--btn-bg)` / `var(--glass-highlight)`
- `.orb` 添加 `opacity: var(--orb-opacity);`
- `.bg-orbs .orb { opacity: var(--orb-opacity); }`

- [ ] **Step 4: 在 index.html 顶栏右侧添加主题切换按钮**

在顶栏右侧图标区（电池图标后面、菜单图标前面）添加：

```html
<span class="topbar-icon" id="themeToggle" title="切换主题" style="cursor:pointer">🌙</span>
```

- [ ] **Step 5: 在 renderer.js 添加主题切换逻辑**

```javascript
// 主题切换
const themeToggle = document.getElementById('themeToggle')
const savedTheme = localStorage.getItem('glassos_theme') || 'dark'
if (savedTheme === 'light') {
  document.body.classList.add('light-mode')
  if (themeToggle) themeToggle.textContent = '☀️'
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode')
    themeToggle.textContent = isLight ? '☀️' : '🌙'
    localStorage.setItem('glassos_theme', isLight ? 'light' : 'dark')
  })
}
```

- [ ] **Step 6: 让设置面板的「深色模式」开关与主题联动**

修改 `openSettings()` 中深色模式 toggle，让它的初始状态和点击行为真正切换主题：

找到 `toggle on` 部分，改为：
```javascript
`<div class="toggle ${document.body.classList.contains('light-mode') ? '' : 'on'}" onclick="toggleTheme(this)"></div>`

// 添加全局函数
window.toggleTheme = (el) => {
  el.classList.toggle('on')
  const isLight = !el.classList.contains('on')
  if (isLight) {
    document.body.classList.add('light-mode')
    themeToggle.textContent = '☀️'
    localStorage.setItem('glassos_theme', 'light')
  } else {
    document.body.classList.remove('light-mode')
    themeToggle.textContent = '🌙'
    localStorage.setItem('glassos_theme', 'dark')
  }
}
```

---

### Task 3: 启动台 (Launchpad)

**文件:**
- 修改: `index.html`
- 修改: `styles.css`
- 修改: `renderer.js`

- [ ] **Step 1: 在 index.html 的 desktop div 内部末尾（dock 之后）添加 Launchpad 覆盖层**

```html
<div class="launchpad-overlay" id="launchpad">
  <div class="launchpad-bg"></div>
  <div class="launchpad-content">
    <div class="launchpad-search">
      <span class="launchpad-search-icon">🔍</span>
      <input class="launchpad-search-input" id="launchpadSearch" placeholder="搜索应用..." autofocus>
    </div>
    <div class="launchpad-grid" id="launchpadGrid"></div>
  </div>
</div>
```

- [ ] **Step 2: 在 styles.css 添加 Launchpad 样式**

```css
/* ========== Launchpad ========== */
.launchpad-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: none;
  align-items: center;
  justify-content: center;
}
.launchpad-overlay.active {
  display: flex;
}
.launchpad-bg {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  animation: launchpadFadeIn 0.3s ease-out;
}
@keyframes launchpadFadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
.launchpad-content {
  position: relative;
  z-index: 1;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: launchpadContentIn 0.4s cubic-bezier(0.22,1,0.36,1);
}
@keyframes launchpadContentIn {
  0% { transform: scale(0.9) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.launchpad-search {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  padding: 12px 18px;
  gap: 12px;
}
.launchpad-search-icon {
  font-size: 18px;
  opacity: 0.6;
  flex-shrink: 0;
}
.launchpad-search-input {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 18px;
  outline: none;
  font-family: inherit;
}
.launchpad-search-input::placeholder {
  color: var(--text-muted);
}
.launchpad-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  overflow-y: auto;
  padding: 4px;
}
.launchpad-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  animation: appIconPop 0.4s cubic-bezier(0.34,1.56,0.64,1) backwards;
}
.launchpad-app:nth-child(1) { animation-delay: 0.02s; }
.launchpad-app:nth-child(2) { animation-delay: 0.04s; }
.launchpad-app:nth-child(3) { animation-delay: 0.06s; }
.launchpad-app:nth-child(4) { animation-delay: 0.08s; }
.launchpad-app:nth-child(5) { animation-delay: 0.10s; }
.launchpad-app:nth-child(6) { animation-delay: 0.12s; }
.launchpad-app:nth-child(7) { animation-delay: 0.14s; }
.launchpad-app:nth-child(8) { animation-delay: 0.16s; }
.launchpad-app:nth-child(9) { animation-delay: 0.18s; }
.launchpad-app:nth-child(10) { animation-delay: 0.20s; }
@keyframes appIconPop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.launchpad-app:hover {
  background: rgba(255,255,255,0.08);
}
.launchpad-app:active {
  transform: scale(0.92);
  background: rgba(255,255,255,0.12);
}
.launchpad-app-icon {
  font-size: 48px;
  line-height: 1;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
}
.launchpad-app-label {
  font-size: 12px;
  color: var(--text-primary);
  text-align: center;
}
.launchpad-app.hidden {
  display: none;
}
```

- [ ] **Step 3: 在 renderer.js 添加 Launchpad 逻辑**

```javascript
// ========== Launchpad ==========
const launchpadApps = [
  { id: 'finder', icon: '📁', label: '访达' },
  { id: 'terminal', icon: '💻', label: '终端' },
  { id: 'linux', icon: '🐧', label: 'Linux' },
  { id: 'ssh', icon: '🔒', label: 'SSH' },
  { id: 'notes', icon: '📝', label: '备忘录' },
  { id: 'calc', icon: '🧮', label: '计算器' },
  { id: 'weather', icon: '🌤️', label: '天气' },
  { id: 'settings', icon: '⚙️', label: '设置' },
  { id: 'trash', icon: '🗑️', label: '回收站' },
  { id: 'player', icon: '🎵', label: '音乐' },
]

function buildLaunchpadGrid(filter) {
  const grid = document.getElementById('launchpadGrid')
  if (!grid) return
  grid.innerHTML = ''
  const term = (filter || '').toLowerCase()
  const filtered = launchpadApps.filter(a =>
    !term || a.label.toLowerCase().includes(term) || a.id.toLowerCase().includes(term)
  )
  filtered.forEach((app, i) => {
    const div = document.createElement('div')
    div.className = 'launchpad-app'
    div.style.animationDelay = (i * 0.03) + 's'
    div.innerHTML = `<div class="launchpad-app-icon">${app.icon}</div><div class="launchpad-app-label">${app.label}</div>`
    div.addEventListener('click', () => {
      closeLaunchpad()
      openApp(app.id)
    })
    grid.appendChild(div)
  })
}

function openLaunchpad() {
  const lp = document.getElementById('launchpad')
  if (!lp) return
  lp.classList.add('active')
  buildLaunchpadGrid()
  setTimeout(() => {
    const inp = document.getElementById('launchpadSearch')
    if (inp) { inp.value = ''; inp.focus() }
  }, 100)
}

function closeLaunchpad() {
  const lp = document.getElementById('launchpad')
  if (lp) lp.classList.remove('active')
}

// 搜索过滤
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('launchpadSearch')
  if (searchInput) {
    searchInput.addEventListener('input', (e) => buildLaunchpadGrid(e.target.value))
  }
})
// 或者直接在 load 后绑定
setTimeout(() => {
  const si = document.getElementById('launchpadSearch')
  if (si) si.addEventListener('input', (e) => buildLaunchpadGrid(e.target.value))
}, 500)

// 点击背景关闭
document.addEventListener('click', (e) => {
  const lp = document.getElementById('launchpad')
  if (lp && lp.classList.contains('active') && e.target === lp) {
    closeLaunchpad()
  }
})
```

- [ ] **Step 4: 在 index.html 的 Dock 最左侧添加启动台图标**

在 dock div 内部最前面（dock-glow 之后）添加：

```html
<div class="dock-item launchpad-trigger" data-label="启动台" onclick="openLaunchpad()">
  <div class="dock-icon-glow"></div>
  <span>🧩</span>
  <div class="dock-dot"></div>
</div>
```

- [ ] **Step 5: 添加 F4 快捷键**

在 `document.addEventListener('keydown', ...)` 中：

```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const lp = document.getElementById('launchpad')
    if (lp && lp.classList.contains('active')) { closeLaunchpad(); return }
    if (activeWindow) closeWindow(activeWindow)
  }
  if (e.key === 'F4') {
    e.preventDefault()
    const lp = document.getElementById('launchpad')
    if (lp.classList.contains('active')) closeLaunchpad()
    else openLaunchpad()
  }
})
```

- [ ] **Step 6: 在 styles.css 中处理 light-mode 下的 Launchpad**

```css
body.light-mode .launchpad-bg {
  background: rgba(255,255,255,0.5);
}
body.light-mode .launchpad-app:hover {
  background: rgba(0,0,0,0.06);
}
```

---

### Task 4: 通知中心

**文件:**
- 修改: `index.html`
- 修改: `styles.css`
- 修改: `renderer.js`

- [ ] **Step 1: 在 index.html desktop div 末尾添加通知面板**

```html
<div class="notif-overlay" id="notifOverlay" onclick="closeNotifications()"></div>
<div class="notif-panel" id="notifPanel">
  <div class="notif-header">
    <span class="notif-title">通知中心</span>
    <button class="notif-clear" id="notifClear" onclick="clearNotifications()">清除全部</button>
  </div>
  <div class="notif-list" id="notifList">
    <div class="notif-empty">暂无通知</div>
  </div>
</div>
```

- [ ] **Step 2: 在 styles.css 添加通知中心样式**

```css
/* ========== 通知中心 ========== */
.notif-overlay {
  position: fixed;
  inset: 0;
  z-index: 8000;
  background: rgba(0,0,0,0.3);
  display: none;
}
.notif-overlay.active { display: block; }
.notif-panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 380px;
  height: 100vh;
  z-index: 8001;
  background: rgba(20,20,30,0.92);
  backdrop-filter: blur(50px) saturate(180%);
  -webkit-backdrop-filter: blur(50px) saturate(180%);
  border-left: 1px solid rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  transition: right 0.35s cubic-bezier(0.22,1,0.36,1);
  box-shadow: -10px 0 60px rgba(0,0,0,0.4);
}
.notif-panel.active { right: 0; }
.notif-panel::before {
  content: '';
  position: absolute;
  top: 0; bottom: 0; left: 0;
  width: 1px;
  background: linear-gradient(180deg, rgba(255,255,255,0.1), transparent 40%);
  pointer-events: none;
}
.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.notif-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.notif-clear {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
}
.notif-clear:hover { color: var(--text-secondary); }
.notif-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}
.notif-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  font-size: 14px;
}
.notif-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 8px;
  position: relative;
  animation: notifSlideIn 0.35s cubic-bezier(0.22,1,0.36,1);
  transition: all 0.3s;
}
@keyframes notifSlideIn {
  0% { transform: translateX(40px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
.notif-card.removing {
  transform: translateX(100px);
  opacity: 0;
}
.notif-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.notif-card-body {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}
.notif-card-time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 8px;
}
.notif-card-close {
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
}
.notif-card-close:hover { color: var(--text-primary); }
```

- [ ] **Step 3: 在 renderer.js 添加通知逻辑**

```javascript
// ========== 通知中心 ==========
const notifications = JSON.parse(localStorage.getItem('glassos_notifs') || '[]')

function addNotification(title, body) {
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  notifications.unshift({ title, body, time, id: Date.now() })
  if (notifications.length > 20) notifications.length = 20
  localStorage.setItem('glassos_notifs', JSON.stringify(notifications))
  renderNotifications()
}

function renderNotifications() {
  const list = document.getElementById('notifList')
  if (!list) return
  if (notifications.length === 0) {
    list.innerHTML = '<div class="notif-empty">暂无通知</div>'
    return
  }
  list.innerHTML = notifications.map((n, i) => `
    <div class="notif-card" id="notif-${n.id}">
      <button class="notif-card-close" onclick="dismissNotification(${n.id})">✕</button>
      <div class="notif-card-title">${escapeHtml(n.title)}</div>
      <div class="notif-card-body">${escapeHtml(n.body)}</div>
      <div class="notif-card-time">${n.time}</div>
    </div>`).join('')
}

function dismissNotification(id) {
  const card = document.getElementById('notif-' + id)
  if (card) {
    card.classList.add('removing')
    setTimeout(() => {
      const idx = notifications.findIndex(n => n.id === id)
      if (idx !== -1) { notifications.splice(idx, 1); localStorage.setItem('glassos_notifs', JSON.stringify(notifications)) }
      renderNotifications()
    }, 300)
  }
}

function clearNotifications() {
  notifications.length = 0
  localStorage.setItem('glassos_notifs', JSON.stringify(notifications))
  renderNotifications()
}

function toggleNotifications() {
  const panel = document.getElementById('notifPanel')
  const overlay = document.getElementById('notifOverlay')
  const isOpen = panel.classList.contains('active')
  if (isOpen) {
    panel.classList.remove('active')
    overlay.classList.remove('active')
  } else {
    renderNotifications()
    panel.classList.add('active')
    overlay.classList.add('active')
  }
}

function closeNotifications() {
  document.getElementById('notifPanel')?.classList.remove('active')
  document.getElementById('notifOverlay')?.classList.remove('active')
}

// 初始化
renderNotifications()
```

- [ ] **Step 4: 让顶栏时间区域可点击打开通知中心**

在 index.html 中修改：
```html
<div class="topbar-center" id="topbarTime" onclick="toggleNotifications()" style="cursor:pointer"></div>
```

- [ ] **Step 5: 在应用启动时发送欢迎通知**

在 renderer.js 初始化部分：
```javascript
// 首次启动发送欢迎通知
if (!localStorage.getItem('glassos_welcomed')) {
  setTimeout(() => addNotification('欢迎使用 GlassOS', '液态玻璃主题桌面系统已就绪，点击顶栏时间查看通知。'), 1500)
  localStorage.setItem('glassos_welcomed', '1')
}
```

---

### Task 5: 壁纸切换

**文件:**
- 修改: `styles.css`
- 修改: `renderer.js`

- [ ] **Step 1: 定义内置壁纸列表**

在 renderer.js 中添加：

```javascript
// ========== 壁纸 ==========
const builtinWallpapers = [
  { name: '深海', style: 'background: linear-gradient(160deg, #0c1445 0%, #1a0a2e 30%, #16213e 60%, #0a1628 100%)' },
  { name: '极光', style: 'background: linear-gradient(135deg, #0d1b2a 0%, #1b2838 25%, #1a3a2a 50%, #0d2137 75%, #1a1030 100%); background-size: 400% 400%; animation: wpAurora 20s ease infinite' },
  { name: '暮色', style: 'background: linear-gradient(180deg, #2d1b69 0%, #e84393 50%, #fdcb6e 100%)' },
  { name: '墨绿', style: 'background: linear-gradient(160deg, #0a0f0a 0%, #0d1f0d 30%, #1a2f1a 60%, #0a1a0a 100%)' },
  { name: '黑金', style: 'background: linear-gradient(135deg, #1a1a0a 0%, #0a0a05 30%, #1a1005 60%, #0a0a05 100%)' },
  { name: '纯黑', style: 'background: #050508' },
  { name: '晨曦', style: 'background: linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #533483 60%, #e94560 100%)' },
  { name: '冰川', style: 'background: linear-gradient(160deg, #0a1628 0%, #0d2137 30%, #1a3a4a 60%, #0d2137 100%)' },
]

// 应用壁纸
function applyWallpaper(wallpaper) {
  const bgLayer = document.querySelector('.bg-layer')
  if (!bgLayer) return
  // 移除旧的壁纸动画 keyframes（如果有）
  const oldStyle = document.getElementById('wallpaper-anim-style')
  if (oldStyle) oldStyle.remove()
  
  bgLayer.style.cssText = wallpaper.style
  
  // 如果是极光壁纸，需要注入动画
  if (wallpaper.name === '极光') {
    const style = document.createElement('style')
    style.id = 'wallpaper-anim-style'
    style.textContent = `@keyframes wpAurora {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }`
    document.head.appendChild(style)
    bgLayer.style.animation = 'wpAurora 20s ease infinite'
    bgLayer.style.backgroundSize = '400% 400%'
  }
  
  localStorage.setItem('glassos_wallpaper', JSON.stringify({ name: wallpaper.name, style: wallpaper.style }))
}

// 初始化壁纸
function initWallpaper() {
  const saved = localStorage.getItem('glassos_wallpaper')
  if (saved) {
    try {
      const wp = JSON.parse(saved)
      applyWallpaper(wp)
      return
    } catch(e) {}
  }
  // 默认深海
  applyWallpaper(builtinWallpapers[0])
}
```

- [ ] **Step 2: 创建壁纸选择器窗口**

```javascript
function openWallpaperPicker() {
  const grid = builtinWallpapers.map(wp => `
    <div class="wp-card" onclick="applyWallpaperByName('${wp.name}')" style="${wp.style};height:100px;border-radius:12px;cursor:pointer;transition:all 0.2s;border:2px solid transparent;position:relative;overflow:hidden">
      <div style="position:absolute;bottom:6px;left:10px;font-size:11px;color:white;text-shadow:0 1px 3px rgba(0,0,0,0.6)">${wp.name}</div>
    </div>`).join('')

  const content = `<div style="padding:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${grid}</div>`
  createWindow('wallpaper', '壁纸', 480, 380, content)

  window.applyWallpaperByName = (name) => {
    const wp = builtinWallpapers.find(w => w.name === name)
    if (wp) applyWallpaper(wp)
  }
}
```

- [ ] **Step 3: 添加到桌面右键菜单**

在右键菜单的 app 列表中加入壁纸选项：

```javascript
{ label: '更换壁纸', icon: '🖼️', action: () => openWallpaperPicker() },
```

- [ ] **Step 4: 在 styles.css 添加壁纸卡片样式**

```css
/* ========== 壁纸选择器 ========== */
.wp-card:hover {
  border-color: rgba(255,255,255,0.4) !important;
  transform: scale(1.03);
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
}
```

- [ ] **Step 5: 添加壁纸动画样式**

```css
@keyframes wpAurora {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

- [ ] **Step 6: 应用启动时初始化壁纸**

在 renderer.js 末尾调用：
```javascript
initWallpaper()
```

---

### Task 6: 窗口分屏

**文件:**
- 修改: `renderer.js`（拖拽逻辑）
- 修改: `styles.css`

- [ ] **Step 1: 在 styles.css 添加分屏预览和吸附效果**

```css
/* ========== 窗口分屏 ========== */
.glass-window.snap-preview-left {
  left: 0 !important;
  top: 36px !important;
  width: 50% !important;
  height: calc(100vh - 116px) !important;
  transition: all 0.25s cubic-bezier(0.22,1,0.36,1) !important;
}
.glass-window.snap-preview-right {
  left: 50% !important;
  top: 36px !important;
  width: 50% !important;
  height: calc(100vh - 116px) !important;
  transition: all 0.25s cubic-bezier(0.22,1,0.36,1) !important;
}
.glass-window.snapped-left {
  left: 0 !important;
  top: 36px !important;
  width: 50% !important;
  height: calc(100vh - 116px) !important;
}
.glass-window.snapped-right {
  left: 50% !important;
  top: 36px !important;
  width: 50% !important;
  height: calc(100vh - 116px) !important;
}
/* 拖拽时禁用 transition 避免干扰 */
.glass-window.dragging {
  transition: none !important;
}
```

- [ ] **Step 2: 修改 renderer.js 中的窗口拖拽逻辑**

修改 `setupDrag` 和 `mousemove` 处理：

```javascript
function setupDrag(win, id) {
  const titlebar = win.querySelector('.win-titlebar')
  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.win-btn')) return
    const rect = win.getBoundingClientRect()
    dragState = { id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top, startLeft: rect.left, startTop: rect.top, startWidth: rect.width, startHeight: rect.height }
    win.style.transition = 'none'
    win.classList.add('dragging')
  })
}

// 修改 mousemove 监听
// 找到现有的 document.addEventListener('mousemove', ...) 并替换为：
```

替换现有的 mousemove 监听器：

```javascript
document.addEventListener('mousemove', (e) => {
  if (!dragState) return
  const win = windows[dragState.id]?.el
  if (!win) return
  
  const newLeft = e.clientX - dragState.offsetX
  const newTop = e.clientY - dragState.offsetY
  
  // 分屏检测
  const edgeThreshold = 40
  win.classList.remove('snap-preview-left', 'snap-preview-right')
  
  if (newLeft < edgeThreshold && newTop < 100) {
    win.classList.add('snap-preview-left')
  } else if (newLeft + 100 > window.innerWidth - edgeThreshold && newTop < 100) {
    win.classList.add('snap-preview-right')
  }
  
  win.style.left = newLeft + 'px'
  win.style.top = Math.max(0, newTop) + 'px'
})
```

替换 mouseup 监听器：

```javascript
document.addEventListener('mouseup', () => {
  if (dragState) {
    const win = windows[dragState.id]?.el
    if (win) {
      const rect = win.getBoundingClientRect()
      const edgeThreshold = 40
      
      // 检查是否应该分屏吸附
      if (rect.left < edgeThreshold && rect.top < 100) {
        // 吸附到左半屏
        win.classList.remove('snap-preview-left', 'snap-preview-right', 'dragging')
        win.classList.add('snapped-left')
        win.style.transition = 'all 0.25s cubic-bezier(0.22,1,0.36,1)'
        win.dataset.prevLeft = dragState.startLeft + 'px'
        win.dataset.prevTop = dragState.startTop + 'px'
        win.dataset.prevWidth = dragState.startWidth + 'px'
        win.dataset.prevHeight = dragState.startHeight + 'px'
        win.dataset.maximized = 'false'
      } else if (rect.right > window.innerWidth - edgeThreshold && rect.top < 100) {
        // 吸附到右半屏
        win.classList.remove('snap-preview-left', 'snap-preview-right', 'dragging')
        win.classList.add('snapped-right')
        win.style.transition = 'all 0.25s cubic-bezier(0.22,1,0.36,1)'
        win.dataset.prevLeft = dragState.startLeft + 'px'
        win.dataset.prevTop = dragState.startTop + 'px'
        win.dataset.prevWidth = dragState.startWidth + 'px'
        win.dataset.prevHeight = dragState.startHeight + 'px'
        win.dataset.maximized = 'false'
      } else {
        win.classList.remove('dragging')
        win.style.transition = ''
        // 如果之前是 snapped 状态，拖走时恢复
        if (win.classList.contains('snapped-left') || win.classList.contains('snapped-right')) {
          win.classList.remove('snapped-left', 'snapped-right')
          if (win.dataset.prevLeft) win.style.left = win.dataset.prevLeft
          if (win.dataset.prevTop) win.style.top = win.dataset.prevTop
          if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth
          if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight
        }
      }
    }
    dragState = null
  }
})
```

- [ ] **Step 3: 添加分屏预览背景提示**

```css
.snap-zone-indicator {
  position: fixed;
  top: 36px;
  width: 50%;
  height: calc(100vh - 116px);
  z-index: 500;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  background: rgba(88,166,255,0.06);
  border: 1px dashed rgba(88,166,255,0.2);
  border-radius: 12px;
}
.snap-zone-indicator.left { left: 8px; }
.snap-zone-indicator.right { right: 8px; }
.snap-zone-indicator.visible { opacity: 1; }
```

后续：在 mousemove 中根据预览状态显示/隐藏指示器（可选优化，可省略以保持简洁）。

---

### Task 7: 音乐播放器

**文件:**
- 新建: `player.js`
- 修改: `renderer.js`
- 修改: `styles.css`
- 修改: `index.html`

- [ ] **Step 1: 创建 player.js — Web Audio API 音乐引擎**

```javascript
// ========== GlassOS Music Player Engine ==========
class GlassPlayer {
  constructor() {
    this.ctx = null
    this.playing = false
    this.currentTrack = 0
    this.volume = 0.5
    this._oscillators = []
    this._gainNode = null
    this._intervalId = null
  }

  _ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      this._gainNode = this.ctx.createGain()
      this._gainNode.gain.value = this.volume
      this._gainNode.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
  }

  // 简单旋律生成器
  _playMelody(notes, bpm) {
    this._ensureContext()
    this._stopAll()
    const beatDuration = 60 / bpm
    notes.forEach(({ freq, dur, start }) => {
      const osc = this.ctx.createOscillator()
      const env = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      env.gain.value = 0
      const t = this.ctx.currentTime + start * beatDuration
      env.gain.setValueAtTime(0, t)
      env.gain.linearRampToValueAtTime(0.15, t + 0.02)
      env.gain.linearRampToValueAtTime(0, t + dur * beatDuration - 0.02)
      osc.connect(env)
      env.connect(this._gainNode)
      osc.start(t)
      osc.stop(t + dur * beatDuration)
      this._oscillators.push(osc)
    })
  }

  _stopAll() {
    try { this._oscillators.forEach(o => o.stop()) } catch(e) {}
    this._oscillators = []
  }

  play() {
    const tracks = this._getTracks()
    if (!tracks[this.currentTrack]) return
    this.playing = true
    this._playMelody(tracks[this.currentTrack].notes, tracks[this.currentTrack].bpm)
  }

  pause() {
    this.playing = false
    this._stopAll()
  }

  next() {
    this.pause()
    const tracks = this._getTracks()
    this.currentTrack = (this.currentTrack + 1) % tracks.length
    if (this.playing || true) this.play()
  }

  prev() {
    this.pause()
    const tracks = this._getTracks()
    this.currentTrack = (this.currentTrack - 1 + tracks.length) % tracks.length
    this.play()
  }

  setVolume(v) {
    this.volume = v
    if (this._gainNode) this._gainNode.gain.value = v
  }

  _getTracks() {
    return [
      { name: '月光', artist: 'GlassOS', bpm: 120, notes: [
        { freq: 523, dur: 0.5, start: 0 }, { freq: 659, dur: 0.5, start: 0.5 },
        { freq: 784, dur: 0.5, start: 1 }, { freq: 659, dur: 0.5, start: 1.5 },
        { freq: 523, dur: 1, start: 2 },
      ]},
      { name: '星空', artist: 'GlassOS', bpm: 100, notes: [
        { freq: 440, dur: 0.5, start: 0 }, { freq: 554, dur: 0.5, start: 0.5 },
        { freq: 659, dur: 0.5, start: 1 }, { freq: 554, dur: 0.5, start: 1.5 },
        { freq: 440, dur: 0.5, start: 2 }, { freq: 330, dur: 0.5, start: 2.5 },
      ]},
      { name: '暗潮', artist: 'GlassOS', bpm: 140, notes: [
        { freq: 196, dur: 0.25, start: 0 }, { freq: 196, dur: 0.25, start: 0.25 },
        { freq: 220, dur: 0.25, start: 0.5 }, { freq: 196, dur: 0.25, start: 0.75 },
        { freq: 262, dur: 0.25, start: 1 }, { freq: 196, dur: 0.25, start: 1.25 },
      ]},
    ]
  }

  getCurrentTrack() {
    const tracks = this._getTracks()
    return tracks[this.currentTrack] || null
  }
}

// 导出全局实例
window.glassPlayer = new GlassPlayer()
```

- [ ] **Step 2: 在 index.html 的 script 标签中引用 player.js**

在 linux-simulator.js 之后：
```html
<script src="player.js"></script>
```

- [ ] **Step 3: 在 renderer.js 添加音乐播放器窗口**

```javascript
// 在 openApp 的 switch 中：
case 'player': openPlayer(); break;

function openPlayer() {
  const player = window.glassPlayer
  const track = player.getCurrentTrack()
  const trackName = track ? track.name : '未选择'
  const artist = track ? track.artist : ''
  const isPlaying = player.playing

  const content = `<div class="app-player">
    <div class="player-vinyl">
      <div class="player-disc ${isPlaying ? 'spinning' : ''}" id="playerDisc">
        <div class="player-disc-inner"></div>
      </div>
    </div>
    <div class="player-info">
      <div class="player-track" id="playerTrackName">${trackName}</div>
      <div class="player-artist">${artist}</div>
    </div>
    <div class="player-controls">
      <button class="player-btn" onclick="playerPrev()">⏮</button>
      <button class="player-btn player-btn-play" id="playerPlayBtn" onclick="playerTogglePlay()">${isPlaying ? '⏸' : '▶'}</button>
      <button class="player-btn" onclick="playerNext()">⏭</button>
    </div>
    <div class="player-volume">
      <span>🔈</span>
      <input type="range" class="player-volume-slider" id="playerVolume" min="0" max="100" value="${player.volume * 100}" oninput="playerSetVolume(this.value)">
    </div>
  </div>`
  createWindow('player', '音乐', 360, 480, content)

  // 绑定播放器控制
  window.playerTogglePlay = () => {
    const p = window.glassPlayer
    if (p.playing) { p.pause() } else { p.play() }
    updatePlayerUI()
  }
  window.playerNext = () => { window.glassPlayer.next(); updatePlayerUI() }
  window.playerPrev = () => { window.glassPlayer.prev(); updatePlayerUI() }
  window.playerSetVolume = (v) => { window.glassPlayer.setVolume(v / 100) }
}

function updatePlayerUI() {
  const p = window.glassPlayer
  const track = p.getCurrentTrack()
  const nameEl = document.getElementById('playerTrackName')
  const btnEl = document.getElementById('playerPlayBtn')
  const discEl = document.getElementById('playerDisc')
  if (nameEl) nameEl.textContent = track ? track.name : ''
  if (btnEl) btnEl.textContent = p.playing ? '⏸' : '▶'
  if (discEl) {
    if (p.playing) discEl.classList.add('spinning')
    else discEl.classList.remove('spinning')
  }
}
```

- [ ] **Step 4: 在 styles.css 添加音乐播放器样式**

```css
/* ========== 音乐播放器 ========== */
.app-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  height: 100%;
  gap: 20px;
}
.player-vinyl {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  border: 2px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
}
.player-disc {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #1a1a2e, #16213e, #1a1a2e, #0f3460, #1a1a2e);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}
.player-disc.spinning {
  animation: discSpin 3s linear infinite;
}
@keyframes discSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.player-disc-inner {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  border: 2px solid rgba(255,255,255,0.15);
}
.player-info {
  text-align: center;
}
.player-track {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.player-artist {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.player-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}
.player-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}
.player-btn:hover { background: rgba(255,255,255,0.12); }
.player-btn:active { transform: scale(0.9); }
.player-btn-play {
  width: 56px;
  height: 56px;
  font-size: 22px;
  background: rgba(88,166,255,0.2);
  border-color: rgba(88,166,255,0.3);
}
.player-btn-play:hover { background: rgba(88,166,255,0.35); }
.player-volume {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0 20px;
}
.player-volume-slider {
  flex: 1;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: rgba(255,255,255,0.1);
  outline: none;
}
.player-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}
```

- [ ] **Step 5: 添加音乐桌面图标和 Dock 图标**

在 index.html 桌面图标区：
```html
<div class="desktop-icon" data-app="player" ondblclick="openApp('player')">
  <div class="desktop-icon-img">🎵</div>
  <div class="desktop-icon-label">音乐</div>
</div>
```

在 Dock（回收站和设置之间）：
```html
<div class="dock-item" data-app="player" data-label="音乐" onclick="openApp('player')">
  <div class="dock-icon-glow"></div>
  <span>🎵</span>
  <div class="dock-dot"></div>
</div>
```

---

### Task 8: 右键菜单增强

**文件:**
- 修改: `renderer.js`

- [ ] **Step 1: 增强桌面右键菜单**

找到桌面右键菜单 items 数组，替换为：

```javascript
const apps = [
  { id: 'finder', icon: '📁', label: '访达' },
  { id: 'terminal', icon: '💻', label: '终端' },
  { id: 'linux', icon: '🐧', label: 'Linux' },
  { id: 'ssh', icon: '🔐', label: 'SSH' },
  { id: 'notes', icon: '📝', label: '备忘录' },
  { id: 'calc', icon: '🧮', label: '计算器' },
  { id: 'weather', icon: '🌤', label: '天气' },
  { id: 'settings', icon: '⚙', label: '设置' },
  { id: 'player', icon: '🎵', label: '音乐' },
]

// 新建快捷方式子菜单
const available = apps.filter(a => {
  const existing = document.querySelectorAll('.desktop-icon')
  return ![...existing].some(i => i.dataset.app === a.id)
})

const shortcutItems = available.map(app => ({
  label: app.label,
  icon: app.icon,
  action: () => {
    const desktopIcons = document.getElementById('desktopIcons')
    const div = document.createElement('div')
    div.className = 'desktop-icon'
    div.dataset.app = app.id
    div.ondblclick = () => openApp(app.id)
    div.innerHTML = `<div class="desktop-icon-img">${app.icon}</div><div class="desktop-icon-label">${app.label}</div>`
    desktopIcons.appendChild(div)
    // 绑定事件
    bindDesktopIconEvents(div)
  }
}))

const items = [
  { label: '新建快捷方式', icon: '➕', children: shortcutItems.length > 0 ? shortcutItems : null, action: shortcutItems.length > 0 ? null : () => {} },
  null,
  { label: '新建文件夹', icon: '📁', action: () => {
    const desktopIcons = document.getElementById('desktopIcons')
    const div = document.createElement('div')
    div.className = 'desktop-icon'
    div.dataset.app = 'folder_' + Date.now()
    div.innerHTML = `<div class="desktop-icon-img">📁</div><div class="desktop-icon-label">新建文件夹</div>`
    div.ondblclick = () => {} // 文件夹暂不可打开
    desktopIcons.appendChild(div)
    bindDesktopIconEvents(div)
  }},
  { label: '新建文件', icon: '📄', action: () => {
    const desktopIcons = document.getElementById('desktopIcons')
    const div = document.createElement('div')
    div.className = 'desktop-icon'
    div.dataset.app = 'file_' + Date.now()
    div.innerHTML = `<div class="desktop-icon-img">📄</div><div class="desktop-icon-label">新建文件</div>`
    div.ondblclick = () => {}
    desktopIcons.appendChild(div)
    bindDesktopIconEvents(div)
  }},
  null,
  { label: '更换壁纸', icon: '🖼️', action: () => openWallpaperPicker() },
  { label: '排序方式', icon: '📋', action: () => sortDesktopIcons() },
  null,
  { label: '刷新', icon: '🔄', action: () => location.reload() },
  null,
  { label: '最小化所有窗口', icon: '🗕', action: () => { Object.keys(windows).forEach(id => minimizeWindow(id)) } },
  { label: '关闭所有窗口', icon: '✖', action: () => { Object.keys(windows).forEach(id => closeWindow(id)) } },
  null,
  { label: '关机', icon: '⏻', action: () => { document.body.style.transition = 'opacity 0.5s'; document.body.style.opacity = '0'; setTimeout(() => window.close(), 600) }, danger: true },
]
```

- [ ] **Step 2: 支持子菜单渲染**

修改菜单项渲染逻辑，支持 `children` 属性：

```javascript
items.forEach(item => {
  if (item === null) {
    const sep = document.createElement('div')
    sep.style.cssText = 'height:1px;background:rgba(255,255,255,0.08);margin:4px 10px;'
    menu.appendChild(sep)
    return
  }
  const row = document.createElement('div')
  row.style.cssText = `padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;border-radius:6px;margin:0 4px;${item.danger ? 'color:#ff7b72;' : ''}`
  row.innerHTML = `<span style="font-size:15px;width:20px;text-align:center">${item.icon}</span><span>${item.label}</span>${item.children ? '<span style="margin-left:auto;opacity:0.4">▶</span>' : ''}`
  
  if (item.children) {
    row.addEventListener('click', (e) => {
      e.stopPropagation()
      // 显示子菜单
      const oldSub = document.getElementById('desktopSubMenu')
      if (oldSub) oldSub.remove()
      const subMenu = document.createElement('div')
      subMenu.id = 'desktopSubMenu'
      const rowRect = row.getBoundingClientRect()
      subMenu.style.cssText = `position:fixed;left:${rowRect.right + 4}px;top:${rowRect.top}px;z-index:10000;background:rgba(30,30,40,0.94);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:6px 0;min-width:160px;box-shadow:0 10px 40px rgba(0,0,0,0.5);font-family:inherit;font-size:13px;color:rgba(255,255,255,0.85);`
      item.children.forEach(child => {
        const childRow = document.createElement('div')
        childRow.style.cssText = 'padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;border-radius:6px;margin:0 4px;'
        childRow.innerHTML = `<span style="font-size:15px;width:20px;text-align:center">${child.icon}</span><span>${child.label}</span>`
        childRow.addEventListener('mouseenter', () => childRow.style.background = 'rgba(255,255,255,0.08)')
        childRow.addEventListener('mouseleave', () => childRow.style.background = 'none')
        childRow.addEventListener('click', (ev) => { ev.stopPropagation(); menu.remove(); subMenu.remove(); child.action() })
        subMenu.appendChild(childRow)
      })
      document.body.appendChild(subMenu)
    })
  } else if (item.action) {
    row.addEventListener('mouseenter', () => row.style.background = 'rgba(255,255,255,0.08)')
    row.addEventListener('mouseleave', () => row.style.background = 'none')
    row.addEventListener('click', () => { menu.remove(); item.action() })
  }
  menu.appendChild(row)
})
```

- [ ] **Step 3: 增强桌面图标右键菜单**

在图标右键菜单中添加重命名功能：

```javascript
const items = [
  { label: '打开', icon: '📂', action: () => openApp(appName) },
  null,
  { label: '重命名', icon: '✏️', action: () => {
    const labelEl = icon.querySelector('.desktop-icon-label')
    if (!labelEl) return
    const oldName = labelEl.textContent
    const input = document.createElement('input')
    input.value = oldName
    input.style.cssText = 'background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.2);color:white;font-size:11px;text-align:center;width:80px;border-radius:4px;padding:2px 4px;outline:none;'
    input.addEventListener('blur', () => {
      labelEl.textContent = input.value || oldName
      input.replaceWith(labelEl)
    })
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') { input.blur() }
      if (ev.key === 'Escape') { labelEl.textContent = oldName; input.replaceWith(labelEl) }
    })
    labelEl.replaceWith(input)
    input.focus()
    input.select()
  }},
  { label: '复制', icon: '📋', action: () => {
    const desktopIcons = document.getElementById('desktopIcons')
    const clone = icon.cloneNode(true)
    clone.dataset.app = icon.dataset.app + '_copy'
    clone.ondblclick = () => openApp(icon.dataset.app)
    bindDesktopIconEvents(clone)
    desktopIcons.appendChild(clone)
  }},
  null,
  { label: '移入回收站', icon: '🗑', action: () => moveToTrash(appName) },
]
```

- [ ] **Step 4: 提取桌面图标事件绑定为函数**

```javascript
function bindDesktopIconEvents(icon) {
  icon.addEventListener('click', (e) => {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'))
    icon.classList.add('selected')
    e.stopPropagation()
  })

  icon.addEventListener('contextmenu', (e) => {
    // ... 右键菜单逻辑（使用上面定义的 items）
  })

  // 拖拽逻辑
  let isDragging = false
  let dragStartX, dragStartY, origLeft, origTop
  icon.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return
    isDragging = false
    dragStartX = e.clientX
    dragStartY = e.clientY
    const style = getComputedStyle(icon)
    origLeft = style.left !== 'auto' ? parseInt(style.left) : icon.offsetLeft
    origTop = style.top !== 'auto' ? parseInt(style.top) : icon.offsetTop

    const onMove = (ev) => {
      const dx = ev.clientX - dragStartX
      const dy = ev.clientY - dragStartY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging = true
      if (isDragging) {
        icon.style.position = 'absolute'
        icon.style.left = (origLeft + dx) + 'px'
        icon.style.top = (origTop + dy) + 'px'
        icon.style.zIndex = '50'
      }
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (isDragging) icon.style.zIndex = ''
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  })
}
```

- [ ] **Step 5: 添加排序功能**

```javascript
function sortDesktopIcons() {
  const container = document.getElementById('desktopIcons')
  const icons = [...container.querySelectorAll('.desktop-icon:not(.trash-icon)')]
  icons.sort((a, b) => {
    const labelA = (a.querySelector('.desktop-icon-label')?.textContent || '').trim()
    const labelB = (b.querySelector('.desktop-icon-label')?.textContent || '').trim()
    return labelA.localeCompare(labelB, 'zh-CN')
  })
  icons.forEach(icon => container.appendChild(icon))
}
```

---

### Task 9: 最终集成检查与收尾

- [ ] **Step 1: 确保 Launchpad 应用列表包含所有新应用**

检查 `launchpadApps` 数组包含：finder, terminal, linux, ssh, notes, calc, weather, settings, player, trash

- [ ] **Step 2: 确保修改后的 keydown 逻辑正确处理 Escape**

现有的 Escape 键逻辑需要同时处理关闭 Launchpad：

```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // 关闭 Launchpad
    const lp = document.getElementById('launchpad')
    if (lp && lp.classList.contains('active')) { closeLaunchpad(); return }
    // 关闭通知
    const notifPanel = document.getElementById('notifPanel')
    if (notifPanel && notifPanel.classList.contains('active')) { closeNotifications(); return }
    // 关闭活动窗口
    if (activeWindow) closeWindow(activeWindow)
  }
  if (e.key === 'F4') {
    e.preventDefault()
    const lp = document.getElementById('launchpad')
    if (lp.classList.contains('active')) closeLaunchpad()
    else openLaunchpad()
  }
})
```

- [ ] **Step 3: 验证所有功能正常运行**

启动应用，依次测试：
1. 打开任意应用 → 窗口动画正常
2. 点击主题切换 → 深浅色切换正常
3. 点击 Dock 启动台图标 / F4 → Launchpad 弹出
4. 点击顶栏时间 → 通知面板滑出
5. 桌面右键 → 更换壁纸 → 选择壁纸成功
6. 拖窗口到左边缘 → 分屏吸附
7. 打开音乐 → 播放/暂停/切歌正常
8. 右键桌面图标 → 移入回收站 → 打开回收站还原
9. 桌面右键 → 新建文件夹/文件/排序
