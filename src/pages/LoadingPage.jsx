import React from 'react'

const LoadingPage = ({ message = 'Loading...', fullScreen = true }) => {
  return (
    <div className={`loading-wrapper ${fullScreen ? 'loading-wrapper--fullscreen' : ''}`}>
      <div className="loading-content">

        {/* The Geometric Spinner */}
        <div className="geo-spinner">
          <div className="geo-square geo-square--1"></div>
          <div className="geo-square geo-square--2"></div>
          <div className="geo-center">
            <span className="logo-text">HMS</span>
          </div>
        </div>

        {/* Loading Message and Bar */}
        <div className="loading-status">
          <div className="loading-text">
            <p>{message}</p>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {/* Progress Bar with Looping Element */}
          <div className="progress-track">
            <div className="progress-loop"></div>
          </div>
        </div>

      </div>

      <style>{`
        .loading-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #eff6ff;
          position: relative;
          overflow: hidden;
        }

        .loading-wrapper--fullscreen {
          position: fixed;
          inset: 0;
          min-height: 100vh;
          z-index: 9999;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3rem;
          z-index: 10;
        }

        /* The Geometric Structure */
        .geo-spinner {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .geo-square {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          border: 2px solid transparent;
        }

        .geo-square--1 {
          border-color: #93c5fd;
          animation: spin-right 8s linear infinite;
        }

        .geo-square--2 {
          inset: -15px;
          border-color: #bfdbfe;
          opacity: 0.6;
          animation: spin-left 12s linear infinite;
        }

        .geo-center {
          position: relative;
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.15);
          z-index: 20;
          animation: breathe 3s ease-in-out infinite;
        }

        .logo-text {
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          color: #2563eb;
        }

        @keyframes spin-right {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-left {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.95); }
        }

        /* Loading Status Section */
        .loading-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          width: 200px;
        }

        .loading-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: #64748b;
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 500;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
          margin-top: 4px;
        }

        .typing-dots span {
          width: 3px;
          height: 3px;
          background-color: #64748b;
          border-radius: 50%;
          animation: dot-bounce 1.4s infinite ease-in-out both;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        .typing-dots span:nth-child(3) { animation-delay: 0s; }

        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        /* Progress Bar */
        .progress-track {
          width: 100%;
          height: 4px;
          background-color: #dbeafe; /* blue-100 */
          border-radius: 100px;
          overflow: hidden;
          position: relative;
        }

        .progress-loop {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 40%; /* Length of the loop */
          background: linear-gradient(90deg, transparent, #3b82f6, transparent); /* Fade in/out edges */
          animation: progress-slide 1.5s ease-in-out infinite;
          border-radius: 100px;
        }

        @keyframes progress-slide {
          0% { left: -40%; }
          100% { left: 100%; }
        }

        @media (max-width: 640px) {
           .geo-spinner { transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}

export default LoadingPage
