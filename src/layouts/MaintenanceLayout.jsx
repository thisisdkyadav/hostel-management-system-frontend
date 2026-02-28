import BaseLayout from "./BaseLayout"
import { getMaintenanceNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"

const MaintenanceLayout = () => {
  const handleLogout = useLogout()
  const navItems = useAuthorizedNavItems(getMaintenanceNavItems(handleLogout))

  return <BaseLayout navItems={navItems} />
}

export default MaintenanceLayout
