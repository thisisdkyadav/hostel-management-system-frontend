import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import BaseLayout from "./BaseLayout"
import { CATERER_LAST_PATH_KEY, getCatererNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import GlobalProvider from "../contexts/GlobalProvider"
import { ToastProvider } from "hzero"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"

const CatererLayout = () => {
  const handleLogout = useLogout()
  const navItems = useAuthorizedNavItems(getCatererNavItems(handleLogout))
  const { pathname } = useLocation()

  // The full-screen Live Feed sits outside this layout; remember where the caterer came from so Close can return there.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(CATERER_LAST_PATH_KEY, pathname)
    } catch {
      // Storage can be unavailable; Close falls back to the dashboard.
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

export default CatererLayout
