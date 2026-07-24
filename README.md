# Volleyball Hub

排球活動探索、報名、候補與主辦管理的**前端高擬真產品原型**。

- **線上網址**：https://russell06-web.github.io/volleyball-hub/
- **Figma**：https://www.figma.com/proto/MgsXCN04U1kAiGvaPLcjHg/Volleyball-Hub
- **技術限制詳細說明**：[docs/PRODUCT_LIMITATIONS.md](docs/PRODUCT_LIMITATIONS.md)

## 這是什麼

一個以 React + Vite 打造的純前端原型，示範一個排球活動平台從「探索活動」到「報名／候補」到「主辦方管理」的完整互動流程與產品設計思路。**沒有後端、沒有資料庫、沒有正式帳號系統**——所有資料都存在瀏覽器的 localStorage 裡，用來模擬「這個帳號的資料」，但實際上不是真的帳號。

## 技術棧

React 18・React Router・Vite・純 CSS（無 UI framework）・GitHub Pages（含 SPA fallback）・localStorage（模擬資料層）・Vitest（純邏輯單元測試）

## 開發

```bash
npm install
npm run dev       # 本機開發伺服器
npm run build     # 產出 dist/，並自動複製 404.html 供 GitHub Pages SPA fallback 使用
npm run preview   # 本機預覽 build 結果
npm run lint      # ESLint
npm run test      # Vitest（純邏輯函式單元測試）
```

`vite.config.js` 的 `base: '/volleyball-hub/'` 與 `App.jsx` 的 `BrowserRouter basename` 對應 GitHub Pages 的部署路徑，兩者需要保持一致。

## 目前已完成的功能（Phase 1 — 前端原型）

- 活動探索、**真正運作的搜尋**（標題／類型／場館／城市／地址／主辦方／程度／風格）、多維度篩選（類型／性別／技能程度／價格／城市）、排序（日期／價格／名額）
- 搜尋、篩選、排序與分類檢視（精選／臨打／全部）都同步到網址列（`?q=&type=&level=&city=&sort=&view=`），重新整理、上一頁、分享網址都能還原
- 依篩選條件產生的**條件比對**狀態說明（不是個人化推薦，見下方設計決策）：符合目前條件／部分條件符合／資訊需要確認
- 活動報名（個人／揪團，含防止重複報名／重複候補、隊伍人數上限驗證）、候補名單、取消與退款政策說明
- 主辦方可以**取消**已有人報名的活動（保留紀錄）或**刪除**沒有任何報名的示範活動——兩者都用自訂 dialog 確認，不使用瀏覽器原生 `window.confirm`
- 收藏活動、瀏覽歷史
- 主辦方活動管理儀表板、建立活動流程（含表單驗證）
- 加入行事曆（.ics 下載）
- Profile：個人資料編輯、活動偏好、隱私與資料說明、關於此原型、技術限制、重置示範資料
- 統一的 Toast 提示（收藏／報名／候補／取消／建立活動／取消活動／分享失敗），不使用 `alert()`
- localStorage 資料具備版本化 migration（`vh-storage-version`），舊格式資料會自動轉換或安全地回退到種子資料，不會白畫面

## 語言功能的 MVP 決策

這個原型目前沒有真正的多語系字典，所以移除了先前的「選擇語言」開頭畫面：`/` 直接導向 `/explore`，Profile 只顯示「繁體中文」文字說明。讓使用者選了 English／日本語卻看到整頁中文介面，比完全不提供這個選項更容易誤導人。完整的 i18n（含真正翻譯每個主要頁面）列在下方 Future Roadmap。

## Future Roadmap

**Phase 1（已完成）** — 活動探索、搜尋、篩選、收藏、報名、候補與活動管理的前端原型。

**Phase 2** — 正式帳號系統、會員登入、主辦方角色、跨裝置資料同步、真正的多語系介面（English／日本語，含完整翻譯字典，而不是只記住語言偏好）。

**Phase 3** — 線上付款、退款、交易紀錄、推播與 Email 通知服務。

**Phase 4** — 主辦方身分驗證、內容審核、檢舉機制、客服與平台治理。

## 設計決策：為什麼付款、交易與帳號安全功能沒有出現在介面上

這個專案原本規劃過付款方式管理、交易紀錄、密碼變更、雙重驗證等頁面。後來評估後決定**主動把這些入口從產品介面移除**，原因是：

1. 目前這個原型沒有後端、沒有身分驗證、也沒有金流——任何「已付款」「交易成功」「帳號安全等級」之類的畫面都只會是沒有資料支撐的假狀態，容易誤導使用者以為這是一個可以真的付款、真的登入的服務。
2. 保留一堆點下去只會顯示「規劃中」的入口，看起來像是功能列表很長，但實際上會讓一個作品集案例的完成度顯得失控、範圍不清楚。
3. 這些功能沒有消失——它們被記錄在上面的 Roadmap 與 [docs/PRODUCT_LIMITATIONS.md](docs/PRODUCT_LIMITATIONS.md) 裡，說明正式產品需要哪些能力才能讓這些功能真正成立。

這是一個範圍控制與產品優先級的取捨，不是「來不及做」——把 MVP 邊界畫清楚，比塞滿看起來很多但按下去沒反應的按鈕，更能反映真實的產品判斷。
