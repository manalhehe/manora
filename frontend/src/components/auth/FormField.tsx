import { useState } from 'react'

interface FormFieldProps {
  id: string
  label: string
  type?: 'text' | 'email'
  name: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
  error?: string
  maxLength?: number
}

export function FormField({
  id,
  label,
  type = 'text',
  name,
  value,
  onChange,
  autoComplete,
  error,
  maxLength,
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        required
      />
      {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
    </div>
  )
}

interface PasswordFieldProps {
  id: string
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
  error?: string
}

export function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  autoComplete,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className={`password-input${error ? ' has-error' : ''}`}>
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required
        />
        <button
          className="password-toggle"
          type="button"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
    </div>
  )
}
