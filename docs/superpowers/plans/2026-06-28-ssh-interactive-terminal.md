# SSH 交互终端 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 SSH 功能从一次性 exec 改为 ssh2 持久连接 + xterm.js 交互终端

**Architecture:** 主进程用 ssh2 管理持久 SSH 连接和 PTY shell，通过 IPC 将 stdout 流式推送到渲染进程的 xterm.js 终端；用户输入通过 IPC 送回主进程写入 socket

**Tech Stack:** ssh2 (v1.17.0), xterm.js (v5.3.0), Electron IPC (contextBridge + ipcMain/ipcRenderer)

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `package.json` | 添加 ssh2 依赖声明 |
| `main.js` | SSH Client Manager: 连接、PTY、IPC handlers（ssh-connect/ssh-data/ssh-resize/ssh-disconnect） |
| `preload.js` | 暴露 SSH IPC APIs 给渲染进程（含流式数据回调） |
| `index.html` | 引入 xterm.css |
| `renderer.js` | 重写 openSSH()：连接表单 + xterm.js 终端 + 多会话管理 |
| `styles.css` | SSH 窗口内的 xterm 容器样式 |

---

### Task 1: 添加 ssh2 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 在 package.json 中添加 ssh2 依赖声明**

`package.json` 的 dependencies 块改为：

```json
"dependencies": {
    "ssh2": "^1.17.0",
    "xterm": "^5.3.0",
    "xterm-addon-fit": "^0.8.0",
    "xterm-addon-web-links": "^0.9.0"
}
```

- [ ] **Step 2: 运行 npm install 确认依赖正确**

```bash
cd "C:\Users\r\Desktop\GlassOS" && npm install
```

Expected: 无报错，ssh2 v1.17.0 已在 node_modules 中

---

### Task 2: 主进程 — SSH 连接管理

**Files:**
- Modify: `main.js`（在 `app.whenReady().then(() => { ... })` 块内末尾，`app.on('window-all-closed')` 之前新增）

- [ ] **Step 1: 在 main.js 顶部添加 ssh2 导入**

在 `main.js` 第5行 `const { exec, execSync } = require('child_process')` 之后添加：

```js
const { Client } = require('ssh2')
```

- [ ] **Step 2: 添加 SSH 连接管理器和 IPC handlers**

在 `main.js` 中 `ipcMain.handle('check-wsl', ...)` 之后、`})`（app.whenReady 闭合）之前，插入以下代码：

```js
  // ========== SSH Connection Manager ==========
  const sshConnections = {}

  ipcMain.handle('ssh-connect', async (e, { sessionId, host, port, username, password, cols, rows }) => {
    return new Promise((resolve) => {
      const conn = new Client()
      sshConnections[sessionId] = { client: conn, stream: null }

      conn.on('ready', () => {
        conn.shell({ term: 'xterm-256color', cols: cols || 80, rows: rows || 24 }, (err, stream) => {
          if (err) {
            delete sshConnections[sessionId]
            resolve({ success: false, error: 'Shell error: ' + err.message })
            return
          }
          sshConnections[sessionId].stream = stream

          stream.on('data', (data) => {
            mainWindow.webContents.send('ssh:output', { sessionId, data: data.toString('utf-8') })
          })

          stream.stderr.on('data', (data) => {
            mainWindow.webContents.send('ssh:output', { sessionId, data: data.toString('utf-8') })
          })

          stream.on('close', () => {
            mainWindow.webContents.send('ssh:event', { sessionId, event: 'disconnected' })
            delete sshConnections[sessionId]
          })

          stream.on('error', (err) => {
            mainWindow.webContents.send('ssh:error', { sessionId, error: err.message })
          })

          resolve({ success: true })
        })
      })

      conn.on('error', (err) => {
        delete sshConnections[sessionId]
        resolve({ success: false, error: err.message })
      })

      conn.connect({ host, port, username, password, readyTimeout: 10000 })
    })
  })

  ipcMain.on('ssh-data', (e, { sessionId, data }) => {
    const conn = sshConnections[sessionId]
    if (conn && conn.stream) {
      conn.stream.write(data)
    }
  })

  ipcMain.on('ssh-resize', (e, { sessionId, cols, rows }) => {
    const conn = sshConnections[sessionId]
    if (conn && conn.stream) {
      conn.stream.setWindow(rows, cols, 0, 0)
    }
  })

  ipcMain.on('ssh-disconnect', (e, { sessionId }) => {
    const conn = sshConnections[sessionId]
    if (conn) {
      if (conn.stream) conn.stream.end()
      conn.client.end()
      delete sshConnections[sessionId]
    }
  })
```

---

### Task 3: Preload — 暴露 SSH APIs

**Files:**
- Modify: `preload.js`（在 contextBridge.exposeInMainWorld 的 `'os'` 对象内添加新方法）

- [ ] **Step 1: 添加 SSH 通信 API**

在 `preload.js` 中，`contextBridge.exposeInMainWorld('os', { ... })` 对象内，`checkWSL` 之后添加：

```js
    // SSH 连接 APIs
    sshConnect: (opts) => ipcRenderer.invoke('ssh-connect', opts),
    sshWrite: (sessionId, data) => ipcRenderer.send('ssh-data', { sessionId, data }),
    sshResize: (sessionId, cols, rows) => ipcRenderer.send('ssh-resize', { sessionId, cols, rows }),
    sshDisconnect: (sessionId) => ipcRenderer.send('ssh-disconnect', { sessionId }),
    onSshOutput: (callback) => {
      ipcRenderer.on('ssh:output', (event, data) => callback(data))
    },
    onSshEvent: (callback) => {
      ipcRenderer.on('ssh:event', (event, data) => callback(data))
    },
    onSshError: (callback) => {
      ipcRenderer.on('ssh:error', (event, data) => callback(data))
    }
```

---

### Task 4: HTML — 引入 xterm.css

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 在 `<head>` 中添加 xterm CSS 链接**

在 `index.html` 的 `<link rel="stylesheet" href="styles.css">` 之后添加：

```html
  <link rel="stylesheet" href="node_modules/xterm/css/xterm.css">
```

---

### Task 5: 渲染进程 — 重写 SSH 窗口

**Files:**
- Modify: `renderer.js`（替换 `openSSH` 函数，约第 521-673 行）

- [ ] **Step 1: 替换整个 `openSSH` 函数**

删除现有的 `openSSH` 函数（从 `function openSSH() {` 到该函数结束的 `}`，约第 521-673 行），替换为：

```js
function openSSH() {
  const savedHosts = JSON.parse(localStorage.getItem('glassos_ssh_hosts') || '[]')
  let hostListHtml = savedHosts.map((h, i) => `
    <div class="ssh-host-item" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;cursor:pointer;border-radius:8px;margin:2px 0;color:rgba(255,255,255,0.8);font-size:13px;"
         onmouseenter="this.style.background='rgba(255,255,255,0.06)'" onmouseleave="this.style.background='none'"
         ondblclick="document.getElementById('sshConnStr').value='${escapeHtml(h)}';sshDoConnect()">
      <span>🖥 ${escapeHtml(h)}</span>
      <button style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:14px;"
              onclick="event.stopPropagation();sshDelHost(${i})">✕</button>
    </div>`).join('')

  const content = `<div class="app-ssh">
    <div class="ssh-connect-bar">
      <div class="ssh-connect-row">
        <input id="sshConnStr" class="ssh-conn-input" placeholder="root@192.168.1.100  或  192.168.1.100" autofocus />
        <button class="ssh-connect-btn" id="sshConnectBtn">▶ 连接</button>
      </div>
      <div class="ssh-connect-hint">输入 user@ip 或仅输入 IP (默认 root)，支持 -p 端口号</div>
    </div>
    <div class="ssh-body">
      <div class="ssh-xterm-container" id="sshXtermContainer">
        <div class="ssh-xterm-placeholder">输入地址点击连接，开始 SSH 会话</div>
      </div>
      <div class="ssh-hosts-panel" id="sshHostsPanel">
        <div class="ssh-hosts-title">历史连接</div>
        <div class="ssh-hosts-list" id="sshHostsList">${hostListHtml || '<div class="ssh-hosts-empty">暂无历史</div>'}</div>
      </div>
    </div>
  </div>`
  createWindow('ssh', 'SSH', 780, 540, content)

  // Session state
  let currentSessionId = null
  let currentTerminal = null
  let fitAddon = null

  // Focus the input
  setTimeout(() => {
    const inp = document.getElementById('sshConnStr')
    if (inp) inp.focus()
  }, 100)

  // Parse connection string
  const parseConnStr = (connStr) => {
    connStr = connStr.trim()
    let username = 'root', host = '', port = 22
    const portMatch = connStr.match(/-p\s*(\d+)/)
    if (portMatch) { port = parseInt(portMatch[1]); connStr = connStr.replace(/-p\s*\d+/, '').trim() }
    if (connStr.includes('@')) { [username, host] = connStr.split('@') } else { host = connStr }
    return { username, host, port }
  }

  // Save host to history
  const saveHost = (username, host) => {
    const entry = `${username}@${host}`
    let saved = JSON.parse(localStorage.getItem('glassos_ssh_hosts') || '[]')
    if (!saved.includes(entry)) {
      saved.push(entry)
      localStorage.setItem('glassos_ssh_hosts', JSON.stringify(saved))
    }
  }

  // Connect
  window.sshDoConnect = async () => {
    const connStr = document.getElementById('sshConnStr').value
    if (!connStr || !connStr.trim()) return
    const { username, host, port } = parseConnStr(connStr)
    if (!host) return

    saveHost(username, host)

    // Clean up existing terminal
    if (currentTerminal) {
      currentTerminal.dispose()
      currentTerminal = null
    }
    if (currentSessionId) {
      window.os.sshDisconnect(currentSessionId)
      currentSessionId = null
    }

    const container = document.getElementById('sshXtermContainer')
    container.innerHTML = ''

    // Create xterm terminal
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 14,
      fontFamily: "'SF Mono','Fira Code','Cascadia Code','Consolas',monospace",
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        selectionBackground: 'rgba(88,166,255,0.3)',
        black: '#484f58',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc'
      },
      allowProgRelGlyphs: true,
      allowTransparency: false
    })

    const fitAddonLocal = new FitAddon.FitAddon()
    term.loadAddon(fitAddonLocal)
    term.open(container)
    fitAddonLocal.fit()

    currentTerminal = term
    fitAddon = fitAddonLocal

    // Handle terminal output from main process
    const outputHandler = ({ sessionId, data }) => {
      if (sessionId === currentSessionId) {
        term.write(data)
      }
    }
    window.os.onSshOutput(outputHandler)

    const eventHandler = ({ sessionId, event }) => {
      if (sessionId === currentSessionId && event === 'disconnected') {
        term.write('\r\n\x1b[31m[连接已断开]\x1b[0m\r\n')
      }
    }
    window.os.onSshEvent(eventHandler)

    const errorHandler = ({ sessionId, error }) => {
      if (sessionId === currentSessionId) {
        term.write(`\r\n\x1b[31m[错误: ${error}]\x1b[0m\r\n`)
      }
    }
    window.os.onSshError(errorHandler)

    // Handle user input in terminal
    term.onData((data) => {
      if (currentSessionId) {
        window.os.sshWrite(currentSessionId, data)
      }
    })

    // Handle terminal resize
    term.onResize(({ cols, rows }) => {
      if (currentSessionId) {
        window.os.sshResize(currentSessionId, cols, rows)
      }
    })

    // Request password
    const askPassword = () => {
      term.write('\r\n')
      return new Promise((resolve) => {
        let passwordBuf = ''
        term.write('Password: ')
        const onData = (data) => {
          if (data === '\r') {
            term.offData(onData)
            term.write('\r\n')
            resolve(passwordBuf)
          } else if (data === '\x7f') {
            if (passwordBuf.length > 0) {
              passwordBuf = passwordBuf.slice(0, -1)
              term.write('\b \b')
            }
          } else if (data.length === 1 && data.charCodeAt(0) >= 32) {
            passwordBuf += data
            term.write('*')
          }
        }
        term.onData(onData)
      })
    }

    // Connect
    term.write(`Connecting to ${username}@${host}:${port}...\r\n`)
    const sessionId = 'ssh_' + Date.now()
    currentSessionId = sessionId

    // Try key-based auth first, fall back to password
    const connectResult = await window.os.sshConnect({
      sessionId,
      host,
      port,
      username,
      password: undefined,
      cols: term.cols,
      rows: term.rows
    })

    if (!connectResult.success) {
      if (connectResult.error && connectResult.error.includes('All configured authentication methods failed')) {
        // Need password
        const password = await askPassword()
        term.write('Authenticating...\r\n')
        const retryResult = await window.os.sshConnect({
          sessionId,
          host,
          port,
          username,
          password,
          cols: term.cols,
          rows: term.rows
        })
        if (!retryResult.success) {
          term.write(`\x1b[31m认证失败: ${retryResult.error}\x1b[0m\r\n`)
          return
        }
      } else {
        term.write(`\x1b[31m连接失败: ${connectResult.error}\x1b[0m\r\n`)
        term.write('\x1b[90m提示: 确认目标机器 SSH 服务已启动 (sudo systemctl start ssh)\x1b[0m\r\n')
        return
      }
    }

    // Hide hosts panel on successful connect
    const panel = document.getElementById('sshHostsPanel')
    if (panel) panel.style.display = 'none'
    
    term.focus()
  }

  // Connect button
  document.getElementById('sshConnectBtn').onclick = () => window.sshDoConnect()

  // Enter key in input
  document.getElementById('sshConnStr').onkeydown = (e) => {
    if (e.key === 'Enter') window.sshDoConnect()
  }

  // Delete host
  window.sshDelHost = (idx) => {
    let saved = JSON.parse(localStorage.getItem('glassos_ssh_hosts') || '[]')
    saved.splice(idx, 1)
    localStorage.setItem('glassos_ssh_hosts', JSON.stringify(saved))
    closeWindow('ssh')
    openSSH()
  }

  // Cleanup on window close — override global closeWindow
  const _origClose = window.closeWindow || closeWindow
  window.closeWindow = function(id) {
    if (id === 'ssh') {
      if (currentSessionId) {
        window.os.sshDisconnect(currentSessionId)
        currentSessionId = null
      }
      if (currentTerminal) {
        currentTerminal.dispose()
        currentTerminal = null
      }
    }
    _origClose(id)
  }
}
```

---

### Task 6: 样式 — SSH xterm 容器

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: 在 styles.css 末尾添加 SSH xterm 相关样式**

在 `styles.css` 文件末尾追加：

```css
/* ========== SSH xterm 容器 ========== */
.ssh-xterm-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #0d1117;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
}

.ssh-xterm-container .xterm {
  height: 100%;
  padding: 8px;
}

.ssh-xterm-container .xterm-viewport {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
}

.ssh-xterm-container .xterm-viewport::-webkit-scrollbar {
  width: 6px;
}

.ssh-xterm-container .xterm-viewport::-webkit-scrollbar-track {
  background: transparent;
}

.ssh-xterm-container .xterm-viewport::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
}

.ssh-xterm-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255,255,255,0.25);
  font-size: 14px;
  pointer-events: none;
}

.ssh-body {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 12px;
  padding: 0 12px 12px;
}

.app-ssh {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ssh-connect-bar {
  padding: 12px 12px 4px;
  flex-shrink: 0;
}

.ssh-connect-row {
  display: flex;
  gap: 8px;
}

.ssh-conn-input {
  flex: 1;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  color: #c9d1d9;
  font-family: 'SF Mono','Fira Code','Cascadia Code','Consolas',monospace;
  outline: none;
}

.ssh-conn-input:focus {
  border-color: rgba(88,166,255,0.5);
  box-shadow: 0 0 0 2px rgba(88,166,255,0.15);
}

.ssh-conn-input::placeholder {
  color: rgba(255,255,255,0.25);
}

.ssh-connect-btn {
  padding: 8px 20px;
  background: rgba(88,166,255,0.2);
  border: 1px solid rgba(88,166,255,0.3);
  border-radius: 8px;
  color: #58a6ff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}

.ssh-connect-btn:hover {
  background: rgba(88,166,255,0.3);
}

.ssh-connect-hint {
  color: rgba(255,255,255,0.3);
  font-size: 11px;
  margin-top: 6px;
  padding-left: 4px;
}

.ssh-hosts-panel {
  width: 180px;
  flex-shrink: 0;
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.05);
  overflow-y: auto;
}

.ssh-hosts-title {
  color: rgba(255,255,255,0.4);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding: 0 4px;
}

.ssh-hosts-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ssh-hosts-empty {
  color: rgba(255,255,255,0.2);
  font-size: 12px;
  text-align: center;
  padding: 20px 0;
}
```

---

### Task 7: 验证 — 运行并测试

- [ ] **Step 1: 启动应用**

```bash
cd "C:\Users\r\Desktop\GlassOS" && npm start
```

- [ ] **Step 2: 验证清单**

1. 双击 SSH 图标 → 窗口正常打开，连接栏和 xterm 终端可见
2. 输入 `user@虚拟机IP` → 点击连接
3. 出现密码提示 → 输入密码（密码被 * 遮蔽）
4. 登录成功 → 看到 shell 提示符
5. 执行 `ls`, `pwd`, `whoami` → 正常输出
6. 执行 `cd /tmp` 然后 `pwd` → 确认目录切换持久
7. 执行 `top` → 看到实时进程列表（按 q 退出）
8. 调整窗口大小 → 终端行列自适应
9. 输入 `exit` → 连接断开，显示断开提示
10. 历史连接出现在右侧面板，双击可快速填入

---

### Task 8: 清理旧代码

- [ ] **Step 1: 删除 styles.css 中的旧 SSH 样式**

如果 `styles.css` 中有以下旧 SSH 样式，建议保留作为后备，但可以删除不再使用的：
- `.ssh-sessions` / `.ssh-tab` / `.ssh-session` / `.ssh-session-output` / `.ssh-session-input-row` / `.ssh-session-prompt` / `.ssh-session-input` / `.ssh-session-line` / `.ssh-host-item` / `.ssh-host-icon` / `.ssh-host-name` / `.ssh-host-del`

这些是旧方案用的 div+input 样式，xterm 方案不再需要。但保留也无害——不会和现有代码冲突。建议本迭代先保留，后续统一清理。
