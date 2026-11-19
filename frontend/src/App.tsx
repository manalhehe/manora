import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/useAuth'
import ForgotPassword from './pages/ForgotPassword'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Welcome from './pages/Welcome'

function LoadingState() {
  return (
    <main className="auth-loading" role="status">
      <span className="loading-mark" aria-hidden="true" />
      <span>Checking your MANORA session…</span>
    </main>
  )
}

function AuthErrorState() {
  const { error, refresh } = useAuth()

  return (
    <main className="auth-loading">
      <section className="auth-error-state">
        <h1>We couldn’t verify your session.</h1>
        <p>{error ?? 'Please check your connection and try again.'}</p>
        <button className="auth-submit" type="button" onClick={() => void refresh()}>
          Try again
        </button>
      </section>
    </main>
  )
}

function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <LoadingState />
  if (status === 'error') return <AuthErrorState />
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Welcome />
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') return <LoadingState />
  if (status === 'authenticated') return <Navigate to="/welcome" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
      <Route path="/welcome" element={<RequireAuth />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
