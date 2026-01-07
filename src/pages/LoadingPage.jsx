import React from 'react'

const LoadingPage = ({ message = 'Loading...', fullScreen = true }) => {
  return (
    <div className={`loading-screen ${fullScreen ? 'loading-screen--fullscreen' : ''}`}>
      {/* Subtle background */}
      <div className="loading-screen__bg">
        <div className="loading-screen__glow"></div>
      </div>

      {/* Main content */}
      <div className="loading-screen__content">
        {/* Logo container - HMS kept together for easy logo replacement */}
        <div className="loading-screen__logo-wrapper">
          {/* Orbiting circles */}
          <div className="loading-screen__orbit">
            <div className="loading-screen__circle loading-screen__circle--1"></div>
            <div className="loading-screen__circle loading-screen__circle--2"></div>
            <div className="loading-screen__circle loading-screen__circle--3"></div>
            <div className="loading-screen__circle loading-screen__circle--4"></div>
          </div>

          {/* HMS Logo - can be replaced with actual logo */}
          <div className="loading-screen__logo">
            <span className="loading-screen__logo-text">HMS</span>
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

        /* Subtle background glow */
        .loading-screen__bg {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .loading-screen__glow {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, transparent 70%);
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        /* Content */
        .loading-screen__content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-8);
          z-index: 1;
        }

        /* Logo wrapper - contains orbit and logo */
        .loading-screen__logo-wrapper {
          position: relative;
          width: 160px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Orbit container */
        .loading-screen__orbit {
          position: absolute;
          width: 100%;
          height: 100%;
          animation: orbitSpin 8s linear infinite;
        }

        /* Orbiting circles */
        .loading-screen__circle {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
        }

        .loading-screen__circle--1 {
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          animation: circleGlow 2s ease-in-out infinite;
        }

        .loading-screen__circle--2 {
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          animation: circleGlow 2s ease-in-out infinite 0.5s;
        }

        .loading-screen__circle--3 {
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          animation: circleGlow 2s ease-in-out infinite 1s;
        }

        .loading-screen__circle--4 {
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          animation: circleGlow 2s ease-in-out infinite 1.5s;
        }

        @keyframes orbitSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes circleGlow {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateX(-50%) scale(1.3);
            opacity: 1;
          }
        }

        .loading-screen__circle--2 {
          animation-name: circleGlowY;
        }

        .loading-screen__circle--4 {
          animation-name: circleGlowY;
        }

        @keyframes circleGlowY {
          0%, 100% {
            transform: translateY(-50%) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-50%) scale(1.3);
            opacity: 1;
          }
        }

        /* HMS Logo - kept together as single unit */
        .loading-screen__logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100px;
          height: 100px;
          background: white;
          border-radius: 50%;
          box-shadow: 
            0 4px 20px rgba(59, 130, 246, 0.15),
            inset 0 0 0 3px rgba(59, 130, 246, 0.1);
          animation: logoPulse 2s ease-in-out infinite;
        }

        .loading-screen__logo-text {
          font-size: 1.75rem;
          font-weight: 800;
          color: #2563eb;
          letter-spacing: -0.02em;
        }

        @keyframes logoPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 
              0 4px 20px rgba(59, 130, 246, 0.15),
              inset 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 
              0 8px 30px rgba(59, 130, 246, 0.25),
              inset 0 0 0 3px rgba(59, 130, 246, 0.2);
          }
        }

        /* Loading message */
        .loading-screen__message {
          font-size: 0.9375rem;
          font-weight: 500;
          color: #64748b;
          letter-spacing: 0.02em;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .loading-screen__logo-wrapper {
            width: 140px;
            height: 140px;
          }

          .loading-screen__logo {
            width: 85px;
            height: 85px;
          }

          .loading-screen__logo-text {
            font-size: 1.5rem;
          }

          .loading-screen__circle {
            width: 12px;
            height: 12px;
          }

          .loading-screen__glow {
            width: 250px;
            height: 250px;
          }
        }

        /* Non-fullscreen variant */
        .loading-screen:not(.loading-screen--fullscreen) {
          background: transparent;
          padding: var(--spacing-8);
        }

        .loading-screen:not(.loading-screen--fullscreen) .loading-screen__bg {
          display: none;
        }

        .loading-screen:not(.loading-screen--fullscreen) .loading-screen__logo-wrapper {
          width: 120px;
          height: 120px;
        }

        .loading-screen:not(.loading-screen--fullscreen) .loading-screen__logo {
          width: 75px;
          height: 75px;
          background: var(--color-bg-primary);
        }

        .loading-screen:not(.loading-screen--fullscreen) .loading-screen__logo-text {
          font-size: 1.25rem;
          color: var(--color-primary);
        }

        .loading-screen:not(.loading-screen--fullscreen) .loading-screen__circle {
          width: 10px;
          height: 10px;
          background: var(--color-primary);
          box-shadow: 0 0 8px var(--color-primary-light);
        }

        .loading-screen:not(.loading-screen--fullscreen) .loading-screen__message {
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  )
}

export default LoadingPage
