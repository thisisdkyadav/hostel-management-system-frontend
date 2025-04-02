import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { studentApi } from "../../services/apiService"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
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
      <div className="p-6 h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <AiOutlineLoading3Quarters className="text-4xl text-blue-600 animate-spin mb-3" />
          <div className="text-xl text-gray-600">Loading dashboard data...</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <RoomInfoCard roomData={dashboardData.roomInfo} />
          <LostFoundSummary lostAndFoundStats={dashboardData.stats.lostAndFound} />

          {/* Desktop QR Code */}
          <div className="hidden md:block">
            <QRCodeGenerator />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <ComplaintsSummary complaints={dashboardData.activeComplaints} />
          <EventsCalendar events={dashboardData.upcomingEvents} />
        </div>
      </div>

      {/* Floating Mobile QR Button */}
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
