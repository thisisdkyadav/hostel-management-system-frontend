import Sidebar from "../components/Sidebar"
import BottomBar from "../components/BottomBar"
import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthProvider"
import { useEffect, useState } from "react"
import { notificationApi } from "../service"
import usePwaMobile from "../hooks/usePwaMobile"
import { useLayoutPreference } from "../hooks/useLayoutPreference"
import { useLogout } from "../hooks/useLogout"
import {
  getStudentNavItems,
  getStudentPwaBottomBarMainItems,
  getStudentPwaHiddenItems
} from "../constants/navigationConfig"
import useAuthz from "../hooks/useAuthz"

const StudentLayout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPwaMobile, isMobile, isStandalone } = usePwaMobile()
  const { layoutPreference, loading } = useLayoutPreference()
  const handleLogout = useLogout()
  const { canRouteByPath } = useAuthz()
  const [notificationsCount, setNotificationsCount] = useState(0)

  useEffect(() => {
    const fetchNotificationsCount = async () => {
      try {
        const data = await notificationApi.getActiveNotificationsCount()
        setNotificationsCount(data.activeCount || 0)
      } catch (error) {
        console.error("Failed to fetch notifications count:", error)
      }
    }

    fetchNotificationsCount()
  }, [])

  // Get navigation items from centralized config
  const allNavItems = getStudentNavItems(handleLogout, notificationsCount).filter((item) => {
    if (!item?.path) return true
    return canRouteByPath(item.path)
  })
  const pwaBottomBarMainItems = getStudentPwaBottomBarMainItems().filter((item) => {
    if (!item?.path) return true
    return canRouteByPath(item.path)
  })
  const pwaBottomBarHiddenItems = getStudentPwaHiddenItems(allNavItems)

  // Navigation handler for bottom bar
  const handleNavigation = (item) => {
    if (item.action) {
      item.action()
    } else if (item.path) {
      navigate(item.path)
    }
  }

  // If still loading, don't render anything yet to avoid flashing
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100vh', backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }} >
        Loading...
      </div>
    )
  }

  // Determine which layout to show based on preferences and device
  let showBottomBar = false

  if (user && user.role === "Student" && isMobile) {
    if (isStandalone) {
      // For installed PWA, respect user preference
      showBottomBar = layoutPreference === "bottombar"
    } else if (isPwaMobile) {
      // For mobile browser PWA view, always use bottom bar
      showBottomBar = true
    }
  }

  const showSidebar = !showBottomBar

  return (
    <div className={`layout-container ${showBottomBar ? "pwa-container" : ""}`}>
      {showSidebar && <Sidebar navItems={allNavItems} />}

      <div className={`layout-content ${showBottomBar ? "pb-16 pwa-bottom-padding" : ""}`}>
        <Outlet />
      </div>

      {showBottomBar && <BottomBar mainNavItems={pwaBottomBarMainItems} hiddenNavItems={pwaBottomBarHiddenItems} handleNavigation={handleNavigation} />}
    </div>
  )
}

export default StudentLayout
