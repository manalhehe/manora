import { useState } from 'react'
import { useAuth } from '../contexts/useAuth'
import './AuthPages.css'

function Welcome() {
  const { user, signOut } = useAuth()
  const [error, setError] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setError('')
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (signOutError) {
      setError(
        signOutError instanceof Error
          ? signOutError.message
          : 'Could not sign out. Please try again.',
      )
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <main className="welcome-page">
      <header className="welcome-header">
        <a className="auth-brand" href="/" aria-label="MANORA home">
          <svg viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <path d="M18 3.5c0 8-4.5 12.5-12.5 12.5C5.5 8 10 3.5 18 3.5Z" />
            <path d="M18 3.5c0 8 4.5 12.5 12.5 12.5C30.5 8 26 3.5 18 3.5Z" />
            <path d="M18 32.5V12" />
            <path d="M18 19.5c-4.8 0-7.5 2.7-7.5 7.5 4.8 0 7.5-2.7 7.5-7.5Z" />
            <path d="M18 24.5c4.8 0 7.5 2.7 7.5 7.5-4.8 0-7.5-2.7-7.5-7.5Z" />
          </svg>
          <span>MANORA</span>
        </a>
        <button
          className="sign-out-button"
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isSigningOut}
        >
          {isSigningOut ? 'Signing out…' : 'Sign out'}
        </button>
      </header>
      <section className="welcome-card" aria-labelledby="welcome-title">
        <span className="welcome-spark" aria-hidden="true">✳</span>
        <p className="auth-eyebrow"><span /> YOUR JOURNEY STARTS HERE</p>
        <h1 id="welcome-title">Welcome, {user?.fullName}.</h1>
        <p className="welcome-message">
          You’ve made space for something new. MANORA is growing, and this is your first step.
        </p>
        {error && <p className="form-alert" role="alert">{error}</p>}
        <a className="welcome-link" href="/">Return to MANORA <span aria-hidden="true">↗</span></a>
        <p className="welcome-note">Your account is ready. More ways to support your journey are on the way.</p>
      </section>
    </main>
  )
}

export default Welcome
