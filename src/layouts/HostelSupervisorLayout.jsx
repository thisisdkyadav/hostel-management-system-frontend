import BaseLayout from "./BaseLayout"
import { getHostelSupervisorNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import WardenProvider from "../contexts/WardenProvider"
import { useAuth } from "../contexts/AuthProvider"
import useAuthz from "../hooks/useAuthz"

const HostelSupervisorLayout = () => {
  const handleLogout = useLogout()
  const { user } = useAuth()
  const { canRouteByPath } = useAuthz()
  const navItems = getHostelSupervisorNavItems(handleLogout, user).filter((item) => {
    if (!item?.path) return true
    return canRouteByPath(item.path)
  })

  return (
    <WardenProvider>
      <BaseLayout navItems={navItems} />
    </WardenProvider>
  )
}

export default HostelSupervisorLayout
