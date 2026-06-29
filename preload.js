const { contextBridge, ipcRenderer } = require('electron')

const _sshCallbacks = { output: [], event: [], error: [] }

contextBridge.exposeInMainWorld('os', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  readDir: (p) => ipcRenderer.invoke('read-dir', p),
  readFile: (p) => ipcRenderer.invoke('read-file', p),
  writeFile: (p, c) => ipcRenderer.invoke('write-file', p, c),
  getHomeDir: () => ipcRenderer.invoke('get-homedir'),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  execCommand: (cmd, cwd) => ipcRenderer.invoke('exec-command', cmd, cwd),
  checkWSL: () => ipcRenderer.invoke('check-wsl'),
  // SSH APIs
  sshConnect: (opts) => ipcRenderer.invoke('ssh-connect', opts),
  sshWrite: (sessionId, data) => ipcRenderer.send('ssh-data', { sessionId, data }),
  sshResize: (sessionId, cols, rows) => ipcRenderer.send('ssh-resize', { sessionId, cols, rows }),
  sshDisconnect: (sessionId) => ipcRenderer.send('ssh-disconnect', { sessionId }),
  onSshOutput: (callback) => {
    _sshCallbacks.output.push(callback)
    ipcRenderer.on('ssh:output', (_event, data) => callback(data))
  },
  offSshOutput: (callback) => {
    _sshCallbacks.output = _sshCallbacks.output.filter(cb => cb !== callback)
  },
  onSshEvent: (callback) => {
    _sshCallbacks.event.push(callback)
    ipcRenderer.on('ssh:event', (_event, data) => callback(data))
  },
  offSshEvent: (callback) => {
    _sshCallbacks.event = _sshCallbacks.event.filter(cb => cb !== callback)
  },
  onSshError: (callback) => {
    _sshCallbacks.error.push(callback)
    ipcRenderer.on('ssh:error', (_event, data) => callback(data))
  },
  offSshError: (callback) => {
    _sshCallbacks.error = _sshCallbacks.error.filter(cb => cb !== callback)
  },
  removeAllSshListeners: () => {
    ipcRenderer.removeAllListeners('ssh:output')
    ipcRenderer.removeAllListeners('ssh:event')
    ipcRenderer.removeAllListeners('ssh:error')
    _sshCallbacks.output = []
    _sshCallbacks.event = []
    _sshCallbacks.error = []
  },
  // Weather
  getWeather: (coords) => ipcRenderer.invoke('get-weather', coords),
  // Clipboard
  clipboardRead: () => ipcRenderer.invoke('clipboard-read'),
  clipboardWrite: (text) => ipcRenderer.invoke('clipboard-write', text),
  // File import
  importFiles: (paths) => ipcRenderer.invoke('import-files', paths),
  openFilesDir: () => ipcRenderer.invoke('open-files-dir'),
  launchExe: (path) => ipcRenderer.invoke('launch-exe', path),
  // SFTP APIs
  sftpOpen: (opts) => ipcRenderer.invoke('sftp-open', opts),
  sftpList: (opts) => ipcRenderer.invoke('sftp-list', opts),
  sftpStat: (opts) => ipcRenderer.invoke('sftp-stat', opts),
  sftpRead: (opts) => ipcRenderer.invoke('sftp-read', opts),
  sftpDownload: (opts) => ipcRenderer.invoke('sftp-download', opts),
  sftpUpload: (opts) => ipcRenderer.invoke('sftp-upload', opts),
  sftpUploadFile: (opts) => ipcRenderer.invoke('sftp-upload-file', opts),
  sftpMkdir: (opts) => ipcRenderer.invoke('sftp-mkdir', opts),
  sftpDelete: (opts) => ipcRenderer.invoke('sftp-delete', opts),
  sftpRename: (opts) => ipcRenderer.invoke('sftp-rename', opts),
  // 锁屏密码
  getLockPassword: () => ipcRenderer.invoke('get-lock-password'),
  setLockPassword: (pwd) => ipcRenderer.invoke('set-lock-password', pwd),
  // 截图
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  saveScreenshot: (opts) => ipcRenderer.invoke('save-screenshot', opts),
  // 磁盘信息
  getDiskInfo: () => ipcRenderer.invoke('get-disk-info'),
})
