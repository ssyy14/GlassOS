# GlassOS 上传脚本 - 自动输入密码
$ip = "192.168.10.1"
$user = "root"
$pass = "123456"
$src = "C:\Users\r\Desktop\GlassOS"
$dst = "/root/GlassOS"

Write-Host "GlassOS 上传到 CentOS VM ($ip)..." -ForegroundColor Cyan

# 创建远程目录
ssh -o StrictHostKeyChecking=no "$user@$ip" "mkdir -p $dst/build-iso"

# 上传 build-iso 脚本
Write-Host "上传 build-iso 脚本..."
scp -o StrictHostKeyChecking=no "$src\build-iso\build.sh" "$user@${ip}:${dst}/build-iso/"
scp -o StrictHostKeyChecking=no "$src\build-iso\create-iso.sh" "$user@${ip}:${dst}/build-iso/"

# 上传核心文件
$files = @("renderer.js","main.js","preload.js","index.html","styles.css","player.js","linux-simulator.js","package.json","package-lock.json")
foreach ($f in $files) {
    if (Test-Path "$src\$f") {
        Write-Host "上传: $f"
        scp -o StrictHostKeyChecking=no "$src\$f" "$user@${ip}:${dst}/"
    }
}

Write-Host "完成!" -ForegroundColor Green
