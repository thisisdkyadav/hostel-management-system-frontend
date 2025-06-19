import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { studentApi } from "../../services/apiService"
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

const DASHBOARD_CACHE_KEY = "student_dashboard_data"

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
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOfflineData, setIsOfflineData] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        if (isOnline) {
          try {
            const response = await studentApi.getStudentDashboard()
            const data = response.data
            localStorage.setItem(
              DASHBOARD_CACHE_KEY,
              JSON.stringify({
                data,
                timestamp: new Date().toISOString(),
              })
            )

            setDashboardData(data)
            setIsOfflineData(false)
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
      <div className="p-6 text-red-500 flex items-center justify-center">
        <BiError className="mr-2 text-2xl" /> {error}
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1 relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
        <button onClick={() => setShowQRModal(true)} className="flex items-center gap-2 text-white bg-[#1360AB] px-3 py-2 rounded-lg shadow-sm hover:bg-[#0d4b86] transition-all duration-300 md:hidden">
          <FaQrcode /> Quick Access
        </button>
      </div>

      {/* Offline notification banner */}
      {isOfflineData && <OfflineBanner message="You are currently offline. Viewing cached dashboard data." className="mb-4" />}

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
      <button onClick={() => setShowQRModal(true)} className="fixed bottom-6 right-6 md:hidden bg-[#1360AB] rounded-full p-4 shadow-lg hover:bg-[#0d4b86] transition-all duration-300 z-10">
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
