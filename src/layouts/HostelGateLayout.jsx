import BaseLayout from "./BaseLayout"
import { getHostelGateNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import QRScannerProvider from "../contexts/QRScannerProvider"
import NotificationProvider from "../contexts/NotificationProvider"
import useAuthz from "../hooks/useAuthz"

const HostelGateLayout = () => {
  const handleLogout = useLogout()
  const { canRouteByPath } = useAuthz()
  const navItems = getHostelGateNavItems(handleLogout).filter((item) => {
    if (!item?.path) return true
    return canRouteByPath(item.path)
  })

  return (
    <NotificationProvider>
      <QRScannerProvider>
        <BaseLayout navItems={navItems} />
      </QRScannerProvider>
    </NotificationProvider>
  )
}

export default HostelGateLayout
