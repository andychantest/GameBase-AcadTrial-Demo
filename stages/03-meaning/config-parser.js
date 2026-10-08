// config-parser.js — Stage 3
// 從 config.js 取得設定並轉成可直接使用的物件。
//
// config.js 以 <script src> 載入（而非原本的 fetch('config.txt')），
// 因為 Chrome 拒絕用 fetch 讀取 file:// 資源（「URL scheme "file" is not supported」），
// 而 <script src> 不受此限制。改成這樣之後，本頁可以直接雙擊 HTML 開啟。
//
// ★ 設定沒載到時「開得起來」不等於「玩得了」：沒有 [ENEMY_*] 定義時，
//   spawnEnemy() 取不到任何東西，舊版會整個崩在關卡開始階段而變成黑畫面。
//   現在 spawn 那邊有防護，Game.init() 也會把原因顯示在畫面上。

const ConfigParser = {
  _raw: {},

  load() {
    const data = window.ACADEMIC_TRIAL_CONFIG;
    if (!data || typeof data !== 'object') {
      console.warn('[Config] window.ACADEMIC_TRIAL_CONFIG 不存在，config.js 是否有載入？');
      this._raw = {};
      return false;
    }
    this._raw = data;
    console.log('[Config] loaded sections:', Object.keys(this._raw).join(', '));
    return true;
  },

  get(section, key, fallback) {
    const s = this._raw[section];
    if (s && s[key] !== undefined) return s[key];
    return fallback;
  },

  /** 把所有 [ENEMY_*] 區段轉成陣列，依 spawn_weight 加權挑選用 */
  enemies() {
    return Object.keys(this._raw)
      .filter(k => k.startsWith('ENEMY_'))
      .map(k => {
        const e = this._raw[k];
        return {
          id: k.replace('ENEMY_', '').toLowerCase(),
          enabled: e.enabled !== false,
          label: e.label || k,
          behavior: e.behavior || 'chase',
          color: e.color || '#e24b4b',
          speed: Number(e.speed) || 1.5,
          damage: Number(e.damage) || 20,
          size: Number(e.size) || 24,
          weight: Number(e.spawn_weight) || 1,
          growRate: Number(e.grow_rate) || 0,
          growMax: Number(e.grow_max) || 2,
          fireInterval: Number(e.fire_interval) || 3,
          projSpeed: Number(e.projectile_speed) || 2.5,
          projDamage: Number(e.projectile_damage) || 10,
          disguiseDistance: Number(e.disguise_distance) || 90,
          essayTag: e.essay_tag || '',
          note: e.note || '',
        };
      });
  },

  /** 把所有 [COLLECTIBLE_*] 區段轉成陣列 */
  collectibles() {
    return Object.keys(this._raw)
      .filter(k => k.startsWith('COLLECTIBLE_'))
      .map(k => {
        const c = this._raw[k];
        return {
          id: k.replace('COLLECTIBLE_', '').toLowerCase(),
          enabled: c.enabled !== false,
          label: c.label || k,
          color: c.color || '#22c55e',
          size: Number(c.size) || 14,
          points: Number(c.points) || 2,
          essayText: c.essay_text || '',
        };
      });
  },

  level(n) {
    const l = this._raw['LEVEL_' + n] || {};
    return {
      assignmentName: l.assignment_name || 'Assignment ' + n,
      timeLimit: Number(l.time_limit) || 35,
      enemyCount: Number(l.enemy_count) || 3,
      enemySpeedMult: Number(l.enemy_speed_mult) || 1,
      enemyDamageMult: Number(l.enemy_damage_mult) || 1,
      enemyRespawn: Number(l.enemy_respawn_seconds) || 10,
      collectibleSpawn: Number(l.collectible_spawn_seconds) || 5,
      backgroundImage: l.background_image || '',
      music: l.background_music || '',
      preCutscene: l.pre_cutscene || '',
      postCutscene: l.post_cutscene || '',
    };
  },

  global() {
    const g = this._raw['GLOBAL'] || {};
    return {
      title: g.game_title || 'The Academic Trial',
      subtitle: g.subtitle || '',
      timeZone: g.time_zone || 'GMT+8',
    };
  },

  player() {
    const p = this._raw['PLAYER'] || {};
    return {
      moveSpeed: Number(p.move_speed) || 3,
      size: Number(p.size) || 26,
      visualSize: Number(p.visual_size) || 80,
      invincibilityMs: Number(p.invincibility_ms) || 800,
    };
  },
};
