import React from "react"
import { Check } from "lucide-react"

/**
 * StepIndicator Component - Compact horizontal step indicator
 *
 * @param {Array} steps - Array of step objects { id, label, sublabel? }
 * @param {string} currentStep - Current step id
 * @param {function} onStepClick - Optional step click handler (receives stepId)
 * @param {boolean} compact - Use compact mode (no labels)
 */
const StepIndicator = ({
  steps = [],
  currentStep,
  onStepClick,
  compact = false,
  className = "",
  style = {},
}) => {
  const getCurrentIndex = () => steps.findIndex((step) => step.id === currentStep)
  const currentIndex = getCurrentIndex()

  const getStepStatus = (index) => {
    if (index < currentIndex) return "completed"
    if (index === currentIndex) return "current"
    return "upcoming"
  }

  const getStepStyles = (status, isClickable) => {
    const base = {
      width: compact ? 28 : 32,
      height: compact ? 28 : 32,
      borderRadius: "var(--radius-full)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: compact ? "var(--font-size-xs)" : "var(--font-size-sm)",
      fontWeight: "var(--font-weight-semibold)",
      transition: "all 0.2s ease",
      flexShrink: 0,
      cursor: isClickable ? "pointer" : "default",
    }

    if (status === "completed") {
      return {
        ...base,
        backgroundColor: "var(--color-success)",
        color: "var(--color-white)",
        border: "2px solid var(--color-success)",
      }
    }

    if (status === "current") {
      return {
        ...base,
        backgroundColor: "var(--color-primary)",
        color: "var(--color-white)",
        border: "2px solid var(--color-primary)",
        boxShadow: "var(--shadow-focus-primary)",
      }
    }

    return {
      ...base,
      backgroundColor: "var(--color-bg-secondary)",
      color: "var(--color-text-muted)",
      border: "2px solid var(--color-border-primary)",
    }
  }

  const getConnectorStyles = (index) => ({
    flex: 1,
    height: 2,
    backgroundColor:
      index < currentIndex
        ? "var(--color-success)"
        : "var(--color-border-primary)",
    transition: "background-color 0.2s ease",
    minWidth: compact ? 16 : 24,
    maxWidth: compact ? 40 : 60,
  })

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 4 : 8,
        ...style,
      }}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(index)
        const isClickable = onStepClick && status === "completed"

        return (
          <React.Fragment key={step.id}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                onClick={() => isClickable && onStepClick(step.id)}
                style={getStepStyles(status, isClickable)}
                title={step.label}
              >
                {status === "completed" ? (
                  <Check size={compact ? 14 : 16} />
                ) : (
                  index + 1
                )}
              </div>
              {!compact && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    maxWidth: 80,
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontWeight:
                        status === "current"
                          ? "var(--font-weight-semibold)"
                          : "var(--font-weight-normal)",
                      color:
                        status === "upcoming"
                          ? "var(--color-text-muted)"
                          : "var(--color-text-primary)",
                      textAlign: "center",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.label}
                  </span>
                  {step.sublabel && (
                    <span
                      style={{
                        fontSize: "var(--font-size-2xs)",
                        color: "var(--color-text-muted)",
                        textAlign: "center",
                      }}
                    >
                      {step.sublabel}
                    </span>
                  )}
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div style={getConnectorStyles(index)} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default StepIndicator
