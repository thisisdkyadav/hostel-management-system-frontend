import React, { useState } from "react"
import ManageSessionsModal from "./ManageSessionsModal"

const ManageSessionsButton = ({ email }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button 
        onClick={() => setShowModal(true)} 
        style={{
          padding: `var(--spacing-2) var(--spacing-4)`,
          backgroundColor: 'var(--color-bg-muted)',
          color: 'var(--color-text-secondary)',
          borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          transition: 'var(--transition-colors)',
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          style={{
            height: 'var(--icon-sm)',
            width: 'var(--icon-sm)',
            marginRight: 'var(--spacing-2)',
          }}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
          />
        </svg>
        Manage Sessions
      </button>

      {showModal && <ManageSessionsModal onClose={() => setShowModal(false)} email={email} />}
    </>
  )
}

export default ManageSessionsButton
