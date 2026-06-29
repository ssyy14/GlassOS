# SSH 交互终端 — 设计文档

**日期**: 2026-06-28
**目标**: 将 SSH 功能从"每命令一次连接"改为持久交互式终端（类似 MobaXterm）

---

## 现状问题

当前 `renderer.js` 中的 SSH 实现使用 `child_process.exec()` 逐条执行命令：

```js
// 每次用户输入 → 新开一个 SSH 连接 → 执行完就断
await window.os.execCommand(`ssh -o ... ${user}@${host} "${cmd}"`)
```

导致：
- `cd` 不持久（每次都新连接）
- 无流式输出（`exec()` 缓冲到命令结束后才返回）
- 无法运行交互程序（`vim`, `top`, `htop`, `nano`）
- 30 秒超时强制终止

## 目标体验

- 输入 IP 连接 Linux 虚拟机
- 持久 SSH 会话，真实交互终端
- 支持所有交互式命令（vim, top, htop 等）
- xterm.js 终端渲染，类 MobaXterm 体验

## 技术方案

使用 **ssh2** + **xterm.js**，两者均已在 `node_modules` 中。

### 架构

```
┌─ 渲染进程 ──────────────────────┐   IPC    ┌─ 主进程 ────────────────────────┐
│  xterm.js Terminal              │ ←─────→ │  ssh2 Client (持久连接)         │
│  ├─ onData → sshWrite(data)     │         │  ├─ ssh-connect  连接/认证       │
│  ├─ sshResize(cols,rows)        │         │  ├─ ssh-data     用户输入        │
│  └─ onSshData(cb) ← 服务器输出   │         │  ├─ ssh-resize   窗口尺寸同步    │
└─────────────────────────────────┘         │  └─ ssh-disconnect 断开连接      │
                                            └────────────────────────────────┘
                                                     ↕ TCP/SSH
                                                🐧 Linux 虚拟机
```

### IPC 通道设计

| 通道 | 方向 | 数据 | 说明 |
|------|------|------|------|
| `ssh-connect` | Renderer → Main | `{host, port, username, password?, privateKey?}` | 建立连接 |
| `ssh-data` | Renderer → Main | `{sessionId, data}` | 用户输入 |
| `ssh-resize` | Renderer → Main | `{sessionId, cols, rows}` | 终端大小变化 |
| `ssh-disconnect` | Renderer → Main | `{sessionId}` | 断开连接 |
| `ssh:output` | Main → Renderer | `{sessionId, data}` | 服务器输出(流式) |
| `ssh:error` | Main → Renderer | `{sessionId, error}` | 错误消息 |
| `ssh:connected` | Main → Renderer | `{sessionId}` | 连接成功通知 |

### 文件改动

| 文件 | 改动内容 |
|------|---------|
| `main.js` | + SSH Client Manager：创建 ssh2 连接、PTY shell、IPC handlers |
| `preload.js` | + 新 SSH API：`sshConnect()`, `sshWrite()`, `sshResize()`, `sshDisconnect()`, `onSshData(cb)`, `onSshEvent(cb)` |
| `renderer.js` | 重写 `openSSH()`：xterm.js 替代 div+input，连接界面 |
| `package.json` | + `"ssh2": "^1.16.0"` 到 dependencies |

### 连接流程

1. 用户打开 SSH 窗口，输入 `user@host` 或 IP
2. 创建 xterm.js Terminal 实例
3. IPC 调用 `ssh-connect`，主进程创建 ssh2 Client
4. ssh2 `on('ready')` → 启动 PTY shell (`{term: 'xterm-256color', cols, rows}`)
5. PTY `on('data')` → 推送到渲染进程 → xterm.write(data)
6. xterm `onData()` → 推送到主进程 → socket.write(data)
7. 连接断开或关闭窗口 → 清理连接

### 错误处理

- 认证失败 → xterm 显示错误消息，不崩溃
- 网络中断 → 自动清理连接，通知用户
- 主机不可达 → 连接超时(10s)后显示提示
- 连接已存在 → 复用现有会话或提示用户

### 遗留 / 不做

- 本迭代不包含 SFTP 文件传输
- 不包含 X11 转发
- 不包含 SCP
- 多个 SSH 标签页在现有会话框架内支持
