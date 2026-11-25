import { useEffect, useRef, useState } from "react"
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
  const bodyRef = useRef(null)
  // Hairlines under the head / over the foot only while content is hidden behind them.
  const [edges, setEdges] = useState({ above: false, below: false })
  const measure = () => {
    const body = bodyRef.current
    if (!body) return
    const above = body.scrollTop > 2
    const below = body.scrollTop + body.clientHeight < body.scrollHeight - 2
    setEdges((current) => (current.above === above && current.below === below ? current : { above, below }))
  }
  useEffect(() => {
    const body = bodyRef.current
    if (!body || typeof ResizeObserver === "undefined") return undefined
    const observer = new ResizeObserver(() => measure())
    observer.observe(body)
    if (body.firstElementChild) observer.observe(body.firstElementChild)
    return () => observer.disconnect()
  }, [])

  return createPortal(
    <div className="mk-sheet-layer">
      <button ref={backdropRef} type="button" tabIndex={-1} className="mk-sheet-backdrop" aria-label="Close" onClick={onClose} />
      <div ref={sheetRef} tabIndex={-1} className="mk-sheet" data-tall={tall || undefined} data-above={edges.above || undefined} data-below={edges.below || undefined} role="dialog" aria-modal="true" aria-label={label || title}>
        <div className="mk-sheet__grip" aria-hidden="true" />
        {title !== undefined && (
          <div className="mk-sheet__head" data-bare={!title || undefined}>
            {title ? <h2 className="mk-sheet__title">{title}</h2> : label && <span className="mk-sheet__peek" aria-hidden="true">{label}</span>}
            <button type="button" className="mk-icon-btn" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        )}
        <div ref={bodyRef} className="mk-sheet__body" onScroll={measure}>
          {children}
        </div>
        {footer && <div className="mk-sheet__foot">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export default PhoneSheet
