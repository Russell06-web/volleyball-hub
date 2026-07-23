import { useNavigate } from 'react-router-dom'
import VolleyballIllustration from '../components/VolleyballIllustration'
import LanguageOptionButton from '../components/LanguageOptionButton'
import '../styles/language.css'

// Figma node 2191:10395 ("選擇語言"), file MgsXCN04U1kAiGvaPLcjHg.
// This is the app's real entry screen — see LANGUAGES for the exact
// label/order/destination decisions and what's not 1:1 with Figma.
const LANGUAGES = [
  { code: 'zh-Hant', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
]

export default function LanguageOnboarding() {
  const navigate = useNavigate()

  function chooseLanguage(code) {
    localStorage.setItem('vh-language', code)
    // Figma's get_design_context does not expose click/prototype
    // destinations for this node, so we route to the site's real home
    // (探索活動) rather than inventing an unverified destination.
    navigate('/explore')
  }

  return (
    <div className="lang-screen">
      <VolleyballIllustration />
      <h1 className="lang-title">選擇語言</h1>
      <div className="lang-buttons">
        {LANGUAGES.map((lang) => (
          <LanguageOptionButton key={lang.code} onClick={() => chooseLanguage(lang.code)}>
            {lang.label}
          </LanguageOptionButton>
        ))}
      </div>
    </div>
  )
}
