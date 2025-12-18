import React, { useState } from "react"
import ChangePasswordModal from "./ChangePasswordModal"

const ChangePasswordButton = ({ email }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button 
        onClick={() => setShowModal(true)} 
        style={{
          padding: 'var(--button-padding-md)',
          backgroundColor: 'var(--button-primary-bg)',
          color: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          transition: 'var(--transition-colors)',
          display: 'flex',
          alignItems: 'center',
          border: 'none',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--button-primary-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--button-primary-bg)'}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          style={{
            height: 'var(--icon-sm)',
            width: 'var(--icon-sm)',
            marginRight: 'var(--spacing-2)'
          }}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        Change Password
      </button>

      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} email={email} />}
    </>
  )
}

export default ChangePasswordButton
