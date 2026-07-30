import React from "react"
import Spinner from "./Spinner"

/**
 * LoadingState Component - centred spinner with a message.
 *
 * Uses the shared (czero-backed) `Spinner` instead of its own bordered circle,
 * so every loading indicator in the app is the same component. This also drops
 * the per-instance `<style>` tag that injected a duplicate @keyframes rule.
 *
 * @param {string} message - Loading message
 * @param {string} description - Additional description
 */
const LoadingState = ({ message = "Loading...", description = "Please wait" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner
        size="xlarge"
        label={message}
        className="mb-4"
        style={{ width: "3.5rem", height: "3.5rem" }}
      />
      <h3 className="text-lg font-medium text-[var(--color-text-body)]">{message}</h3>
      {description && <p className="text-sm text-[var(--color-text-muted)] mt-1">{description}</p>}
    </div>
  )
}

export default LoadingState
