import BaseLayout from "./BaseLayout"
import { getSuperAdminNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import useAuthz from "../hooks/useAuthz"

const SuperAdminLayout = () => {
  const handleLogout = useLogout()
  const { canRouteByPath } = useAuthz()
  const navItems = getSuperAdminNavItems(handleLogout).filter((item) => {
    if (!item?.path) return true
    return canRouteByPath(item.path)
  })

  return <BaseLayout navItems={navItems} />
}

export default SuperAdminLayout
