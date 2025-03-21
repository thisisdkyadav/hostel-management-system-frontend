import React, { useEffect, useRef } from "react"
import { FaTimes } from "react-icons/fa"
import { createPortal } from "react-dom"

const Modal = ({ title, children, onClose }) => {
  const modalRef = useRef(null)

  // Close modal on escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose()
    }
  }

  // Create portal for modal to render at root level of DOM
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={handleBackdropClick}>
      <div ref={modalRef} className="bg-white rounded-[20px] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors" aria-label="Close modal">
            <FaTimes />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
