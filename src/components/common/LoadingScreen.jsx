import React from "react"

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[var(--color-primary-bg)] to-[var(--color-bg-secondary)] flex flex-col justify-center items-center z-50">
      <div className="relative flex flex-col items-center">
        {/* Logo container with subtle floating animation - added flex and centering */}
        <div className="animate-pulse-slow relative flex justify-center items-center">
          <img src="/IITILogo.png" alt="IIT Indore Logo" className="h-24 md:h-32 w-auto object-contain drop-shadow-md mx-auto" />

          {/* Pulsing circle behind logo - adjusted positioning */}
          <div className="absolute inset-0 rounded-full bg-[var(--color-primary-bg)] animate-ping-slow -z-10 opacity-70"></div>
        </div>

        {/* Loading indicator */}
        <div className="mt-8 flex justify-center w-full">
          <div className="relative h-2 w-48 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full animate-loading-bar"></div>
          </div>
        </div>

        {/* Loading text */}
        <p className="mt-4 text-[var(--color-text-muted)] text-center font-medium">Loading Hostel Management System...</p>
      </div>
    </div>
  )
}
export default LoadingScreen
