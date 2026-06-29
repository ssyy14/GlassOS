#!/bin/bash
set -e

echo "=========================================="
echo "  GlassOS Live ISO 构建脚本"
echo "  适配 CentOS 7"
echo "=========================================="

# ========== 1. 基础环境配置 ==========
echo "[1/8] 配置基础环境..."

timedatectl set-timezone Asia/Shanghai 2>/dev/null || ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hostnamectl set-hostname glassos 2>/dev/null || echo "glassos" > /etc/hostname

# 禁用 SELinux
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config 2>/dev/null || true
setenforce 0 2>/dev/null || true

# 禁用 firewalld
systemctl stop firewalld 2>/dev/null || true
systemctl disable firewalld 2>/dev/null || true

# ========== 2. 安装 EPEL 和依赖 ==========
echo "[2/8] 安装软件源和依赖..."

yum install -y epel-release
yum install -y \
  xorg-x11-server-Xorg \
  xorg-x11-server-Xvfb \
  xorg-x11-utils \
  xorg-x11-fonts* \
  dbus-x11 \
  mesa-libEGL \
  mesa-libGL \
  mesa-dri-drivers \
  libXScrnSaver \
  libXtst \
  atk \
  at-spi2-atk \
  cups-libs \
  libdrm \
  libgbm \
  gtk3 \
  nss \
  alsa-lib \
  libXcomposite \
  libXcursor \
  libXdamage \
  libXext \
  libXfixes \
  libXi \
  libXrandr \
  libXrender \
  pango \
  cairo \
  wget \
  git \
  curl \
  htop \
  vim \
  nano \
  NetworkManager \
  wpa_supplicant \
  pulseaudio \
  pavucontrol

# ========== 3. 安装 Node.js 和 npm ==========
echo "[3/8] 安装 Node.js..."

curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

echo "Node.js $(node -v) 已安装"
echo "npm $(npm -v) 已安装"

# ========== 4. 安装 Electron ==========
echo "[4/8] 安装 Electron..."

npm install -g electron@28.0.0

# ========== 5. 部署 GlassOS ==========
echo "[5/8] 部署 GlassOS..."

GLASSOS_DIR="/opt/glassos"
mkdir -p $GLASSOS_DIR

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ ! -f "$PROJECT_DIR/renderer.js" ]; then
  echo "错误: 未找到 GlassOS 源码 (renderer.js)"
  exit 1
fi

echo "源码目录: $PROJECT_DIR"

# 复制核心文件
echo "复制核心文件..."
for f in main.js preload.js renderer.js player.js linux-simulator.js index.html styles.css package.json package-lock.json README.md; do
  if [ -f "$PROJECT_DIR/$f" ]; then
    cp "$PROJECT_DIR/$f" "$GLASSOS_DIR/"
    echo "  $f"
  fi
done

# 复制目录
for d in bin docs .superpowers; do
  if [ -d "$PROJECT_DIR/$d" ]; then
    cp -r "$PROJECT_DIR/$d" "$GLASSOS_DIR/"
    echo "  $d/"
  fi
done

# 安装 npm 依赖
cd $GLASSOS_DIR
echo "安装 npm 依赖..."
npm install 2>&1 | tail -3
echo "GlassOS 部署完成"

# ========== 6. 配置自动启动 ==========
echo "[6/8] 配置自动启动..."

cat > /usr/local/bin/glassos-start << 'STARTEOF'
#!/bin/bash
export DISPLAY=:0
export ELECTRON_ENABLE_LOGGING=1
export ELECTRON_DISABLE_SECURITY_WARNINGS=true
sleep 2
cd /opt/glassos
exec electron . --no-sandbox --disable-gpu-compositing --disable-software-rasterizer --in-process-gpu --disable-dev-shm-usage
STARTEOF
chmod +x /usr/local/bin/glassos-start

cat > /usr/local/bin/glassos-desktop << 'DESKTOPEOF'
#!/bin/bash
X :0 -ac -nolisten tcp &
XPID=$!
sleep 1
/usr/local/bin/glassos-start &
GPID=$!
wait $GPID
kill $XPID 2>/dev/null
DESKTOPEOF
chmod +x /usr/local/bin/glassos-desktop

# 自动登录 tty1
mkdir -p /etc/systemd/system/getty@tty1.service.d
cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf << 'LOGINEOF'
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin root --noclear %I $TERM
LOGINEOF

cat > /root/.bash_profile << 'BASHEOF'
if [ -z "$DISPLAY" ] && [ "$(tty)" = "/dev/tty1" ]; then
  exec startx /usr/local/bin/glassos-desktop
fi
BASHEOF

# ========== 7. 配置网络 ==========
echo "[7/8] 配置网络..."

systemctl enable NetworkManager
systemctl start NetworkManager

# ========== 8. 清理 ==========
echo "[8/8] 清理..."

yum clean all
rm -rf /var/cache/yum/*
rm -rf /tmp/*
find /var/log -type f -exec truncate -s 0 {} \; 2>/dev/null || true
rm -rf /root/.bash_history
history -c

echo "root:glassos" | chpasswd
useradd -m -G wheel -s /bin/bash glassos 2>/dev/null || true
echo "glassos:glassos" | chpasswd

echo ""
echo "=========================================="
echo "  GlassOS 构建完成！"
echo "  运行 create-iso.sh 生成 ISO"
echo "=========================================="
