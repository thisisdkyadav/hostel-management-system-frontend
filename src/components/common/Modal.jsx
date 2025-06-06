import React, { useEffect, useRef } from "react"
import { FaTimes } from "react-icons/fa"
import { createPortal } from "react-dom"

const Modal = ({ title, children, onClose, width, autoWidth }) => {
  const modalRef = useRef(null)

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
          overflow-hidden
          animate-fadeIn
          ${autoWidth ? "w-auto" : "w-full"} max-h-[90vh]
          ${width ? `max-w-[${width}px]` : "max-w-2xl"}
        `}
        style={{
          width: autoWidth ? "auto" : width ? `${Math.min(width, window.innerWidth - 32)}px` : "100%",
          maxWidth: autoWidth ? "90vw" : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100">
          <h3 className="text-xl md:text-2xl font-bold text-[#1360AB]">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200" aria-label="Close modal">
            <FaTimes className="text-lg" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-120px)]">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
