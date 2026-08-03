import React, { forwardRef } from "react"
import { Modal as C0Modal } from "czero/react"

/**
 * Modal — C0-backed compatibility adapter.
 *
 * czero's Modal speaks Radix's vocabulary (`open` / `onOpenChange`) and has no
 * opinion about tabs. HMS speaks `isOpen` / `onClose` and puts a tab strip in
 * the header of ~30 modals, so both of those live here rather than in the
 * library.
 *
 * Everything else passes straight through — see czero's Modal for `size`,
 * `width`, `footer`, `closeOnOverlay`, and the rest.
 *
 * Prefer importing `Modal` from `@/components/ui`.
 *
 * @param {boolean} isOpen - legacy alias for `open`
 * @param {() => void} onClose - legacy close callback, fired on any dismissal
 * @param {Array<{id: string, name?: React.ReactNode, label?: React.ReactNode, icon?: React.ReactNode, disabled?: boolean}>} tabs
 * @param {string} activeTab
 * @param {(tabId: string) => void} onTabChange
 * @param {boolean} hideTitle - drop the title from the layout, keep it for screen readers
 * @param {React.ReactNode} headerExtra - used when `tabs` is not supplied
 */
const Modal = forwardRef(({ isOpen, open, onClose, onOpenChange, tabs, activeTab, onTabChange, headerExtra, ...rest }, ref) => {
  const hasTabs = Array.isArray(tabs) && tabs.length > 0

  const handleOpenChange = (nextOpen) => {
    onOpenChange?.(nextOpen)
    if (!nextOpen) onClose?.()
  }

  return (
    <C0Modal
      ref={ref}
      open={isOpen ?? open}
      onOpenChange={handleOpenChange}
      headerExtra={hasTabs ? <ModalTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} /> : headerExtra}
      {...rest}
    />
  )
})

Modal.displayName = "Modal"

// The header tab strip. Styles are ported verbatim from czero's old built-in
// tabs so the ~30 tabbed modals render identically; the czero tokens they read
// are still in scope via czero/styles.css.
const navStyles = {
  display: "flex",
  alignItems: "center",
  gap: 0,
  overflowX: "auto",
  overflowY: "hidden",
  minWidth: 0,
  flex: 1,
  scrollbarWidth: "thin",
  paddingBottom: "0.25rem",
  marginBottom: "-0.25rem",
}

const tabButtonStyles = (isActive, isDisabled) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.375rem",
  padding: "0.5rem 0.75rem",
  fontSize: "13px",
  fontWeight: isActive ? "var(--cz-font-weight-semibold)" : "var(--cz-font-weight-medium)",
  color: isActive ? "hsl(var(--cz-color-primary))" : "hsl(var(--cz-color-mutedFg))",
  backgroundColor: "transparent",
  border: 0,
  borderBottom: isActive ? "2px solid hsl(var(--cz-color-primary))" : "2px solid transparent",
  marginBottom: "-1px",
  whiteSpace: "nowrap",
  outline: "none",
  boxShadow: "none",
  cursor: isDisabled ? "not-allowed" : "pointer",
  opacity: isDisabled ? 0.5 : 1,
  transition: "all var(--cz-transition-fast)",
})

const ModalTabs = ({ tabs, activeTab, onTabChange }) => (
  <div className="hms-modal-tabs-nav" style={navStyles} role="tablist" aria-label="Modal tabs">
    {tabs.map((tab) => {
      const tabId = String(tab.id)
      const isActive = activeTab === tabId
      const isDisabled = Boolean(tab.disabled)

      return (
        <button
          key={tabId}
          type="button"
          className="hms-modal-tab-btn"
          role="tab"
          aria-selected={isActive}
          tabIndex={isActive ? 0 : -1}
          disabled={isDisabled}
          onClick={() => !isDisabled && onTabChange?.(tabId)}
          style={tabButtonStyles(isActive, isDisabled)}
        >
          {tab.icon ? <span style={{ display: "inline-flex", alignItems: "center" }}>{tab.icon}</span> : null}
          <span>{tab.label ?? tab.name ?? tabId}</span>
        </button>
      )
    })}
  </div>
)

export default Modal
