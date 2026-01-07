import BaseLayout from "./BaseLayout"
import { getAdminNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import GlobalProvider from "../contexts/GlobalProvider"

const AdminLayout = () => {
  const handleLogout = useLogout()
  const navItems = getAdminNavItems(handleLogout)

  return (
    <GlobalProvider>
      <BaseLayout navItems={navItems} />
    </GlobalProvider>
  )
}

export default AdminLayout
