#!/bin/bash
set -e

echo "=========================================="
echo "  GlassOS ISO 生成脚本"
echo "=========================================="

ISO_NAME="glassos-live"
ISO_DIR="/tmp/${ISO_NAME}"
OUTPUT="/tmp/${ISO_NAME}.iso"

# 安装工具
echo "[1/3] 安装 ISO 工具..."
yum install -y xorriso syslinux genisoimage

# 准备目录
echo "[2/3] 准备 ISO 目录..."
rm -rf $ISO_DIR
mkdir -p $ISO_DIR/isolinux

# 复制内核
KERNEL=$(ls /boot/vmlinuz-* 2>/dev/null | sort -V | tail -1)
INITRD=$(ls /boot/initramfs-* 2>/dev/null | sort -V | tail -1)

if [ -z "$KERNEL" ]; then
  echo "错误: 未找到内核，请先安装 kernel"
  exit 1
fi

cp $KERNEL $ISO_DIR/isolinux/vmlinuz
cp $INITRD $ISO_DIR/isolinux/initrd.img

# 创建启动配置
cat > $ISO_DIR/isolinux/isolinux.cfg << 'CFGEOF'
DEFAULT glassos
PROMPT 0
TIMEOUT 50
MENU TITLE GlassOS Live

LABEL glassos
  MENU DEFAULT
  KERNEL /isolinux/vmlinuz
  APPEND initrd=/isolinux/initrd.img root=live:CDLABEL=GLASSOS live quiet rhgb

LABEL glassos-verbose
  MENU LABEL GlassOS (verbose)
  KERNEL /isolinux/vmlinuz
  APPEND initrd=/isolinux/initrd.img root=live:CDLABEL=GLASSOS live
CFGEOF

# 复制 syslinux 模块
cp /usr/share/syslinux/isolinux.bin $ISO_DIR/isolinux/ 2>/dev/null || true
cp /usr/share/syslinux/ldlinux.c32 $ISO_DIR/isolinux/ 2>/dev/null || true
cp /usr/share/syslinux/menu.c32 $ISO_DIR/isolinux/ 2>/dev/null || true
cp /usr/share/syslinux/libcom32.c32 $ISO_DIR/isolinux/ 2>/dev/null || true
cp /usr/share/syslinux/libutil.c32 $ISO_DIR/isolinux/ 2>/dev/null || true

# 生成 ISO
echo "[3/3] 生成 ISO..."

genisoimage -o $OUTPUT \
  -b isolinux/isolinux.bin \
  -c isolinux/boot.cat \
  -no-emul-boot \
  -boot-load-size 4 \
  -boot-info-table \
  -R -J \
  -V "GLASSOS" \
  $ISO_DIR

echo ""
echo "=========================================="
echo "  ISO 生成完成！"
echo "  文件: $OUTPUT"
echo "  大小: $(du -h $OUTPUT | cut -f1)"
echo "=========================================="
