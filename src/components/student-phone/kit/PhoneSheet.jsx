import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

/**
 * A bottom sheet for the phone shell. `tall` makes it take most of the screen
 * (forms); otherwise it hugs its content. `footer` stays pinned under the
 * scrolling body (submit buttons).
 */
const PhoneSheet = ({ title, onClose, children, footer, tall = false, label }) => {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose?.()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return createPortal(
    <div className="mk-sheet-layer">
      <button type="button" className="mk-sheet-backdrop" aria-label="Close" onClick={onClose} />
      <div className="mk-sheet" data-tall={tall || undefined} role="dialog" aria-modal="true" aria-label={label || title}>
        <div className="mk-sheet__grip" aria-hidden="true" />
        {title !== undefined && (
          <div className="mk-sheet__head" data-bare={!title || undefined}>
            {title && <h2 className="mk-sheet__title">{title}</h2>}
            <button type="button" className="mk-icon-btn" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="mk-sheet__body">{children}</div>
        {footer && <div className="mk-sheet__foot">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export default PhoneSheet
