import { Link } from 'react-router-dom'
import { Icon } from './Icons'

const TABS = [
  { key: 'explore', label: '探索', icon: 'i-home', to: '/explore' },
  { key: 'bookings', label: '報名', icon: 'i-calendar', to: '/bookings' },
  { key: 'profile', label: '個人', icon: 'i-user', to: '/profile' },
  { key: 'manage', label: '管理', icon: 'i-settings', to: '/manage' },
]

export default function BottomTabs({ active }) {
  return (
    <nav className="bottom-tabs" aria-label="主要導覽">
      {TABS.map((tab) => (
        <Link key={tab.key} to={tab.to} aria-current={active === tab.key ? 'page' : undefined}>
          <Icon id={tab.icon} size={21} />
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
