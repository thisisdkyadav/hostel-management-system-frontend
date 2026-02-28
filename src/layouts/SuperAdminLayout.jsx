import BaseLayout from "./BaseLayout"
import { getSuperAdminNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"

const SuperAdminLayout = () => {
  const handleLogout = useLogout()
  const navItems = useAuthorizedNavItems(getSuperAdminNavItems(handleLogout))

  return <BaseLayout navItems={navItems} />
}

export default SuperAdminLayout
