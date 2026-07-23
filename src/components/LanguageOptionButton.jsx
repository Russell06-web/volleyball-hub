export default function LanguageOptionButton({ children, onClick }) {
  return (
    <button type="button" className="lang-btn" onClick={onClick}>
      {children}
    </button>
  )
}
