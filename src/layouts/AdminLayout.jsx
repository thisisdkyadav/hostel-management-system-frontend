import BaseLayout from "./BaseLayout"
import { getAdminNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import GlobalProvider from "../contexts/GlobalProvider"
import { ToastProvider } from "../components/ui/feedback"
import { useAuth } from "../contexts/AuthProvider"
import useAuthz from "../hooks/useAuthz"

const AdminLayout = () => {
  const handleLogout = useLogout()
  const { user } = useAuth()
  const { canRouteByPath } = useAuthz()
  const navItems = getAdminNavItems(handleLogout, user).filter((item) => {
    if (!item?.path) return true
    if (!item.path.startsWith("/admin")) return true
    return canRouteByPath(item.path)
  })

  return (
    <GlobalProvider>
      <ToastProvider>
        <BaseLayout navItems={navItems} />
      </ToastProvider>
    </GlobalProvider>
  )
}

export default AdminLayout

