# Demo Game — 專案文件

**專案名稱**：Demo Game（The Academic Trial 開發演示）
**建立日期**：2026-09-28
**版本**：v0.6
**位置**：`C:\Dropbox\Opencode\Academic Trial GProject\Demo Game\`

---

## 1. 專案概述

### 1.1 用途

`Demo Game` 是一個**教學用展示網站**，目的是把 Academic Trial 這個學術誠素遊戲的開發過程拆成四個可操作的階段，讓教學者與學習者能「看見設計如何一層一層堆疊」，而不只是看最終成品。

它不是新遊戲，也不是 V21 的分支。原始專案 `academic-trial-V21` 全程未被修改，本目錄所有內容都是獨立副本或全新建置。

### 1.2 目標使用者

| 使用者 | 需求 |
|---|---|
| 學習者 | 理解「一個教育遊戲的設計是分層堆疊的」，並在遊玩中理解學術誠信的行為隱喻 |
| 教學者 | 有課堂可展示的版本切換器，能逐階段講解「為什麼要加這個」 |
| 專案維護者 | 保有 V21 原始程式碼的完整對照組 |

### 1.3 設計主張

整個展示圍繞一句命題：**遊戲機制本身就是教材**（*The mechanics ARE the lesson*）。

對應的四個敵人行為即為四種學術違規的物理隱喻：

| 敵人 | 行為 | 隱喻 |
|---|---|---|
| PLAGIARISM | `chase` 直線追擊 | 抄錄者一路跟著你的作業 |
| AI BLOB | `grow` 忽視就膨脹 | AI 生成的內容產量爆炸 |
| ESSAY MILL | `ranged` 遠程射擊 | 代寫工廠大量供應 |
| FAKE SOURCE | `disguise` 偽裝成來源 | 假引用必須先被拆穿才會現形 |
| COLLUDE | `mirror` 跟著你 | 互相配合掩護（設定中預設停用） |

### 1.4 技術棧

- 純前端，無建置步驟、無框架、無 npm 依賴
- HTML5 Canvas 2D
- 原生 ES2020 JavaScript（`class`、optional chaining、`async/await`）
- WebAudio API 即時合成音效（Stage 1/2/3 皆無音檔）
- Google Fonts：`Bricolage Grotesque` / `JetBrains Mono` / `Spectral`
- 切換器使用 `<iframe>` 隔離各階段的執行環境
- 本機驗證使用 Playwright（Python）＋ Chromium

---

## 2. 專案結構

```
Demo Game/
├── index.html                    切換器（唯一入口，頂部 tabs + iframe + 成長曲線）
├── projectdocument.md            本文件
├── stages/
│   ├── 01-core-loop/
│   │   └── index.html            187 行，單檔，零資產、零可見文字
│   ├── 02-game-feel/
│   │   ├── index.html            377 行，單檔
│   │   └── img/                  11 張精簡 sprite（3.1 MB）
│   ├── 03-meaning/               1,133 行，7 個檔案
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── config.js             純資料設定（關卡／角色／敵人），<script> 載入
│   │   ├── config-parser.js
│   │   ├── asset-loader.js       候選檔名逐一套試，命中即停
│   │   ├── audio.js              程序化 BGM + SFX
│   │   ├── game.js               核心玩法與四種敵人行為
│   │   └── images/               27 張（22.0 MB）
│   └── 04-learning/              3,762 行 = 原始 V21 完整副本
│       ├── index.html            （僅此處有兩處刻意偏差，見 3.5 節）
│       ├── game.js               1,745 行，未改動
│       ├── style.css
│       ├── config-parser.js
│       ├── asset-loader.js
│       ├── config.js
│       ├── images/               27 張（22.2 MB）
│       ├── audio/{music,sfx}/    空資料夾 + README.txt
│       └── shake-preview.html
└── backups/
    └── demogame-v0.4_20260929/   本版完整備份 + VERSION_NOTES.txt
```

總計 85 個檔案、約 47.5 MB。

> **v0.4 移除 `history/`**：原第 5 個分頁「真實開發史」提供 v05／v10／v17 三個
> 早期版本讓觀眾載入遊玩，等於把舊程式碼攤給觀眾看，且佔專案 43% 體積（60 檔／36.21 MB，
> 其中 39 張 PNG 就佔 36.1 MB）。現已整包移除，專案由 145 檔／83.7 MB 瘦身为
> 85 檔／47.5 MB。切換器同步改為 4 個分頁。

---

## 3. 核心功能說明

### 3.1 切換器（`index.html`）

- **頂部版本列**（`.topbar`）：左側為品牌標記，右側為 4 個階段按鈕（Stage 01–04），每個按鈕顯示編號、名稱與實測行數
- 右側策展標籤顯示：階段名稱、引言、本階段新增了什麼、為什麼要加、教學意義、**刻意沒有什麼**、規模統計
- 底部成長曲線使用**實測行數**（含素材）：`187 → 377 → 1,133 → 3,762`
- 每個階段一個強調色，透過 CSS 變數 `--accent` 切換：骨白 `#e8eaed` / 琥珀 `#f5c842` / 紫 `#a855f7` / 綠 `#22c55e`
- 雙語切換（`EN` / `中文`）
- 鍵盤：`1`–`4` 切換階段、`F` 全螢幕
- 狀態需要本機伺服器的階段（03、04）會顯示提示列
- 860px 以下頂部版本列改為橫向捲動，並隱藏行數與成長曲線

### 3.2 Stage 1 — Core Loop

**規則**：游標控制藍色圓球（半徑 14、速度 3）；三顆紅球（半徑 11、速度 1.7）自邊界生成並直線追擊；撐過 30 秒即勝。

- 純幾何圖形，**零可見文字、零圖片、零音效、零劇情、零分數**
- 被撞到 → 玩家回到中心、獲得無敵時間、紅色閃爍；計時不中斷
- 撐滿 30 秒 → 點擊畫面重新開始
- 教學目的：讓學習者只知道「怎麼活下來」，永遠不知道紅球代表什麼

**邊界情況**：`dt` 以 60fps 為基準（`FRAME_SEC = 1/60`）換算，視窗縮放與掉幀不影響倒數準確度。已於 Playwright 驗證 rAF 60.5 fps 時，遊戲時鐘與真實時間比值 1.007。

### 3.3 Stage 2 — Game Feel

**追逐行為本身不變**，但與手感一起來的是「後果」：

- 11 張 sprite，含 10fps 兩幀走路循環（以 `naturalWidth` 推算幀寬，不假設方形）
- **新增失敗條件**：生命條歸零即結束（Stage 1 沒有失敗）
- 四種敵人，**速度與傷害各不相同**（1.4–2.0 / 12–50），並設 7 隻上限
- **每個敵人帶一圈「威脅環」**：顏色只代表危險度（`#f5c842` 低 / `#f97316` 中 / `#ef4444` 高），
  刻意用「空心環」與收集物的「實心光暈」做形狀區隔；角落附 LOW/MED/HIGH 圖例
- 粒子爆發、震屏（帶衰減）、受擊定格（hit-stop）、紅色傷害數字、移動殘影、無敵閃爍
- 收集物採集計分、**生命條**（`LIFE`）
- WebAudio 即時合成音效，`M` 鍵靜音
- 教學目的：把「回饋設計」的價值 isolation 出來；同時示範呈現與意義可以分開設計

> **領域詞彙隔離（設計約束）**：Stage 2 **不得**出現任何學術誠信詞彙。
> 生命條刻意命名為 `LIFE` 而非 `INTEGRITY`，圖例只用 LOW/MED/HIGH 嚴重度字眼，
> 不寫敵人名稱。嚴重度屬於機制層；身分屬於 Stage 3。
> （內部變數 `integrity` 保留原名，但它從不顯示給玩家。）

### 3.4 Stage 3 — Meaning

> **畫面分層注意（易踩坑）**：`#game-canvas` 的 `z-index` 是 `auto`(=0)，`.screen` 覆蓋層在其上。
> 過場圖與競技場都是畫在 canvas 上的，所以對應的覆蓋層 **必須背景透明**
> （`.cutscene-screen` 與 `.screen.pass`）。若填上不透明色（例如 `#05050c`），
> canvas 會被整片蓋掉，使用者只看到一片全黑。黑色底應由 `drawCutscene()`
> 自己在 canvas 上填。V21 原本的 `.screen` 沒有 `background` 屬性，所以正式版無此問題。
>
> **「HUD 有字、但畫面全黑」是本階段最典型的故障徵兆**。
> `drawCutscene()` 會先用 `ctx.fillStyle='#05050c'` 把整片 canvas 塗成不透明黑，
> 而 `launchArena()` 是「先 `UI.showScreen('arena')` 讓 HUD（含亮琥珀色的
> `#hud-assign`）亮起來，最後一行才 `requestAnimationFrame`」。
> 因此這兩者之間任何一行丟例外，畫面就停在「HUD 已亮、canvas 維持過場塗的黑色」——
> 使用者只看到一片全黑，連錯誤訊息都拿不到。修法見下方 3.4.1。

#### 3.4.1 黑屏防護（v0.3  加入）

| 措施 | 位置 | 作用 |
|---|---|---|
| `try/finally` 包住整個場景設定 | `game.js` `launchArena()` | `requestAnimationFrame` **一定**被啟動，無論設定是否拋錯 |
| `rand()` 空清單回傳 `null`（原本回傳 `undefined`） | `game.js` `rand()` | 直接堵住 `undefined.size` |
| `spawnEnemy()` / `spawnCollectible()` 對空定義清單安全跳過 | `game.js` | 沒有 `[ENEMY_*]` 定義時寧可少一隻敵人，也不要讓整個遊戲開不起來 |
| `update()` / `drawPlayer()` 檢查 `this.player` | `game.js` | `finally` 保證迴圈會跑，必須容忍 player 尚未建立 |
| `this.cfg.player \|\| { size, moveSpeed, visualSize }` 預設值 | `game.js` | 設定缺失時不拋錯 |
| `endLevel()` 補上 `this.state = 'clear'` | `game.js` | **修掉並行 rAF 迴圈累積**（見下方） |
| 畫面顯示載入失敗原因 | `index.html` `UI.fatal()` + `style.css` `#fatal-banner` | 不再只有 `console.warn`；使用者看得到原因與解法 |

> **並行 rAF 迴圈（v0.3 修正的真 bug）**：
> `loop()` 的閘門是 `if (this.state !== 'arena') return;`，
> 而舊版 `endLevel()` 只設 `phase='clear'`、`state` 仍是 `'arena'`，
> 於是舊迴圈永遠不會自己結束；下一關 `launchArena()` 又再開一條新的。
> 實測每幀 `loop()` 呼叫次數 **61 → 110 → 132 → 244 次**（正常應約 60）。
> 修正後實測 **60 → 62 → 62 → 62**，不再隨關卡累積。
> `endLevel()` 另加 `if (this.phase === 'clear') return;` 冪等保護。

**從零建置**（不是 V21 隱藏功能），多檔架構：

- 可點擊的過場動畫 → 標題畫面 → 競技場（**無角色選擇**）
- **Stage 3 刻意沒有任何角色**。命名先於能力：「那是什麼」在這裡教完，
  「我能做什麼」整個留給 Stage 4 的技能選擇。
  - 原始設計曾有 STUDENT / TEACHER / ADMIN 三選一，但 TEACHER 有偵測環、ADMIN 有減速光環，
    等於在 Stage 3 就提前交出能力選擇，會稀釋 Stage 4 的份量，故已移除
- **敵人常駐名牌**（`Game.drawNameTag()`）：每隻敵人頭上有小字名牌 + 半透明底墊
  - 來源為 `config.js` 的 `label`，經 `ConfigParser.enemies()` 傳出
  - **偽裝中的 FAKE SOURCE 不畫名牌**（`behavior === 'disguise' && !revealed`）——
    偽裝本身就是機制，一被命名就失效
- 四關（library / lab / office / library），各有一張背景與一份作業
- 四種敵人行為全部實作並驗證：`chase` / `grow` / `ranged` / `disguise`
- 論文面板隨遊玩即時填入 `g`（合法引用）與 `b`（違規）兩類來源
- 過場卡**不顯示等第**
- 程序化 BGM，無音檔

**刻意不包含**：hover tooltip、技能卡、技能效果、評分公式、結算畫面、反思問題、CSV 匯出、Google Analytics、登入。

**錯誤處理**：`AssetLoader` 對每個 key 逐一套試候選檔名，命中即停止；缺圖時自動退回幾何圖形繪製，不中斷遊戲。

**定格的正確做法（重要）**：受擊定格（hit-stop）只能凍結**世界**，不能凍結畫面效果。`hitStop`／`invuln`／`shake`／`flash` 四個計時器與 `stepFx()` 必須在主迴圈中、於 `update()` 的定格閘門**之外**每幀推進；`update()` 只負責 gameplay。

若把衰減寫在 `update()` 裡面，會形成死鎖：`hitStop` 從 5 開始卻永遠不會歸零，導致 `update()` 永遠進不去，`flash` 永久停在 0.5，畫面整片泛紅且整個遊戲凍結。

**過場鍵名對映**：`config.js` 用 `level1_pre` 這種命名，`AssetLoader` 用 `cutL1Pre` 這種命名，兩者不能直接拼字串（會得到 `cutLevel1_pre`，永遠對不上）。`cutKey()` 以 regex `/^level(\d)_(pre|post)$/` 轉換：

| config.js | AssetLoader key | 素材檔 |
|---|---|---|
| `level1_pre` | `cutL1Pre` | `story_level1_pre.png` |
| `level1_post` | `cutL1Post` | `story_level1_post.png` |
| `level2_post` | `cutL2Post` | `story_level2_post.png` |
| `level4_pre` | `cutL4Pre` | `story_level4_pre.png` |
| `level4_post` | `cutL4Post` | `story_level4_post.png` |
| （畢業） | `cutGraduation` | `story_graduation.png` |

`images/cutscenes/` 沒有 `story_level2_pre.png`，因此 `[LEVEL_2] pre_cutscene` 留空。

### 3.5 Stage 4 — Learning

原始 `academic-trial-V21` 的完整副本。**`game.js` 一行邏輯都沒有改動。**

相對 V21 共有**兩處**刻意偏差，僅存在於本副本：

| # | 偏差 | 位置 | 理由 |
|---|---|---|---|
| 1 | 移除 Google Analytics 的 `<script>` 區塊 | `index.html`、`shake-preview.html` | 示範環境不應把資料送到外部服務。`game.js` 內的 `gtag()` 呼叫保留，因其位於 `try/catch` 內 |
| 2 | 登入欄位預填 `Demo Student` / `demo@student.university.edu`，並加一行說明提示 | `index.html` | V21 開機後直接進 LOGIN 閘門（`game.js:173`），強制填 Name + Email 才能 `showRoleSelect()`，留空會跳 `alert()`。課堂展示時這是阻礙 |

偏差 2 的影響範圍經驗證為零：`game.js` 未動，登入驗證（清空欄位仍會跳 `alert('Please enter both name and email.')` 並停在 `screen-login`）、`record` 記錄與 CSV 匯出全部照常運作。使用者仍可自行修改或清空欄位。

**已知現象（刻意保留）**：V21 原始 `asset-loader.js` 會平行嘗試所有候選路徑，因此載入時會產生 39 個 404 請求。這是原版行為，為了讓 Stage 4 保持逐行忠實而**不予修正**，並可作為「原始碼 vs 清理後示範碼」的對照教材（Stage 3 的 loader 為逐一套試、0 個 404）。

### 3.6 真實開發史（v0.4 已移除）

原本此節描述切換器第 5 個分頁「真實開發史」：三份真實備份（v05／v10／v17）
加上指向 Stage 04 的 v21，讓觀眾在分頁內直接載入並遊玩早期版本。

**v0.4 已整個移除**（切換器分頁 + `history/` 資料夾 + 對應文案與成長圖表對照組）。
原因：對 demo 觀眾而言，展示舊程式碼沒有意義，且該頁佔專案 43% 體積
（60 檔／36.21 MB，其中 39 張 PNG 即佔 36.1 MB）、每次開啟還會產生大量 404。

原始備份**未被刪除**，仍保留於專案外部的來源目錄：
`C:\Dropbox\Opencode\Academic Trial GProject\Backup\Game File\`
（v05／v10／v17／v21 原始備份皆在該處，需要時可取回）

---

## 4. 設定與部署方式

### 4.1 本機執行

**四個階段全部可直接雙擊 `index.html` 以 `file://` 開啟，不需要任何本機伺服器。**

Stage 3、Stage 4 過去需要伺服器，因為它們用 `fetch('config.txt')` 讀取設定，而 Chrome 會直接拒絕
`fetch()` 讀取 `file://` 資源（`URL scheme "file" is not supported`）。v0.5 起設定改由
`<script src="config.js">` 載入，而 `<script>` 不受此限制，於是四個階段在 `file://` 與 `http://`
下行為一致。全專案已無任何可執行的 `fetch()`／`XMLHttpRequest`／`import()`。

仍可選擇用本機伺服器（部署或除錯時較方便）：

```powershell
cd "C:\Dropbox\Opencode\Academic Trial GProject\Demo Game"
python -m http.server 8080
```

開啟 `http://localhost:8080/`

**`file://` 下的唯一差異**：瀏覽器把每個檔案視為獨立來源（origin 為 `null`），父頁面無法對
`iframe` 內的遊戲派發鍵盤事件。因此在切換器尚未點入遊戲前按空白鍵／Enter 不會推進過場 —— 切換器
會顯示提示「點一下遊戲區，空白鍵／Enter 才會生效」（不阻擋點擊，2.6 秒後自動消失）。滑鼠點擊不受影響。

### 4.2 設定檔

Stage 3 與 Stage 4 的所有平衡數值集中在 `config.js`，由 `config-parser.js` 讀取
`window.ACADEMIC_TRIAL_CONFIG`。檔案是原始的區段／鍵值對應物件，尚未經過 `enemies()`、`level()`、
`global()`、`player()` 的轉換：

```
GLOBAL / PLAYER / LEVEL_1..4 / ENEMY_* / COLLECTIBLE_*
Stage 4 另有 DEBUG / ANIMATION / SKILL_1..4 / GRADING / IMAGES
```

修改 `config.js` 不需要動 `game.js`，存檔後重新整理頁面即可。

### 4.3 部署

純靜態網站，無後端。可部署至 Vercel、GitHub Pages 或任意靜態主機。部署前請注意：

1. `stages/04-learning/images/` 與 `stages/03-meaning/images/` 各約 22 MB，總量約 84 MB
2. 若要快取無效化，需更新 `index.html` 內的資源版本參數
3. 部署前必須確認 `git config user.email` 為有效 GitHub 帳號 email，否則 Vercel 會封鎖部署

---

## 4.1 快取版本號（Cache-Bust）

依 AGENTS.md 規定，前端 js/css 每次改動都必須更新版本號，否則使用者會拿到瀏覽器
快取裡的舊檔案 —— 這正是「程式已修好但畫面仍然黑掉」的常見原因。

| 位置 | 版本號 | 說明 |
|---|---|---|
| `stages/03-meaning/index.html` | `?v=20260929c` | style.css / config.js / config-parser.js / asset-loader.js / audio.js / game.js |
| `stages/04-learning/index.html` | `?v=20260929c` | style.css / config.js / config-parser.js / asset-loader.js / game.js |
| （v0.5 起無需） | — | 設定改由 `config.js` 的 `<script src>` 載入，不再 `fetch`，故無獨立快取參數 |
| 切換器 `index.html` | `BUILD = '20260929c'` | `bust()` 為 iframe src 附加版本號，避免載入舊的 stage index.html |

**維護規則**：同日再次改動任一前端檔案時，序號遞增（`20260929b`、`20260929c`…），
且四處（上表）必須同步更新。

---

## 5. 已知限制

1. **需要本機伺服器**：Stage 3／4／history 無法以 `file://` 開啟
2. **Stage 4 產生 404 噪音**：原始 V21 資產載入器行為，刻意未修。**完整玩到競技場共 41 個**
   （只在登入畫面載入時是 39 個，進競技場後多 2 個學生動畫幀）：
   - 1 × `backgrounds/bg_title.png`
   - 2 × `characters/player_admin.png`、`player_teacher.png`（已停用角色）
   - 2 × `characters/player_student_idle_2.png`、`player_student_move_3.png`（**僅進競技場才請求**）
   - 16 × `collectibles/collectible_{book,data,expert,journal}_{2..5}.png`
   - 4 × `cutscenes/story_{gameover,level2_pre,level3_pre,level3_post}.png`
   - 16 × `enemies/enemy_{aiblob,essaymill,fakesource,plagiarism}_{2..5}.png`
3. **~~history 的 v05 有 99 個 404~~（v0.4 已移除，history/ 整包刪除）**
4. **Stage 3 的 COLLUDE（mirror）預設停用**：程式碼已實作，但 `config.js` 中 `enabled: false`，未列入啟用關卡
5. **角色外觀未區分**：Stage 4 的單一 STUDENT 角色沿用 V21 的玩家 sprite（`playerRole` 僅影響速度與 sprite 路徑前綴）
6. **Stage 3 沒有過場的關卡**：Level 2 沒有前導過場、Level 3 完全沒有過場，因為 `images/cutscenes/` 沒有對應素材
7. **無單元測試**：驗證以 Playwright 煙霧測試為主，腳本存於暫存目錄，未納入版控

---

## 6. 修版紀錄

### v0.3 → v0.4（2026-09-29）

移除舊碼展示，並補上兩處影響「能不能玩」的缺口。

| # | 問題 | 根因 | 修法 |
|---|---|---|---|
| 1 | **切換器第 5 個分頁「真實開發史」等於把舊程式碼攤給觀眾看** | 該分頁讓觀眾直接載入並遊玩 v05／v10／v17 三個早期版本 | 刪除整個 `history/` 資料夾（60 檔／36.21 MB，其中 39 張 PNG 就佔 36.1 MB）與對應分頁。專案由 **145 檔／83.7 MB 瘦身为 85 檔／47.5 MB（-43%）** |
| 2 | 切換器仍有 history 殘留程式碼 | `isHistory` 散佈於 8 個區域 | 移除 history 的 `STAGES` 條目、`REAL` 常數、`PATH.history`、`loadHist()`、`historyPicker()`、`loadedHist`、鍵盤 `0`、`◆ ARCHIVE` 徽章；`show()` 的 `btn` 參數（移除後恆為 `null`）與孤立的 `--sh:#06b6d4` 一併清掉。`.tbtn` **保留**（鍵盤提示與語言按鈕仍在用） |
| 3 | **過場只能用滑鼠點擊推進，鍵盤無反應** | Stage 3／4 的 `keydown` 只綁 `M` 靜音，Stage 4 連 keydown 都沒有。提示雖寫「Click or tap to continue」，但按空白鍵／Enter 的使用者會什麼事都沒發生，容易誤判為當機 | 兩階段都加上空白鍵／Enter 推進過場，且**僅在 `screen-cutscene` 為 active 時生效**（避免吃掉競技場的空白鍵） |
| 4 | 文件與實際不符 | 文件寫 Stage 4 產生 39 個 404，但那只測到登入畫面 | 更正為 **41 個**（完整玩到競技場），並列出 41 個的完整清單與成因 |

**原始備份未被刪除**：v05／v10／v17／v21 仍保留於專案外部來源目錄
`C:\Dropbox\Opencode\Academic Trial GProject\Backup\Game File\`，需要時可取回。

**可玩性實測（v0.4，Playwright 真實輸入，非靜態檢查）**

| 階段 | 結果 |
|---|---|
| 01-core-loop | 畫面有內容；敵人生成；滑鼠→目標連線正常（tx 70→1130）；玩家追至 x=1053/1200（敵人碰撞推擠，未達 1130 屬正常）；動畫持續 3 秒；0 例外 |
| 02-game-feel | 同上（x=1065/1200）；威脅圖例已繪製；動畫持續；0 例外 |
| 03-meaning | 開場過場**空白鍵推進 4 次**→標題畫面（START 可見、內容 49.37%）→點 START→第 1 關→過場→競技場（敵人 3 隻）→**真實完整通關 4 關**（累計 25 秒）→`state=complete`、結算畫面顯示、0 致命橫幅、0 例外 |
| 04-learning | 登入→角色頁（僅 `role-student`）→選取→BEGIN ADVENTURE→過場（空白鍵）→技能選擇（未選時 Begin Level 停用＝防呆正確）→競技場（`Game.state='arena'`、內容 60.18%、HUD 計時 33s、Level 1/4）；0 例外 |

> 測試中三度誤判皆已釐清並記錄，避免日後重蹈：
> ① Stage 3 的 `state` 在過場期間維持 `loading`/`undefined` 屬設計（rAF 閘門正確停止），不是卡死。
> ② Stage 3 玩家**不能射擊**，是敵人射擊玩家；關卡靠撐到 `waveTimer` 歸零或 INTEGRITY 歸零結束。
> ③ `const Game = {...}` 是語彙全域綁定，**不會掛在 `window` 上**；必須用裸用 `Game`，`window.Game` 是 `undefined`。

### v0.2 → v0.3（2026-09-29）

修 Stage 3「HUD 亮著但畫面全黑」與兩個連帶的真 bug。

| # | 問題 | 根因 | 修法 |
|---|---|---|---|
| 1 | **進第一關後全黑，只有 "First Assignment" 可見** | `drawCutscene()` 先把 canvas 塗成不透明黑 `#05050c`；`launchArena()` 的順序是「先 `UI.showScreen('arena')`（HUD 亮起）→ 準備場景 → 最後 `requestAnimationFrame`」。因此 `spawnEnemy()` 若拋例外，畫面就停在「HUD 已亮、canvas 維持全黑」 | `launchArena()` 改用 `try/finally`，保證 `requestAnimationFrame` 一定被啟動；場景設定拆出 `setupArena()` |
| 2 | `rand()` 空清單回傳 `undefined`（連帶） | `return list[0]` 在空陣列時回 `undefined`，`spawnEnemy()` 接著讀 `def.size` 拋 `TypeError` —— 正是上面那個黑屏的實際觸發點 | 改為過濾後判空、空清單回傳 `null`；`spawnEnemy()` / `spawnCollectible()` 安全跳過 |
| 3 | `this.player` 為 null 時迴圈會再拋一次（連帶） | `finally` 保證迴圈會跑，而 `update()` / `drawPlayer()` 直接讀 `this.player` | `update()` 開頭 `if (!this.player) return;`；`drawPlayer()` 與 `this.cfg.player` 皆加防護 |
| 4 | **rAF 迴圈逐關累積**（實測 61→110→132→244 次/秒） | `loop()` 閘門是 `state !== 'arena'`，但 `endLevel()` 只設 `phase='clear'`、`state` 仍是 `'arena'`，舊迴圈永不結束；下一關 `launchArena()` 又開新的一條 | `endLevel()` 補 `this.state = 'clear'`，並加 `if (this.phase === 'clear') return;` 冪等保護。實測修正後 60→62→62→62 |
| 5 | **設定載入失敗完全無聲** | 只 `console.warn`，使用者只看到黑畫面，無從判斷原因 | 新增 `UI.fatal()` + `#fatal-banner`，直接在畫面頂端顯示原因與解法（含 `file://` 改用本機伺服器的說明） |
| 6 | 視窗在過場卡／結算畫面改變大小後，座標系沿用舊尺寸 | resize 守門只有 `state === 'arena'`，`clear` / `complete` 期間被忽略 | 守門改為 `['arena','clear','complete']` |
| 7 | 全部前端資源無快取版本號 | 改了程式但使用者仍拿到瀏覽器快取裡的舊檔案 | 依 AGENTS.md 補上 `?v=` 版本號：Stage 3／4 的 script/link、切換器 iframe src（新增 `BUILD` 與 `bust()`） |

### v0.1 → v0.1.1（2026-09-28）

修正三個使用者回報的問題，並順帶修正一個連帶 bug。

| # | 問題 | 根因 | 修法 |
|---|---|---|---|
| 1 | **Stage 3 畫面持續閃爍、整個遊戲凍結** | `game.js` 以 `this.hitStop <= 0` 當作 `update()` 的閘門，但 `hitStop` 在受擊時被設為 4／5 後**全檔沒有任何一行遞減它**。第一次受擊後 `update()` 永遠不再執行，而 `invuln`／`shake`／`flash` 的衰減都寫在 `update()` 裡面，紅色閃爍就此永久定格 | 將四個計時器與 `stepFx()` 移到 `loop()` 中、於定格閘門之外每幀推進；`update()` 只留 gameplay |
| 2 | **切換器缺少頂部階段按鈕** | 選擇器只存在於左側垂直欄 | 移除 `.rail`，改為頂部水平 `.tabs`；`.shell` 改為單欄 flex；860px 以下橫向捲動 |
| 3 | **Stage 4 無法進入** | V21 的 LOGIN 閘門強制填 Name + Email，留空跳 `alert()` | 副本內預填示範值 + 提示文字；`game.js` 未動，驗證邏輯完好 |
| 4 | Stage 3 每關過場從未播過（連帶） | `cutKey()` 產生 `cutLevel1_pre`，與 `AssetLoader` 的 `cutL1Pre` 永遠對不上；設定檔另有 `post_cutscene` 指錯、`pre_cutscene` 指到 post | `cutKey()` 改 regex 對映；修正設定檔的 LEVEL_1／LEVEL_2 |
| 5 | 切換器預設語言是英文，不是繁體中文 | 頁面初始化直接呼叫 `setLang()`，而 `setLang()` 內含 `lang = lang === 'zh-Hant' ? 'en' : 'zh-Hant'`，等於一載入就把預設值翻掉 | 拆成 `applyLang()`（只套用）與 `toggleLang()`（只切換）；初始化改呼叫 `applyLang()`，按鈕事件綁 `toggleLang()` |
| 6 | Stage 3 全黑，看不到過場圖，要盲點 4 次才能開始 | `drawCutscene()` 把過場圖畫在 `#game-canvas` 上，但 `.cutscene-screen` 同時設了不透明背景 `background: #05050c` 與 `z-index: 40`；canvas 的 `z-index` 是 `auto`(=0)，因此被整片蓋住。使用者只看得到右上角 `1 / 4` 與底部提示 | `.cutscene-screen` 改為 `background: transparent`。黑色底由 `drawCutscene()` 自己在 canvas 上填，視覺不變。對照：V21 原本的 `.screen` 沒有 `background` 屬性，所以正式版無此問題 |

**第 6 項的教訓**（已寫入 `style.css` 註解）：凡是「只負責接收點擊的覆蓋層」都必須保持背景透明。任何畫在 canvas 上的內容，都不能被 `.screen` 的背景蓋掉。目前只有 `#screen-cutscene` 與 `.screen.pass`（競技場）屬於這類；其餘 `.screen` 用 `rgba(3,4,12,0.88)` 半透明，且在那些狀態下 canvas 本來就沒在繪製，所以無害。

回歸驗證：連續受擊 3 次後 `hitStop` 歸零、`flash` 歸零、計時持續下降；四關過場對映全部命中已載入素材；Stage 1／2／3 與切換器維持 0 console error、0 4xx；Stage 3 於 rAF 60.4 fps 下遊戲時鐘比值 1.007；切換器載入時 `html[lang]="zh-Hant"`，切換語言後已載入的 Stage 4 不會被卸載。

**第 6 項的驗證方式**（值得記錄，日後同類 bug 可直接套用）：以「canvas 上的亮點像素數」對照「實際截圖的亮點像素數」判斷有沒有被遮擋。修前 canvas 707,286 vs 截圖 888（差 800 倍）；修後 intro 四張與 L1 pre／L2 post／L4 pre／L4 post／畢業共 9 張過場，canvas 與截圖差異皆小於 0.1%。

### v0.4 → v0.5（2026-09-29）

使用者回報兩件事：其一，「這個階段需要本機伺服器」那段提示不正確，因為雙擊 HTML 就能開；
其二，Stage 3 的遊戲區裡出現「Stage 3 只有『做完了』；沒有成績、沒有反思題、沒有報告匯出」這類
自我說明文字，不該放在遊戲區。兩件事都成立，理由如下。

| # | 問題 | 根因 | 修法 |
|---|---|---|---|
| 1 | Stage 3／4 無法以 `file://` 開啟 | 全專案僅 2 個 `fetch()`（兩階段的 `config-parser.js` 讀 `config.txt`），Chrome 直接拒絕 `fetch()` 讀取 `file://`（`URL scheme "file" is not supported`）。Stage 1／2 為單檔、無 fetch，所以雙擊可開 —— 造成「有些階段可以、有些不行」的落差 | 設定改由 `<script src="config.js">` 載入（`<script>` 不受此限制），刪除兩個 `config.txt`，`_parse()`／`_coerce()` 一併移除。全專案已無可執行的 `fetch()`／`XMLHttpRequest`／`import()` |
| 2 | 切換器的「需要本機伺服器」提示已失效 | 修好 #1 後四個階段都不再需要伺服器，該提示反而誤導 | 移除 `.server-note` 區塊、4 個 `needsServer` 旗標、對應 i18n 條目與 4 條 CSS；Stage 3 的 fatal 提示改為一般性的設定載入失敗說明 |
| 3 | 切換器在 `file://` 下按空白鍵丟 `SecurityError` | `file://` 下每個檔案都是獨立來源（origin `null`），父頁面碰不到 `iframe.contentWindow` | 以 `try/catch` 捕捉，顯示「點一下遊戲區，空白鍵／Enter 才會生效」提示；`.cover.tip` 設 `pointer-events:none` 故不阻擋點擊，2.6 秒後自動隱藏。`http://` 同源情境下轉送照常成功，不顯示提示 |
| 4 | Stage 3 遊戲區出現 demo 設計自述 | 3 個 `.stage-note`（標題、結算、完成各一）描述的是「這個 demo 刻意沒做什麼」，屬於教學註解而非遊戲內容，且側欄「刻意沒有」區塊早已涵蓋 | 刪除 3 個 `.stage-note` 與其 CSS；側欄 `absent` 補上「沒有等第與評語」，確保資訊未遺失 |
| 5 | 使用者可見文案仍指向已刪除的檔名 | Stage 3／4 載入畫面、Stage 4 登入頁與角色頁的說明文字仍寫 `config.txt` | 全部改為 `config.js` |

**設定檔轉換的驗證方式**：轉換以程式進行（非手寫 735 行），並沿用 `_coerce()` 的同一套型別規則
（`true`／`false` 必須是真正的 boolean，否則 `enabled !== false` 會把字串 `"false"` 判為 true）。
轉換後以 Node 載入 `config.js` 取回物件，與直接解析原 `config.txt` 的結果逐鍵比對：
Stage 3（15 區段／131 鍵）與 Stage 4（23 區段／214 鍵）皆**完全一致**。`config.js` 儲存的是原始區段
／鍵值對應，`enemies()`／`level()`／`global()`／`player()` 的轉換邏輯一行未動，行為零漂移。

**實測（Playwright 真實輸入）**

- `file://`：Stage 3 完整通關四關至 `state=complete`；Stage 4 登入 → 角色（僅 `student` 可見）→
  技能關（Level 1 無技能可選，Level 2 正確顯示 4 張技能卡）→ 競技場 `state=arena`；兩者 0 例外
- `file://` 切換器：4 分頁、圖表、鍵盤 `1-4`、按空白鍵 **0 個 SecurityError**、提示不阻擋點擊且自動隱藏
- `http://` 回歸：四階段皆正常載入，Stage 3 設定解析 4 敵、0 fatal；切換器同源轉送成功（不顯示提示）；
  Stage 1／2 畫布有內容且 0 個 4xx；Stage 4 的 39 個 4xx 為 V21 已知缺素材

**已知非本次引入的現象**（記錄以免日後誤判為回歸）

- Stage 4 全部 4 張技能的 `unlock_level` 皆為 2，因此 Level 1 的技能關本來就沒有卡片可選
- Stage 4 的 39 個 4xx 是 V21 素材缺口（敵人／道具第 2–5 幀、劇情圖、`player_teacher`／`player_admin`），
  與本次變更無關
- `file://` 下 Stage 4 會出現 canvas 被 `file://` 圖片污染的 CORS 警告，但全專案未使用
  `getImageData`／`toDataURL`／`toBlob`／`createImageBitmap`，沒有人讀回像素，功能無影響

---

### v0.5 → v0.6（2026-09-29）

使用者回報三件事：備份資料夾內容已刪（5 個空資料夾仍在，約省 341 MB）；
Stage 2 收集道具「一直閃」；遊戲內的「跳關」功能在哪。經排查與實測：

| # | 問題 | 根因 | 修法 |
|---|---|---|---|
| 1 | Stage 1/2/3 受擊時全屏紅閃在被敵人夾擊下「一直在閃」 | 受擊 `flash` 峰值偏高（0.55/0.5/0.5）且 Stage 1 **遊戲進行中完全無衰減**，Stage 2/3 衰減較慢（`dt*0.05`）。多敵同時壓迫時每 ~800ms 觸發一次紅洗，把道具顏色洗掉 → 視覺上「一直閃」 | 三階段**降強、降時**：Stage 1 `flash=0.55→0.3`、新增 running 分支衰減 `dt*0.09`；Stage 2 `flash=0.5→0.3`、`dt*0.05→0.09`；Stage 3 陷阱 `0.4→0.24`、敵擊 `0.5→0.3`、衰減 `*0.09`、渲染乘數 `*0.8→*0.75`。勝利白閃保持原樣。實測峰值紅透明度約砍半、持續時間約 1/3。 |
| 2 | Stage 2 收集道具本身並不閃爍 | 以 Playwright 每 250ms 取樣 8 秒，敵人清除後 40/40 幀全有像素；敵人存在時紅洗導致道具像素間歇性歸零。 | 不變（機制正常）；改善已透過 #1 的紅閃降低自然解決。 |
| 3 | 各階段缺乏「跳過此關」按鈕 | Stage 4 原有 `#btn-skip-level` 受 `config.debug.debugMode` 控制，預設關閉；Stage 1/2/3 完全無此功能 | 統一加入 URL 參數 `?skip=1` 機制：四階段各自在右上角新增隱藏小鈕（Stage 1/2 用 `⏭` 無文字保全 wordless 設計），Stage 3 掛在 `#mute-btn` 旁、Stage 4 沿用原鈕；`file://` 直接雙擊時可手動加參數，切換器新增「演示模式」勾選框自動附加 `&skip=1`。點擊行為：Stage 1 走勝利路徑、Stage 2 `finish(true)`、Stage 3 `Game.clearLevel()`、Stage 4 `Game.skipLevel()`（守衛改 `debugMode || DEMO_SKIP`）。 |
| 4 | 切換器快取版本號需同步 | AGENTS.md 強制規定：前端資源改動必須同步更新 `?v=` | 全專案（切換器 + 4 階段）`20260929c → 20260929d`；`BUILD` 常數與 `bust()` 函式同步。 |

**實測（Playwright 真實輸入，v0.6）**

- `file://`：四階段 `?skip=1` 皆顯示跳關鈕、點擊即跳過；一般模式（無參數）鈕隱藏。
- `file://` 切換器：勾選「演示模式」→ iframe 自動附加 `&skip=1` → 四分頁皆顯示跳關鈕。
- 紅閃峰值與時長驗證：Stage 2 受擊後取樣，紅透明度峰值 0.25（原 0.43），持續 ~55ms（原 ~170ms）；Stage 3 峰值 0.23（原 0.40）。
- 回歸：四階段 `file://` 無參數正常跑完、0 例外；`http://` 同源鍵盤轉送正常、不顯示提示；Stage 4 的 39 個 4xx 仍為 V21 已知缺素材。

---

## 6. 與原始專案的關係

- 原始專案：`C:\Dropbox\Opencode\Academic Trial GProject\academic-trial-V21`
- **原始專案為唯讀，本專案不得寫入該目錄**
- Stage 1–3 為全新撰寫；Stage 4 為 V21 的副本
- 設計參考來源：`C:\Dropbox\Opencode\Academic Trial GProject\History D\Documents\GDD\academic_trial_gdd_v2.docx`
