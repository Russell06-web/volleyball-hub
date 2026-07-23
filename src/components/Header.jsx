import { Link } from 'react-router-dom'
import { Icon, LogoMark } from './Icons'

const NAV_ITEMS = [
  { key: 'explore', label: '探索活動', to: '/explore' },
  { key: 'bookings', label: '我的報名', to: '/bookings' },
  { key: 'profile', label: '個人資料', to: '/profile' },
  { key: 'manage', label: '活動管理', to: '/manage' },
]

export default function Header({ title, subtitle, active, showSearch = false, avatarLink = true }) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark"><LogoMark /></span>
        <div><b>{title}</b><small>{subtitle}</small></div>
      </div>
      <nav className="nav-links">
        {NAV_ITEMS.map((item) => (
          <Link key={item.key} to={item.to} aria-current={active === item.key ? 'page' : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
      {showSearch && (
        <div className="header-search">
          <Icon id="i-search" size={16} />
          <input type="text" placeholder="搜尋活動、球館、城市…" aria-label="搜尋活動" />
        </div>
      )}
      <div className="header-actions">
        <button className="icon-btn" aria-label="通知"><Icon id="i-info" size={19} /></button>
        {avatarLink
          ? <Link to="/profile" className="avatar">佳</Link>
          : <span className="avatar">佳</span>}
      </div>
    </header>
  )
}
