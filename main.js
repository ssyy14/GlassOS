const { app, BrowserWindow, ipcMain, dialog, shell, clipboard } = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs')
const { exec, execSync } = require('child_process')
const { Client } = require('ssh2')

let mainWindow

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
    backgroundColor: '#050508',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true
    }
  })

  mainWindow.loadFile('index.html')
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.webContents.on('console-message', (e, level, message) => {
    console.log('[Renderer]', message)
  })
  mainWindow.on('closed', () => { mainWindow = null })

  ipcMain.handle('get-system-info', async () => {
    const cpus = os.cpus()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()

    // CPU 使用率
    const cpuUsage = cpus.reduce((acc, core) => {
      const total = Object.values(core.times).reduce((a, b) => a + b, 0)
      const idle = core.times.idle || 0
      return { total: acc.total + total, idle: acc.idle + idle }
    }, { total: 0, idle: 0 })

    // 磁盘信息
    let disks = []
    try {
      if (process.platform === 'win32') {
        const out = execSync('powershell -NoProfile -Command "Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID,Size,FreeSpace | ForEach-Object { \\"$($_.DeviceID),$($_.Size),$($_.FreeSpace)\\" }"', { encoding: 'utf8', timeout: 8000 })
        disks = out.trim().split('\n').filter(l => l.trim()).map(line => {
          const parts = line.trim().split(',')
          return { mount: parts[0], size: parseInt(parts[1]) || 0, free: parseInt(parts[2]) || 0 }
        }).filter(d => d.size > 0)
      } else {
        const out = execSync("df -B1 / /home 2>/dev/null | tail -n +2", { encoding: 'utf8', timeout: 5000 })
        disks = out.trim().split('\n').map(line => {
          const p = line.trim().split(/\s+/)
          return { mount: p[5], size: parseInt(p[1]), free: parseInt(p[3]) }
        }).filter(d => d.size > 0)
      }
    } catch (e) { /* ignore */ }

    // 进程数
    let processCount = 0
    try {
      if (process.platform === 'win32') {
        const out = execSync('tasklist /fo csv /nh', { encoding: 'utf8', timeout: 5000 })
        processCount = out.trim().split('\n').filter(l => l.trim()).length
      } else {
        processCount = parseInt(execSync('ps aux --no-headers 2>/dev/null | wc -l', { encoding: 'utf8', timeout: 5000 }).trim()) || 0
      }
    } catch (e) { /* ignore */ }

    // 网络接口
    const netInterfaces = os.networkInterfaces()
    const netNames = Object.keys(netInterfaces).filter(k => netInterfaces[k] && netInterfaces[k].length > 0 && !netInterfaces[k][0].internal)

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

  ipcMain.handle('read-dir', (e, dirPath) => {
    try {
      return fs.readdirSync(dirPath).map(name => {
        const fullPath = path.join(dirPath, name)
        const stat = fs.statSync(fullPath)
        return { name, isDir: stat.isDirectory(), size: stat.size, mtime: stat.mtime }
      })
    } catch { return [] }
  })

  ipcMain.handle('read-file', (e, fp) => {
    try { return fs.readFileSync(fp, 'utf-8') } catch { return '' }
  })

  ipcMain.handle('write-file', (e, fp, c) => {
    try { fs.writeFileSync(fp, c, 'utf-8'); return true } catch { return false }
  })

  ipcMain.handle('get-homedir', () => os.homedir())

  ipcMain.on('window-minimize', () => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize() })
  ipcMain.on('window-maximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
    }
  })
  ipcMain.on('window-close', () => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close() })

  // ========== 锁屏密码（文件存储） ==========
  const pwdFile = path.join(app.getPath('userData'), 'lock-password.json')

  ipcMain.handle('get-lock-password', () => {
    try {
      if (fs.existsSync(pwdFile)) {
        return JSON.parse(fs.readFileSync(pwdFile, 'utf-8')).password || '1234'
      }
    } catch(e) {}
    return '1234'
  })

  ipcMain.handle('set-lock-password', (_e, newPwd) => {
    try {
      fs.writeFileSync(pwdFile, JSON.stringify({ password: newPwd }), 'utf-8')
      return true
    } catch(e) { return false }
  })

  // ========== 专用磁盘信息 ==========
  ipcMain.handle('get-disk-info', () => {
    const disks = []
    try {
      if (process.platform === 'win32') {
        const out = execSync('powershell -NoProfile -Command "Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID,Size,FreeSpace | ForEach-Object { \\"$($_.DeviceID),$($_.Size),$($_.FreeSpace)\\" }"', { encoding: 'utf8', timeout: 10000 })
        out.trim().split('\n').filter(l => l.trim()).forEach(line => {
          const parts = line.trim().split(',')
          const mount = parts[0]
          const size = parseInt(parts[1]) || 0
          const free = parseInt(parts[2]) || 0
          if (size > 0) disks.push({ mount, size, free })
        })
      } else {
        const out = execSync('df -B1 / 2>/dev/null | tail -n +2', { encoding: 'utf8', timeout: 5000 })
        out.trim().split('\n').forEach(line => {
          const p = line.trim().split(/\s+/)
          const size = parseInt(p[1]) || 0
          const free = parseInt(p[3]) || 0
          if (size > 0) disks.push({ mount: p[5] || '/', size, free })
        })
      }
    } catch(e) { /* fallback: try fs statfs */ }
    return disks
  })

  ipcMain.handle('open-external', (e, url) => shell.openExternal(url))

  ipcMain.handle('exec-command', async (e, cmd, cwd) => {
    return new Promise((resolve) => {
      const options = {
        cwd: cwd || os.homedir(),
        env: { ...process.env, TERM: 'xterm-256color' },
        timeout: 30000,
        maxBuffer: 1024 * 1024
      }

      exec(cmd, options, (error, stdout, stderr) => {
        resolve({
          stdout: stdout || '',
          stderr: stderr || '',
          error: error ? error.message : null,
          code: error ? error.code : 0
        })
      })
    })
  })

  ipcMain.handle('check-wsl', () => {
    try {
      const result = execSync('wsl --list --quiet 2>nul', { encoding: 'utf-8', timeout: 5000 }).trim()
      return result.length > 0
    } catch { return false }
  })

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
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('ssh:output', { sessionId, data: data.toString('utf-8') })
            }
          })

          stream.stderr.on('data', (data) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('ssh:output', { sessionId, data: data.toString('utf-8') })
            }
          })

          stream.on('close', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('ssh:event', { sessionId, event: 'disconnected' })
            }
            delete sshConnections[sessionId]
          })

          stream.on('error', (err) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('ssh:error', { sessionId, error: err.message })
            }
          })

          resolve({ success: true })
        })
      })

      conn.on('error', (err) => {
        delete sshConnections[sessionId]
        resolve({ success: false, error: err.message })
      })

      conn.connect({
        host,
        port: port || 22,
        username: username || 'root',
        password,
        readyTimeout: 10000
      })
    })
  })

  ipcMain.on('ssh-data', (e, { sessionId, data }) => {
    const entry = sshConnections[sessionId]
    if (entry && entry.stream) {
      entry.stream.write(data)
    }
  })

  ipcMain.on('ssh-resize', (e, { sessionId, cols, rows }) => {
    const entry = sshConnections[sessionId]
    if (entry && entry.stream) {
      entry.stream.setWindow(rows, cols, 0, 0)
    }
  })

  ipcMain.on('ssh-disconnect', (e, { sessionId }) => {
    const entry = sshConnections[sessionId]
    if (entry) {
      if (entry.sftp) { try { entry.sftp.end() } catch(e) {} }
      if (entry.stream) entry.stream.end()
      entry.client.end()
      delete sshConnections[sessionId]
    }
  })

  // ========== SFTP ==========
  ipcMain.handle('sftp-open', async (e, { sessionId }) => {
    const entry = sshConnections[sessionId]
    if (!entry || !entry.client) return { success: false, error: 'SSH connection not found' }
    if (entry.sftp) return { success: true }
    return new Promise((resolve) => {
      entry.client.sftp((err, sftp) => {
        if (err) return resolve({ success: false, error: err.message })
        entry.sftp = sftp
        resolve({ success: true })
      })
    })
  })

  ipcMain.handle('sftp-list', async (e, { sessionId, remotePath }) => {
    const entry = sshConnections[sessionId]
    if (!entry || !entry.sftp) return { error: 'SFTP not connected' }
    return new Promise((resolve) => {
      entry.sftp.readdir(remotePath, (err, list) => {
        if (err) return resolve({ error: err.message })
        const items = list.map(item => ({
          name: item.filename,
          isDir: item.attrs.isDirectory(),
          isLink: item.attrs.isSymbolicLink ? item.attrs.isSymbolicLink() : false,
          size: item.attrs.size,
          mode: item.attrs.mode,
          mtime: item.attrs.mtime,
          uid: item.attrs.uid,
          gid: item.attrs.gid
        }))
        items.sort((a, b) => {
          if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
          return a.name.localeCompare(b.name)
        })
        resolve({ path: remotePath, items })
      })
    })
  })

  ipcMain.handle('sftp-stat', async (e, { sessionId, remotePath }) => {
    const entry = sshConnections[sessionId]
    if (!entry || !entry.sftp) return { error: 'SFTP not connected' }
    return new Promise((resolve) => {
      entry.sftp.stat(remotePath, (err, stats) => {
        if (err) return resolve({ error: err.message })
        resolve({ isDir: stats.isDirectory(), isLink: stats.isSymbolicLink ? stats.isSymbolicLink() : false, size: stats.size, mode: stats.mode, mtime: stats.mtime })
      })
    })
  })

  ipcMain.handle('sftp-read', async (e, { sessionId, remotePath }) => {
    const entry = sshConnections[sessionId]
    if (!entry || !entry.sftp) return { error: 'SFTP not connected' }
    return new Promise((resolve) => {
      const chunks = []
      const stream = entry.sftp.createReadStream(remotePath)
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => resolve({ data: Buffer.concat(chunks).toString('utf-8') }))
      stream.on('error', (err) => resolve({ error: err.message }))
    })
  })

  ipcMain.handle('sftp-download', async (e, { sessionId, remotePath }) => {
    const entry = sshConnections[sessionId]
    if (!entry || !entry.sftp) return { error: 'SFTP not connected' }
    const fileName = path.basename(remotePath)
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: path.join(os.homedir(), 'Downloads', fileName),
      filters: [{ name: 'All Files', extensions: ['*'] }]
    })
    if (result.canceled) return { canceled: true }
    return new Promise((resolve) => {
      entry.sftp.fastGet(remotePath, result.filePath, (err) => {
        if (err) return resolve({ error: err.message })
        resolve({ success: true, localPath: result.filePath })
      })
    })
  })

  ipcMain.handle('sftp-upload', async (e, { sessionId, remotePath, localPath }) => {
    const entry = sshConnections[sessionId]
    if (!entry || !entry.sftp) return { error: 'SFTP not connected' }
    return new Promise((resolve) => {
      entry.sftp.fastPut(localPath, remotePath, (err) => {
        if (err) return resolve({ error: err.message })
        resolve({ success: true })
      })
    })
  })

  ipcMain.handle('sftp-upload-file', async (e, { sessionId, remoteDir }) => {
    const entry = sshConnections[sessionId]
    if (!entry || !entry.sftp) return { error: 'SFTP not connected' }
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'All Files', extensions: ['*'] }]
    })
    if (result.canceled || !result.filePaths.length) return { canceled: true }
    const localPath = result.filePaths[0]
    const fileName = path.basename(localPath)
    const remoteFilePath = remoteDir.endsWith('/') ? remoteDir + fileName : remoteDir + '/' + fileName
    return new Promise((resolve) => {
      entry.sftp.fastPut(localPath, remoteFilePath, (err) => {
        if (err) return resolve({ error: err.message })
        resolve({ success: true, remotePath: remoteFilePath })
      })
    })
  })

  ipcMain.handle('sftp-mkdir', async (e, { sessionId, remotePath }) => {
    const entry = sshConnections[sessionId]
    if (!entry || !entry.sftp) return { error: 'SFTP not connected' }
    return new Promise((resolve) => {
      entry.sftp.mkdir(remotePath, (err) => {
        if (err) return resolve({ error: err.message })
        resolve({ success: true })
      })
    })
  })

  ipcMain.handle('sftp-delete', async (e, { sessionId, remotePath, isDir }) => {
    const entry = sshConnections[sessionId]
    if (!entry || !entry.sftp) return { error: 'SFTP not connected' }
    return new Promise((resolve) => {
      const cb = (err) => { if (err) return resolve({ error: err.message }); resolve({ success: true }) }
      if (isDir) entry.sftp.rmdir(remotePath, cb)
      else entry.sftp.unlink(remotePath, cb)
    })
  })

  ipcMain.handle('sftp-rename', async (e, { sessionId, oldPath, newPath }) => {
    const entry = sshConnections[sessionId]
    if (!entry || !entry.sftp) return { error: 'SFTP not connected' }
    return new Promise((resolve) => {
      entry.sftp.rename(oldPath, newPath, (err) => {
        if (err) return resolve({ error: err.message })
        resolve({ success: true })
      })
    })
  })
})

// ========== 天气 API ==========
function httpsGetJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? require('https') : require('http')
    const req = mod.get(url, (res) => {
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpsGetJSON(res.headers.location).then(resolve).catch(reject)
      }
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch (e) { reject(new Error('JSON parse error')) }
      })
    })
    req.on('error', reject)
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

ipcMain.handle('get-weather', async (_e, coords) => {
  try {
    let lat, lon, city = '', country = ''

    if (coords && coords.lat && coords.lon) {
      // 方式1：使用浏览器传来的 GPS 坐标
      lat = coords.lat
      lon = coords.lon
      // 反向地理编码获取城市名
      try {
        const geo = await httpsGetJSON(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=zh`)
        city = (geo.address && (geo.address.city || geo.address.town || geo.address.county || geo.address.state)) || ''
        country = (geo.address && geo.address.country) || ''
      } catch (e) { /* 城市名获取失败不影响天气 */ }
    }

    if (!lat || !lon) {
      // 方式2：IP 定位回退
      try {
        const loc = await httpsGetJSON('https://api.ip.sb/geoip')
        if (loc.latitude && loc.longitude) {
          lat = loc.latitude
          lon = loc.longitude
          city = loc.city || ''
          country = loc.country || ''
        }
      } catch (e) {
        // 尝试备用 IP 定位服务
        try {
          const loc = await httpsGetJSON('http://ip-api.com/json/?fields=city,lat,lon,country')
          if (loc.lat && loc.lon) {
            lat = loc.lat
            lon = loc.lon
            city = loc.city || ''
            country = loc.country || ''
          }
        } catch (e2) {
          return { error: '无法获取位置信息，请检查网络连接' }
        }
      }
    }

    if (!lat || !lon) {
      return { error: '无法获取位置信息' }
    }

    // 获取天气数据 (Open-Meteo, 免费无需Key)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,pressure_msl&timezone=auto`
    const data = await httpsGetJSON(weatherUrl)
    const c = data.current

    return {
      city: city || '当前城市',
      country: country || '',
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      pressure: c.pressure_msl,
      weatherCode: c.weather_code,
      description: weatherCodeToText(c.weather_code),
      icon: weatherCodeToIcon(c.weather_code)
    }
  } catch (e) {
    return { error: '天气服务暂不可用: ' + (e.message || '网络错误') }
  }
})

function weatherCodeToText(code) {
  const map = {
    0: '晴朗', 1: '大部晴朗', 2: '多云', 3: '阴天',
    45: '雾', 48: '冻雾',
    51: '小毛毛雨', 53: '毛毛雨', 55: '大毛毛雨',
    61: '小雨', 63: '中雨', 65: '大雨',
    71: '小雪', 73: '中雪', 75: '大雪',
    80: '小阵雨', 81: '阵雨', 82: '大阵雨',
    95: '雷暴', 96: '冰雹雷暴', 99: '强雷暴'
  }
  return map[code] || '未知'
}

function weatherCodeToIcon(code) {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌧️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌦️'
  if (code <= 99) return '⛈️'
  return '🌤️'
}

  // ========== 剪贴板互通 ==========
  ipcMain.handle('clipboard-read', () => clipboard.readText())
  ipcMain.handle('clipboard-write', (_e, text) => { clipboard.writeText(text); return true })

  // ========== 文件拖放导入 ==========
  ipcMain.handle('import-files', async (_e, filePaths) => {
    const targetDir = path.join(os.homedir(), 'GlassOS-Files')
    try { if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true }) } catch(e) {}
    const results = []
    for (const src of filePaths) {
      const name = path.basename(src)
      const dest = path.join(targetDir, name)
      try {
        fs.copyFileSync(src, dest)
        results.push({ name, dest, success: true })
      } catch (e) {
        results.push({ name, dest, success: false, error: e.message })
      }
    }
    return { targetDir, results }
  })

  ipcMain.handle('launch-exe', (_e, exePath) => {
    try {
      exec(`"${exePath}"`, { cwd: path.dirname(exePath), detached: true, windowsHide: false }, () => {})
      return true
    } catch(e) { return false }
  })

  ipcMain.handle('open-files-dir', () => {
    const targetDir = path.join(os.homedir(), 'GlassOS-Files')
    try { if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true }) } catch(e) {}
    shell.openPath(targetDir)
  })

  // ========== 截图工具 ==========
  const { desktopCapturer } = require('electron')

  ipcMain.handle('capture-screen', async () => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } })
      if (!sources || sources.length === 0) return { error: '未找到屏幕源' }
      const thumbnail = sources[0].thumbnail
      if (thumbnail.isEmpty()) return { error: '截图为空' }
      return { dataUrl: thumbnail.toDataURL(), width: thumbnail.getSize().width, height: thumbnail.getSize().height }
    } catch (e) {
      return { error: e.message }
    }
  })

  ipcMain.handle('save-screenshot', async (_e, { dataUrl, defaultName }) => {
    try {
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64, 'base64')
      const screenshotsDir = path.join(os.homedir(), 'GlassOS-Files', 'Screenshots')
      if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true })
      const filePath = path.join(screenshotsDir, defaultName || `screenshot_${Date.now()}.png`)
      fs.writeFileSync(filePath, buffer)
      return { success: true, path: filePath }
    } catch (e) {
      return { success: false, error: e.message }
    }
  })

  app.on('window-all-closed', () => app.quit())

