import React from 'react'

const LoadingPage = ({ message = 'Loading...', fullScreen = true }) => {
  const containerStyle = fullScreen
    ? {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-secondary)'
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-12)'
      }

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-6)'
        }}
      >
        {/* Spinner */}
        <div
          style={{
            position: 'relative',
            width: '4rem',
            height: '4rem'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: '4px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-full)'
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: '4px solid var(--color-primary)',
              borderRadius: 'var(--radius-full)',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite'
            }}
          ></div>
        </div>

        {/* Loading text */}
        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-muted)'
          }}
        >
          {message}
        </p>
      </div>

      {/* CSS animation for spin */}
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  )
}

export default LoadingPage
