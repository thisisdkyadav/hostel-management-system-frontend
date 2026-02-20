import BaseLayout from "./BaseLayout"
import { getSecurityNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import { useAuth } from "../contexts/AuthProvider"
import useAuthz from "../hooks/useAuthz"

const SecurityLayout = () => {
  const handleLogout = useLogout()
  const { user } = useAuth()
  const { canRouteByPath } = useAuthz()
  const navItems = getSecurityNavItems(handleLogout, user).filter((item) => {
    if (!item?.path) return true
    return canRouteByPath(item.path)
  })

  return <BaseLayout navItems={navItems} />
}

export default SecurityLayout
