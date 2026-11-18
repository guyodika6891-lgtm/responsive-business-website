import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'

function AuthForm({ mode }) {
  const isRegister = mode === 'register'
  const { login, register: createAccount } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const destination = location.state?.from

  async function onSubmit(values) {
    setSubmitting(true)
    setError('')
    try {
      const account = isRegister
        ? await createAccount(values)
        : await login(values.email, values.password)
      const defaultDestination = account.role === 'admin' ? '/admin' : '/dashboard'
      const destinationMatchesRole = typeof destination === 'string' && (
        account.role === 'admin'
          ? destination.startsWith('/admin')
          : !destination.startsWith('/admin')
      )
      navigate(destinationMatchesRole ? destination : defaultDestination, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'We could not complete that request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page page-width">
      <div className="auth-card">
        <p className="eyebrow">{isRegister ? 'YOUR NEXT CHAPTER' : 'WELCOME BACK'}</p>
        <h1>{isRegister ? 'Create your account.' : 'Good to see you.'}</h1>
        <p className="auth-description">{isRegister ? 'Save your favorite services and keep track of the conversations you start with us.' : 'Sign in to see your account and saved inquiries.'}</p>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {isRegister && <label>Your name<input autoComplete="name" {...register('name', { required: 'Please enter your name.', minLength: { value: 2, message: 'Please enter at least two characters.' } })} />{errors.name && <span className="field-error">{errors.name.message}</span>}</label>}
          <label>Email address<input autoComplete="email" placeholder={isRegister ? '' : 'admin@northstar.local'} type="email" {...register('email', { required: 'Please enter your email address.', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address.' } })} />{errors.email && <span className="field-error">{errors.email.message}</span>}</label>
          <label>Password<input autoComplete={isRegister ? 'new-password' : 'current-password'} type="password" {...register('password', { required: 'Please enter a password.', minLength: isRegister ? { value: 8, message: 'Use at least 8 characters.' } : undefined })} />{errors.password && <span className="field-error">{errors.password.message}</span>}</label>
          {error && <p className="form-feedback form-error" role="alert">{error}</p>}
          <button className="button button-dark auth-submit" disabled={submitting} type="submit">{submitting ? 'One moment…' : isRegister ? 'Create account' : 'Sign in'} <span aria-hidden="true">→</span></button>
        </form>
        <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to Northstar?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
        {!isRegister && <p className="demo-hint">Local demo admin account: <strong>admin@northstar.local</strong> (also accepts <strong>admin@example.com</strong>). Any non-empty password is accepted.</p>}
        <p className="demo-hint">Demo account flows are local and are not secure authentication.</p>
      </div>
    </section>
  )
}

export function Login() {
  return <AuthForm mode="login" />
}

export function Register() {
  return <AuthForm mode="register" />
}
