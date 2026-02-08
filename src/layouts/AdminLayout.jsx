import BaseLayout from "./BaseLayout"
import { getAdminNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import GlobalProvider from "../contexts/GlobalProvider"
import { ToastProvider } from "../components/ui/feedback"

const AdminLayout = () => {
  const handleLogout = useLogout()
  const navItems = getAdminNavItems(handleLogout)

  return (
    <GlobalProvider>
      <ToastProvider>
        <BaseLayout navItems={navItems} />
      </ToastProvider>
    </GlobalProvider>
  )
}

export default AdminLayout

