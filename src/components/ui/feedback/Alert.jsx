import React, { forwardRef, useState } from "react"
import { Alert as C0Alert } from "czero/react"

/**
 * Alert — C0-backed compatibility adapter.
 *
 * Wraps czero's `Alert` while preserving the legacy HMS API so existing call
 * sites keep working unchanged:
 *  - `type` info | success | warning | error  (error → czero's `danger`)
 *  - `dismissible` + `onDismiss` — the alert hides itself and calls the handler
 *  - custom `icon` (a React element) overrides the default variant icon
 *
 * Note: czero now ships default per-variant icons (shown by default). The
 * legacy component only rendered an icon when a real node was passed (a bare
 * `icon` prop actually rendered nothing), so most alerts now gain their
 * intended leading icon.
 *
 * Prefer importing `Alert` from `@/components/ui`.
 *
 * @param {React.ReactNode} children
 * @param {"info"|"success"|"warning"|"error"} type
 * @param {string} title
 * @param {boolean} dismissible
 * @param {function} onDismiss
 * @param {React.ReactNode} icon - custom icon (overrides the default)
 * @param {string} className
 * @param {object} style
 */
const VARIANT_MAP = { info: "info", success: "success", warning: "warning", error: "danger" }

const Alert = forwardRef(
  ({ children, type = "info", title, dismissible = false, onDismiss, icon, className = "", style = {}, ...rest }, ref) => {
    const [dismissed, setDismissed] = useState(false)
    if (dismissed) return null

    const handleDismiss = () => {
      setDismissed(true)
      onDismiss?.()
    }

    return (
      <C0Alert
        ref={ref}
        variant={VARIANT_MAP[type] || "info"}
        title={title}
        dismissible={dismissible}
        onDismiss={dismissible ? handleDismiss : undefined}
        // a real element overrides; a bare `icon` boolean falls back to czero's default
        icon={React.isValidElement(icon) ? icon : undefined}
        className={className}
        style={style}
        {...rest}
      >
        {children}
      </C0Alert>
    )
  }
)

Alert.displayName = "Alert"

export default Alert
