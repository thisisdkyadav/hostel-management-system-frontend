import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import BaseLayout from "./BaseLayout"
import { DINING_LIVE_RETURN_KEY, getAdminNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import GlobalProvider from "../contexts/GlobalProvider"
import { ToastProvider } from "hzero"
import { useAuth } from "../contexts/AuthProvider"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"

const AdminLayout = () => {
  const handleLogout = useLogout()
  const { user } = useAuth()
  const navItems = useAuthorizedNavItems(getAdminNavItems(handleLogout, user))

  const { pathname } = useLocation()

  // The full-screen dining Live Feed sits outside this layout; remember the page so Close can return there.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(DINING_LIVE_RETURN_KEY, pathname)
    } catch {
      // Storage can be unavailable; Close falls back to the portal home.
    }
  }, [pathname])

  return (
    <GlobalProvider>
      <ToastProvider>
        <BaseLayout navItems={navItems} />
      </ToastProvider>
    </GlobalProvider>
  )
}

export default AdminLayout

