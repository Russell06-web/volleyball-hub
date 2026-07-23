import { Link } from 'react-router-dom'
import { Icon } from '../components/Icons'
import '../styles/detail.css'

export default function EventDetail() {
  return (
    <>
      <header className="detail-header">
        <Link to="/explore" className="icon-btn" aria-label="返回探索頁"><Icon id="i-back" size={19} /></Link>
        <span>活動詳情</span>
        <div className="header-actions">
          <button className="icon-btn ghost" aria-label="收藏"><Icon id="i-heart" size={18} /></button>
          <button className="icon-btn ghost" aria-label="分享"><Icon id="i-share" size={18} /></button>
        </div>
      </header>

      <div className="detail-layout">
        <main className="detail-main">
          <div className="match-banner">
            <Icon id="i-check" size={20} />
            <div><b>非常適合你！</b><span>根據你的資料，這個活動很適合你</span></div>
            <b className="match-pct">85%</b>
          </div>

          <div className="detail-title-row">
            <div>
              <h1>週末排球大戰</h1>
              <div className="tag-row"><span className="tag level">中階</span><span className="rating"><Icon id="i-star" size={14} />4.8</span></div>
            </div>
            <span className="badge featured lg">推薦</span>
          </div>

          <section className="info-card">
            <h2>活動資訊</h2>
            <ul className="info-list">
              <li><Icon id="i-pin" size={18} /><div><b>活動地點</b><span>大安運動中心</span><a href="#top">查看地圖 →</a></div></li>
              <li><Icon id="i-calendar" size={18} /><div><b>活動日期</b><span>2025-12-17</span></div></li>
              <li><Icon id="i-clock" size={18} /><div><b>活動時間</b><span>18:00</span></div></li>
              <li><Icon id="i-users" size={18} /><div><b>參加人數</b><span>12 / 16 人</span></div></li>
            </ul>
          </section>

          <section>
            <h2>活動亮點</h2>
            <div className="highlight-grid">
              <div className="highlight blue"><Icon id="i-shield" size={20} /><b>保險保障</b><span>含活動期間保險</span></div>
              <div className="highlight green"><Icon id="i-whistle" size={20} /><b>專業教練</b><span>現場指導</span></div>
              <div className="highlight purple"><Icon id="i-users" size={20} /><b>友善氛圍</b><span>歡迎新手</span></div>
              <div className="highlight orange"><Icon id="i-trend" size={20} /><b>技能提升</b><span>實戰演練</span></div>
            </div>
          </section>

          <section>
            <h2>活動描述</h2>
            <p className="desc">這是一個專為排球愛好者設計的精彩活動！無論你是初學者還是經驗豐富的球員，都能在這裡找到屬於自己的樂趣。活動將由專業教練帶領，提供友善的競賽環境，讓大家在運動中交流學習。</p>
            <div className="notice">
              <Icon id="i-info" size={18} />
              <div><b>活動須知</b><ul><li>請穿著運動服裝及球鞋</li><li>自備飲水及毛巾</li><li>提前 10 分鐘到場報到</li></ul></div>
            </div>
          </section>
        </main>

        <aside className="booking-card">
          <div className="booking-price"><span className="price">NT$250</span><span>包含場地費、器材使用費</span></div>
          <ul className="booking-mini">
            <li><Icon id="i-users" size={15} />已報名 12 / 16 人</li>
            <li><Icon id="i-calendar" size={15} />2025-12-17・18:00</li>
          </ul>
          <Link to="/bookings" className="btn-primary full">立即報名</Link>
          <Link to="/explore" className="btn-secondary full">返回首頁</Link>
        </aside>
      </div>

      <div className="sticky-cta detail-cta">
        <Link to="/explore" className="btn-secondary">返回首頁</Link>
        <Link to="/bookings" className="btn-primary">立即報名 · NT$250</Link>
      </div>
    </>
  )
}
