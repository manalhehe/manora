import { useState } from 'react'

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M18 3.5c0 8-4.5 12.5-12.5 12.5C5.5 8 10 3.5 18 3.5Z" />
      <path d="M18 3.5c0 8 4.5 12.5 12.5 12.5C30.5 8 26 3.5 18 3.5Z" />
      <path d="M18 32.5V12" />
      <path d="M18 19.5c-4.8 0-7.5 2.7-7.5 7.5 4.8 0 7.5-2.7 7.5-7.5Z" />
      <path d="M18 24.5c4.8 0 7.5 2.7 7.5 7.5-4.8 0-7.5-2.7-7.5-7.5Z" />
    </svg>
  )
}

export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <a className={`brand${footer ? ' brand-footer' : ''}`} href="#top" aria-label="MANORA home">
      <BrandMark />
      <span>MANORA</span>
    </a>
  )
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header" id="top">
      <div className="header-inner page-width">
        <Brand />
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>
        <nav className={`primary-navigation${menuOpen ? ' is-open' : ''}`} id="primary-navigation" aria-label="Main navigation">
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#journey" onClick={closeMenu}>Your journey</a>
          <a className="login-link" href="#member-login" onClick={closeMenu}>Login</a>
          <a className="button button-nav" href="#journey" onClick={closeMenu}>Start your journey <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </header>
  )
}

export default SiteHeader
