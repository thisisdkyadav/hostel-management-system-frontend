import React from "react"
import { useNavigate } from "react-router-dom"

const AccessDenied = ({ title = "Access Denied", message = "You do not have permission to access this page.", icon, suggestion, buttonText = "Return to Home", to = "/" }) => {
  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate(to)
  }

  // Default icon if none provided
  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--icon-xl)', width: 'var(--icon-xl)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v4m6 6a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary)', padding: '0 var(--spacing-4)' }}>
      <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', padding: 'var(--spacing-6)', maxWidth: '28rem', width: '100%', border: 'var(--border-1) solid var(--color-danger-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-danger-bg-light)', color: 'var(--color-danger)', width: 'var(--spacing-14)', height: 'var(--spacing-14)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--spacing-6)', margin: '0 auto var(--spacing-6)' }}>{icon || defaultIcon}</div>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>{title}</h2>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 'var(--spacing-3)' }}>{message}</p>

        {/* Render suggestion if available */}
        {suggestion && (
          <div style={{ backgroundColor: 'var(--color-primary-bg)', border: 'var(--border-1) solid var(--color-primary-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
            <p style={{ color: 'var(--color-primary-dark)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--icon-sm)', width: 'var(--icon-sm)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{suggestion}</span>
            </p>
          </div>
        )}

        {!suggestion && <div style={{ marginBottom: 'var(--spacing-3)' }}></div>}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={handleNavigate} style={{ padding: 'var(--spacing-2-5) var(--spacing-5)', backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', transition: 'var(--transition-all)', boxShadow: 'var(--shadow-sm)' }}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccessDenied
