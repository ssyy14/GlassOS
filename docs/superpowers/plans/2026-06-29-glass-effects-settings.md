# GlassOS 玻璃特效个性化设置 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 GlassOS 添加全面的玻璃特效个性化设置系统（手风琴面板 + CSS 变量驱动 + 水面荡漾特效）

**Architecture:** CSS 自定义属性 (`--glass-*`, `--orb-*`, `--water-*`) 驱动所有视觉参数；renderer.js 中 settings 对象管理状态并持久化至 localStorage；设置 UI 为手风琴折叠面板，滑块/开关实时生效；水面效果由 Canvas（水面层）+ CSS animation（涟漪、流光）+ DOM（鼠标波浪）混合实现。

**Tech Stack:** 纯 HTML/CSS/JS（无额外依赖），Electron 渲染进程

**涉及文件:**
- 修改: `styles.css` — 新增 CSS 变量 + 水面效果样式 + 手风琴样式
- 修改: `renderer.js` — 设置管理 + 手风琴面板 + 水面效果 JS
- 修改: `index.html` — 水面 Canvas 容器元素

---

### Task 1: 扩展 CSS 变量体系

**Files:**
- Modify: `styles.css:3-61`

- [ ] **Step 1: 在 :root 块末尾（`--accent` 之前）插入新变量**

在 `styles.css` 第 26 行 (`--orb-opacity: 1;`) 之后，`--menu-bg` 之前插入：

```css
  /* === 玻璃特效定制 - 模糊强度 === */
  --blur-bg: 80px;
  --blur-window: 40px;
  --blur-topbar: 30px;
  --blur-dock: 12px;

  /* === 玻璃特效定制 - 饱和度 === */
  --saturate-bg: 200%;
  --saturate-window: 180%;
  --saturate-topbar: 160%;

  /* === 玻璃特效定制 - 厚度 === */
  --glass-thickness: 0.05;

  /* === 光球定制 === */
  --orb-size: 1;
  --orb-speed: 1;
  --orb1-color: rgba(255,107,107,0.35);
  --orb2-color: rgba(78,205,196,0.3);
  --orb3-color: rgba(168,85,247,0.25);
  --orb4-color: rgba(59,130,246,0.25);

  /* === 鼠标特效 === */
  --mouse-light-intensity: 0.04;
  --mouse-glass-intensity: 0.02;

  /* === 背景元素 === */
  --caustic-opacity: 0.35;
  --streak-opacity: 0.5;
  --glass-pulse: 1;
  --vignette-opacity: 1;
  --grid-opacity: 0.5;
  --noise-opacity: 0.03;

  /* === 水面效果 === */
  --water-surface: 0;
  --ripple-multi: 1;
  --wave-distort: 1;
  --edge-shimmer: 1;
  --shimmer-speed: 8s;
```

- [ ] **Step 2: 在 body.light-mode 块末尾添加浅色模式默认值**

在 `styles.css` 第 58 行 (`--orb-opacity: 0.3;`) 之后插入：

```css
  --blur-bg: 60px;
  --blur-window: 30px;
  --blur-topbar: 20px;
  --blur-dock: 8px;
  --saturate-bg: 150%;
  --saturate-window: 140%;
  --saturate-topbar: 130%;
  --glass-thickness: 0.04;
  --orb-size: 1;
  --orb-speed: 1;
  --orb1-color: rgba(100,150,255,0.15);
  --orb2-color: rgba(255,180,100,0.12);
  --orb3-color: rgba(150,200,255,0.1);
  --orb4-color: rgba(255,150,200,0.1);
  --mouse-light-intensity: 0.03;
  --mouse-glass-intensity: 0.01;
  --caustic-opacity: 0.2;
  --streak-opacity: 0.35;
  --vignette-opacity: 0.7;
  --grid-opacity: 0.35;
  --noise-opacity: 0.02;
  --water-surface: 0;
  --ripple-multi: 1;
  --wave-distort: 1;
  --edge-shimmer: 1;
```

- [ ] **Step 3: 启动确认 CSS 不报错**

```bash
echo "Open index.html in browser and check DevTools > Elements > Styles — verify :root shows all new variables, and no CSS syntax errors in console"
```

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "feat: add CSS variables for glass effects customization"
```

---

### Task 2: 重构 CSS 硬编码值为 var() 引用

**Files:**
- Modify: `styles.css` — 多处

- [ ] **Step 1: 背景层替换硬编码 blur/saturate**

修改 `.bg-layer` (第 83-84 行)：
```
/* Before: */
  backdrop-filter: blur(80px) saturate(200%) brightness(1.05);
  -webkit-backdrop-filter: blur(80px) saturate(200%) brightness(1.05);
/* After: */
  backdrop-filter: blur(var(--blur-bg)) saturate(var(--saturate-bg)) brightness(1.05);
  -webkit-backdrop-filter: blur(var(--blur-bg)) saturate(var(--saturate-bg)) brightness(1.05);
```

- [ ] **Step 2: 顶栏替换 blur/saturate**

修改 `.topbar` (第 261-262 行)：
```
/* Before: */
  backdrop-filter: blur(30px) saturate(160%);
/* After: */
  backdrop-filter: blur(var(--blur-topbar)) saturate(var(--saturate-topbar));
  -webkit-backdrop-filter: blur(var(--blur-topbar)) saturate(var(--saturate-topbar));
```

- [ ] **Step 3: 窗口替换 blur/saturate**

修改 `.glass-window` (第 352-353 行)：
```
/* Before: */
  backdrop-filter: blur(40px) saturate(180%);
/* After: */
  backdrop-filter: blur(var(--blur-window)) saturate(var(--saturate-window));
  -webkit-backdrop-filter: blur(var(--blur-window)) saturate(var(--saturate-window));
```

- [ ] **Step 4: 窗口背景透明度引用 --glass-thickness**

修改 `.glass-window` 的 `background`：
```
/* Before: */
  background: var(--win-bg);
/* After: */
  background: rgba(255,255,255, var(--glass-thickness));
```
同时修改 body.light-mode 中的 `--win-bg`，改为引用 `--glass-thickness`：
```
/* :root 已有 --win-bg: rgba(255,255,255,0.05); — 保持不变作为回退 */
/* 浅色模式使用 var(--glass-thickness) 时需在 glass-window 的 body.light-mode 覆盖中指定 */
```

在 `body.light-mode` 块中添加：
```css
body.light-mode .glass-window {
  background: rgba(0,0,0, var(--glass-thickness));
}
```

- [ ] **Step 5: 光球引用变量**

修改 `.orb.o1` 到 `.orb.o4` (第 139-142 行)：
```css
.orb.o1 { width: calc(450px * var(--orb-size)); height: calc(450px * var(--orb-size)); background: var(--orb1-color); top: -8%; left: -5%; animation-duration: calc(18s / var(--orb-speed)); }
.orb.o2 { width: calc(400px * var(--orb-size)); height: calc(400px * var(--orb-size)); background: var(--orb2-color); bottom: 5%; right: -5%; animation-duration: calc(20s / var(--orb-speed)); animation-delay: calc(-4s / var(--orb-speed)); }
.orb.o3 { width: calc(380px * var(--orb-size)); height: calc(380px * var(--orb-size)); background: var(--orb3-color); top: 45%; left: 45%; animation-duration: calc(24s / var(--orb-speed)); animation-delay: calc(-7s / var(--orb-speed)); }
.orb.o4 { width: calc(320px * var(--orb-size)); height: calc(320px * var(--orb-size)); background: var(--orb4-color); top: 15%; right: 18%; animation-duration: calc(22s / var(--orb-speed)); animation-delay: calc(-2s / var(--orb-speed)); }
```

- [ ] **Step 6: 鼠标光效替换透明度**

修改 `.mouse-light` (第 171 行) 的 `background`：
```
/* Before: */
  background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 30%, transparent 70%);
/* After: */
  background: radial-gradient(circle, rgba(255,255,255, var(--mouse-light-intensity)) 0%, rgba(255,255,255, calc(var(--mouse-light-intensity) * 0.25)) 30%, transparent 70%);
```

修改 `.mouse-glass-distort` (第 184 行) 的 `background`：
```
/* Before: */
  background: radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 60%);
/* After: */
  background: radial-gradient(circle, rgba(255,255,255, var(--mouse-glass-intensity)) 0%, transparent 60%);
```

- [ ] **Step 7: 背景元素替换引用**

修改 `.caustic` opacity (第 153 行)：
```
/* Before: */ opacity: 0.35;
/* After:  */ opacity: var(--caustic-opacity);
```

修改 `.bg-vignette` opacity — 在 `.bg-vignette` 规则中替换硬编码 gradient 为使用变量控制：
```css
.bg-vignette {
  position: absolute;
  inset: 0;
  opacity: var(--vignette-opacity);
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%);
  pointer-events: none;
}
```

修改 `.bg-grid` opacity (第 198 行)：
```
/* Before: */ opacity: 0.5;
/* After:  */ opacity: var(--grid-opacity);
```

修改 `.bg-noise` opacity (第 205 行)：
```
/* Before: */ opacity: 0.03;
/* After:  */ opacity: var(--noise-opacity);
```

修改 `.bg-light-streak` opacity (第 238 行)：
```
/* Before: */ opacity: 0.5;
/* After:  */ opacity: var(--streak-opacity);
```

暂停 `.bg-glass-panel` 的呼吸动画，新增 CSS 规则：
```css
.bg-glass-panel {
  animation-play-state: var(--glass-pulse) == 1 ? running : paused;
}
/* 改为在 :root 已有样式中添加: */
```
在 `.bg-glass-panel::before` 第 108 行添加：
```
animation-play-state: running;
/* 当 --glass-pulse 为 0 时通过 JS 设置 animation-play-state: paused */
```

- [ ] **Step 8: 启动验证所有效果正常**

启动应用，确认所有玻璃特效与改动前视觉一致。

- [ ] **Step 9: Commit**

```bash
git add styles.css
git commit -m "refactor: replace hardcoded glass values with CSS variables"
```

---

### Task 3: 水面效果 CSS + 涟漪流光样式

**Files:**
- Modify: `styles.css` — 末尾追加

- [ ] **Step 1: 在 styles.css 末尾追加水面效果 CSS**

```css
/* ========== 水面效果 ========== */

/* 桌面水面 Canvas 层 */
.water-surface-canvas {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  opacity: 0.25;
  display: none;
}
.water-surface-canvas.active {
  display: block;
}

/* 多点涟漪容器 */
.multi-ripple-container {
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
  overflow: hidden;
}
.multi-ripple-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
  pointer-events: none;
  animation: multiRippleExpand 1.8s ease-out forwards;
}
@keyframes multiRippleExpand {
  0%   { transform: translate(-50%,-50%) scale(0.1); opacity: 0.8; }
  100% { transform: translate(-50%,-50%) scale(6); opacity: 0; }
}
.multi-ripple-ring.delay-1 { animation-delay: 0.2s; animation-duration: 2s; }
.multi-ripple-ring.delay-2 { animation-delay: 0.4s; animation-duration: 2.2s; }

/* 鼠标波浪扭曲区域 */
.mouse-wave-distort {
  position: fixed;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 4;
  backdrop-filter: blur(4px) brightness(1.15);
  -webkit-backdrop-filter: blur(4px) brightness(1.15);
  opacity: 0;
  transition: opacity 0.3s;
  transform: translate(-50%, -50%);
  will-change: transform, left, top;
}
.mouse-wave-distort.active {
  opacity: 1;
}
.mouse-wave-distort.hidden {
  display: none;
}

/* 窗口边缘流光 */
.glass-window.shimmer-active::before {
  animation: edgeShimmer var(--shimmer-speed) linear infinite;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255,255,255,0.08) 30deg,
    transparent 60deg,
    rgba(168,85,247,0.06) 180deg,
    transparent 210deg,
    rgba(255,255,255,0.06) 280deg,
    transparent 360deg
  );
}
@keyframes edgeShimmer {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 手风琴折叠面板 */
.settings-accordion {
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
}
.settings-accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  background: var(--glass-bg);
  transition: background 0.2s;
  user-select: none;
}
.settings-accordion-header:hover {
  background: var(--glass-highlight);
}
.settings-accordion-header .arrow {
  font-size: 10px;
  color: var(--text-muted);
  transition: transform 0.25s;
}
.settings-accordion-header.open .arrow {
  transform: rotate(90deg);
}
.settings-accordion-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
}
.settings-accordion-body.open {
  max-height: 800px;
  overflow-y: auto;
}
.settings-accordion-inner {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 滑块控件 */
.settings-slider-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  gap: 10px;
}
.settings-slider-label {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 50px;
  flex-shrink: 0;
}
.settings-slider {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--glass-border);
  outline: none;
  cursor: pointer;
}
.settings-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  box-shadow: 0 0 8px rgba(88,166,255,0.4);
}
.settings-slider-value {
  font-size: 11px;
  color: var(--text-muted);
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}

/* 颜色选择器 */
.settings-color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
}
.settings-color-label {
  font-size: 12px;
  color: var(--text-secondary);
}
.settings-color-input {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--glass-border);
  cursor: pointer;
  background: transparent;
  padding: 0;
}
.settings-color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}
.settings-color-input::-webkit-color-swatch {
  border-radius: 50%;
  border: none;
}

/* 预设按钮 */
.settings-presets {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 12px 16px;
}
.settings-preset-btn {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.settings-preset-btn:hover {
  background: var(--glass-highlight);
  border-color: var(--accent);
}
.settings-preset-btn .preset-icon {
  font-size: 20px;
  display: block;
  margin-bottom: 4px;
}
```

- [ ] **Step 2: 验证新 CSS 不报错，不影响现有布局**

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: add water effects and settings panel CSS"
```

---

### Task 4: 设置持久化与预设定义

**Files:**
- Modify: `renderer.js` — 在文件顶部（`windowZIndex` 定义之后）插入

- [ ] **Step 1: 定义预设方案和默认设置**

在 `renderer.js` 第 4 行 (`const windows = {}`) 之后插入：

```js
// ========== 设置管理与持久化 ==========
const DEFAULT_SETTINGS = {
  // 外观
  darkMode: true,
  transparency: true,
  dynamicBg: true,
  windowAnim: true,
  // 模糊 (px)
  blurBg: 80,
  blurWindow: 40,
  blurTopbar: 30,
  blurDock: 12,
  // 饱和度 (%)
  saturateBg: 200,
  saturateWindow: 180,
  saturateTopbar: 160,
  // 玻璃厚度
  glassThickness: 0.05,
  // 光球
  orbOpacity: 1,
  orbSize: 1,
  orbSpeed: 1,
  orb1Color: '#ff6b6b',
  orb2Color: '#4ecdc4',
  orb3Color: '#a855f7',
  orb4Color: '#3b82f6',
  // 鼠标
  mouseLight: true,
  mouseLightIntensity: 0.04,
  mouseGlass: true,
  mouseGlassIntensity: 0.02,
  // 背景元素
  caustic: true,
  causticOpacity: 0.35,
  streaks: true,
  streakOpacity: 0.5,
  glassPulse: true,
  vignette: true,
  vignetteOpacity: 1,
  grid: true,
  gridOpacity: 0.5,
  noise: true,
  noiseOpacity: 0.03,
  // 水面效果
  waterSurface: false,
  multiRipple: true,
  waveDistort: true,
  edgeShimmer: true,
  shimmerSpeed: 8,
}

const PRESETS = {
  clear: {
    name: '清透',
    icon: '💎',
    blurBg: 50, blurWindow: 25, blurTopbar: 18, blurDock: 6,
    saturateBg: 130, saturateWindow: 120, saturateTopbar: 110,
    glassThickness: 0.03,
    orbOpacity: 1, orbSize: 1, orbSpeed: 0.7,
    mouseLightIntensity: 0.06, mouseGlassIntensity: 0.03,
    causticOpacity: 0.45, streakOpacity: 0.6,
    vignetteOpacity: 0.5, gridOpacity: 0.3, noiseOpacity: 0.02,
    waterSurface: true,
  },
  deep: {
    name: '深邃',
    icon: '🌑',
    blurBg: 100, blurWindow: 55, blurTopbar: 40, blurDock: 16,
    saturateBg: 250, saturateWindow: 220, saturateTopbar: 200,
    glassThickness: 0.08,
    orbOpacity: 0.5, orbSize: 1.3, orbSpeed: 0.4,
    mouseLightIntensity: 0.02, mouseGlassIntensity: 0.01,
    causticOpacity: 0.2, streakOpacity: 0.3,
    vignetteOpacity: 1, gridOpacity: 0.7, noiseOpacity: 0.05,
    waterSurface: false,
  },
  colorful: {
    name: '彩色',
    icon: '🌈',
    saturateBg: 300, saturateWindow: 260, saturateTopbar: 240,
    orbOpacity: 1, orbSize: 1.1, orbSpeed: 1.2,
    orb1Color: '#ff3366', orb2Color: '#00e5ff', orb3Color: '#d500f9', orb4Color: '#ff9100',
    causticOpacity: 0.5, streakOpacity: 0.7,
    edgeShimmer: true, shimmerSpeed: 5,
  },
  minimal: {
    name: '极简',
    icon: '🤍',
    blurBg: 30, blurWindow: 15, blurTopbar: 10, blurDock: 4,
    saturateBg: 100, saturateWindow: 100, saturateTopbar: 100,
    glassThickness: 0.02,
    orbOpacity: 0, mouseLight: false, mouseGlass: false,
    caustic: false, streaks: false, glassPulse: false,
    vignette: false, grid: false, noise: false,
    waterSurface: false, multiRipple: false, waveDistort: false, edgeShimmer: false,
  }
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
    // 外观
    case 'darkMode':
      if (value) document.body.classList.remove('light-mode')
      else document.body.classList.add('light-mode')
      if (document.getElementById('themeToggle')) {
        document.getElementById('themeToggle').textContent = value ? '🌙' : '☀️'
      }
      break
    case 'windowAnim': break // 通过修改 createWindow 逻辑处理

    // 模糊
    case 'blurBg': root.setProperty('--blur-bg', value + 'px'); break
    case 'blurWindow': root.setProperty('--blur-window', value + 'px'); break
    case 'blurTopbar': root.setProperty('--blur-topbar', value + 'px'); break
    case 'blurDock': root.setProperty('--blur-dock', value + 'px'); break

    // 饱和度
    case 'saturateBg': root.setProperty('--saturate-bg', value + '%'); break
    case 'saturateWindow': root.setProperty('--saturate-window', value + '%'); break
    case 'saturateTopbar': root.setProperty('--saturate-topbar', value + '%'); break

    // 厚度
    case 'glassThickness': root.setProperty('--glass-thickness', value); break

    // 光球
    case 'orbOpacity': root.setProperty('--orb-opacity', value); break
    case 'orbSize': root.setProperty('--orb-size', value); break
    case 'orbSpeed': root.setProperty('--orb-speed', value); break
    case 'orb1Color': root.setProperty('--orb1-color', value); break
    case 'orb2Color': root.setProperty('--orb2-color', value); break
    case 'orb3Color': root.setProperty('--orb3-color', value); break
    case 'orb4Color': root.setProperty('--orb4-color', value); break

    // 鼠标
    case 'mouseLight':
      document.getElementById('mouseLight').style.display = value ? '' : 'none'
      break
    case 'mouseLightIntensity': root.setProperty('--mouse-light-intensity', value); break
    case 'mouseGlass':
      document.getElementById('mouseGlass').style.display = value ? '' : 'none'
      break
    case 'mouseGlassIntensity': root.setProperty('--mouse-glass-intensity', value); break

    // 背景元素
    case 'caustic':
      document.querySelector('.caustic').style.display = value ? '' : 'none'
      break
    case 'causticOpacity': root.setProperty('--caustic-opacity', value); break
    case 'streaks':
      document.querySelectorAll('.bg-light-streak').forEach(el => el.style.display = value ? '' : 'none')
      break
    case 'streakOpacity': root.setProperty('--streak-opacity', value); break
    case 'glassPulse':
      document.querySelector('.bg-glass-panel').style.animationPlayState = value ? 'running' : 'paused'
      break
    case 'vignette':
      document.querySelector('.bg-vignette').style.display = value ? '' : 'none'
      break
    case 'vignetteOpacity': root.setProperty('--vignette-opacity', value); break
    case 'grid':
      document.querySelector('.bg-grid').style.display = value ? '' : 'none'
      break
    case 'gridOpacity': root.setProperty('--grid-opacity', value); break
    case 'noise':
      document.querySelector('.bg-noise').style.display = value ? '' : 'none'
      break
    case 'noiseOpacity': root.setProperty('--noise-opacity', value); break

    // 水面效果
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
  // 刷新设置面板（如果打开）
  if (windows['settings']) {
    refreshSettingsPanel()
  }
}
```

- [ ] **Step 2: 在页面初始化处调用 loadSettings()**

找到 `renderer.js` 中合适位置（定义完 settings 函数后），在文件末尾添加：

```js
// ========== 初始化设置 ==========
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => loadSettings(), 100)
})
// 作为保险，DOMContentLoaded 触发后立即尝试
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => loadSettings(), 100)
}
```

- [ ] **Step 3: Commit**

```bash
git add renderer.js
git commit -m "feat: add settings persistence and preset system"
```

---

### Task 5: 手风琴设置面板 HTML

**Files:**
- Modify: `renderer.js:713-748` — 完全重写 `openSettings()`

- [ ] **Step 1: 重写 openSettings 函数**

替换 `renderer.js` 中第 713-748 行的 `openSettings()` 函数：

```js
function openSettings() {
  const accordion = (title, icon, bodyHtml, defaultOpen) => `
    <div class="settings-accordion">
      <div class="settings-accordion-header${defaultOpen ? ' open' : ''}" onclick="toggleAccordion(this)">
        <span>${icon} ${title}</span>
        <span class="arrow">▶</span>
      </div>
      <div class="settings-accordion-body${defaultOpen ? ' open' : ''}">
        <div class="settings-accordion-inner">${bodyHtml}</div>
      </div>
    </div>
  `

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

  const content = `<div class="app-settings">
    <div class="settings-title">⚙ 设置</div>

    ${accordion('外观', '🎨', `
      ${toggleRow('深色模式', 'darkMode')}
      ${toggleRow('透明效果', 'transparency')}
      ${toggleRow('动态壁纸', 'dynamicBg')}
      ${toggleRow('窗口启动动画', 'windowAnim')}
    `, true)}

    ${accordion('玻璃特效', '🪟', `
      ${toggleRow('启用透明效果', 'transparency')}
      ${sliderRow('背景模糊', 'blurBg', 20, 120, 5, 'px')}
      ${sliderRow('窗口模糊', 'blurWindow', 10, 80, 5, 'px')}
      ${sliderRow('顶栏模糊', 'blurTopbar', 10, 60, 5, 'px')}
      ${sliderRow('Dock模糊', 'blurDock', 2, 30, 2, 'px')}
      ${sliderRow('背景饱和度', 'saturateBg', 100, 300, 10, '%')}
      ${sliderRow('窗口饱和度', 'saturateWindow', 100, 300, 10, '%')}
      ${sliderRow('顶栏饱和度', 'saturateTopbar', 100, 300, 10, '%')}
      ${sliderRow('玻璃厚度', 'glassThickness', 0.02, 0.15, 0.01, '')}
    `)}

    ${accordion('光球设置', '🔮', `
      ${toggleRow('显示光球', 'orbOpacity')}
      ${sliderRow('光球大小', 'orbSize', 0.5, 1.5, 0.1, 'x')}
      ${sliderRow('动画速度', 'orbSpeed', 0.2, 2, 0.1, 'x')}
      ${colorRow('光球 1 (红)', 'orb1Color')}
      ${colorRow('光球 2 (青)', 'orb2Color')}
      ${colorRow('光球 3 (紫)', 'orb3Color')}
      ${colorRow('光球 4 (蓝)', 'orb4Color')}
    `)}

    ${accordion('鼠标特效', '🖱️', `
      ${toggleRow('跟随光效', 'mouseLight')}
      ${sliderRow('光效强度', 'mouseLightIntensity', 0.01, 0.1, 0.01, '')}
      ${toggleRow('玻璃扭曲', 'mouseGlass')}
      ${sliderRow('扭曲强度', 'mouseGlassIntensity', 0.01, 0.06, 0.01, '')}
    `)}

    ${accordion('背景元素', '🌌', `
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
    `)}

    ${accordion('水面效果', '💧', `
      ${toggleRow('桌面水面层', 'waterSurface')}
      ${toggleRow('多点涟漪', 'multiRipple')}
      ${toggleRow('鼠标波浪', 'waveDistort')}
      ${toggleRow('边缘流光', 'edgeShimmer')}
      ${sliderRow('流光速度', 'shimmerSpeed', 3, 15, 1, 's')}
    `)}

    ${accordion('预设方案', '🎭', `
      <div class="settings-presets">
        ${Object.entries(PRESETS).map(([key, p]) => `
          <button class="settings-preset-btn" onclick="applyPreset('${key}')">
            <span class="preset-icon">${p.icon}</span>${p.name}
          </button>
        `).join('')}
      </div>
    `)}

    ${accordion('关于', 'ℹ️', `
      <div class="settings-row">
        <span class="settings-label">系统名称</span>
        <span class="settings-value">GlassOS</span>
      </div>
      <div class="settings-row">
        <span class="settings-label">版本</span>
        <span class="settings-value">1.0.0</span>
      </div>
      <div class="settings-row">
        <span class="settings-label">渲染引擎</span>
        <span class="settings-value">Chromium</span>
      </div>
    `, true)}
  </div>`

  createWindow('settings', '设置', 420, 560, content)
}

function refreshSettingsPanel() {
  if (!windows['settings']) return
  const winBody = windows['settings'].el.querySelector('.win-body')
  if (winBody) {
    closeWindow('settings')
    openSettings()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add renderer.js
git commit -m "feat: rewrite settings panel with accordion layout"
```

---

### Task 6: 手风琴 + 控件事件处理

**Files:**
- Modify: `renderer.js` — 在 openSettings 之后添加全局事件处理函数

- [ ] **Step 1: 添加手风琴切换、滑块、开关、颜色选择器的事件处理**

在 `renderer.js` 中 `refreshSettingsPanel()` 函数之后追加：

```js
function toggleAccordion(header) {
  header.classList.toggle('open')
  const body = header.nextElementSibling
  body.classList.toggle('open')
}

function toggleSetting(toggleEl, key) {
  const isOn = toggleEl.classList.toggle('on')
  const value = key === 'darkMode' ? isOn : isOn
  setSetting(key, key === 'darkMode' ? isOn : (isOn ? 1 : 0))
  // 特殊处理 orbOpacity 开关
  if (key === 'orbOpacity') {
    setSetting('orbOpacity', isOn ? 1 : 0)
  }
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
```

- [ ] **Step 2: 处理新建窗口也应用 edgeShimmer**

修改 `createWindow` 函数中创建 `win` 元素后（`win.className = 'glass-window focused animating'` 之后），添加：

```js
  if (appSettings.edgeShimmer) {
    win.classList.add('shimmer-active')
  }
```

- [ ] **Step 3: Commit**

```bash
git add renderer.js
git commit -m "feat: wire up accordion and control event handlers"
```

---

### Task 7: 水面 Canvas 动画

**Files:**
- Modify: `renderer.js` — 末尾追加
- Modify: `index.html` — 添加 Canvas 容器

- [ ] **Step 1: 在 index.html 中添加水面 Canvas 和波浪扭曲容器**

在 `index.html` 的 `<div class="bg-light-streak"></div>`（第三个）之后，`<div class="mouse-light">` 之前插入：

```html
    <canvas class="water-surface-canvas" id="waterSurfaceCanvas"></canvas>
    <div class="multi-ripple-container" id="multiRippleContainer"></div>
    <div class="mouse-wave-distort hidden" id="mouseWaveDistort"></div>
```

- [ ] **Step 2: 在 renderer.js 末尾添加水面动画逻辑**

```js
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

    // 简化版仿水波纹理 — 使用多个偏移的正弦波纹
    for (let y = 0; y < h; y += 4) {
      const yoff = Math.sin(y * 0.02 + waterTime * 0.7) * 6
        + Math.sin(y * 0.05 - waterTime * 0.5) * 3
        + Math.cos(y * 0.01 + waterTime * 0.3) * 4

      const alpha = 0.03 + Math.abs(Math.sin(y * 0.015 + waterTime * 0.4)) * 0.04
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      ctx.fillRect(0, y, w, 4)

      // 水平波纹偏移
      const xoff = Math.sin(y * 0.03 + waterTime) * 3
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`
      ctx.fillRect(xoff + 20, y, w - 40, 2)
    }
    waterAnimId = requestAnimationFrame(draw)
  }
  draw()
}

// 窗口 resize 时更新 Canvas 尺寸
window.addEventListener('resize', () => {
  const canvas = document.getElementById('waterSurfaceCanvas')
  if (canvas && canvas.classList.contains('active')) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
})
```

- [ ] **Step 3: Commit**

```bash
git add index.html renderer.js
git commit -m "feat: add water surface canvas animation"
```

---

### Task 8: 多点涟漪 + 鼠标波浪交互

**Files:**
- Modify: `renderer.js` — 末尾追加

- [ ] **Step 1: 添加多点涟漪点击处理**

```js
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
      // 动画结束后清理
      ring.addEventListener('animationend', () => ring.remove())
    }, delay)
  })
})
```

- [ ] **Step 2: 添加鼠标波浪扭曲跟踪**

```js
// ========== 鼠标波浪扭曲 ==========
const mouseWaveDistort = document.getElementById('mouseWaveDistort')
if (mouseWaveDistort) {
  let waveTimeout
  document.addEventListener('mousemove', (e) => {
    if (!appSettings.waveDistort) return
    mouseWaveDistort.style.left = e.clientX + 'px'
    mouseWaveDistort.style.top = e.clientY + 'px'
    mouseWaveDistort.classList.add('active')
    clearTimeout(waveTimeout)
    waveTimeout = setTimeout(() => {
      mouseWaveDistort.classList.remove('active')
    }, 500)
  })
}
```

- [ ] **Step 3: 启动测试所有交互**

启动应用，验证：点击桌面产生 3 圈涟漪；鼠标移动时波浪扭曲跟随；预设按钮一键切换所有效果。

- [ ] **Step 4: Commit**

```bash
git add renderer.js
git commit -m "feat: add multi-ripple and mouse wave distortion"
```

---

### Task 9: 最终集成测试与修复

**Files:**
- 无新建，遍历所有已修改文件确认无误

- [ ] **Step 1: 完整功能测试清单**

启动 `npm start`，逐项验证：

1. 打开设置，所有手风琴分组可折叠/展开 ✅
2. 拖动模糊滑块，背景/窗口/顶栏/Dock 模糊度实时变化 ✅
3. 拖动饱和度滑块，色彩变化实时生效 ✅
4. 拖动厚度滑块，窗口透明度变化 ✅
5. 光球：开关显示/隐藏，大小/速度/颜色调节生效 ✅
6. 鼠标特效：开关显示/隐藏，强度滑块调节 ✅
7. 背景元素：焦散/光线/暗角/网格/噪点各开关和强度 ✅
8. 水面效果：桌面水面层开关，多点涟漪点击，鼠标波浪，边缘流光 ✅
9. 预设方案：四个按钮点击后所有控件同步更新 ✅
10. 关闭设置后重新打开，所有控件保持之前的状态 ✅
11. 深色/浅色模式切换后玻璃设置仍保持 ✅
12. 刷新页面后设置持久化（localStorage）✅

- [ ] **Step 2: 修复发现的问题**

根据测试结果修复任何 bug。

- [ ] **Step 3: Final commit**

```bash
git add styles.css renderer.js index.html
git commit -m "feat: complete glass effects personalization settings"
```

---

### Task 10: 清理视觉 Companion 并推送等待页

**Files:**
- Write: `.superpowers/brainstorm/686-1782710751/content/waiting.html`

- [ ] **Step 1: 推送等待页面到浏览器**

```html
<div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
  <p class="subtitle">设计完成，开始实施...</p>
</div>
```

---

## 附录: 关键 CSS 变量对照表

| 设置 Key | CSS 变量 | 默认值 | 范围 |
|----------|----------|--------|------|
| blurBg | --blur-bg | 80px | 20-120px |
| blurWindow | --blur-window | 40px | 10-80px |
| blurTopbar | --blur-topbar | 30px | 10-60px |
| blurDock | --blur-dock | 12px | 2-30px |
| saturateBg | --saturate-bg | 200% | 100-300% |
| saturateWindow | --saturate-window | 180% | 100-300% |
| saturateTopbar | --saturate-topbar | 160% | 100-300% |
| glassThickness | --glass-thickness | 0.05 | 0.02-0.15 |
| orbOpacity | --orb-opacity | 1 | 0-1 |
| orbSize | --orb-size | 1 | 0.5-1.5 |
| orbSpeed | --orb-speed | 1 | 0.2-2 |
| orb1Color | --orb1-color | #ff6b6b | any |
| orb2Color | --orb2-color | #4ecdc4 | any |
| orb3Color | --orb3-color | #a855f7 | any |
| orb4Color | --orb4-color | #3b82f6 | any |
| mouseLightIntensity | --mouse-light-intensity | 0.04 | 0.01-0.1 |
| mouseGlassIntensity | --mouse-glass-intensity | 0.02 | 0.01-0.06 |
| causticOpacity | --caustic-opacity | 0.35 | 0.05-0.6 |
| streakOpacity | --streak-opacity | 0.5 | 0.1-1 |
| vignetteOpacity | --vignette-opacity | 1 | 0.2-1 |
| gridOpacity | --grid-opacity | 0.5 | 0.1-0.8 |
| noiseOpacity | --noise-opacity | 0.03 | 0.01-0.08 |
| shimmerSpeed | --shimmer-speed | 8s | 3-15s |
