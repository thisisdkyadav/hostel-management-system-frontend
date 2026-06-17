import BaseLayout from "./BaseLayout"
import { getDiningOfficeNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import GlobalProvider from "../contexts/GlobalProvider"
import { ToastProvider } from "../components/ui/feedback"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"

const DiningOfficeLayout = () => {
  const handleLogout = useLogout()
  const navItems = useAuthorizedNavItems(getDiningOfficeNavItems(handleLogout))

  return (
    <GlobalProvider>
      <ToastProvider>
        <BaseLayout navItems={navItems} />
      </ToastProvider>
    </GlobalProvider>
  )
}

export default DiningOfficeLayout
