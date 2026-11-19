import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <Link className="auth-brand" to="/" aria-label="MANORA home">
          <svg viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <path d="M18 3.5c0 8-4.5 12.5-12.5 12.5C5.5 8 10 3.5 18 3.5Z" />
            <path d="M18 3.5c0 8 4.5 12.5 12.5 12.5C30.5 8 26 3.5 18 3.5Z" />
            <path d="M18 32.5V12" />
            <path d="M18 19.5c-4.8 0-7.5 2.7-7.5 7.5 4.8 0 7.5-2.7 7.5-7.5Z" />
            <path d="M18 24.5c4.8 0 7.5 2.7 7.5 7.5-4.8 0-7.5-2.7-7.5-7.5Z" />
          </svg>
          <span>MANORA</span>
        </Link>

        <div className="auth-content">
          <p className="auth-eyebrow"><span />{eyebrow}</p>
          <h1 id="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>

        <p className="auth-legal">Your goals. Your discipline. Your transformation.</p>
      </section>

      <aside className="auth-story" aria-label="MANORA philosophy">
        <div className="story-orbit story-orbit-one" />
        <div className="story-orbit story-orbit-two" />
        <div className="story-sun" />
        <div className="story-landscape">
          <span className="story-hill story-hill-back" />
          <span className="story-hill story-hill-front" />
          <span className="story-path" />
        </div>
        <div className="story-copy">
          <span className="story-mark" aria-hidden="true">✳</span>
          <p className="story-quote">“You don&apos;t have to see the whole path. Just take the next step.”</p>
          <p className="story-caption">A LITTLE BETTER, EVERY DAY</p>
        </div>
      </aside>
    </main>
  )
}

export default AuthLayout
