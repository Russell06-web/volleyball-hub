import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Icon, LogoMark } from './Icons'
import { useProfile } from '../context/ProfileContext'

const NAV_ITEMS = [
  { key: 'explore', label: '探索活動', to: '/explore' },
  { key: 'bookings', label: '我的報名', to: '/bookings' },
  { key: 'profile', label: '個人資料', to: '/profile' },
  { key: 'manage', label: '活動管理', to: '/manage' },
]

export default function Header({
  title, subtitle, active, showSearch = false, avatarLink = true,
  searchValue = '', onSearchChange, onSearchClear,
}) {
  const { profile } = useProfile()
  const initial = profile.name.slice(0, 1) || '?'
  const searchInputRef = useRef(null)

  function handleKeyDown(e) {
    if (e.key === 'Escape' && searchValue) {
      e.preventDefault()
      onSearchClear?.()
      searchInputRef.current?.focus()
    }
  }

  function handleClear() {
    onSearchClear?.()
    searchInputRef.current?.focus()
  }

  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark"><LogoMark /></span>
        <div><b>{title}</b><small>{subtitle}</small></div>
      </div>
      <nav className="nav-links" aria-label="主要導覽">
        {NAV_ITEMS.map((item) => (
          <Link key={item.key} to={item.to} aria-current={active === item.key ? 'page' : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
      {showSearch && (
        <div className="header-search">
          <Icon id="i-search" size={16} />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="搜尋活動、球館、城市、主辦方…"
            aria-label="搜尋活動"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searchValue && (
            <button type="button" className="header-search-clear" aria-label="清除搜尋" onClick={handleClear}>
              <Icon id="i-chevron" size={12} />
            </button>
          )}
        </div>
      )}
      <div className="header-actions">
        {avatarLink
          ? <Link to="/profile" className="avatar">{initial}</Link>
          : <span className="avatar">{initial}</span>}
      </div>
    </header>
  )
}
