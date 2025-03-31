import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { studentApi } from "../../services/apiService"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { BiError } from "react-icons/bi"

// Import components
import StudentProfile from "../../components/student/StudentProfile"
import RoomInfoCard from "../../components/student/RoomInfoCard"
import ComplaintsSummary from "../../components/student/ComplaintsSummary"
import LostFoundSummary from "../../components/student/LostFoundSummary"
import EventsCalendar from "../../components/student/EventsCalendar"
import DashboardStats from "../../components/student/DashboardStats"
import VisitorRequestForm from "../../components/students/VisitorRequestForm" // Import the form directly

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isVisitorFormOpen, setIsVisitorFormOpen] = useState(false) // Modal state

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await studentApi.getStudentDashboard()
        console.log("Dashboard Data:", response.data)
        setDashboardData(response.data)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>

        <button className="px-4 py-2 bg-[#1360AB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors" onClick={() => setIsVisitorFormOpen(true)}>
          Request Accommodation
        </button>
      </div>

      <VisitorRequestForm student={user} isOpen={isVisitorFormOpen} setIsOpen={setIsVisitorFormOpen} />

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
        </div>

        <div className="lg:col-span-2 space-y-6">
          <ComplaintsSummary complaints={dashboardData.activeComplaints} />
          <EventsCalendar events={dashboardData.upcomingEvents} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
