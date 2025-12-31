import React, { useEffect, useRef, useState } from "react"
import { FaTimes } from "react-icons/fa"
import { createPortal } from "react-dom"

/**
 * Modal Component - Matches existing design language
 * 
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {function} onClose - Close handler
 * @param {number} width - Custom width in pixels
 * @param {boolean} autoWidth - Auto width based on content
 * @param {number} minHeight - Minimum height in pixels
 * @param {React.ReactNode} footer - Footer content
 * @param {Array} tabs - Array of tab objects: { id, name, icon }
 * @param {string} activeTab - Active tab id
 * @param {function} onTabChange - Tab change handler
 * @param {boolean} hideTitle - Hide the title
 * @param {boolean} fullHeight - Take full viewport height
 */
const Modal = ({
  title,
  children,
  onClose,
  width,
  autoWidth,
  minHeight,
  footer,
  tabs = null,
  activeTab = null,
  onTabChange = null,
  hideTitle = false,
  fullHeight = false,
}) => {
  const modalRef = useRef(null)
  const [contentHeight, setContentHeight] = useState("auto")

  // Calculate available height for content when fullHeight is true
  useEffect(() => {
    if (fullHeight) {
      const calculateHeight = () => {
        const windowHeight = window.innerHeight
        const padding = 32
        const headerHeight = tabs ? (hideTitle ? 74 : 122) : 70
        const footerHeight = footer ? 72 : 0
        const availableHeight = windowHeight - padding - headerHeight - footerHeight - 20
        setContentHeight(`${availableHeight}px`)
      }

      calculateHeight()
      window.addEventListener("resize", calculateHeight)
      return () => window.removeEventListener("resize", calculateHeight)
    }
  }, [fullHeight, tabs, hideTitle, footer])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose()
    }
  }

  // Close button component
  const CloseButton = () => (
    <button
      onClick={onClose}
      className="p-2 rounded-[var(--radius-button)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-primary)] transition-all duration-200"
      aria-label="Close modal"
    >
      <FaTimes className="text-lg" />
    </button>
  )

  return createPortal(
    <div
      className="fixed inset-0 bg-[var(--color-bg-modal-overlay)] backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`bg-[var(--color-bg-primary)] rounded-[var(--radius-modal)] overflow-auto animate-fadeIn ${autoWidth ? "w-auto" : "w-full"} ${fullHeight ? "h-[calc(100vh-32px)]" : "max-h-[90vh]"} ${width ? `max-w-[${width}px]` : "max-w-2xl"}`}
        style={{
          width: autoWidth ? "auto" : width ? `${Math.min(width, window.innerWidth - 32)}px` : "100%",
          maxWidth: autoWidth ? "90vw" : undefined,
          display: fullHeight ? "flex" : "block",
          flexDirection: fullHeight ? "column" : "initial",
          boxShadow: "var(--shadow-modal)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 bg-[var(--color-bg-primary)] px-6 py-4 border-b border-[var(--color-border-light)] ${fullHeight ? "flex-shrink-0" : ""}`}>
          {tabs ? (
            <div className="flex flex-col">
              {!hideTitle && title && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl md:text-2xl font-bold text-[var(--color-primary)]">{title}</h3>
                  <CloseButton />
                </div>
              )}
              <div className="flex justify-between items-center">
                <nav className="flex space-x-4 overflow-x-auto -mb-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange && onTabChange(tab.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-[var(--color-primary)] text-white rounded-[var(--radius-button-sm)]"
                          : "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-primary)] rounded-[var(--radius-button-sm)]"
                      }`}
                      style={{
                        borderBottom: activeTab === tab.id ? "2px solid var(--color-primary)" : "2px solid transparent",
                      }}
                    >
                      {tab.icon && <span className="text-sm">{tab.icon}</span>}
                      {tab.name}
                    </button>
                  ))}
                </nav>
                {hideTitle && <CloseButton />}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <h3 className="text-xl md:text-2xl font-bold text-[var(--color-primary)]">{title}</h3>
              <CloseButton />
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className={`px-6 py-5 overflow-y-auto ${fullHeight ? "flex-grow" : "max-h-[calc(90vh-150px)]"}`}
          style={{
            minHeight: minHeight && !fullHeight ? `${minHeight}px` : undefined,
            height: fullHeight ? contentHeight : "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "var(--scrollbar-thumb-active) var(--color-border-gray)",
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`sticky bottom-0 z-10 bg-[var(--color-bg-primary)] px-6 py-4 border-t border-[var(--color-border-light)] ${fullHeight ? "flex-shrink-0" : ""}`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

Modal.displayName = "Modal"

export default Modal
