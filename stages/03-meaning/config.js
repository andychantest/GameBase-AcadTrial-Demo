// config.js — 03-meaning
// 這是本階段唯一的設定來源（取代原本的 config.txt）。
// 之所以從純文字檔改成 .js，是因為 Chrome 拒絕 fetch() 讀取 file:// 資源，
//   而 <script src> 不受此限制 —— 改完之後本頁可以直接雙擊 HTML 開啟。
// 要修改設定：直接編輯本檔，存檔後重新整理頁面即可。
//
// 結構為原始的 [區段] / key-value 對應，尚未經過 config-parser.js 的
// enemies() / level() / global() / player() 轉換 —— 那部分維持原樣不動。
window.ACADEMIC_TRIAL_CONFIG = {
  "GLOBAL": {
    "game_title": "The Academic Trial",
    "subtitle": "Academic Integrity Quest",
    "time_zone": "GMT+8"
  },
  "PLAYER": {
    "move_speed": 3.0,
    "size": 26,
    "visual_size": 80,
    "invincibility_ms": 800
  },
  "LEVEL_1": {
    "assignment_name": "First Assignment",
    "time_limit": 35,
    "enemy_count": 3,
    "enemy_speed_mult": 0.9,
    "enemy_damage_mult": 0.8,
    "enemy_respawn_seconds": 15,
    "collectible_spawn_seconds": 5,
    "background_image": "bg_library.png",
    "background_music": "library",
    "pre_cutscene": "level1_pre",
    "post_cutscene": "level1_post"
  },
  "LEVEL_2": {
    "assignment_name": "Research Paper",
    "time_limit": 40,
    "enemy_count": 4,
    "enemy_speed_mult": 1.0,
    "enemy_damage_mult": 1.0,
    "enemy_respawn_seconds": 10,
    "collectible_spawn_seconds": 4,
    "background_image": "bg_computer_lab.png",
    "background_music": "lab",
    "pre_cutscene": "",
    "post_cutscene": "level2_post"
  },
  "LEVEL_3": {
    "assignment_name": "Group Project",
    "time_limit": 45,
    "enemy_count": 5,
    "enemy_speed_mult": 1.0,
    "enemy_damage_mult": 1.0,
    "enemy_respawn_seconds": 7,
    "collectible_spawn_seconds": 3,
    "background_image": "bg_lecture.png",
    "background_music": "study",
    "pre_cutscene": "",
    "post_cutscene": ""
  },
  "LEVEL_4": {
    "assignment_name": "Final Year Project",
    "time_limit": 50,
    "enemy_count": 6,
    "enemy_speed_mult": 1.1,
    "enemy_damage_mult": 1.0,
    "enemy_respawn_seconds": 5,
    "collectible_spawn_seconds": 3,
    "background_image": "bg_cyberspace.png",
    "background_music": "epic",
    "pre_cutscene": "level4_pre",
    "post_cutscene": "level4_post"
  },
  "ENEMY_PLAGIARISM": {
    "enabled": true,
    "label": "PLAGIARISM",
    "behavior": "chase",
    "color": "#e24b4b",
    "speed": 1.9,
    "damage": 30,
    "size": 26,
    "spawn_weight": 3,
    "essay_tag": "[copied another student's work]",
    "note": "直接追你 —— 因為抄襲永遠在追著原著的影子跑。"
  },
  "ENEMY_AIBLOB": {
    "enabled": true,
    "label": "AI BLOB",
    "behavior": "grow",
    "color": "#a855f7",
    "speed": 1.2,
    "damage": 20,
    "size": 22,
    "spawn_weight": 3,
    "grow_rate": 0.02,
    "grow_max": 2.4,
    "essay_tag": "[AI content, undisclosed]",
    "note": "起步很小，你不理它它就一直膨脹 —— AI 內容就是這樣取代真實寫作的。"
  },
  "ENEMY_ESSAYMILL": {
    "enabled": true,
    "label": "ESSAY MILL",
    "behavior": "ranged",
    "color": "#f97316",
    "speed": 1.7,
    "damage": 50,
    "size": 22,
    "spawn_weight": 2,
    "fire_interval": 3.0,
    "projectile_speed": 2.5,
    "projectile_damage": 10,
    "essay_tag": "[paid someone to write it]",
    "note": "唯一會遠程攻擊的敵人 —— 捷徑最誘人，代價最慘重。"
  },
  "ENEMY_FAKESOURCE": {
    "enabled": true,
    "label": "FAKE SOURCE",
    "behavior": "disguise",
    "color": "#eab308",
    "speed": 1.6,
    "damage": 12,
    "size": 20,
    "spawn_weight": 2,
    "disguise_distance": 90,
    "essay_tag": "[cited a source that doesn't exist]",
    "note": "遠看就是綠色的合法來源，走近才露出馬腳 —— 假引用需要你去查。"
  },
  "ENEMY_COLLUDE": {
    "enabled": false,
    "label": "COLLUDE",
    "behavior": "mirror",
    "color": "#06b6d4",
    "speed": 1.6,
    "damage": 21,
    "size": 20,
    "spawn_weight": 2,
    "essay_tag": "[submitted the same work as a partner]",
    "note": "會照著你走 —— 和別人共同提交同一份作業。"
  },
  "COLLECTIBLE_JOURNAL": {
    "enabled": true,
    "label": "Journal Article",
    "color": "#22c55e",
    "size": 15,
    "points": 3,
    "essay_text": "Smith et al. (2024) confirm that academic integrity builds long-term trust in scholarship..."
  },
  "COLLECTIBLE_BOOK": {
    "enabled": true,
    "label": "Academic Book",
    "color": "#3b82f6",
    "size": 14,
    "points": 2,
    "essay_text": "As documented in peer-reviewed academic literature..."
  },
  "COLLECTIBLE_DATA": {
    "enabled": true,
    "label": "Verified Data",
    "color": "#f5c842",
    "size": 13,
    "points": 2,
    "essay_text": "The 2023 national survey data clearly demonstrates..."
  },
  "COLLECTIBLE_EXPERT": {
    "enabled": true,
    "label": "Expert Quote",
    "color": "#a78bfa",
    "size": 13,
    "points": 2,
    "essay_text": "Professor Lee (2024) noted in a verified interview that..."
  }
};
