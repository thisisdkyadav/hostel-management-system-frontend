import BaseLayout from "./BaseLayout"
import { getHostelSupervisorNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import WardenProvider from "../contexts/WardenProvider"
import { useAuth } from "../contexts/AuthProvider"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"

const HostelSupervisorLayout = () => {
  const handleLogout = useLogout()
  const { user } = useAuth()
  const navItems = useAuthorizedNavItems(getHostelSupervisorNavItems(handleLogout, user))

  return (
    <WardenProvider>
      <BaseLayout navItems={navItems} />
    </WardenProvider>
  )
}

export default HostelSupervisorLayout
