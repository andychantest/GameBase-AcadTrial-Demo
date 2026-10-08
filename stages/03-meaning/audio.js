// audio.js — Stage 3
// 原版專案的 audio/ 資料夾是空的，所以本階段的聲音全部用 WebAudio 現場合成。
// 好處：零音檔、零延遲、隨時可換音色，而且不會有版權問題。
//
// Stage 3 新增的「氛圍」：每個關卡有不同調式的背景音樂床。
// 這是「意義」的一部分 —— 圖書館和網路空間聽起來就該不一樣。

const Music = {
  // 每個關卡一種調式與速度。library=靜謐, lab=機械, study=上進, epic=緊迫
  MOODS: {
    library: { root: 220.00, scale: [0, 3, 7, 10, 12], bpm: 62, wave: 'sine',     cutoff: 900 },
    lab:     { root: 196.00, scale: [0, 4, 7, 11, 14], bpm: 84, wave: 'triangle', cutoff: 1200 },
    study:   { root: 246.94, scale: [0, 2, 5, 7, 9],  bpm: 96, wave: 'triangle', cutoff: 1600 },
    epic:    { root: 174.61, scale: [0, 1, 5, 8, 10], bpm: 128, wave: 'sawtooth', cutoff: 2400 },
  },

  ac: null, master: null, musicGain: null, sfxGain: null,
  mood: null, timer: null, step: 0, playing: false, muted: false,

  init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { console.warn('[Audio] 此瀏覽器不支援 WebAudio，靜音執行'); return; }
    this.ac = new AC();
    this.master = this.ac.createGain();
    this.master.gain.value = 0.7;
    this.master.connect(this.ac.destination);
    this.musicGain = this.ac.createGain(); this.musicGain.gain.value = 0.16; this.musicGain.connect(this.master);
    this.sfxGain   = this.ac.createGain(); this.sfxGain.gain.value   = 0.5;  this.sfxGain.connect(this.master);
  },

  resume() { if (this.ac && this.ac.state === 'suspended') this.ac.resume(); },

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.7;
  },

  // ---- 單一音符 --------------------------------------------------------
  _note(freq, dur, type, vol, dest, glideTo) {
    if (!this.ac || this.muted) return;
    const t = this.ac.currentTime;
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfxGain);
    o.start(t); o.stop(t + dur + 0.02);
  },

  _noise(dur, vol, cutoff) {
    if (!this.ac || this.muted) return;
    const t = this.ac.currentTime, n = Math.floor(this.ac.sampleRate * dur);
    const buf = this.ac.createBuffer(1, n, this.ac.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = this.ac.createBufferSource(); src.buffer = buf;
    const f = this.ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff;
    const g = this.acGain_(vol);
    src.connect(f); f.connect(g); g.connect(this.sfxGain);
    src.start(t);
  },

  acGain_(vol) { const g = this.ac.createGain(); g.gain.value = vol; return g; },

  // ---- 音效 ------------------------------------------------------------
  sfxCollect()    { this._note(620, 0.10, 'triangle', 0.18, null, 1080); },
  sfxHit()        { this._note(190, 0.30, 'sawtooth', 0.22, null, 55); this._noise(0.20, 0.16, 900); },
  sfxFire()       { this._note(420, 0.16, 'square',   0.10, null, 180); },
  sfxReveal()     { this._note(880, 0.09, 'square', 0.12); setTimeout(() => this._note(1320, 0.12, 'square', 0.10), 70); },
  sfxClick()      { this._note(520, 0.05, 'square', 0.07); },
  sfxLevelClear() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this._note(f, 0.30, 'triangle', 0.16), i * 110)); },
  sfxGameOver()   { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => this._note(f, 0.34, 'sawtooth', 0.14), i * 150)); },

  // ---- 背景音樂床 ------------------------------------------------------
  playMusic(moodName) {
    if (!this.ac) return;
    if (this.mood === moodName) return;
    this.stopMusic();
    const mood = this.MOODS[moodName] || this.MOODS.study;
    this.mood = moodName; this.step = 0; this.playing = true;
    const beat = 60 / mood.bpm;
    this.timer = setInterval(() => this._tick(mood, beat), beat * 500);  // 8 個半拍檢查一次
    this._tick(mood, beat);
  },

  _tick(mood, beat) {
    if (!this.playing) return;
    const t = this.ac.currentTime;
    // 濾波器掃頻，讓音床有「流動」感
    const f = this.ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(mood.cutoff * 0.6, t);
    f.frequency.linearRampToValueAtTime(mood.cutoff, t + beat * 4);
    f.connect(this.musicGain);
    this._filter = f;

    const s = this.step++;
    // 低音：每 4 步一次
    if (s % 4 === 0) this._note(mood.root / 2, beat * 3.2, 'sine', 0.30, this.musicGain);
    // 琶音：走調式
    const deg = mood.scale[(s * 3) % mood.scale.length];
    const oct = ((s % 8) < 4) ? 1 : 2;
    this._note(mood.root * Math.pow(2, deg / 12) * oct, beat * 0.85, mood.wave, 0.11, this.musicGain);
  },

  stopMusic() { this.playing = false; if (this.timer) { clearInterval(this.timer); this.timer = null; } this.mood = null; },
};
