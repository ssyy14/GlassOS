class V86Linux {
  constructor(screenElement) {
    this.screen = screenElement
    this.emulator = null
    this.loaded = false
  }

  async init() {
    if (this.loaded) return

    await new Promise((resolve, reject) => {
      if (window.V86) { resolve(); return }
      const script = document.createElement('script')
      script.src = (window.__dirname || '.') + '/node_modules/v86/build/libv86.js'
      script.onload = resolve
      script.onerror = () => reject(new Error('无法加载 v86 引擎'))
      document.head.appendChild(script)
    })

    this.loaded = true
  }

  async boot() {
    await this.init()

    const wasmPath = (window.__dirname || '.') + '/node_modules/v86/build/v86.wasm'
    const imgPath = (window.__dirname || '.') + '/v86-images'

    this.emulator = new V86({
      wasm_path: wasmPath,
      memory_size: 256 * 1024 * 1024,
      vga_memory_size: 8 * 1024 * 1024,
      screen_container: this.screen,
      bios: { url: imgPath + '/seabios.bin' },
      vga_bios: { url: imgPath + '/vgabios.bin' },
      bzimage: { url: imgPath + '/buildroot-bzimage68.bin' },
      cmdline: 'root=/dev/ram rw',
      autostart: true,
    })

    return this.emulator
  }

  sendKeys(text) {
    if (this.emulator) {
      for (const ch of text) {
        this.emulator.keyboard_send_text(ch)
      }
    }
  }

  sendKey(code, flags) {
    if (this.emulator) {
      this.emulator.keyboard_send_scancode(code, flags)
    }
  }

  paste(text) {
    if (this.emulator) {
      this.emulator.keyboard_send_text(text)
    }
  }

  reset() {
    if (this.emulator) {
      this.emulator.keyboard_send_scancode(0x1D, 1)
      this.emulator.keyboard_send_scancode(0x38, 1)
      this.emulator.keyboard_send_scancode(0xE0, 0)
      this.emulator.keyboard_send_scancode(0x53, 1)
      this.emulator.keyboard_send_scancode(0x53, 0)
      this.emulator.keyboard_send_scancode(0x38, 0)
      this.emulator.keyboard_send_scancode(0x1D, 0)
    }
  }

  destroy() {
    if (this.emulator) {
      try { this.emulator.stop() } catch (e) {}
      this.emulator = null
    }
  }
}
