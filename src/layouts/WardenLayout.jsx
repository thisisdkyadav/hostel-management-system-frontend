import BaseLayout from "./BaseLayout"
import { getWardenNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import WardenProvider from "../contexts/WardenProvider"
import { useAuth } from "../contexts/AuthProvider"

const WardenLayout = () => {
  const handleLogout = useLogout()
  const { user } = useAuth()
  const navItems = getWardenNavItems(handleLogout, user)

  return (
    <WardenProvider>
      <BaseLayout navItems={navItems} />
    </WardenProvider>
  )
}

export default WardenLayout
