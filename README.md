# eBird Dashboard

個人賞鳥歷史儀表板，手機優先、電腦響應式版面。以 eBird 官方分類名錄 v2026 統一統計歷史鳥種數、個體數及各地點回報。GitHub Pages 前端，Cloudflare Worker 同來源 API、D1 資料庫與 Cloudflare Access 驗證。

## 使用自己的資料

1. 登入自己的 eBird 帳號，到 https://ebird.org/downloadMyData 下載個人觀察 ZIP 或 CSV。
2. 開啟 Dashboard，選「匯入資料」→ 選擇 ZIP 或 CSV →「本機預覽」，資料在瀏覽器記憶體內解析，不會上傳到 GitHub 或任何 API；重新載入即清除預覽。
3. 若已部署自己的私人實例並成功連線 API，可選「同步至雲端」，將個人回報存入自己的 D1，供跨裝置查看。相同 Submission ID 更新原資料，不會重複新增。自動下載個人清單尚未實作。

eBird API key 可於 https://ebird.org/api/keygen 取得，主要用於官方 API 的鳥種、地點和公開觀察查詢；**不是個人歷史資料授權 token**。目前匯入不需要 eBird API key。Cloudflare Access 身分驗證與 eBird 帳號不同。不要把 eBird key、Access JWT、Cloudflare API token、個人 ZIP/CSV、私有紀錄或匯出備份加入 Git。

## 鳥種名稱

預設顯示 eBird 官方名稱。詳細清單可切換：

- eBird 官方名稱。
- eBirdScripts 簡稱＋自訂：內建 [公開簡稱表](https://github.com/ChrisTorng/eBirdScripts/blob/main/counter/aliases.mjs) 的代碼對照，自訂優先。
- 僅自訂簡稱：沒有自訂值則顯示官方名稱。

點每列「簡稱」設定，或在「管理簡稱」匯入／匯出 JSON，如 `{"aliases":{"spodov":"珠頸","litegr":"小白"}}`。也接受 eBirdScripts 備份中的 aliases 欄位，不匯入其他設定或個資。簡稱僅存在瀏覽器 localStorage，屬每裝置顯示偏好，不影響分類、計數或官方連結；跨裝置可自行匯出／匯入。

## 隱私與實例

此 Repo 公開的是程式碼與公開 taxonomy／簡稱表，不是維護者的個人資料。維護者的正式實例是個人用的單一使用者服務；Cloudflare Access 只允許所有者。D1 無多租戶隔離，**不可只新增其他使用者到 Access policy**，否則會共用資料庫。其他人應自行部署獨立實例，或本機預覽自己的資料，不需向維護者取得 token。若將來要共用同一實例，必須先實作依 Access 驗證身分隔離的所有查詢、寫入、歷史紀錄及匯入批次，不能相信客戶端自行提交的 user ID。不要將私有實例當公開 demo。

## Clone / 本機使用

需要 Git、Node.js 22 或更新版本：

```powershell
git clone https://github.com/ChrisTorng/eBirdDashboard.git
cd eBirdDashboard
npm install
npm test
npm run build
npx --yes http-server site -p 8080
```

開啟 http://localhost:8080，匯入自己的 ZIP/CSV 並選本機預覽。本機模式不需要 D1、Cloudflare 或 eBird token。

## 自行部署（供使用者及 AI agent）

1. Fork 或 clone 至自己的 GitHub Repo。不要操作本 Repo 的正式 Cloudflare 資源。
2. 在自己的 Cloudflare 帳號建立 D1（建議命名 ebird-dashboard），記錄 UUID。建立 Access self-hosted application，domain 為自己的網站（例如 birds.example.com），設定僅自己允許的身分與 720h application/policy session；記錄 application AUD 與 team domain。Global session 依自己帳號設定，勿修改別人的設定。
3. 將 `wrangler.example.jsonc` 複製成自己的 `wrangler.jsonc`，填入自己的 D1 UUID、網域、zone、ACCESS_AUD、ACCESS_ISSUER、APP_HOST。不可沿用原維護者的 wrangler.jsonc 資源 ID。
4. 先在本機測試 `npx wrangler d1 migrations apply DB --local`。全新自己的 D1 才執行 `npx wrangler d1 migrations apply DB --remote`，確認目標為自己的帳號與資料庫。執行 `npx wrangler deploy`。Worker 只接管同網域 /api/*；確認 workers.dev 與 preview URLs 停用。Cloudflare API token 只在本機環境或自己的 GitHub Secret 設定，不放前端。
5. 修改 site/CNAME 為自己的網域。GitHub Settings → Pages → Source: GitHub Actions，設定 custom domain。建立 DNS CNAME 指向自己的 username.github.io，先 DNS only 等待 GitHub 驗證與 HTTPS，再開啟 Cloudflare Proxy。使用 Full (strict) TLS。確認 Access 攔截未登入請求、Worker 拒絕無效 JWT、直接 GitHub Pages 路徑只含公開程式碼；API 回應不可公開快取。
6. GHA 自動建置與發布前端；UI 修改不重新部署 Worker，不執行 D1 migration。Worker 或 schema 有變更才分開發布；既有資料庫先備份，禁止重跑已套用 migration。首次匯入個人 ZIP 由已登入的本人執行。核查同一份資料二次匯入沒有重複、手機及電腦介面及 Access 存取。

AI agent：先讀 README、wrangler.example.jsonc、worker/migrations 和測試；唯讀核對資源是否存在再建立，明確區分使用者自己的資源與原維護者資源。不要要求使用者貼 token 到對話，使用已連線且有最小權限的 GitHub/Cloudflare 外掛或本機 CLI。若外掛不支援設定操作，先查兩個 GitHub 外掛的能力，再明確說明缺少的功能與必要手動步驟。驗證 Actions 實際結果，勿將 commit 成功等同部署成功。

## 分類與限制

使用 eBird 官方 v2026 taxonomy，依精確學名、官方 category 和 REPORT_AS 歸併；保留原始名稱、taxon code、Taxon Concept ID（若提供），未對應分類不猜測。年度更新後應重新取得 eBird 已校正的完整歷史匯出，再執行明確版本遷移，避免混合版本。舊分類更新會保存至 checklist_history。X 不計入已知個體數，同日不同清單保持獨立。尚無自動同步、多人租戶及離線持久化。

官方來源：https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=csv&locale=zh
分類更新：https://www.birds.cornell.edu/clementschecklist/introduction/updateindex/october-2026/
