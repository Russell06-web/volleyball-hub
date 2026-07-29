import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon, LogoMark } from '../components/Icons'
import '../styles/notfound.css'

export default function NotFound() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = '找不到頁面｜Volleyball Hub'
  }, [])

  return (
    <div className="notfound-screen">
      <span className="notfound-mark"><LogoMark width={48} height={48} /></span>
      <h1>找不到這個頁面</h1>
      <p>網址可能打錯了，或這個頁面已經不存在。</p>
      <div className="notfound-actions">
        <Link to="/explore" className="btn-primary">
          <Icon id="i-home" size={16} />返回探索活動
        </Link>
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
          <Icon id="i-back" size={16} />返回上一頁
        </button>
      </div>
    </div>
  )
}
