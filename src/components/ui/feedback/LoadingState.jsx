import React from "react"

/**
 * LoadingState Component - Matches existing design language
 * 
 * @param {string} message - Loading message
 * @param {string} description - Additional description
 */
const LoadingState = ({ message = "Loading...", description = "Please wait" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div 
        className="w-14 h-14 rounded-full mb-4"
        style={{
          border: '3px solid var(--color-bg-muted)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <h3 className="text-lg font-medium text-[var(--color-text-body)]">{message}</h3>
      {description && <p className="text-sm text-[var(--color-text-muted)] mt-1">{description}</p>}
    </div>
  )
}

export default LoadingState
