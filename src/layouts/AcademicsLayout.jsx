import BaseLayout from "./BaseLayout"
import { getAcademicsNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import GlobalProvider from "../contexts/GlobalProvider"
import { ToastProvider } from "../components/ui/feedback"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"

const AcademicsLayout = () => {
  const handleLogout = useLogout()
  const navItems = useAuthorizedNavItems(getAcademicsNavItems(handleLogout))

  return (
    <GlobalProvider>
      <ToastProvider>
        <BaseLayout navItems={navItems} />
      </ToastProvider>
    </GlobalProvider>
  )
}

export default AcademicsLayout
