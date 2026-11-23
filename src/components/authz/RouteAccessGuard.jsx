import React from "react"
import useAuthz from "../../hooks/useAuthz"

const RouteAccessGuard = ({ routeKey, fallback = null, loadingFallback = null, children }) => {
  const { canRoute, loading } = useAuthz()

  if (!routeKey) return children
  if (loading) return loadingFallback
  if (!canRoute(routeKey)) return fallback

  return children
}

export default RouteAccessGuard
