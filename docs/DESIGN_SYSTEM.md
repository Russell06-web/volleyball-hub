# Design System

這份文件記錄 Volleyball Hub 目前實際使用的視覺系統——所有 token 名稱、數值與規則都直接對應 `src/styles/*.css` 裡的程式碼，不是額外的規劃文件。改動樣式時，這裡應該跟著更新。

## Color Tokens

定義於 `src/styles/style.css` 的 `:root`。

### 品牌

| Token | 數值 | 用途 |
|---|---|---|
| `--brand-orange` | `#FF6B1A` | 主要 CTA、品牌重點、目前選取狀態 |
| `--brand-orange-hover` | `#E85A0C` | 橘色元件的 hover 狀態 |
| `--brand-orange-soft` | `#FFE7D6` | 橘色系淺色底（Featured 卡背景、active chip 底色） |
| `--ink-navy` | `#1A2E45` | 主要文字強調、導覽列、Hero 背景、按鈕（次要強調） |
| `--ink-navy-soft` | `#3A4E68` | 深藍 hover 狀態 |
| `--court-teal` | `#1E9E8C` | 比較功能識別色、位置需求圖表 |
| `--court-teal-dark` | `#167A6C` | 青綠系文字（在淺色底上） |
| `--court-teal-soft` | `#E4F5F3` | 青綠系淺色底 |
| `--accent-gold` | `#FFC145` | 星等評分、Hero 上的強調小字 |

### 介面與文字

| Token | 數值 | 用途 |
|---|---|---|
| `--background` | `#F6F5F2` | 頁面畫布（body 背景），暖白色，不是純白 |
| `--surface` | `#FFFFFF` | 卡片、Dialog、Sheet 本體 |
| `--surface-subtle` | `#FAF9F6` | 卡片內部的內縮區塊（meta box、input 底色） |
| `--text-primary` | `#2B2B2A` | 主要文字 |
| `--text-secondary` | `#68655F` | 次要文字、說明文字 |
| `--text-disabled` | `#918E88` | 停用狀態文字 |
| `--border-default` | `#E7E4DC` | 一般邊框 |
| `--border-strong` | `#CBC7BE` | 需要更明顯的邊框（目前保留供未來使用） |

### 狀態色（每個狀態在畫面上一定同時有文字或圖示，不單靠顏色）

| Token | 數值 | 用途 |
|---|---|---|
| `--success` / `--success-soft` | `#2E8B57` / `#E7F5E8` | 已完成、可個人報名等正向狀態 |
| `--warning` / `--warning-soft` | `#A56A00` / `#FFF3D6` | 需要確認、資訊未完整 |
| `--danger` / `--danger-hover` / `--danger-soft` | `#D9363E` / `#C62830` / `#FDEAEA` | 急徵、錯誤、取消、危險操作 |
| `--info` / `--info-soft` | `#2563A6` / `#E6F0FF` | 候補、一般提示 |

### 性別徽章（獨立於品牌色，避免「混合」跟「比較」共用同一個顏色語意）

`--gender-male` / `--gender-male-soft`、`--gender-female` / `--gender-female-soft`、`--gender-mixed` / `--gender-mixed-soft`。

### Focus ring

`--focus-ring:#1A2E45`——鍵盤焦點永遠是深藍，跟「目前選取」的橘色分開，避免兩種訊號混淆。`.toast`／`.compare-tray` 內部（深色底）改用白色 focus ring，否則深藍會看不見。

### 色彩使用比例

大致遵守：約 60% 白色／暖白（`--surface`／`--background`）、約 25% 深藍（結構、文字、導覽）、約 10% 橘色（CTA、強調）、約 5% 青綠／紅色／其他狀態色。橘色只出現在真正需要引導動作的地方（主要按鈕、目前選取、Featured 卡的淡色底），沒有任何一個 Tag／Badge 家族全部使用高彩度色。

## Typography

```css
--font-sans: -apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-md: 1rem;      /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.5rem;    /* 24px */
--text-2xl: 2rem;     /* 32px */
--text-display: clamp(2rem, 5vw, 3.75rem);
--font-regular: 400; --font-medium: 500; --font-semibold: 600; --font-bold: 700; --font-extrabold: 800;
```

這組 scale 是這次視覺整理新加入的共用 token；既有元件（卡片、Chip、表單等）原本就用得恰當的手調字級（例如 12.5px／13.5px）保留不動，避免為了套用新 scale 而重新調整所有既有版面間距。新建或大幅重寫的元件（Hero、Stepper、Featured 卡的強調文字）以這組 scale 為準。

排版規則：活動標題最多兩行（`-webkit-line-clamp:2`），超出以省略號處理；日期／價格／名額一律 `font-variant-numeric: tabular-nums`；場館名稱與地址允許正常換行，不強制單行截斷；手機上的主要資訊維持在 13–14px 以上。

## Spacing

```css
--space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px; --space-5: 20px;
--space-6: 24px; --space-8: 32px; --space-10: 40px; --space-12: 48px; --space-16: 64px;
```

同上，這是共用參考值；既有元件的間距沿用原本已經調校過的數字，不強制重寫。

## Radius

| Token | 數值 | 用在哪裡 |
|---|---|---|
| `--r-xs` | 6px | 小型 Tag |
| `--r-sm` | 10px | 小型 CTA（EventCard 上的「報名」按鈕） |
| `--r-md` | 14px | 一般輸入框、次要面板 |
| `--r-btn` | 14px | **所有真正的按鈕**（primary/secondary/dark） |
| `--r-lg` | 20px | 卡片 |
| `--r-xl` | 26px | Dialog／Sheet、Hero 卡 |
| `--r-pill` | 999px | **只用在 Chip／Tag／Badge**，不用在按鈕 |

刻意分成兩組：按鈕永遠是圓角矩形（`--r-btn`），從來不是全膠囊；膠囊形狀只保留給「你正在看的一個篩選/狀態標籤」，這樣使用者一眼就能分辨「這是可以按的」還是「這是一個標籤」。

## Shadows

`--shadow-card`（一般卡片，非常輕）／`--shadow-pop`（Dialog、Sheet、Toast、CompareTray，較明顯）。Header 與 Bottom Tabs 只用邊界線，不用陰影。Hover 只讓陰影「稍微加深」（`.card:hover` 額外疊加一層更靠近的陰影 + `translateY(-2px)`），不是整個換一組陰影。

## Buttons

`.btn-primary`（橘色）／`.btn-secondary`（白底邊框）／`.btn-dark`（深藍，用在 Manage「＋新增活動」等次要品牌強調）／`.btn-cta`（卡片上的小型行動按鈕，含 `.urgent`／`.featured`／`.waitlist`／`.danger` 變體）／`.link-btn`（純文字）／`.icon-btn`（圓形，圖示按鈕）。狀態：`:hover`／`:disabled`（降低透明度但文字仍可讀）／`:focus-visible`（見上方 focus ring）。目前沒有共用的 loading 狀態元件——按鈕不會因為非同步操作改變尺寸，因為這個原型的操作都是同步的 localStorage 寫入，沒有真正的網路延遲需要處理。

## Icon Buttons

`.icon-btn`（36px 圓形，一般用途）／`.icon-btn.sm`（30px）／`.icon-btn.ghost`（無邊框，用在卡片上的收藏／比較）／`.icon-btn.danger`（紅色，用在刪除）。收藏啟用時變橘色（`active-fav`），比較啟用時變青綠（`active-compare`）——顏色不同，圖示本身也不同（愛心 vs 兩個交疊的圓），從不只靠顏色分辨。所有 icon-only 按鈕都有 `aria-label`；切換類的都有 `aria-pressed`。

## Chips / Badges / Tags

三者外觀刻意不同，對應三種不同性質：

- **Chip**（`.chip`）：可點擊的篩選／選擇，全膠囊，有 `active`／`hover`／`focus-visible` 狀態，active 狀態的 ToggleChip 額外顯示打勾圖示，不是只變色。
- **Badge**（`.badge`）：不可互動的狀態標記（精選、額滿、取消、完成、草稿、急徵），全膠囊，字級 11–12.5px。
- **Tag**（`.tag`）：活動屬性（程度、城市、網高、球制），外觀是小圓角矩形（`--r-xs`），不是膠囊，避免被誤認成可點擊的按鈕。同一張卡片最多 3–4 個 Tag。

## Event Cards

三個共用同一個 `EventCard` 元件與同一套資料/商業邏輯（`src/components/EventCard.jsx`），只有 `variant` 不同：

- **Standard**（`variant="default"`）：白底、輕邊框、標準資訊層級。
- **Featured**（`variant="featured"`）：淡橘到白的漸層背景疊加極淡球場紋理，日期時間加粗加色，CTA 稍微加大（`.btn-cta.featured`）。從不是整張純橘色。
- **Urgent**（`variant="urgent"`）：左側紅色邊線（`.urgent-card`），頂部顯示急徵徽章與位置缺額摘要，CTA 使用紅色。取消／已額滿時移除任何動畫。

資訊層級（三種共用）：第一層活動名稱／狀態／日期／場地；第二層程度／網高／球制／剩餘名額；第三層價格／CTA／收藏／比較。

## Dialogs / Sheets

所有 Dialog／Sheet（RegisterModal、CancelModal、ConfirmDialog、InfoDialog、EditProfileDialog、SaveSearchDialog、ResetDemoDataDialog、QuickJoinConfirmDialog）都建立在同一個 `Sheet.jsx` 元件之上：手機是底部 Sheet（含拖曳把手的視覺提示，非真的可拖曳關閉），桌面（≥640px）變成置中 Dialog。共同行為：開啟時焦點移入並鎖定（focus trap）、背景捲動鎖定、Escape 關閉、關閉後焦點回到觸發元件、`role="dialog"` + `aria-modal="true"` + `aria-labelledby`（部分含 `aria-describedby`）。Quick Join 額外有一條橘色 top accent（`.quick-join-sheet`），標示「這是快速但仍需確認」的流程，其餘維持一般白色。

## Empty States

共用 `.empty-state` / `.empty-state-block`：簡短標題＋一句說明＋最多一個主要動作＋最多一個次要動作，不放長文字。用在：找不到符合條件的活動（並附上「可以試試」的真實可套用建議）、尚未加入比較、尚未收藏、沒有報名紀錄、沒有儲存條件、沒有主辦活動。

## Position Visuals

`PositionShortageBoard.jsx` + `PositionChip.jsx`：桌面／平板顯示簡化 3×2 球場格線（青綠底色＋一條代表球網的虛線在前排上方），缺額位置用虛線橘框標示，已足額位置用素色標示；小螢幕（<480px）改為可換行的 Position Chips。圖表本身 `aria-hidden`，下方一定有對應的文字清單，圖表從不是唯一資訊來源。

## Compare Components

`Compare.jsx` + `compare.css`：桌面是橫向表格（第一欄是欄位名稱，最多三欄活動，每欄可移除／收藏／連到詳情），數值差異的列會有淡橘底＋左側橘色細線標示（「重要差異」），不是每欄用不同大面積顏色。手機改為活動切換 Tabs＋逐項卡片，不強塞三欄表格。CompareTray（`.compare-tray`）固定在 Bottom Tabs 上方（`calc(var(--tabbar-h) + safe-area-inset-bottom)`），顯示已選數量與可移除的活動 chips。

## Responsive Rules

已在 320×568 到 1440×900 共 11 組尺寸實測（見 VISUAL_DIRECTION.md 與最終報告），確認無水平捲動。頁面 max-width：Explore/Compare/Manage 對齊 content 的 padding（不設死值，隨斷點調整）；EventDetail `max-width:1220px`；Profile `max-width:1120px`。Mobile padding 16px／Tablet 24px／Desktop 32–40px（各頁面沿用 `.content`／`.detail-layout`／`.profile-layout` 既有規則）。

## Accessibility

Icon-only 按鈕皆有 `aria-label`；切換類控制項有 `aria-pressed`；Accordion 有 `aria-expanded`/`aria-controls`；搜尋結果數與 Toast 使用 `aria-live`；表單錯誤透過 `aria-describedby` 關聯欄位；所有 Dialog／Sheet 可鍵盤操作（Tab 循環、Escape 關閉、關閉後 focus restore）；`prefers-reduced-motion` 時停用位移／縮放動畫；觸控目標接近 44×44px（`.icon-btn` 有 `::before` 擴大熱區）；沒有 `href="#"`／`javascript:void`／假按鈕。

## Motion

篩選結果進場：淡入＋上移 4px。Sheet／Dialog：底部上滑或淡入（180–240ms）。CompareTray：淡入＋上移。收藏／比較 icon：輕微縮放。Card hover：`translateY(-2px)`（160ms）。Accordion：高度＋透明度。Toast：淡入淡出。所有動畫時間落在 120–240ms 之間，沒有超過 300ms 的，也沒有持續性動畫（`badge.live` 的脈衝點除外，且該動畫在 `prefers-reduced-motion` 時停用）。全域 `prefers-reduced-motion` 規則見 `src/styles/style.css`。
