import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import { FormField, PasswordField } from '../components/auth/FormField'
import { useAuth } from '../contexts/useAuth'
import { AuthApiError } from '../services/auth.service'
import './AuthPages.css'

interface LoginErrors {
  email?: string
  password?: string
}

function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): LoginErrors => {
    const nextErrors: LoginErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!password) {
      nextErrors.password = 'Enter your password.'
    }
    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await signIn(email.trim(), password, rememberMe)
      const state = location.state as { from?: { pathname?: string } } | null
      const destination = state?.from?.pathname?.startsWith('/')
        ? state.from.pathname
        : '/welcome'
      navigate(destination, { replace: true })
    } catch (error) {
      if (error instanceof AuthApiError && error.details) {
        setErrors(error.details)
      }
      setFormError(
        error instanceof Error ? error.message : 'Sign in failed. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Your next step starts here."
      description="Sign in to pick up where you left off."
      footer={<>New to MANORA? <Link to="/register">Create your account</Link></>}
    >
      <form className="auth-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
        {formError && <p className="form-alert" role="alert">{formError}</p>}
        <FormField
          id="login-email"
          label="Email address"
          type="email"
          name="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          error={errors.email}
          maxLength={254}
        />
        <PasswordField
          id="login-password"
          label="Password"
          name="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          error={errors.password}
        />
        <div className="form-options">
          <label className="remember-option">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <Link className="quiet-link" to="/forgot-password">Forgot password?</Link>
        </div>
        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
          {!isSubmitting && <span aria-hidden="true">↗</span>}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
