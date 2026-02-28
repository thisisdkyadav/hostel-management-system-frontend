import BaseLayout from "./BaseLayout"
import { getSecurityNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import { useAuth } from "../contexts/AuthProvider"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"

const SecurityLayout = () => {
  const handleLogout = useLogout()
  const { user } = useAuth()
  const navItems = useAuthorizedNavItems(getSecurityNavItems(handleLogout, user))

  return <BaseLayout navItems={navItems} />
}

export default SecurityLayout
