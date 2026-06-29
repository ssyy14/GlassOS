// ========== GlassOS Music Player Engine ==========
class GlassPlayer {
  constructor() {
    this.ctx = null
    this.playing = false
    this.currentTrack = 0
    this.volume = 0.5
    this._oscillators = []
    this._gainNode = null
  }

  _ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      this._gainNode = this.ctx.createGain()
      this._gainNode.gain.value = this.volume
      this._gainNode.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
  }

  _playMelody(notes, bpm) {
    this._ensureContext()
    this._stopAll()
    const beatDuration = 60 / bpm
    notes.forEach(({ freq, dur, start }) => {
      const osc = this.ctx.createOscillator()
      const env = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      env.gain.value = 0
      const t = this.ctx.currentTime + start * beatDuration
      env.gain.setValueAtTime(0, t)
      env.gain.linearRampToValueAtTime(0.15, t + 0.02)
      env.gain.linearRampToValueAtTime(0, t + dur * beatDuration - 0.02)
      osc.connect(env)
      env.connect(this._gainNode)
      osc.start(t)
      osc.stop(t + dur * beatDuration)
      this._oscillators.push(osc)
    })
  }

  _stopAll() {
    try { this._oscillators.forEach(o => o.stop()) } catch(e) {}
    this._oscillators = []
  }

  play() {
    const tracks = this._getTracks()
    if (!tracks[this.currentTrack]) return
    this.playing = true
    this._playMelody(tracks[this.currentTrack].notes, tracks[this.currentTrack].bpm)
  }

  pause() {
    this.playing = false
    this._stopAll()
  }

  next() {
    this.pause()
    const tracks = this._getTracks()
    this.currentTrack = (this.currentTrack + 1) % tracks.length
    this.play()
  }

  prev() {
    this.pause()
    const tracks = this._getTracks()
    this.currentTrack = (this.currentTrack - 1 + tracks.length) % tracks.length
    this.play()
  }

  setVolume(v) {
    this.volume = v
    if (this._gainNode) this._gainNode.gain.value = v
  }

  _getTracks() {
    return [
      { name: '月光', artist: 'GlassOS', bpm: 120, notes: [
        { freq: 523, dur: 0.5, start: 0 }, { freq: 659, dur: 0.5, start: 0.5 },
        { freq: 784, dur: 0.5, start: 1 }, { freq: 659, dur: 0.5, start: 1.5 },
        { freq: 523, dur: 1, start: 2 },
      ]},
      { name: '星空', artist: 'GlassOS', bpm: 100, notes: [
        { freq: 440, dur: 0.5, start: 0 }, { freq: 554, dur: 0.5, start: 0.5 },
        { freq: 659, dur: 0.5, start: 1 }, { freq: 554, dur: 0.5, start: 1.5 },
        { freq: 440, dur: 0.5, start: 2 }, { freq: 330, dur: 0.5, start: 2.5 },
      ]},
      { name: '暗潮', artist: 'GlassOS', bpm: 140, notes: [
        { freq: 196, dur: 0.25, start: 0 }, { freq: 196, dur: 0.25, start: 0.25 },
        { freq: 220, dur: 0.25, start: 0.5 }, { freq: 196, dur: 0.25, start: 0.75 },
        { freq: 262, dur: 0.25, start: 1 }, { freq: 196, dur: 0.25, start: 1.25 },
      ]},
    ]
  }

  getCurrentTrack() {
    const tracks = this._getTracks()
    return tracks[this.currentTrack] || null
  }
}

window.glassPlayer = new GlassPlayer()
