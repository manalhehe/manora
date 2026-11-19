import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import { FormField, PasswordField } from '../components/auth/FormField'
import { useAuth } from '../contexts/useAuth'
import { AuthApiError } from '../services/auth.service'
import './AuthPages.css'

interface RegisterErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): RegisterErrors => {
    const nextErrors: RegisterErrors = {}
    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      nextErrors.fullName = 'Enter a name between 2 and 100 characters.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
      nextErrors.password = 'Use at least 8 characters and no more than 72 bytes.'
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Your passwords do not match.'
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
      await signUp(fullName.trim(), email.trim(), password)
      navigate('/welcome', { replace: true })
    } catch (error) {
      if (error instanceof AuthApiError && error.details) {
        setErrors(error.details)
      }
      setFormError(
        error instanceof Error ? error.message : 'Account creation failed. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Your journey begins"
      title="Start with one small step."
      description="Create your account and make space for the person you’re becoming."
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      <form className="auth-form register-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
        {formError && <p className="form-alert" role="alert">{formError}</p>}
        <FormField
          id="register-name"
          label="Full name"
          name="fullName"
          value={fullName}
          onChange={setFullName}
          autoComplete="name"
          error={errors.fullName}
          maxLength={100}
        />
        <FormField
          id="register-email"
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
          id="register-password"
          label="Password"
          name="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          error={errors.password}
        />
        <p className="password-hint">At least 8 characters. Choose something only you know.</p>
        <PasswordField
          id="register-confirm-password"
          label="Confirm password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          error={errors.confirmPassword}
        />
        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating your account…' : 'Create account'}
          {!isSubmitting && <span aria-hidden="true">↗</span>}
        </button>
        <p className="form-terms">
          By continuing, you agree to use MANORA thoughtfully and take care of yourself along the way.
        </p>
      </form>
    </AuthLayout>
  )
}

export default Register
