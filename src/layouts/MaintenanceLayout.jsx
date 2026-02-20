import BaseLayout from "./BaseLayout"
import { getMaintenanceNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import useAuthz from "../hooks/useAuthz"

const MaintenanceLayout = () => {
  const handleLogout = useLogout()
  const { canRouteByPath } = useAuthz()
  const navItems = getMaintenanceNavItems(handleLogout).filter((item) => {
    if (!item?.path) return true
    return canRouteByPath(item.path)
  })

  return <BaseLayout navItems={navItems} />
}

export default MaintenanceLayout
