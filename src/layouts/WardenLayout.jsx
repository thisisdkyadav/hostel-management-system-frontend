import BaseLayout from "./BaseLayout"
import { getWardenNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import WardenProvider from "../contexts/WardenProvider"
import { useAuth } from "../contexts/AuthProvider"
import useAuthz from "../hooks/useAuthz"

const WardenLayout = () => {
  const handleLogout = useLogout()
  const { user } = useAuth()
  const { canRouteByPath } = useAuthz()
  const navItems = getWardenNavItems(handleLogout, user).filter((item) => {
    if (!item?.path) return true
    return canRouteByPath(item.path)
  })

  return (
    <WardenProvider>
      <BaseLayout navItems={navItems} />
    </WardenProvider>
  )
}

export default WardenLayout
