// config.js — 04-learning
// 這是本階段唯一的設定來源（取代原本的 config.txt）。
// 之所以從純文字檔改成 .js，是因為 Chrome 拒絕 fetch() 讀取 file:// 資源，
//   而 <script src> 不受此限制 —— 改完之後本頁可以直接雙擊 HTML 開啟。
// 要修改設定：直接編輯本檔，存檔後重新整理頁面即可。
//
// 結構為原始的 [區段] / key-value 對應，尚未經過 config-parser.js 的
// enemies() / level() / global() / player() 轉換 —— 那部分維持原樣不動。
window.ACADEMIC_TRIAL_CONFIG = {
  "DEBUG": {
    "debug_mode": false
  },
  "GLOBAL": {
    "game_title": "The Academic Trial",
    "language": "en",
    "show_fps": false,
    "timezone": "GMT+8",
    "auto_report_download": false,
    "completion_message": "Congratulations! You have completed all 4 levels!",
    "font_size_player": 10,
    "font_size_enemy": 10,
    "font_size_collectible": 10,
    "collectible_size": 30,
    "collectible_move_speed": 1.2,
    "collectible_life_seconds": 20
  },
  "PLAYER": {
    "move_speed": 3.0,
    "size": 30,
    "visual_size": 80,
    "invincibility_ms": 800,
    "enable_student": true,
    "enable_teacher": false,
    "enable_admin": false
  },
  "ANIMATION": {
    "animation_fps": 10
  },
  "LEVEL_1": {
    "assignment_name": "First Assignment",
    "time_limit": 35,
    "enemy_count": 3,
    "enemy_speed_multiplier": 0.9,
    "enemy_damage_multiplier": 0.8,
    "enemy_respawn_seconds": 15,
    "collectible_spawn_seconds": 5,
    "fake_source_rate": 0.7,
    "background_image": "bg_library.png",
    "background_music": "bgm_tense.mp3",
    "level_description": "You have no skills yet. Face the threats with nothing but instinct.",
    "result_message_low": "Without any knowledge, threats overwhelm you. This is how it feels unprepared.",
    "result_message_high": "Impressive! Even without skills you managed to survive."
  },
  "LEVEL_2": {
    "assignment_name": "Research Paper",
    "time_limit": 40,
    "enemy_count": 4,
    "enemy_speed_multiplier": 1.0,
    "enemy_damage_multiplier": 1.0,
    "enemy_respawn_seconds": 10,
    "collectible_spawn_seconds": 4,
    "fake_source_rate": 0.55,
    "background_image": "bg_computer_lab.png",
    "background_music": "bgm_study.mp3",
    "level_description": "You learned Proper Citation. Watch how knowledge protects you.",
    "result_message_low": "Keep practising your citation skills. Every source needs a proper reference.",
    "result_message_high": "Your citation skills made a real difference to your grade!"
  },
  "LEVEL_3": {
    "assignment_name": "Group Project",
    "time_limit": 45,
    "enemy_count": 5,
    "enemy_speed_multiplier": 1.0,
    "enemy_damage_multiplier": 1.0,
    "enemy_respawn_seconds": 7,
    "collectible_spawn_seconds": 3,
    "fake_source_rate": 0.45,
    "background_image": "bg_lecture.png",
    "background_music": "bgm_study.mp3",
    "level_description": "Two skills unlocked! Use Plagiarism Awareness to slow down cheaters and Ethical Work to block essay factories!",
    "result_message_low": "Stay away from threats! Know what behaviors constitute academic misconduct.",
    "result_message_high": "Excellent! You navigated group work integrity with confidence."
  },
  "LEVEL_4": {
    "assignment_name": "Final Year Project (FYP)",
    "time_limit": 50,
    "enemy_count": 6,
    "enemy_speed_multiplier": 1.1,
    "enemy_damage_multiplier": 1.0,
    "enemy_respawn_seconds": 5,
    "collectible_spawn_seconds": 3,
    "fake_source_rate": 0.4,
    "background_image": "bg_cyberspace.png",
    "background_music": "bgm_epic.mp3",
    "level_description": "All four skills active. This is your graduation challenge. Face every threat.",
    "result_message_low": "Review your skills and try again. The FYP is your ultimate test.",
    "result_message_high": "Outstanding! You completed your Final Year Project with full integrity!"
  },
  "ENEMY_PLAGIARISM": {
    "enabled": true,
    "label": "PLAGIARISM",
    "color": "#e24b4b",
    "speed": 1.1,
    "damage": 30,
    "size": 30,
    "spawn_weight": 3,
    "violation_type": "PLAGIARISM",
    "what": "Submits another student's work word-for-word as their own.",
    "why": "Denies the original author credit and gives an unfair grade advantage.",
    "consequence": "Zero grade + formal misconduct hearing on academic record."
  },
  "ENEMY_AIBLOB": {
    "enabled": true,
    "label": "AI BLOB",
    "color": "#a855f7",
    "speed": 0.65,
    "damage": 20,
    "size": 30,
    "spawn_weight": 3,
    "grow_rate": 0.015,
    "grow_rate_level_1": 0.008,
    "grow_rate_level_2": 0.01,
    "grow_rate_level_3": 0.012,
    "grow_rate_level_4": 0.015,
    "violation_type": "UNDISCLOSED AI USE",
    "what": "Submits AI-generated text without disclosure or critical thinking.",
    "why": "Misrepresents your own ability and bypasses genuine learning.",
    "consequence": "Work rejected. Integrity record flagged. Possible suspension."
  },
  "ENEMY_ESSAYMILL": {
    "enabled": true,
    "label": "ESSAY MILL",
    "color": "#f97316",
    "speed": 0.95,
    "damage": 50,
    "size": 30,
    "spawn_weight": 2,
    "violation_type": "CONTRACT CHEATING",
    "what": "A paid service that writes your academic work (essays, research papers, dissertations, etc.) for you.",
    "why": "Someone else is earning your qualification. This is academic fraud.",
    "consequence": "Expulsion. Illegal in many countries. Degree can be revoked.",
    "projectile_interval": 3,
    "projectile_speed": 2.5,
    "projectile_damage": 10
  },
  "ENEMY_FAKESOURCE": {
    "enabled": true,
    "label": "FAKE SOURCE",
    "color": "#eab308",
    "speed": 0.8,
    "damage": 12,
    "size": 30,
    "spawn_weight": 2,
    "disguise_distance": 90,
    "violation_type": "FAKE CITATION",
    "what": "A fabricated or unreliable source passed off as legitimate.",
    "why": "Undermines your argument and spreads misinformation.",
    "consequence": "Grade penalty. Resubmission required. Loss of credibility."
  },
  "ENEMY_COLLUDE": {
    "enabled": false,
    "label": "COLLUDE",
    "color": "#06b6d4",
    "speed": 0.85,
    "damage": 21,
    "size": 30,
    "spawn_weight": 2,
    "violation_type": "COLLUSION",
    "what": "Shares answers or submits the same work as another student.",
    "why": "Even if you helped a friend, both parties face the same consequences.",
    "consequence": "Both students receive zero. Misconduct noted for both."
  },
  "COLLECTIBLE_JOURNAL": {
    "enabled": true,
    "label": "Journal Article",
    "color": "#22c55e",
    "size": 13,
    "points": 3,
    "essay_text": "Smith et al. (2024) confirm that academic integrity builds long-term trust in scholarship..."
  },
  "COLLECTIBLE_BOOK": {
    "enabled": true,
    "label": "Academic Book",
    "color": "#3b82f6",
    "size": 12,
    "points": 2,
    "essay_text": "As documented in peer-reviewed academic literature..."
  },
  "COLLECTIBLE_DATA": {
    "enabled": true,
    "label": "Verified Data",
    "color": "#f5c842",
    "size": 11,
    "points": 2,
    "essay_text": "The 2023 national survey data clearly demonstrates..."
  },
  "COLLECTIBLE_EXPERT": {
    "enabled": true,
    "label": "Expert Quote",
    "color": "#a78bfa",
    "size": 11,
    "points": 2,
    "essay_text": "Professor Lee (2024) noted in a verified interview that..."
  },
  "SKILL_1": {
    "name": "Proper Citation",
    "unlock_level": 2,
    "effect_description": "Your collection range increases by 100%. A blue circle appears around you. Collectibles are magnetically absorbed into your collection zone!",
    "learn_text": "A citation tells readers where your ideas came from. Format: Author (Year). Title. Publisher. Without it, even honest work looks like plagiarism.",
    "effect_type": "collection_range",
    "effect_value": 3.0,
    "absorb_radius": 1.7
  },
  "SKILL_2": {
    "name": "Plagiarism Awareness",
    "unlock_level": 2,
    "effect_description": "Plagiarism enemies move 50% slower. You can see their movement patterns more clearly and have more time to avoid them!",
    "learn_text": "Plagiarism means using others' work as your own without proper attribution. It is a serious academic offense that can result in failing grade, suspension, or expulsion.",
    "effect_type": "slow_plagiarism",
    "effect_value": 0.5
  },
  "SKILL_3": {
    "name": "Ethical Work",
    "unlock_level": 2,
    "effect_description": "Creates a barrier to block Essay Mill \"paper\" projectiles! The barrier appears automatically when you have this skill.",
    "learn_text": "Using others' work as your own is academic fraud. Ethical work demonstrates your genuine learning and protects your qualification.",
    "effect_type": "barrier",
    "effect_value": 1
  },
  "SKILL_4": {
    "name": "Source Verification",
    "unlock_level": 2,
    "effect_description": "Fake Sources reveal their true identity with red warning flash when nearby. Reduces damage from Fake Sources by 50%. You can identify threats faster!",
    "learn_text": "Evaluate sources by: Is the author credentialled? Is the journal peer-reviewed? Is it recent enough? Is it directly relevant to your argument?",
    "effect_type": "reveal_all_fake",
    "effect_value": 0.5
  },
  "GRADING": {
    "integrity_weight": 0.4,
    "collectible_score_cap": 70,
    "grade_a_threshold": 80,
    "grade_b_threshold": 65,
    "grade_c_threshold": 50,
    "grade_d_threshold": 35,
    "low_grade_threshold": 55
  },
  "IMAGES": {
    "player_student": "player_student.png",
    "player_teacher": "player_teacher.png",
    "player_admin": "player_admin.png",
    "enemy_plagiarism": "enemy_plagiarism.png",
    "enemy_aiblob": "enemy_aiblob.png",
    "enemy_essaymill": "enemy_essaymill.png",
    "enemy_fakesource": "enemy_fakesource.png",
    "enemy_collude": "enemy_collude.png",
    "collectible_journal": "icon_journal.png",
    "collectible_book": "icon_book.png",
    "collectible_data": "icon_data.png",
    "collectible_expert": "icon_expert.png",
    "bg_library": "bg_library.png",
    "bg_computer_lab": "bg_computer_lab.png",
    "bg_lecture": "bg_lecture.png",
    "bg_cyberspace": "bg_cyberspace.png",
    "cutscene_intro_1": "cutscene_intro_1.png",
    "cutscene_intro_2": "cutscene_intro_2.png",
    "cutscene_angel": "cutscene_angel.png",
    "cutscene_devil": "cutscene_devil.png",
    "cutscene_graduation": "cutscene_graduation.png"
  }
};
