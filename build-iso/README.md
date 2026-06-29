# GlassOS Live ISO 构建指南

基于 CentOS 8 Stream 构建全功能 GlassOS 桌面系统 ISO。

## 目录结构

```
GlassOS/
├── renderer.js          # 保留 ✓
├── main.js              # 保留 ✓
├── preload.js           # 保留 ✓
├── player.js            # 保留 ✓
├── index.html           # 保留 ✓
├── styles.css           # 保留 ✓
├── linux-simulator.js   # 保留 ✓
├── package.json         # 保留 ✓
├── bin/                 # 保留 ✓
├── docs/                # 保留 ✓
├── node_modules/
├── build-iso/
│   ├── README.md
│   ├── build.sh
│   └── create-iso.sh
└── ...
```

## 构建步骤

### 1. 安装 CentOS 最小系统
- 用 CentOS 8 Stream ISO 安装最小系统
- 分区: / 20GB, /boot 1GB, swap 4GB

### 2. 将 GlassOS 上传到 CentOS
```bash
scp -r /path/to/GlassOS root@centos-ip:/root/
```

### 3. 运行构建
```bash
cd /root/GlassOS/build-iso
chmod +x build.sh create-iso.sh
sudo ./build.sh
sudo ./create-iso.sh
```

输出: `/tmp/glassos-live.iso`

## 默认账户

| 用户名 | 密码 |
|--------|------|
| root | glassos |
| glassos | glassos |
