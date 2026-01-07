import BaseLayout from "./BaseLayout"
import { getMaintenanceNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"

const MaintenanceLayout = () => {
  const handleLogout = useLogout()
  const navItems = getMaintenanceNavItems(handleLogout)

  return <BaseLayout navItems={navItems} />
}

export default MaintenanceLayout
