export function Loading({ label = 'Loading…' }) {
  return <div aria-live="polite" className="feedback">{label}</div>
}

export function ErrorMessage({ error, onRetry }) {
  return (
    <div className="feedback error-feedback" role="alert">
      <span>{error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Something went wrong.'}</span>
      {onRetry && <button className="text-button" onClick={onRetry} type="button">Try again ↻</button>}
    </div>
  )
}
