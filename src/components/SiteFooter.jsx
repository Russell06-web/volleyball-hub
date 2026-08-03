export default function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">© {year} Volleyball Hub．純前端展示原型，尚未串接真實後端／金流</footer>
  )
}
