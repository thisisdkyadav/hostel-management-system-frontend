import { useMemo } from "react"
import useAuthz from "./useAuthz"

export const filterNavItemsByAccess = (items = [], canRouteByPath, canRouteByKey) => {
  if (!Array.isArray(items)) return []
  if (typeof canRouteByPath !== "function") return []

  return items.filter((item) => {
    if (!item?.path) return true
    if (item.routeKey && typeof canRouteByKey === "function") {
      return canRouteByKey(item.routeKey)
    }
    return canRouteByPath(item.path)
  })
}

const useAuthorizedNavItems = (items = []) => {
  const { canRoute, canRouteByPath } = useAuthz()

  return useMemo(() => filterNavItemsByAccess(items, canRouteByPath, canRoute), [items, canRouteByPath, canRoute])
}

export default useAuthorizedNavItems
