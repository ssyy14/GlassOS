# GlassOS 浏览器应用 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 GlassOS 添加多标签页浏览器应用，基于 Electron `<webview>` 标签，支持标签管理、书签、首页面板

**Architecture:** webview 标签提供 Chromium 完整渲染能力；TabManager 管理标签生命周期（创建/切换/关闭，上限 10 个）；BookmarkManager 处理书签增删（localStorage 持久化）；HomePanel 渲染新标签页的快捷面板

**Tech Stack:** Electron `<webview>`, 纯 HTML/CSS/JS, localStorage

---

### Task 1: 开启 webview + 添加浏览器入口

**Files:**
- Modify: `main.js:16-21` — 加 `webviewTag: true`
- Modify: `index.html` — 桌面图标 + Dock 入口

- [ ] **Step 1: main.js 开启 webviewTag**

在 `main.js` 的 `webPreferences` 中添加 `webviewTag: true`：

```js
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true
    }
```

- [ ] **Step 2: index.html 桌面图标区添加浏览器入口**

在桌面图标区（`desktop-icons` div 中，`trash-icon` 之前）添加浏览器图标：

```html
      <div class="desktop-icon" data-app="browser" ondblclick="openApp('browser')">
        <div class="desktop-icon-img">🌐</div>
        <div class="desktop-icon-label">浏览器</div>
      </div>
```

- [ ] **Step 3: index.html Dock 添加浏览器**

在 Dock 中（`dock-item[data-app="player"]` 和 `dock-item[data-app="settings"]` 之间）添加：

```html
      <div class="dock-item" data-app="browser" data-label="浏览器" onclick="openApp('browser')">
        <div class="dock-icon-glow"></div>
        <span>🌐</span>
        <div class="dock-dot"></div>
      </div>
```

- [ ] **Step 4: renderer.js openApp switch 添加 browser**

在 `openApp()` 的 switch 中添加 `case 'browser': openBrowser(); break`

- [ ] **Step 5: 右键菜单添加浏览器**

在右键菜单的 `apps` 数组中添加 `{ id: 'browser', icon: '🌐', label: '浏览器' }`

- [ ] **Step 6: Launchpad 添加浏览器**

在 launchpad 的 `apps` 数组中添加 `{ id: 'browser', icon: '🌐', label: '浏览器' }`

- [ ] **Step 7: 验证**

重启应用，确认桌面和 Dock 出现浏览器图标，点击不报错（还没实现 openBrowser，会静默忽略）。

---

### Task 2: 浏览器 CSS 样式

**Files:**
- Modify: `styles.css` — 末尾追加

- [ ] **Step 1: 追加浏览器 UI 样式**

在 `styles.css` 末尾追加：

```css
/* ========== 浏览器应用 ========== */
.app-browser {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 标签栏 */
.browser-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px 0;
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
  overflow-x: auto;
}
.browser-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.03);
  white-space: nowrap;
  max-width: 160px;
  transition: all 0.15s;
}
.browser-tab:hover { background: rgba(255,255,255,0.06); }
.browser-tab.active { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); }
.browser-tab .tab-close {
  font-size: 11px;
  opacity: 0;
  transition: opacity 0.15s;
  width: 14px; height: 14px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.browser-tab:hover .tab-close { opacity: 0.5; }
.browser-tab .tab-close:hover { opacity: 1; background: rgba(255,255,255,0.15); }
.browser-tab-new {
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  color: rgba(255,255,255,0.3);
  border-radius: 6px;
  flex-shrink: 0;
}
.browser-tab-new:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); }

/* 导航栏 */
.browser-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  flex-shrink: 0;
}
.browser-nav-btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}
.browser-nav-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); }
.browser-url-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 5px 14px;
  gap: 6px;
}
.browser-url-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  font-family: inherit;
}
.browser-url-input::placeholder { color: rgba(255,255,255,0.25); }
.browser-bookmark-btn {
  background: none; border: none;
  cursor: pointer;
  font-size: 14px;
  color: rgba(255,255,255,0.3);
  flex-shrink: 0;
  transition: color 0.15s;
}
.browser-bookmark-btn.bookmarked { color: #f0c040; }
.browser-bookmark-btn:hover { color: #f0c040; }

/* 书签栏 */
.browser-bookmarks {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,0.04);
  overflow-x: auto;
}
.browser-bookmarks-toggle {
  font-size: 12px;
  cursor: pointer;
  color: rgba(255,255,255,0.3);
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 4px;
}
.browser-bookmarks-toggle:hover { background: rgba(255,255,255,0.06); }
.browser-bookmark-item {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
  transition: all 0.15s;
}
.browser-bookmark-item:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); }

/* 内容区 */
.browser-content {
  flex: 1;
  position: relative;
  background: #fff;
}
.browser-content webview {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* 新标签页首页 */
.browser-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 24px;
  background: linear-gradient(160deg, #0a0a14 0%, #0f0f20 100%);
}
.browser-home-search {
  width: 380px;
  max-width: 90%;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 10px 18px;
  gap: 10px;
  backdrop-filter: blur(20px);
}
.browser-home-search input {
  flex: 1;
  background: none; border: none; outline: none;
  color: white; font-size: 15px; font-family: inherit;
}
.browser-home-search input::placeholder { color: rgba(255,255,255,0.3); }
.browser-home-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.browser-home-card {
  width: 100px;
  padding: 16px 10px;
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}
.browser-home-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-2px);
}
.browser-home-card .card-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}
.browser-home-card .card-title {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
}
```

- [ ] **Step 2: 验证 CSS 无语法错误**

检查浏览器 DevTools 确认无 CSS parse error。

---

### Task 3: 浏览器核心逻辑 — TabManager + openBrowser

**Files:**
- Modify: `renderer.js` — 在 `openPlayer()` 之后添加

- [ ] **Step 1: 实现 TabManager**

```js
// ========== 浏览器应用 ==========
function openBrowser() {
  const tabState = { tabs: [], activeIdx: 0 }
  let bookmarkState = JSON.parse(localStorage.getItem('glassos_bookmarks') || '[]')
  let bookmarksVisible = true

  function saveBookmarks() {
    localStorage.setItem('glassos_bookmarks', JSON.stringify(bookmarkState))
  }

  function isBookmarked(url) {
    return bookmarkState.some(b => b.url === url)
  }

  function addBookmark(title, url) {
    if (isBookmarked(url)) return
    bookmarkState.push({ title: title || url, url })
    saveBookmarks()
    renderBookmarks()
    updateBookmarkStar()
  }

  function removeBookmark(url) {
    bookmarkState = bookmarkState.filter(b => b.url !== url)
    saveBookmarks()
    renderBookmarks()
    updateBookmarkStar()
  }

  function toggleBookmark(title, url) {
    if (isBookmarked(url)) removeBookmark(url)
    else addBookmark(title, url)
  }

  function renderBookmarks() {
    const bar = document.getElementById('browserBookmarks')
    if (!bar) return
    bar.innerHTML = bookmarkState.map((b, i) =>
      `<span class="browser-bookmark-item" onclick="window._browser_navigate('${escapeHtml(b.url)}')" oncontextmenu="event.preventDefault();window._browser_removeBookmark('${escapeHtml(b.url)}')">${escapeHtml(b.title)}</span>`
    ).join('')
  }

  function updateBookmarkStar() {
    const star = document.getElementById('browserBookmarkStar')
    if (!star) return
    const tab = tabState.tabs[tabState.activeIdx]
    if (tab && tab.url && !tab.isHome) {
      star.style.display = ''
      star.classList.toggle('bookmarked', isBookmarked(tab.url))
    } else {
      star.style.display = 'none'
    }
  }

  function createTab(url) {
    if (tabState.tabs.length >= 10) {
      alert('最多同时打开 10 个标签页')
      return
    }
    const id = Date.now()
    const isHome = !url
    tabState.tabs.push({ id, url: url || '', title: isHome ? '新标签页' : (url || '新标签页'), isHome })
    tabState.activeIdx = tabState.tabs.length - 1
    renderTabs()
    renderContent()
  }

  function closeTab(index) {
    if (tabState.tabs.length <= 1) {
      // 最后一个标签：回到新标签页
      tabState.tabs = []
      createTab(null)
      return
    }
    tabState.tabs.splice(index, 1)
    if (tabState.activeIdx >= tabState.tabs.length) tabState.activeIdx = tabState.tabs.length - 1
    if (tabState.activeIdx > index) tabState.activeIdx--
    if (tabState.activeIdx < 0) tabState.activeIdx = 0
    renderTabs()
    renderContent()
  }

  function switchTab(index) {
    tabState.activeIdx = index
    renderTabs()
    renderContent()
  }

  function renderTabs() {
    const container = document.getElementById('browserTabs')
    if (!container) return
    container.innerHTML = tabState.tabs.map((t, i) => `
      <div class="browser-tab${i === tabState.activeIdx ? ' active' : ''}" onclick="window._browser_switchTab(${i})">
        <span style="overflow:hidden;text-overflow:ellipsis;max-width:100px">${escapeHtml(t.title)}</span>
        <span class="tab-close" onclick="event.stopPropagation();window._browser_closeTab(${i})">✕</span>
      </div>
    `).join('') + `<span class="browser-tab-new" onclick="window._browser_newTab()" title="新建标签">+</span>`
  }

  function navigateTo(url) {
    if (!url) return
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
    const tab = tabState.tabs[tabState.activeIdx]
    if (!tab) return
    tab.url = url
    tab.isHome = false
    tab.title = url
    updateBookmarkStar()
    renderTabs()
    renderContent()
  }

  function renderContent() {
    const container = document.getElementById('browserContent')
    if (!container) return
    const tab = tabState.tabs[tabState.activeIdx]
    if (!tab) return
    container.innerHTML = ''

    if (tab.isHome) {
      container.innerHTML = renderHomePanel()
      document.getElementById('browserUrlInput').value = ''
    } else {
      const wv = document.createElement('webview')
      wv.src = tab.url
      wv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'
      wv.setAttribute('nodeintegration', 'false')
      wv.addEventListener('page-title-updated', (e) => {
        tab.title = e.title
        renderTabs()
        if (tab === tabState.tabs[tabState.activeIdx]) {
          document.getElementById('browserUrlInput').value = tab.url
        }
      })
      wv.addEventListener('did-navigate', (e) => {
        tab.url = e.url
        if (tab === tabState.tabs[tabState.activeIdx]) {
          document.getElementById('browserUrlInput').value = e.url
          updateBookmarkStar()
        }
      })
      wv.addEventListener('did-navigate-in-page', (e) => {
        if (e.isMainFrame) tab.url = e.url
      })
      container.appendChild(wv)
      document.getElementById('browserUrlInput').value = tab.url
      updateBookmarkStar()
    }
  }

  function renderHomePanel() {
    const cards = [
      { icon: '🔍', title: 'Google', url: 'https://www.google.com' },
      { icon: '🐙', title: 'GitHub', url: 'https://github.com' },
      { icon: '📺', title: 'Bilibili', url: 'https://www.bilibili.com' },
      { icon: '🔗', title: '百度', url: 'https://www.baidu.com' },
    ]
    const cardsHtml = cards.map(c => `
      <div class="browser-home-card" onclick="window._browser_navigate('${c.url}')">
        <span class="card-icon">${c.icon}</span>
        <span class="card-title">${c.title}</span>
      </div>
    `).join('')

    return `<div class="browser-home">
      <div style="font-size:28px;color:rgba(255,255,255,0.8);font-weight:200">🌐 GlassOS 浏览器</div>
      <div class="browser-home-search">
        <span>🔍</span>
        <input id="homeSearchInput" placeholder="搜索或输入网址..." onkeydown="if(event.key==='Enter')window._browser_navigate(this.value.includes('.')&&!this.value.includes(' ')?this.value:'https://www.google.com/search?q='+encodeURIComponent(this.value))">
      </div>
      <div class="browser-home-grid">${cardsHtml}</div>
    </div>`
  }

  // ===== 构建 UI =====
  const content = `<div class="app-browser">
    <div class="browser-tabs" id="browserTabs"></div>
    <div class="browser-nav">
      <button class="browser-nav-btn" onclick="window._browser_goBack()" title="后退">◀</button>
      <button class="browser-nav-btn" onclick="window._browser_goForward()" title="前进">▶</button>
      <button class="browser-nav-btn" onclick="window._browser_reload()" title="刷新">⟳</button>
      <div class="browser-url-bar">
        <span style="font-size:12px;color:rgba(255,255,255,0.3);flex-shrink:0">🔒</span>
        <input class="browser-url-input" id="browserUrlInput" placeholder="输入网址..." onkeydown="if(event.key==='Enter')window._browser_navigate(this.value)">
        <button class="browser-bookmark-btn" id="browserBookmarkStar" onclick="window._browser_toggleBookmark()" title="添加书签" style="display:none">☆</button>
      </div>
    </div>
    <div class="browser-bookmarks" id="browserBookmarksBar" style="display:flex">
      <span class="browser-bookmarks-toggle" onclick="window._browser_toggleBookmarks()">★</span>
      <span id="browserBookmarks"></span>
    </div>
    <div class="browser-content" id="browserContent"></div>
  </div>`

  createWindow('browser', 'GlassOS 浏览器', 900, 650, content)

  // 暴露全局方法
  window._browser_switchTab = (i) => switchTab(i)
  window._browser_closeTab = (i) => closeTab(i)
  window._browser_newTab = () => createTab(null)
  window._browser_navigate = (url) => navigateTo(url)
  window._browser_goBack = () => {
    const wv = document.querySelector('#browserContent webview')
    if (wv && wv.canGoBack()) wv.goBack()
  }
  window._browser_goForward = () => {
    const wv = document.querySelector('#browserContent webview')
    if (wv && wv.canGoForward()) wv.goForward()
  }
  window._browser_reload = () => {
    const wv = document.querySelector('#browserContent webview')
    if (wv) wv.reload()
  }
  window._browser_toggleBookmark = () => {
    const tab = tabState.tabs[tabState.activeIdx]
    if (tab && tab.url && !tab.isHome) toggleBookmark(tab.title, tab.url)
  }
  window._browser_toggleBookmarks = () => {
    bookmarksVisible = !bookmarksVisible
    document.getElementById('browserBookmarksBar').style.display = bookmarksVisible ? 'flex' : 'none'
  }
  window._browser_removeBookmark = (url) => removeBookmark(url)

  // 初始化
  createTab('https://www.google.com')
  renderBookmarks()
  document.getElementById('browserUrlInput')?.focus()
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
```

注意：`escapeHtml` 函数可能已在文件中定义（如已有则跳过重复定义）。

- [ ] **Step 2: 在 openApp switch 中确认 browser case 存在**

确认 `case 'browser': openBrowser(); break` 已在 `openApp()` 中。

- [ ] **Step 3: 验证**

启动应用，打开浏览器，确认：
- 默认打开一个 Google 标签页
- 可以 [+] 新建标签
- 地址栏输入 URL 回车可导航
- 前进/后退/刷新按钮工作
- ☆ 可添加书签
- 标签切换正常

---

### Task 4: 书签右键删除 + 窗口清理

**Files:**
- Modify: `renderer.js` — 修整 `openBrowser()` 内部细节

- [ ] **Step 1: 确保右键书签删除已实现**

已在 Task 3 中通过 `oncontextmenu` 实现，验证可用。

- [ ] **Step 2: 浏览器关闭时清理所有 webview**

在 `closeWindow` 函数中添加 webview 清理逻辑。找到 `closeWindow` 函数，在移除 window 元素之前：

```js
function closeWindow(id) {
  if (!windows[id]) return
  // 清理浏览器 webview（防止内存泄漏）
  if (id === 'browser') {
    const wvs = windows[id].el.querySelectorAll('webview')
    wvs.forEach(wv => { wv.src = ''; wv.remove() })
  }
  windows[id].el.remove()
  delete windows[id]
  document.querySelector(`.dock-item[data-app="${id}"]`)?.classList.remove('running')
  if (activeWindow === id) activeWindow = null
}
```

- [ ] **Step 3: 验证**

打开浏览器，加载几个页面，关闭浏览器窗口，确认无残留 webview 进程。

---

### Task 5: 集成测试

**Files:**
- 无新建，验证所有已修改文件

- [ ] **Step 1: 完整功能测试清单**

启动应用，逐项验证：

1. 桌面浏览器图标 → 双击打开浏览器 ✅
2. Dock 浏览器图标 → 点击打开 ✅
3. 默认打开 Google，webview 正常渲染 ✅
4. [+] 新建标签 → 显示首页面板 ✅
5. 首页搜索框输入 → Google 搜索 ✅
6. 首页卡片点击 → 跳转对应网站 ✅
7. 地址栏输入 URL 回车 → 正常导航 ✅
8. ◀ ▶ 前进后退工作 ✅
9. ⟳ 刷新工作 ✅
10. ☆ 添加书签 → 书签栏出现 ✅
11. 点击书签 → 当前标签跳转 ✅
12. 右键书签 → 删除 ✅
13. ★ 收起/展开书签栏 ✅
14. 切换标签 → 内容切换 ✅
15. 关闭标签 → 标签移除 ✅
16. 关闭浏览器 → 无残留 ✅
17. 超过 10 个标签 → 提示 ✅
18. 书签重启后保持（localStorage）✅

- [ ] **Step 2: 修复发现的问题**
- [ ] **Step 3: 推送等待页到浏览器 companion**

```html
<div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
  <p class="subtitle">设计完成，继续实施...</p>
</div>
```
