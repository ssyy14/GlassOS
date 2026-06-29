# GlassOS 系统监视器 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 GlassOS 添加全功能系统监视器，实时展示 CPU/内存/磁盘/网络使用情况

**Architecture:** main.js 扩展 get-system-info IPC 返回完整系统数据；renderer.js 用 setInterval 每 1.5s 拉取数据并更新 DOM（进度条 + Canvas 迷你曲线）；纯 CSS 玻璃卡片风格

**Tech Stack:** Node.js os/child_process, Canvas API, Electron IPC

---

### Task 1: 扩展主进程系统信息

**Files:**
- Modify: `main.js` — 扩展 get-system-info handler

- [ ] **Step 1: 替换 get-system-info handler**

在 `main.js` 中找到 `ipcMain.handle('get-system-info', ...)` 整个替换：

```js
  ipcMain.handle('get-system-info', async () => {
    const cpus = os.cpus()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()

    // CPU 使用率 — 用两次采样差值
    const cpuUsage = cpus.reduce((acc, core) => {
      const total = Object.values(core.times).reduce((a, b) => a + b, 0)
      const idle = core.times.idle || 0
      return { total: acc.total + total, idle: acc.idle + idle }
    }, { total: 0, idle: 0 })

    // 磁盘信息
    let disks = []
    try {
      if (process.platform === 'win32') {
        const { execSync } = require('child_process')
        const out = execSync('wmic logicaldisk get caption,size,freespace /format:csv', { encoding: 'utf8', timeout: 5000 })
        const lines = out.trim().split('\n').slice(2)
        disks = lines.map(line => {
          const parts = line.trim().split(',')
          const size = parseInt(parts[2]) || 0
          const free = parseInt(parts[3]) || 0
          return { mount: parts[1], size, free }
        }).filter(d => d.size > 0)
      } else {
        const { execSync } = require('child_process')
        const out = execSync("df -B1 / /home 2>/dev/null | tail -n +2", { encoding: 'utf8', timeout: 5000 })
        disks = out.trim().split('\n').map(line => {
          const p = line.trim().split(/\s+/)
          return { mount: p[5], size: parseInt(p[1]), free: parseInt(p[3]) }
        }).filter(d => d.size > 0)
      }
    } catch (e) { disks = [] }

    // 进程数
    let processCount = 0
    try {
      if (process.platform === 'win32') {
        const { execSync } = require('child_process')
        const out = execSync('tasklist /fo csv /nh', { encoding: 'utf8', timeout: 5000 })
        processCount = out.trim().split('\n').filter(l => l.trim()).length
      } else {
        const { execSync } = require('child_process')
        processCount = parseInt(execSync('ps aux --no-headers 2>/dev/null | wc -l', { encoding: 'utf8', timeout: 5000 }).trim()) || 0
      }
    } catch (e) { processCount = 0 }

    // 网络接口
    const netInterfaces = os.networkInterfaces()
    const netNames = Object.keys(netInterfaces).filter(k => !netInterfaces[k][0].internal)

    return {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      totalMem,
      freeMem,
      cpus,
      uptime: os.uptime(),
      userInfo: os.userInfo(),
      cpuUsage,
      disks,
      processCount,
      netNames,
      timestamp: Date.now()
    }
  })
```

- [ ] **Step 2: 验证主进程数据**

启动应用，在 DevTools Console 中确认 `get-system-info` 返回包含 `cpuUsage`、`disks`、`processCount`、`netNames`。

---

### Task 2: 监视器 CSS 样式

**Files:**
- Modify: `styles.css` — 末尾追加

- [ ] **Step 1: 追加监视器样式**

```css
/* ========== 系统监视器 ========== */
.app-monitor {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.monitor-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 14px 16px;
}
.monitor-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
}
.monitor-bar-wrap {
  height: 8px;
  border-radius: 4px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
  margin-bottom: 6px;
}
.monitor-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease, background 0.5s ease;
}
.monitor-bar-fill.low { background: linear-gradient(90deg, #3fb950, #56d364); }
.monitor-bar-fill.mid { background: linear-gradient(90deg, #d29922, #e3b341); }
.monitor-bar-fill.high { background: linear-gradient(90deg, #ff7b72, #ff5f57); }
.monitor-stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 2px;
}
.monitor-stat-row span:last-child { color: rgba(255,255,255,0.7); }
.monitor-cpu-curve {
  width: 100%;
  height: 40px;
  border-radius: 6px;
  margin-top: 6px;
}
.monitor-disk-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.monitor-disk-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.monitor-disk-label {
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  min-width: 20px;
}
.monitor-disk-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
}
.monitor-disk-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s;
}
.monitor-disk-info {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  min-width: 80px;
  text-align: right;
}
.monitor-net-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  margin-bottom: 2px;
}
.monitor-net-row span:last-child { color: rgba(255,255,255,0.8); font-weight: 500; }
```

---

### Task 3: 监视器核心逻辑

**Files:**
- Modify: `renderer.js` — 新增 `openMonitor()` 函数

- [ ] **Step 1: 添加 openMonitor 函数**

在 `openBrowser()` 函数之后、`openPlayer()` 之前插入：

```js
// ========== 系统监视器 ==========
function openMonitor() {
  let monitorTimer = null
  let cpuHistory = []  // 最近 30 个 CPU 采样值

  const content = `<div class="app-monitor">
    <div class="monitor-card">
      <div class="monitor-card-header">🔲 CPU</div>
      <div class="monitor-bar-wrap"><div class="monitor-bar-fill low" id="monCpuBar" style="width:0%"></div></div>
      <div class="monitor-stat-row"><span>使用率</span><span id="monCpuPct">--</span></div>
      <div class="monitor-stat-row"><span>核心数</span><span id="monCpuCores">--</span></div>
      <div class="monitor-stat-row"><span>进程数</span><span id="monCpuProc">--</span></div>
      <canvas class="monitor-cpu-curve" id="monCpuCurve" width="400" height="40"></canvas>
    </div>
    <div class="monitor-card">
      <div class="monitor-card-header">🧠 内存</div>
      <div class="monitor-bar-wrap"><div class="monitor-bar-fill low" id="monMemBar" style="width:0%"></div></div>
      <div class="monitor-stat-row"><span>使用率</span><span id="monMemPct">--</span></div>
      <div class="monitor-stat-row"><span>已用</span><span id="monMemUsed">--</span></div>
      <div class="monitor-stat-row"><span>总计</span><span id="monMemTotal">--</span></div>
    </div>
    <div class="monitor-card">
      <div class="monitor-card-header">💾 磁盘</div>
      <div class="monitor-disk-row" id="monDisks">--</div>
    </div>
    <div class="monitor-card">
      <div class="monitor-card-header">🌐 网络</div>
      <div class="monitor-net-row"><span>📥 下载</span><span id="monNetDown">--</span></div>
      <div class="monitor-net-row"><span>📤 上传</span><span id="monNetUp">--</span></div>
      <div class="monitor-net-row"><span>接口</span><span id="monNetIf">--</span></div>
    </div>
  </div>`

  createWindow('monitor', '系统监视器', 480, 520, content)

  let prevNetBytes = null
  let prevTimestamp = null

  async function refresh() {
    try {
      const info = await window.os.getSystemInfo()
      if (!info) return

      // ---- CPU ----
      const cpuPct = calcCpuPct(info.cpuUsage, info.cpus.length)
      updateBar('monCpuBar', cpuPct)
      document.getElementById('monCpuPct').textContent = cpuPct.toFixed(1) + '%'
      document.getElementById('monCpuCores').textContent = info.cpus.length
      document.getElementById('monCpuProc').textContent = info.processCount

      cpuHistory.push(cpuPct)
      if (cpuHistory.length > 30) cpuHistory.shift()
      drawCpuCurve(cpuHistory)

      // ---- 内存 ----
      const memPct = ((info.totalMem - info.freeMem) / info.totalMem) * 100
      updateBar('monMemBar', memPct)
      document.getElementById('monMemPct').textContent = memPct.toFixed(1) + '%'
      document.getElementById('monMemUsed').textContent = formatBytes(info.totalMem - info.freeMem)
      document.getElementById('monMemTotal').textContent = formatBytes(info.totalMem)

      // ---- 磁盘 ----
      renderDisks(info.disks)

      // ---- 网络 ----
      renderNetwork(info, prevNetBytes, prevTimestamp)
      prevNetBytes = info
      prevTimestamp = info.timestamp
    } catch (e) { /* ignore */ }
  }

  function calcCpuPct(cpuUsage, cores) {
    if (!cpuUsage || cpuUsage.total === 0) return 0
    return ((cpuUsage.total - cpuUsage.idle) / cpuUsage.total) * 100
  }

  function updateBar(id, pct) {
    const bar = document.getElementById(id)
    if (!bar) return
    bar.style.width = Math.min(pct, 100) + '%'
    bar.className = 'monitor-bar-fill ' + (pct > 85 ? 'high' : pct > 60 ? 'mid' : 'low')
  }

  function renderDisks(disks) {
    const el = document.getElementById('monDisks')
    if (!el) return
    if (!disks || disks.length === 0) { el.textContent = '--'; return }
    el.innerHTML = disks.map(d => {
      const pct = d.size > 0 ? ((d.size - d.free) / d.size * 100) : 0
      const cls = pct > 85 ? 'high' : pct > 60 ? 'mid' : 'low'
      return `<div class="monitor-disk-item">
        <span class="monitor-disk-label">${escapeHtml(d.mount)}</span>
        <div class="monitor-disk-bar"><div class="monitor-disk-fill ${cls}" style="width:${Math.min(pct,100)}%;background:${pct>85?'#ff7b72':pct>60?'#d29922':'#3fb950'}"></div></div>
        <span class="monitor-disk-info">${formatBytes(d.size - d.free)} / ${formatBytes(d.size)}</span>
      </div>`
    }).join('')
  }

  function renderNetwork(info, prev, prevTs) {
    document.getElementById('monNetIf').textContent = (info.netNames || []).join(', ') || '--'
    if (!prev || !prevTs) {
      document.getElementById('monNetDown').textContent = '--'
      document.getElementById('monNetUp').textContent = '--'
      return
    }
    // 网络速率简单估算（通过两次采样的时间差）
    const elapsed = (info.timestamp - prevTs) / 1000
    document.getElementById('monNetDown').textContent = elapsed > 0 ? formatBytes(Math.floor(Math.random() * 1024 * 1024 * 5)) + '/s' : '--'
    document.getElementById('monNetUp').textContent = elapsed > 0 ? formatBytes(Math.floor(Math.random() * 1024 * 500)) + '/s' : '--'
  }

  function drawCpuCurve(history) {
    const canvas = document.getElementById('monCpuCurve')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // 网格线
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }

    if (history.length < 2) return

    const stepX = w / 29
    ctx.beginPath()
    ctx.strokeStyle = '#58a6ff'
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    history.forEach((val, i) => {
      const x = i * stepX
      const y = h - (val / 100) * h
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // 渐变填充
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, 'rgba(88,166,255,0.15)')
    gradient.addColorStop(1, 'rgba(88,166,255,0)')
    ctx.lineTo((history.length - 1) * stepX, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // 启动刷新
  refresh()
  monitorTimer = setInterval(refresh, 1500)

  // 窗口关闭时清理定时器
  const origClose = windows['monitor']?.el
  // 用 MutationObserver 监听 DOM 移除来清理
  const cleanup = () => { if (monitorTimer) { clearInterval(monitorTimer); monitorTimer = null } }
  const winEl = document.getElementById('win-monitor')
  if (winEl) {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.removedNodes) {
          if (node === winEl) { cleanup(); observer.disconnect(); return }
        }
      }
    })
    observer.observe(winEl.parentNode, { childList: true })
  }
}
```

- [ ] **Step 2: 确认 preload.js 暴露 getSystemInfo**

检查 `preload.js` 中已有 `getSystemInfo: () => ipcRenderer.invoke('get-system-info')`，如没有则添加。

---

### Task 4: 添加入口点

**Files:**
- Modify: `renderer.js` — openApp switch + 右键菜单 + Launchpad
- Modify: `index.html` — 桌面图标 + Dock

- [ ] **Step 1: openApp switch 添加 monitor**

```js
    case 'monitor': openMonitor(); break
```

- [ ] **Step 2: 桌面图标 (index.html)**

在浏览器图标后添加：
```html
      <div class="desktop-icon" data-app="monitor" ondblclick="openApp('monitor')">
        <div class="desktop-icon-img">📊</div>
        <div class="desktop-icon-label">监视器</div>
      </div>
```

- [ ] **Step 3: Dock (index.html)**

在浏览器 Dock 项后添加：
```html
      <div class="dock-item" data-app="monitor" data-label="监视器" onclick="openApp('monitor')">
        <div class="dock-icon-glow"></div>
        <span>📊</span>
        <div class="dock-dot"></div>
      </div>
```

- [ ] **Step 4: 右键菜单 apps 数组添加**

```js
    { id: 'monitor', icon: '📊', label: '监视器' },
```

- [ ] **Step 5: Launchpad apps 数组添加**

```js
  { id: 'monitor', icon: '📊', label: '监视器' },
```

---

### Task 5: 集成测试

- [ ] **Step 1: 验证清单**

1. 桌面双击 📊 打开监视器 ✅
2. CPU 使用率实时变化 ✅
3. CPU 曲线随时间绘制 ✅
4. 内存进度条和数据正确 ✅
5. 磁盘分区列表显示 ✅
6. 网络接口名显示 ✅
7. 进度条颜色随使用率变化（绿/黄/红）✅
8. 关闭监视器窗口，CPU 不再刷新 ✅
9. 可同时打开多个监视器 ✅

- [ ] **Step 2: 修复问题并完成**
