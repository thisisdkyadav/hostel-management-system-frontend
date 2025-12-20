import React from "react"

const LoadingState = ({ message = "Loading...", description = "Please wait" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 border-4 border-[var(--color-border-primary)] border-t-[var(--color-primary)] rounded-full animate-spin mb-4"></div>
      <h3 className="text-lg font-medium text-[var(--color-text-body)]">{message}</h3>
      {description && <p className="text-[var(--color-text-muted)] mt-1">{description}</p>}
    </div>
  )
}

export default LoadingState
