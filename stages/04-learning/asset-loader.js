// asset-loader.js
// Handles all image/audio loading with graceful fallback.
// If an asset file doesn't exist, silently falls back to code-drawn graphics.
// Supports PNG sequence animation playback on Canvas.

const AssetLoader = {

  _images: {},     // cache: filename → HTMLImageElement | null
  _audio: {},      // cache: filename → HTMLAudioElement | null
  _loadingQueue: [], // Queue for managing concurrent loads
  _activeLoads: 0,
  _maxConcurrent: 3, // Increased for faster loading

  // Clear cache for fresh reload
  clearCache() {
    this._images = {};
    console.log('[AssetLoader] Cache cleared');
  },

  // ── IMAGE LOADING ────────────────────────────────────────────

  // Faster image loading with Image() directly
  loadImage(path, maxRetries = 2) {
    if (this._images[path] !== undefined) return Promise.resolve(this._images[path]);

    return new Promise((resolve) => {
      this._loadingQueue.push({ path, resolve, retries: maxRetries, attempt: 0 });
      this._processQueue();
    });
  },

  // Process loading queue with concurrency limit
  _processQueue() {
    while (this._loadingQueue.length > 0 && this._activeLoads < this._maxConcurrent) {
      const item = this._loadingQueue.shift();
      this._activeLoads++;
      this._loadImageDirect(item.path, item.retries)
        .then(img => item.resolve(img))
        .catch(() => item.resolve(null))
        .finally(() => {
          this._activeLoads--;
          setTimeout(() => this._processQueue(), 20);
        });
    }
  },

  // Direct loading with Image() - faster than fetch+blob
  _loadImageDirect(path, attempt = 1) {
    return new Promise((resolve) => {
      const img = new Image();
      const isFileProtocol = path.startsWith('file:') || (typeof location !== 'undefined' && location.protocol === 'file:');
      
      if (!isFileProtocol) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = () => {
        const originalPath = path.split('?')[0];
        this._images[originalPath] = img;
        resolve(img);
      };
      
      img.onerror = () => {
        const originalPath = path.split('?')[0];
        if (attempt < 2) {
          setTimeout(() => resolve(this._loadImageDirect(path, attempt + 1)), 300);
        } else {
          // Don't cache null - keep undefined so future retries can work
          resolve(null);
        }
      };
      
      // 穩定版本參數取代 ?t=Date.now()：後者會讓每次載入都把全部圖片重新下載、
      // 永遠快取不到（網路環境下每開一次 22MB）。BUMP 版本號時才刷新快取。
      // file:// 下維持純路徑（加參數會破壞本機載入）。
      const v = (typeof window !== 'undefined' && window.APP_BUILD) || '20260930b';
      img.src = isFileProtocol ? path : (path + '?v=' + v);
      
      // Timeout
      setTimeout(() => {
        const originalPath = path.split('?')[0];
        if (!this._images[originalPath]) {
          if (attempt < 2) {
            setTimeout(() => resolve(this._loadImageDirect(path, attempt + 1)), 300);
          } else {
            // Don't cache null - keep undefined for future retries
            resolve(null);
          }
        }
      }, 5000);
    });
  },

  // Load multiple images with queue system
  async loadImages(paths) {
    const results = [];
    for (const p of paths) {
      const img = await this.loadImage(p);
      results.push(img);
      // Minimal delay between loads
      await new Promise(r => setTimeout(r, 30));
    }
    return results;
  },

  // Get a cached image immediately (may be null if not found or not loaded yet).
  getImage(path) {
    return this._images[path] || null;
  },

  // Draw image to specified rectangle area
  drawRectAsset(ctx, path, x, y, w, h, options = null, alpha = 1) {
    const img = this.getImage(path);
    if (!img || !img.naturalWidth || !img.naturalHeight) return;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, x, y, w, h);
    ctx.globalAlpha = 1;
  },

  // Check if an image is ready and valid.
  isReady(path) {
    const img = this._images[path];
    return img && img.naturalWidth > 0 && img.naturalHeight > 0;
  },

  // Check if any image in array is ready
  isAnyReady(paths) {
    return paths.some(p => this.isReady(p));
  },

  // Get first ready image path from array
  getFirstReadyPath(paths) {
    return paths.find(p => this.isReady(p));
  },

  // ── ANIMATION SYSTEM ─────────────────────────────────────────

  // Detect animation frame count for a base path (e.g., 'player_student_idle')
  // Tries to load frames until one fails, then returns available frames
  getAnimationFrames(basePath) {
    const frames = [];
    let frameNum = 1;
    const ext = basePath.includes('.') ? '' : '.png';
    const maxFrames = 20; // Safety limit
    
    // First check if any frames are already cached
    while (frameNum <= maxFrames) {
      const framePath = `${basePath}_${frameNum}${ext}`;
      const img = this._images[framePath];
      if (img && img.naturalWidth > 0) {
        frames.push(framePath);
        frameNum++;
      } else {
        break;
      }
    }
    
    // If no cached frames, try to detect by attempting to load a few frames
    if (frames.length === 0) {
      // Try loading first frame to check if base path exists
      const testPath = `${basePath}_1${ext}`;
      const testImg = this._images[testPath];
      
      if (testImg && testImg.naturalWidth > 0) {
        frames.push(testPath);
        // Check for more frames
        for (let i = 2; i <= maxFrames; i++) {
          const p = `${basePath}_${i}${ext}`;
          if (this._images[p] && this._images[p].naturalWidth > 0) {
            frames.push(p);
          } else {
            break;
          }
        }
      }
    }
    
    return frames;
  },

  // Load all animation frames for a base path - with queue system
  async preloadAnimation(basePath, maxRetries = 3) {
    const ext = basePath.includes('.') ? '' : '.png';
    const frames = [];
    const maxFrames = 10;
    
    // Try to load potential frames sequentially
    for (let i = 1; i <= maxFrames; i++) {
      const framePath = `${basePath}_${i}${ext}`;
      await this.loadImage(framePath, maxRetries);
      
      // Check if loaded successfully
      if (this.isReady(framePath)) {
        frames.push(framePath);
      } else {
        // First missing frame - stop loading
        break;
      }
    }
    
    // Also try base path without number (for single static image)
    if (frames.length === 0 && !basePath.includes('_')) {
      await this.loadImage(basePath + '.png', maxRetries);
      if (this.isReady(basePath + '.png')) {
        frames.push(basePath + '.png');
      }
    }
    
    console.log(`[AssetLoader] Animation loaded: ${basePath} (${frames.length} frames)`);
    return frames;
  },

  // Get animation info for a base path - improved to check loaded frames
  getAnimationInfo(basePath) {
    const frames = [];
    const ext = basePath.includes('.') ? '' : '.png';
    const maxFrames = 10;
    
    // Check for available frames in cache
    for (let i = 1; i <= maxFrames; i++) {
      const framePath = `${basePath}_${i}${ext}`;
      if (this.isReady(framePath)) {
        frames.push(framePath);
      } else {
        break;
      }
    }
    
    // Also check base path without number
    if (frames.length === 0 && this.isReady(basePath + '.png')) {
      frames.push(basePath + '.png');
    }
    
    const readyCount = frames.filter(f => this.isReady(f)).length;
    
    return {
      frames: frames,
      count: readyCount,
      isAnimated: readyCount > 1,
      isReady: readyCount > 0
    };
  },

  // Get current animation frame image
  getAnimationFrame(basePath, frameIndex) {
    const frames = this.getAnimationFrames(basePath);
    if (frames.length === 0) return null;
    
    const safeIndex = frameIndex % frames.length;
    return this.getImage(frames[safeIndex]);
  },

  // ── AUDIO LOADING ────────────────────────────────────────────

  loadAudio(path) {
    if (this._audio[path] !== undefined) return Promise.resolve(this._audio[path]);

    return new Promise(resolve => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this._audio[path] = audio;
        resolve(audio);
      };
      audio.onerror = () => {
        this._audio[path] = null;
        resolve(null);
      };
      audio.src = path;
      audio.load();
      setTimeout(() => {
        if (this._audio[path] === undefined) {
          this._audio[path] = null;
          resolve(null);
        }
      }, 3000);
    });
  },

  getAudio(path) {
    return this._audio[path] || null;
  },

  // ── RESOLVE ASSET PATHS ──────────────────────────────────────

  paths: {
    // Player - base paths without frame numbers
    playerIdle: (role) => `images/characters/player_${role}_idle`,
    playerMove: (role) => `images/characters/player_${role}_move`,

    // Enemies - base paths without frame numbers
    enemyNormal: (id) => `images/enemies/enemy_${id}`,
    enemyFast: (id) => `images/enemies/enemy_${id}_fast`,
    enemyGrow: (id) => `images/enemies/enemy_${id}_grow`,
    enemyReveal: (id) => `images/enemies/enemy_${id}_reveal`,
    enemyHit: (id) => `images/enemies/enemy_${id}_hit`,
    enemyLure: (id) => `images/enemies/enemy_${id}_lure`,

    // Collectibles
    collectible: (id) => `images/collectibles/collectible_${id}`,

    // Backgrounds
    background: (name) => `images/backgrounds/bg_${name}`,

    // Cutscenes
    cutscene: (name) => `images/cutscenes/story_${name}.png`,

    // UI
    ui: (name) => `images/ui/${name}.png`,

    // Music
    music: (name) => `audio/music/bgm_${name}.mp3`,

    // SFX
    sfx: (name) => `audio/sfx/sfx_${name}.mp3`,
  },

  // ── PRELOAD ALL KNOWN ASSETS ─────────────────────────────────

  async preloadAll(cfg, onProgress) {
    // 過場圖（約 14MB）只會在較晚的流程用到，改由 preloadCutscenes() 在背景續載。
    // 這裡只擋「進場必要」的資產，縮短首屏等待時間。

    // Backgrounds: only the 4 used in config (no bg_title)
    const bgNames = ['library','computer_lab','lecture','cyberspace'];
    const bgPaths = bgNames.map(n => `images/backgrounds/bg_${n}.png`);

    // Collectibles: only frame 1 exists in V21
    const collectibleIds = ['journal', 'book', 'data', 'expert'];
    const collectiblePaths = collectibleIds.map(id => `images/collectibles/collectible_${id}_1.png`);
    console.log('[AssetLoader] Collectible paths:', collectiblePaths);

    // Player animations (needed for drawPlayer)
    const playerPaths = [
      'images/characters/player_student_idle_1.png',
      'images/characters/player_student_move_1.png',
      'images/characters/player_student_move_2.png',
    ];
    console.log('[AssetLoader] Player paths:', playerPaths);

    // Enemies: only frame 1 exists in V21
    const enemyIds = ['plagiarism', 'aiblob', 'essaymill', 'fakesource'];
    const enemyPaths = enemyIds.map(id => `images/enemies/enemy_${id}_1.png`);
    console.log('[AssetLoader] Enemy paths:', enemyPaths);

    const groups = [
      ['Loading backgrounds', bgPaths, 40],
      ['Loading player animations', playerPaths, 30],
      ['Loading collectibles', collectiblePaths, 20],
      ['Loading enemies', enemyPaths, 20],
    ];

    let done = 0;
    const total = bgPaths.length + playerPaths.length + collectiblePaths.length + enemyPaths.length;
    for (const [phrase, paths, delay] of groups) {
      for (let i = 0; i < paths.length; i++) {
        await this.loadImage(paths[i], 2);
        done++;
        if (onProgress) onProgress(phrase, done, total);
        await new Promise(r => setTimeout(r, delay));
      }
    }

    const bgCount = bgPaths.filter(p => this.isReady(p)).length;
    const collectibleCount = collectiblePaths.filter(p => this.isReady(p)).length;
    const enemyCount = enemyPaths.filter(p => this.isReady(p)).length;
    console.log(`[AssetLoader] Critical assets loaded. Backgrounds: ${bgCount}/${bgPaths.length}, Collectibles: ${collectibleCount}/${collectiblePaths.length}, Enemies: ${enemyCount}/${enemyPaths.length}, Player: ${playerPaths.filter(p => this.isReady(p)).length}/${playerPaths.length}`);
  },

  // ── BACKGROUND CUTSCENE PRELOAD ───────────────────────────────
  // 過場圖共約 14MB，只在過場與後期關卡用到。進場後於背景續載（fire-and-forget）。
  // intro_1 排在佇列最前面，優先變成可用；playCutscene() 對未載好的圖會自動略過。
  async preloadCutscenes() {
    const cutsceneNames = [
      'intro_1','intro_2','intro_3','intro_4',
      'level1_pre','level1_post',
      'level2_post',
      'level4_pre','level4_post',
      'graduation'
    ];
    const cutscenePaths = cutsceneNames.map(n => `images/cutscenes/story_${n}.png`);
    console.log('[AssetLoader] Loading cutscenes in background...');
    for (let i = 0; i < cutscenePaths.length; i++) {
      await this.loadImage(cutscenePaths[i], 2);
      await new Promise(r => setTimeout(r, 50));
    }
    const cutsceneCount = cutscenePaths.filter(p => this.isReady(p)).length;
    console.log(`[AssetLoader] Cutscenes: ${cutsceneCount}/${cutscenePaths.length} (background load complete)`);
  },
};


// ── AUDIO MANAGER ────────────────────────────────────────────────
// Controls music and SFX playback. Silently does nothing if audio missing.

const AudioManager = {
  _currentMusic: null,
  _currentMusicPath: null,
  _musicVolume: 0.5,
  _sfxVolume: 0.8,
  _muted: false,

  setMuted(val) { this._muted = val; if (val && this._currentMusic) this._currentMusic.pause(); },
  setMusicVolume(v) { this._musicVolume = v; if (this._currentMusic) this._currentMusic.volume = v; },
  setSfxVolume(v) { this._sfxVolume = v; },

  playMusic(name, loop = true) {
    const path = AssetLoader.paths.music(name);
    if (path === this._currentMusicPath) return;
    this.stopMusic();
    const audio = AssetLoader.getAudio(path);
    if (!audio || this._muted) return;
    try {
      audio.loop = loop;
      audio.volume = this._musicVolume;
      audio.currentTime = 0;
      audio.play().catch(() => {});
      this._currentMusic = audio;
      this._currentMusicPath = path;
    } catch(e) {}
  },

  stopMusic() {
    if (this._currentMusic) {
      try { this._currentMusic.pause(); this._currentMusic.currentTime = 0; } catch(e) {}
      this._currentMusic = null;
      this._currentMusicPath = null;
    }
  },

  playSfx(name) {
    if (this._muted) return;
    const path = AssetLoader.paths.sfx(name);
    const audio = AssetLoader.getAudio(path);
    if (!audio) return;
    try {
      const clone = audio.cloneNode();
      clone.volume = this._sfxVolume;
      clone.play().catch(() => {});
    } catch(e) {}
  },
};