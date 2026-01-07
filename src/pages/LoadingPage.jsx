import React from 'react'

const LoadingPage = ({ message = 'Loading...', fullScreen = true }) => {
  return (
    <div className={`loading-screen ${fullScreen ? 'loading-screen--fullscreen' : ''}`}>
      {/* Animated background blobs - matching homepage */}
      <div className="loading-screen__bg">
        <div className="loading-screen__blob loading-screen__blob--1"></div>
        <div className="loading-screen__blob loading-screen__blob--2"></div>
        <div className="loading-screen__blob loading-screen__blob--3"></div>
      </div>

      {/* Main content */}
      <div className="loading-screen__content">
        {/* HMS Letters with bounce effect */}
        <div className="loading-screen__hms">
          <span className="loading-screen__letter" style={{ animationDelay: '0s' }}>H</span>
          <span className="loading-screen__letter" style={{ animationDelay: '0.1s' }}>M</span>
          <span className="loading-screen__letter" style={{ animationDelay: '0.2s' }}>S</span>
        </div>

        {/* Pulsing ring behind HMS */}
        <div className="loading-screen__pulse-ring"></div>

        {/* Progress bar */}
        <div className="loading-screen__progress-container">
          <div className="loading-screen__progress-track">
            <div className="loading-screen__progress-bar"></div>
          </div>
        </div>

        {/* Loading message */}
        <p className="loading-screen__message">{message}</p>
      </div>

      <style>{`
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-8);
          position: relative;
          overflow: hidden;
          background-color: #eff6ff;
        }

        .loading-screen--fullscreen {
          position: fixed;
          inset: 0;
          min-height: 100vh;
          z-index: 9999;
        }

        /* Animated background blobs - matching homepage style */
        .loading-screen__bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .loading-screen__blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(48px);
        }

        .loading-screen__blob--1 {
          width: 20rem;
          height: 20rem;
          background-color: rgba(191, 219, 254, 0.5);
          top: -5rem;
          left: -5rem;
          animation: blobPulse 8s ease-in-out infinite;
        }

        .loading-screen__blob--2 {
          width: 18rem;
          height: 18rem;
          background-color: rgba(147, 197, 253, 0.4);
          bottom: -4rem;
          right: -4rem;
          animation: blobPulse 10s ease-in-out infinite 2s;
        }

        .loading-screen__blob--3 {
          width: 14rem;
          height: 14rem;
          background-color: rgba(191, 219, 254, 0.35);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: blobPulse 6s ease-in-out infinite 1s;
        }

        @keyframes blobPulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        .loading-screen__blob--3 {
          animation-name: blobPulseCenter;
        }

        @keyframes blobPulseCenter {
          0%, 100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }

        /* Content container */
        .loading-screen__content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-6);
          z-index: 1;
          position: relative;
        }

        /* HMS Letters */
        .loading-screen__hms {
          display: flex;
          gap: 0.25rem;
          position: relative;
          z-index: 2;
        }

        .loading-screen__letter {
          font-size: 3.5rem;
          font-weight: 800;
          color: #2563eb;
          animation: letterBounce 1.5s ease-in-out infinite;
          text-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        @keyframes letterBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Pulsing ring */
        .loading-screen__pulse-ring {
          position: absolute;
          width: 140px;
          height: 140px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background-color: rgba(191, 219, 254, 0.5);
          animation: pulseRing 2s ease-out infinite;
          z-index: 0;
        }

        @keyframes pulseRing {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        /* Progress bar */
        .loading-screen__progress-container {
          margin-top: var(--spacing-6);
          width: 200px;
        }

        .loading-screen__progress-track {
          position: relative;
          height: 6px;
          background-color: rgba(191, 219, 254, 0.5);
          border-radius: 9999px;
          overflow: hidden;
        }

        .loading-screen__progress-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #3b82f6, #2563eb, #1d4ed8, #2563eb, #3b82f6);
          background-size: 200% 100%;
          border-radius: 9999px;
          animation: progressSlide 1.5s ease-in-out infinite;
        }

        @keyframes progressSlide {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }

        /* Loading message */
        .loading-screen__message {
          font-size: 1rem;
          font-weight: 500;
          color: rgba(75, 85, 99, 0.9);
          animation: messageFade 2s ease-in-out infinite;
          letter-spacing: 0.025em;
        }

        @keyframes messageFade {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .loading-screen__letter {
            font-size: 2.5rem;
          }

          .loading-screen__pulse-ring {
            width: 110px;
            height: 110px;
          }

          .loading-screen__blob--1 {
            width: 14rem;
            height: 14rem;
          }

          .loading-screen__blob--2 {
            width: 12rem;
            height: 12rem;
          }

          .loading-screen__blob--3 {
            width: 10rem;
            height: 10rem;
          }
        }

        /* Non-fullscreen variant */
        .loading-screen:not(.loading-screen--fullscreen) {
          background: transparent;
          padding: var(--spacing-12);
        }

        .loading-screen:not(.loading-screen--fullscreen) .loading-screen__bg {
          display: none;
        }

        .loading-screen:not(.loading-screen--fullscreen) .loading-screen__letter {
          font-size: 2rem;
          color: var(--color-primary);
        }

        .loading-screen:not(.loading-screen--fullscreen) .loading-screen__pulse-ring {
          width: 100px;
          height: 100px;
          background-color: var(--color-primary-light);
          opacity: 0.2;
        }

        .loading-screen:not(.loading-screen--fullscreen) .loading-screen__message {
          color: var(--color-text-muted);
        }

        .loading-screen:not(.loading-screen--fullscreen) .loading-screen__progress-track {
          background: var(--color-border-primary);
        }

        .loading-screen:not(.loading-screen--fullscreen) .loading-screen__progress-bar {
          background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark), var(--color-primary));
          background-size: 200% 100%;
        }
      `}</style>
    </div>
  )
}

export default LoadingPage
