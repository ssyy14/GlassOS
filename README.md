# GlassOS - 液态玻璃主题桌面系统

基于 Electron 的液态玻璃风格桌面操作系统，内置 20+ 应用，支持运行真实 Linux 内核。

![GlassOS](https://img.shields.io/badge/GlassOS-v1.0-blue?style=flat-square) ![Electron](https://img.shields.io/badge/Electron-42.5-purple?style=flat-square) ![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)

## 启动方式

```bash
# 克隆仓库
git clone https://github.com/ssyy14/GlassOS.git
cd GlassOS

# 安装依赖
npm install

# 启动
npm start
```

或双击 `启动.bat` 快速启动。

## 内置应用

### 系统应用
- **访达** - 文件浏览器
- **终端** - 本地命令行工具
- **Linux** - JS 模拟的 Linux 命令练习环境（200+ 命令）
- **🐧 Linux 内核** - 基于 v86 的真实 Linux 内核启动（WebAssembly）
- **设置** - 系统设置（主题、玻璃效果、透明度等）

### 工具应用
- **备忘录** - 文本编辑
- **计算器** - 四则运算
- **换算器** - 单位换算
- **番茄钟** - 番茄工作法计时器
- **日历** - 日历查看

### 网络应用
- **SSH** - SSH 远程连接 + SFTP 文件管理
- **浏览器** - 内置网页浏览器
- **天气** - 实时天气展示

### 系统监控
- **监视器** - CPU/内存/磁盘监控
- **进程管理** - 进程查看与管理
- **磁盘分析** - 磁盘空间分析

### 其他
- **音乐** - 音乐播放器
- **Mineradio** - 外部应用启动
- **开发者工具** - 开发辅助
- **剪贴板** - 剪贴板管理
- **回收站** - 文件回收

## Linux 内核集成

GlassOS 内置 v86 WebAssembly 模拟器，可在浏览器中直接启动真实 Linux 内核：

- 基于 [v86](https://github.com/nicehash/nicehash-v86) 项目
- 通过 WebAssembly 运行 x86 指令集
- 支持 VGA 显示和键盘输入
- 首次启动自动下载内核镜像（~50MB）

## 技术栈

- **Electron 42** - 桌面应用框架
- **v86** - x86 PC 模拟器（WebAssembly）
- **xterm.js** - 终端模拟器
- **ssh2** - SSH/SFTP 客户端
- **原生 HTML/CSS/JS** - 零框架依赖
- **液态玻璃（Glassmorphism）** - UI 设计风格

## 文件结构

```
GlassOS/
├── main.js              # Electron 主进程
├── preload.js           # 预加载脚本（IPC 桥接）
├── index.html           # 主界面
├── styles.css           # 液态玻璃样式
├── renderer.js          # 窗口管理和应用逻辑
├── linux-simulator.js   # JS Linux 命令模拟器
├── v86-linux.js         # v86 Linux 内核集成
├── player.js            # 音乐播放器
├── package.json         # 项目配置
├── bin/                 # 工具二进制文件
├── build-iso/           # ISO 构建脚本
└── 启动.bat             # 快捷启动
```

## 特性

- 20+ 内置应用
- 真实 Linux 内核支持（v86/WASM）
- SSH/SFTP 远程连接
- 可自定义的玻璃效果主题（6 种预设）
- Spotlight 全局搜索
- Launchpad 应用启动台
- 锁屏密码保护
- 通知中心
- 窗口动画与拖拽
- 多窗口管理

## 安装

```bash
# 确保已安装 Node.js >= 16
npm install
npm start
```

## 许可证

ISC License
