# AEE Practice App — 部署說明

## 專案結構
```
aee-practice/
├── netlify.toml                    # Netlify 設定
├── package.json                    # 套件清單
├── public/
│   └── index.html                  # 前端介面
└── netlify/functions/
    ├── transcript.mjs              # YouTube 字幕抓取
    └── chat.mjs                    # Claude AI 對話
```

## 部署步驟

### 1. 上傳到 GitHub
1. 在 GitHub 建立新 repo（例如 `aee-practice`）
2. 把這個資料夾的所有檔案上傳進去

### 2. 部署到 Netlify
1. 登入 netlify.com
2. 點「Add new site」→「Import an existing project」
3. 選 GitHub → 選你的 repo
4. Build settings 保持預設（netlify.toml 已設好）
5. 點「Deploy site」

### 3. 設定環境變數（最重要！）
在 Netlify 後台：
- Site settings → Environment variables → Add variable
- Key: `ANTHROPIC_API_KEY`
- Value: 你的 API Key（從 console.anthropic.com 取得）

### 4. 加到手機主畫面
- iPhone：用 Safari 開啟你的 Netlify 網址 → 分享 → 加入主畫面
- Android：用 Chrome 開啟 → 選單 → 加到主畫面

## 使用方法
1. 貼上任何一集 All Ears English 的 YouTube 網址
2. 選擇你要扮演的角色（Lindsay 或 Aubrey）
3. 點「開始練習」，App 自動抓字幕
4. 按麥克風說話 → 確認 → 傳送
5. AI 用語音回覆，同時給你即時回饋
6. 練習紀錄自動存在「紀錄」頁面

## 注意事項
- 語音輸入在 Chrome（桌機）最穩定
- iOS Safari 語音輸入需要允許麥克風權限
- 部分 AEE 影片可能沒有英文字幕，建議選有 ✨ 標記的集數
