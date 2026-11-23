import { createPortal } from "react-dom"
import { X } from "lucide-react"
import useSheetDrag from "./useSheetDrag"
import useLayer from "./useLayer"

/**
 * A bottom sheet for the phone shell. `tall` makes it take most of the screen
 * (forms); otherwise it hugs its content. Drag it down to dismiss. `footer` stays pinned under the
 * scrolling body (submit buttons).
 */
const PhoneSheet = ({ title, onClose, children, footer, tall = false, label }) => {
  const { sheetRef, backdropRef } = useSheetDrag(onClose)
  useLayer(onClose, sheetRef) // Back / Escape close it; focus stays inside

  return createPortal(
    <div className="mk-sheet-layer">
      <button ref={backdropRef} type="button" tabIndex={-1} className="mk-sheet-backdrop" aria-label="Close" onClick={onClose} />
      <div ref={sheetRef} tabIndex={-1} className="mk-sheet" data-tall={tall || undefined} role="dialog" aria-modal="true" aria-label={label || title}>
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
