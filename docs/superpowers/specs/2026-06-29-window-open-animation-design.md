# Window Open Animation - Design Spec

## Goal
Add macOS-style transition animation when opening apps in GlassOS. Currently windows appear instantly via `createWindow()`.

## Design Decision: Scale + Float Up (Option D)

### Animation
```css
@keyframes window-open {
  0%   { transform: scale(0.85) translateY(24px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
```
- Duration: 400ms
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (macOS ease-out)

### Changes

**styles.css** — Add `@keyframes window-open` and `.glass-window.animating` class that applies it.

**renderer.js** — In `createWindow()`, add `animating` class to new window element, remove after 400ms. Same for restoring minimized windows (already handled by `createWindow` reuse path).

### Scope
- Only affects window creation/restore
- No changes to drag, resize, close, or minimize behavior
- ~20 lines CSS + ~5 lines JS
