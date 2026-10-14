# 世界重點｜World News Daily (PWA)

一個可安裝到 Android 手機桌面的繁體中文國際重大新聞閱讀 App（PWA）。每日台灣時間 08:07、13:07、20:07 排程更新；08:07 可選擇透過 Telegram Bot 推送標題。新聞來源為多家公開 RSS，透過 OpenAI API 生成繁體中文、有原始來源連結的摘要。

**重要限制**：更新不是秒級即時，排程可能延遲。RSS 只有標題／摘要片段，不是完整新聞查核。顯示的時間是「刊登時間」，不保證是「事件發生時間」。此版本是公開可讀網站，不含帳號、付費牆或真正的原生 Android 通知功能。

## 最少需要什麼？

- GitHub 帳號（免費；GitHub Pages 免費版需使用公開 repository）
- [GitHub Desktop](https://desktop.github.com/)（不用打指令就能上傳專案）
- [OpenAI API Key](https://platform.openai.com/api-keys)（**ChatGPT Plus 不能抵扣 API 使用費**；要另開 API 計費）
- Android 手機和 Chrome 瀏覽器
- Telegram Bot（**選用**；沒設定仍可在手機點 App 看新聞）

## 1. 建立 GitHub Repository

1. 進入 https://github.com/new
2. Repository name 填 `world-news-daily`
3. Visibility 選 **Public**
4. 可以不勾 README（本專案已附）
5. 按 **Create repository**

## 2. 上傳程式

**圖形介面方式**：安裝 GitHub Desktop → File > Clone repository → 選 `world-news-daily` → Clone → 將本 ZIP 內的**全部內容**（包含隱藏的 `.github` 資料夾）複製到 clone 下來的資料夾 → GitHub Desktop 左下方填 Summary → Commit to main → Push origin。

**終端機方式**（已安裝 git 且 GitHub 已登入）：

```bash
git clone https://github.com/你的GitHub帳號/world-news-daily.git
cd world-news-daily
# 把 ZIP 解開的所有檔案（包括隱藏 .github 資料夾）複製到此資料夾
git add .
git commit -m "Initial world news app"
git push origin main
```

## 3. 設定 OpenAI API

1. 前往 https://platform.openai.com/api-keys 新增 API Key，並確認 API 帳號已完成必要的計費／預付設定。
2. GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
3. **Name**：`OPENAI_API_KEY`，**Secret**：貼上密鑰 → Add secret。
4. 原始碼已設成使用 `gpt-6-luna`，API 按實際 token 使用量收費。**不要把密鑰放進 GitHub 檔案、網頁 JavaScript、README 或聊天室。**

## 4. 開啟 GitHub Pages

1. Repo → **Settings** → **Pages**。
2. Build and deployment → **Source** 選 **GitHub Actions**。
3. 回到 repo → **Actions** → 左欄選「更新並發布國際重大新聞」。
4. 點 **Run workflow** → 選 main → **Run workflow**。
5. 等工作流程出現綠色勾勾。在 Settings → Pages 或 Actions 部署資訊找到網址；預設是：

   `https://你的GitHub帳號.github.io/world-news-daily/`

6. 若失敗，點紅叉開啟 log，看哪一步報錯。若 `Fetch, select, and summarize news` 失敗，可能 RSS 來源不通、OpenAI API Key 未設定／帳單未啟用、模型不可用或額度限制。若 `Deploy to Pages` 失敗，先確認 Pages Source 是否選了 **GitHub Actions**。

**免費且不設 API Key 也能測試**：第一次會顯示英文 RSS 標題，但不能當成繁中精選新聞使用。

## 5. 安裝到 Android 手機桌面

用 Android Chrome 開啟剛才的網址 → 右上角 **⋮** → **新增至主畫面** 或 **安裝應用程式**（顯示名稱可能不同）→ 確認。以後就像 App 一樣從桌面啟動。

## 6. 開啟 Telegram 每天推送（選用）

1. 用 Telegram 找 `@BotFather` → 傳送 `/newbot` → 按提示建立 Bot → 取得 Bot Token。
2. 打開你新建的 Bot → 按 **Start** 或傳送 `/start`。
3. 在**私人**瀏覽器頁面開啟 `https://api.telegram.org/bot你的BotToken/getUpdates`。在回傳 JSON 裡找 `message.chat.id`，那一串數字就是你的 Chat ID。**這個 URL 帶有金鑰，不要截圖分享，瀏覽器歷史也可能保留它。**
4. GitHub Settings → Secrets and variables → Actions 新增兩個 Secret：
   - `TELEGRAM_BOT_TOKEN`：Bot Token
   - `TELEGRAM_CHAT_ID`：剛查出的 Chat ID
5. 排程每天約 08:07（台灣時間）推播「8 則重點標題 + App 網址」。13:07、20:07 只更新 App，不再推播。

## 7. 更新頻率與安全

設定在 `.github/workflows/update-and-deploy.yml`：

```yaml
  schedule:
    - cron: '7 8 * * *'
      timezone: 'Asia/Taipei'
    - cron: '7 13 * * *'
      timezone: 'Asia/Taipei'
    - cron: '7 20 * * *'
      timezone: 'Asia/Taipei'
```

為避免 GitHub 在公開 repo 超過 60 天無活動時停用排程，程式會在每次成功更新後提交 `site/news.json`（產生 Git 提交紀錄）。仍建議定期檢查 Actions 是否執行、來源是否可用；提交更新不應被視為 100% 的排程保證。

## 專案結構

```text
.github/workflows/update-and-deploy.yml  # 定時更新、Telegram 早報、發佈 Pages
scripts/update_news.py                    # RSS 蒐集與 OpenAI 摘要
scripts/send_telegram.py                  # Telegram 推播
site/index.html                           # 手機新聞畫面
site/app.js                               # 載入新聞、分類、呈現來源
site/styles.css                           # RWD 版面
site/manifest.webmanifest                 # 安裝到手機桌面
site/sw.js                                # 離線快取
site/icons/                               # App 圖示
site/news.json                            # 最新新聞（自動生成）
requirements.txt
```

## 成本與版權

- GitHub Pages / Actions：符合其免費方案限制時可免費使用；流量、使用條款適用。
- OpenAI API：單獨按使用量計費，設定較小的專案月預算，並追蹤 API Usage。
- RSS：不同媒體來源各有內容與使用條款；請保留新聞原文連結，勿直接複製全文。若要商業公開上線，須重新確認授權與資料來源。
- 本專案無後端使用者身分驗證，GitHub Pages 的網址是**公開可讀**的。不要放任何個資或私密資料到 `site/news.json`。

## 驗證功能

- Actions 每日 3 次有成功紀錄？
- App 首頁顯示近期更新時間？
- 新聞摘要為繁體中文，無多篇同一事件重複？
- 每一則新聞都有可點擊的原始來源？
- 關閉網路後若曾載入過，會顯示部分已快取內容？
- Telegram 開啟後隔日早上有收到摘要？

> 系統只知道 RSS 中提供的部分資訊；若重大事件重要性、時間、事實未能由來源證實，應點原文查核。
