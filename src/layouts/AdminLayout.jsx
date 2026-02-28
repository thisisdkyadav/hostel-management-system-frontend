import BaseLayout from "./BaseLayout"
import { getAdminNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import GlobalProvider from "../contexts/GlobalProvider"
import { ToastProvider } from "../components/ui/feedback"
import { useAuth } from "../contexts/AuthProvider"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"

const AdminLayout = () => {
  const handleLogout = useLogout()
  const { user } = useAuth()
  const navItems = useAuthorizedNavItems(getAdminNavItems(handleLogout, user))

  return (
    <GlobalProvider>
      <ToastProvider>
        <BaseLayout navItems={navItems} />
      </ToastProvider>
    </GlobalProvider>
  )
}

export default AdminLayout

