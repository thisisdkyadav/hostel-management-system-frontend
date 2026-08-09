import React from "react"
import { Spinner } from "hzero"

const LoadingState = ({ message = "Loading...", description = "Please wait" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size={64} thickness="thick" className="mb-4" />
      <h3 className="text-lg font-medium text-[var(--color-text-body)]">{message}</h3>
      {description && <p className="text-[var(--color-text-muted)] mt-1">{description}</p>}
    </div>
  )
}

export default LoadingState
