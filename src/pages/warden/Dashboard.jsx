import { useState, useEffect } from "react"
import { statsApi } from "../../services/apiService"
import StatCards from "../../components/common/StatCards"
import { BiError, BiCalendarEvent } from "react-icons/bi"
import { FaUser, FaUsers } from "react-icons/fa"
import { MdChangeCircle, MdDashboard } from "react-icons/md"
import { FiSearch } from "react-icons/fi"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { useWarden } from "../../contexts/WardenProvider"
import VisitorStatsChart from "../../components/charts/VisitorStatsChart"
import EventsChart from "../../components/charts/EventsChart"
import LostFoundChart from "../../components/charts/LostFoundChart"

const DashboardWarden = () => {
  const { profile, isAssociateWarden } = useWarden()

  const [lostFoundStats, setLostFoundStats] = useState(null)
  const [eventStats, setEventStats] = useState(null)
  const [visitorStats, setVisitorStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true)

        const [lostAndFoundData, eventsData, visitorData] = await Promise.all([statsApi.getLostAndFoundStats(), statsApi.getEventStats(profile?.hostelId?._id), statsApi.getVisitorStats(profile?.hostelId?._id)])

        setLostFoundStats(lostAndFoundData)
        setEventStats(eventsData)
        setVisitorStats(visitorData)
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError("Failed to load dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    if (profile?.hostelId?._id) {
      fetchAllStats()
    }
  }, [profile])

  if (!profile) {
    return (
      <div className="px-10 py-6 flex-1 h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <AiOutlineLoading3Quarters className="text-4xl text-blue-600 animate-spin mb-3" />
          <div className="text-xl text-gray-600">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="px-10 py-6 flex-1 h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <AiOutlineLoading3Quarters className="text-4xl text-blue-600 animate-spin mb-3" />
          <div className="text-xl text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-10 py-6 flex-1 text-red-500 flex items-center justify-center">
        <BiError className="mr-2 text-2xl" /> {error}
      </div>
    )
  }

  // Key statistics data
  const keyStats = [
    {
      title: "Total Visitors",
      value: visitorStats?.total || 0,
      subtitle: `${visitorStats?.today || 0} Today`,
      icon: <FaUsers />,
      color: "#3B82F6",
    },
    {
      title: "Lost & Found Items",
      value: lostFoundStats?.total || 0,
      subtitle: `${lostFoundStats?.active || 0} Active Items`,
      icon: <FiSearch />,
      color: "#F59E0B",
    },
    {
      title: "Events",
      value: eventStats?.total || 0,
      subtitle: `${eventStats?.upcoming || 0} Upcoming`,
      icon: <BiCalendarEvent />,
      color: "#6366F1",
    },
  ]

  return (
    <div className="px-10 py-6 flex-1 bg-gray-50">
      <header className="flex justify-between items-center bg-white rounded-xl shadow-sm px-6 py-4 mb-6">
        <div className="flex items-center">
          <MdDashboard className="text-blue-600 text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">{isAssociateWarden ? "Associate Warden" : "Warden"} Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
          <FaUser className="w-4 h-4" />
          <span className="font-medium">{profile.name}</span>
        </div>
      </header>

      {/* Key metrics cards */}
      <div className="mb-6">
        <StatCards stats={keyStats} columns={3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <LostFoundChart lostFoundStats={lostFoundStats} />
          <div className="grid grid-cols-3 mt-3 gap-4 text-center">
            <StatInfo label="Active" value={lostFoundStats?.active || 0} color="#F59E0B" />
            <StatInfo label="Claimed" value={lostFoundStats?.claimed || 0} color="#10B981" />
            <StatInfo label="Total" value={lostFoundStats?.total || 0} color="#3B82F6" isBold />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <VisitorStatsChart visitorStats={visitorStats} />
          <div className="grid grid-cols-3 mt-3 gap-4 text-center">
            <StatInfo label="Checked In" value={visitorStats?.checkedIn || 0} color="#22C55E" />
            <StatInfo label="Checked Out" value={visitorStats?.checkedOut || 0} color="#6B7280" />
            <StatInfo label="Today" value={visitorStats?.today || 0} color="#F59E0B" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <EventsChart eventStats={eventStats} />
          <div className="grid grid-cols-3 mt-3 gap-4 text-center">
            <StatInfo label="Upcoming" value={eventStats?.upcoming || 0} color="#4F46E5" />
            <StatInfo label="Past" value={eventStats?.past || 0} color="#8B5CF6" />
            <StatInfo label="Total" value={eventStats?.total || 0} color="#6366F1" isBold />
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component
const StatInfo = ({ label, value, color, isBold = false }) => (
  <div className="flex flex-col items-center">
    <p className="text-gray-500 text-xs">{label}</p>
    <p className={`text-lg ${isBold ? "font-bold" : "font-medium"}`} style={{ color }}>
      {value}
    </p>
  </div>
)

export default DashboardWarden
