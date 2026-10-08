// game.js — Stage 3 / 意義 (Meaning)
//
// ★ 這個階段只做一件事：讓 Stage 2 的玩法「有意義」。
//
// 在 Stage 2 裡，四種敵人只是四張不同的圖片，行為完全一樣。
// 在 Stage 3 裡，每個敵人的「移動行為」都變成它所代表的違規行為的物理隱喻：
//
//   PLAGIARISM  →  直線追擊        抄襲永遠在追著原著的影子跑
//   AI BLOB     →  持續膨脹        AI 內容不理它就會取代你的真實寫作
//   ESSAY MILL  →  遠程射擊        捷徑最誘人，代價最慘重
//   FAKE SOURCE →  偽裝成來源      假引用要走近才看得出來
//   COLLUDE     →  延遲跟隨        與他人提交同一份作業
//
// 學習者會先「用身體理解」這些行為，之後才會在 Stage 4 讀到文字解釋。
// 這就是 GDD 裡那句 "The mechanics ARE the lesson" 的實作方式。
//
// 刻意「不包含」（都是 Stage 4 的工作）：
//   hover tooltip、技能卡與技能效果、評分公式、結算畫面、
//   反思題、CSV 匯出、GA 追蹤、登入
// ================================================================

const Game = {
  state: 'loading',
  W: 0, H: 0,
  arena: { top: 0, bottom: 0, left: 0, right: 0 },

  // ---- 狀態 ------------------------------------------------------------
  cfg: null, level: null,
  levelNum: 0, scores: [],
  player: null, enemies: [], collectibles: [], projectiles: [], particles: [], floats: [],
  integrity: 100, score: 0, waveTimer: 0, essay: [],
  invuln: 0, hitStop: 0, shake: 0, flash: 0, animFrame: 0, animT: 0,
  enemyTimer: 0, collectTimer: 0, phase: 'play',
  cutscene: { list: [], i: 0, cb: null },
  last: 0,

  // ---- 啟動 ------------------------------------------------------------
  async init() {
    const [cfgOk] = await Promise.all([ConfigParser.load(), AssetLoader.loadAll()]);
    this.cfg = {
      global: ConfigParser.global(),
      player: ConfigParser.player(),
      enemies: ConfigParser.enemies().filter(e => e.enabled),
    };

    // ★ 診斷：設定是空的時候直接講清楚原因，不要讓使用者對著一片黑畫面猜。
    if (!cfgOk || !this.cfg.enemies.length) {
      const why = !cfgOk
        ? 'config.js 載入失敗'
        : 'config.js 內沒有任何啟用中的 [ENEMY_*] 區塊';
      console.warn('[Game] ' + why + '，以內建預設值繼續');
      UI.fatal(why,
        '請確認 <code>config.js</code> 與本頁在同一個資料夾，且內容格式正確。' +
        '若你改過設定檔，存檔後重新整理頁面即可。');
    }

    this.resize();
    Music.init();
    UI.setLoading('準備完成');
    await new Promise(r => setTimeout(r, 220));
    this.playCutscene(['cutIntro1', 'cutIntro2', 'cutIntro3', 'cutIntro4'], () => UI.showScreen('title'));
  },

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.W = window.innerWidth; this.H = window.innerHeight;
    const cv = document.getElementById('game-canvas');
    cv.width = Math.round(this.W * dpr); cv.height = Math.round(this.H * dpr);
    cv.style.width = this.W + 'px'; cv.style.height = this.H + 'px';
    cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    this.computeArena();
  },

  // 競技場範圍要避開頂部 HUD 與底部論文面板
  computeArena() {
    const panel = document.getElementById('essay-panel');
    const essayH = panel ? panel.offsetHeight : 110;
    this.arena = { top: 82, bottom: this.H - essayH - 18, left: 24, right: this.W - 24 };
  },

  // ---- 過場動畫 --------------------------------------------------------
  playCutscene(keys, done) {
    this.cutscene = { list: keys.filter(k => AssetLoader.ready(k)), i: 0, cb: done };
    if (!this.cutscene.list.length) { this.cutscene.cb && this.cutscene.cb(); return; }
    UI.showScreen('cutscene');
    this.drawCutscene();
  },

  drawCutscene() {
    const cv = document.getElementById('game-canvas');
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#05050c'; ctx.fillRect(0, 0, this.W, this.H);
    const im = AssetLoader.get(this.cutscene.list[this.cutscene.i]);
    if (im) {
      const s = Math.min(this.W / im.naturalWidth, this.H / im.naturalHeight);
      const w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.drawImage(im, (this.W - w) / 2, (this.H - h) / 2, w, h);
    }
    UI.setCutsceneCounter(this.cutscene.i + 1, this.cutscene.list.length);
  },

  advanceCutscene() {
    Music.sfxClick();
    this.cutscene.i++;
    if (this.cutscene.i >= this.cutscene.list.length) {
      const cb = this.cutscene.cb; this.cutscene.cb = null;
      cb && cb();
    } else this.drawCutscene();
  },

  // ---- 流程 ------------------------------------------------------------
  startGame() {
    Music.sfxClick();
    this.scores = [];
    Music.resume();
    this.gotoLevel(1);
  },

  gotoLevel(n) {
    this.levelNum = n;
    const lv = ConfigParser.level(n);
    this.playCutscene(this.cutKey(lv.preCutscene), () => this.launchArena(lv));
  },

  // 過場鍵名 → 素材鍵名；空字串代表這關沒有過場
  // 設定檔用 level1_pre / level2_post 這種命名，AssetLoader 用 cutL1Pre / cutL2Post。
  // 直接拼字串會得到 cutLevel1_pre，與候選表永遠對不上（過場就一次都播不出來）。
  cutKey(name) {
    if (!name) return [];
    const m = /^level(\d)_(pre|post)$/.exec(name);
    if (m) return [`cutL${m[1]}${m[2] === 'pre' ? 'Pre' : 'Post'}`];
    return ['cut' + name.charAt(0).toUpperCase() + name.slice(1)];
  },

  // ---- 關卡開始 --------------------------------------------------------
  // ★ try/finally 是刻意的：requestAnimationFrame 一定要被啟動，
  //   無論 setupArena 丟不丟例外。舊版把「切畫面 → 準備場景 → 開迴圈」寫成一條
  //   直線，中間任何一步拋錯就會停在「HUD 已亮、canvas 維持過場塗的黑色」的狀態，
  //   使用者只會看到一片全黑，連錯誤訊息都看不到。現在最壞情況是空場景，
  //   而且錯誤會被記下來、顯示出來。
  launchArena(lv) {
    this.level = lv;
    this.state = 'arena'; this.phase = 'play';
    UI.showScreen('arena');
    try {
      this.setupArena(lv);
    } catch (e) {
      this.setupError = (e && e.message) || String(e);
      console.error('[Game] 關卡設定失敗，以可運作但內容不完整的場景繼續：', e);
      UI.fatal('關卡設定失敗：' + this.setupError);
    } finally {
      this.last = 0;
      requestAnimationFrame(t => this.loop(t));
    }
  },

  setupArena(lv) {
    this.resize();
    const c = this.cfg.player || { size: 18, moveSpeed: 3 };
    this.player = { x: (this.arena.left + this.arena.right) / 2, y: (this.arena.top + this.arena.bottom) / 2,
      tx: 0, ty: 0, r: c.size, speed: c.moveSpeed, trail: [], moving: false, hist: [] };

    this.enemies = []; this.projectiles = [];
    this.particles = []; this.floats = [];
    this.integrity = 100; this.score = 0; this.waveTimer = lv.timeLimit;
    this.invuln = 0; this.hitStop = 0; this.shake = 0; this.flash = 0;
    this.enemyTimer = lv.enemyRespawn;
    if (!Array.isArray(this.scores)) this.scores = [];
    this.scores[this.levelNum - 1] = { name: lv.assignmentName, score: 0, integrity: 100 };

    for (let i = 0; i < lv.enemyCount; i++) this.spawnEnemy();

    UI.updateHUD(this);
    UI.updateEssay(this.essay = []);
    Music.playMusic(lv.music);
  },

  // ---- 生成 ------------------------------------------------------------
  rand(list) {
    const pool = (list || []).filter(o => o && Number(o.weight) > 0);
    if (!pool.length) return null;                 // ★ 沒有可用的定義就回 null，不要回 undefined
    const total = pool.reduce((s, o) => s + o.weight, 0);
    let r = Math.random() * total;
    for (const o of pool) { if ((r -= o.weight) <= 0) return o; }
    return pool[0];
  },

  edgePoint() {
    const a = this.arena, t = Math.random();
    return { x: a.left + t * (a.right - a.left), y: a.top + t * (a.bottom - a.top) };
  },

  // ★ spawnEnemy / spawnCollectible 都必須容忍「定義清單是空的」。
  //   舊版在清單為空時會取到 undefined，接著讀 def.size 直接拋 TypeError；
  //   那個例外發生在 UI.showScreen('arena') 之後、requestAnimationFrame 之前，
  //   於是畫面停在「HUD 已亮、canvas 維持過場塗的黑色」—— 使用者只看到一片全黑。
  //   現在改成安全地跳過，寧可少一隻敵人也不要讓整個遊戲開不起來。
  spawnEnemy() {
    const def = this.rand(this.cfg.enemies);
    if (!def) return false;
    const p = this.edgePoint();
    this.enemies.push({
      def, x: p.x, y: p.y, r: def.size, wait: 1 + Math.random(),
      grow: 1, revealed: def.behavior !== 'disguise', fire: (def.fireInterval || 2) * (0.5 + Math.random()),
    });
    return true;
  },

  // ---- 主迴圈 ----------------------------------------------------------
  loop(ts) {
    if (this.state !== 'arena') return;
    requestAnimationFrame(t => this.loop(t));
    if (!this.last) this.last = ts;
    const dt = Math.min((ts - this.last) / 16.667, 3);   // dt = 幀數
    this.last = ts;
    const SEC = 1 / 60;

    this.animT += dt;
    if (this.animT / SEC * 10 >= 1) { this.animT = 0; this.animFrame++; }

    // 計時器與特效每幀都要推進，而且必須放在 update() 的定格閘門之外。
    // 若衰減寫在 update() 裡面，第一次受擊後 hitStop 永遠不會歸零，
    // update() 就永遠進不去，紅色閃爍會永久定格在畫面上（整個遊戲同時死鎖）。
    if (this.hitStop > 0) this.hitStop = Math.max(0, this.hitStop - dt);
    if (this.invuln > 0) this.invuln -= dt * 16.667;
    if (this.shake  > 0) this.shake  = Math.max(0, this.shake - dt * 0.45);
    if (this.flash  > 0) this.flash  = Math.max(0, this.flash - dt * 0.09);
    this.stepFx(dt, SEC);

    if (this.phase === 'play' && this.hitStop <= 0) this.update(dt, SEC);

    const s = this.shake > 0 ? this.shake : 0;
    const ctx = document.getElementById('game-canvas').getContext('2d');
    ctx.save();
    if (s) ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    this.draw(ctx);
    ctx.restore();
  },

  // ---- 邏輯更新 --------------------------------------------------------
  // 只負責 gameplay。計時器與特效的衰減在 loop() 內、update() 的閘門之前推進，
  // 這樣受擊定格只會凍結世界，不會連畫面效果一起凍結。
  update(dt, SEC) {
    // ★ setupArena 若在建立 player 之前就失敗，這裡必須安全地什麼都不做，
    //   否則例外會在 rAF 迴圈裡再拋一次，迴圈一死又變回黑畫面。
    if (!this.player) return;
    this.waveTimer -= dt * SEC;
    this.movePlayer(dt);
    this.updateEnemies(dt, SEC);
    this.updateProjectiles(dt, SEC);
    UI.updateHUD(this);

    if (this.waveTimer <= 0) this.endLevel();
    else if (this.integrity <= 0) this.endLevel();
  },

  movePlayer(dt) {
    const p = this.player;
    let dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
    if (d > 3) { p.x += dx / d * p.speed * dt; p.y += dy / d * p.speed * dt; p.moving = true; }
    else p.moving = false;
    p.x = Math.max(this.arena.left + p.r, Math.min(this.arena.right - p.r, p.x));
    p.y = Math.max(this.arena.top + p.r, Math.min(this.arena.bottom - p.r, p.y));
    p.trail.unshift({ x: p.x, y: p.y }); if (p.trail.length > 14) p.trail.pop();
    p.hist.unshift({ x: p.x, y: p.y }); if (p.hist.length > 40) p.hist.pop();
  },

  // ★ 敵人的行為分支 —— 這是整個 Stage 3 的核心
  updateEnemies(dt, SEC) {
    const a = this.arena, p = this.player, lv = this.level;
    for (const e of this.enemies) {
      if (e.wait > 0) { e.wait -= dt * SEC; continue; }
      const def = e.def;
      let dx = p.x - e.x, dy = p.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;

      const spd = def.speed * lv.enemySpeedMult;

      if (def.behavior === 'grow') {
        // AI BLOB：不碰它就持續變大
        e.grow = Math.min(def.growMax, e.grow + def.growRate * dt * SEC);
        e.r = def.size * e.grow;
        e.x += dx / dist * spd * dt; e.y += dy / dist * spd * dt;

      } else if (def.behavior === 'ranged') {
        // ESSAY MILL：維持中距離並射擊
        const want = 210;
        const dir = dist > want ? 1 : (dist < want * 0.7 ? -1 : 0);
        e.x += dx / dist * spd * dt * dir; e.y += dy / dist * spd * dt * dir;
        e.fire -= dt * SEC;
        if (e.fire <= 0) { e.fire = def.fireInterval; this.fireProjectile(e, def); }

      } else if (def.behavior === 'mirror') {
        // COLLUDE：跟隨玩家約 0.7 秒前的位置（像影子）
        const past = p.hist[Math.min(p.hist.length - 1, 42)] || p;
        const mdx = past.x - e.x, mdy = past.y - e.y, md = Math.hypot(mdx, mdy) || 1;
        e.x += mdx / md * spd * dt; e.y += mdy / md * spd * dt;

      } else if (def.behavior === 'disguise') {
        // FAKE SOURCE：近距離才現形
        if (!e.revealed && dist < def.disguiseDistance) {
          e.revealed = true;
          Music.sfxReveal();
          this.burst(e.x, e.y, def.color, 14, 3.4);
        }
        e.x += dx / dist * spd * dt; e.y += dy / dist * spd * dt;

      } else {
        // PLAGIARISM：直線追擊
        e.x += dx / dist * spd * dt; e.y += dy / dist * spd * dt;
      }

      e.x = Math.max(a.left, Math.min(a.right, e.x));
      e.y = Math.max(a.top, Math.min(a.bottom, e.y));
    }

    // 敵人碰到玩家
    if (this.invuln <= 0) {
      for (const e of this.enemies) {
        if (e.wait > 0) continue;
        if (Math.hypot(e.x - p.x, e.y - p.y) < e.r + p.r) { this.hurtPlayer(e); break; }
      }
    }

    this.enemyTimer -= dt * SEC;
    if (this.enemyTimer <= 0 && this.enemies.length < 14) { this.spawnEnemy(); this.enemyTimer = lv.enemyRespawn; }
  },

  fireProjectile(e, def) {
    const p = this.player, a = Math.atan2(p.y - e.y, p.x - e.x);
    this.projectiles.push({ x: e.x, y: e.y, vx: Math.cos(a) * def.projSpeed, vy: Math.sin(a) * def.projSpeed,
      dmg: def.projDamage, color: def.color, r: 9 });
    Music.sfxFire();
  },

  updateProjectiles(dt, SEC) {
    const p = this.player;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const b = this.projectiles[i];
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < this.arena.left || b.x > this.arena.right || b.y < this.arena.top || b.y > this.arena.bottom) {
        this.projectiles.splice(i, 1); continue;
      }
      if (this.invuln <= 0 && Math.hypot(b.x - p.x, b.y - p.y) < b.r + p.r) {
        this.projectiles.splice(i, 1);
        this.integrity = Math.max(0, this.integrity - b.dmg);
        this.invuln = this.cfg.player.invincibilityMs; this.hitStop = 4; this.shake = 10; this.flash = 0.24;
        this.burst(p.x, p.y, b.color, 12, 3.6);
        this.floats.push({ x: p.x, y: p.y - 30, text: '-' + b.dmg, color: '#ff5c5c', life: 1, vy: -1.5 });
        this.essay.push({ t: 'b', text: '[written for you]' });
        UI.updateEssay(this.essay);
        Music.sfxHit();
      }
    }
  },

  hurtPlayer(e) {
    const dmg = Math.round(e.def.damage * this.level.enemyDamageMult);
    this.integrity = Math.max(0, this.integrity - dmg);
    this.invuln = this.cfg.player.invincibilityMs; this.hitStop = 5; this.shake = 14; this.flash = 0.3;
    this.burst(this.player.x, this.player.y, e.def.color, 16, 4.2);
    this.floats.push({ x: this.player.x, y: this.player.y - 30, text: '-' + dmg, color: '#ff5c5c', life: 1, vy: -1.5 });
    // 論文被污染：違規標籤以刪除線形式加入（這就是「後果」的可見化）
    this.essay.push({ t: 'b', text: e.def.essayTag });
    UI.updateEssay(this.essay);
    Music.sfxHit();
  },

  stepFx(dt, SEC) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.93; p.vy *= 0.93;
      p.life -= dt * SEC * 1.7;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i];
      f.y += f.vy * dt; f.life -= dt * SEC * 0.9;
      if (f.life <= 0) this.floats.splice(i, 1);
    }
  },

  burst(x, y, color, n, spd) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, s = spd * (0.35 + Math.random() * 0.9);
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color, life: 1, size: 2 + Math.random() * 3 });
    }
  },

  // ---- 關卡結束（Stage 3 只有一張簡單的過場卡，沒有評分）------------
  // ★ 這裡必須把 state 一起改掉。loop() 的閘門是 state !== 'arena' 就 return，
  //   而舊版 endLevel() 只設 phase='clear'、state 仍是 'arena'，於是舊的 rAF
  //   迴圈永遠不會自己結束；下一關 launchArena() 又再開一條新的，累積成
  //   多條並行迴圈（實測每幀呼叫次數 61 → 110 → 132 → 244 次）。
  //   順帶用 phase 做冪等保護，避免多條迴圈在同一幀重複呼叫 endLevel()。
  endLevel() {
    if (this.phase === 'clear') return;
    this.phase = 'clear';
    this.state = 'clear';
    Music.stopMusic();
    if (!Array.isArray(this.scores) || !this.scores[this.levelNum - 1]) this.scores[this.levelNum - 1] = {};
    this.scores[this.levelNum - 1].score = this.score;
    this.scores[this.levelNum - 1].integrity = Math.round(this.integrity);
    if (this.levelNum >= 4) { Music.sfxLevelClear(); this.showComplete(); return; }
    Music.sfxLevelClear();
    UI.showClear(this.levelNum, this.level.assignmentName, ConfigParser.level(this.levelNum + 1).assignmentName, this.score);
  },

  nextLevel() { Music.sfxClick(); this.gotoLevel(this.levelNum + 1); },

  showComplete() {
    this.state = 'complete';
    UI.showScreen('complete');
    UI.renderComplete(this.scores, this.cfg.global.title);
  },

  // ---- 繪製 ------------------------------------------------------------
  draw(ctx) {
    ctx.clearRect(0, 0, this.W, this.H);
    this.drawBackground(ctx);
    this.drawEnemies(ctx);
    this.drawProjectiles(ctx);
    this.drawPlayer(ctx);
    this.drawParticles(ctx);
    this.drawFloats(ctx);
    if (this.flash > 0) { ctx.fillStyle = `rgba(255,60,60,${this.flash * 0.75})`; ctx.fillRect(0, 0, this.W, this.H); }
  },

  drawBackground(ctx) {
    const a = this.arena;
    const key = { 'bg_library.png': 'bgLibrary', 'bg_computer_lab.png': 'bgLab',
                  'bg_lecture.png': 'bgLecture', 'bg_cyberspace.png': 'bgCyberspace' }[this.level.backgroundImage];
    const im = key ? AssetLoader.get(key) : null;
    if (im) {
      const s = Math.max(a.right - a.left, a.bottom - a.top) / Math.max(im.naturalWidth, im.naturalHeight);
      const w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(im, (a.left + a.right) / 2 - w / 2, (a.top + a.bottom) / 2 - h / 2, w, h);
      ctx.globalAlpha = 1;
    } else {
      // 沒有背景圖時退回格線（沿用 Stage 2 的樣式）
      ctx.strokeStyle = 'rgba(74,158,255,0.05)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = a.left; x < a.right; x += 36) { ctx.moveTo(x, a.top); ctx.lineTo(x, a.bottom); }
      for (let y = a.top; y < a.bottom; y += 36) { ctx.moveTo(a.left, y); ctx.lineTo(a.right, y); }
      ctx.stroke();
    }
    // 暗角，讓 UI 與角色更突出
    const g = ctx.createRadialGradient(this.W / 2, this.H / 2, Math.min(this.W, this.H) * 0.32,
                                       this.W / 2, this.H / 2, Math.max(this.W, this.H) * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, this.W, this.H);
  },

  // 統一繪圖：有圖用圖，沒圖退回幾何圖形（缺圖不讓遊戲壞掉）
  sprite(ctx, im, x, y, d, color, r) {
    if (im && im.complete && im.naturalWidth) { ctx.drawImage(im, x - d / 2, y - d / 2, d, d); return; }
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  },

  // 敵人名牌：半透明深色底墊 + 領域色文字，確保疊在背景上仍可讀
  drawNameTag(ctx, x, y, text, color) {
    ctx.save();
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const w = ctx.measureText(text).width + 10;
    ctx.fillStyle = 'rgba(4,5,14,0.72)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - w / 2, y - 7, w, 14, 3);
    else ctx.rect(x - w / 2, y - 7, w, 14);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(text, x, y + 0.5);
    ctx.restore();
  },

  drawEnemies(ctx) {
    for (const e of this.enemies) {
      if (e.wait > 0) continue;
      const d = e.def;
      // 未現身的 FAKE SOURCE 偽裝成綠色合法來源
      const guise = (d.behavior === 'disguise' && !e.revealed);
      const col = guise ? '#22c55e' : d.color;
      if (guise) {
        ctx.fillStyle = 'rgba(34,197,94,0.22)';
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 10, 0, 6.283); ctx.fill();
      }
      this.sprite(ctx, AssetLoader.get(d.id), e.x, e.y, e.r * 2.4, col, e.r);
      if (guise) { ctx.strokeStyle = 'rgba(34,197,94,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 10, 0, 6.283); ctx.stroke(); }
      // Stage 3 的語意層：敵人常駐名牌。偽裝中不顯示 —— 偽裝本身就是機制，被命名就毀了。
      if (!guise && d.label) this.drawNameTag(ctx, e.x, e.y - e.r - 9, d.label, col);
    }
  },

  drawProjectiles(ctx) {
    for (const b of this.projectiles) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.moveTo(b.x + b.r, b.y);
      ctx.lineTo(b.x - b.r * 0.6, b.y - b.r * 0.7);
      ctx.lineTo(b.x - b.r * 0.6, b.y + b.r * 0.7);
      ctx.closePath(); ctx.fill();
    }
  },

  drawPlayer(ctx) {
    const p = this.player;
    if (!p) return;                                   // ★ setupArena 失敗時安全跳過
    const pc = this.cfg.player || { visualSize: 18 };
    (p.trail || []).forEach((t, i) => {
      ctx.fillStyle = `rgba(74,158,255,${(1 - i / 14) * 0.13})`;
      ctx.beginPath(); ctx.arc(t.x, t.y, p.r * (1 - i / 18), 0, 6.283); ctx.fill();
    });
    if (this.invuln > 0 && Math.floor(this.invuln / 60) % 2 === 1) return;
    const key = p.moving ? (this.animFrame % 2 ? 'move1' : 'move2') : 'idle';
    this.sprite(ctx, AssetLoader.get(key), p.x, p.y, pc.visualSize, '#4a9eff', p.r);
  },

  drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  drawFloats(ctx) {
    ctx.textAlign = 'center'; ctx.font = 'bold 15px ui-monospace, monospace';
    for (const f of this.floats) {
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  },
};
