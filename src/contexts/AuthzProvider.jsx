import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { authzApi } from "../service"
import { useAuth } from "./AuthProvider"
import {
  buildRoutePathMapFromCatalog,
  buildRoutePathMatchersFromCatalog,
  canAllCapabilities,
  canAnyCapability,
  canCapability,
  canRoute,
  createStrictEffectiveAuthz,
  getConstraint,
  resolveRouteKeyByPath,
} from "../utils/authz"

const AuthzContext = createContext(null)

export const useAuthz = () => {
  const context = useContext(AuthzContext)
  if (!context) {
    throw new Error("useAuthz must be used inside AuthzProvider")
  }
  return context
}

export const AuthzProvider = ({ children }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [catalog, setCatalog] = useState(null)
  const [effective, setEffective] = useState(
    user?.authz?.effective || createStrictEffectiveAuthz(user?.role)
  )
  const [override, setOverride] = useState(null)
  const [error, setError] = useState(null)

  const routePathMap = useMemo(() => buildRoutePathMapFromCatalog(catalog), [catalog])
  const routePathMatchers = useMemo(() => buildRoutePathMatchersFromCatalog(catalog), [catalog])

  const refreshAuthz = useCallback(async () => {
    if (!user) {
      setCatalog(null)
      setEffective(createStrictEffectiveAuthz(null))
      setOverride(null)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [catalogResponse, myAuthzResponse] = await Promise.all([
        authzApi.getCatalog(),
        authzApi.getMyAuthz(),
      ])

      setCatalog(catalogResponse?.data?.catalog || null)
      setOverride(myAuthzResponse?.data?.authz?.override || null)
      setEffective(
        myAuthzResponse?.data?.authz?.effective ||
        user?.authz?.effective ||
        createStrictEffectiveAuthz(user.role)
      )
    } catch (err) {
      console.error("Failed to load authz data", err)
      setError(err)
      setEffective(user?.authz?.effective || createStrictEffectiveAuthz(user.role))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshAuthz()
  }, [refreshAuthz])

  const value = useMemo(() => {
    const canRouteByKey = (routeKey) => canRoute(effective, routeKey)
    const canRouteByPath = (path) => {
      const routeKey = resolveRouteKeyByPath(path, routePathMap, routePathMatchers)
      if (!routeKey) return false
      return canRouteByKey(routeKey)
    }

    return {
      loading,
      error,
      catalog,
      override,
      effective,
      routePathMap,
      routePathMatchers,
      refreshAuthz,
      canRoute: canRouteByKey,
      canRouteByPath,
      can: (capabilityKey) => canCapability(effective, capabilityKey),
      canAny: (capabilityKeys) => canAnyCapability(effective, capabilityKeys),
      canAll: (capabilityKeys) => canAllCapabilities(effective, capabilityKeys),
      getConstraint: (key, fallback = null) => getConstraint(effective, key, fallback),
    }
  }, [catalog, effective, error, loading, override, refreshAuthz, routePathMap, routePathMatchers])

  return <AuthzContext.Provider value={value}>{children}</AuthzContext.Provider>
}

export default AuthzProvider
