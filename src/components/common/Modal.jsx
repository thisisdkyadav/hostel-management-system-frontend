import React, { useEffect, useRef, useState } from "react"
import { FaTimes } from "react-icons/fa"
import { createPortal } from "react-dom"

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className={`
          bg-white rounded-2xl shadow-2xl 
          overflow-auto
          animate-fadeIn
          ${autoWidth ? "w-auto" : "w-full"} ${fullHeight ? "h-[calc(100vh-32px)]" : "max-h-[90vh]"}
          ${width ? `max-w-[${width}px]` : "max-w-2xl"}
        `}
        style={{
          width: autoWidth ? "auto" : width ? `${Math.min(width, window.innerWidth - 32)}px` : "100%",
          maxWidth: autoWidth ? "90vw" : undefined,
          display: fullHeight ? "flex" : "block",
          flexDirection: fullHeight ? "column" : "initial",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 z-10 bg-white px-6 py-4 border-b border-gray-100 ${fullHeight ? "flex-shrink-0" : ""}`}>
          {tabs ? (
            <div className="flex flex-col">
              {!hideTitle && title && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl md:text-2xl font-bold text-[#1360AB]">{title}</h3>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200" aria-label="Close modal">
                    <FaTimes className="text-lg" />
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center">
                <nav className="flex space-x-4 overflow-x-auto -mb-4 custom-scrollbar" style={{ scrollbarWidth: "thin", scrollbarColor: "#1360AB #E5E7EB" }}>
                  <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                      height: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: #e5e7eb;
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: #1360ab;
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: #0d4a8f;
                    }
                  `}</style>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange && onTabChange(tab.id)}
                      className={`
                        py-3 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap
                        ${activeTab === tab.id ? "border-[#1360AB] text-[#1360AB]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                      `}
                    >
                      {tab.icon && <span className="mr-2">{tab.icon}</span>}
                      {tab.name}
                    </button>
                  ))}
                </nav>
                {hideTitle && (
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200" aria-label="Close modal">
                    <FaTimes className="text-lg" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <h3 className="text-xl md:text-2xl font-bold text-[#1360AB]">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200" aria-label="Close modal">
                <FaTimes className="text-lg" />
              </button>
            </div>
          )}
        </div>

        <div
          className={`px-6 py-5 overflow-y-auto custom-scrollbar ${fullHeight ? "flex-grow" : "max-h-[calc(90vh-150px)]"}`}
          style={{
            minHeight: minHeight && !fullHeight ? `${minHeight}px` : undefined,
            height: fullHeight ? contentHeight : "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#1360AB #E5E7EB",
          }}
        >
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #e5e7eb;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #1360ab;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #0d4a8f;
            }
          `}</style>
          {children}
        </div>

        {footer && <div className={`sticky bottom-0 z-10 bg-white px-6 py-4 border-t border-gray-100 ${fullHeight ? "flex-shrink-0" : ""}`}>{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export default Modal
