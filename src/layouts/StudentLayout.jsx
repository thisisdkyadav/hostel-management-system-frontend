import Sidebar from "../components/Sidebar"
import BottomBar from "../components/BottomBar"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthProvider"
import { useEffect, useState } from "react"
import { electionsApi, notificationApi, overallBestPerformerApi } from "../service"
import { studentApi } from "../service/modules/student.api"
import usePwaMobile from "../hooks/usePwaMobile"
import { useLayoutPreference } from "../hooks/useLayoutPreference"
import { useLogout } from "../hooks/useLogout"
import {
  getStudentNavItems,
  getStudentPwaBottomBarMainItems,
  getStudentPwaHiddenItems
} from "../constants/navigationConfig"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"
import { Heading, Surface, Text } from "hzero"

const StudentLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { isPwaMobile, isMobile, isStandalone } = usePwaMobile()
  const { layoutPreference, loading } = useLayoutPreference()
  const handleLogout = useLogout()
  const [notificationsCount, setNotificationsCount] = useState(0)
  const [showOverallBestPerformer, setShowOverallBestPerformer] = useState(false)
  const [electionPortalState, setElectionPortalState] = useState(null)
  const [studentStatus, setStudentStatus] = useState(null)
  const [studentStatusLoading, setStudentStatusLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== "Student") {
      setStudentStatus(null)
      setStudentStatusLoading(false)
      return
    }

    let isMounted = true

    const fetchStudentStatus = async () => {
      try {
        setStudentStatusLoading(true)
        const profile = await studentApi.getStudent()
        if (!isMounted) return

        setStudentStatus(typeof profile?.status === "string" ? profile.status : null)
      } catch (error) {
        console.error("Failed to fetch student status:", error)
        if (!isMounted) return
        setStudentStatus(null)
      } finally {
        if (isMounted) {
          setStudentStatusLoading(false)
        }
      }
    }

    fetchStudentStatus()

    return () => {
      isMounted = false
    }
  }, [user?.role, user?._id])

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

  useEffect(() => {
    if (user?.role !== "Student") {
      setShowOverallBestPerformer(false)
      return
    }

    let isActive = true

    const fetchBestPerformerState = async () => {
      try {
        const bestPerformerResponse = await overallBestPerformerApi.getStudentPortalState()
        if (!isActive) return

        setShowOverallBestPerformer(
          Boolean(bestPerformerResponse?.data?.canAccessPortal)
        )
      } catch (_error) {
        if (!isActive) return
        setShowOverallBestPerformer(false)
      }
    }

    fetchBestPerformerState()

    return () => {
      isActive = false
    }
  }, [location.pathname, user?.role])

  useEffect(() => {
    if (user?.role !== "Student") {
      setElectionPortalState(null)
      return
    }

    let isActive = true

    const fetchElectionPortalState = async () => {
      try {
        const electionResponse = await electionsApi.getStudentPortalState()
        if (!isActive) return
        setElectionPortalState(electionResponse?.data || null)
      } catch (_error) {
        if (!isActive) return
        setElectionPortalState(null)
      }
    }

    const handleVisibilityRefresh = () => {
      if (document.visibilityState === "visible") {
        fetchElectionPortalState()
      }
    }

    fetchElectionPortalState()
    document.addEventListener("visibilitychange", handleVisibilityRefresh)

    return () => {
      isActive = false
      document.removeEventListener("visibilitychange", handleVisibilityRefresh)
    }
  }, [location.pathname, user?.role])

  // Get navigation items from centralized config
  const allNavItems = useAuthorizedNavItems(
    getStudentNavItems(
      handleLogout,
      notificationsCount,
      showOverallBestPerformer,
      electionPortalState
    )
  )
  const pwaBottomBarMainItems = useAuthorizedNavItems(getStudentPwaBottomBarMainItems())
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
  if (loading || studentStatusLoading) {
    return (
      <Text as="div" color="primary" style={{ height: '100vh', backgroundColor: 'var(--color-bg-page)' }} className="flex items-center justify-center">
        Loading...
      </Text>
    )
  }

  if (user?.role === "Student" && studentStatus === "Inactive") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--spacing-6)",
          background:
            "radial-gradient(circle at top, var(--color-primary-bg) 0%, var(--color-bg-page) 42%, var(--color-bg-page) 100%)",
        }}
      >
        <Surface bg="primary" padding={8} radius="card" border="1px solid var(--color-border-primary)" shadow="lg" align="center" style={{ width: "100%", maxWidth: "640px" }}>
          <Surface bg="var(--color-warning-bg-light)" radius="999px" color="warning-text" size="32px" weight="semibold" style={{ width: "72px", height: "72px", margin: "0 auto var(--spacing-5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            !
          </Surface>
          <Heading as="h1" size="3xl" weight="semibold" color="heading" style={{ marginBottom: "var(--spacing-3)" }}>
            Your account is inactive
          </Heading>
          <Text size="base" leading="var(--line-height-relaxed)" color="body" style={{ margin: 0 }}>
            Please contact the Student Affairs Office if you want to restore access to your account.
          </Text>
        </Surface>
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
