import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { studentApi, authApi } from "../../services/apiService"
import { BiError } from "react-icons/bi"
import { FaQrcode } from "react-icons/fa"
import OfflineBanner from "../../components/common/OfflineBanner"
import StudentProfile from "../../components/student/StudentProfile"
import RoomInfoCard from "../../components/student/RoomInfoCard"
import ComplaintsSummary from "../../components/student/ComplaintsSummary"
import LostFoundSummary from "../../components/student/LostFoundSummary"
import EventsCalendar from "../../components/student/EventsCalendar"
import DashboardStats from "../../components/student/DashboardStats"
import QRCodeGenerator from "../../components/QRCodeGenerator"
import Modal from "../../components/common/Modal"
import usePwaMobile from "../../hooks/usePwaMobile"
import UndertakingsBanner from "../../components/student/UndertakingsBanner"

const DASHBOARD_CACHE_KEY = "student_dashboard_data"
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Enhanced shimmer loader components
const ShimmerLoader = ({ height, width = "100%", className = "" }) => <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg ${className}`} style={{ height, width }}></div>

// Shimmer with blurred preview for cards
const CardShimmer = ({ height, className = "" }) => (
  <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ height }}>
    <div className="absolute inset-0 bg-gray-100 backdrop-blur-sm"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <ShimmerLoader height="70%" width="90%" className="rounded-lg" />
    </div>
    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-200 to-transparent"></div>
    <div className="absolute inset-0 animate-pulse opacity-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
  </div>
)

// Shimmer for profile card
const ProfileShimmer = () => (
  <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
    <div className="flex flex-col md:flex-row gap-4">
      <ShimmerLoader height="120px" width="120px" className="rounded-full" />
      <div className="flex-1 space-y-4">
        <ShimmerLoader height="2rem" width="60%" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ShimmerLoader height="1.5rem" width="80%" />
          <ShimmerLoader height="1.5rem" width="70%" />
          <ShimmerLoader height="1.5rem" width="60%" />
          <ShimmerLoader height="1.5rem" width="75%" />
        </div>
      </div>
    </div>
  </div>
)

// Shimmer for stats cards
const StatsShimmer = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm p-4">
        <ShimmerLoader height="1rem" width="60%" className="mb-2" />
        <ShimmerLoader height="2rem" width="40%" />
      </div>
    ))}
  </div>
)

const Dashboard = () => {
  const { user, isOnline } = useAuth()
  const { isPwaMobile } = usePwaMobile()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOfflineData, setIsOfflineData] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      if (isOnline) {
        try {
          const response = await studentApi.getStudentDashboard()
          const data = response.data

          // Store in cache with timestamp
          localStorage.setItem(
            DASHBOARD_CACHE_KEY,
            JSON.stringify({
              data,
              timestamp: new Date().toISOString(),
            })
          )

          setDashboardData(data)
          setIsOfflineData(false)
          setError(null)
        } catch (err) {
          console.error("Error fetching dashboard data:", err)
          const cachedData = localStorage.getItem(DASHBOARD_CACHE_KEY)

          if (cachedData) {
            const { data } = JSON.parse(cachedData)
            setDashboardData(data)
            setIsOfflineData(true)
          } else {
            setError("Failed to load dashboard data")
          }
        }
      } else {
        const cachedData = localStorage.getItem(DASHBOARD_CACHE_KEY)

        if (cachedData) {
          const { data } = JSON.parse(cachedData)
          setDashboardData(data)
          setIsOfflineData(true)
        } else {
          setError("You are offline and no cached data is available")
        }
      }
    } catch (err) {
      console.error("Error in dashboard data handling:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  // Check if cache is expired
  const isCacheExpired = (timestamp) => {
    if (!timestamp) return true
    const cachedTime = new Date(timestamp).getTime()
    const currentTime = new Date().getTime()
    return currentTime - cachedTime > CACHE_EXPIRY_TIME
  }

  useEffect(() => {
    // Check for cached data first
    const cachedData = localStorage.getItem(DASHBOARD_CACHE_KEY)

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData)

      // If cache is not expired or offline, use cached data immediately
      if (!isCacheExpired(timestamp) || !isOnline) {
        setDashboardData(data)
        setIsOfflineData(!isOnline)
        setLoading(false)

        // If online and cache not expired, no need to fetch again
        if (isOnline && !isCacheExpired(timestamp)) {
          return
        }
      }
    }

    // Fetch fresh data if online or no valid cache
    fetchDashboardData()
  }, [isOnline])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <ShimmerLoader height="2rem" width="12rem" />
          <ShimmerLoader height="2.5rem" width="8rem" className="rounded-lg md:hidden" />
        </div>

        <ProfileShimmer />
        <StatsShimmer />

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <CardShimmer height="12rem" className="mb-4" />
            <CardShimmer height="12rem" />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <CardShimmer height="24rem" />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <CardShimmer height="24rem" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center">
          <BiError className="mx-auto text-red-500 text-5xl mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="bg-[#1360AB] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1 relative">
      {/* <button onClick={() => authApi.redirectToWellness()}>wellness</button> */}
      {/* Offline notification banner */}
      {isOfflineData && <OfflineBanner message="You're offline. Viewing cached dashboard data." className="mb-4" showDismiss={true} />}

      {/* Undertakings Banner */}
      <UndertakingsBanner />

      <section className="mb-6">
        <StudentProfile profile={dashboardData.profile} />
      </section>

      <section className="mb-6">
        <DashboardStats stats={dashboardData.stats} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Left sidebar - takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <RoomInfoCard roomData={dashboardData.roomInfo} />
          <LostFoundSummary lostAndFoundStats={dashboardData.stats.lostAndFound} />
        </div>

        {/* Middle section - Complaints takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <ComplaintsSummary complaints={dashboardData.activeComplaints} />
        </div>

        {/* Right section - Events takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <EventsCalendar events={dashboardData.upcomingEvents} />
        </div>
      </div>

      {/* Only keep the mobile QR button and modal */}
      <button
        onClick={() => setShowQRModal(true)}
        className={`
          fixed md:hidden bg-[#1360AB] rounded-full p-4 shadow-lg hover:bg-[#0d4b86] transition-all duration-300 z-10
          ${isPwaMobile ? "bottom-20" : "bottom-6"} right-6
        `}
      >
        <FaQrcode className="text-white text-2xl" />
      </button>

      {/* QR Code Modal */}
      {showQRModal && (
        <Modal title="Campus Access QR" onClose={() => setShowQRModal(false)} width={480}>
          <div className="space-y-6">
            <QRCodeGenerator />
            <button onClick={() => setShowQRModal(false)} className="w-full py-2 bg-gray-200 rounded-lg text-gray-800 font-medium hover:bg-gray-300 transition-colors">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Dashboard
