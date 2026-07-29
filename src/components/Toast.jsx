import { useToast } from '../context/ToastContext'
import { Icon } from './Icons'

// role="status" + aria-live="polite" on the wrapper means each new toast
// is announced without stealing focus — the user stays wherever they were
// (e.g. still on the register form) and just hears/reads the outcome.
export default function ToastViewport() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone}`}>
          <span>{t.message}</span>
          <button type="button" className="toast-close" aria-label="關閉通知" onClick={() => dismissToast(t.id)}>
            <Icon id="i-close" size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
