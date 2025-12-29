import React, { useEffect, useRef, useState } from "react"
import { FaTimes } from "react-icons/fa"
import { createPortal } from "react-dom"
import Button from "./Button"

const Modal = ({ title, children, onClose, width, autoWidth, minHeight, footer, tabs = null, activeTab = null, onTabChange = null, hideTitle = false, fullHeight = false }) => {
  const modalRef = useRef(null)
  const [contentHeight, setContentHeight] = useState("auto")

  // Calculate available height for content when fullHeight is true
  useEffect(() => {
    if (fullHeight) {
      const calculateHeight = () => {
        const windowHeight = window.innerHeight
        const padding = 32 // 16px top + 16px bottom (p-4 md:p-6)
        const headerHeight = tabs ? (hideTitle ? 74 : 122) : 70 // Approximate header heights
        const footerHeight = footer ? 72 : 0 // Approximate footer height

        // Calculate the height leaving some margin
        const availableHeight = windowHeight - padding - headerHeight - footerHeight - 20 // 20px extra margin

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

  return createPortal(
    <div className="fixed inset-0 bg-[var(--color-bg-modal-overlay)] backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6" onClick={handleBackdropClick}>
      <div ref={modalRef} className={` bg-[var(--color-bg-primary)] rounded-[var(--radius-modal)] overflow-auto animate-fadeIn ${autoWidth ? "w-auto" : "w-full"} ${fullHeight ? "h-[calc(100vh-32px)]" : "max-h-[90vh]"} ${width ? `max-w-[${width}px]` : "max-w-2xl"} `} style={{ width: autoWidth ? "auto" : width ? `${Math.min(width, window.innerWidth - 32)}px` : "100%", maxWidth: autoWidth ? "90vw" : undefined, display: fullHeight ? "flex" : "block", flexDirection: fullHeight ? "column" : "initial", boxShadow: 'var(--shadow-modal)', }} onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 z-10 bg-[var(--color-bg-primary)] px-6 py-4 border-b border-[var(--color-border-light)] ${fullHeight ? "flex-shrink-0" : ""}`}>
          {tabs ? (
            <div className="flex flex-col">
              {!hideTitle && title && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl md:text-2xl font-bold text-[var(--color-primary)]">{title}</h3>
                  <Button onClick={onClose} variant="ghost" size="small" icon={<FaTimes className="text-lg" />} aria-label="Close modal" rounded />
                </div>
              )}
              <div className="flex justify-between items-center">
                <nav className="flex space-x-4 overflow-x-auto -mb-4 custom-scrollbar" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--scrollbar-thumb-active) var(--color-border-gray)" }}>
                  <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                      height: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: var(--color-border-gray);
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: var(--scrollbar-thumb-active);
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: var(--color-primary-hover);
                    }
                  `}</style>
                  {tabs.map((tab) => (
                    <Button key={tab.id} onClick={() => onTabChange && onTabChange(tab.id)}
                      variant={activeTab === tab.id ? "primary" : "ghost"}
                      size="small"
                      icon={tab.icon}
                      style={{ borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                    >
                      {tab.name}
                    </Button>
                  ))}
                </nav>
                {hideTitle && (
                  <Button onClick={onClose} variant="ghost" size="small" icon={<FaTimes className="text-lg" />} aria-label="Close modal" rounded />
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <h3 className="text-xl md:text-2xl font-bold text-[var(--color-primary)]">{title}</h3>
              <Button onClick={onClose} variant="ghost" size="small" icon={<FaTimes className="text-lg" />} aria-label="Close modal" rounded />
            </div>
          )}
        </div>

        <div className={`px-6 py-5 overflow-y-auto custom-scrollbar ${fullHeight ? "flex-grow" : "max-h-[calc(90vh-150px)]"}`} style={{ minHeight: minHeight && !fullHeight ? `${minHeight}px` : undefined, height: fullHeight ? contentHeight : "auto", scrollbarWidth: "thin", scrollbarColor: "var(--scrollbar-thumb-active) var(--color-border-gray)", }} >
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: var(--color-border-gray);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: var(--scrollbar-thumb-active);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: var(--color-primary-hover);
            }
          `}</style>
          {children}
        </div>

        {footer && <div className={`sticky bottom-0 z-10 bg-[var(--color-bg-primary)] px-6 py-4 border-t border-[var(--color-border-light)] ${fullHeight ? "flex-shrink-0" : ""}`}>{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export default Modal
