import BaseLayout from "./BaseLayout"
import { getAssociateWardenNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import WardenProvider from "../contexts/WardenProvider"
import { useAuth } from "../contexts/AuthProvider"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"

const AssociateWardenLayout = () => {
  const handleLogout = useLogout()
  const { user } = useAuth()
  const navItems = useAuthorizedNavItems(getAssociateWardenNavItems(handleLogout, user))

  return (
    <WardenProvider>
      <BaseLayout navItems={navItems} />
    </WardenProvider>
  )
}

export default AssociateWardenLayout
