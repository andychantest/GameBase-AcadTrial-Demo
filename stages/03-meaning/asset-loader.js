// asset-loader.js — Stage 3
// 只做一件事：把圖片載進來，載不到就安靜地不要。
//
// 這是整個專案最重要的工程決策之一（沿用自 Stage 4 的正式版）：
// 「缺圖不應該讓遊戲壞掉」。
// 每個邏輯名稱對應一個「候選檔名清單」，依序嘗試，
// 全部失敗就回傳 null，遊戲改用程式畫的幾何圖形。
//
// 優化：並行載入不同 key（提升載入速度），候選檔名仍依序嘗試。

const AssetLoader = {
  _img: {},

  /** 邏輯名稱 → 候選檔名（依序嘗試第一個存在的） */
  candidates: {
    player:  ['player_student', 'player_student_1', 'player'],
    idle:    ['player_student_idle_1', 'player_student_idle', 'player_student'],
    move1:   ['player_student_move_1', 'player_student_move', 'player_student'],
    move2:   ['player_student_move_2', 'player_student_move_1', 'player_student'],
    plagiarism:  ['enemy_plagiarism_1', 'enemy_plagiarism', 'enemy_copycat_1'],
    aiblob:      ['enemy_aiblob_1', 'enemy_aiblob'],
    essaymill:   ['enemy_essaymill_1', 'enemy_essaymill'],
    fakesource:  ['enemy_fakesource_1', 'enemy_fakesource'],
    collude:     ['enemy_collude_1', 'enemy_collude'],
    journal: ['collectible_journal_1', 'collectible_journal', 'icon_journal'],
    book:    ['collectible_book_1', 'collectible_book', 'icon_book'],
    data:    ['collectible_data_1', 'collectible_data', 'icon_data'],
    expert:  ['collectible_expert_1', 'collectible_expert', 'icon_expert'],
    bgLibrary:     ['bg_library', 'background_library'],
    bgLab:         ['bg_computer_lab', 'bg_lab', 'background_lab'],
    bgLecture:     ['bg_lecture', 'background_lecture'],
    bgCyberspace:  ['bg_cyberspace', 'background_cyberspace'],
    cutIntro1: ['story_intro_1', 'cutscene_intro_1'],
    cutIntro2: ['story_intro_2', 'cutscene_intro_2'],
    cutIntro3: ['story_intro_3', 'cutscene_intro_3'],
    cutIntro4: ['story_intro_4', 'cutscene_intro_4'],
    cutL1Pre: ['story_level1_pre', 'level1_pre'],
    cutL1Post: ['story_level1_post', 'level1_post'],
    cutL2Post: ['story_level2_post', 'level2_post'],
    cutL4Pre: ['story_level4_pre', 'level4_pre'],
    cutL4Post: ['story_level4_post', 'level4_post'],
    cutGraduation: ['story_graduation', 'graduation'],
  },

  // 候選名 → 實際資料夾
  folders: {
    player: 'characters', idle: 'characters', move1: 'characters', move2: 'characters',
    journal: 'collectibles', book: 'collectibles', data: 'collectibles', expert: 'collectibles',
  },

  _load(path) {
    return new Promise(resolve => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => resolve(null);
      im.src = path;
    });
  },

  // 載入單個 key（依序嘗試候選檔名）
  async _loadKey(key) {
    const folder = this.folders[key]
      || (key.startsWith('bg') ? 'backgrounds' : key.startsWith('cut') ? 'cutscenes' : 'enemies');
    for (const name of this.candidates[key]) {
      const im = await this._load(`images/${folder}/${name}.png`);
      if (im) { this._img[key] = im; return; }
    }
  },

  async loadAll() {
    const keys = Object.keys(this.candidates);
    // 並行載入所有 key（大幅提升速度），候選檔名內部仍依序嘗試
    await Promise.all(keys.map(k => this._loadKey(k)));
    const missing = keys.filter(k => !this._img[k]);
    console.log(`[Assets] 載入 ${Object.keys(this._img).length}/${keys.length} 張` +
      (missing.length ? `；缺少（已改用幾何圖形）: ${missing.join(', ')}` : ''));
  },

  get(key) { return this._img[key] || null; },
  ready(key) { const im = this._img[key]; return !!(im && im.complete && im.naturalWidth); },
};