import BaseLayout from "./BaseLayout"
import { getSuperAdminNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"

const SuperAdminLayout = () => {
  const handleLogout = useLogout()
  const navItems = getSuperAdminNavItems(handleLogout)

  return <BaseLayout navItems={navItems} />
}

export default SuperAdminLayout
