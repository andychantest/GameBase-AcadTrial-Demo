======================================================
AUDIO FOLDER — 音效資料夾
======================================================

目前此資料夾是「空的」，這與原始專案的狀態一致。

game.js 的 AudioManager 會依 config.txt 的檔名設定，
到下列位置尋找音檔；找不到就靜默略過，遊戲照常運作。

  audio/music/   ← 關卡背景音樂
                  設定檔對應名稱：
                    bgm_tense.mp3   （LEVEL_1 圖書館）
                    bgm_study.mp3   （LEVEL_2 電腦室 / LEVEL_3 講堂）
                    bgm_epic.mp3    （LEVEL_4 網路空間）

  audio/sfx/     ← 音效
                  AudioManager 內建對應名稱：
                    collect / hit / level_complete / grade_a /
                    grade_f / graduation ...

【重要】若要放音檔，瀏覽器對「本地檔」有安全限制，
建議用本機伺服器開啟：
    python -m http.server 8080
再連到 http://localhost:8080/stages/04-learning/

【Demo 備註】
此資料夾在 Demo Game 內為「教學示範」用途。
實際研究數據請勿透過本 Demo 副本蒐集
（Google Analytics 已於 Demo 副本移除）。
