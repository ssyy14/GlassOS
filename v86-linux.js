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
      const v86Path = window.__dirname
        ? window.__dirname + '/node_modules/v86/build/libv86.js'
        : 'node_modules/v86/build/libv86.js'
      script.src = v86Path
      script.onload = resolve
      script.onerror = () => reject(new Error('无法加载 v86 引擎'))
      document.head.appendChild(script)
    })

    this.loaded = true
  }

  async boot() {
    await this.init()

    const wasmPath = window.__dirname
      ? window.__dirname + '/node_modules/v86/build/v86.wasm'
      : 'node_modules/v86/build/v86.wasm'

    const IMAGE_BASE = 'https://hub.gitmirror.com/https://raw.githubusercontent.com/niclas-niclas/niclas/refs/heads/master/images'

    this.emulator = new V86({
      wasm_path: wasmPath,
      memory_size: 256 * 1024 * 1024,
      vga_memory_size: 8 * 1024 * 1024,
      screen_container: this.screen,
      bios: { url: IMAGE_BASE + '/seabios.bin' },
      vga_bios: { url: IMAGE_BASE + '/vgabios.bin' },
      hda: { url: IMAGE_BASE + '/linux66-rootfs2-v86', async: true, size: 256 * 1024 * 1024 },
      bzimage: { url: IMAGE_BASE + '/linux66-bzimage-v86' },
      cmdline: 'root=/dev/sda rw rootfstype=ext4 init=/sbin/init',
      autostart: true,
      network_relay_url: 'wss://relay.widgetry.org/',
      bzimage_initrd_from_filesystem: true,
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
