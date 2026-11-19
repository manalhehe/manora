import { Brand } from './SiteHeader'

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main page-width">
        <div className="footer-brand">
          <Brand footer />
          <p>Unlock your better self.</p>
        </div>
        <nav className="footer-navigation" aria-label="Footer navigation">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#journey">Your journey</a>
          <a href="#top">Back to top ↑</a>
        </nav>
        <div className="member-note">
          <span className="member-note-label">Already with us?</span>
          <p><a href="/login">Sign in to your account</a> or <a href="/register">begin your journey</a>.</p>
        </div>
      </div>
      <div className="footer-bottom page-width">
        <span>© {new Date().getFullYear()} MANORA. All rights reserved.</span>
        <span>Your goals. Your discipline. Your transformation.</span>
      </div>
    </footer>
  )
}

export default SiteFooter
