import { useCallback, useMemo, useRef, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { ConfirmOverrideContext } from "../../common/AdaptiveConfirm"
import PhoneSheet from "./PhoneSheet"

/** A yes/no question as a small bottom sheet. Back, the backdrop or Cancel answer "no". */
export const ConfirmSheet = ({ title = "Are you sure?", message, confirmText = "Confirm", cancelText = "Cancel", destructive = false, onConfirm, onClose }) => (
  <PhoneSheet
    title={title}
    onClose={onClose}
    footer={
      <>
        <button type="button" className="mk-btn mk-btn--soft" onClick={onClose}>
          {cancelText}
        </button>
        <button type="button" className={destructive ? "mk-btn mk-btn--danger-solid" : "mk-btn mk-btn--primary"} onClick={onConfirm}>
          {confirmText}
        </button>
      </>
    }
  >
    <div className="mk-confirm">
      {destructive && (
        <span className="mk-confirm__icon" aria-hidden="true">
          <AlertTriangle size={22} />
        </span>
      )}
      {message && <p className="mk-confirm__text">{message}</p>}
    </div>
  </PhoneSheet>
)

const isDestructive = (options) => Boolean(options.isDestructive || options.destructive || options.variant === "danger")

/**
 * Makes confirmations on the phone pages bottom sheets: both <ConfirmDialog>
 * (via AdaptiveConfirmDialog) and confirm() from useConfirm (via useAdaptiveConfirm).
 */
export const PhoneConfirmProvider = ({ children }) => {
  const [pending, setPending] = useState(null) // { options, resolve }
  const pendingRef = useRef(null)

  const settle = useCallback((answer) => {
    const current = pendingRef.current
    pendingRef.current = null
    setPending(null)
    current?.resolve(answer)
  }, [])

  const confirm = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        pendingRef.current?.resolve(false) // a newer question replaces an unanswered one
        const next = { options, resolve }
        pendingRef.current = next
        setPending(next)
      }),
    [],
  )

  const value = useMemo(
    () => ({
      confirm,
      renderDialog: ({ onClose, onConfirm, title, message, confirmText, cancelText, ...rest }) => (
        <ConfirmSheet
          title={title}
          message={message}
          confirmText={confirmText}
          cancelText={cancelText}
          destructive={isDestructive(rest)}
          onClose={onClose}
          onConfirm={() => {
            onConfirm?.()
            onClose?.()
          }}
        />
      ),
    }),
    [confirm],
  )

  const options = pending?.options
  return (
    <ConfirmOverrideContext.Provider value={value}>
      {children}
      {options && (
        <ConfirmSheet
          title={options.title}
          message={options.message}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          destructive={isDestructive(options)}
          onClose={() => settle(false)}
          onConfirm={() => settle(true)}
        />
      )}
    </ConfirmOverrideContext.Provider>
  )
}
