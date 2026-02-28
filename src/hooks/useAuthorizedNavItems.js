import { useMemo } from "react"
import useAuthz from "./useAuthz"

export const filterNavItemsByAccess = (items = [], canRouteByPath) => {
  if (!Array.isArray(items)) return []
  if (typeof canRouteByPath !== "function") return []

  return items.filter((item) => {
    if (!item?.path) return true
    return canRouteByPath(item.path)
  })
}

const useAuthorizedNavItems = (items = []) => {
  const { canRouteByPath } = useAuthz()

  return useMemo(() => filterNavItemsByAccess(items, canRouteByPath), [items, canRouteByPath])
}

export default useAuthorizedNavItems
