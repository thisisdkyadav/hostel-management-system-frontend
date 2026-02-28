import BaseLayout from "./BaseLayout"
import { getHostelGateNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import QRScannerProvider from "../contexts/QRScannerProvider"
import NotificationProvider from "../contexts/NotificationProvider"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"

const HostelGateLayout = () => {
  const handleLogout = useLogout()
  const navItems = useAuthorizedNavItems(getHostelGateNavItems(handleLogout))

  return (
    <NotificationProvider>
      <QRScannerProvider>
        <BaseLayout navItems={navItems} />
      </QRScannerProvider>
    </NotificationProvider>
  )
}

export default HostelGateLayout
