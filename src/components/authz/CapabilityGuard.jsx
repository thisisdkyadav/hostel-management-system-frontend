import React from "react"
import useAuthz from "../../hooks/useAuthz"

const CapabilityGuard = ({
  capability,
  anyOf,
  allOf,
  fallback = null,
  children,
}) => {
  const { can, canAny, canAll } = useAuthz()

  if (typeof capability === "string" && capability.trim().length > 0) {
    return can(capability) ? children : fallback
  }

  if (Array.isArray(anyOf) && anyOf.length > 0) {
    return canAny(anyOf) ? children : fallback
  }

  if (Array.isArray(allOf) && allOf.length > 0) {
    return canAll(allOf) ? children : fallback
  }

  return children
}

export default CapabilityGuard
