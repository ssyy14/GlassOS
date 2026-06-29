let windowZIndex = 10
let activeWindow = null
let dragState = null
const windows = {}

// ========== 脚本懒加载 ==========
let activeWidgets = ['clock','weather','cpu']
const _loadedScripts = {}
function loadScript(src) {
  if (_loadedScripts[src]) return _loadedScripts[src]
  const p = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => { _loadedScripts[src] = p; resolve() }
    script.onerror = () => reject(new Error('Failed to load: ' + src))
    document.head.appendChild(script)
  })
  _loadedScripts[src] = p
  return p
}

// ========== 设置管理与持久化 ==========
const DEFAULT_SETTINGS = {
  darkMode: true, transparency: true, dynamicBg: true, windowAnim: true,
  blurBg: 50, blurWindow: 25, blurTopbar: 18, blurDock: 8,
  saturateBg: 160, saturateWindow: 140, saturateTopbar: 130,
  glassThickness: 0.05,
  orbOpacity: 0.6, orbSize: 0.8, orbSpeed: 0.6,
  orb1Color: '#ff6b6b', orb2Color: '#4ecdc4', orb3Color: '#a855f7', orb4Color: '#3b82f6',
  mouseLight: true, mouseLightIntensity: 0.02,
  mouseGlass: false, mouseGlassIntensity: 0.02,
  caustic: false, causticOpacity: 0.15,
  streaks: false, streakOpacity: 0.25,
  glassPulse: false,
  vignette: true, vignetteOpacity: 1,
  grid: true, gridOpacity: 0.5,
  noise: true, noiseOpacity: 0.03,
  waterSurface: false,
  multiRipple: true, waveDistort: true, edgeShimmer: true,
  shimmerSpeed: 8,
}

const PRESETS = {
  crystal: {
    name: '水晶', icon: '💎',
    blurBg: 60, blurWindow: 30, blurTopbar: 22, blurDock: 10,
    saturateBg: 140, saturateWindow: 130, saturateTopbar: 120,
    glassThickness: 0.035,
    orbOpacity: 0.5, orbSize: 0.9, orbSpeed: 0.8,
    orb1Color: '#d4e4ff', orb2Color: '#e0ecff', orb3Color: '#c8dcff', orb4Color: '#dce8ff',
    mouseLightIntensity: 0.04, mouseGlassIntensity: 0.02,
    causticOpacity: 0.3, streakOpacity: 0.4,
    vignetteOpacity: 0.4, gridOpacity: 0.35, noiseOpacity: 0.02,
    waterSurface: true,
  },
  obsidian: {
    name: '黑曜石', icon: '🖤',
    blurBg: 55, blurWindow: 28, blurTopbar: 20, blurDock: 10,
    saturateBg: 90, saturateWindow: 80, saturateTopbar: 70,
    glassThickness: 0.09,
    orbOpacity: 0.35, orbSize: 1.4, orbSpeed: 0.4,
    orb1Color: '#1c1c2e', orb2Color: '#161625', orb3Color: '#1a1a30', orb4Color: '#12121e',
    mouseLightIntensity: 0.015, mouseGlassIntensity: 0.005,
    causticOpacity: 0.1, streakOpacity: 0.15, glassPulse: false,
    vignetteOpacity: 1, gridOpacity: 0.5, noiseOpacity: 0.04,
    edgeShimmer: true, shimmerSpeed: 12,
  },
  aurora: {
    name: '极光', icon: '🌌',
    blurBg: 70, blurWindow: 35, blurTopbar: 24, blurDock: 12,
    saturateBg: 170, saturateWindow: 160, saturateTopbar: 150,
    glassThickness: 0.05,
    orbOpacity: 0.65, orbSize: 1.05, orbSpeed: 0.7,
    orb1Color: '#2d5a4b', orb2Color: '#4a3a6e', orb3Color: '#3a6b5e', orb4Color: '#5a3a6e',
    mouseLightIntensity: 0.04, mouseGlassIntensity: 0.02,
    causticOpacity: 0.35, streakOpacity: 0.45, glassPulse: true,
    vignetteOpacity: 0.6, gridOpacity: 0.35, noiseOpacity: 0.025,
    edgeShimmer: true, shimmerSpeed: 10,
  },
  celestial: {
    name: '星河', icon: '✨',
    blurBg: 65, blurWindow: 32, blurTopbar: 22, blurDock: 10,
    saturateBg: 150, saturateWindow: 140, saturateTopbar: 130,
    glassThickness: 0.055,
    orbOpacity: 0.7, orbSize: 1.0, orbSpeed: 0.6,
    orb1Color: '#1a2456', orb2Color: '#2d3a7a', orb3Color: '#c8a96e', orb4Color: '#1e3070',
    mouseLightIntensity: 0.035, mouseGlassIntensity: 0.015,
    causticOpacity: 0.3, streakOpacity: 0.4,
    vignetteOpacity: 0.7, gridOpacity: 0.4, noiseOpacity: 0.025,
    edgeShimmer: true, shimmerSpeed: 9,
  },
  amber: {
    name: '琥珀', icon: '🥃',
    blurBg: 58, blurWindow: 28, blurTopbar: 20, blurDock: 10,
    saturateBg: 175, saturateWindow: 165, saturateTopbar: 155,
    glassThickness: 0.06,
    orbOpacity: 0.55, orbSize: 1.0, orbSpeed: 0.7,
    orb1Color: '#c7934b', orb2Color: '#d4a55a', orb3Color: '#b8803a', orb4Color: '#a07030',
    mouseLightIntensity: 0.03, mouseGlassIntensity: 0.015,
    causticOpacity: 0.25, streakOpacity: 0.35,
    vignetteOpacity: 0.65, gridOpacity: 0.4, noiseOpacity: 0.02,
  },
  glacier: {
    name: '冰川', icon: '🧊',
    blurBg: 85, blurWindow: 42, blurTopbar: 30, blurDock: 14,
    saturateBg: 85, saturateWindow: 75, saturateTopbar: 65,
    glassThickness: 0.04,
    orbOpacity: 0.5, orbSize: 1.1, orbSpeed: 0.55,
    orb1Color: '#b8d4e8', orb2Color: '#c8e0f0', orb3Color: '#d0e8f8', orb4Color: '#a8cce0',
    mouseLightIntensity: 0.05, mouseGlassIntensity: 0.025,
    causticOpacity: 0.35, streakOpacity: 0.4,
    vignetteOpacity: 0.45, gridOpacity: 0.3, noiseOpacity: 0.03,
    waterSurface: true,
  },
  botanical: {
    name: '墨翡', icon: '🌿',
    blurBg: 55, blurWindow: 26, blurTopbar: 18, blurDock: 9,
    saturateBg: 130, saturateWindow: 120, saturateTopbar: 110,
    glassThickness: 0.06,
    orbOpacity: 0.45, orbSize: 1.15, orbSpeed: 0.5,
    orb1Color: '#2d4a3a', orb2Color: '#1a3a28', orb3Color: '#345a42', orb4Color: '#224a30',
    mouseLightIntensity: 0.025, mouseGlassIntensity: 0.01,
    causticOpacity: 0.2, streakOpacity: 0.3,
    vignetteOpacity: 0.75, gridOpacity: 0.45, noiseOpacity: 0.03,
  },
  cosmic: {
    name: '深空', icon: '🪐',
    blurBg: 62, blurWindow: 30, blurTopbar: 20, blurDock: 10,
    saturateBg: 200, saturateWindow: 190, saturateTopbar: 180,
    glassThickness: 0.055,
    orbOpacity: 0.7, orbSize: 1.05, orbSpeed: 0.65,
    orb1Color: '#3a1a6e', orb2Color: '#1a2a5e', orb3Color: '#4a1a5e', orb4Color: '#2a1a6e',
    mouseLightIntensity: 0.04, mouseGlassIntensity: 0.02,
    causticOpacity: 0.35, streakOpacity: 0.5, glassPulse: true,
    vignetteOpacity: 0.7, gridOpacity: 0.3, noiseOpacity: 0.03,
    edgeShimmer: true, shimmerSpeed: 7,
  },
  dewdrop: {
    name: '晨露', icon: '💧',
    blurBg: 45, blurWindow: 22, blurTopbar: 15, blurDock: 7,
    saturateBg: 110, saturateWindow: 105, saturateTopbar: 100,
    glassThickness: 0.025,
    orbOpacity: 0.4, orbSize: 0.7, orbSpeed: 1.2,
    orb1Color: '#e8f4f8', orb2Color: '#d4eaf0', orb3Color: '#ecf6fa', orb4Color: '#c8e4ec',
    mouseLightIntensity: 0.05, mouseGlassIntensity: 0.03,
    causticOpacity: 0.4, streakOpacity: 0.5, glassPulse: true,
    vignetteOpacity: 0.3, gridOpacity: 0.25, noiseOpacity: 0.015,
    waterSurface: true,
  },
  twilight: {
    name: '暮光', icon: '🌅',
    blurBg: 58, blurWindow: 28, blurTopbar: 20, blurDock: 10,
    saturateBg: 190, saturateWindow: 180, saturateTopbar: 170,
    glassThickness: 0.05,
    orbOpacity: 0.6, orbSize: 1.0, orbSpeed: 0.75,
    orb1Color: '#3d2e5c', orb2Color: '#5c3d4e', orb3Color: '#c4956a', orb4Color: '#8b5e6a',
    mouseLightIntensity: 0.03, mouseGlassIntensity: 0.015,
    causticOpacity: 0.28, streakOpacity: 0.38, glassPulse: true,
    vignetteOpacity: 0.65, gridOpacity: 0.35, noiseOpacity: 0.022,
    edgeShimmer: true, shimmerSpeed: 11,
  },
  gilded: {
    name: '鎏金', icon: '🏛️',
    blurBg: 55, blurWindow: 27, blurTopbar: 18, blurDock: 9,
    saturateBg: 140, saturateWindow: 130, saturateTopbar: 120,
    glassThickness: 0.075,
    orbOpacity: 0.45, orbSize: 1.2, orbSpeed: 0.45,
    orb1Color: '#2a2520', orb2Color: '#1a1815', orb3Color: '#3a3028', orb4Color: '#c8a86a',
    mouseLightIntensity: 0.02, mouseGlassIntensity: 0.008,
    causticOpacity: 0.18, streakOpacity: 0.28, glassPulse: false,
    vignetteOpacity: 0.85, gridOpacity: 0.5, noiseOpacity: 0.03,
  },
  smoke: {
    name: '烟灰', icon: '🪨',
    blurBg: 48, blurWindow: 23, blurTopbar: 16, blurDock: 8,
    saturateBg: 30, saturateWindow: 25, saturateTopbar: 20,
    glassThickness: 0.065,
    orbOpacity: 0.3, orbSize: 1.35, orbSpeed: 0.35,
    orb1Color: '#3a3a3e', orb2Color: '#2e2e32', orb3Color: '#35353a', orb4Color: '#28282c',
    mouseLight: false, mouseGlass: false,
    caustic: false, streaks: false, glassPulse: false,
    vignetteOpacity: 0.9, gridOpacity: 0.55, noiseOpacity: 0.04,
  },
  lavender: {
    name: '薰衣草', icon: '💜',
    blurBg: 68, blurWindow: 34, blurTopbar: 23, blurDock: 11,
    saturateBg: 155, saturateWindow: 145, saturateTopbar: 135,
    glassThickness: 0.045,
    orbOpacity: 0.55, orbSize: 0.95, orbSpeed: 0.85,
    orb1Color: '#c8b8e0', orb2Color: '#b0a0d0', orb3Color: '#d8c8f0', orb4Color: '#a890c8',
    mouseLightIntensity: 0.045, mouseGlassIntensity: 0.022,
    causticOpacity: 0.32, streakOpacity: 0.42, glassPulse: true,
    vignetteOpacity: 0.5, gridOpacity: 0.3, noiseOpacity: 0.02,
  },
  inkwash: {
    name: '墨韵', icon: '🖌️',
    blurBg: 52, blurWindow: 26, blurTopbar: 17, blurDock: 9,
    saturateBg: 45, saturateWindow: 38, saturateTopbar: 32,
    glassThickness: 0.08,
    orbOpacity: 0.35, orbSize: 1.5, orbSpeed: 0.3,
    orb1Color: '#1e2028', orb2Color: '#15171e', orb3Color: '#1a1c24', orb4Color: '#12141a',
    mouseLightIntensity: 0.015, mouseGlassIntensity: 0.005,
    causticOpacity: 0.12, streakOpacity: 0.18, glassPulse: false,
    vignetteOpacity: 0.95, gridOpacity: 0.6, noiseOpacity: 0.05,
  },
  blurcssCrystal: {
    name: '水晶', icon: '💠',
    blurBg: 70, blurWindow: 38, blurTopbar: 26, blurDock: 14,
    saturateBg: 160, saturateWindow: 150, saturateTopbar: 140,
    glassThickness: 0.04,
    orbOpacity: 0.5, orbSize: 0.85, orbSpeed: 0.8,
    orb1Color: '#e0f0ff', orb2Color: '#d0e8ff', orb3Color: '#e8f4ff', orb4Color: '#c8e0f8',
    mouseLightIntensity: 0.05, mouseGlassIntensity: 0.025,
    causticOpacity: 0.35, streakOpacity: 0.45,
    vignetteOpacity: 0.4, gridOpacity: 0.3, noiseOpacity: 0.02,
    waterSurface: true,
  },
  blurcssFluid: {
    name: '流液', icon: '🫧',
    blurBg: 60, blurWindow: 30, blurTopbar: 20, blurDock: 10,
    saturateBg: 140, saturateWindow: 130, saturateTopbar: 120,
    glassThickness: 0.045,
    orbOpacity: 0.6, orbSize: 1.0, orbSpeed: 0.7,
    orb1Color: '#b0d0e8', orb2Color: '#c0e0f0', orb3Color: '#a0c8e0', orb4Color: '#d0e8f8',
    mouseLightIntensity: 0.04, mouseGlassIntensity: 0.02,
    causticOpacity: 0.3, streakOpacity: 0.4,
    vignetteOpacity: 0.45, gridOpacity: 0.35, noiseOpacity: 0.02,
    edgeShimmer: true, shimmerSpeed: 8,
  },
  blurcssIce: {
    name: '寒冰', icon: '🧊',
    blurBg: 90, blurWindow: 45, blurTopbar: 32, blurDock: 16,
    saturateBg: 70, saturateWindow: 60, saturateTopbar: 50,
    glassThickness: 0.035,
    orbOpacity: 0.45, orbSize: 1.1, orbSpeed: 0.5,
    orb1Color: '#c0dff0', orb2Color: '#d0e8f8', orb3Color: '#b8d8f0', orb4Color: '#e0f0ff',
    mouseLightIntensity: 0.06, mouseGlassIntensity: 0.03,
    causticOpacity: 0.4, streakOpacity: 0.5,
    vignetteOpacity: 0.4, gridOpacity: 0.3, noiseOpacity: 0.025,
    waterSurface: true,
  },
  blurcssMercury: {
    name: '水银', icon: '🪩',
    blurBg: 55, blurWindow: 27, blurTopbar: 18, blurDock: 9,
    saturateBg: 60, saturateWindow: 50, saturateTopbar: 40,
    glassThickness: 0.07,
    orbOpacity: 0.4, orbSize: 1.3, orbSpeed: 0.4,
    orb1Color: '#b8bcc8', orb2Color: '#a0a4b0', orb3Color: '#c8ccd8', orb4Color: '#9098a8',
    mouseLightIntensity: 0.03, mouseGlassIntensity: 0.01,
    causticOpacity: 0.2, streakOpacity: 0.3,
    vignetteOpacity: 0.8, gridOpacity: 0.55, noiseOpacity: 0.03,
  },
  blurcssAurora: {
    name: '极光', icon: '🌌',
    blurBg: 65, blurWindow: 32, blurTopbar: 22, blurDock: 11,
    saturateBg: 200, saturateWindow: 190, saturateTopbar: 180,
    glassThickness: 0.05,
    orbOpacity: 0.65, orbSize: 1.0, orbSpeed: 0.7,
    orb1Color: '#2d5a5a', orb2Color: '#4a3a6e', orb3Color: '#3a6b5e', orb4Color: '#5a3a4e',
    mouseLightIntensity: 0.045, mouseGlassIntensity: 0.02,
    causticOpacity: 0.35, streakOpacity: 0.45, glassPulse: true,
    vignetteOpacity: 0.55, gridOpacity: 0.3, noiseOpacity: 0.025,
    edgeShimmer: true, shimmerSpeed: 9,
  },
  blurcssNeon: {
    name: '霓虹', icon: '💜',
    blurBg: 58, blurWindow: 28, blurTopbar: 19, blurDock: 10,
    saturateBg: 280, saturateWindow: 260, saturateTopbar: 240,
    glassThickness: 0.055,
    orbOpacity: 0.75, orbSize: 1.0, orbSpeed: 1.0,
    orb1Color: '#cc33cc', orb2Color: '#33cccc', orb3Color: '#cc3366', orb4Color: '#6633cc',
    mouseLightIntensity: 0.06, mouseGlassIntensity: 0.025,
    causticOpacity: 0.4, streakOpacity: 0.55, glassPulse: true,
    vignetteOpacity: 0.55, gridOpacity: 0.25, noiseOpacity: 0.03,
    edgeShimmer: true, shimmerSpeed: 5,
  },
  blurcssOcean: {
    name: '海洋', icon: '🌊',
    blurBg: 72, blurWindow: 36, blurTopbar: 24, blurDock: 12,
    saturateBg: 170, saturateWindow: 160, saturateTopbar: 150,
    glassThickness: 0.045,
    orbOpacity: 0.55, orbSize: 1.0, orbSpeed: 0.65,
    orb1Color: '#0077b6', orb2Color: '#00b4d8', orb3Color: '#023e8a', orb4Color: '#48cae4',
    mouseLightIntensity: 0.04, mouseGlassIntensity: 0.02,
    causticOpacity: 0.35, streakOpacity: 0.45,
    vignetteOpacity: 0.5, gridOpacity: 0.3, noiseOpacity: 0.02,
    waterSurface: true,
  },
  blurcssPlasma: {
    name: '等离子', icon: '⚡',
    blurBg: 55, blurWindow: 27, blurTopbar: 18, blurDock: 9,
    saturateBg: 320, saturateWindow: 300, saturateTopbar: 280,
    glassThickness: 0.055,
    orbOpacity: 0.8, orbSize: 0.95, orbSpeed: 1.3,
    orb1Color: '#ff2d55', orb2Color: '#5856d6', orb3Color: '#ff3b30', orb4Color: '#007aff',
    mouseLightIntensity: 0.07, mouseGlassIntensity: 0.03,
    causticOpacity: 0.45, streakOpacity: 0.6, glassPulse: true,
    vignetteOpacity: 0.5, gridOpacity: 0.25, noiseOpacity: 0.03,
    edgeShimmer: true, shimmerSpeed: 4,
  },
  blurcssPrism: {
    name: '棱镜', icon: '🔮',
    blurBg: 60, blurWindow: 30, blurTopbar: 20, blurDock: 10,
    saturateBg: 220, saturateWindow: 210, saturateTopbar: 200,
    glassThickness: 0.045,
    orbOpacity: 0.6, orbSize: 0.9, orbSpeed: 0.9,
    orb1Color: '#ff6b6b', orb2Color: '#4ecdc4', orb3Color: '#ffe66d', orb4Color: '#a855f7',
    mouseLightIntensity: 0.05, mouseGlassIntensity: 0.025,
    causticOpacity: 0.4, streakOpacity: 0.5, glassPulse: true,
    vignetteOpacity: 0.45, gridOpacity: 0.3, noiseOpacity: 0.02,
    edgeShimmer: true, shimmerSpeed: 6,
  },
  blurcssCosmic: {
    name: '宇宙', icon: '🌠',
    blurBg: 62, blurWindow: 30, blurTopbar: 20, blurDock: 10,
    saturateBg: 180, saturateWindow: 170, saturateTopbar: 160,
    glassThickness: 0.06,
    orbOpacity: 0.5, orbSize: 1.2, orbSpeed: 0.4,
    orb1Color: '#1a0533', orb2Color: '#0d1b2a', orb3Color: '#2d0a4e', orb4Color: '#c8a96e',
    mouseLightIntensity: 0.03, mouseGlassIntensity: 0.015,
    causticOpacity: 0.25, streakOpacity: 0.35,
    vignetteOpacity: 0.8, gridOpacity: 0.4, noiseOpacity: 0.035,
  },
  minimal: {
    name: '至简', icon: '◻️',
    blurBg: 25, blurWindow: 12, blurTopbar: 8, blurDock: 4,
    saturateBg: 100, saturateWindow: 100, saturateTopbar: 100,
    glassThickness: 0.02,
    orbOpacity: 0, mouseLight: false, mouseGlass: false,
    caustic: false, streaks: false, glassPulse: false,
    vignette: false, grid: false, noise: false,
    waterSurface: false, multiRipple: false, waveDistort: false, edgeShimmer: false,
  },
}

let appSettings = {}

function loadSettings() {
  try {
    const saved = localStorage.getItem('glassos_settings')
    appSettings = saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS }
  } catch(e) {
    appSettings = { ...DEFAULT_SETTINGS }
  }
  applyAllSettings()
}

function saveSettings() {
  localStorage.setItem('glassos_settings', JSON.stringify(appSettings))
}

function setSetting(key, value) {
  appSettings[key] = value
  saveSettings()
  applySetting(key, value)
}

function applySetting(key, value) {
  const root = document.documentElement.style
  switch(key) {
    case 'darkMode':
      if (value) document.body.classList.remove('light-mode')
      else document.body.classList.add('light-mode')
      break
    case 'blurBg': root.setProperty('--blur-bg', value + 'px'); break
    case 'blurWindow': root.setProperty('--blur-window', value + 'px'); break
    case 'blurTopbar': root.setProperty('--blur-topbar', value + 'px'); break
    case 'blurDock': root.setProperty('--blur-dock', value + 'px'); break
    case 'saturateBg': root.setProperty('--saturate-bg', value + '%'); break
    case 'saturateWindow': root.setProperty('--saturate-window', value + '%'); break
    case 'saturateTopbar': root.setProperty('--saturate-topbar', value + '%'); break
    case 'glassThickness': root.setProperty('--glass-thickness', value); break
    case 'orbOpacity': root.setProperty('--orb-opacity', value); break
    case 'orbSize': root.setProperty('--orb-size', value); break
    case 'orbSpeed': root.setProperty('--orb-speed', value); break
    case 'orb1Color': root.setProperty('--orb1-color', value); break
    case 'orb2Color': root.setProperty('--orb2-color', value); break
    case 'orb3Color': root.setProperty('--orb3-color', value); break
    case 'orb4Color': root.setProperty('--orb4-color', value); break
    case 'mouseLight':
      document.getElementById('mouseLight').style.display = value ? '' : 'none'
      break
    case 'mouseLightIntensity': root.setProperty('--mouse-light-intensity', value); break
    case 'mouseGlass':
      document.getElementById('mouseGlass').style.display = value ? '' : 'none'
      break
    case 'mouseGlassIntensity': root.setProperty('--mouse-glass-intensity', value); break
    case 'caustic':
      const causticEl = document.querySelector('.caustic')
      if (causticEl) causticEl.style.display = value ? '' : 'none'
      break
    case 'causticOpacity': root.setProperty('--caustic-opacity', value); break
    case 'streaks':
      document.querySelectorAll('.bg-light-streak').forEach(el => el.style.display = value ? '' : 'none')
      break
    case 'streakOpacity': root.setProperty('--streak-opacity', value); break
    case 'glassPulse':
      const gp = document.querySelector('.bg-glass-panel')
      if (gp) gp.style.animationPlayState = value ? 'running' : 'paused'
      break
    case 'vignette':
      const vig = document.querySelector('.bg-vignette')
      if (vig) vig.style.display = value ? '' : 'none'
      break
    case 'vignetteOpacity': root.setProperty('--vignette-opacity', value); break
    case 'grid':
      const gridEl = document.querySelector('.bg-grid')
      if (gridEl) gridEl.style.display = value ? '' : 'none'
      break
    case 'gridOpacity': root.setProperty('--grid-opacity', value); break
    case 'noise':
      const noiseEl = document.querySelector('.bg-noise')
      if (noiseEl) noiseEl.style.display = value ? '' : 'none'
      break
    case 'noiseOpacity': root.setProperty('--noise-opacity', value); break
    case 'waterSurface':
      const wsc = document.getElementById('waterSurfaceCanvas')
      if (wsc) { wsc.classList.toggle('active', value); if(value) startWaterSurface(); else stopWaterSurface() }
      break
    case 'multiRipple': root.setProperty('--ripple-multi', value ? 1 : 0); break
    case 'waveDistort':
      const mwd = document.getElementById('mouseWaveDistort')
      if (mwd) mwd.classList.toggle('hidden', !value)
      break
    case 'edgeShimmer':
      document.querySelectorAll('.glass-window').forEach(w => w.classList.toggle('shimmer-active', value))
      break
    case 'shimmerSpeed': root.setProperty('--shimmer-speed', value + 's'); break
  }
}

function applyAllSettings() {
  for (const [key, value] of Object.entries(appSettings)) {
    applySetting(key, value)
  }
}

function applyPreset(presetKey) {
  const preset = PRESETS[presetKey]
  if (!preset) return
  const merged = { ...appSettings, ...preset }
  delete merged.name
  delete merged.icon
  appSettings = merged
  saveSettings()
  applyAllSettings()
  if (windows['settings']) {
    refreshSettingsPanel()
  }
}

// ========== 主题切换 ==========
const themeToggle = document.getElementById('themeToggle')
const savedTheme = localStorage.getItem('glassos_theme') || 'dark'
if (savedTheme === 'light') {
  document.body.classList.add('light-mode')
  if (themeToggle) themeToggle.textContent = '☀️'
}
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode')
    themeToggle.textContent = isLight ? '☀️' : '🌙'
    localStorage.setItem('glassos_theme', isLight ? 'light' : 'dark')
  })
}
window.toggleTheme = (el) => {
  el.classList.toggle('on')
  const isLight = !el.classList.contains('on')
  document.body.classList.toggle('light-mode', isLight)
  if (themeToggle) themeToggle.textContent = isLight ? '☀️' : '🌙'
  localStorage.setItem('glassos_theme', isLight ? 'light' : 'dark')
}

const mouseLight = document.getElementById('mouseLight')
const mouseGlass = document.getElementById('mouseGlass')
const orbs = document.querySelectorAll('.orb')

let mouseRaf = null, mouseX = 0, mouseY = 0
// 缓存光球中心位置，避免每帧 getBoundingClientRect
const orbCenters = []
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY
  if (mouseRaf) return
  mouseRaf = requestAnimationFrame(() => {
    mouseRaf = null
    const x = mouseX, y = mouseY
    mouseLight.style.transform = `translate(${x - 250}px, ${y - 250}px)`
    mouseGlass.style.transform = `translate(${x - 150}px, ${y - 150}px)`

    if (!orbCenters.length) {
      orbs.forEach((orb) => {
        const rect = orb.getBoundingClientRect()
        orbCenters.push({ ox: rect.left + rect.width / 2, oy: rect.top + rect.height / 2 })
      })
    }
    orbs.forEach((orb, i) => {
      const { ox, oy } = orbCenters[i]
      const dx = (x - ox) * 0.02 * (i + 1) * 0.3
      const dy = (y - oy) * 0.02 * (i + 1) * 0.3
      orb.style.transform = `translate(${dx}px, ${dy}px)`
    })

    // 壁纸随光标视差移动
    const bgLayer = document.querySelector('.bg-layer')
    if (bgLayer) {
      const px = (x / window.innerWidth - 0.5) * 40
      const py = (y / window.innerHeight - 0.5) * 30
      bgLayer.style.transform = `translateZ(0) translate(${px}px, ${py}px)`
    }

    // 液态鼠标拖尾
    if (Math.random() < 0.25 && document.querySelectorAll('.mouse-trail').length < 30) {
      const trail = document.createElement('div')
      trail.className = 'mouse-trail'
      trail.style.left = x + 'px'
      trail.style.top = y + 'px'
      document.body.appendChild(trail)
      trail.addEventListener('animationend', () => trail.remove())
      setTimeout(() => { if (trail.parentNode) trail.remove() }, 1000)
    }

  })
})

// 窗口 resize 时更新光球位置缓存
window.addEventListener('resize', () => {
  orbCenters.length = 0
  orbs.forEach((orb) => {
    const rect = orb.getBoundingClientRect()
    orbCenters.push({ ox: rect.left + rect.width / 2, oy: rect.top + rect.height / 2 })
  })
})

document.getElementById('desktop').addEventListener('click', (e) => {
  if (e.target.closest('.dock') || e.target.closest('.glass-window') || e.target.closest('.topbar')) return

  const menu = document.getElementById('desktopMenu')
  if (menu) menu.remove()

  const ripple = document.createElement('div')
  ripple.className = 'bg-ripple'
  ripple.style.left = (e.clientX - 100) + 'px'
  ripple.style.top = (e.clientY - 100) + 'px'
  ripple.style.width = '200px'
  ripple.style.height = '200px'
  document.getElementById('desktop').appendChild(ripple)
  setTimeout(() => ripple.remove(), 1000)

  // 液态水洼
  const puddle = document.createElement('div')
  puddle.className = 'desktop-puddle'
  puddle.style.left = e.clientX + 'px'
  puddle.style.top = e.clientY + 'px'
  document.body.appendChild(puddle)
  puddle.addEventListener('animationend', () => puddle.remove())
})

document.getElementById('desktop').addEventListener('contextmenu', (e) => {
  e.preventDefault()
  if (e.target.closest('.dock') || e.target.closest('.glass-window') || e.target.closest('.topbar')) return

  const old = document.getElementById('desktopMenu')
  if (old) old.remove()

  const menu = document.createElement('div')
  menu.id = 'desktopMenu'
  menu.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;z-index:9999;background:rgba(30,30,40,0.92);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:6px 0;min-width:180px;box-shadow:0 10px 40px rgba(0,0,0,0.5);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:rgba(255,255,255,0.85);`

  const apps = [
    { id: 'finder', icon: '📁', label: '访达' },
    { id: 'terminal', icon: '💻', label: '终端' },
    { id: 'linux', icon: '🐧', label: 'Linux' },
    { id: 'ssh', icon: '🔐', label: 'SSH' },
    { id: 'notes', icon: '📝', label: '备忘录' },
    { id: 'calc', icon: '🧮', label: '计算器' },
    { id: 'weather', icon: '🌤', label: '天气' },
    { id: 'settings', icon: '⚙', label: '设置' },
    { id: 'player', icon: '🎵', label: '音乐' },
    { id: 'browser', icon: '🌐', label: '浏览器' },
    { id: 'monitor', icon: '📊', label: '监视器' },
    { id: 'calendar', icon: '📅', label: '日历' },
    { id: 'store', icon: '🛍️', label: '应用市场' },
    { id: 'paint', icon: '🎨', label: '画板' },
    { id: 'mineradio', icon: '📻', label: 'Mineradio' },
  ]

  const items = [
    { label: '新建文件夹', icon: '📁', action: () => {
      const desktopIcons = document.getElementById('desktopIcons')
      const div = document.createElement('div')
      div.className = 'desktop-icon'
      div.dataset.app = 'folder_' + Date.now()
      div.ondblclick = () => openFinder()
      div.innerHTML = '<div class="desktop-icon-img">📁</div><div class="desktop-icon-label">新建文件夹</div>'
      desktopIcons.appendChild(div)
      bindDesktopIconEvents(div)
    }},
    null,
    { label: '整理图标', icon: '📐', action: () => sortDesktopIcons() },
    { label: '保存布局', icon: '💾', action: () => {
      const icons = [...document.querySelectorAll('.desktop-icon')].map(icon => ({
        app: icon.dataset.app,
        left: icon.style.left || '', top: icon.style.top || '',
        position: icon.style.position || ''
      }))
      localStorage.setItem('glassos_layout', JSON.stringify(icons))
    }},
    { label: '恢复布局', icon: '📌', action: () => {
      const saved = JSON.parse(localStorage.getItem('glassos_layout') || 'null')
      if (!saved) return
      saved.forEach(s => {
        const icon = document.querySelector(`.desktop-icon[data-app="${s.app}"]`)
        if (icon && s.position) { icon.style.position = s.position; icon.style.left = s.left; icon.style.top = s.top }
      })
    }},
    { label: '导入文件', icon: '📥', action: () => window.os.openFilesDir() },
    { label: '更换壁纸', icon: '🖼️', action: () => openWallpaperPicker() },
	    { label: '刷新', icon: '🔄', action: () => refreshDesktop() },
    { label: '开发者工具', icon: '🔧', action: () => openDevToolsApp() },
    null,
    { label: '最小化所有窗口', icon: '🗕', action: () => { Object.keys(windows).forEach(id => minimizeWindow(id)) } },
    { label: '关闭所有窗口', icon: '✖', action: () => { Object.keys(windows).forEach(id => closeWindow(id)) } },
    null,
    { label: '关机', icon: '⏻', action: () => { document.body.style.transition = 'opacity 0.5s'; document.body.style.opacity = '0'; setTimeout(() => window.close(), 600) }, danger: true },
  ]

  items.forEach(item => {
    if (item === null) {
      const sep = document.createElement('div')
      sep.style.cssText = 'height:1px;background:rgba(255,255,255,0.08);margin:4px 10px;'
      menu.appendChild(sep)
      return
    }
    const row = document.createElement('div')
    row.style.cssText = `padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;border-radius:6px;margin:0 4px;${item.danger ? 'color:#ff7b72;' : ''}`
    row.innerHTML = `<span style="font-size:15px;width:20px;text-align:center">${item.icon}</span><span>${item.label}</span>`
    row.addEventListener('mouseenter', () => row.style.background = 'rgba(255,255,255,0.08)')
    row.addEventListener('mouseleave', () => row.style.background = 'none')
    row.addEventListener('click', () => { menu.remove(); item.action() })
    menu.appendChild(row)
  })

  document.body.appendChild(menu)

  const rect = menu.getBoundingClientRect()
  if (rect.right > window.innerWidth) menu.style.left = (e.clientX - rect.width) + 'px'
  if (rect.left < 0) menu.style.left = '0px'
  if (rect.bottom > window.innerHeight) menu.style.top = (e.clientY - rect.height) + 'px'
  if (rect.top < 0) menu.style.top = '0px'
})

document.addEventListener('click', () => {
  const menu = document.getElementById('desktopMenu')
  if (menu) menu.remove()
})

document.querySelectorAll('.desktop-icon').forEach(icon => {
  icon.addEventListener('click', (e) => {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'))
    icon.classList.add('selected')
    e.stopPropagation()
  })

  icon.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'))
    icon.classList.add('selected')

    const old = document.getElementById('desktopMenu')
    if (old) old.remove()

    const appName = icon.dataset.app
    const menu = document.createElement('div')
    menu.id = 'desktopMenu'
    menu.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;z-index:9999;background:rgba(30,30,40,0.92);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:6px 0;min-width:160px;box-shadow:0 10px 40px rgba(0,0,0,0.5);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:rgba(255,255,255,0.85);`

    const items = [
      { label: '打开', icon: '📂', action: () => openApp(appName) },
      null,
      { label: '删除快捷方式', icon: '🗑', action: () => icon.remove() },
    ]

    items.forEach(item => {
      if (item === null) {
        const sep = document.createElement('div')
        sep.style.cssText = 'height:1px;background:rgba(255,255,255,0.08);margin:4px 10px;'
        menu.appendChild(sep)
        return
      }
      const row = document.createElement('div')
      row.style.cssText = `padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;border-radius:6px;margin:0 4px;${item.danger ? 'color:#ff7b72;' : ''}`
      row.innerHTML = `<span style="font-size:15px;width:20px;text-align:center">${item.icon}</span><span>${item.label}</span>`
      row.addEventListener('mouseenter', () => row.style.background = 'rgba(255,255,255,0.08)')
      row.addEventListener('mouseleave', () => row.style.background = 'none')
      row.addEventListener('click', (e) => { e.stopPropagation(); menu.remove(); item.action() })
      menu.appendChild(row)
    })

    document.body.appendChild(menu)
    const rect = menu.getBoundingClientRect()
    if (rect.right > window.innerWidth) menu.style.left = (e.clientX - rect.width) + 'px'
    if (rect.left < 0) menu.style.left = '0px'
    if (rect.bottom > window.innerHeight) menu.style.top = (e.clientY - rect.height) + 'px'
    if (rect.top < 0) menu.style.top = '0px'
  })

})

function updateTime() {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  document.getElementById('topbarTime').textContent = `${h}:${m}`
}
updateTime()
setInterval(updateTime, 1000)

document.querySelectorAll('.dock-item').forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const dock = document.getElementById('dock')
    const items = dock.querySelectorAll('.dock-item')
    const rect = item.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const dist = Math.sqrt(x * x + y * y)
    if (dist < 80) {
      const scale = 1 + 0.3 * (1 - dist / 80)
      item.style.transform = `translateY(-${12 * (1 - dist / 80)}px) scale(${scale})`
    }
  })
  item.addEventListener('mouseleave', () => { item.style.transform = '' })
})

function triggerWindowAnim(el) {
  el.classList.add('animating')
  setTimeout(() => el.classList.remove('animating'), 400)
}

function createWindow(id, title, width, height, content) {
  if (windows[id]) {
    const w = windows[id].el
    w.style.display = 'flex'
    focusWindow(id)
    triggerWindowAnim(w)
    return
  }

  const win = document.createElement('div')
  win.className = 'glass-window focused animating'
  if (appSettings.edgeShimmer) win.classList.add('shimmer-active')
  win.id = `win-${id}`
  win.style.width = width + 'px'
  win.style.height = height + 'px'
  win.style.left = (100 + Math.random() * 200) + 'px'
  win.style.top = (50 + Math.random() * 100) + 'px'
  win.style.zIndex = ++windowZIndex

  win.innerHTML = `
    <div class="win-resize-n"></div><div class="win-resize-s"></div><div class="win-resize-e"></div><div class="win-resize-w"></div>
    <div class="win-resize-ne"></div><div class="win-resize-nw"></div><div class="win-resize-se"></div><div class="win-resize-sw"></div>
    <div class="win-titlebar" data-win="${id}">
      <div class="win-controls">
        <button class="win-btn close" onclick="closeWindow('${id}')"></button>
        <button class="win-btn minimize" onclick="minimizeWindow('${id}')"></button>
        <button class="win-btn maximize" onclick="maximizeWindow('${id}')"></button>
      </div>
      <div class="win-title">${title}</div>
    </div>
    <div class="win-body">${content}</div>
  `

  document.getElementById('windowsContainer').appendChild(win)
  windows[id] = { el: win, title }

  focusWindow(id)
  setupDrag(win, id)
  win.addEventListener('mousedown', () => focusWindow(id))

  setTimeout(() => win.classList.remove('animating'), 500)

  document.querySelector(`.dock-item[data-app="${id}"]`)?.classList.add('running')
}

function focusWindow(id) {
  if (!windows[id]) return
  document.querySelectorAll('.glass-window').forEach(w => w.classList.remove('focused'))
  windows[id].el.classList.add('focused')
  windows[id].el.style.zIndex = ++windowZIndex
  activeWindow = id
}

function closeWindow(id) {
  if (!windows[id]) return
  const win = windows[id].el
  if (win.classList.contains('closing')) return
  // 清理浏览器 webview
  if (id === 'browser') {
    const wvs = win.querySelectorAll('webview')
    wvs.forEach(wv => { wv.src = ''; wv.remove() })
  }

  const rect = win.getBoundingClientRect()

  // 窗口残影 — 玻璃幻影渐消
  const ghost = document.createElement('div')
  ghost.className = 'win-ghost'
  ghost.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;border-radius:16px;z-index:9998;pointer-events:none;
    background:rgba(255,255,255,0.04);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    border:1px solid rgba(255,255,255,0.06);box-shadow:0 0 30px rgba(255,255,255,0.03);`
  document.body.appendChild(ghost)
  let ghostOpacity = 0.6
  const ghostFade = setInterval(() => {
    ghostOpacity -= 0.04
    if (ghostOpacity <= 0) { clearInterval(ghostFade); ghost.remove() }
    else { ghost.style.opacity = ghostOpacity; ghost.style.transform = `scale(${1 + (0.6 - ghostOpacity) * 0.15})`; ghost.style.filter = `blur(${(0.6 - ghostOpacity) * 15}px)` }
  }, 30)

  // 玻璃碎裂效果
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const shardCount = 18

  for (let i = 0; i < shardCount; i++) {
    const shard = document.createElement('div')
    shard.className = 'win-shard'
    const size = Math.random() * 60 + 25
    shard.style.width = size + 'px'
    shard.style.height = size * (Math.random() * 0.6 + 0.4) + 'px'
    shard.style.left = (rect.left + Math.random() * rect.width - size / 2) + 'px'
    shard.style.top = (rect.top + Math.random() * rect.height - size / 2) + 'px'
    // 碎片飞散方向和距离
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * 300 + 150
    shard.style.setProperty('--sx', Math.cos(angle) * dist + 'px')
    shard.style.setProperty('--sy', Math.sin(angle) * dist - 100 + 'px')
    shard.style.setProperty('--sr', (Math.random() - 0.5) * 720 + 'deg')
    shard.style.animationDuration = (Math.random() * 0.4 + 0.5) + 's'
    shard.style.animationDelay = (Math.random() * 0.08) + 's'
    document.body.appendChild(shard)
    shard.addEventListener('animationend', () => shard.remove())
  }

  // 隐藏窗口
  win.classList.add('closing')
  setTimeout(() => {
    win.remove()
    delete windows[id]
    document.querySelector(`.dock-item[data-app="${id}"]`)?.classList.remove('running')
    if (activeWindow === id) activeWindow = null
  }, 200)
}

function minimizeWindow(id) {
  if (!windows[id]) return
  const win = windows[id].el
  // 吸入 Dock 动画
  const rect = win.getBoundingClientRect()
  const dockItem = document.querySelector(`.dock-item[data-app="${id}"]`)
  if (dockItem && rect.width > 0) {
    const dRect = dockItem.getBoundingClientRect()
    const tx = dRect.left + dRect.width/2 - (rect.left + rect.width/2)
    const ty = dRect.top + dRect.height/2 - (rect.top + rect.height/2)
    win.style.setProperty('--fly-x', tx + 'px')
    win.style.setProperty('--fly-y', ty + 'px')
    win.classList.add('minimizing')
    win.addEventListener('animationend', function h() {
      win.removeEventListener('animationend', h)
      win.classList.remove('minimizing')
      win.style.display = 'none'
    }, { once: true })
  } else {
    win.style.display = 'none'
  }
}

function maximizeWindow(id) {
  if (!windows[id]) return
  const el = windows[id].el
  if (el.dataset.maximized === 'true') {
    el.style.left = el.dataset.prevLeft
    el.style.top = el.dataset.prevTop
    el.style.width = el.dataset.prevWidth
    el.style.height = el.dataset.prevHeight
    el.dataset.maximized = 'false'
  } else {
    el.dataset.prevLeft = el.style.left
    el.dataset.prevTop = el.style.top
    el.dataset.prevWidth = el.style.width
    el.dataset.prevHeight = el.style.height
    el.style.left = '0px'
    el.style.top = '0px'
    el.style.width = '100%'
    el.style.height = '100%'
    el.dataset.maximized = 'true'
  }
}

function setupDrag(win, id) {
  // ===== 窗口 Resize =====
  const handles = { n:'.win-resize-n', s:'.win-resize-s', e:'.win-resize-e', w:'.win-resize-w',
    ne:'.win-resize-ne', nw:'.win-resize-nw', se:'.win-resize-se', sw:'.win-resize-sw' }
  Object.entries(handles).forEach(([dir, sel]) => {
    const h = win.querySelector(sel)
    if (!h) return
    h.addEventListener('mousedown', (e) => {
      e.preventDefault(); e.stopPropagation()
      const rect = win.getBoundingClientRect()
      const startX = e.clientX, startY = e.clientY
      const startW = rect.width, startH = rect.height
      const startL = rect.left, startT = rect.top
      win.style.transition = 'none'
      const onMove = (ev) => {
        const dx = ev.clientX - startX, dy = ev.clientY - startY
        if (dir.includes('e')) { win.style.width = Math.max(280, startW + dx) + 'px' }
        if (dir.includes('w')) { win.style.width = Math.max(280, startW - dx) + 'px'; win.style.left = (startL + dx) + 'px' }
        if (dir.includes('s')) { win.style.height = Math.max(150, startH + dy) + 'px' }
        if (dir.includes('n')) { win.style.height = Math.max(150, startH - dy) + 'px'; win.style.top = (startT + dy) + 'px' }
      }
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        win.style.transition = ''
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    })
  })

  const titlebar = win.querySelector('.win-titlebar')

  // 标题栏右键菜单
  titlebar.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    const old = document.getElementById('titlebarMenu')
    if (old) old.remove()

    const menu = document.createElement('div')
    menu.id = 'titlebarMenu'
    menu.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;z-index:99999;background:rgba(30,30,40,0.94);backdrop-filter:blur(20px);border:0.5px solid rgba(255,255,255,0.1);border-radius:12px;padding:4px 0;min-width:160px;box-shadow:0 10px 40px rgba(0,0,0,0.5);font-size:13px;color:rgba(255,255,255,0.85)`

    const isPinned = win.classList.contains('pinned')
    const items = [
      { label: isPinned ? '📌 取消置顶' : '📌 窗口置顶', action: () => {
        win.classList.toggle('pinned')
        win.style.zIndex = win.classList.contains('pinned') ? 9999 : ++windowZIndex
      }},
      { label: '📸 截图此窗口', action: () => screenshotWindow(win) },
      null,
      { label: '✕ 关闭窗口', action: () => closeWindow(id) },
    ]
    items.forEach(item => {
      if (!item) { const s = document.createElement('div'); s.style.cssText='height:0.5px;background:rgba(255,255,255,0.08);margin:3px 10px'; menu.appendChild(s); return }
      const row = document.createElement('div')
      row.style.cssText = 'padding:7px 14px;cursor:pointer;border-radius:6px;margin:1px 4px'
      row.textContent = item.label
      row.addEventListener('mouseenter', () => row.style.background='rgba(255,255,255,0.08)')
      row.addEventListener('mouseleave', () => row.style.background='none')
      row.addEventListener('click', () => { menu.remove(); item.action() })
      menu.appendChild(row)
    })
    document.body.appendChild(menu)
    setTimeout(() => document.addEventListener('click', function rm() { menu.remove(); document.removeEventListener('click', rm) }), 50)
  })

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.win-btn')) return
    const rect = win.getBoundingClientRect()
    dragState = {
      id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startLeft: rect.left,
      startTop: rect.top,
      startWidth: rect.width,
      startHeight: rect.height,
      curX: rect.left,
      curY: rect.top
    }
    win.style.transition = 'none'
    // 切到 GPU transform 定位，零布局开销
    win.style.left = '0px'
    win.style.top = '0px'
    win.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`
    win.classList.add('dragging')
  })
}

document.addEventListener('mousemove', (e) => {
  if (!dragState) return
  const win = windows[dragState.id]?.el
  if (!win) return
  const newLeft = e.clientX - dragState.offsetX
  const newTop = Math.max(0, e.clientY - dragState.offsetY)
  dragState.curX = newLeft
  dragState.curY = newTop
  win.style.transform = `translate3d(${newLeft}px, ${newTop}px, 0)`
})

document.addEventListener('mouseup', () => {
  if (dragState) {
    const win = windows[dragState.id]?.el
    if (win) {
      const finalX = dragState.curX
      const finalY = dragState.curY
      win.style.transform = ''
      win.style.left = finalX + 'px'
      win.style.top = finalY + 'px'
      win.classList.remove('dragging')
    }
    dragState = null
  }
})

function savePrevWinState(win, state) {
  win.dataset.prevLeft = state.startLeft + 'px'
  win.dataset.prevTop = state.startTop + 'px'
  win.dataset.prevWidth = state.startWidth + 'px'
  win.dataset.prevHeight = state.startHeight + 'px'
  win.dataset.maximized = 'false'
}

function restorePrevWinState(win) {
  if (win.dataset.prevLeft) win.style.left = win.dataset.prevLeft
  if (win.dataset.prevTop) win.style.top = win.dataset.prevTop
  if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth
  if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight
}

function openApp(appId) {
  if (!isAppInstalled(appId)) return
  switch (appId) {
    case 'terminal': openTerminal(); break
    case 'linux': openLinuxTerminal(); break
    case 'notes': openNotes(); break
    case 'calc': openCalc(); break
    case 'finder': openFinder(); break
    case 'weather': openWeather(); break
    case 'settings': openSettings(); break
    case 'ssh': openSSH(); break
    case 'trash': openTrash(); break
    case 'player': openPlayer(); break
    case 'browser': openBrowser(); break
    case 'monitor': openMonitor(); break
    case 'calendar': openCalendar(); break
    case 'store': openAppStore(); break
    case 'paint': openPaint(); break
    case 'mineradio': window.os.launchExe('D:\\Mineradio\\Mineradio.exe'); break
    case 'devtools': openDevToolsApp(); break
    case 'clipboard': openClipboard(); break
    case 'editor': openEditor(); break
    case 'disk': openDiskAnalyzer(); break
    case 'pomodoro': openPomodoro(); break
    case 'converter': openConverter(); break
    case 'process': openProcessManager(); break
    case 'linuxkernel': openV86Linux(); break
  }
}

function openV86Linux() {
  const content = `
    <div id="v86Screen" style="height:100%;background:#000;display:flex;flex-direction:column;">
      <div id="v86Toolbar" style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:rgba(30,30,40,0.95);border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0;">
        <span style="color:#3fb950;font-size:13px;font-weight:600;">🐧 Linux Kernel (v86)</span>
        <span id="v86Status" style="color:#8b949e;font-size:12px;margin-left:8px;">准备启动...</span>
        <div style="flex:1"></div>
        <button id="v86ResetBtn" style="display:none;padding:3px 10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#c9d1d9;border-radius:4px;cursor:pointer;font-size:11px;">重启</button>
        <button id="v86FullscreenBtn" style="display:none;padding:3px 10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#c9d1d9;border-radius:4px;cursor:pointer;font-size:11px;">全屏</button>
      </div>
      <div id="v86Container" style="flex:1;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;">
        <div id="screen_container" style="width:100%;height:100%;position:relative;">
          <div style="position:absolute;top:0;left:0;right:0;bottom:0;" id="v86_terminal"></div>
          <canvas id="v86_canvas" style="image-rendering:pixelated;display:none;"></canvas>
        </div>
        <div id="v86Loading" style="position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:#8b949e;">
          <div style="font-size:48px;">🐧</div>
          <div style="font-size:16px;color:#c9d1d9;">正在加载 Linux 内核...</div>
          <div style="font-size:12px;">首次启动需下载 ~50MB 镜像，请耐心等待</div>
          <div id="v86LoadProgress" style="width:200px;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;">
            <div id="v86LoadBar" style="width:0%;height:100%;background:linear-gradient(90deg,#3fb950,#58a6ff);border-radius:2px;transition:width 0.3s;"></div>
          </div>
        </div>
      </div>
    </div>`
  createWindow('linuxkernel', 'Linux 内核', 850, 560, content)

  setTimeout(async () => {
    const screenContainer = document.getElementById('screen_container')
    const loading = document.getElementById('v86Loading')
    const loadBar = document.getElementById('v86LoadBar')
    const status = document.getElementById('v86Status')
    const resetBtn = document.getElementById('v86ResetBtn')
    const fullscreenBtn = document.getElementById('v86FullscreenBtn')
    if (!screenContainer || !loading) return

    try {
      status.textContent = '加载 v86 引擎...'

      await new Promise((resolve, reject) => {
        if (window.V86) { resolve(); return }
        const script = document.createElement('script')
        script.src = 'node_modules/v86/build/libv86.js'
        script.onload = resolve
        script.onerror = () => reject(new Error('v86 引擎加载失败'))
        document.head.appendChild(script)
      })

      status.textContent = '下载 Linux 内核...'
      loadBar.style.width = '30%'

      const progressInterval = setInterval(() => {
        const current = parseFloat(loadBar.style.width) || 30
        if (current < 90) loadBar.style.width = (current + 2) + '%'
      }, 500)

      const wasmPath = (window.__dirname || '.') + '/node_modules/v86/build/v86.wasm'
      const IMAGE_BASE = 'https://hub.gitmirror.com/https://raw.githubusercontent.com/niclas-niclas/niclas/refs/heads/master/images'

      let emulator
      try {
        emulator = new V86({
          wasm_path: wasmPath,
          memory_size: 256 * 1024 * 1024,
          vga_memory_size: 8 * 1024 * 1024,
          screen_container: screenContainer,
          bios: { url: IMAGE_BASE + '/seabios.bin' },
          vga_bios: { url: IMAGE_BASE + '/vgabios.bin' },
          hda: { url: IMAGE_BASE + '/linux66-rootfs2-v86', async: true, size: 256 * 1024 * 1024 },
          bzimage: { url: IMAGE_BASE + '/linux66-bzimage-v86' },
          cmdline: 'root=/dev/sda rw rootfstype=ext4 init=/sbin/init',
          autostart: true,
          bzimage_initrd_from_filesystem: true,
        })
      } catch (e) {
        clearInterval(progressInterval)
        status.textContent = '尝试备用镜像源...'
        loadBar.style.width = '30%'
        const BACKUP = 'https://copy.sh/v86/image'
        emulator = new V86({
          wasm_path: wasmPath,
          memory_size: 256 * 1024 * 1024,
          vga_memory_size: 8 * 1024 * 1024,
          screen_container: screenContainer,
          bios: { url: BACKUP + '/seabios.bin' },
          vga_bios: { url: BACKUP + '/vgabios.bin' },
          hda: { url: BACKUP + '/linux3.img', async: true },
          bzimage: { url: BACKUP + '/bzimage' },
          cmdline: 'root=/dev/sda rw',
          autostart: true,
        })
      }

      clearInterval(progressInterval)
      loadBar.style.width = '100%'

      setTimeout(() => {
        loading.style.display = 'none'
        const canvas = screenContainer.querySelector('canvas')
        if (canvas) canvas.style.display = 'block'
        status.textContent = 'Linux 已启动'
        resetBtn.style.display = 'inline-block'
        fullscreenBtn.style.display = 'inline-block'
      }, 1500)

      resetBtn.onclick = () => {
        try { emulator.stop() } catch (e) {}
        emulator.restart()
      }

      fullscreenBtn.onclick = () => {
        const win = document.getElementById('win-linuxkernel')
        if (win) {
          if (win.classList.contains('maximized')) {
            maximizeWindow('linuxkernel')
          } else {
            maximizeWindow('linuxkernel')
          }
        }
      }

    } catch (err) {
      status.textContent = '启动失败: ' + err.message
      loading.innerHTML = `
        <div style="font-size:48px;">❌</div>
        <div style="font-size:16px;color:#ff7b72;">Linux 内核启动失败</div>
        <div style="font-size:12px;max-width:400px;text-align:center;margin-top:8px;">
          ${err.message}<br><br>
          请检查网络连接后重试，或确保本地有 v86 镜像文件。
        </div>
        <button onclick="closeWindow('linuxkernel')" style="margin-top:12px;padding:6px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#c9d1d9;border-radius:4px;cursor:pointer;">关闭</button>`
    }
  }, 100)
}

function openTerminal() {
  let termHistory = []
  let historyIdx = -1
  let termCwd = '~'

  const builtins = {
    'help': () => `<div style="color:#aaa;white-space:pre-wrap">可用命令:
<span style="color:#58a6ff">系统管理</span>
  hostname    主机名          uname       系统信息
  uptime      运行时间        whoami      当前用户
  id          用户ID/组       env         环境变量
  date        日期时间        cal         日历
  time        计时            history     命令历史

<span style="color:#58a6ff">文件操作</span>
  ls [路径]   列出文件        cd [路径]   切换目录
  pwd         当前目录        cat [文件]  查看文件
  head [文件] 文件头部        tail [文件] 文件尾部
  wc [文件]   字数统计        find [路径] 搜索文件
  mkdir [名]  创建目录        rm [文件]   删除文件
  cp [源][目标] 复制          mv [源][目标] 移动
  touch [名]  创建文件        chmod       修改权限
  tree [路径] 目录树

<span style="color:#58a6ff">磁盘/内存</span>
  df          磁盘使用        du [路径]   目录大小
  free        内存信息        top         进程监控
  ps          进程列表        disk        磁盘详情

<span style="color:#58a6ff">网络</span>
  ping [地址] 测试连通        ifconfig    网络接口
  netstat     网络状态        curl [URL]  HTTP 请求
  ip          IP 地址         dns [域名]  DNS 查询

<span style="color:#58a6ff">应用管理</span>
  app list    已安装应用      app open [名] 打开应用
  app close [名] 关闭应用

<span style="color:#58a6ff">快捷操作</span>
  screenshot  截图            open [路径] 打开文件
  lock        锁屏            clear       清屏
  echo [文本] 输出文本        weather     天气信息
  calc [表达式] 计算器        theme [名称] 切换主题
  speedtest   网速测试        sysinfo     系统概览
  clipboard   剪贴板历史      openapp [名] 启动应用</div>`,

    'clear': () => {
      setTimeout(() => {
        const o = document.getElementById('termOutput')
        if (!o) return
        o.innerHTML = `<div class="terminal-line terminal-input-line"><span class="terminal-prompt">GlassOS ~</span><input class="terminal-input" id="termInput" autofocus placeholder="输入命令..."></div>`
        const inp = document.getElementById('termInput')
        if (inp) inp.focus()
      }, 0)
      return ''
    },
    'hostname': () => `GlassOS`,
    'whoami': () => `guest@GlassOS`,
    'id': () => `uid=1000(guest) gid=1000(guest) groups=1000(guest),27(sudo)`,
    'uname': () => `GlassOS 1.0.0 x86_64 Electron`,
    'uptime': () => {
      const s = Math.floor(performance.now() / 1000)
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
      return `${new Date().toLocaleTimeString()} up ${h}h ${m}m, 1 user, load average: 0.15, 0.25, 0.30`
    },
    'arch': () => `x86_64`,
    'platform': () => `GlassOS/Electron ${navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1] || ''}`,
    'date': () => new Date().toLocaleString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    'cal': () => {
      const now = new Date(), y = now.getFullYear(), m = now.getMonth()
      const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate()
      const months = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
      let s = `      ${months[m]} ${y}\n日 一 二 三 四 五 六\n`
      for (let i = 0; i < first; i++) s += '   '
      for (let d = 1; d <= days; d++) {
        s += (d === now.getDate() ? `\x1b[7m${String(d).padStart(2)}\x1b[0m` : String(d).padStart(2)) + ' '
        if ((first + d) % 7 === 0) s += '\n'
      }
      return s
    },
    'env': () => `HOME=/home/guest\nUSER=guest\nSHELL=/bin/bash\nTERM=xterm-256color\nLANG=zh_CN.UTF-8\nPATH=/usr/local/bin:/usr/bin:/bin\nHOSTNAME=GlassOS`,
    'ls': (args) => {
      const dir = args[0] || '.'
      if (dir === '/' || dir === '/home') return 'bin  etc  home  tmp  usr  var'
      if (dir === '.') return 'Desktop  Documents  Downloads  Music  Pictures  Projects'
      if (dir === 'Desktop') return '终端  访达  天气  设置  回收站'
      return `ls: 无法访问 '${dir}': 没有那个文件或目录`
    },
    'pwd': () => termCwd,
    'cd': (args) => { termCwd = args[0] || '~'; return '' },
    'cat': (args) => {
      if (!args[0]) return 'cat: 缺少文件操作数'
      return `# ${args[0]} 内容\n# (文件预览需要在访达中打开)`
    },
    'head': (args) => args[0] ? `# ${args[0]} 前 10 行` : 'head: 缺少文件操作数',
    'tail': (args) => args[0] ? `# ${args[0]} 后 10 行` : 'tail: 缺少文件操作数',
    'wc': (args) => args[0] ? `  12   48  320 ${args[0]}` : 'wc: 缺少文件操作数',
    'find': (args) => {
      const path = args[0] || '.'
      return `${path}\n${path}/Desktop\n${path}/Documents\n${path}/Downloads`
    },
    'mkdir': (args) => args[0] ? '' : 'mkdir: 缺少操作数',
    'rm': (args) => args[0] ? '' : 'rm: 缺少操作数',
    'cp': () => '',
    'mv': () => '',
    'touch': (args) => args[0] ? '' : 'touch: 缺少文件操作数',
    'tree': (args) => {
      const dir = args[0] || '.'
      return `${dir}\n├── Desktop\n├── Documents\n│   ├── notes.txt\n│   └── report.docx\n├── Downloads\n│   ├── image.png\n│   └── archive.zip\n├── Music\n├── Pictures\n└── Projects`
    },
    'df': () => {
      return window.os.getDiskInfo().then(disks => {
        if (!disks || !disks.length) return '文件系统     1K块    已用    可用  使用%  挂载点'
        return disks.map(d => {
          const used = Math.floor((d.size - d.free) / 1024)
          const total = Math.floor(d.size / 1024)
          const free = Math.floor(d.free / 1024)
          const pct = Math.floor((d.size - d.free) / d.size * 100)
          return `${d.mount.padEnd(10)} ${String(total).padStart(10)} ${String(used).padStart(10)} ${String(free).padStart(10)} ${String(pct+'%').padStart(5)}  ${d.mount}`
        }).join('\n')
      })
    },
    'du': (args) => {
      const dir = args[0] || '.'
      return `4.0K    ${dir}/.config\n12K     ${dir}/Desktop\n8.0K    ${dir}/Documents\n24K     ${dir}/Downloads\n1.2M    ${dir}/Music\n856K    ${dir}/Pictures\n32K     ${dir}/Projects`
    },
    'free': () => window.os.getSystemInfo().then(info => {
      if (!info) return '无法获取内存信息'
      const total = (info.totalMem / 1024 / 1024).toFixed(0)
      const used = ((info.totalMem - info.freeMem) / 1024 / 1024).toFixed(0)
      const free = (info.freeMem / 1024 / 1024).toFixed(0)
      return `              total        used        free      shared  buff/cache   available
Mem:         ${String(total).padStart(10)} ${String(used).padStart(10)} ${String(free).padStart(10)}          0          0 ${String(free).padStart(10)}
Swap:              0           0           0`
    }),
    'top': () => window.os.getSystemInfo().then(info => {
      if (!info) return '无法获取系统信息'
      const cpuPct = info.cpuUsage?.total ? ((info.cpuUsage.total - info.cpuUsage.idle) / info.cpuUsage.total * 100).toFixed(1) : '0'
      const memPct = info.totalMem ? ((info.totalMem - info.freeMem) / info.totalMem * 100).toFixed(1) : '0'
      const memUsed = ((info.totalMem - info.freeMem) / 1024 / 1024 / 1024).toFixed(1)
      const memTotal = (info.totalMem / 1024 / 1024 / 1024).toFixed(1)
      return `top - ${new Date().toLocaleTimeString()} up 0 days, 0:${String(Math.floor(performance.now()/60000)%60).padStart(2,'0')}, 1 user
Tasks: ${info.processCount || 128} total, 1 running
%Cpu(s): ${cpuPct} us, 0.0 sy, 0.0 ni, ${100-parseFloat(cpuPct)} id
MiB Mem: ${memTotal} total, ${memUsed} used, ${(info.freeMem/1024/1024/1024).toFixed(1)} free

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0  169432  13204   9800 S   0.0   0.1   0:01.23 systemd
  128 guest     20   0  523456  87654  34567 S   0.3   0.5   0:03.45 electron
  256 guest     20   0  234567  45678  23456 S   0.1   0.3   0:01.23 glassos`
    }),
    'ps': () => `  PID TTY          TIME CMD
    1 ?        00:00:01 systemd
  128 ?        00:00:03 electron
  256 pts/0    00:00:01 bash
  312 pts/0    00:00:00 ps`,
    'kill': (args) => args[0] ? `kill: 已发送信号到进程 ${args[0]}` : 'kill: 缺少进程 ID',
    'ifconfig': () => window.os.getSystemInfo().then(info => {
      const names = info.netNames || ['eth0']
      return names.map(n => `${n}: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.${Math.floor(Math.random()*200+10)}  netmask 255.255.255.0  broadcast 192.168.1.255
        ether ${Array.from({length:6},()=>Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':')}`).join('\n\n')
    }),
    'ip': () => `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0
    inet6 fe80::1234:5678:abcd:ef01/64 scope link`,
    'ping': (args) => {
      const host = args[0] || '8.8.8.8'
      return `PING ${host} (${host}) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=64 time=12.3 ms
64 bytes from ${host}: icmp_seq=2 ttl=64 time=11.8 ms
64 bytes from ${host}: icmp_seq=3 ttl=64 time=12.1 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 11.8/12.1/12.3/0.2 ms`
    },
    'netstat': () => `Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN
tcp        1      0 127.0.0.1:3306          0.0.0.0:*               LISTEN
udp        0      0 0.0.0.0:53              0.0.0.0:*
udp        0      0 0.0.0.0:67              0.0.0.0:*`,
    'curl': (args) => {
      if (!args[0]) return 'curl: 缺少 URL'
      return `  % Total    % Received  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1256  100  1256    0     0   5123      0 --:--:-- --:--:-- --:--:--  5123
{"status":"ok","url":"${args[0]}","timestamp":"${new Date().toISOString()}"}`
    },
    'dns': (args) => {
      const domain = args[0] || 'github.com'
      return `Server:         8.8.8.8
Address:        8.8.8.8#53

Non-authoritative answer:
Name:   ${domain}
Address: 140.82.121.${Math.floor(Math.random()*255)}`
    },
    'app': (args) => {
      const sub = args[0]
      if (sub === 'list') {
        return window.os.getSystemInfo ? '可用应用: finder, terminal, linux, ssh, notes, calc, weather, settings, player, browser, monitor, calendar, store, paint, devtools, clipboard, editor, disk, pomodoro, converter, process' : 'finder, terminal, notes, calc, weather, settings'
      }
      if (sub === 'open' && args[1]) { openApp(args[1]); return `已打开: ${args[1]}` }
      if (sub === 'close' && args[1]) { closeWindow(args[1]); return `已关闭: ${args[1]}` }
      return '用法: app list | app open <应用名> | app close <应用名>'
    },
    'openapp': (args) => { if (args[0]) { openApp(args[0]); return `已启动: ${args[0]}` }; return '用法: openapp <应用名>' },
    'screenshot': () => { takeScreenshot(); return '截图已保存' },
    'lock': () => { lockScreen(); return '锁屏已激活' },
    'weather': () => window.os.getWeather().then(w => {
      if (w.error) return '天气: ' + w.error
      return `${w.icon} ${w.city} ${w.country}\n温度: ${w.temperature}°C  体感: --°C\n湿度: ${w.humidity}%  风速: ${w.windSpeed} km/h\n天气: ${w.description}`
    }),
    'calc': (args) => {
      if (!args[0]) return '用法: calc <表达式> (如: calc 2+3*4)'
      try { const r = Function('"use strict"; return (' + args[0] + ')')(); return `= ${r}` }
      catch(e) { return '计算错误: ' + e.message }
    },
    'theme': (args) => {
      const name = args[0]
      if (!name) return '用法: theme <预设名>\n可用: crystal, obsidian, aurora, celestial, amber, glacier, botanical, cosmic, dewdrop, twilight, gilded, smoke, lavender, inkwash, minimal'
      if (PRESETS[name]) { applyPreset(name); return `已切换到 ${PRESETS[name].icon} ${PRESETS[name].name}` }
      return `未找到预设: ${name}`
    },
    'speedtest': () => `正在测试网速...
📥 下载: 56.8 Mbps (7.1 MB/s)
📤 上传: 12.3 Mbps (1.5 MB/s)
⏱ 延迟: 8.2ms  抖动: 1.3ms
📍 服务器: 上海 (China Telecom)`,
    'sysinfo': () => window.os.getSystemInfo().then(info => {
      if (!info) return '无法获取系统信息'
      return `主机名: ${info.hostname}
平台: ${info.platform} ${info.arch}
CPU: ${info.cpus?.length || '--'} 核
内存: ${((info.totalMem - info.freeMem)/1024/1024/1024).toFixed(1)}G / ${(info.totalMem/1024/1024/1024).toFixed(1)}G
磁盘: ${info.disks?.map(d => d.mount).join(', ') || '--'}
网络: ${info.netNames?.join(', ') || '--'}
运行时间: ${Math.floor(info.uptime/3600)}h ${Math.floor((info.uptime%3600)/60)}m
进程数: ${info.processCount || '--'}`
    }),
    'clipboard': () => {
      const history = JSON.parse(localStorage.getItem('glassos_clipboard') || '[]')
      if (!history.length) return '剪贴板为空'
      return history.slice(0, 10).map((t, i) => `${String(i+1).padStart(2)}  ${t.length > 60 ? t.slice(0, 60) + '...' : t}`).join('\n')
    },
    'history': () => termHistory.map((h, i) => `${String(i+1).padStart(4)}  ${h}`).join('\n'),
    'echo': (args, full) => full.replace(/^echo\s*/, ''),
    'grep': (args) => args[0] ? `(模拟 grep: ${args[0]})` : 'grep: 缺少模式',
    'chmod': (args) => args[0] ? '' : 'chmod: 缺少参数',
    'chown': (args) => args[0] ? '' : 'chown: 缺少参数',
    'export': (args) => args[0] ? '' : 'export: 缺少变量',
    'disk': () => window.os.getDiskInfo().then(disks => {
      if (!disks || !disks.length) return '无法获取磁盘信息'
      return disks.map(d => {
        const used = d.size - d.free
        const pct = (used / d.size * 100).toFixed(1)
        const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5))
        return `${d.mount}  ${bar}  ${pct}%\n        已用: ${(used/1024/1024/1024).toFixed(1)}G  可用: ${(d.free/1024/1024/1024).toFixed(1)}G  总计: ${(d.size/1024/1024/1024).toFixed(1)}G`
      }).join('\n\n')
    }),
    'open': (args) => { if (args[0]) { try { window.os.openExternal(args[0]) } catch(e) {} }; return '' },
  }

  const content = `<div class="app-terminal" id="termOutput">
    <div class="terminal-line"><span class="terminal-prompt">GlassOS ~</span><span style="color:#aaa">欢迎使用 GlassOS 终端 · 输入 help 查看所有命令</span></div>
    <div class="terminal-line terminal-input-line" id="termInputLine">
      <span class="terminal-prompt">GlassOS ~</span>
      <input class="terminal-input" id="termInput" autofocus placeholder="输入命令...">
    </div>
  </div>`
  createWindow('terminal', '终端', 700, 460, content)

  setTimeout(() => {
    const output = document.getElementById('termOutput')
    if (!output) return
    const firstInput = document.getElementById('termInput')
    if (firstInput) firstInput.focus()

    // 事件委托：监听所有 .terminal-input 的 keydown
    output.addEventListener('keydown', async (e) => {
      if (!e.target.classList.contains('terminal-input')) return
      if (e.key !== 'Enter') {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          if (historyIdx > 0) { historyIdx--; e.target.value = termHistory[historyIdx] || '' }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          if (historyIdx < termHistory.length - 1) { historyIdx++; e.target.value = termHistory[historyIdx] || '' }
          else { historyIdx = termHistory.length; e.target.value = '' }
        }
        return
      }

      const input = e.target
      const cmd = input.value.trim()
      if (!cmd) return
      termHistory.push(cmd)
      historyIdx = termHistory.length

      // 冻结当前输入行
      input.disabled = true
      input.style.opacity = '0.5'
      input.closest('.terminal-input-line')?.classList.remove('terminal-input-line')

      // 创建新输入行
      const newLine = document.createElement('div')
      newLine.className = 'terminal-line terminal-input-line'
      newLine.innerHTML = `<span class="terminal-prompt">GlassOS ~</span><input class="terminal-input" id="termInput" autofocus placeholder="输入命令...">`
      output.appendChild(newLine)

      // 执行命令
      const parts = cmd.split(/\s+/)
      const command = parts[0]
      const args = parts.slice(1)
      let result = ''

      if (builtins[command]) {
        const r = builtins[command](args, cmd)
        if (r instanceof Promise) { try { result = await r } catch(err) { result = '' } }
        else result = r
      } else {
        try {
          const r = await window.os.execCommand(cmd)
          if (r.stdout) result = escapeHtml(r.stdout)
          if (r.stderr) result += `\n<span style="color:#ff7b72">${escapeHtml(r.stderr)}</span>`
          if (r.error && !r.stdout && !r.stderr) result = `<span style="color:#ff7b72">${escapeHtml(r.error)}</span>`
        } catch(err) {
          result = `<span style="color:#ff7b72">命令执行失败: ${escapeHtml(err.message)}</span>`
        }
      }

      if (result && result !== '') {
        const resultEl = document.createElement('div')
        resultEl.className = 'terminal-line'
        resultEl.style.cssText = 'color:#aaa;white-space:pre-wrap'
        resultEl.innerHTML = result
        output.insertBefore(resultEl, newLine)
      }

      const newInput = document.getElementById('termInput')
      if (newInput) newInput.focus()
      output.scrollTop = output.scrollHeight
    })
  }, 100)
}

function openNotes() {
  let notes = JSON.parse(localStorage.getItem('glassos_notes') || '[]')
  let activeIdx = 0
  // 确保至少有一条笔记
  if (!notes.length) notes = [{ id: Date.now(), title: '新笔记', content: '', updated: Date.now() }]

  function save() {
    notes.forEach(n => n.updated = n.updated || Date.now())
    localStorage.setItem('glassos_notes', JSON.stringify(notes))
  }

  function renderSidebar() {
    const sidebar = document.getElementById('notesSidebar')
    if (!sidebar) return
    sidebar.innerHTML = notes.map((n, i) => `
      <div class="notes-item${i === activeIdx ? ' active' : ''}" onclick="window._notes_select(${i})">
        <div class="notes-item-title">${escapeHtml(n.title || '无标题')}</div>
        <div class="notes-item-preview">${escapeHtml((n.content || '').slice(0, 50) || '空笔记')}</div>
        <div class="notes-item-time">${new Date(n.updated).toLocaleDateString()}</div>
      </div>
    `).join('')
  }

  function renderEditor() {
    const note = notes[activeIdx]
    if (!note) return
    const titleEl = document.getElementById('notesTitle')
    const contentEl = document.getElementById('notesContent')
    const timeEl = document.getElementById('notesTime')
    if (titleEl) titleEl.value = note.title
    if (contentEl) contentEl.value = note.content
    if (timeEl) timeEl.textContent = '上次编辑: ' + new Date(note.updated).toLocaleString()
  }

  function updateCurrent() {
    const note = notes[activeIdx]
    if (!note) return
    const titleEl = document.getElementById('notesTitle')
    const contentEl = document.getElementById('notesContent')
    if (titleEl) note.title = titleEl.value.trim() || '无标题'
    if (contentEl) note.content = contentEl.value
    note.updated = Date.now()
    save()
    renderSidebar()
  }

  const content = `<div class="app-notes">
    <div class="notes-sidebar" id="notesSidebar"></div>
    <div class="notes-editor">
      <div class="notes-toolbar">
        <button class="notes-tool-btn" onclick="window._notes_new()" title="新建">＋</button>
        <button class="notes-tool-btn" onclick="window._notes_delete()" title="删除">🗑</button>
        <button class="notes-tool-btn" id="notesMdBtn" onclick="window._notes_toggleMd()" title="预览">👁️</button>
        <span class="notes-time" id="notesTime"></span>
      </div>
      <input class="notes-title-input" id="notesTitle" placeholder="标题" oninput="window._notes_update()">
      <textarea class="notes-content-area" id="notesContent" placeholder="开始写...使用 **粗体** *斜体* # 标题" oninput="window._notes_update()"></textarea>
      <div class="notes-preview" id="notesPreview" style="display:none"></div>
    </div>
  </div>`

  createWindow('notes', '备忘录', 580, 450, content)

  window._notes_select = (i) => { updateCurrent(); activeIdx = i; renderSidebar(); renderEditor() }
  window._notes_new = () => {
    updateCurrent()
    notes.push({ id: Date.now(), title: '新笔记', content: '', updated: Date.now() })
    activeIdx = notes.length - 1
    save()
    renderSidebar()
    renderEditor()
    setTimeout(() => document.getElementById('notesTitle')?.focus(), 50)
  }
  window._notes_delete = () => {
    if (notes.length <= 1) return
    updateCurrent()
    notes.splice(activeIdx, 1)
    if (activeIdx >= notes.length) activeIdx = notes.length - 1
    save()
    renderSidebar()
    renderEditor()
  }
  window._notes_update = () => updateCurrent()
  let mdPreview = false
  window._notes_toggleMd = () => {
    mdPreview = !mdPreview
    const ta = document.getElementById('notesContent')
    const pv = document.getElementById('notesPreview')
    const btn = document.getElementById('notesMdBtn')
    if (mdPreview) {
      ta.style.display = 'none'; pv.style.display = ''
      let html = (ta.value || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
      html = html.replace(/^### (.+)$/gm,'<h4>$1</h4>')
      html = html.replace(/^## (.+)$/gm,'<h3>$1</h3>')
      html = html.replace(/^# (.+)$/gm,'<h2>$1</h2>')
      html = html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      html = html.replace(/\*(.+?)\*/g,'<em>$1</em>')
      html = html.replace(/`(.+?)`/g,'<code>$1</code>')
      html = html.replace(/^- (.+)$/gm,'<li>$1</li>')
      html = html.replace(/\n/g,'<br>')
      pv.innerHTML = html
      btn.textContent = '✏️'
    } else {
      ta.style.display = ''; pv.style.display = 'none'
      btn.textContent = '👁️'
    }
  }

  renderSidebar()
  renderEditor()
}

function openCalc() {
  let expr = ''
  let display = '0'
  const buttons = [
    ['C','clear'],['±',''],['%',''],['÷','op'],
    ['7',''],['8',''],['9',''],['×','op'],
    ['4',''],['5',''],['6',''],['−','op'],
    ['1',''],['2',''],['3',''],['+','op'],
    ['0','span'],['',''],['.',''],['=','eq']
  ]
  const grid = buttons.map(([label, cls]) => {
    const span = cls === 'span' ? ' style="grid-column:span 2"' : ''
    const type = cls === 'op' ? 'op' : cls === 'eq' ? 'eq' : cls === 'clear' ? 'clear' : ''
    return `<button class="calc-btn ${type}"${span} onclick="calcPress('${label}')">${label}</button>`
  }).join('')

  const content = `<div class="app-calc">
    <div class="calc-display" id="calcDisplay">0</div>
    <div class="calc-grid">${grid}</div>
  </div>`
  createWindow('calc', '计算器', 300, 420, content)
  window.calcPress = (val) => {
    const display = document.getElementById('calcDisplay')
    if (!display) return
    if (val === 'C') { expr = ''; display.textContent = '0'; return }
    if (val === '=') {
      try {
        const result = Function('"use strict";return (' + expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-') + ')')()
        display.textContent = result
        expr = String(result)
      } catch { display.textContent = 'Error'; expr = '' }
      return
    }
    if (val === '±') { expr = expr.startsWith('-') ? expr.slice(1) : '-' + expr; display.textContent = expr; return }
    if (val === '%') { expr = String(parseFloat(expr) / 100); display.textContent = expr; return }
    expr += val
    display.textContent = expr
  }
}

let finderNavHistory = []
let finderNavIdx = -1

function openFinder(startPath) {
  const homePath = startPath || null  // will be resolved via IPC
  let currentPath = ''

  function fileIcon(item) {
    if (item.isDir) return '📁'
    const ext = (item.name || '').split('.').pop().toLowerCase()
    const map = { jpg:'🖼️', jpeg:'🖼️', png:'🖼️', gif:'🖼️', bmp:'🖼️', svg:'🖼️', webp:'🖼️',
      mp3:'🎵', wav:'🎵', flac:'🎵', ogg:'🎵', m4a:'🎵',
      mp4:'🎬', mkv:'🎬', avi:'🎬', mov:'🎬',
      pdf:'📕', doc:'📄', docx:'📄', txt:'📄', md:'📄', js:'💻', py:'💻', html:'💻', css:'💻', json:'💻',
      zip:'📦', rar:'📦', '7z':'📦', tar:'📦', gz:'📦',
      exe:'⚙️', dll:'⚙️', msi:'⚙️' }
    return map[ext] || '📄'
  }

  function formatSize(bytes) {
    if (!bytes) return '--'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB'
    if (bytes < 1073741824) return (bytes/1048576).toFixed(1) + ' MB'
    return (bytes/1073741824).toFixed(1) + ' GB'
  }

  async function navigateTo(dirPath) {
    currentPath = dirPath
    // 更新路径栏
    const bar = document.getElementById('finderPathBar')
    if (bar) bar.textContent = dirPath

    // 更新侧边栏高亮
    document.querySelectorAll('.finder-item').forEach(el => el.classList.remove('active'))

    // 读取目录
    const items = await window.os.readDir(dirPath)
    const grid = document.getElementById('finderGrid')
    if (!grid) return
    grid.innerHTML = ''

    // 返回上级
    if (dirPath !== '/' && dirPath !== 'C:\\' && dirPath !== 'C:') {
      const parent = dirPath.split(/[\\/]/).slice(0, -1).join('\\') || 'C:\\'
      grid.innerHTML += `<div class="finder-file" ondblclick="window._finder_nav('${parent.replace(/\\/g,'\\\\')}')"><div class="finder-file-icon">📂</div><div class="finder-file-name" style="color:rgba(255,255,255,0.4)">..</div></div>`
    }

    const dirs = items.filter(f => f.isDir).sort((a,b) => a.name.localeCompare(b.name))
    const files = items.filter(f => !f.isDir).sort((a,b) => a.name.localeCompare(b.name))

    dirs.forEach(f => {
      const full = dirPath + (dirPath.endsWith('\\') ? '' : '\\') + f.name
      grid.innerHTML += `<div class="finder-file" ondblclick="window._finder_nav('${full.replace(/\\/g,'\\\\')}')" oncontextmenu="event.preventDefault();window._finder_openMenu(event,'${full.replace(/\\/g,'\\\\')}','${f.isDir}')"><div class="finder-file-icon">${fileIcon(f)}</div><div class="finder-file-name">${f.name}</div></div>`
    })
    files.forEach(f => {
      const full = dirPath + (dirPath.endsWith('\\') ? '' : '\\') + f.name
      grid.innerHTML += `<div class="finder-file" ondblclick="window._finder_openFile('${full.replace(/\\/g,'\\\\')}')" oncontextmenu="event.preventDefault();window._finder_openMenu(event,'${full.replace(/\\/g,'\\\\')}','${f.isDir}')"><div class="finder-file-icon">${fileIcon(f)}</div><div class="finder-file-name">${f.name}</div><div class="finder-file-size">${formatSize(f.size)}</div></div>`
    })

    if (!dirs.length && !files.length) {
      grid.innerHTML += '<div style="grid-column:1/-1;text-align:center;padding:40px;color:rgba(255,255,255,0.2)">空文件夹</div>'
    }
  }

  const content = `<div class="app-finder">
    <div class="finder-toolbar">
      <button class="finder-tool-btn" onclick="window._finder_back()" title="后退">◀</button>
      <button class="finder-tool-btn" onclick="window._finder_forward()" title="前进">▶</button>
      <button class="finder-tool-btn" onclick="window._finder_refresh()" title="刷新">⟳</button>
      <div class="finder-path-bar" id="finderPathBar">--</div>
    </div>
    <div class="finder-body">
      <div class="finder-sidebar">
        <div class="finder-section">收藏</div>
        ${['Desktop','Documents','Downloads','Music','Pictures','Videos'].map(d => `<div class="finder-item" onclick="window._finder_goHome('${d}')"><span>📁</span> ${d}</div>`).join('')}
        <div class="finder-section">位置</div>
        <div class="finder-item" onclick="window._finder_goHome('')"><span>🏠</span> 用户目录</div>
        <div class="finder-item" onclick="window._finder_goHome('GlassOS-Files')"><span>📥</span> GlassOS 文件</div>
        <div class="finder-item" onclick="window._finder_nav('C:\\\\')"><span>💻</span> C 盘</div>
      </div>
      <div class="finder-grid" id="finderGrid">
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:rgba(255,255,255,0.2)">加载中...</div>
      </div>
    </div>
  </div>`

  createWindow('finder', '访达', 700, 500, content)

  // 暴露导航方法
  window._finder_nav = (path) => {
    finderNavHistory = finderNavHistory.slice(0, finderNavIdx + 1)
    finderNavHistory.push(path)
    finderNavIdx = finderNavHistory.length - 1
    navigateTo(path)
  }
  window._finder_back = () => {
    if (finderNavIdx > 0) { finderNavIdx--; navigateTo(finderNavHistory[finderNavIdx]) }
  }
  window._finder_forward = () => {
    if (finderNavIdx < finderNavHistory.length - 1) { finderNavIdx++; navigateTo(finderNavHistory[finderNavIdx]) }
  }
  window._finder_refresh = () => navigateTo(currentPath)
  window._finder_openFile = (path) => {
    const ext = (path || '').split('.').pop().toLowerCase()
    if (['jpg','jpeg','png','gif','bmp','webp','svg'].includes(ext)) {
      // 玻璃相框预览
      const ov = document.createElement('div')
      ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;cursor:pointer'
      const img = document.createElement('img')
      img.src = 'file:///' + path.replace(/\\/g,'/')
      img.style.cssText = 'max-width:85vw;max-height:85vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.5)'
      img.onerror = () => { ov.remove(); window.os.openExternal(path) }
      ov.appendChild(img)
      ov.addEventListener('click', () => ov.remove())
      document.addEventListener('keydown', function esc(e) { if (e.key==='Escape') { ov.remove(); document.removeEventListener('keydown', esc) } })
      document.body.appendChild(ov)
      return
    }
    window.os.openExternal(path)
  }
  window._finder_goHome = async (sub) => {
    const home = await window.os.getHomeDir()
    const target = sub ? home + '\\' + sub : home
    window._finder_nav(target)
  }
  window._finder_openMenu = (e, path, isDir) => {
    const menu = document.createElement('div')
    menu.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;z-index:99999;background:rgba(30,30,40,0.94);backdrop-filter:blur(20px);border-radius:10px;padding:4px 0;min-width:140px;font-size:13px;color:rgba(255,255,255,0.85)`
    const items = isDir
      ? [{ l:'📂 打开', a:() => window._finder_nav(path) }]
      : [{ l:'📄 打开', a:() => window.os.openExternal(path) }]
    items.push({ l:'📋 复制路径', a:() => navigator.clipboard.writeText(path) })
    items.forEach(it => {
      const r = document.createElement('div')
      r.textContent = it.l; r.style.cssText = 'padding:7px 14px;cursor:pointer'
      r.addEventListener('mouseenter', () => r.style.background = 'rgba(255,255,255,0.08)')
      r.addEventListener('mouseleave', () => r.style.background = 'none')
      r.addEventListener('click', () => { menu.remove(); it.a() })
      menu.appendChild(r)
    })
    document.body.appendChild(menu)
    setTimeout(() => document.addEventListener('click', function rm() { menu.remove(); document.removeEventListener('click', rm) }), 50)
  }

  // 初始加载用户目录
  window._finder_goHome('')
}

function openWeather() {
  const content = `<div class="app-weather" id="weatherApp">
    <div class="weather-loading" id="weatherLoading">
      <div class="weather-spinner"></div>
      <div class="weather-loading-text">获取天气中...</div>
    </div>
    <div class="weather-loaded" id="weatherLoaded" style="display:none">
      <div class="weather-icon" id="weatherIcon">☀️</div>
      <div class="weather-temp" id="weatherTemp">--°</div>
      <div class="weather-desc" id="weatherDesc">--</div>
      <div class="weather-city" id="weatherCity">--</div>
      <div class="weather-details">
        <div class="weather-detail"><div class="weather-detail-value" id="weatherHumidity">--%</div><div class="weather-detail-label">湿度</div></div>
        <div class="weather-detail"><div class="weather-detail-value" id="weatherWind">--km/h</div><div class="weather-detail-label">风速</div></div>
        <div class="weather-detail"><div class="weather-detail-value" id="weatherPressure">--hPa</div><div class="weather-detail-label">气压</div></div>
      </div>
    </div>
    <div class="weather-error" id="weatherError" style="display:none">
      <div style="font-size:48px">⚠️</div>
      <div style="margin-top:12px;color:var(--text-secondary)" id="weatherErrorText">无法获取天气</div>
      <button class="weather-retry-btn" onclick="refreshWeather()">重试</button>
    </div>
  </div>`
  createWindow('weather', '天气', 360, 400, content)
  setTimeout(() => fetchWeatherData(), 300)

  window.refreshWeather = () => {
    const loading = document.getElementById('weatherLoading')
    const loaded = document.getElementById('weatherLoaded')
    const error = document.getElementById('weatherError')
    if (loading) loading.style.display = ''
    if (loaded) loaded.style.display = 'none'
    if (error) error.style.display = 'none'
    fetchWeatherData()
  }
}

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

async function fetchWeatherData() {
  const loading = document.getElementById('weatherLoading')
  const loaded = document.getElementById('weatherLoaded')
  const error = document.getElementById('weatherError')

  const showError = (msg) => {
    if (loading) loading.style.display = 'none'
    if (loaded) loaded.style.display = 'none'
    if (error) { error.style.display = ''; const el = document.getElementById('weatherErrorText'); if (el) el.textContent = msg }
  }

  const renderData = (data) => {
    if (loading) loading.style.display = 'none'
    if (error) error.style.display = 'none'
    if (loaded) loaded.style.display = ''
    const tempEl = document.getElementById('weatherTemp')
    const iconEl = document.getElementById('weatherIcon')
    const descEl = document.getElementById('weatherDesc')
    const cityEl = document.getElementById('weatherCity')
    if (tempEl) tempEl.textContent = Math.round(data.temperature) + '°'
    if (iconEl) iconEl.textContent = data.icon
    if (descEl) descEl.textContent = data.description
    if (cityEl) cityEl.textContent = data.city
    const humEl = document.getElementById('weatherHumidity')
    const windEl = document.getElementById('weatherWind')
    const presEl = document.getElementById('weatherPressure')
    if (humEl) humEl.textContent = data.humidity + '%'
    if (windEl) windEl.textContent = data.windSpeed + 'km/h'
    if (presEl) presEl.textContent = Math.round(data.pressure) + 'hPa'
  }

  try {
    let lat, lon, city = ''

    // 优先：浏览器 GPS 定位
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, maximumAge: 300000 })
        })
        lat = pos.coords.latitude
        lon = pos.coords.longitude
        // 反向地理编码获取城市名
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=zh`)
          const geo = await geoRes.json()
          city = (geo.address && (geo.address.city || geo.address.town || geo.address.county || geo.address.state || '')) || ''
        } catch (e) { /* 城市名可选 */ }
      } catch (geoErr) {
        console.log('[Weather] GPS failed:', geoErr.message)
      }
    }

    // 回退：IP 定位
    if (!lat || !lon) {
      try {
        const ipRes = await fetch('https://api.ip.sb/geoip')
        const ipData = await ipRes.json()
        if (ipData.latitude && ipData.longitude) {
          lat = ipData.latitude
          lon = ipData.longitude
          city = ipData.city || ''
        }
      } catch (e) {
        // 二次回退
        try {
          const ipRes2 = await fetch('http://ip-api.com/json/?fields=city,lat,lon')
          const ipData2 = await ipRes2.json()
          if (ipData2.lat && ipData2.lon) {
            lat = ipData2.lat
            lon = ipData2.lon
            city = ipData2.city || ''
          }
        } catch (e2) {
          showError('无法获取位置信息，请允许定位权限或检查网络')
          return
        }
      }
    }

    if (!lat || !lon) {
      showError('无法获取位置信息')
      return
    }

    // 获取天气 (Open-Meteo 免费 API)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,pressure_msl&timezone=auto`
    const wRes = await fetch(weatherUrl)
    const wData = await wRes.json()
    const c = wData.current

    if (!c) {
      showError('天气数据异常，请稍后重试')
      return
    }

    renderData({
      city: city || '当前城市',
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      pressure: c.pressure_msl,
      description: weatherCodeToText(c.weather_code),
      icon: weatherCodeToIcon(c.weather_code)
    })
  } catch (err) {
    console.error('[Weather] Error:', err)
    showError('网络连接失败，请检查网络后重试')
  }
}

function openSettings() {
  const toggleRow = (label, key) => `
    <div class="settings-row">
      <span class="settings-label">${label}</span>
      <div class="toggle ${appSettings[key] ? 'on' : ''}" onclick="toggleSetting(this, '${key}')"></div>
    </div>
  `

  const sliderRow = (label, key, min, max, step, unit) => `
    <div class="settings-slider-row">
      <span class="settings-slider-label">${label}</span>
      <input type="range" class="settings-slider" min="${min}" max="${max}" step="${step}" value="${appSettings[key]}" oninput="sliderChange(this, '${key}', '${unit}')">
      <span class="settings-slider-value">${appSettings[key]}${unit}</span>
    </div>
  `

  const colorRow = (label, key) => `
    <div class="settings-color-row">
      <span class="settings-color-label">${label}</span>
      <input type="color" class="settings-color-input" value="${appSettings[key]}" oninput="colorChange(this, '${key}')">
    </div>
  `

  const groups = {
    '🎨 外观': `
      ${toggleRow('深色模式', 'darkMode')}
      ${toggleRow('透明效果', 'transparency')}
      ${toggleRow('动态壁纸', 'dynamicBg')}
      ${toggleRow('窗口启动动画', 'windowAnim')}
      <div style="padding:12px 0 4px;font-size:12px;color:rgba(255,255,255,0.35)">预设方案</div>
      <div class="settings-presets">
        ${Object.entries(PRESETS).map(([key, p]) => `
          <button class="settings-preset-btn" onclick="applyPreset('${key}')">
            <span class="preset-icon">${p.icon}</span>${p.name}
          </button>
        `).join('')}
      </div>
    `,
    '🪟 玻璃': `
      ${sliderRow('背景模糊', 'blurBg', 20, 120, 5, 'px')}
      ${sliderRow('窗口模糊', 'blurWindow', 10, 80, 5, 'px')}
      ${sliderRow('顶栏模糊', 'blurTopbar', 10, 60, 5, 'px')}
      ${sliderRow('Dock模糊', 'blurDock', 2, 30, 2, 'px')}
      ${sliderRow('背景饱和度', 'saturateBg', 100, 300, 10, '%')}
      ${sliderRow('窗口饱和度', 'saturateWindow', 100, 300, 10, '%')}
      ${sliderRow('顶栏饱和度', 'saturateTopbar', 100, 300, 10, '%')}
      ${sliderRow('玻璃厚度', 'glassThickness', 0.02, 0.15, 0.01, '')}
    `,
    '✨ 特效': `
      <div style="font-size:11px;color:rgba(255,255,255,0.3);padding:6px 0 2px;text-transform:uppercase;letter-spacing:1px">光球</div>
      ${toggleRow('显示光球', 'orbOpacity')}
      ${sliderRow('大小', 'orbSize', 0.5, 1.5, 0.1, 'x')}
      ${sliderRow('速度', 'orbSpeed', 0.2, 2, 0.1, 'x')}
      ${colorRow('颜色 1', 'orb1Color')}
      ${colorRow('颜色 2', 'orb2Color')}
      ${colorRow('颜色 3', 'orb3Color')}
      ${colorRow('颜色 4', 'orb4Color')}
      <div style="font-size:11px;color:rgba(255,255,255,0.3);padding:6px 0 2px;text-transform:uppercase;letter-spacing:1px">鼠标</div>
      ${toggleRow('跟随光效', 'mouseLight')}
      ${sliderRow('光效强度', 'mouseLightIntensity', 0.01, 0.1, 0.01, '')}
      ${toggleRow('玻璃扭曲', 'mouseGlass')}
      ${sliderRow('扭曲强度', 'mouseGlassIntensity', 0.01, 0.06, 0.01, '')}
      <div style="font-size:11px;color:rgba(255,255,255,0.3);padding:6px 0 2px;text-transform:uppercase;letter-spacing:1px">背景</div>
      ${toggleRow('焦散波纹', 'caustic')}
      ${sliderRow('焦散强度', 'causticOpacity', 0.05, 0.6, 0.05, '')}
      ${toggleRow('光线扫描', 'streaks')}
      ${sliderRow('光线强度', 'streakOpacity', 0.1, 1, 0.1, '')}
      ${toggleRow('玻璃呼吸', 'glassPulse')}
      ${toggleRow('桌面暗角', 'vignette')}
      ${sliderRow('暗角强度', 'vignetteOpacity', 0.2, 1, 0.1, '')}
      ${toggleRow('背景网格', 'grid')}
      ${sliderRow('网格强度', 'gridOpacity', 0.1, 0.8, 0.1, '')}
      ${toggleRow('噪点纹理', 'noise')}
      ${sliderRow('噪点强度', 'noiseOpacity', 0.01, 0.08, 0.01, '')}
      <div style="font-size:11px;color:rgba(255,255,255,0.3);padding:6px 0 2px;text-transform:uppercase;letter-spacing:1px">水面</div>
      ${toggleRow('桌面水面层', 'waterSurface')}
      ${toggleRow('多点涟漪', 'multiRipple')}
      ${toggleRow('鼠标波浪', 'waveDistort')}
      ${toggleRow('边缘流光', 'edgeShimmer')}
      ${sliderRow('流光速度', 'shimmerSpeed', 3, 15, 1, 's')}
    `,
    '🔬 实验室': `
      <div style="text-align:center;padding:8px;margin-bottom:12px;border-radius:14px;background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.06)">
        <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:8px">🪟 滑块调参实时生效（打开一个窗口看效果）</div>
      </div>
      ${sliderRow('背景模糊', 'blurBg', 20, 120, 5, 'px')}
      ${sliderRow('窗口模糊', 'blurWindow', 10, 80, 5, 'px')}
      ${sliderRow('Dock模糊', 'blurDock', 2, 30, 2, 'px')}
      ${sliderRow('饱和度', 'saturateBg', 50, 350, 10, '%')}
      ${sliderRow('玻璃厚度', 'glassThickness', 0.02, 0.15, 0.01, '')}
      ${sliderRow('光效强度', 'mouseLightIntensity', 0.01, 0.1, 0.01, '')}
      ${sliderRow('焦散强度', 'causticOpacity', 0.05, 0.6, 0.05, '')}
      ${sliderRow('暗角强度', 'vignetteOpacity', 0.2, 1, 0.1, '')}
      ${sliderRow('网格强度', 'gridOpacity', 0.1, 0.8, 0.1, '')}
    `,
    '🔐 安全': `
      <div class="settings-group">
        <div class="settings-group-title">锁屏密码</div>
        <div class="settings-row" style="flex-direction:column;align-items:stretch;gap:10px;padding:14px">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="settings-label" style="min-width:70px">当前密码</span>
            <input id="settOldPwd" type="password" class="settings-pwd-input" placeholder="输入当前密码" maxlength="20" />
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="settings-label" style="min-width:70px">新密码</span>
            <input id="settNewPwd" type="password" class="settings-pwd-input" placeholder="输入新密码" maxlength="20" />
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="settings-label" style="min-width:70px">确认密码</span>
            <input id="settConfirmPwd" type="password" class="settings-pwd-input" placeholder="再次输入新密码" maxlength="20" />
          </div>
          <div id="settPwdMsg" style="font-size:12px;min-height:18px;margin-top:2px"></div>
          <button class="settings-pwd-btn" onclick="window._sett_changePwd()">保存密码</button>
        </div>
      </div>
      <div class="settings-group">
        <div class="settings-group-title">自动锁屏</div>
        <div class="settings-row">
          <span class="settings-label">锁屏超时</span>
          <span class="settings-value">15 分钟</span>
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.25);padding:4px 14px">无操作 15 分钟后自动锁屏</div>
      </div>
    `,
    'ℹ️ 关于': `
      <div style="text-align:center;padding:4px 0 12px">
        <div style="font-size:32px;margin-bottom:6px">🪟</div>
        <div style="font-size:16px;font-weight:600;color:rgba(255,255,255,0.85)">GlassOS</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:4px;line-height:1.6">
          液态玻璃主题桌面系统<br>
          基于 Electron 构建的拟态桌面环境<br>
          集成了文件管理、终端、浏览器、<br>
          天气、音乐、系统监视等应用<br>
          支持 15 种精调玻璃主题
        </div>
      </div>
      <div class="settings-row">
        <span class="settings-label">版本</span>
        <span class="settings-value">3.0</span>
      </div>
      <div class="settings-row">
        <span class="settings-label">渲染引擎</span>
        <span class="settings-value">Chromium</span>
      </div>
      <div class="settings-row">
        <span class="settings-label">技术栈</span>
        <span class="settings-value">Electron + 原生三件套</span>
      </div>
    `,
  }

  const tabs = Object.keys(groups)
  let activeTab = tabs[0]

  const content = `<div class="app-settings-new">
    <div class="sett-sidebar">
      ${tabs.map((t, i) => `<div class="sett-tab${i === 0 ? ' active' : ''}" onclick="window._sett_switch('${t}')">${t}</div>`).join('')}
    </div>
    <div class="sett-content" id="settContent">${groups[activeTab]}</div>
  </div>`

  createWindow('settings', '设置', 460, 550, content)

  window._sett_switch = (tab) => {
    document.querySelectorAll('.sett-tab').forEach(t => t.classList.toggle('active', t.textContent === tab))
    document.getElementById('settContent').innerHTML = groups[tab]
  }
}

function refreshSettingsPanel() {
  if (windows['settings']) {
    const w = windows['settings'].el
    if (w && w.parentNode) w.remove()
    delete windows['settings']
    document.querySelector(`.dock-item[data-app="settings"]`)?.classList.remove('running')
  }
  openSettings()
}

function toggleAccordion(header) {
  header.classList.toggle('open')
  const body = header.nextElementSibling
  body.classList.toggle('open')
}

function toggleSetting(toggleEl, key) {
  const isOn = toggleEl.classList.toggle('on')
  // orbOpacity is the only toggle that maps to a numeric CSS value (0/1)
  setSetting(key, (key === 'orbOpacity') ? (isOn ? 1 : 0) : isOn)
}

function sliderChange(slider, key, unit) {
  const val = parseFloat(slider.value)
  const displayVal = unit === 'x' ? val.toFixed(1) : val
  slider.nextElementSibling.textContent = displayVal + unit
  setSetting(key, val)
}

function colorChange(input, key) {
  setSetting(key, input.value)
}

window._sett_changePwd = () => {
  const oldPwd = document.getElementById('settOldPwd').value.trim()
  const newPwd = document.getElementById('settNewPwd').value.trim()
  const confirmPwd = document.getElementById('settConfirmPwd').value.trim()
  const msgEl = document.getElementById('settPwdMsg')

  if (!oldPwd || !newPwd || !confirmPwd) {
    msgEl.style.color = '#ff7b72'
    msgEl.textContent = '请填写所有字段'
    return
  }

  window.os.getLockPassword().then(current => {
    if (oldPwd !== current) {
      msgEl.style.color = '#ff7b72'
      msgEl.textContent = '当前密码错误'
      return
    }

    if (newPwd.length < 4) {
      msgEl.style.color = '#ff7b72'
      msgEl.textContent = '新密码至少 4 位'
      return
    }

    if (newPwd !== confirmPwd) {
      msgEl.style.color = '#ff7b72'
      msgEl.textContent = '两次输入的密码不一致'
      return
    }

    window.os.setLockPassword(newPwd).then(ok => {
      if (ok) {
        msgEl.style.color = '#3fb950'
        msgEl.textContent = '✅ 密码修改成功'
        document.getElementById('settOldPwd').value = ''
        document.getElementById('settNewPwd').value = ''
        document.getElementById('settConfirmPwd').value = ''
        pushNotif('锁屏密码已修改', 'success', '🔐')
      } else {
        msgEl.style.color = '#ff7b72'
        msgEl.textContent = '保存失败，请重试'
      }
    })
  })
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const sp = document.getElementById('spotlight')
    if (sp && sp.classList.contains('active')) { closeSpotlight(); return }
    const lp = document.getElementById('launchpad')
    if (lp && lp.classList.contains('active')) { closeLaunchpad(); return }
    if (activeWindow) closeWindow(activeWindow)
  }
  if (e.key === 'F4') {
    e.preventDefault()
    const lp = document.getElementById('launchpad')
    if (lp && lp.classList.contains('active')) closeLaunchpad()
    else openLaunchpad()
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    const sp = document.getElementById('spotlight')
    if (sp && sp.classList.contains('active')) closeSpotlight()
    else openSpotlight()
  }
})

// ========== Spotlight 全局搜索 ==========
const spotlightApps = [
  { id: 'finder', icon: '📁', name: '访达', desc: '文件管理器', tag: '应用' },
  { id: 'terminal', icon: '💻', name: '终端', desc: '命令行终端', tag: '应用' },
  { id: 'linux', icon: '🐧', name: 'Linux', desc: 'Linux 模拟器', tag: '应用' },
  { id: 'ssh', icon: '🔐', name: 'SSH', desc: '远程连接 + SFTP', tag: '应用' },
  { id: 'notes', icon: '📝', name: '备忘录', desc: '笔记与 Markdown', tag: '应用' },
  { id: 'calc', icon: '🧮', name: '计算器', desc: '科学计算器', tag: '应用' },
  { id: 'weather', icon: '🌤️', name: '天气', desc: '实时天气查询', tag: '应用' },
  { id: 'settings', icon: '⚙️', name: '设置', desc: '系统偏好设置', tag: '应用' },
  { id: 'player', icon: '🎵', name: '音乐', desc: '音乐播放器', tag: '应用' },
  { id: 'browser', icon: '🌐', name: '浏览器', desc: '内置网页浏览器', tag: '应用' },
  { id: 'monitor', icon: '📊', name: '监视器', desc: '系统资源监控', tag: '应用' },
  { id: 'calendar', icon: '📅', name: '日历', desc: '日历与日期', tag: '应用' },
  { id: 'store', icon: '🛍️', name: '应用市场', desc: '发现新应用', tag: '应用' },
  { id: 'paint', icon: '🎨', name: '画板', desc: '绘图工具', tag: '应用' },
  { id: 'devtools', icon: '🔧', name: '开发者工具', desc: '系统调试工具集', tag: '应用' },
  { id: 'clipboard', icon: '📋', name: '剪贴板', desc: '复制历史记录', tag: '应用' },
  { id: 'editor', icon: '📝', name: '文本编辑器', desc: '代码与文本编辑', tag: '应用' },
  { id: 'disk', icon: '💾', name: '磁盘分析', desc: '磁盘空间分析', tag: '应用' },
  { id: 'pomodoro', icon: '🍅', name: '番茄钟', desc: '专注计时器', tag: '应用' },
  { id: 'converter', icon: '🔄', name: '单位换算', desc: '长度/重量/温度互转', tag: '应用' },
  { id: 'process', icon: '⚙', name: '进程管理', desc: '系统进程监控', tag: '应用' },
]

const spotlightActions = [
  { icon: '🌙', name: '切换深色模式', desc: '切换亮色/暗色主题', tag: '操作', action: () => { document.getElementById('themeToggle')?.click() } },
  { icon: '🔒', name: '锁屏', desc: '锁定屏幕', tag: '操作', action: () => lockScreen() },
  { icon: '🧩', name: '打开启动台', desc: '显示所有应用', tag: '操作', action: () => openLaunchpad() },
  { icon: '📂', name: '打开文件夹', desc: '打开 GlassOS-Files 目录', tag: '操作', action: () => window.os?.openFilesDir() },
  { icon: '📸', name: '截图', desc: '截取屏幕', tag: '操作', action: () => takeScreenshot() },
]

let spotlightActiveIdx = -1

function openSpotlight() {
  const sp = document.getElementById('spotlight')
  if (!sp) return
  sp.classList.add('active')
  const input = document.getElementById('spotlightInput')
  if (input) { input.value = ''; input.focus(); renderSpotlightResults('') }
  spotlightActiveIdx = -1
}

function closeSpotlight() {
  const sp = document.getElementById('spotlight')
  if (sp) sp.classList.remove('active')
}

function renderSpotlightResults(query) {
  const list = document.getElementById('spotlightResults')
  if (!list) return
  const q = query.trim().toLowerCase()

  let apps = spotlightApps
  let actions = spotlightActions
  if (q) {
    apps = apps.filter(a => a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q))
    actions = actions.filter(a => a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q))
  }

  if (!apps.length && !actions.length) {
    list.innerHTML = '<div class="spotlight-empty">无搜索结果</div>'
    return
  }

  let html = ''
  if (apps.length) {
    if (q) html += '<div class="spotlight-section-title">应用</div>'
    apps.forEach(a => {
      html += `<div class="spotlight-item" data-type="app" data-id="${a.id}" onclick="closeSpotlight();openApp('${a.id}')">
        <div class="spotlight-item-icon">${a.icon}</div>
        <div class="spotlight-item-body">
          <div class="spotlight-item-name">${escapeHtml(a.name)}</div>
          <div class="spotlight-item-desc">${escapeHtml(a.desc)}</div>
        </div>
        <span class="spotlight-item-tag">${a.tag}</span>
      </div>`
    })
  }
  if (actions.length) {
    if (q) html += '<div class="spotlight-section-title">操作</div>'
    actions.forEach((a, i) => {
      html += `<div class="spotlight-item" data-type="action" data-idx="${i}" onclick="closeSpotlight();spotlightActions[${i}].action()">
        <div class="spotlight-item-icon">${a.icon}</div>
        <div class="spotlight-item-body">
          <div class="spotlight-item-name">${escapeHtml(a.name)}</div>
          <div class="spotlight-item-desc">${escapeHtml(a.desc)}</div>
        </div>
        <span class="spotlight-item-tag">${a.tag}</span>
      </div>`
    })
  }

  list.innerHTML = html
  spotlightActiveIdx = -1
}

setTimeout(() => {
  const input = document.getElementById('spotlightInput')
  if (input) {
    input.addEventListener('input', () => renderSpotlightResults(input.value))
    input.addEventListener('keydown', (e) => {
      const items = document.querySelectorAll('#spotlightResults .spotlight-item')
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        spotlightActiveIdx = Math.min(spotlightActiveIdx + 1, items.length - 1)
        items.forEach((el, i) => el.classList.toggle('active', i === spotlightActiveIdx))
        if (items[spotlightActiveIdx]) items[spotlightActiveIdx].scrollIntoView({ block: 'nearest' })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        spotlightActiveIdx = Math.max(spotlightActiveIdx - 1, 0)
        items.forEach((el, i) => el.classList.toggle('active', i === spotlightActiveIdx))
        if (items[spotlightActiveIdx]) items[spotlightActiveIdx].scrollIntoView({ block: 'nearest' })
      } else if (e.key === 'Enter' && spotlightActiveIdx >= 0 && items[spotlightActiveIdx]) {
        items[spotlightActiveIdx].click()
      }
    })
  }
}, 100)

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

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
        <button class="ssh-sftp-toggle-btn" id="sshSftpToggle" style="display:none" title="文件管理">📂</button>
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
      <div class="ssh-sftp-panel" id="sshSftpPanel" style="display:none">
        <div class="ssh-sftp-toolbar">
          <button class="ssh-sftp-btn" id="sftpUpBtn" title="上级目录">⬆</button>
          <div class="ssh-sftp-path" id="sftpPath">/</div>
          <button class="ssh-sftp-btn" id="sftpRefreshBtn" title="刷新">🔄</button>
        </div>
        <div class="ssh-sftp-actions">
          <button class="ssh-sftp-action" id="sftpUploadBtn">📤 上传</button>
          <button class="ssh-sftp-action" id="sftpMkdirBtn">📁 新建</button>
        </div>
        <div class="ssh-sftp-list" id="sftpFileList"></div>
        <div class="ssh-sftp-status" id="sftpStatus">就绪</div>
      </div>
    </div>
  </div>`
  createWindow('ssh', 'SSH', 900, 580, content)

  // Session state
  let currentSessionId = null
  let currentTerminal = null
  let fitAddon = null

  // Focus input after window created
  setTimeout(() => {
    const inpEl = document.getElementById('sshConnStr')
    if (inpEl) { inpEl.focus(); console.log('[SSH] input focused') }
    else { console.log('[SSH] ERROR: cannot focus - sshConnStr not found') }
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

  // Connect function
  window.sshDoConnect = async () => {
    console.log('[SSH] sshDoConnect called')
    const connStr = document.getElementById('sshConnStr').value
    console.log('[SSH] connStr:', connStr)
    if (!connStr || !connStr.trim()) { console.log('[SSH] empty connStr, returning'); return }
    const { username, host, port } = parseConnStr(connStr)
    if (!host) return

    saveHost(username, host)

    // Clean up existing session
    if (currentTerminal) { currentTerminal.dispose(); currentTerminal = null }
    if (currentSessionId) { window.os.sshDisconnect(currentSessionId); currentSessionId = null }

    const container = document.getElementById('sshXtermContainer')
    if (!container) return
    container.innerHTML = ''

    // Lazy-load xterm.js if needed
    if (typeof Terminal === 'undefined' || typeof FitAddon === 'undefined') {
      container.innerHTML = '<div class="ssh-xterm-placeholder" style="color:rgba(255,255,255,0.5)">正在加载终端组件...</div>'
      try {
        await loadScript('node_modules/xterm/lib/xterm.js')
        await loadScript('node_modules/xterm-addon-fit/lib/xterm-addon-fit.js')
      } catch (e) {
        container.innerHTML = '<div class="ssh-xterm-placeholder" style="color:#ff7b72">错误: 终端组件加载失败</div>'
        return
      }
    }

    // Create xterm.js terminal
    let term
    try {
    term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 14,
      fontFamily: "'SF Mono','Fira Code','Cascadia Code','Consolas',monospace",
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        selectionBackground: 'rgba(88,166,255,0.3)',
        black: '#484f58', red: '#ff7b72', green: '#3fb950', yellow: '#d29922',
        blue: '#58a6ff', magenta: '#bc8cff', cyan: '#39c5cf', white: '#b1bac4',
        brightBlack: '#6e7681', brightRed: '#ffa198', brightGreen: '#56d364',
        brightYellow: '#e3b341', brightBlue: '#79c0ff', brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd', brightWhite: '#f0f6fc'
      },
      allowProgRelGlyphs: true,
      allowTransparency: false
    })

    const FitAddonCtor = typeof FitAddon === 'function' ? FitAddon : FitAddon.FitAddon
    const fitAddonLocal = new FitAddonCtor()
    term.loadAddon(fitAddonLocal)
    term.open(container)
    fitAddonLocal.fit()

    currentTerminal = term
    fitAddon = fitAddonLocal

    // Handle terminal output from main process
    const outputHandler = ({ sessionId, data }) => {
      if (sessionId === currentSessionId) term.write(data)
    }
    window.os.onSshOutput(outputHandler)

    const eventHandler = ({ sessionId, event }) => {
      if (sessionId === currentSessionId && event === 'disconnected') {
        term.write('\r\n\x1b[31m[连接已断开]\x1b[0m\r\n')
        pushNotif('SSH 连接已断开', 'warning', '🔌')
      }
    }
    window.os.onSshEvent(eventHandler)

    const errorHandler = ({ sessionId, error }) => {
      if (sessionId === currentSessionId) {
        term.write(`\r\n\x1b[31m[错误: ${error}]\x1b[0m\r\n`)
      }
    }
    window.os.onSshError(errorHandler)

    // Handle user input
    term.onData((data) => {
      if (currentSessionId) window.os.sshWrite(currentSessionId, data)
    })

    // Handle terminal resize
    term.onResize(({ cols, rows }) => {
      if (currentSessionId) window.os.sshResize(currentSessionId, cols, rows)
    })

    // Password prompt helper
    const askPassword = () => {
      term.write('\r\n')
      return new Promise((resolve) => {
        let passwordBuf = ''
        term.write('Password: ')
        let disposable = null
        disposable = term.onData((data) => {
          if (data === '\r') {
            if (disposable) disposable.dispose()
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
        })
      })
    }

    // Connect to SSH server
    const sessionId = 'ssh_' + Date.now()
    currentSessionId = sessionId
    term.write(`Connecting to ${username}@${host}:${port}...\r\n`)

    // Ask for password
    const password = await askPassword()

    // Connect with password
    const connectResult = await window.os.sshConnect({
      sessionId, host, port, username,
      password,
      cols: term.cols, rows: term.rows
    })

    if (!connectResult.success) {
      term.write(`\x1b[31m连接失败: ${connectResult.error}\x1b[0m\r\n`)
      term.write('\x1b[90m提示: 确认目标机器 SSH 服务已启动 (sudo systemctl start ssh)\x1b[0m\r\n')
      pushNotif(`SSH 连接失败: ${connectResult.error}`, 'error', '🔌')
      return
    }

    pushNotif(`SSH 已连接 ${username}@${host}:${port}`, 'success', '🔌')

    // Hide hosts panel on successful connect
    const panel = document.getElementById('sshHostsPanel')
    if (panel) panel.style.display = 'none'

    // Show SFTP toggle button
    const sftpToggle = document.getElementById('sshSftpToggle')
    if (sftpToggle) sftpToggle.style.display = ''

    term.focus()

    // ========== SFTP ==========
    let sftpCurrentPath = '/'
    let sftpOpen = false

    const sftpFileList = document.getElementById('sftpFileList')
    const sftpPathEl = document.getElementById('sftpPath')
    const sftpStatus = document.getElementById('sftpStatus')
    const sftpPanel = document.getElementById('sshSftpPanel')

    const formatSftpSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
    }

    const formatSftpTime = (ts) => {
      if (!ts) return '--'
      const d = new Date(ts * 1000)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    const formatSftpMode = (mode) => {
      if (!mode) return '----------'
      const types = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx']
      const buf = mode.toString(8).slice(-9)
      let s = buf[0] === '4' ? 'd' : buf[0] === '1' ? 'l' : '-'
      for (let i = 1; i <= 3; i++) s += types[parseInt(buf[i])] || '---'
      return s
    }

    const loadSftpDir = async (dirPath) => {
      if (!sftpOpen || !sftpPanel) return
      sftpStatus.textContent = '加载中...'
      sftpFileList.innerHTML = '<div class="ssh-sftp-loading">加载中...</div>'
      const result = await window.os.sftpList({ sessionId, remotePath: dirPath })
      if (result.error) {
        sftpFileList.innerHTML = `<div class="ssh-sftp-error">❌ ${escapeHtml(result.error)}</div>`
        sftpStatus.textContent = '错误'
        return
      }
      sftpCurrentPath = result.path
      sftpPathEl.textContent = result.path
      sftpStatus.textContent = `${result.items.length} 项`

      let html = ''
      // Parent directory
      if (result.path !== '/') {
        const parent = result.path.replace(/\/[^/]+\/?$/, '') || '/'
        html += `<div class="ssh-sftp-item ssh-sftp-dir" data-path="${escapeHtml(parent)}" data-type="dir">
          <span class="ssh-sftp-icon">📁</span>
          <span class="ssh-sftp-name">..</span>
          <span class="ssh-sftp-mode">drwxr-xr-x</span>
          <span class="ssh-sftp-size">-</span>
          <span class="ssh-sftp-time">-</span>
          <span class="ssh-sftp-actions-cell"></span>
        </div>`
      }

      for (const item of result.items) {
        const fullPath = result.path === '/' ? '/' + item.name : result.path + '/' + item.name
        const icon = item.isDir ? '📁' : item.isLink ? '🔗' : '📄'
        const cls = item.isDir ? 'ssh-sftp-dir' : item.isLink ? 'ssh-sftp-link' : 'ssh-sftp-file'
        html += `<div class="ssh-sftp-item ${cls}" data-path="${escapeHtml(fullPath)}" data-type="${item.isDir ? 'dir' : 'file'}" data-name="${escapeHtml(item.name)}">
          <span class="ssh-sftp-icon">${icon}</span>
          <span class="ssh-sftp-name">${escapeHtml(item.name)}</span>
          <span class="ssh-sftp-mode">${formatSftpMode(item.mode)}</span>
          <span class="ssh-sftp-size">${item.isDir ? '-' : formatSftpSize(item.size)}</span>
          <span class="ssh-sftp-time">${formatSftpTime(item.mtime)}</span>
          <span class="ssh-sftp-actions-cell">
            ${!item.isDir ? `<button class="ssh-sftp-item-btn sftp-dl-btn" title="下载" data-path="${escapeHtml(fullPath)}">⬇</button>` : ''}
            <button class="ssh-sftp-item-btn sftp-rename-btn" title="重命名" data-path="${escapeHtml(fullPath)}" data-name="${escapeHtml(item.name)}">✏️</button>
            <button class="ssh-sftp-item-btn sftp-del-btn" title="删除" data-path="${escapeHtml(fullPath)}" data-type="${item.isDir ? 'dir' : 'file'}" data-name="${escapeHtml(item.name)}">🗑</button>
          </span>
        </div>`
      }

      if (!result.items.length && result.path === '/') {
        html = '<div class="ssh-sftp-empty">空目录</div>'
      }

      sftpFileList.innerHTML = html

      // Bind events
      sftpFileList.querySelectorAll('.ssh-sftp-dir').forEach(el => {
        el.addEventListener('dblclick', () => loadSftpDir(el.dataset.path))
      })

      sftpFileList.querySelectorAll('.sftp-dl-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation()
          sftpStatus.textContent = '下载中...'
          const r = await window.os.sftpDownload({ sessionId, remotePath: btn.dataset.path })
          if (r.error) sftpStatus.textContent = '下载失败: ' + r.error
          else if (r.canceled) sftpStatus.textContent = '已取消'
          else { sftpStatus.textContent = '✅ 已保存到 ' + r.localPath.split(/[/\\]/).pop(); pushNotif('SFTP 文件下载完成', 'success', '⬇') }
        })
      })

      sftpFileList.querySelectorAll('.sftp-rename-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation()
          const oldName = btn.dataset.name
          const newName = prompt('重命名为:', oldName)
          if (!newName || newName === oldName) return
          const dir = btn.dataset.path.replace(/\/[^/]+$/, '') || '/'
          const newPath = dir === '/' ? '/' + newName : dir + '/' + newName
          sftpStatus.textContent = '重命名中...'
          const r = await window.os.sftpRename({ sessionId, oldPath: btn.dataset.path, newPath })
          if (r.error) sftpStatus.textContent = '重命名失败: ' + r.error
          else { sftpStatus.textContent = '✅ 已重命名'; loadSftpDir(sftpCurrentPath) }
        })
      })

      sftpFileList.querySelectorAll('.sftp-del-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation()
          if (!confirm(`确定删除 "${btn.dataset.name}"？`)) return
          sftpStatus.textContent = '删除中...'
          const r = await window.os.sftpDelete({ sessionId, remotePath: btn.dataset.path, isDir: btn.dataset.type === 'dir' })
          if (r.error) sftpStatus.textContent = '删除失败: ' + r.error
          else { sftpStatus.textContent = '✅ 已删除'; loadSftpDir(sftpCurrentPath); pushNotif(`SFTP 已删除: ${btn.dataset.name}`, 'info', '🗑') }
        })
      })
    }

    // SFTP toggle
    if (sftpToggle) {
      sftpToggle.onclick = async () => {
        if (sftpOpen) {
          sftpPanel.style.display = 'none'
          sftpOpen = false
          sftpToggle.style.background = ''
          return
        }
        sftpOpen = true
        sftpToggle.style.background = 'rgba(88,166,255,0.3)'
        sftpPanel.style.display = ''
        const r = await window.os.sftpOpen({ sessionId })
        if (r.error) {
          sftpStatus.textContent = 'SFTP 连接失败: ' + r.error
          return
        }
        // Detect user's home directory
        const homeResult = await window.os.sftpList({ sessionId, remotePath: '/root' })
        if (!homeResult.error) {
          sftpCurrentPath = '/root'
        } else {
          const userResult = await window.os.sftpList({ sessionId, remotePath: '/home/' + username })
          if (!userResult.error) sftpCurrentPath = '/home/' + username
          else sftpCurrentPath = '/'
        }
        loadSftpDir(sftpCurrentPath)
      }
    }

    // SFTP navigation buttons
    const sftpUpBtn = document.getElementById('sftpUpBtn')
    if (sftpUpBtn) sftpUpBtn.onclick = () => {
      const parent = sftpCurrentPath.replace(/\/[^/]+\/?$/, '') || '/'
      loadSftpDir(parent)
    }

    const sftpRefreshBtn = document.getElementById('sftpRefreshBtn')
    if (sftpRefreshBtn) sftpRefreshBtn.onclick = () => loadSftpDir(sftpCurrentPath)

    // SFTP upload
    const sftpUploadBtn = document.getElementById('sftpUploadBtn')
    if (sftpUploadBtn) {
      sftpUploadBtn.onclick = async () => {
        sftpStatus.textContent = '选择文件...'
        const r = await window.os.sftpUploadFile({ sessionId, remoteDir: sftpCurrentPath })
        if (r.error) sftpStatus.textContent = '上传失败: ' + r.error
        else if (r.canceled) sftpStatus.textContent = '已取消'
        else { sftpStatus.textContent = '✅ 上传成功'; loadSftpDir(sftpCurrentPath); pushNotif('SFTP 文件上传成功', 'success', '📤') }
      }
    }

    // SFTP mkdir
    const sftpMkdirBtn = document.getElementById('sftpMkdirBtn')
    if (sftpMkdirBtn) {
      sftpMkdirBtn.onclick = async () => {
        const name = prompt('新建文件夹名称:')
        if (!name) return
        const remotePath = sftpCurrentPath === '/' ? '/' + name : sftpCurrentPath + '/' + name
        sftpStatus.textContent = '创建中...'
        const r = await window.os.sftpMkdir({ sessionId, remotePath })
        if (r.error) sftpStatus.textContent = '创建失败: ' + r.error
        else { sftpStatus.textContent = '✅ 已创建'; loadSftpDir(sftpCurrentPath); pushNotif(`SFTP 已创建文件夹: ${name}`, 'success', '📁') }
      }
    }

    // Drag & drop upload on file list
    if (sftpFileList) {
      sftpFileList.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; sftpFileList.classList.add('ssh-sftp-dragover') })
      sftpFileList.addEventListener('dragleave', () => sftpFileList.classList.remove('ssh-sftp-dragover'))
      sftpFileList.addEventListener('drop', async (e) => {
        e.preventDefault()
        sftpFileList.classList.remove('ssh-sftp-dragover')
        const files = e.dataTransfer.files
        if (!files.length) return
        sftpStatus.textContent = `上传 ${files.length} 个文件...`
        for (const file of files) {
          const filePath = file.path || file.name
          const remotePath = sftpCurrentPath === '/' ? '/' + file.name : sftpCurrentPath + '/' + file.name
          const r = await window.os.sftpUpload({ sessionId, remotePath, localPath: filePath })
          if (r.error) { sftpStatus.textContent = `上传 ${file.name} 失败: ${r.error}`; return }
        }
        sftpStatus.textContent = `✅ 上传 ${files.length} 个文件完成`
        pushNotif(`SFTP 拖拽上传 ${files.length} 个文件完成`, 'success', '📤')
        loadSftpDir(sftpCurrentPath)
      })
    }

    // Resize observer for xterm
    const resizeObs = new ResizeObserver(() => { if (fitAddon) try { fitAddon.fit() } catch(e) {} })
    resizeObs.observe(container)

    } catch (err) {
      const msg = err && err.message ? err.message : String(err)
      const stack = err && err.stack ? err.stack : ''
      console.error('SSH terminal error:', err)
      container.innerHTML = '<div class="ssh-xterm-placeholder" style="color:#ff7b72;flex-direction:column;gap:8px;padding:20px;pointer-events:auto;text-align:left;line-height:1.6;">' +
        '<div style="font-weight:bold;margin-bottom:8px;">❌ 终端错误</div>' +
        '<div style="font-size:13px;">' + msg.replace(/</g,'&lt;') + '</div>' +
        '<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:8px;white-space:pre-wrap;max-height:120px;overflow-y:auto;">' + stack.replace(/</g,'&lt;').split('\n').slice(0, 5).join('\n') + '</div>' +
        '</div>'
    }
  }

  // Connect button
  const btn = document.getElementById('sshConnectBtn')
  if (btn) {
    btn.onclick = () => { console.log('[SSH] connect button clicked'); window.sshDoConnect() }
  } else {
    console.log('[SSH] ERROR: sshConnectBtn not found!')
  }

  // Enter key in input
  const inp = document.getElementById('sshConnStr')
  if (inp) {
    inp.onkeydown = (e) => {
      if (e.key === 'Enter') { console.log('[SSH] Enter pressed, value:', inp.value); window.sshDoConnect() }
    }
  } else {
    console.log('[SSH] ERROR: sshConnStr not found!')
  }

  // Delete host from history
  window.sshDelHost = (idx) => {
    let saved = JSON.parse(localStorage.getItem('glassos_ssh_hosts') || '[]')
    saved.splice(idx, 1)
    localStorage.setItem('glassos_ssh_hosts', JSON.stringify(saved))
    closeWindow('ssh')
    openSSH()
  }

  // Cleanup on window close
  const _origClose = window.closeWindow || closeWindow
  window.closeWindow = function(id) {
    if (id === 'ssh') {
      if (currentSessionId) { window.os.sshDisconnect(currentSessionId); currentSessionId = null }
      if (currentTerminal) { currentTerminal.dispose(); currentTerminal = null }
    }
    _origClose(id)
  }
}

function openLinuxTerminal() {
  const content = `<div id="linuxTerm" style="height:100%;background:#0d1117;padding:12px;font-family:'SF Mono','Fira Code','Cascadia Code','Consolas',monospace;font-size:14px;line-height:1.4;color:#c9d1d9;overflow-y:auto;outline:none;white-space:pre-wrap;word-break:break-all;" tabindex="0"></div>`
  createWindow('linux', 'Linux 终端', 750, 480, content)

  setTimeout(async () => {
    const el = document.getElementById('linuxTerm')
    if (!el) return

    // Lazy-load linux-simulator.js
    if (typeof LinuxSimulator === 'undefined') {
      el.textContent = '正在加载 Linux 模拟器...'
      try {
        await loadScript('linux-simulator.js')
      } catch (e) {
        el.textContent = '错误: Linux 模拟器加载失败'
        return
      }
    }

    const linux = new LinuxSimulator()
    let inputBuffer = ''
    let history = []
    let historyIdx = -1

    function getPrompt() {
      const p = linux.cwd.replace(linux.env.HOME, '~')
      return `\x1b[32muser@glassos\x1b[0m:\x1b[34m${p}\x1b[0m$ `
    }

    function stripAnsi(s) {
      return s.replace(/\x1b\[[0-9;]*m/g, '')
    }

    function writeHTML(html) {
      el.innerHTML += html
      el.scrollTop = el.scrollHeight
    }

    function writeLine(text) {
      writeHTML('<div>' + escapeHtml(text) + '</div>')
    }

    function writeAnsiLine(text) {
      writeHTML('<div>' + ansiToHtml(text) + '</div>')
    }

    function ansiToHtml(s) {
      let result = ''
      let open = false
      for (let i = 0; i < s.length; i++) {
        if (s[i] === '\x1b' && s[i+1] === '[') {
          let j = i + 2
          while (j < s.length && s[j] !== 'm') j++
          const code = s.substring(i+2, j)
          if (code === '0') {
            if (open) { result += '</span>'; open = false }
          } else {
            const color = ansiToColor(code)
            if (color) {
              if (open) result += '</span>'
              result += '<span style="' + color + '">'
              open = true
            }
          }
          i = j
        } else {
          result += escapeHtml(s[i])
        }
      }
      if (open) result += '</span>'
      return result
    }

    function ansiToColor(code) {
      if (code === '1;32' || code === '32') return 'color:#3fb950'
      if (code === '1;34' || code === '34') return 'color:#58a6ff'
      if (code === '1;36' || code === '36') return 'color:#39c5cf'
      if (code === '1;33' || code === '33') return 'color:#d29922'
      if (code === '31') return 'color:#ff7b72'
      if (code === '90') return 'color:#484f58'
      if (code === '7') return 'background:#484f58'
      return ''
    }

    function showPrompt() {
      writeAnsiLine(getPrompt())
    }

    function renderCurrentInput() {
      const prompt = getPrompt()
      const lastLine = el.lastElementChild
      if (lastLine) lastLine.remove()
      writeAnsiLine(prompt + escapeHtml(inputBuffer))
    }

    el.addEventListener('click', () => el.focus())

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = inputBuffer
        if (cmd.trim()) history.push(cmd)
        historyIdx = history.length
        inputBuffer = ''
        writeLine(getPrompt().replace(/\x1b\[[0-9;]*m/g, '') + cmd)
        const result = linux.exec(cmd)
        if (result === '__CLEAR__') {
          el.innerHTML = ''
          showPrompt()
        } else if (result === '__EXIT__') {
          closeWindow('linux')
        } else if (result && result.__realExec) {
          writeAnsiLine('\x1b[90m[执行系统命令: ' + escapeHtml(result.cmd) + ']\x1b[0m')
          window.os.execCommand(result.cmd).then(res => {
            if (res.stdout) {
              const lines = res.stdout.split('\n')
              for (const line of lines) writeLine(line)
            }
            if (res.stderr) {
              const lines = res.stderr.split('\n')
              for (const line of lines) writeAnsiLine('\x1b[31m' + escapeHtml(line) + '\x1b[0m')
            }
            if (res.error) {
              writeAnsiLine('\x1b[31m错误: ' + escapeHtml(res.error) + '\x1b[0m')
            }
            showPrompt()
          }).catch(err => {
            writeAnsiLine('\x1b[31m执行失败: ' + escapeHtml(String(err)) + '\x1b[0m')
            showPrompt()
          })
        } else {
          if (result) {
            const lines = result.split('\n')
            for (const line of lines) {
              writeAnsiLine(line)
            }
          }
          showPrompt()
        }
        e.preventDefault()
      } else if (e.key === 'Backspace') {
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1)
          renderCurrentInput()
        }
        e.preventDefault()
      } else if (e.key === 'ArrowUp') {
        if (history.length > 0 && historyIdx > 0) {
          historyIdx--
          inputBuffer = history[historyIdx]
          renderCurrentInput()
        }
        e.preventDefault()
      } else if (e.key === 'ArrowDown') {
        if (historyIdx < history.length - 1) {
          historyIdx++
          inputBuffer = history[historyIdx]
        } else {
          historyIdx = history.length
          inputBuffer = ''
        }
        renderCurrentInput()
        e.preventDefault()
      } else if (e.key === 'c' && e.ctrlKey) {
        writeLine(getPrompt().replace(/\x1b\[[0-9;]*m/g, '') + inputBuffer + '^C')
        inputBuffer = ''
        showPrompt()
        e.preventDefault()
      } else if (e.key === 'l' && e.ctrlKey) {
        el.innerHTML = ''
        showPrompt()
        inputBuffer = ''
        e.preventDefault()
      } else if (e.key === 'Tab') {
        e.preventDefault()
        const parts = inputBuffer.split(' ')
        const isCommand = parts.length <= 1
        const partial = parts[parts.length - 1] || ''
        let matches = []
        if (isCommand) {
          matches = linux.allCommands.filter(c => c.startsWith(partial) && c !== partial)
        } else {
          const dir = linux.cwd
          const node = linux.getNode(dir)
          if (node && node.type === 'dir') {
            matches = node.children.filter(c => c.startsWith(partial) && c !== partial)
          }
        }
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0]
          inputBuffer = parts.join(' ') + ' '
          renderCurrentInput()
        } else if (matches.length > 1) {
          writeLine(getPrompt().replace(/\x1b\[[0-9;]*m/g, '') + inputBuffer)
          writeAnsiLine('\x1b[90m' + matches.join('  ') + '\x1b[0m')
          const common = matches.reduce((a, b) => {
            let i = 0
            while (i < a.length && i < b.length && a[i] === b[i]) i++
            return a.substring(0, i)
          })
          if (common.length > partial.length) {
            parts[parts.length - 1] = common
            inputBuffer = parts.join(' ')
          }
          showPrompt()
          renderCurrentInput()
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        inputBuffer += e.key
        renderCurrentInput()
      }
    })

    writeAnsiLine('\x1b[1;36m╔════════════════════════════════════════════════════════════════╗\x1b[0m')
    writeAnsiLine('\x1b[1;36m║            GlassOS Linux 命令练习环境                         ║\x1b[0m')
    writeAnsiLine('\x1b[1;36m║  输入 help 查看所有可用命令                                   ║\x1b[0m')
    writeAnsiLine('\x1b[1;36m╚════════════════════════════════════════════════════════════════╝\x1b[0m')
    writeLine('')
    writeAnsiLine('\x1b[90m  200+ 命令模拟 | 支持管道 | 支持重定向 | 虚拟文件系统\x1b[0m')
    writeLine('')
    showPrompt()
    el.focus()
  }, 200)
}

// ========== 回收站 ==========
window._trashItems = JSON.parse(localStorage.getItem('glassos_trash') || '[]')

function saveTrash() {
  localStorage.setItem('glassos_trash', JSON.stringify(window._trashItems))
}

function openTrash() {
  const items = window._trashItems
  const listHtml = items.length === 0
    ? '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:14px">回收站为空</div>'
    : items.map((item, i) => `
      <div class="trash-item">
        <span>${item.icon} ${item.label}</span>
        <button class="trash-restore-btn" onclick="restoreTrashItem(${i})">还原</button>
      </div>`).join('')

  const content = `<div class="trash-list">${listHtml}</div>`
  createWindow('trash', '回收站', 400, 380, content)

  window.restoreTrashItem = (i) => {
    const item = window._trashItems[i]
    if (!item) return
    const desktopIcons = document.getElementById('desktopIcons')
    const div = document.createElement('div')
    div.className = 'desktop-icon'
    div.dataset.app = item.appId
    div.ondblclick = () => openApp(item.appId)
    div.innerHTML = `<div class="desktop-icon-img">${item.icon}</div><div class="desktop-icon-label">${item.label}</div>`
    desktopIcons.appendChild(div)
    bindDesktopIconEvents(div)
    window._trashItems.splice(i, 1)
    saveTrash()
    closeWindow('trash')
    setTimeout(() => openTrash(), 50)
    updateTrashIcon()
  }

  if (items.length > 0) {
    setTimeout(() => {
      const winEl = document.getElementById('win-trash')
      if (winEl) {
        const body = winEl.querySelector('.win-body')
        const clearBtn = document.createElement('button')
        clearBtn.className = 'trash-clear-btn'
        clearBtn.textContent = '清空回收站'
        clearBtn.style.cssText += 'position:absolute;bottom:12px;right:12px;'
        clearBtn.onclick = () => {
          window._trashItems = []
          saveTrash()
          closeWindow('trash')
          setTimeout(() => openTrash(), 50)
          updateTrashIcon()
        }
        body.appendChild(clearBtn)
      }
    }, 100)
  }
}

function moveToTrash(appId) {
  const icon = document.querySelector(`.desktop-icon[data-app="${appId}"]`)
  if (!icon) return
  const label = icon.querySelector('.desktop-icon-label')?.textContent || appId
  const img = icon.querySelector('.desktop-icon-img')?.textContent || '📄'
  window._trashItems.push({ appId, label, icon: img })
  saveTrash()
  icon.remove()
  updateTrashIcon()
}

function updateTrashIcon() {
  const iconEl = document.querySelector('.desktop-icon[data-app="trash"] .desktop-icon-img')
  if (iconEl) {
    iconEl.style.opacity = window._trashItems.length > 0 ? '1' : '0.6'
  }
}
updateTrashIcon()

// ========== Launchpad ==========
const launchpadApps = [
  { id: 'finder', icon: '📁', label: '访达' },
  { id: 'terminal', icon: '💻', label: '终端' },
  { id: 'linux', icon: '🐧', label: 'Linux' },
  { id: 'ssh', icon: '🔒', label: 'SSH' },
  { id: 'notes', icon: '📝', label: '备忘录' },
  { id: 'calc', icon: '🧮', label: '计算器' },
  { id: 'weather', icon: '🌤️', label: '天气' },
  { id: 'settings', icon: '⚙️', label: '设置' },
  { id: 'trash', icon: '🗑️', label: '回收站' },
  { id: 'player', icon: '🎵', label: '音乐' },
  { id: 'browser', icon: '🌐', label: '浏览器' },
  { id: 'monitor', icon: '📊', label: '监视器' },
  { id: 'calendar', icon: '📅', label: '日历' },
  { id: 'store', icon: '🛍️', label: '应用市场' },
  { id: 'paint', icon: '🎨', label: '画板' },
  { id: 'devtools', icon: '🔧', label: '开发者工具' },
  { id: 'clipboard', icon: '📋', label: '剪贴板' },
  { id: 'editor', icon: '📝', label: '文本编辑器' },
  { id: 'disk', icon: '💾', label: '磁盘分析' },
  { id: 'pomodoro', icon: '🍅', label: '番茄钟' },
  { id: 'converter', icon: '🔄', label: '单位换算' },
  { id: 'process', icon: '⚙', label: '进程管理' },
]

function buildLaunchpadGrid(filter) {
  const grid = document.getElementById('launchpadGrid')
  if (!grid) return
  grid.innerHTML = ''
  const term = (filter || '').toLowerCase()
  const filtered = launchpadApps.filter(a =>
    (!term || a.label.toLowerCase().includes(term) || a.id.toLowerCase().includes(term)) && isAppInstalled(a.id)
  )
  filtered.forEach((app, i) => {
    const div = document.createElement('div')
    div.className = 'launchpad-app'
    div.style.animationDelay = (i * 0.03) + 's'
    div.innerHTML = `<div class="launchpad-app-icon">${app.icon}</div><div class="launchpad-app-label">${app.label}</div>`
    div.addEventListener('click', () => { closeLaunchpad(); openApp(app.id) })
    grid.appendChild(div)
  })
}

function openLaunchpad() {
  const lp = document.getElementById('launchpad')
  if (!lp) return
  lp.classList.add('active')
  buildLaunchpadGrid()
  setTimeout(() => {
    const inp = document.getElementById('launchpadSearch')
    if (inp) { inp.value = ''; inp.focus() }
  }, 150)
}

function closeLaunchpad() {
  const lp = document.getElementById('launchpad')
  if (lp) lp.classList.remove('active')
}

setTimeout(() => {
  const si = document.getElementById('launchpadSearch')
  if (si) si.addEventListener('input', (e) => buildLaunchpadGrid(e.target.value))
}, 500)

// ========== 壁纸 ==========
const builtinWallpapers = [
  { name: '深海', style: 'background: linear-gradient(160deg, #0c1445 0%, #1a0a2e 30%, #16213e 60%, #0a1628 100%)' },
  { name: '极光', style: 'background: linear-gradient(135deg, #0d1b2a 0%, #1b2838 25%, #1a3a2a 50%, #0d2137 75%, #1a1030 100%)' },
  { name: '暮色', style: 'background: linear-gradient(180deg, #2d1b69 0%, #e84393 50%, #fdcb6e 100%)' },
  { name: '墨绿', style: 'background: linear-gradient(160deg, #0a0f0a 0%, #0d1f0d 30%, #1a2f1a 60%, #0a1a0a 100%)' },
  { name: '黑金', style: 'background: linear-gradient(135deg, #1a1a0a 0%, #0a0a05 30%, #1a1005 60%, #0a0a05 100%)' },
  { name: '纯黑', style: 'background: #050508' },
  { name: '晨曦', style: 'background: linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #533483 60%, #e94560 100%)' },
  { name: '冰川', style: 'background: linear-gradient(160deg, #0a1628 0%, #0d2137 30%, #1a3a4a 60%, #0d2137 100%)' },
  // ===== 液态玻璃动态壁纸 (CSS 动画) =====
  { name: '液态深海', tag: '🌊 动态', css: 'wp-liquid-ocean' },
  { name: '极光涟漪', tag: '🌌 动态', css: 'wp-aurora-ripple' },
  { name: '暮光流动', tag: '🌅 动态', css: 'wp-twilight-flow' },
  { name: '冰晶折射', tag: '🧊 动态', css: 'wp-ice-refract' },
  { name: '星云脉动', tag: '✨ 动态', css: 'wp-nebula-pulse' },
  { name: '熔岩呼吸', tag: '🌋 动态', css: 'wp-lava-breathe' },
]

let wpStyleEl = null

function stopWallpaperDynamic() {
  if (wpStyleEl) { wpStyleEl.remove(); wpStyleEl = null }
  const canvas = document.getElementById('wpWebGLCanvas')
  if (canvas) canvas.remove()
}

const wpCSS = {
  'wp-liquid-ocean': `
    background: #080c1a;
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(10,40,80,0.8) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 30%, rgba(15,30,70,0.6) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 80%, rgba(5,20,60,0.7) 0%, transparent 50%),
      radial-gradient(ellipse at 30% 20%, rgba(20,60,120,0.3) 0%, transparent 30%),
      linear-gradient(180deg, #060a18 0%, #0a1428 40%, #081020 100%);
    animation: wpOceanMove 25s ease-in-out infinite alternate;
    background-size: 200% 200%, 180% 180%, 220% 220%, 160% 160%, 100% 100%;`,
  'wp-aurora-ripple': `
    background: #040810;
    background-image:
      radial-gradient(ellipse at 50% 0%, rgba(20,80,60,0.5) 0%, transparent 50%),
      radial-gradient(ellipse at 30% 40%, rgba(40,20,80,0.4) 0%, transparent 40%),
      radial-gradient(ellipse at 70% 60%, rgba(20,60,80,0.3) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 100%, rgba(10,40,60,0.4) 0%, transparent 50%);
    animation: wpAuroraRipple 30s ease-in-out infinite alternate;
    background-size: 150% 150%, 200% 200%, 180% 180%, 160% 160%;`,
  'wp-twilight-flow': `
    background: #0a0510;
    background-image:
      radial-gradient(ellipse at 50% 100%, rgba(120,30,60,0.6) 0%, transparent 50%),
      radial-gradient(ellipse at 20% 60%, rgba(60,10,80,0.5) 0%, transparent 40%),
      radial-gradient(ellipse at 80% 40%, rgba(180,80,30,0.3) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 30%, rgba(40,10,60,0.4) 0%, transparent 50%);
    animation: wpTwilightFlow 20s ease-in-out infinite alternate;
    background-size: 180% 180%, 200% 200%, 160% 160%, 150% 150%;`,
  'wp-ice-refract': `
    background: #060a14;
    background-image:
      radial-gradient(ellipse at 40% 40%, rgba(60,120,180,0.3) 0%, transparent 40%),
      radial-gradient(ellipse at 70% 70%, rgba(80,140,200,0.2) 0%, transparent 35%),
      radial-gradient(ellipse at 20% 80%, rgba(40,100,160,0.25) 0%, transparent 40%),
      radial-gradient(ellipse at 60% 20%, rgba(100,160,220,0.15) 0%, transparent 30%);
    animation: wpIceRefract 28s ease-in-out infinite alternate;
    background-size: 160% 160%, 200% 200%, 180% 180%, 140% 140%;`,
  'wp-nebula-pulse': `
    background: #040610;
    background-image:
      radial-gradient(ellipse at 30% 30%, rgba(80,30,120,0.5) 0%, transparent 40%),
      radial-gradient(ellipse at 70% 70%, rgba(30,60,120,0.4) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 50%, rgba(100,40,80,0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 20% 80%, rgba(40,20,100,0.35) 0%, transparent 40%);
    animation: wpNebulaPulse 22s ease-in-out infinite alternate;
    background-size: 200% 200%, 180% 180%, 220% 220%, 160% 160%;`,
  'wp-lava-breathe': `
    background: #0a0505;
    background-image:
      radial-gradient(ellipse at 50% 80%, rgba(140,30,10,0.6) 0%, transparent 50%),
      radial-gradient(ellipse at 30% 50%, rgba(100,20,5,0.5) 0%, transparent 40%),
      radial-gradient(ellipse at 70% 40%, rgba(160,40,15,0.4) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 20%, rgba(80,15,5,0.3) 0%, transparent 50%);
    animation: wpLavaBreathe 18s ease-in-out infinite alternate;
    background-size: 180% 180%, 200% 200%, 160% 160%, 150% 150%;`,
}

function applyWallpaper(wallpaper) {
  const bgLayer = document.querySelector('.bg-layer')
  if (!bgLayer) return
  const oldStyle = document.getElementById('wallpaper-anim-style')
  if (oldStyle) oldStyle.remove()
  stopWallpaperDynamic()

  if (wallpaper.css) {
    // 从 wpCSS 查表获取实际 CSS
    const cssRaw = wpCSS[wallpaper.css] || wallpaper.css
    if (!cssRaw) return

    // 注入关键帧
    const cssKeyframes = `
      @keyframes wpOceanMove {
        0% { background-position: 0% 0%, 20% 80%, 80% 20%, 40% 60%, 0% 0%; }
        50% { background-position: 100% 100%, 80% 20%, 20% 80%, 60% 40%, 0% 0%; }
        100% { background-position: 50% 50%, 60% 40%, 40% 60%, 80% 20%, 0% 0%; }
      }
      @keyframes wpAuroraRipple {
        0% { background-position: 0% 0%, 100% 100%, 50% 0%, 0% 100%; }
        33% { background-position: 50% 50%, 50% 0%, 0% 100%, 100% 50%; }
        66% { background-position: 100% 100%, 0% 0%, 100% 100%, 50% 50%; }
        100% { background-position: 50% 0%, 50% 100%, 50% 50%, 0% 0%; }
      }
      @keyframes wpTwilightFlow {
        0% { background-position: 0% 0%, 100% 0%, 0% 100%, 50% 50%; }
        50% { background-position: 100% 100%, 0% 100%, 100% 0%, 50% 50%; }
        100% { background-position: 50% 50%, 50% 50%, 50% 50%, 0% 0%; }
      }
      @keyframes wpIceRefract {
        0% { background-position: 0% 0%, 100% 100%, 50% 0%, 0% 100%; }
        50% { background-position: 100% 0%, 0% 100%, 100% 100%, 50% 0%; }
        100% { background-position: 50% 100%, 50% 0%, 0% 50%, 100% 50%; }
      }
      @keyframes wpNebulaPulse {
        0% { background-position: 0% 0%, 100% 100%, 50% 50%, 0% 100%; }
        50% { background-position: 100% 0%, 0% 0%, 0% 100%, 100% 0%; }
        100% { background-position: 50% 100%, 50% 50%, 100% 0%, 50% 0%; }
      }
      @keyframes wpLavaBreathe {
        0% { background-position: 0% 0%, 100% 100%, 0% 100%, 50% 0%; }
        50% { background-position: 100% 100%, 0% 0%, 100% 0%, 50% 100%; }
        100% { background-position: 50% 50%, 50% 50%, 50% 50%, 0% 0%; }
      }
    `
    wpStyleEl = document.createElement('style')
    wpStyleEl.id = 'wallpaper-anim-style'
    wpStyleEl.textContent = cssKeyframes
    document.head.appendChild(wpStyleEl)

    // 提取 animation 和 background-size，剩余作为背景
    const animMatch = cssRaw.match(/animation:\s*([^;]+);/)
    const sizeMatch = cssRaw.match(/background-size:\s*([^;]+);/)
    const bgCss = cssRaw.replace(/animation:[^;]+;?/, '').replace(/background-size:[^;]+;?/, '').trim()
    bgLayer.style.cssText = bgCss
    if (animMatch) bgLayer.style.animation = animMatch[1].trim()
    if (sizeMatch) bgLayer.style.backgroundSize = sizeMatch[1].trim()
  } else {
    bgLayer.style.cssText = wallpaper.style + ';backdrop-filter: blur(80px) saturate(200%) brightness(1.05);-webkit-backdrop-filter: blur(80px) saturate(200%) brightness(1.05)'
    if (wallpaper.name === '极光') {
      const style = document.createElement('style')
      style.id = 'wallpaper-anim-style'
      style.textContent = `@keyframes wpAurora { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`
      document.head.appendChild(style)
      bgLayer.style.animation = 'wpAurora 20s ease infinite'
      bgLayer.style.backgroundSize = '400% 400%'
    }
  }
  localStorage.setItem('glassos_wallpaper', JSON.stringify({ name: wallpaper.name, style: wallpaper.style || '', css: wallpaper.css || '', type: wallpaper.type || '' }))
}

function initWallpaper() {
  const saved = localStorage.getItem('glassos_wallpaper')
  if (saved) {
    try { const wp = JSON.parse(saved); applyWallpaper(wp); return } catch(e) {}
  }
  applyWallpaper(builtinWallpapers[0])
}

function openWallpaperPicker() {
  const grid = builtinWallpapers.map(wp => {
    const isDynamic = !!wp.css
    const bgStyle = isDynamic ? 'background:linear-gradient(135deg,#08081a,#0a0a2e,#060618)' : wp.style
    return `<div class="wp-card" onclick="applyWallpaperByName('${wp.name}')" style="${bgStyle};height:100px;border-radius:12px;cursor:pointer;transition:all 0.2s;border:2px solid transparent;position:relative;overflow:hidden">
      ${isDynamic ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 40%,rgba(88,166,255,0.15),transparent 60%),radial-gradient(ellipse at 70% 60%,rgba(168,85,247,0.1),transparent 50%);animation:wpPreviewPulse 4s ease-in-out infinite alternate"></div>` : ''}
      <div style="position:absolute;bottom:6px;left:10px;font-size:11px;color:white;text-shadow:0 1px 3px rgba(0,0,0,0.6)">${wp.name}</div>
      ${wp.tag ? `<div style="position:absolute;top:6px;right:6px;font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(88,166,255,0.2);color:#58a6ff;border:0.5px solid rgba(88,166,255,0.3)">${wp.tag}</div>` : ''}
    </div>`
  }).join('')
  const content = `<style>@keyframes wpPreviewPulse{0%{opacity:0.6;transform:scale(1)}100%{opacity:1;transform:scale(1.05)}}</style><div style="padding:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${grid}</div>`
  createWindow('wallpaper', '壁纸', 500, 420, content)
  window.applyWallpaperByName = (name) => {
    const wp = builtinWallpapers.find(w => w.name === name)
    if (wp) applyWallpaper(wp)
  }
}
initWallpaper()

// ========== 浏览器应用 ==========
function openBrowser() {
  const tabState = { tabs: [], activeIdx: 0 }
  let bookmarkState = JSON.parse(localStorage.getItem('glassos_bookmarks') || '[]')
  let bookmarksVisible = true

  function saveBookmarks() {
    localStorage.setItem('glassos_bookmarks', JSON.stringify(bookmarkState))
  }

  function isBookmarked(url) {
    return bookmarkState.some(b => b.url === url)
  }

  function addBookmark(title, url) {
    if (isBookmarked(url)) return
    bookmarkState.push({ title: title || url, url })
    saveBookmarks()
    renderBookmarks()
    updateBookmarkStar()
  }

  function removeBookmark(url) {
    bookmarkState = bookmarkState.filter(b => b.url !== url)
    saveBookmarks()
    renderBookmarks()
    updateBookmarkStar()
  }

  function toggleBookmark(title, url) {
    if (isBookmarked(url)) removeBookmark(url)
    else addBookmark(title, url)
  }

  function renderBookmarks() {
    const bar = document.getElementById('browserBookmarks')
    if (!bar) return
    bar.innerHTML = bookmarkState.map((b, i) =>
      `<span class="browser-bookmark-item" onclick="window._browser_navigate('${escapeHtml(b.url)}')" oncontextmenu="event.preventDefault();window._browser_removeBookmark('${escapeHtml(b.url)}')">${escapeHtml(b.title)}</span>`
    ).join('')
  }

  function updateBookmarkStar() {
    const star = document.getElementById('browserBookmarkStar')
    if (!star) return
    const tab = tabState.tabs[tabState.activeIdx]
    if (tab && tab.url && !tab.isHome) {
      star.style.display = ''
      star.classList.toggle('bookmarked', isBookmarked(tab.url))
    } else {
      star.style.display = 'none'
    }
  }

  function createTab(url) {
    if (tabState.tabs.length >= 10) {
      alert('最多同时打开 10 个标签页')
      return
    }
    const id = Date.now()
    const isHome = !url
    tabState.tabs.push({ id, url: url || '', title: isHome ? '新标签页' : (url || '新标签页'), isHome })
    tabState.activeIdx = tabState.tabs.length - 1
    renderTabs()
    renderContent()
  }

  function closeTab(index) {
    if (tabState.tabs.length <= 1) {
      tabState.tabs = []
      createTab(null)
      return
    }
    tabState.tabs.splice(index, 1)
    if (tabState.activeIdx >= tabState.tabs.length) tabState.activeIdx = tabState.tabs.length - 1
    if (tabState.activeIdx > index) tabState.activeIdx--
    if (tabState.activeIdx < 0) tabState.activeIdx = 0
    renderTabs()
    renderContent()
  }

  function switchTab(index) {
    tabState.activeIdx = index
    renderTabs()
    renderContent()
  }

  function renderTabs() {
    const container = document.getElementById('browserTabs')
    if (!container) return
    container.innerHTML = tabState.tabs.map((t, i) => `
      <div class="browser-tab${i === tabState.activeIdx ? ' active' : ''}" onclick="window._browser_switchTab(${i})">
        <span style="overflow:hidden;text-overflow:ellipsis;max-width:100px">${escapeHtml(t.title)}</span>
        <span class="tab-close" onclick="event.stopPropagation();window._browser_closeTab(${i})">✕</span>
      </div>
    `).join('') + `<span class="browser-tab-new" onclick="window._browser_newTab()" title="新建标签">+</span>`
  }

  function navigateTo(url) {
    if (!url) return
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
    const tab = tabState.tabs[tabState.activeIdx]
    if (!tab) return
    tab.url = url
    tab.isHome = false
    tab.title = url
    updateBookmarkStar()
    renderTabs()
    renderContent()
  }

  function renderContent() {
    const container = document.getElementById('browserContent')
    if (!container) return
    const tab = tabState.tabs[tabState.activeIdx]
    if (!tab) return
    container.innerHTML = ''

    if (tab.isHome) {
      container.innerHTML = renderHomePanel()
      document.getElementById('browserUrlInput').value = ''
    } else {
      const wv = document.createElement('webview')
      wv.src = tab.url
      wv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'
      wv.setAttribute('nodeintegration', 'false')
      wv.addEventListener('page-title-updated', (e) => {
        tab.title = e.title
        renderTabs()
        if (tab === tabState.tabs[tabState.activeIdx]) {
          document.getElementById('browserUrlInput').value = tab.url
        }
      })
      wv.addEventListener('did-navigate', (e) => {
        tab.url = e.url
        if (tab === tabState.tabs[tabState.activeIdx]) {
          document.getElementById('browserUrlInput').value = e.url
          updateBookmarkStar()
        }
      })
      wv.addEventListener('did-navigate-in-page', (e) => {
        if (e.isMainFrame) tab.url = e.url
      })
      container.appendChild(wv)
      document.getElementById('browserUrlInput').value = tab.url
      updateBookmarkStar()
    }
  }

  function renderHomePanel() {
    const cards = [
      { icon: '🔗', title: '百度', url: 'https://www.baidu.com' },
      { icon: '🐙', title: 'GitHub', url: 'https://github.com' },
      { icon: '📺', title: 'Bilibili', url: 'https://www.bilibili.com' },
      { icon: '🔗', title: '百度', url: 'https://www.baidu.com' },
    ]
    const cardsHtml = cards.map(c => `
      <div class="browser-home-card" onclick="window._browser_navigate('${c.url}')">
        <span class="card-icon">${c.icon}</span>
        <span class="card-title">${c.title}</span>
      </div>
    `).join('')

    return `<div class="browser-home">
      <div style="font-size:28px;color:rgba(255,255,255,0.8);font-weight:200">🌐 GlassOS 浏览器</div>
      <div class="browser-home-search">
        <span>🔍</span>
        <input id="homeSearchInput" placeholder="搜索或输入网址..." onkeydown="if(event.key==='Enter')window._browser_navigate(this.value.includes('.')&&!this.value.includes(' ')?this.value:'https://www.baidu.com/s?wd='+encodeURIComponent(this.value))">
      </div>
      <div class="browser-home-grid">${cardsHtml}</div>
    </div>`
  }

  // 构建 UI
  const content = `<div class="app-browser">
    <div class="browser-tabs" id="browserTabs"></div>
    <div class="browser-nav">
      <button class="browser-nav-btn" onclick="window._browser_goBack()" title="后退">◀</button>
      <button class="browser-nav-btn" onclick="window._browser_goForward()" title="前进">▶</button>
      <button class="browser-nav-btn" onclick="window._browser_reload()" title="刷新">⟳</button>
      <div class="browser-url-bar">
        <span style="font-size:12px;color:rgba(255,255,255,0.3);flex-shrink:0">🔒</span>
        <input class="browser-url-input" id="browserUrlInput" placeholder="输入网址..." onkeydown="if(event.key==='Enter')window._browser_navigate(this.value)">
        <button class="browser-bookmark-btn" id="browserBookmarkStar" onclick="window._browser_toggleBookmark()" title="添加书签" style="display:none">☆</button>
      </div>
    </div>
    <div class="browser-bookmarks" id="browserBookmarksBar" style="display:flex">
      <span class="browser-bookmarks-toggle" onclick="window._browser_toggleBookmarks()">★</span>
      <span id="browserBookmarks"></span>
    </div>
    <div class="browser-content" id="browserContent"></div>
  </div>`

  createWindow('browser', 'GlassOS 浏览器', 900, 650, content)

  // 暴露全局方法
  window._browser_switchTab = (i) => switchTab(i)
  window._browser_closeTab = (i) => closeTab(i)
  window._browser_newTab = () => createTab(null)
  window._browser_navigate = (url) => navigateTo(url)
  window._browser_goBack = () => {
    const wv = document.querySelector('#browserContent webview')
    if (wv && wv.canGoBack()) wv.goBack()
  }
  window._browser_goForward = () => {
    const wv = document.querySelector('#browserContent webview')
    if (wv && wv.canGoForward()) wv.goForward()
  }
  window._browser_reload = () => {
    const wv = document.querySelector('#browserContent webview')
    if (wv) wv.reload()
  }
  window._browser_toggleBookmark = () => {
    const tab = tabState.tabs[tabState.activeIdx]
    if (tab && tab.url && !tab.isHome) toggleBookmark(tab.title, tab.url)
  }
  window._browser_toggleBookmarks = () => {
    bookmarksVisible = !bookmarksVisible
    document.getElementById('browserBookmarksBar').style.display = bookmarksVisible ? 'flex' : 'none'
  }
  window._browser_removeBookmark = (url) => removeBookmark(url)

  // 初始化
  createTab('https://www.baidu.com')
  renderBookmarks()
  setTimeout(() => {
    const urlInput = document.getElementById('browserUrlInput')
    if (urlInput) urlInput.focus()
  }, 100)
}

// ========== 系统监视器 ==========
// ========== 开发者工具 ==========
function openDevToolsApp() {
  const logStore = []
  const origLog = console.log
  const origWarn = console.warn
  const origError = console.error
  const origInfo = console.info

  const captureConsole = (level, args) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
    const ts = new Date()
    const pad = n => String(n).padStart(2, '0')
    logStore.push({ level, msg, time: `${pad(ts.getHours())}:${pad(ts.getMinutes())}:${pad(ts.getSeconds())}` })
    if (logStore.length > 200) logStore.shift()
    const list = document.getElementById('devConsoleList')
    if (list) renderConsoleLog()
  }

  console.log = (...args) => { origLog(...args); captureConsole('log', args) }
  console.warn = (...args) => { origWarn(...args); captureConsole('warn', args) }
  console.error = (...args) => { origError(...args); captureConsole('error', args) }
  console.info = (...args) => { origInfo(...args); captureConsole('info', args) }

  const levelColors = { log: 'rgba(255,255,255,0.7)', warn: '#e3b341', error: '#ff7b72', info: '#58a6ff' }

  function renderConsoleLog() {
    const list = document.getElementById('devConsoleList')
    if (!list) return
    const filter = document.getElementById('devConsoleFilter')?.value || ''
    const filtered = filter ? logStore.filter(l => l.msg.toLowerCase().includes(filter.toLowerCase())) : logStore
    list.innerHTML = filtered.map(l =>
      `<div class="dev-log-item" style="color:${levelColors[l.level] || 'rgba(255,255,255,0.7)'}">
        <span class="dev-log-time">${l.time}</span>
        <span class="dev-log-level">[${l.level.toUpperCase()}]</span>
        <span class="dev-log-msg">${escapeHtml(l.msg)}</span>
      </div>`
    ).join('')
    list.scrollTop = list.scrollHeight
  }

  function renderStorage(type) {
    const list = document.getElementById('devStorageList')
    if (!list) return
    const store = type === 'local' ? localStorage : sessionStorage
    const items = []
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i)
      const val = store.getItem(key)
      items.push({ key, val: val.length > 200 ? val.slice(0, 200) + '...' : val, size: val.length })
    }
    if (!items.length) {
      list.innerHTML = '<div class="dev-empty">存储为空</div>'
      return
    }
    list.innerHTML = items.map(it => `
      <div class="dev-storage-item">
        <div class="dev-storage-key">${escapeHtml(it.key)}</div>
        <div class="dev-storage-val">${escapeHtml(it.val)}</div>
        <div class="dev-storage-size">${it.size} B</div>
      </div>
    `).join('')
  }

  function renderEnv(info) {
    const el = document.getElementById('devEnvList')
    if (!el || !info) return
    const rows = [
      ['主机名', info.hostname],
      ['平台', info.platform],
      ['架构', info.arch],
      ['CPU 核心', info.cpus?.length || '--'],
      ['总内存', info.totalMem ? (info.totalMem / 1024 / 1024 / 1024).toFixed(1) + ' GB' : '--'],
      ['可用内存', info.freeMem ? (info.freeMem / 1024 / 1024 / 1024).toFixed(1) + ' GB' : '--'],
      ['运行时间', info.uptime ? Math.floor(info.uptime / 3600) + 'h ' + Math.floor((info.uptime % 3600) / 60) + 'm' : '--'],
      ['用户名', info.userInfo?.username || '--'],
      ['进程数', info.processCount || '--'],
      ['磁盘', info.disks?.map(d => `${d.mount} (${((d.size - d.free) / 1024 / 1024 / 1024).toFixed(1)}G/${(d.size / 1024 / 1024 / 1024).toFixed(1)}G)`).join(', ') || '--'],
      ['网络接口', info.netNames?.join(', ') || '--'],
      ['Electron', 'v42.5.0'],
      ['Chromium', navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1] || '--'],
      ['User Agent', navigator.userAgent.slice(0, 80) + '...'],
    ]
    el.innerHTML = rows.map(([k, v]) => `<div class="dev-env-row"><span class="dev-env-key">${k}</span><span class="dev-env-val">${escapeHtml(String(v))}</span></div>`).join('')
  }

  const tabs = {
    '📋 环境': `<div class="dev-section">
      <div class="dev-section-title">系统环境</div>
      <div id="devEnvList" class="dev-env-list">加载中...</div>
    </div>`,
    '🖥 控制台': `<div class="dev-section">
      <div class="dev-console-toolbar">
        <input class="dev-console-filter" id="devConsoleFilter" placeholder="过滤日志..." oninput="this._render && this._render()" />
        <button class="dev-btn" onclick="document.getElementById('devConsoleList').innerHTML=''">清空</button>
      </div>
      <div class="dev-console-list" id="devConsoleList"></div>
    </div>`,
    '💾 存储': `<div class="dev-section">
      <div class="dev-storage-tabs">
        <button class="dev-btn active" onclick="window._dev_setStorage('local',this)">localStorage</button>
        <button class="dev-btn" onclick="window._dev_setStorage('session',this)">sessionStorage</button>
      </div>
      <div class="dev-storage-actions">
        <button class="dev-btn danger" onclick="if(confirm('清空 localStorage？')){localStorage.clear();window._dev_setStorage('local')}">清空 Local</button>
        <button class="dev-btn danger" onclick="if(confirm('清空 sessionStorage？')){sessionStorage.clear();window._dev_setStorage('session')}">清空 Session</button>
      </div>
      <div class="dev-storage-list" id="devStorageList"></div>
    </div>`,
    '🌐 网络': `<div class="dev-section">
      <div class="dev-section-title">网络信息</div>
      <div id="devNetInfo" class="dev-env-list">加载中...</div>
      <div class="dev-section-title" style="margin-top:12px">HTTP 请求测试</div>
      <div class="dev-http-row">
        <input class="dev-http-input" id="devHttpUrl" placeholder="https://api.github.com" value="https://api.github.com" />
        <button class="dev-btn" onclick="window._dev_httpTest()">发送</button>
      </div>
      <div class="dev-http-result" id="devHttpResult"></div>
    </div>`,
    '⚡ 性能': `<div class="dev-section">
      <div class="dev-section-title">实时性能</div>
      <div class="dev-perf-cards">
        <div class="dev-perf-card"><div class="dev-perf-label">CPU</div><div class="dev-perf-val" id="devPerfCpu">--</div></div>
        <div class="dev-perf-card"><div class="dev-perf-label">内存</div><div class="dev-perf-val" id="devPerfMem">--</div></div>
        <div class="dev-perf-card"><div class="dev-perf-label">FPS</div><div class="dev-perf-val" id="devPerfFps">--</div></div>
      </div>
      <div class="dev-section-title" style="margin-top:12px">内存详情</div>
      <div id="devPerfMemDetail" class="dev-env-list"></div>
    </div>`,
    '⚙ 进程': `<div class="dev-section">
      <div class="dev-section-title">运行进程</div>
      <button class="dev-btn" onclick="window._dev_refreshProcs()" style="margin-bottom:8px">刷新</button>
      <div class="dev-proc-list" id="devProcList">加载中...</div>
    </div>`,
    '🔌 IPC': `<div class="dev-section">
      <div class="dev-section-title">IPC 接口列表</div>
      <div class="dev-ipc-list" id="devIpcList"></div>
    </div>`,
  }

  const tabKeys = Object.keys(tabs)
  const content = `<div class="app-devtools">
    <div class="dev-sidebar">
      ${tabKeys.map((t, i) => `<div class="dev-tab${i === 0 ? ' active' : ''}" onclick="window._dev_switchTab('${t}',this)">${t}</div>`).join('')}
    </div>
    <div class="dev-content" id="devContent">${tabs[tabKeys[0]]}</div>
  </div>`

  createWindow('devtools', '开发者工具', 650, 500, content)

  let perfTimer = null
  let perfTimer2 = null
  let currentStorageType = 'local'
  let frameCount = 0
  let lastFpsTime = performance.now()

  window._dev_switchTab = (tab, el) => {
    document.querySelectorAll('.dev-tab').forEach(t => t.classList.remove('active'))
    if (el) el.classList.add('active')
    document.getElementById('devContent').innerHTML = tabs[tab]
    if (tab === '📋 环境') initEnv()
    if (tab === '🖥 控制台') renderConsoleLog()
    if (tab === '💾 存储') renderStorage(currentStorageType)
    if (tab === '🌐 网络') initNetwork()
    if (tab === '⚡ 性能') initPerf()
    if (tab === '⚙ 进程') window._dev_refreshProcs()
    if (tab === '🔌 IPC') renderIpcList()
  }

  window._dev_setStorage = (type, btn) => {
    currentStorageType = type
    document.querySelectorAll('.dev-storage-tabs .dev-btn').forEach(b => b.classList.remove('active'))
    if (btn) btn.classList.add('active')
    renderStorage(type)
  }

  window._dev_httpTest = async () => {
    const url = document.getElementById('devHttpUrl')?.value
    const result = document.getElementById('devHttpResult')
    if (!url || !result) return
    result.innerHTML = '<div class="dev-loading">请求中...</div>'
    const start = Date.now()
    try {
      const resp = await window.os.execCommand(`curl -s -o /dev/null -w "%{http_code} %{time_total}s %{size_download}B" "${url}"`)
      const elapsed = Date.now() - start
      result.innerHTML = `<div class="dev-http-response">
        <div class="dev-env-row"><span class="dev-env-key">URL</span><span class="dev-env-val">${escapeHtml(url)}</span></div>
        <div class="dev-env-row"><span class="dev-env-key">耗时</span><span class="dev-env-val">${elapsed}ms</span></div>
        <div class="dev-env-row"><span class="dev-env-key">状态</span><span class="dev-env-val">${escapeHtml(resp.stdout || '无响应')}</span></div>
      </div>`
    } catch(e) {
      result.innerHTML = `<div style="color:#ff7b72;padding:8px">请求失败: ${escapeHtml(e.message)}</div>`
    }
  }

  window._dev_refreshProcs = async () => {
    const el = document.getElementById('devProcList')
    if (!el) return
    el.innerHTML = '<div class="dev-loading">加载中...</div>'
    try {
      const info = await window.os.getSystemInfo()
      el.innerHTML = `<div class="dev-env-list">
        <div class="dev-env-row"><span class="dev-env-key">总进程数</span><span class="dev-env-val">${info.processCount || '--'}</span></div>
        <div class="dev-env-row"><span class="dev-env-key">CPU 核心</span><span class="dev-env-val">${info.cpus?.length || '--'}</span></div>
        <div class="dev-env-row"><span class="dev-env-key">平台</span><span class="dev-env-val">${info.platform}</span></div>
        <div class="dev-env-row"><span class="dev-env-key">架构</span><span class="dev-env-val">${info.arch}</span></div>
      </div>`
    } catch(e) { el.innerHTML = '<div style="color:#ff7b72">获取失败</div>' }
  }

  function renderIpcList() {
    const el = document.getElementById('devIpcList')
    if (!el) return
    const apis = [
      ['get-system-info', 'GET', '获取系统信息'],
      ['read-dir', 'GET', '读取目录'],
      ['read-file', 'GET', '读取文件'],
      ['write-file', 'PUT', '写入文件'],
      ['get-homedir', 'GET', '获取用户目录'],
      ['exec-command', 'POST', '执行系统命令'],
      ['check-wsl', 'GET', '检测 WSL'],
      ['ssh-connect', 'POST', 'SSH 连接'],
      ['sftp-list', 'GET', 'SFTP 列出目录'],
      ['sftp-upload', 'POST', 'SFTP 上传'],
      ['sftp-download', 'GET', 'SFTP 下载'],
      ['get-weather', 'GET', '获取天气'],
      ['clipboard-read', 'GET', '读取剪贴板'],
      ['clipboard-write', 'PUT', '写入剪贴板'],
      ['capture-screen', 'GET', '截取屏幕'],
      ['save-screenshot', 'POST', '保存截图'],
      ['get-lock-password', 'GET', '获取锁屏密码'],
      ['set-lock-password', 'PUT', '设置锁屏密码'],
      ['import-files', 'POST', '导入文件'],
      ['launch-exe', 'POST', '启动程序'],
    ]
    el.innerHTML = apis.map(([name, method, desc]) => {
      const colors = { GET: '#3fb950', PUT: '#58a6ff', POST: '#e3b341' }
      return `<div class="dev-ipc-item">
        <span class="dev-ipc-method" style="color:${colors[method] || '#fff'}">${method}</span>
        <span class="dev-ipc-name">${name}</span>
        <span class="dev-ipc-desc">${desc}</span>
      </div>`
    }).join('')
  }

  function initEnv() {
    window.os.getSystemInfo().then(renderEnv)
  }

  function initNetwork() {
    window.os.getSystemInfo().then(info => {
      const el = document.getElementById('devNetInfo')
      if (!el || !info) return
      el.innerHTML = [
        ['网络接口', info.netNames?.join(', ') || '无'],
        ['主机名', info.hostname],
      ].map(([k, v]) => `<div class="dev-env-row"><span class="dev-env-key">${k}</span><span class="dev-env-val">${escapeHtml(String(v))}</span></div>`).join('')
    })
  }

  function initPerf() {
    if (perfTimer) clearInterval(perfTimer)
    if (perfTimer2) cancelAnimationFrame(perfTimer2)

    const fpsCallback = () => {
      frameCount++
      const now = performance.now()
      if (now - lastFpsTime >= 1000) {
        const fpsEl = document.getElementById('devPerfFps')
        if (fpsEl) fpsEl.textContent = frameCount
        frameCount = 0
        lastFpsTime = now
      }
      perfTimer2 = requestAnimationFrame(fpsCallback)
    }
    perfTimer2 = requestAnimationFrame(fpsCallback)

    perfTimer = setInterval(async () => {
      try {
        const info = await window.os.getSystemInfo()
        if (!info) return
        const cpuPct = info.cpuUsage?.total ? ((info.cpuUsage.total - info.cpuUsage.idle) / info.cpuUsage.total * 100).toFixed(1) : '--'
        const memPct = info.totalMem ? ((info.totalMem - info.freeMem) / info.totalMem * 100).toFixed(1) : '--'
        const cpuEl = document.getElementById('devPerfCpu')
        const memEl = document.getElementById('devPerfMem')
        if (cpuEl) cpuEl.textContent = cpuPct + '%'
        if (memEl) memEl.textContent = memPct + '%'
        const detail = document.getElementById('devPerfMemDetail')
        if (detail) detail.innerHTML = [
          ['总内存', (info.totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB'],
          ['已用', ((info.totalMem - info.freeMem) / 1024 / 1024 / 1024).toFixed(2) + ' GB'],
          ['可用', (info.freeMem / 1024 / 1024 / 1024).toFixed(2) + ' GB'],
          ['使用率', memPct + '%'],
        ].map(([k, v]) => `<div class="dev-env-row"><span class="dev-env-key">${k}</span><span class="dev-env-val">${v}</span></div>`).join('')
      } catch(e) {}
    }, 1000)
  }

  // Cleanup on close
  const origClose = window.closeWindow || closeWindow
  window.closeWindow = function(id) {
    if (id === 'devtools') {
      if (perfTimer) { clearInterval(perfTimer); perfTimer = null }
      if (perfTimer2) { cancelAnimationFrame(perfTimer2); perfTimer2 = null }
      console.log = origLog
      console.warn = origWarn
      console.error = origError
      console.info = origInfo
    }
    origClose(id)
  }

  // Init first tab
  setTimeout(() => initEnv(), 100)
}

function openMonitor() {
  let monitorTimer = null
  let cpuHistory = []

  const content = `<div class="app-monitor">
    <div class="monitor-card">
      <div class="monitor-card-header">🔲 CPU</div>
      <div class="monitor-bar-wrap"><div class="monitor-bar-fill low" id="monCpuBar" style="width:0%"></div></div>
      <div class="monitor-stat-row"><span>使用率</span><span id="monCpuPct">--</span></div>
      <div class="monitor-stat-row"><span>核心数</span><span id="monCpuCores">--</span></div>
      <div class="monitor-stat-row"><span>进程数</span><span id="monCpuProc">--</span></div>
      <canvas class="monitor-cpu-curve" id="monCpuCurve" width="400" height="40"></canvas>
    </div>
    <div class="monitor-card">
      <div class="monitor-card-header">🧠 内存</div>
      <div class="monitor-bar-wrap"><div class="monitor-bar-fill low" id="monMemBar" style="width:0%"></div></div>
      <div class="monitor-stat-row"><span>使用率</span><span id="monMemPct">--</span></div>
      <div class="monitor-stat-row"><span>已用</span><span id="monMemUsed">--</span></div>
      <div class="monitor-stat-row"><span>总计</span><span id="monMemTotal">--</span></div>
    </div>
    <div class="monitor-card">
      <div class="monitor-card-header">💾 磁盘</div>
      <div class="monitor-disk-row" id="monDisks">--</div>
    </div>
    <div class="monitor-card">
      <div class="monitor-card-header">🌐 网络</div>
      <div class="monitor-net-row"><span>📥 下载</span><span id="monNetDown">--</span></div>
      <div class="monitor-net-row"><span>📤 上传</span><span id="monNetUp">--</span></div>
      <div class="monitor-net-row"><span>接口</span><span id="monNetIf">--</span></div>
    </div>
  </div>`

  createWindow('monitor', '系统监视器', 480, 520, content)

  let prevNetBytes = null, prevTimestamp = null

  async function refresh() {
    try {
      const info = await window.os.getSystemInfo()
      if (!info) return

      // CPU
      const cpuPct = info.cpuUsage && info.cpuUsage.total ? ((info.cpuUsage.total - info.cpuUsage.idle) / info.cpuUsage.total) * 100 : 0
      updateBar('monCpuBar', cpuPct)
      const cpuPctEl = document.getElementById('monCpuPct')
      if (cpuPctEl) cpuPctEl.textContent = cpuPct.toFixed(1) + '%'
      const cpuCoresEl = document.getElementById('monCpuCores')
      if (cpuCoresEl) cpuCoresEl.textContent = info.cpus ? info.cpus.length : '--'
      const cpuProcEl = document.getElementById('monCpuProc')
      if (cpuProcEl) cpuProcEl.textContent = info.processCount || '--'

      cpuHistory.push(cpuPct)
      if (cpuHistory.length > 30) cpuHistory.shift()
      drawCpuCurve(cpuHistory)

      // 内存
      const memPct = info.totalMem ? ((info.totalMem - info.freeMem) / info.totalMem * 100) : 0
      updateBar('monMemBar', memPct)
      const memPctEl = document.getElementById('monMemPct')
      if (memPctEl) memPctEl.textContent = memPct.toFixed(1) + '%'
      const memUsedEl = document.getElementById('monMemUsed')
      if (memUsedEl && info.totalMem) memUsedEl.textContent = formatBytes(info.totalMem - info.freeMem)
      const memTotalEl = document.getElementById('monMemTotal')
      if (memTotalEl) memTotalEl.textContent = info.totalMem ? formatBytes(info.totalMem) : '--'

      // 磁盘
      renderDisks(info.disks)

      // 网络
      renderNetwork(info, prevNetBytes, prevTimestamp)
      prevNetBytes = info; prevTimestamp = info.timestamp
    } catch (e) { /* ignore */ }
  }

  function updateBar(id, pct) {
    const bar = document.getElementById(id)
    if (!bar) return
    bar.style.width = Math.min(pct, 100) + '%'
    bar.className = 'monitor-bar-fill ' + (pct > 85 ? 'high' : pct > 60 ? 'mid' : 'low')
  }

  function renderDisks(disks) {
    const el = document.getElementById('monDisks')
    if (!el) return
    if (!disks || disks.length === 0) { el.innerHTML = '<span style="font-size:12px;color:rgba(255,255,255,0.3)">--</span>'; return }
    el.innerHTML = disks.map(d => {
      const pct = d.size > 0 ? ((d.size - d.free) / d.size * 100) : 0
      const cls = pct > 85 ? 'high' : pct > 60 ? 'mid' : 'low'
      return '<div class="monitor-disk-item"><span class="monitor-disk-label">'+escapeHtml(d.mount)+'</span><div class="monitor-disk-bar"><div class="monitor-disk-fill '+cls+'" style="width:'+Math.min(pct,100)+'%;background:'+(pct>85?'#ff7b72':pct>60?'#d29922':'#3fb950')+'"></div></div><span class="monitor-disk-info">'+formatBytes(d.size-d.free)+' / '+formatBytes(d.size)+'</span></div>'
    }).join('')
  }

  function renderNetwork(info, prev, prevTs) {
    const ifEl = document.getElementById('monNetIf')
    if (ifEl) ifEl.textContent = (info.netNames || []).join(', ') || '--'
    if (!prev || !prevTs) {
      const dEl = document.getElementById('monNetDown'), uEl = document.getElementById('monNetUp')
      if (dEl) dEl.textContent = '--'
      if (uEl) uEl.textContent = '--'
      return
    }
    const elapsed = (info.timestamp - prevTs) / 1000
    // 简易速率模拟（基于两次采样差异）
    const rxDiff = Math.abs((info.totalMem || 0) - (prev.totalMem || 0)) * 0.01
    const txDiff = Math.abs((info.totalMem || 0) - (prev.totalMem || 0)) * 0.003
    const dEl = document.getElementById('monNetDown'), uEl = document.getElementById('monNetUp')
    if (dEl) dEl.textContent = formatBytes(rxDiff) + '/s'
    if (uEl) uEl.textContent = formatBytes(txDiff) + '/s'
  }

  function drawCpuCurve(history) {
    const canvas = document.getElementById('monCpuCurve')
    if (!canvas) return
    const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) { const y = (h/4)*i; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke() }

    if (history.length < 2) return
    const stepX = w / (history.length - 1)
    ctx.beginPath(); ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'
    history.forEach((val, i) => { const x = i*stepX, y = h-(val/100)*h; i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y) })
    ctx.stroke()

    const grad = ctx.createLinearGradient(0,0,0,h)
    grad.addColorStop(0, 'rgba(88,166,255,0.15)'); grad.addColorStop(1, 'rgba(88,166,255,0)')
    ctx.lineTo((history.length-1)*stepX, h); ctx.lineTo(0, h); ctx.closePath()
    ctx.fillStyle = grad; ctx.fill()
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024, sizes = ['B','KB','MB','GB','TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  refresh()
  monitorTimer = setInterval(refresh, 1500)

  // 清理
  const winEl = document.getElementById('win-monitor')
  if (winEl) {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) for (const node of m.removedNodes) {
        if (node === winEl) { clearInterval(monitorTimer); observer.disconnect(); return }
      }
    })
    observer.observe(winEl.parentNode, { childList: true })
  }
}

// ========== 日历应用 ==========
function openCalendar() {
  let events = JSON.parse(localStorage.getItem('glassos_cal_events') || '{}')
  let today = new Date()
  let viewYear = today.getFullYear()
  let viewMonth = today.getMonth()
  let selectedDay = null

  function saveEvents() {
    localStorage.setItem('glassos_cal_events', JSON.stringify(events))
  }

  function keyOf(year, month, day) { return year + '-' + (month+1) + '-' + day }

  function getEvents(year, month, day) {
    return events[keyOf(year, month, day)] || []
  }

  function addEvent(year, month, day, text) {
    const k = keyOf(year, month, day)
    if (!events[k]) events[k] = []
    events[k].push(text)
    saveEvents()
    render()
  }

  function removeEvent(year, month, day, idx) {
    const k = keyOf(year, month, day)
    if (events[k]) { events[k].splice(idx, 1); if (!events[k].length) delete events[k]; saveEvents(); render() }
  }

  function render() {
    const container = document.getElementById('calGrid')
    if (!container) return

    // 标题
    document.getElementById('calTitle').textContent = viewYear + '年' + (viewMonth + 1) + '月'

    // 当月第一天和总天数
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const totalDays = lastDay.getDate()
    const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // 周一=0

    let html = ''
    // 上月填充
    const prevLast = new Date(viewYear, viewMonth, 0).getDate()
    for (let i = startDow - 1; i >= 0; i--) {
      html += `<div class="cal-day other-month">${prevLast - i}</div>`
    }
    // 当月天数
    for (let d = 1; d <= totalDays; d++) {
      const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
      const isSel = selectedDay === d
      const dayEvents = getEvents(viewYear, viewMonth, d)
      const dot = dayEvents.length ? '<span class="event-dot"></span>' : ''
      html += `<div class="cal-day${isToday ? ' today' : ''}${isSel ? ' selected' : ''}" onclick="window._cal_select(${d})">${d}${dot}</div>`
    }
    // 下月填充
    const remaining = 42 - (startDow + totalDays)
    for (let d = 1; d <= remaining; d++) {
      html += `<div class="cal-day other-month">${d}</div>`
    }
    container.innerHTML = html

    // 底部信息
    if (selectedDay) {
      const selEvents = getEvents(viewYear, viewMonth, selectedDay)
      document.getElementById('calDateInfo').textContent = viewYear + '年' + (viewMonth+1) + '月' + selectedDay + '日'
      document.getElementById('calEventsList').innerHTML = selEvents.map((t,i) =>
        `<div class="cal-event-item"><span>${escapeHtml(t)}</span><span class="cal-event-del" onclick="window._cal_delEvent(${i})">✕</span></div>`
      ).join('') || '<div style="font-size:11px;color:rgba(255,255,255,0.25)">无事件</div>'
      document.getElementById('calBottom').style.display = ''
    } else {
      document.getElementById('calBottom').style.display = 'none'
    }
  }

  const content = `<div class="app-calendar">
    <div class="cal-header">
      <button class="cal-nav-btn" onclick="window._cal_prevMonth()">◀</button>
      <span class="cal-title" id="calTitle"></span>
      <button class="cal-nav-btn" onclick="window._cal_nextMonth()">▶</button>
    </div>
    <div class="cal-weekdays">
      <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
    </div>
    <div class="cal-grid" id="calGrid"></div>
    <div class="cal-bottom" id="calBottom" style="display:none">
      <span id="calDateInfo"></span>
      <div class="cal-event-list" id="calEventsList"></div>
      <input class="cal-event-input" id="calEventInput" placeholder="+ 添加事件..." onkeydown="if(event.key==='Enter')window._cal_addEvent(this.value)">
    </div>
  </div>`

  createWindow('calendar', '日历', 360, 440, content)

  window._cal_select = (d) => {
    if (selectedDay === d) { selectedDay = null } else { selectedDay = d }
    render()
    setTimeout(() => { const inp = document.getElementById('calEventInput'); if (inp) inp.focus() }, 50)
  }
  window._cal_addEvent = (text) => {
    if (!text || !text.trim() || !selectedDay) return
    addEvent(viewYear, viewMonth, selectedDay, text.trim())
    document.getElementById('calEventInput').value = ''
  }
  window._cal_delEvent = (idx) => {
    if (!selectedDay) return
    removeEvent(viewYear, viewMonth, selectedDay, idx)
  }
  window._cal_prevMonth = () => {
    viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear-- }
    selectedDay = null; render()
  }
  window._cal_nextMonth = () => {
    viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++ }
    selectedDay = null; render()
  }

  render()
}

// ========== 应用安装管理 ==========
const ALL_APPS = [
  { id: 'finder', icon: '📁', name: '访达', desc: '文件浏览器，浏览本地文件系统', category: '系统', core: true },
  { id: 'settings', icon: '⚙️', name: '设置', desc: '15 款玻璃主题与特效定制', category: '系统', core: true },
  { id: 'terminal', icon: '💻', name: '终端', desc: '命令行工具，执行系统命令', category: '系统' },
  { id: 'browser', icon: '🌐', name: '浏览器', desc: 'Chromium 内核网页浏览器', category: '网络' },
  { id: 'ssh', icon: '🔐', name: 'SSH', desc: '远程服务器连接管理', category: '网络' },
  { id: 'linux', icon: '🐧', name: 'Linux', desc: 'Linux 模拟终端环境', category: '开发' },
  { id: 'monitor', icon: '📊', name: '监视器', desc: '实时 CPU/内存/磁盘/网络', category: '系统' },
  { id: 'weather', icon: '🌤️', name: '天气', desc: '实时天气与预报信息', category: '生活' },
  { id: 'notes', icon: '📝', name: '备忘录', desc: '多笔记管理，自动保存', category: '效率' },
  { id: 'calendar', icon: '📅', name: '日历', desc: '月视图日历，事件管理', category: '效率' },
  { id: 'calc', icon: '🧮', name: '计算器', desc: '四则运算计算器', category: '工具' },
  { id: 'player', icon: '🎵', name: '音乐', desc: '内置播放器，支持播放列表', category: '娱乐' },
  { id: 'trash', icon: '🗑️', name: '回收站', desc: '文件删除与恢复管理', category: '系统' },
  { id: 'store', icon: '🛍️', name: '应用市场', desc: '应用安装与卸载管理', category: '系统', core: true },
  { id: 'paint', icon: '🎨', name: '画板', desc: '自由绘画，可调颜色与笔触', category: '工具' },
  { id: 'mineradio', icon: '📻', name: 'Mineradio', desc: '外部音乐播放器', category: '娱乐' },
  { id: 'devtools', icon: '🔧', name: '开发者工具', desc: '系统调试与开发工具集', category: '开发' },
  { id: 'clipboard', icon: '📋', name: '剪贴板', desc: '复制历史记录管理', category: '工具' },
  { id: 'editor', icon: '📝', name: '文本编辑器', desc: '轻量代码与文本编辑', category: '开发' },
  { id: 'disk', icon: '💾', name: '磁盘分析', desc: '磁盘空间可视化分析', category: '系统' },
  { id: 'pomodoro', icon: '🍅', name: '番茄钟', desc: '专注计时与休息提醒', category: '效率' },
  { id: 'converter', icon: '🔄', name: '单位换算', desc: '长度/重量/温度等单位互转', category: '工具' },
  { id: 'process', icon: '⚙', name: '进程管理', desc: '系统进程与资源监控', category: '系统' },
]

function getInstalledApps() {
  const saved = localStorage.getItem('glassos_installed')
  if (saved) {
    const list = JSON.parse(saved)
    if (!list.includes('ssh')) { list.push('ssh'); localStorage.setItem('glassos_installed', JSON.stringify(list)) }
    if (!list.includes('mineradio')) { list.push('mineradio'); localStorage.setItem('glassos_installed', JSON.stringify(list)) }
    return list
  }
  const def = ALL_APPS.filter(a => a.core || !['linux','trash'].includes(a.id)).map(a => a.id)
  const extras = ['devtools','clipboard','editor','disk','pomodoro','converter','process']
  extras.forEach(id => { if (!def.includes(id)) def.push(id) })
  localStorage.setItem('glassos_installed', JSON.stringify(def))
  return def
}

function isAppInstalled(id) {
  return getInstalledApps().includes(id)
}

function installApp(id) {
  const apps = getInstalledApps()
  if (!apps.includes(id)) { apps.push(id); localStorage.setItem('glassos_installed', JSON.stringify(apps)) }
  refreshIcons()
}

function uninstallApp(id) {
  const app = ALL_APPS.find(a => a.id === id)
  if (app && app.core) return // 核心应用不能卸载
  let apps = getInstalledApps()
  apps = apps.filter(a => a !== id)
  localStorage.setItem('glassos_installed', JSON.stringify(apps))
  // 关闭该应用的窗口
  if (windows[id]) closeWindow(id)
  refreshIcons()
}

function refreshIcons() {
  const installed = getInstalledApps()
  // 桌面图标
  document.querySelectorAll('.desktop-icon[data-app]').forEach(icon => {
    const appId = icon.dataset.app
    if (!appId || appId === 'trash') return
    icon.style.display = installed.includes(appId) ? '' : 'none'
  })
  // Dock 图标 (排除 launchpad-trigger)
  document.querySelectorAll('.dock-item[data-app]').forEach(item => {
    const appId = item.dataset.app
    if (!appId) return
    item.style.display = installed.includes(appId) ? '' : 'none'
  })
  // 回收站特殊处理
  const trashIcon = document.querySelector('.desktop-icon[data-app="trash"]')
  if (trashIcon) trashIcon.style.display = installed.includes('trash') ? '' : 'none'
}

// 启动时刷新图标
setTimeout(refreshIcons, 200)

// ========== 画板应用 ==========
function openPaint() {
  let brushColor = '#ffffff', brushSize = 3, isEraser = false

  const content = `<div class="app-paint">
    <div class="paint-toolbar">
      <input type="color" class="paint-color" value="${brushColor}" onchange="window._paint_setColor(this.value)">
      <input type="range" class="paint-size" min="1" max="20" value="${brushSize}" oninput="window._paint_setSize(this.value)">
      <button class="paint-btn" id="paintEraser" onclick="window._paint_toggleEraser()">🧹 橡皮</button>
      <button class="paint-btn" onclick="window._paint_clear()">🗑 清除</button>
      <span style="font-size:10px;color:rgba(255,255,255,0.3);margin-left:auto">✏️ 画板</span>
    </div>
    <canvas class="paint-canvas" id="paintCanvas"></canvas>
  </div>`

  createWindow('paint', '画板', 600, 460, content)

  setTimeout(() => {
    const canvas = document.getElementById('paintCanvas')
    const ctx = canvas.getContext('2d')
    const rect = canvas.parentElement.getBoundingClientRect()
    canvas.width = rect.width; canvas.height = rect.height - 40
    ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    let drawing = false

    canvas.addEventListener('mousedown', (e) => { drawing = true; draw(e) })
    canvas.addEventListener('mousemove', (e) => { if (drawing) draw(e) })
    canvas.addEventListener('mouseup', () => drawing = false)
    canvas.addEventListener('mouseleave', () => drawing = false)

    function draw(e) {
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      ctx.beginPath(); ctx.arc(x, y, brushSize/2, 0, Math.PI*2)
      ctx.fillStyle = isEraser ? '#0d1117' : brushColor
      ctx.fill()
    }

    window._paint_setColor = (c) => { brushColor = c }
    window._paint_setSize = (s) => { brushSize = parseInt(s) }
    window._paint_toggleEraser = () => {
      isEraser = !isEraser
      document.getElementById('paintEraser').textContent = isEraser ? '🖌️ 画笔' : '🧹 橡皮'
    }
    window._paint_clear = () => { ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, canvas.width, canvas.height) }
  }, 200)
}

// ========== 应用市场 ==========
function openAppStore() {
  const apps = ALL_APPS.filter(a => a.id !== 'store')
  const installed = getInstalledApps()

  const categories = [...new Set(apps.map(a => a.category))]

  function renderStore() {
    const container = document.getElementById('storeContent')
    if (!container) return
    const installed = getInstalledApps()
    container.innerHTML = categories.map(cat => `
      <div class="store-category">${cat} (${apps.filter(a => a.category === cat && installed.includes(a.id)).length}/${apps.filter(a => a.category === cat).length})</div>
      <div class="store-grid">
        ${apps.filter(a => a.category === cat).map(a => {
          const isInst = installed.includes(a.id)
          const isCore = a.core
          return `
          <div class="store-card${isInst ? ' installed' : ''}">
            <div class="store-card-icon">${a.icon}</div>
            <div class="store-card-body">
              <div class="store-card-name">${a.name}${isCore ? ' <span style="font-size:9px;color:rgba(255,255,255,0.2)">核心</span>' : ''}</div>
              <div class="store-card-desc">${a.desc}</div>
            </div>
            ${isInst
              ? `<button class="store-card-btn" onclick="event.stopPropagation();openApp('${a.id}')">打开</button>
                 ${!isCore ? `<button class="store-card-btn store-uninstall" onclick="event.stopPropagation();uninstallApp('${a.id}');window._store_refresh()">卸载</button>` : ''}`
              : `<button class="store-card-btn store-install" onclick="event.stopPropagation();installApp('${a.id}');window._store_refresh()">安装</button>`
            }
          </div>`
        }).join('')}
      </div>
    `).join('')
  }

  const content = `<div class="app-store">
    <div class="store-header">
      <span style="font-size:22px;font-weight:200">🛍️ 应用市场</span>
      <span style="font-size:12px;color:rgba(255,255,255,0.3)">${apps.length} 款应用 · ${installed.length} 已安装</span>
    </div>
    <div id="storeContent"></div>
  </div>`

  createWindow('store', '应用市场', 560, 520, content)
  window._store_refresh = renderStore
  renderStore()
}

// ========== 音乐播放器 ==========
function openPlayer() {
  if (!window.glassPlayer) {
    loadScript('player.js').then(() => openPlayer()).catch(() => {
      createWindow('player', '音乐', 360, 200, '<div style="padding:20px;text-align:center;color:#ff7b72">音乐播放器加载失败</div>')
    })
    return
  }
  const player = window.glassPlayer
  const track = player.getCurrentTrack()
  const trackName = track ? track.name : '未选择'
  const artist = track ? track.artist : ''
  const isPlaying = player.playing

  const content = `<div class="app-player">
    <div class="player-vinyl">
      <div class="player-disc ${isPlaying ? 'spinning' : ''}" id="playerDisc">
        <div class="player-disc-inner"></div>
      </div>
    </div>
    <div class="player-info">
      <div class="player-track" id="playerTrackName">${trackName}</div>
      <div class="player-artist">${artist}</div>
    </div>
    <div class="player-controls">
      <button class="player-btn" onclick="playerPrev()">⏮</button>
      <button class="player-btn player-btn-play" id="playerPlayBtn" onclick="playerTogglePlay()">${isPlaying ? '⏸' : '▶'}</button>
      <button class="player-btn" onclick="playerNext()">⏭</button>
    </div>
    <div class="player-volume">
      <span>🔈</span>
      <input type="range" class="player-volume-slider" id="playerVolume" min="0" max="100" value="${player.volume * 100}" oninput="playerSetVolume(this.value)">
    </div>
  </div>`
  createWindow('player', '音乐', 360, 480, content)

  window.playerTogglePlay = () => {
    const p = window.glassPlayer
    if (p.playing) p.pause(); else p.play()
    updatePlayerUI()
  }
  window.playerNext = () => { window.glassPlayer.next(); updatePlayerUI() }
  window.playerPrev = () => { window.glassPlayer.prev(); updatePlayerUI() }
  window.playerSetVolume = (v) => { window.glassPlayer.setVolume(v / 100) }
}

function updatePlayerUI() {
  const p = window.glassPlayer
  const track = p.getCurrentTrack()
  const nameEl = document.getElementById('playerTrackName')
  const btnEl = document.getElementById('playerPlayBtn')
  const discEl = document.getElementById('playerDisc')
  if (nameEl) nameEl.textContent = track ? track.name : ''
  if (btnEl) btnEl.textContent = p.playing ? '⏸' : '▶'
  if (discEl) {
    if (p.playing) discEl.classList.add('spinning')
    else discEl.classList.remove('spinning')
  }
  // 声感玻璃 — 音乐播放时 Dock 和光球脉动
  const dock = document.getElementById('dock')
  const orbs = document.querySelectorAll('.orb')
  if (p.playing) {
    dock?.classList.add('beating')
    orbs.forEach(o => o.classList.add('beating'))
  } else {
    dock?.classList.remove('beating')
    orbs.forEach(o => o.classList.remove('beating'))
  }
}

// ========== 桌面图标事件绑定 ==========
function bindDesktopIconEvents(icon) {
  icon.addEventListener('click', (e) => {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'))
    icon.classList.add('selected')
    e.stopPropagation()
  })

  icon.addEventListener('contextmenu', (e) => {
    e.preventDefault(); e.stopPropagation()
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'))
    icon.classList.add('selected')
    const old = document.getElementById('desktopMenu')
    if (old) old.remove()
    const appName = icon.dataset.app
    const menu = document.createElement('div')
    menu.id = 'desktopMenu'
    menu.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;z-index:9999;background:var(--menu-bg);backdrop-filter:blur(20px);border:1px solid var(--menu-border);border-radius:12px;padding:6px 0;min-width:160px;box-shadow:0 10px 40px rgba(0,0,0,0.5);font-family:inherit;font-size:13px;color:var(--text-primary);`
    const items = [
      { label: '打开', icon: '📂', action: () => openApp(appName) },
      null,
      { label: '重命名', icon: '✏️', action: () => {
        const labelEl = icon.querySelector('.desktop-icon-label')
        if (!labelEl) return
        const oldName = labelEl.textContent
        const input = document.createElement('input')
        input.value = oldName
        input.style.cssText = 'background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.2);color:white;font-size:11px;text-align:center;width:80px;border-radius:4px;padding:2px 4px;outline:none;'
        input.addEventListener('blur', () => { labelEl.textContent = input.value || oldName; input.replaceWith(labelEl) })
        input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') input.blur(); if (ev.key === 'Escape') { labelEl.textContent = oldName; input.replaceWith(labelEl) } })
        labelEl.replaceWith(input); input.focus(); input.select()
      }},
      { label: '复制', icon: '📋', action: () => {
        const desktopIcons = document.getElementById('desktopIcons')
        const clone = icon.cloneNode(true)
        clone.dataset.app = icon.dataset.app
        clone.ondblclick = () => openApp(icon.dataset.app)
        bindDesktopIconEvents(clone)
        desktopIcons.appendChild(clone)
      }},
      null,
      { label: '移入回收站', icon: '🗑', action: () => moveToTrash(appName) },
    ]
    items.forEach(item => {
      if (item === null) { const sep = document.createElement('div'); sep.style.cssText = 'height:1px;background:var(--divider);margin:4px 10px;'; menu.appendChild(sep); return }
      const row = document.createElement('div')
      row.style.cssText = `padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;border-radius:6px;margin:0 4px;`
      row.innerHTML = `<span style="font-size:15px;width:20px;text-align:center">${item.icon}</span><span>${item.label}</span>`
      row.addEventListener('mouseenter', () => row.style.background = 'rgba(255,255,255,0.08)')
      row.addEventListener('mouseleave', () => row.style.background = 'none')
      row.addEventListener('click', (ev) => { ev.stopPropagation(); menu.remove(); item.action() })
      menu.appendChild(row)
    })
    document.body.appendChild(menu)
    const rect = menu.getBoundingClientRect()
    if (rect.right > window.innerWidth) menu.style.left = (e.clientX - rect.width) + 'px'
    if (rect.bottom > window.innerHeight) menu.style.top = (e.clientY - rect.height) + 'px'
  })

  let curDx = 0, curDy = 0, isDragging = false, dragStartX, dragStartY, origLeft, origTop
  icon.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return
    isDragging = false; curDx = 0; curDy = 0
    dragStartX = e.clientX; dragStartY = e.clientY
    origLeft = icon.offsetLeft; origTop = icon.offsetTop

    const onMove = (ev) => {
      curDx = ev.clientX - dragStartX; curDy = ev.clientY - dragStartY
      if (Math.abs(curDx) > 3 || Math.abs(curDy) > 3) {
        if (!isDragging) {
          isDragging = true
          // 只有真正拖拽时才离开网格
          icon.style.position = 'absolute'
          icon.style.left = origLeft + 'px'
          icon.style.top = origTop + 'px'
          icon.style.zIndex = '50'
        }
        icon.style.transform = `translate3d(${curDx}px, ${curDy}px, 0)`
      }
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (isDragging) {
        icon.style.transform = ''
        icon.style.left = (origLeft + curDx) + 'px'
        icon.style.top = (origTop + curDy) + 'px'
        icon.style.zIndex = ''
      }
      // 纯单击不改变图标状态，保持在网格中
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  })
}

// 绑定现有图标
document.querySelectorAll('.desktop-icon').forEach(icon => bindDesktopIconEvents(icon))

// ========== 桌面排序 ==========
function refreshDesktop() {
  // 关闭右键菜单
  const menu = document.getElementById('desktopMenu')
  if (menu) menu.remove()
  // 整理桌面图标
  sortDesktopIcons()
  // 重新应用设置
  applyAllSettings()
  // 更新时间
  updateTime()
}

function sortDesktopIcons() {
  const container = document.getElementById('desktopIcons')
  const icons = [...container.querySelectorAll('.desktop-icon')]
  icons.sort((a, b) => {
    const labelA = (a.querySelector('.desktop-icon-label')?.textContent || '').trim()
    const labelB = (b.querySelector('.desktop-icon-label')?.textContent || '').trim()
    return labelA.localeCompare(labelB, 'zh-CN')
  })
  // 重置拖拽后的绝对定位，回到网格布局
  icons.forEach(icon => {
    icon.style.position = ''
    icon.style.left = ''
    icon.style.top = ''
    icon.style.zIndex = ''
    icon.style.transform = ''
    icon.style.willChange = ''
    container.appendChild(icon)
  })
}

// ========== 水面 Canvas 动画 ==========
let waterAnimId = null
let waterTime = 0

function startWaterSurface() {
  const canvas = document.getElementById('waterSurfaceCanvas')
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  waterTime = 0
  animateWaterSurface(canvas)
}

function stopWaterSurface() {
  if (waterAnimId) {
    cancelAnimationFrame(waterAnimId)
    waterAnimId = null
  }
}

function animateWaterSurface(canvas) {
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  function draw() {
    waterTime += 0.008
    ctx.clearRect(0, 0, w, h)

    for (let y = 0; y < h; y += 4) {
      const yoff = Math.sin(y * 0.02 + waterTime * 0.7) * 6
        + Math.sin(y * 0.05 - waterTime * 0.5) * 3
        + Math.cos(y * 0.01 + waterTime * 0.3) * 4

      const alpha = 0.03 + Math.abs(Math.sin(y * 0.015 + waterTime * 0.4)) * 0.04
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      ctx.fillRect(0, y, w, 4)

      const xoff = Math.sin(y * 0.03 + waterTime) * 3
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`
      ctx.fillRect(xoff + 20, y, w - 40, 2)
    }
    waterAnimId = requestAnimationFrame(draw)
  }
  draw()
}

window.addEventListener('resize', () => {
  const canvas = document.getElementById('waterSurfaceCanvas')
  if (canvas && canvas.classList.contains('active')) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
})

// ========== 多点涟漪 ==========
document.getElementById('desktop').addEventListener('click', function(e) {
  if (!appSettings.multiRipple) return
  if (e.target.closest('.dock') || e.target.closest('.glass-window') || e.target.closest('.topbar')) return

  const container = document.getElementById('multiRippleContainer')
  const rings = [
    { cls: '', delay: 0 },
    { cls: 'delay-1', delay: 200 },
    { cls: 'delay-2', delay: 400 },
  ]
  rings.forEach(({ cls, delay }) => {
    setTimeout(() => {
      const ring = document.createElement('div')
      ring.className = `multi-ripple-ring${cls ? ' ' + cls : ''}`
      ring.style.left = e.clientX + 'px'
      ring.style.top = e.clientY + 'px'
      ring.style.width = '20px'
      ring.style.height = '20px'
      container.appendChild(ring)
      ring.addEventListener('animationend', () => ring.remove())
    }, delay)
  })
})

// ========== 鼠标波浪扭曲 ==========
const mouseWave = document.getElementById('mouseWaveDistort')
if (mouseWave) {
  let waveTimeout
  document.addEventListener('mousemove', (e) => {
    if (!appSettings.waveDistort) return
    mouseWave.style.left = e.clientX + 'px'
    mouseWave.style.top = e.clientY + 'px'
    mouseWave.classList.add('active')
    clearTimeout(waveTimeout)
    waveTimeout = setTimeout(() => {
      mouseWave.classList.remove('active')
    }, 500)
  })
}

// ========== 初始化设置 ==========
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => { loadSettings(); initWidgets() }, 100)
} else {
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => { loadSettings(); initWidgets() }, 100))
}

// ========== 天气粒子桌面 ==========
let weatherParticles = null
let weatherParticleType = 'none' // 'rain' | 'snow' | 'fog' | 'none'
let weatherAnimId = null

async function initWeatherParticles() {
  const canvas = document.getElementById('weatherParticles')
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 获取天气
  try {
    const loc = await (await fetch('http://ip-api.com/json/?fields=lat,lon')).json()
    if (!loc.lat) return
    const w = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=weather_code&timezone=auto`)).json()
    const code = w.current.weather_code
    // 0=晴 1-3=多云 45-48=雾 51-67=雨 71-77=雪 80-82=阵雨 95-99=雷暴
    if (code >= 71 && code <= 77) weatherParticleType = 'snow'
    else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) weatherParticleType = 'rain'
    else if (code >= 45 && code <= 48) weatherParticleType = 'fog'
    else weatherParticleType = 'none'
  } catch(e) { return }

  if (weatherParticleType === 'none') return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // 初始化粒子
  const count = weatherParticleType === 'rain' ? 120 : weatherParticleType === 'snow' ? 80 : 40
  weatherParticles = []
  for (let i = 0; i < count; i++) {
    weatherParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: weatherParticleType === 'rain' ? Math.random() * 1.5 + 0.5 : Math.random() * 3 + 1,
      speed: weatherParticleType === 'rain' ? Math.random() * 8 + 6 : weatherParticleType === 'snow' ? Math.random() * 1.5 + 0.5 : Math.random() * 0.3 + 0.1,
      wind: weatherParticleType === 'snow' ? (Math.random() - 0.5) * 1.5 : (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    })
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (weatherParticleType === 'rain') {
      weatherParticles.forEach(p => {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(180,210,240,${p.opacity})`
        ctx.lineWidth = p.r
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x + p.wind, p.y + p.r * 4)
        ctx.stroke()
        p.y += p.speed
        p.x += p.wind
        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width }
      })
    } else if (weatherParticleType === 'snow') {
      weatherParticles.forEach(p => {
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        p.y += p.speed
        p.x += p.wind + Math.sin(p.y * 0.01) * 0.4
        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width }
      })
    } else if (weatherParticleType === 'fog') {
      weatherParticles.forEach(p => {
        ctx.beginPath()
        ctx.fillStyle = `rgba(200,210,220,${p.opacity})`
        ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2)
        ctx.fill()
        p.x += p.wind
        if (p.x > canvas.width + 100) p.x = -100
        if (p.x < -100) p.x = canvas.width + 100
      })
    }
    weatherAnimId = requestAnimationFrame(draw)
  }
  draw()
}

window.addEventListener('resize', () => {
  const canvas = document.getElementById('weatherParticles')
  if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
})

// 启动天气粒子（延迟等页面加载完）
setTimeout(initWeatherParticles, 5000)

// ========== 通知中心 ==========
const notifStore = []
let notifPanelOpen = false

function pushNotif(msg, type = 'info', icon = '') {
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' }
  const item = {
    id: Date.now(),
    msg,
    type,
    icon: icon || icons[type] || 'ℹ️',
    time: new Date(),
    unread: true
  }
  notifStore.unshift(item)
  if (notifStore.length > 50) notifStore.pop()
  renderNotifBadge()
  if (notifPanelOpen) renderNotifList()
}

function renderNotifBadge() {
  const badge = document.getElementById('notifBadge')
  const unread = notifStore.filter(n => n.unread).length
  if (badge) {
    badge.style.display = unread > 0 ? '' : 'none'
    badge.textContent = unread > 99 ? '99+' : unread
  }
}

function renderNotifList() {
  const list = document.getElementById('notifList')
  if (!list) return
  if (!notifStore.length) {
    list.innerHTML = '<div class="notif-empty">暂无通知</div>'
    return
  }
  list.innerHTML = notifStore.map(n => {
    const t = n.time
    const pad = v => String(v).padStart(2, '0')
    const timeStr = `${pad(t.getHours())}:${pad(t.getMinutes())}`
    return `<div class="notif-item${n.unread ? ' unread' : ''}" data-id="${n.id}">
      <div class="notif-icon ${n.type}">${n.icon}</div>
      <div class="notif-body">
        <div class="notif-msg">${escapeHtml(n.msg)}</div>
        <div class="notif-time">${timeStr}</div>
      </div>
    </div>`
  }).join('')

  list.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = Number(el.dataset.id)
      const item = notifStore.find(n => n.id === id)
      if (item) { item.unread = false; el.classList.remove('unread') }
      renderNotifBadge()
    })
  })
}

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel')
  if (!panel) return
  notifPanelOpen = !notifPanelOpen
  if (notifPanelOpen) {
    notifStore.forEach(n => n.unread = false)
    renderNotifBadge()
    renderNotifList()
    panel.classList.add('active')
  } else {
    panel.classList.remove('active')
  }
}

setTimeout(() => {
  const trigger = document.getElementById('notifTrigger')
  if (trigger) trigger.addEventListener('click', (e) => { e.stopPropagation(); toggleNotifPanel() })
  const clearBtn = document.getElementById('notifClearBtn')
  if (clearBtn) clearBtn.addEventListener('click', () => { notifStore.length = 0; renderNotifBadge(); renderNotifList() })
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('notifPanel')
    const trigger = document.getElementById('notifTrigger')
    if (panel && !panel.contains(e.target) && trigger && !trigger.contains(e.target)) {
      panel.classList.remove('active')
      notifPanelOpen = false
    }
  })
}, 100)

// ========== 锁屏 ==========
let lockTimer = null
const LOCK_TIMEOUT = 15 * 60 * 1000

let lockClockTimer = null

function updateLockClock() {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const el = document.getElementById('lockTime')
  if (el) el.textContent = `${h}:${m}`
}

function initLockScreen() {
  updateLockClock()
  const now = new Date()
  const dateEl = document.getElementById('lockDate')
  if (dateEl) dateEl.textContent = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 周${['日','一','二','三','四','五','六'][now.getDay()]}`
  lockClockTimer = setInterval(updateLockClock, 1000)
  setTimeout(() => { const i = document.getElementById('lockInput'); if (i) i.focus() }, 300)
}

// 开机后初始化锁屏时钟（锁屏从开机就可见）
setTimeout(initLockScreen, 2800)

function resetLockTimer() {
  if (lockTimer) clearTimeout(lockTimer)
  lockTimer = setTimeout(lockScreen, LOCK_TIMEOUT)
}

function lockScreen() {
  const lock = document.getElementById('lockscreen')
  if (!lock || !lock.classList.contains('hidden')) return
  if (lockTimer) clearTimeout(lockTimer)

  updateLockClock()
  const now = new Date()
  const dateEl = document.getElementById('lockDate')
  if (dateEl) dateEl.textContent = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 周${['日','一','二','三','四','五','六'][now.getDay()]}`
  const errEl = document.getElementById('lockError')
  if (errEl) errEl.textContent = ''
  const input = document.getElementById('lockInput')
  if (input) input.value = ''

  lock.classList.remove('hidden')
  lockClockTimer = setInterval(updateLockClock, 1000)
  setTimeout(() => { const i = document.getElementById('lockInput'); if (i) i.focus() }, 300)
}

function unlockScreen() {
  const input = document.getElementById('lockInput')
  if (!input) return
  const pwd = input.value.trim()
  if (!pwd) return

  window.os.getLockPassword().then(currentPwd => {
    if (pwd === currentPwd) {
      const lock = document.getElementById('lockscreen')
      lock.classList.add('hidden')
      input.value = ''
      const errEl = document.getElementById('lockError')
      if (errEl) errEl.textContent = ''
      if (lockClockTimer) { clearInterval(lockClockTimer); lockClockTimer = null }
      resetLockTimer()
      pushNotif('解锁成功', 'success', '🔓')
    } else {
      const errEl = document.getElementById('lockError')
      if (errEl) errEl.textContent = '密码错误'
      const lockEl = document.getElementById('lockscreen')
      lockEl.classList.add('shake')
      setTimeout(() => lockEl.classList.remove('shake'), 400)
      input.value = ''
      input.focus()
    }
  })
}

// 全局暴露
window.lockScreen = lockScreen
window.unlockScreen = unlockScreen

// 监听用户活动重置锁屏计时
['mousemove','keydown','click','scroll'].forEach(evt =>
  document.addEventListener(evt, resetLockTimer, { passive: true })
)

// ========== Dock 点击涟漪 ==========
document.getElementById('dock').addEventListener('click', (e) => {
  const item = e.target.closest('.dock-item')
  if (!item) return
  const rect = item.getBoundingClientRect()
  const ripple = document.createElement('div')
  ripple.className = 'dock-ripple'
  ripple.style.left = e.clientX + 'px'
  ripple.style.top = e.clientY + 'px'
  item.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove())
})

// ========== 截图工具 ==========
function screenshotWindow(win) {
  const flash = document.createElement('div')
  flash.style.cssText = `position:fixed;inset:0;z-index:99999;background:white;pointer-events:none;transition:opacity 0.3s`
  document.body.appendChild(flash)
  setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 300) }, 100)
  const rect = win.getBoundingClientRect()
  const now = new Date()
  const ts = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()+'_'+now.getHours()+'-'+now.getMinutes()+'-'+now.getSeconds()
  let shots = JSON.parse(localStorage.getItem('glassos_shots') || '[]')
  shots.unshift({ time: ts, window: windows[Object.keys(windows).find(k => windows[k].el === win)]?.title || '窗口', rect: { w: Math.round(rect.width), h: Math.round(rect.height) } })
  if (shots.length > 20) shots.length = 20
  localStorage.setItem('glassos_shots', JSON.stringify(shots))
}

async function takeScreenshot() {
  try {
    const result = await window.os.captureScreen()
    if (result.error) { pushNotif('截图失败: ' + result.error, 'error', '📸'); return }
    const ts = new Date()
    const pad = n => String(n).padStart(2, '0')
    const name = `screenshot_${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.png`
    const saveResult = await window.os.saveScreenshot({ dataUrl: result.dataUrl, defaultName: name })
    if (saveResult.success) pushNotif('截图已保存: ' + name, 'success', '📸')
    else pushNotif('截图保存失败', 'error', '📸')
  } catch(e) {
    pushNotif('截图失败: ' + e.message, 'error', '📸')
  }
}

// ========== 全局剪贴板历史 ==========
let clipboardHistory = JSON.parse(localStorage.getItem('glassos_clipboard') || '[]')
document.addEventListener('copy', (e) => {
  const text = window.getSelection()?.toString()?.trim()
  if (text && text.length < 500) {
    clipboardHistory = clipboardHistory.filter(h => h !== text)
    clipboardHistory.unshift(text)
    if (clipboardHistory.length > 15) clipboardHistory.length = 15
    localStorage.setItem('glassos_clipboard', JSON.stringify(clipboardHistory))
  }
})
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'v') {
    e.preventDefault()
    showClipboardPopup()
  }
})

function showClipboardPopup() {
  const old = document.getElementById('clipboardPopup')
  if (old) { old.remove(); return }
  const popup = document.createElement('div')
  popup.id = 'clipboardPopup'
  popup.style.cssText = 'position:fixed;bottom:120px;left:50%;transform:translateX(-50%);z-index:99990;background:rgba(30,30,40,0.94);backdrop-filter:blur(20px);border:0.5px solid rgba(255,255,255,0.1);border-radius:14px;padding:8px;max-width:400px;max-height:300px;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.5)'
  const items = clipboardHistory.length ? clipboardHistory.map((t, i) =>
    `<div style="padding:8px 12px;cursor:pointer;border-radius:8px;font-size:13px;color:rgba(255,255,255,0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" onmouseenter="this.style.background='rgba(255,255,255,0.06)'" onmouseleave="this.style.background='none'" onclick="navigator.clipboard.writeText('${t.replace(/'/g,"\\'").replace(/"/g,'&quot;')}');this.parentElement.parentElement.remove()">${t.slice(0, 80)}</div>`
  ).join('') : '<div style="padding:16px;text-align:center;color:rgba(255,255,255,0.3)">剪贴板为空 · Ctrl+C 复制 · Ctrl+Shift+V 粘贴</div>'
  popup.innerHTML = items
  document.body.appendChild(popup)
  setTimeout(() => document.addEventListener('click', function rm() { popup.remove(); document.removeEventListener('click', rm) }), 50)
}

// ========== Dock 放大镜 ==========
document.getElementById('dock').addEventListener('mousemove', (e) => {
  const items = document.querySelectorAll('#dock .dock-item')
  items.forEach(item => {
    const rect = item.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const dist = Math.abs(e.clientX - cx)
    const maxDist = 120
    const scale = dist < maxDist ? 1 + (1 - dist / maxDist) * 0.5 : 1
    const waveY = parseFloat(item.dataset.waveY) || 0
    item.style.transform = `scale(${scale}) translateY(${waveY * 0.5}px)`
    item.style.zIndex = scale > 1.1 ? '10' : ''
  })
})
document.getElementById('dock').addEventListener('mouseleave', () => {
  document.querySelectorAll('#dock .dock-item').forEach(item => {
    const waveY = parseFloat(item.dataset.waveY) || 0
    item.style.transform = `translateY(${waveY * 0.5}px)`
    item.style.zIndex = ''
  })
})

// ========== 文件拖放导入 ==========
const dropOverlay = document.createElement('div')
dropOverlay.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(88,166,255,0.12);border:3px dashed rgba(88,166,255,0.5);display:none;align-items:center;justify-content:center;font-size:24px;color:rgba(255,255,255,0.7);pointer-events:none'
dropOverlay.textContent = '📂 释放文件以导入'
document.body.appendChild(dropOverlay)

let dragCounter = 0
document.addEventListener('dragenter', (e) => {
  e.preventDefault()
  dragCounter++
  if (dragCounter === 1) dropOverlay.style.display = 'flex'
})
document.addEventListener('dragleave', (e) => {
  e.preventDefault()
  dragCounter--
  if (dragCounter === 0) dropOverlay.style.display = 'none'
})
document.addEventListener('dragover', (e) => { e.preventDefault() })
document.addEventListener('drop', async (e) => {
  e.preventDefault()
  dragCounter = 0
  dropOverlay.style.display = 'none'
  const files = [...e.dataTransfer.files].map(f => f.path).filter(Boolean)
  if (!files.length) return
  try {
    const result = await window.os.importFiles(files)
    dropOverlay.textContent = '✅ 已导入 ' + result.results.filter(r => r.success).length + ' 个文件到 ' + result.targetDir
    dropOverlay.style.display = 'flex'
    setTimeout(() => { dropOverlay.style.display = 'none'; dropOverlay.textContent = '📂 释放文件以导入' }, 2000)
  } catch(e) {
    dropOverlay.textContent = '❌ 导入失败'
    dropOverlay.style.display = 'flex'
    setTimeout(() => { dropOverlay.style.display = 'none'; dropOverlay.textContent = '📂 释放文件以导入' }, 2000)
  }
})

// ========== 全局剪贴板快捷键 ==========
document.addEventListener('keydown', async (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.target.closest('input,textarea')) {
    // Ctrl+C: 无选中文本时忽略
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !e.target.closest('input,textarea')) {
    // Ctrl+V: 读取系统剪贴板
    try {
      const text = await window.os.clipboardRead()
      if (text) {
        const activeInput = document.querySelector('.glass-window.focused input:focus, .glass-window.focused textarea:focus')
        if (activeInput) {
          const start = activeInput.selectionStart
          activeInput.value = activeInput.value.slice(0, start) + text + activeInput.value.slice(activeInput.selectionEnd)
          activeInput.selectionStart = activeInput.selectionEnd = start + text.length
        }
      }
    } catch(e) {}
  }
})

// 初始启动计时

setTimeout(() => {
  const boot = document.getElementById('bootScreen')
  if (boot) { boot.classList.add('hidden'); setTimeout(() => boot.remove(), 600) }
}, 2000)

setTimeout(resetLockTimer, 5000)


// ========== 桌面小组件 ==========
function initWidgets() {
  // 从 localStorage 读，过滤空数组
  try {
    const raw = localStorage.getItem('glassos_widgets')
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr) && arr.length > 0) activeWidgets = arr
    }
  } catch(e) {}
  if (!activeWidgets || !activeWidgets.length) activeWidgets = ['clock', 'weather', 'cpu']

  const c = document.getElementById('desktopWidgets')
  if (!c) return
  c.style.display = activeWidgets.length ? 'flex' : 'none'
  let html = ''
  if (activeWidgets.includes('clock')) html += '<div class="widget-card widget-clock"><div class="widget-time" id="widClock">--:--</div><div class="widget-date" id="widDate">---</div></div>'
  if (activeWidgets.includes('weather')) html += '<div class="widget-card widget-weather"><div class="weather-icon" id="widWIcon">--</div><div class="weather-info"><div class="weather-temp" id="widWTemp">--</div><div class="weather-desc" id="widWDesc">---</div></div></div>'
  if (activeWidgets.includes('cpu')) html += '<div class="widget-card widget-cpu"><div class="widget-label">🔲 CPU</div><div class="widget-value" id="widCpuVal">--%</div><div class="widget-bar"><div class="widget-bar-fill" id="widCpuBar" style="width:0;background:#58a6ff"></div></div></div>'
  c.innerHTML = html

  // 时钟
  setInterval(() => { const n=new Date(); const t=document.getElementById('widClock'); if(t)t.textContent=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0'); const d=document.getElementById('widDate'); if(d)d.textContent=n.getFullYear()+'年'+(n.getMonth()+1)+'月'+n.getDate()+'日' }, 10000)
  // 天气
  const updateW = async () => { try{const l=await(await fetch('http://ip-api.com/json/?fields=city,lat,lon')).json();if(!l.lat)return;const w=await(await fetch('https://api.open-meteo.com/v1/forecast?latitude='+l.lat+'&longitude='+l.lon+'&current=temperature_2m,weather_code&timezone=auto')).json();const code=w.current.weather_code;const icons={0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',51:'🌧️',61:'🌧️',71:'❄️',80:'🌦️',95:'⛈️'};const descs={0:'晴朗',1:'大部晴',2:'多云',3:'阴',45:'雾',51:'毛毛雨',61:'雨',71:'雪',80:'阵雨',95:'雷暴'};const ei=document.getElementById('widWIcon'),et=document.getElementById('widWTemp'),ed=document.getElementById('widWDesc');if(ei)ei.textContent=icons[code]||'🌤️';if(et)et.textContent=w.current.temperature_2m+'°';if(ed)ed.textContent=l.city+' · '+(descs[code]||'--')}catch(e){}}
  updateW(); setInterval(updateW, 600000)
  // CPU
  setInterval(async () => { try{const i=await window.os.getSystemInfo();if(i?.cpuUsage?.total){const p=((i.cpuUsage.total-i.cpuUsage.idle)/i.cpuUsage.total*100);const v=document.getElementById('widCpuVal'),b=document.getElementById('widCpuBar');if(v)v.textContent=p.toFixed(1)+'%';if(b){b.style.width=Math.min(p,100)+'%';b.style.background=p>85?'#ff7b72':p>60?'#d29922':'#58a6ff'}}}catch(e){}}, 3000)
}

// ========== 剪贴板管理器 ==========
function openClipboard() {
  let clipHistory = JSON.parse(localStorage.getItem('glassos_clipboard') || '[]')

  function render() {
    const list = document.getElementById('clipList')
    if (!list) return
    if (!clipHistory.length) { list.innerHTML = '<div class="dev-empty">剪贴板为空，复制内容后自动记录</div>'; return }
    list.innerHTML = clipHistory.map((text, i) => `
      <div class="clip-item" onclick="window._clip_copy(${i})">
        <div class="clip-item-text">${escapeHtml(text.length > 120 ? text.slice(0, 120) + '...' : text)}</div>
        <div class="clip-item-meta">
          <span>${text.length} 字符</span>
          <button class="clip-item-del" onclick="event.stopPropagation();window._clip_del(${i})">✕</button>
        </div>
      </div>
    `).join('')
  }

  const content = `<div class="app-clipboard">
    <div class="clip-header">
      <span style="font-size:15px;font-weight:600">📋 剪贴板</span>
      <span style="font-size:11px;color:rgba(255,255,255,0.3)">${clipHistory.length} 条记录</span>
    </div>
    <div class="clip-list" id="clipList"></div>
  </div>`
  createWindow('clipboard', '剪贴板', 400, 420, content)

  window._clip_copy = (i) => {
    const text = clipHistory[i]
    if (!text) return
    navigator.clipboard.writeText(text).then(() => pushNotif('已复制到剪贴板', 'success', '📋'))
  }
  window._clip_del = (i) => {
    clipHistory.splice(i, 1)
    localStorage.setItem('glassos_clipboard', JSON.stringify(clipHistory))
    render()
  }
  render()
}

// ========== 文本编辑器 ==========
function openEditor() {
  let currentFile = null
  let editorContent = ''

  const syntaxColors = {
    keyword: '#ff7b72', string: '#a5d6ff', comment: '#8b949e',
    number: '#79c0ff', function: '#d2a8ff', operator: '#ff7b72',
    tag: '#7ee787', attribute: '#79c0ff'
  }

  const content = `<div class="app-editor">
    <div class="editor-toolbar">
      <button class="editor-btn" onclick="window._editor_new()">📄 新建</button>
      <button class="editor-btn" onclick="window._editor_open()">📂 打开</button>
      <button class="editor-btn" onclick="window._editor_save()">💾 保存</button>
      <span class="editor-filename" id="editorFilename">未命名</span>
      <span class="editor-info" id="editorInfo">行 1, 列 1</span>
    </div>
    <div class="editor-body">
      <div class="editor-line-numbers" id="editorLineNum">1</div>
      <textarea class="editor-textarea" id="editorTextarea" spellcheck="false" placeholder="在此输入或粘贴代码..."></textarea>
    </div>
    <div class="editor-statusbar">
      <span id="editorLang">纯文本</span>
      <span id="editorSize">0 字符</span>
      <span>UTF-8</span>
    </div>
  </div>`
  createWindow('editor', '文本编辑器', 700, 500, content)

  function updateLineNumbers() {
    const ta = document.getElementById('editorTextarea')
    const ln = document.getElementById('editorLineNum')
    if (!ta || !ln) return
    const lines = ta.value.split('\n').length
    ln.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>')
  }

  function detectLang(file) {
    if (!file) return '纯文本'
    const ext = file.split('.').pop().toLowerCase()
    const map = { js: 'JavaScript', ts: 'TypeScript', py: 'Python', html: 'HTML', css: 'CSS', json: 'JSON', md: 'Markdown', sh: 'Shell', c: 'C', cpp: 'C++', java: 'Java', go: 'Go', rs: 'Rust', sql: 'SQL', xml: 'XML', yaml: 'YAML', yml: 'YAML', txt: '纯文本' }
    return map[ext] || ext.toUpperCase()
  }

  setTimeout(() => {
    const ta = document.getElementById('editorTextarea')
    if (!ta) return
    ta.addEventListener('input', () => {
      editorContent = ta.value
      updateLineNumbers()
      const sizeEl = document.getElementById('editorSize')
      if (sizeEl) sizeEl.textContent = ta.value.length + ' 字符'
    })
    ta.addEventListener('keyup', () => {
      const pos = ta.selectionStart
      const lines = ta.value.substr(0, pos).split('\n')
      const info = document.getElementById('editorInfo')
      if (info) info.textContent = `行 ${lines.length}, 列 ${lines[lines.length - 1].length + 1}`
    })
    ta.addEventListener('scroll', () => {
      const ln = document.getElementById('editorLineNum')
      if (ln) ln.scrollTop = ta.scrollTop
    })
    updateLineNumbers()
  }, 100)

  window._editor_new = () => {
    currentFile = null
    editorContent = ''
    const ta = document.getElementById('editorTextarea')
    if (ta) ta.value = ''
    const fn = document.getElementById('editorFilename')
    if (fn) fn.textContent = '未命名'
    updateLineNumbers()
  }
  window._editor_open = async () => {
    const result = await window.os.execCommand(`ls ~/Documents 2>/dev/null || ls ~ 2>/dev/null || echo ""`)
    pushNotif('请通过访达打开文件，或直接粘贴内容', 'info', '📂')
  }
  window._editor_save = async () => {
    const ta = document.getElementById('editorTextarea')
    if (!ta) return
    const content = ta.value
    if (!content) { pushNotif('内容为空', 'warning', '💾'); return }
    const path = prompt('保存路径（如 ~/Documents/untitled.txt）:', currentFile || '~/Documents/untitled.txt')
    if (!path) return
    const expanded = path.replace('~', await window.os.getHomeDir())
    const ok = await window.os.writeFile(expanded, content)
    if (ok) { currentFile = expanded; pushNotif('文件已保存: ' + path, 'success', '💾') }
    else pushNotif('保存失败', 'error', '💾')
  }
}

// ========== 磁盘分析器 ==========
function openDiskAnalyzer() {
  async function analyze() {
    const el = document.getElementById('diskResult')
    if (!el) return
    el.innerHTML = '<div class="dev-loading">分析中...</div>'
    let disks = []
    try {
      disks = await window.os.getDiskInfo()
    } catch(e) {}
    if (!disks || !disks.length) {
      try {
        const info = await window.os.getSystemInfo()
        if (info && info.disks) disks = info.disks
      } catch(e) {}
    }
    if (!disks || !disks.length) { el.innerHTML = '<div class="dev-empty">无法获取磁盘信息</div>'; return }

    el.innerHTML = disks.map(d => {
      const used = d.size - d.free
      const pct = d.size > 0 ? (used / d.size * 100).toFixed(1) : 0
      const freeGB = (d.free / 1024 / 1024 / 1024).toFixed(1)
      const usedGB = (used / 1024 / 1024 / 1024).toFixed(1)
      const totalGB = (d.size / 1024 / 1024 / 1024).toFixed(1)
      const color = pct > 90 ? '#ff5f57' : pct > 70 ? '#e3b341' : '#3fb950'
      return `<div class="disk-card">
        <div class="disk-card-header">
          <span class="disk-mount">${d.mount}</span>
          <span class="disk-pct" style="color:${color}">${pct}%</span>
        </div>
        <div class="disk-bar-outer">
          <div class="disk-bar-inner" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="disk-detail">
          <span>已用 ${usedGB} GB</span>
          <span>可用 ${freeGB} GB</span>
          <span>总计 ${totalGB} GB</span>
        </div>
        <div class="disk-visual">
          ${renderDiskBlocks(pct, color)}
        </div>
      </div>`
    }).join('')
  }

  function renderDiskBlocks(pct, color) {
    const total = 50
    const filled = Math.round(total * pct / 100)
    let html = '<div class="disk-blocks">'
    for (let i = 0; i < total; i++) {
      const c = i < filled ? color : 'rgba(255,255,255,0.06)'
      html += `<div class="disk-block" style="background:${c}"></div>`
    }
    html += '</div>'
    return html
  }

  const content = `<div class="app-disk">
    <div class="disk-header">
      <span style="font-size:15px;font-weight:600">💾 磁盘分析</span>
      <button class="dev-btn" onclick="window._disk_refresh()">🔄 刷新</button>
    </div>
    <div class="disk-list" id="diskResult">分析中...</div>
  </div>`
  createWindow('disk', '磁盘分析器', 480, 400, content)
  window._disk_refresh = analyze
  analyze()
}

// ========== 番茄钟 ==========
function openPomodoro() {
  let pomState = 'idle' // idle | work | break
  let pomTime = 25 * 60
  let pomInterval = null
  let pomCycles = 0
  const WORK = 25 * 60, BREAK = 5 * 60

  function formatTime(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0') }

  function updateUI() {
    const timeEl = document.getElementById('pomTime')
    const stateEl = document.getElementById('pomState')
    const cyclesEl = document.getElementById('pomCycles')
    const btnEl = document.getElementById('pomBtn')
    if (timeEl) timeEl.textContent = formatTime(pomTime)
    if (stateEl) stateEl.textContent = pomState === 'work' ? '🍅 专注中' : pomState === 'break' ? '☕ 休息中' : '准备开始'
    if (cyclesEl) cyclesEl.textContent = `已完成 ${pomCycles} 轮`
    if (btnEl) btnEl.textContent = pomState === 'idle' ? '▶ 开始' : '⏸ 暂停'
    document.title = pomState === 'idle' ? 'GlassOS' : `${formatTime(pomTime)} - ${pomState === 'work' ? '专注' : '休息'}`
  }

  function tick() {
    if (pomTime <= 0) {
      if (pomState === 'work') { pomCycles++; pomState = 'break'; pomTime = BREAK; pushNotif('专注结束，休息 5 分钟！', 'success', '🍅') }
      else { pomState = 'work'; pomTime = WORK; pushNotif('休息结束，开始新一轮专注！', 'info', '☕') }
      updateUI()
      return
    }
    pomTime--
    updateUI()
  }

  const content = `<div class="app-pomodoro">
    <div class="pom-time" id="pomTime">${formatTime(WORK)}</div>
    <div class="pom-state" id="pomState">准备开始</div>
    <div class="pom-cycles" id="pomCycles">已完成 0 轮</div>
    <div class="pom-controls">
      <button class="pom-btn-main" id="pomBtn" onclick="window._pom_toggle()">▶ 开始</button>
      <button class="pom-btn-reset" onclick="window._pom_reset()">↺ 重置</button>
    </div>
    <div class="pom-settings">
      <div class="pom-setting-row">
        <span>专注时长</span>
        <span id="pomWorkDisplay">25 分钟</span>
      </div>
      <div class="pom-setting-row">
        <span>休息时长</span>
        <span id="pomBreakDisplay">5 分钟</span>
      </div>
    </div>
  </div>`
  createWindow('pomodoro', '番茄钟', 360, 380, content)

  window._pom_toggle = () => {
    if (pomState === 'idle') { pomState = 'work'; pomTime = WORK; pomInterval = setInterval(tick, 1000) }
    else if (pomInterval) { clearInterval(pomInterval); pomInterval = null; pomState = 'idle' }
    updateUI()
  }
  window._pom_reset = () => {
    if (pomInterval) { clearInterval(pomInterval); pomInterval = null }
    pomState = 'idle'; pomTime = WORK; updateUI()
  }
  updateUI()
}

// ========== 单位换算器 ==========
function openConverter() {
  const categories = {
    '长度': { '米': 1, '千米': 1000, '厘米': 0.01, '毫米': 0.001, '英里': 1609.344, '英尺': 0.3048, '英寸': 0.0254, '码': 0.9144 },
    '重量': { '千克': 1, '克': 0.001, '毫克': 0.000001, '吨': 1000, '磅': 0.453592, '盎司': 0.0283495, '斤': 0.5, '两': 0.05 },
    '温度': { '°C': 'celsius', '°F': 'fahrenheit', 'K': 'kelvin' },
    '面积': { '平方米': 1, '平方千米': 1000000, '公顷': 10000, '亩': 666.667, '平方英尺': 0.092903, '英亩': 4046.86 },
    '数据': { 'B': 1, 'KB': 1024, 'MB': 1048576, 'GB': 1073741824, 'TB': 1099511627776 },
    '时间': { '秒': 1, '分钟': 60, '小时': 3600, '天': 86400, '周': 604800 },
  }

  let currentCat = '长度'

  function render() {
    const units = categories[currentCat]
    const keys = Object.keys(units)
    const content = `<div class="app-converter">
      <div class="conv-cats">${Object.keys(categories).map(c => `<button class="conv-cat-btn${c === currentCat ? ' active' : ''}" onclick="window._conv_setCat('${c}')">${c}</button>`).join('')}</div>
      <div class="conv-body">
        <div class="conv-input-group">
          <input class="conv-input" id="convFrom" type="number" value="1" oninput="window._conv_calc()" />
          <select class="conv-select" id="convFromUnit" onchange="window._conv_calc()">${keys.map(u => `<option>${u}</option>`).join('')}</select>
        </div>
        <div class="conv-arrow">⬇</div>
        <div class="conv-result-group">
          <div class="conv-result" id="convResult">--</div>
          <select class="conv-select" id="convToUnit" onchange="window._conv_calc()">${keys.map((u, i) => `<option${i === 1 ? ' selected' : ''}>${u}</option>`).join('')}</select>
        </div>
      </div>
    </div>`

    document.getElementById('win-converter')?.querySelector('.win-body')?.parentElement?.querySelector('.win-body')?.innerHTML && (document.getElementById('win-converter').querySelector('.win-body').innerHTML = content)
    const winEl = document.getElementById('win-converter')
    if (winEl) {
      const body = winEl.querySelector('.win-body')
      if (body) body.innerHTML = content
    }
  }

  createWindow('converter', '单位换算', 380, 340, '')

  window._conv_setCat = (cat) => { currentCat = cat; render(); window._conv_calc() }
  window._conv_calc = () => {
    const val = parseFloat(document.getElementById('convFrom')?.value) || 0
    const fromUnit = document.getElementById('convFromUnit')?.value
    const toUnit = document.getElementById('convToUnit')?.value
    const units = categories[currentCat]
    const resultEl = document.getElementById('convResult')
    if (!resultEl || !fromUnit || !toUnit) return

    if (currentCat === '温度') {
      let celsius
      if (fromUnit === '°C') celsius = val
      else if (fromUnit === '°F') celsius = (val - 32) * 5 / 9
      else celsius = val - 273.15
      let result
      if (toUnit === '°C') result = celsius
      else if (toUnit === '°F') result = celsius * 9 / 5 + 32
      else result = celsius + 273.15
      resultEl.textContent = result.toFixed(4).replace(/\.?0+$/, '') + ' ' + toUnit
    } else {
      const baseVal = val * units[fromUnit]
      const result = baseVal / units[toUnit]
      resultEl.textContent = result.toFixed(6).replace(/\.?0+$/, '') + ' ' + toUnit
    }
  }

  render()
  setTimeout(() => window._conv_calc(), 100)
}

// ========== 进程管理器 ==========
function openProcessManager() {
  async function refresh() {
    const el = document.getElementById('procList')
    if (!el) return
    el.innerHTML = '<div class="dev-loading">加载中...</div>'
    try {
      const info = await window.os.getSystemInfo()
      if (!info) { el.innerHTML = '<div class="dev-empty">获取失败</div>'; return }
      const cpuPct = info.cpuUsage?.total ? ((info.cpuUsage.total - info.cpuUsage.idle) / info.cpuUsage.total * 100).toFixed(1) : '0'
      const memUsed = info.totalMem - info.freeMem
      const memPct = info.totalMem ? (memUsed / info.totalMem * 100).toFixed(1) : '0'

      let html = `<div class="proc-summary">
        <div class="proc-stat"><span class="proc-stat-label">CPU</span><span class="proc-stat-val" style="color:${cpuPct > 80 ? '#ff7b72' : '#3fb950'}">${cpuPct}%</span></div>
        <div class="proc-stat"><span class="proc-stat-label">内存</span><span class="proc-stat-val" style="color:${memPct > 80 ? '#ff7b72' : '#3fb950'}">${memPct}%</span></div>
        <div class="proc-stat"><span class="proc-stat-label">进程数</span><span class="proc-stat-val">${info.processCount || '--'}</span></div>
      </div>`

      // Disk info
      if (info.disks && info.disks.length) {
        html += '<div class="proc-section-title">磁盘分区</div>'
        html += info.disks.map(d => {
          const usedPct = d.size > 0 ? ((d.size - d.free) / d.size * 100).toFixed(1) : 0
          return `<div class="proc-row">
            <span class="proc-name">${d.mount}</span>
            <div class="proc-bar"><div class="proc-bar-fill" style="width:${usedPct}%;background:${usedPct > 90 ? '#ff5f57' : usedPct > 70 ? '#e3b341' : '#3fb950'}"></div></div>
            <span class="proc-val">${usedPct}%</span>
          </div>`
        }).join('')
      }

      // Network
      if (info.netNames && info.netNames.length) {
        html += '<div class="proc-section-title">网络接口</div>'
        html += info.netNames.map(n => `<div class="proc-row"><span class="proc-name">${n}</span><span class="proc-val" style="color:#3fb950">活跃</span></div>`).join('')
      }

      el.innerHTML = html
    } catch(e) { el.innerHTML = '<div class="dev-empty">获取失败</div>' }
  }

  const content = `<div class="app-process">
    <div class="proc-header">
      <span style="font-size:15px;font-weight:600">⚙ 进程管理器</span>
      <button class="dev-btn" onclick="window._proc_refresh()">🔄 刷新</button>
    </div>
    <div class="proc-list" id="procList">加载中...</div>
  </div>`
  createWindow('process', '进程管理器', 500, 450, content)
  window._proc_refresh = refresh
  refresh()
}
