import Header from '../components/Header'
import BottomTabs from '../components/BottomTabs'
import SiteFooter from '../components/SiteFooter'
import { Icon } from '../components/Icons'
import '../styles/profile.css'

export default function Profile() {
  return (
    <>
      <Header title="個人資料" subtitle="管理個人資訊" active="profile" avatarLink={false} />

      <div className="profile-layout">
        <aside className="profile-card">
          <div className="profile-avatar-row">
            <span className="profile-avatar">
              R
              <button className="avatar-edit" aria-label="更換照片"><Icon id="i-search" size={12} /></button>
            </span>
          </div>
          <h1>Russell</h1>
          <span className="handle">@volleyball_king</span>
          <div className="tag-row center">
            <span className="badge onlight">高階球員</span>
            <span className="rating onlight"><Icon id="i-star" size={13} />4.8</span>
          </div>
          <p className="bio">熱愛排球的運動愛好者，期待與大家一起享受排球的樂趣！</p>
          <div className="profile-stats">
            <div><b>48</b><span>參加活動</span></div>
            <div><b>12</b><span>主辦活動</span></div>
            <div><b>95%</b><span>出席率</span></div>
          </div>
        </aside>

        <main className="profile-main">
          <section className="strip">
            <div className="strip-head"><h2>我的成就</h2></div>
            <div className="card-scroll achievements">
              <article className="card achievement-card"><div className="ach-icon gold"><Icon id="i-star" size={20} /></div><b>活動達人</b><span>參加超過 50 場活動</span></article>
              <article className="card achievement-card"><div className="ach-icon blue"><Icon id="i-star" size={20} /></div><b>五星好評</b><span>獲得 30 次五星評價</span></article>
              <article className="card achievement-card"><div className="ach-icon green"><Icon id="i-whistle" size={20} /></div><b>主辦達人</b><span>成功主辦 10 場活動</span></article>
            </div>
          </section>

          <section className="strip">
            <div className="strip-head"><h2>活動數據</h2></div>
            <div className="data-grid">
              <div className="data-tile"><Icon id="i-calendar" size={20} /><b>48</b><span>參加活動</span></div>
              <div className="data-tile blue"><Icon id="i-users" size={20} /><b>12</b><span>創建活動</span></div>
              <div className="data-tile purple"><Icon id="i-heart" size={20} /><b>45</b><span>收藏活動</span></div>
              <div className="data-tile green"><Icon id="i-trend" size={20} /><b>128</b><span>運動時數</span></div>
            </div>
          </section>

          <section className="settings-list">
            <a href="#top"><Icon id="i-user" size={19} /><div><b>個人資料</b><span>編輯您的個人信息</span></div><Icon id="i-chevron" size={16} className="chev" /></a>
            <a href="#top"><Icon id="i-shield" size={19} /><div><b>隱私與安全</b><span>管理您的隱私設置</span></div><Icon id="i-chevron" size={16} className="chev" /></a>
            <a href="#top"><Icon id="i-info" size={19} /><div><b>通知設置</b><span>管理推播和提醒</span></div><span className="badge live count">3</span><Icon id="i-chevron" size={16} className="chev" /></a>
          </section>

          <section className="settings-list">
            <h3>我的收藏</h3>
            <a href="#top"><Icon id="i-heart" size={19} /><div><b>收藏活動</b><span>查看已收藏的活動</span></div><Icon id="i-chevron" size={16} className="chev" /></a>
            <a href="#top"><Icon id="i-clock" size={19} /><div><b>瀏覽歷史</b><span>查看最近瀏覽記錄</span></div><Icon id="i-chevron" size={16} className="chev" /></a>
            <a href="#top"><Icon id="i-users" size={19} /><div><b>我的好友</b><span>管理排球好友</span></div><Icon id="i-chevron" size={16} className="chev" /></a>
          </section>

          <section className="settings-list">
            <h3>付款與訂閱</h3>
            <a href="#top"><Icon id="i-calendar" size={19} /><div><b>付款方式</b><span>管理付款卡片</span></div><Icon id="i-chevron" size={16} className="chev" /></a>
            <a href="#top"><Icon id="i-info" size={19} /><div><b>交易紀錄</b><span>查看歷史帳單</span></div><Icon id="i-chevron" size={16} className="chev" /></a>
          </section>

          <section className="settings-list">
            <h3>其他</h3>
            <a href="#top"><Icon id="i-info" size={19} /><div><b>幫助中心</b><span>常見問題與客服</span></div><Icon id="i-chevron" size={16} className="chev" /></a>
            <a href="#top"><Icon id="i-settings" size={19} /><div><b>應用設置</b><span>語言、主題等設置</span></div><Icon id="i-chevron" size={16} className="chev" /></a>
            <a href="#top" className="danger"><Icon id="i-back" size={19} /><div><b>登出</b><span>退出當前帳號</span></div></a>
          </section>

          <p className="joined">加入於 2024 年 3 月</p>
        </main>
      </div>

      <SiteFooter />
      <BottomTabs active="profile" />
    </>
  )
}
