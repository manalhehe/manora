import { Link } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import './AuthPages.css'

function ForgotPassword() {
  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="A fresh start, when it’s ready."
      description="Password recovery isn’t available yet. No reset email will be sent at this time."
      footer={<>Remember your password? <Link to="/login">Return to sign in</Link></>}
    >
      <div className="recovery-notice" role="status">
        We’re still preparing account recovery. If you can’t access your account, please try again later.
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword
