import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import FilterModal from '../components/FilterModal'
import InfoDialog from '../components/InfoDialog'
import EditProfileDialog from '../components/EditProfileDialog'
import LanguageDialog from '../components/LanguageDialog'
import ResetDemoDataDialog from '../components/ResetDemoDataDialog'
import { Icon } from '../components/Icons'
import { useBookings } from '../context/BookingsContext'
import { useFavorites } from '../context/FavoritesContext'
import { usePreferences } from '../context/PreferencesContext'
import { useProfile } from '../context/ProfileContext'
import { matchesFilters } from '../components/FilterPanel'
import { useEvents } from '../context/EventsContext'
import '../styles/profile.css'
import '../styles/modals.css'

const GITHUB_REPO_URL = 'https://github.com/Russell06-web/volleyball-hub'
const LANG_LABEL = { 'zh-Hant': '中文', en: 'English', ja: '日本語' }

export default function Profile() {
  const { bookings } = useBookings()
  const { favorites } = useFavorites()
  const { profile } = useProfile()
  const { filters, setFilter, resetFilters } = usePreferences()
  const { events } = useEvents()

  const [editOpen, setEditOpen] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [limitsOpen, setLimitsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const activeBookingsCount = useMemo(
    () => bookings.filter((b) => b.status !== 'cancelled').length,
    [bookings],
  )
  const hostedEventsCount = useMemo(
    () => events.filter((e) => e.ownedByMe).length,
    [events],
  )
  const filterResultCount = useMemo(
    () => events.filter((e) => matchesFilters(e, filters)).length,
    [events, filters],
  )

  return (
    <>
      <Header title="個人資料" subtitle="管理個人資訊" active="profile" avatarLink={false} />

      <div className="profile-layout">
        <aside className="profile-card">
          <div className="profile-avatar-row">
            <span className="profile-avatar">
              {profile.name.slice(0, 1)}
              <button className="avatar-edit" aria-label="編輯個人資料" onClick={() => setEditOpen(true)}>
                <Icon id="i-user" size={12} />
              </button>
            </span>
          </div>
          <h1>{profile.name}</h1>
          <div className="tag-row center">
            <span className="badge onlight">自評程度：{profile.level}</span>
          </div>
          <p className="bio">{profile.bio}</p>
          <div className="profile-stats">
            <div><b>{activeBookingsCount}</b><span>報名活動</span></div>
            <div><b>{favorites.length}</b><span>收藏活動</span></div>
          </div>
          <button type="button" className="btn-secondary full" onClick={() => setEditOpen(true)}>編輯個人資料</button>
        </aside>

        <main className="profile-main">
          <section className="settings-list">
            <h3>我的活動</h3>
            <Link to="/bookings">
              <Icon id="i-calendar" size={19} />
              <div><b>我的報名</b><span>查看報名與候補紀錄</span></div>
              <Icon id="i-chevron" size={16} className="chev" />
            </Link>
            <Link to="/favorites">
              <Icon id="i-heart" size={19} />
              <div><b>我的收藏</b><span>{favorites.length} 場已收藏的活動</span></div>
              <Icon id="i-chevron" size={16} className="chev" />
            </Link>
            <Link to="/manage">
              <Icon id="i-settings" size={19} />
              <div><b>我主辦的活動</b><span>{hostedEventsCount} 場你建立的活動</span></div>
              <Icon id="i-chevron" size={16} className="chev" />
            </Link>
          </section>

          <section className="settings-list">
            <h3>使用偏好</h3>
            <button type="button" onClick={() => setPrefsOpen(true)}>
              <Icon id="i-filter" size={19} />
              <div><b>活動偏好</b><span>影響探索頁的篩選與條件比對結果</span></div>
              <Icon id="i-chevron" size={16} className="chev" />
            </button>
            <button type="button" onClick={() => setLangOpen(true)}>
              <Icon id="i-info" size={19} />
              <div><b>語言設定</b><span>目前：{LANG_LABEL[profile.language] || '中文'}</span></div>
              <Icon id="i-chevron" size={16} className="chev" />
            </button>
          </section>

          <section className="settings-list">
            <h3>關於與支援</h3>
            <button type="button" onClick={() => setPrivacyOpen(true)}>
              <Icon id="i-shield" size={19} />
              <div><b>隱私與資料說明</b><span>資料存在哪裡、原型的資料邊界</span></div>
              <Icon id="i-chevron" size={16} className="chev" />
            </button>
            <button type="button" onClick={() => setAboutOpen(true)}>
              <Icon id="i-info" size={19} />
              <div><b>關於此原型</b><span>已完成的功能與模擬範圍</span></div>
              <Icon id="i-chevron" size={16} className="chev" />
            </button>
            <button type="button" onClick={() => setLimitsOpen(true)}>
              <Icon id="i-trend" size={19} />
              <div><b>技術限制</b><span>正式產品還需要哪些能力</span></div>
              <Icon id="i-chevron" size={16} className="chev" />
            </button>
            <button type="button" onClick={() => setHelpOpen(true)}>
              <Icon id="i-users" size={19} />
              <div><b>幫助與回饋</b><span>回報問題或提出想法</span></div>
              <Icon id="i-chevron" size={16} className="chev" />
            </button>
            <button type="button" className="danger" onClick={() => setResetOpen(true)}>
              <Icon id="i-back" size={19} />
              <div><b>重置示範資料</b><span>清除這個瀏覽器裡的所有原型資料</span></div>
            </button>
          </section>
        </main>
      </div>

      <SiteFooter />
      <BottomTabs active="profile" />

      <EditProfileDialog open={editOpen} onClose={() => setEditOpen(false)} />

      <FilterModal
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        filters={filters}
        onChange={setFilter}
        onReset={resetFilters}
        resultCount={filterResultCount}
      />

      <LanguageDialog open={langOpen} onClose={() => setLangOpen(false)} />

      <InfoDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} titleId="privacyTitle" title="隱私與資料說明">
        <div className="info-dialog-section">
          <p>Volleyball Hub 目前是一個前端高擬真原型，用來展示排球活動探索、報名與主辦管理的產品設計與互動，<b>不是正式上線的商業服務</b>。</p>
        </div>
        <div className="info-dialog-section">
          <h3>你的資料存在哪裡</h3>
          <ul>
            <li>活動報名、候補、收藏活動、瀏覽歷史與篩選偏好，全部只保存在<b>目前這個瀏覽器</b>的 localStorage</li>
            <li>沒有伺服器、沒有資料庫，資料不會傳送到任何後端</li>
            <li>沒有正式登入帳號，也沒有跨裝置同步——換一台裝置或瀏覽器就看不到這些紀錄</li>
            <li>清除瀏覽器資料、清除網站資料，或使用無痕視窗，都會讓這些紀錄直接消失</li>
          </ul>
        </div>
        <div className="info-dialog-section">
          <h3>請不要輸入真實敏感個資</h3>
          <p>報名表單上的姓名、電話等欄位僅用於展示互動流程，請填寫測試用的假資料即可。</p>
        </div>
        <div className="info-dialog-section">
          <h3>正式產品仍需要</h3>
          <ul>
            <li>HTTPS 傳輸加密</li>
            <li>後端身分驗證與角色權限管理</li>
            <li>正式資料庫與資料保存期限規範</li>
            <li>帳號刪除與個資刪除流程</li>
            <li>隱私政策與操作紀錄（audit log）</li>
          </ul>
        </div>
      </InfoDialog>

      <InfoDialog open={aboutOpen} onClose={() => setAboutOpen(false)} titleId="aboutTitle" title="關於此原型">
        <div className="info-dialog-section">
          <h3>目前已完成的功能</h3>
          <ul>
            <li>活動探索、搜尋、多維度篩選（類型／性別／程度／價格／城市）</li>
            <li>依篩選條件產生的條件比對狀態與比對依據說明</li>
            <li>活動報名（個人／揪團）、候補名單、取消與退款政策說明</li>
            <li>收藏活動、瀏覽歷史</li>
            <li>主辦方活動管理儀表板與建立活動流程</li>
            <li>加入行事曆（.ics 下載）</li>
          </ul>
        </div>
        <div className="info-dialog-section">
          <h3>localStorage 模擬範圍</h3>
          <p>報名紀錄、篩選偏好、收藏、瀏覽歷史、個人資料設定——這五類資料都存在瀏覽器的 localStorage 裡，用來模擬「這個帳號的資料」，但實際上沒有帳號系統。</p>
        </div>
        <div className="info-dialog-section">
          <h3>正式產品還缺少的後端能力</h3>
          <p>詳見「技術限制」，或直接使用下方的「重置示範資料」清空目前瀏覽器裡的原型資料。</p>
        </div>
      </InfoDialog>

      <InfoDialog open={limitsOpen} onClose={() => setLimitsOpen(false)} titleId="limitsTitle" title="技術限制">
        <div className="info-dialog-section">
          <p><b>前端把入口藏起來或標示為停用，不等於真正的權限控制。</b>目前站上看不到付款、交易、帳號安全相關的入口，是設計上刻意移除，而不是用 CSS 或條件式渲染假裝已經有存取控制——正式產品這些都需要伺服器端驗證才算數。</p>
        </div>
        <div className="info-dialog-section">
          <h3>正式產品需要實作</h3>
          <ul>
            <li>Authentication（登入身分驗證）與 Authorization（權限驗證）</li>
            <li>會員／主辦方／管理員三種角色權限</li>
            <li>API 層級的權限驗證，不只是前端隱藏按鈕</li>
            <li>資料庫交易（transaction）與即時名額鎖定，避免超額報名</li>
            <li>金流 Webhook、退款與對帳流程</li>
            <li>推播與 Email 通知服務</li>
            <li>資料加密與操作紀錄（audit log）</li>
          </ul>
        </div>
      </InfoDialog>

      <InfoDialog open={helpOpen} onClose={() => setHelpOpen(false)} titleId="helpTitle" title="幫助與回饋">
        <div className="info-dialog-section">
          <p>這是一個作品集用的前端原型，沒有正式客服系統。如果你發現問題或有想法，歡迎直接到 GitHub Repository 開 Issue：</p>
          <p><a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">{GITHUB_REPO_URL}</a></p>
        </div>
      </InfoDialog>

      <ResetDemoDataDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </>
  )
}
