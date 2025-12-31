import BaseLayout from "./BaseLayout"
import { getSecurityNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import { useAuth } from "../contexts/AuthProvider"

const SecurityLayout = () => {
  const handleLogout = useLogout()
  const { user } = useAuth ? useAuth() : { user: null }
  const navItems = getSecurityNavItems(handleLogout, user)

  return <BaseLayout navItems={navItems} />
}

export default SecurityLayout
