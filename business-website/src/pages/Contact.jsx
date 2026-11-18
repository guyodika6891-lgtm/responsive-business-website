import { useState } from 'react'
import { useForm } from 'react-hook-form'
import client from '../api/client'
import { ArrowIcon } from '../components/Icons'
import { useAuth } from '../hooks/useAuth'

const today = new Date().toISOString().slice(0, 10)

export default function Contact() {
  const { user } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { name: user?.name || '', email: user?.email || '' } })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function onSubmit(values) {
    setStatus('submitting')
    setError('')
    try {
      await client.post('/messages', {
        ...values,
        id: crypto.randomUUID(),
        email: values.email.trim().toLowerCase(),
        createdAt: new Date(`${today}T12:00:00`).toISOString(),
        read: false,
        reply: '',
      })
      setStatus('success')
      reset({ name: user?.name || '', email: user?.email || '', message: '' })
    } catch (requestError) {
      setStatus('error')
      setError(requestError.response?.data?.message || requestError.message || 'Your message could not be sent.')
    }
  }

  return (
    <section className="contact-page">
      <div className="page-width contact-inner">
        <div className="contact-copy"><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h1>Let&apos;s make<br />something <span>good.</span></h1><p>Tell us a little about what you&apos;re building. We&apos;ll take it from there.</p><a className="contact-email" href="mailto:hello@northstar.example">hello@northstar.example <ArrowIcon diagonal /></a><div className="contact-aside"><strong>Every good project starts somewhere.</strong><span>Give us the short version. We&apos;re happy to help you figure out the rest.</span></div></div>
        <form className="contact-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-row"><label>Your name<input autoComplete="name" placeholder="How should we address you?" {...register('name', { required: 'Please enter your name.', minLength: { value: 2, message: 'Please enter at least two characters.' } })} />{errors.name && <span className="field-error">{errors.name.message}</span>}</label><label>Work email<input autoComplete="email" placeholder="you@company.com" type="email" {...register('email', { required: 'Please enter your email.', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address.' } })} />{errors.email && <span className="field-error">{errors.email.message}</span>}</label></div>
          <label>What&apos;s on your mind?<textarea placeholder="A little about your project, a challenge, or an idea…" rows="5" {...register('message', { required: 'Please add a short message.', minLength: { value: 10, message: 'Please enter at least 10 characters.' }, maxLength: { value: 5000, message: 'Please keep the message under 5,000 characters.' } })} />{errors.message && <span className="field-error">{errors.message.message}</span>}</label>
          {error && <p className="form-feedback form-error" role="alert">{error}</p>}
          {status === 'success' && <p className="form-feedback form-success" role="status">Thanks for reaching out. Your message is saved, and we&apos;ll be in touch soon.</p>}
          <button className="button button-lime" disabled={status === 'submitting'} type="submit">{status === 'submitting' ? 'Sending…' : 'Send your note'} <ArrowIcon /></button>
          <p className="form-note">Your message is saved to this local demo&apos;s JSON API.</p>
        </form>
      </div>
    </section>
  )
}
