@echo off
echo ==========================================
echo   GlassOS 文件上传到 CentOS
echo ==========================================

set IP=192.168.10.1
set USER=root
set REMOTE=/root/GlassOS

echo 上传 build-iso 目录...
scp -r "C:\Users\r\Desktop\GlassOS\build-iso\*" %USER%@%IP%:%REMOTE%/build-iso/

echo 上传核心文件...
scp "C:\Users\r\Desktop\GlassOS\renderer.js" %USER%@%IP%:%REMOTE%/
scp "C:\Users\r\Desktop\GlassOS\main.js" %USER%@%IP%:%REMOTE%/
scp "C:\Users\r\Desktop\GlassOS\preload.js" %USER%@%IP%:%REMOTE%/
scp "C:\Users\r\Desktop\GlassOS\index.html" %USER%@%IP%:%REMOTE%/
scp "C:\Users\r\Desktop\GlassOS\styles.css" %USER%@%IP%:%REMOTE%/
scp "C:\Users\r\Desktop\GlassOS\player.js" %USER%@%IP%:%REMOTE%/
scp "C:\Users\r\Desktop\GlassOS\linux-simulator.js" %USER%@%IP%:%REMOTE%/
scp "C:\Users\r\Desktop\GlassOS\package.json" %USER%@%IP%:%REMOTE%/
scp "C:\Users\r\Desktop\GlassOS\package-lock.json" %USER%@%IP%:%REMOTE%/

echo ==========================================
echo 上传完成! 密码均为: 123456
echo ==========================================
pause
