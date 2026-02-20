import React from "react"
import useAuthz from "../../hooks/useAuthz"

const RouteAccessGuard = ({ routeKey, fallback = null, children }) => {
  const { canRoute } = useAuthz()

  if (!routeKey) return children
  if (!canRoute(routeKey)) return fallback

  return children
}

export default RouteAccessGuard
