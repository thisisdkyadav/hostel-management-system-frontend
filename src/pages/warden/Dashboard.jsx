import { useState, useEffect } from "react"
import { statsApi } from "../../services/apiService"
import { dashboardApi } from "../../services/dashboardApi"
import StatCards from "../../components/common/StatCards"
import { BiError, BiCalendarEvent, BiBuildings } from "react-icons/bi"
import { FaUser, FaUsers } from "react-icons/fa"
import { MdChangeCircle, MdDashboard } from "react-icons/md"
import { FiSearch } from "react-icons/fi"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { useWarden } from "../../contexts/WardenProvider"
import { useAuth } from "../../contexts/AuthProvider"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend, LogarithmicScale } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, Title, ArcElement, Tooltip, Legend)

const DashboardWarden = () => {
  const { profile, isAssociateWardenOrSupervisor } = useWarden()
  const { user: authUser } = useAuth()

  const [lostFoundStats, setLostFoundStats] = useState(null)
  const [eventStats, setEventStats] = useState(null)
  const [visitorStats, setVisitorStats] = useState(null)
  const [studentStats, setStudentStats] = useState(null)
  const [hostelStats, setHostelStats] = useState(null)
  const [normalizedView, setNormalizedView] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true)

        const [lostAndFoundData, eventsData, visitorData, studentData, hostelData] = await Promise.all([
          statsApi.getLostAndFoundStats(),
          statsApi.getEventStats(profile?.hostelId?._id),
          statsApi.getVisitorStats(profile?.hostelId?._id),
          dashboardApi.getStudentStatistics(),
          dashboardApi.getWardenHostelStatistics(),
        ])

        setLostFoundStats(lostAndFoundData)
        setEventStats(eventsData)
        setVisitorStats(visitorData)
        setStudentStats({ students: studentData.data })
        setHostelStats(hostelData.data)
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
      title: "Total Students",
      value: studentStats?.students?.grandTotal || 0,
      subtitle: `${studentStats?.students?.totalBoys || 0} Boys, ${studentStats?.students?.totalGirls || 0} Girls`,
      icon: <FaUsers />,
      color: "#6366F1",
    },
    {
      title: "Total Visitors",
      value: visitorStats?.total || 0,
      subtitle: `${visitorStats?.today || 0} Today`,
      icon: <FaUsers />,
      color: "#3B82F6",
    },
    {
      title: "Events",
      value: eventStats?.total || 0,
      subtitle: `${eventStats?.upcoming || 0} Upcoming`,
      icon: <BiCalendarEvent />,
      color: "#F59E0B",
    },
  ]

  return (
    <div className="px-10 py-6 flex-1 bg-gray-50">
      <header className="flex justify-between items-center bg-white rounded-xl shadow-sm px-6 py-4 mb-6">
        <div className="flex items-center">
          <MdDashboard className="text-blue-600 text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">{authUser?.role === "Hostel Supervisor" ? "Hostel Supervisor" : isAssociateWardenOrSupervisor ? "Associate Warden" : "Warden"} Dashboard</h1>
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

      {/* Student distribution section */}
      <div className="mb-6 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <FaUsers className="mr-2 text-indigo-500" /> Student Distribution
          </h2>

          <div className="flex items-center">
            <div className="flex items-center bg-gray-100 rounded-full p-1 text-xs">
              <button onClick={() => setNormalizedView(false)} className={`px-2 py-1 rounded-full transition-all duration-200 ${!normalizedView ? "bg-green-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>
                Absolute
              </button>
              <button onClick={() => setNormalizedView(true)} className={`px-2 py-1 rounded-full transition-all duration-200 ${normalizedView ? "bg-green-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>
                Normalized
              </button>
            </div>
          </div>
        </div>

        <div className="h-64">
          {studentStats ? (
            <DegreeWiseStudentsTable data={studentStats?.students} normalized={normalizedView} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <AiOutlineLoading3Quarters className="text-4xl text-blue-600 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Hostel Statistics section */}
      <div className="mb-6 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <BiBuildings className="mr-2 text-blue-500" /> Hostel Overview
          </h2>
        </div>

        <div className="h-64">
          {hostelStats ? (
            <HostelStatisticsTable data={hostelStats} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <AiOutlineLoading3Quarters className="text-4xl text-blue-600 animate-spin" />
            </div>
          )}
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

// Table component for degree-wise student distribution
const DegreeWiseStudentsTable = ({ data, normalized = false }) => {
  if (!data?.degreeWise?.length) {
    return <div className="h-full flex items-center justify-center text-gray-500">No student data available</div>
  }

  const degreeData =
    data?.degreeWise?.map((item) => ({
      ...item,
      boys: item.boys || 0,
      girls: item.girls || 0,
      total: (item.boys || 0) + (item.girls || 0),
    })) || []

  return (
    <div className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-2 text-xs font-medium text-gray-600 text-left">Degree</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-600 text-center">Boys</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-600 text-center">Girls</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-600 text-center">Total</th>
            {normalized && (
              <>
                <th className="px-4 py-2 text-xs font-medium text-gray-600 text-center">Boys %</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-600 text-center">Girls %</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {degreeData.map((item, index) => {
            const boysPercent = item.total > 0 ? Math.round((item.boys / item.total) * 100) : 0
            const girlsPercent = item.total > 0 ? Math.round((item.girls / item.total) * 100) : 0

            return (
              <tr key={index} className="hover:bg-gray-50/70 transition">
                <td className="px-4 py-2 text-sm text-gray-800">{item.degree}</td>
                <td className="px-4 py-2 text-sm text-blue-700 text-center font-medium">{item.boys}</td>
                <td className="px-4 py-2 text-sm text-pink-700 text-center font-medium">{item.girls}</td>
                <td className="px-4 py-2 text-sm text-indigo-700 text-center font-semibold">{item.total}</td>
                {normalized && (
                  <>
                    <td className="px-4 py-2 text-sm text-blue-700 text-center font-medium">{boysPercent}%</td>
                    <td className="px-4 py-2 text-sm text-pink-700 text-center font-medium">{girlsPercent}%</td>
                  </>
                )}
              </tr>
            )
          })}

          {/* Totals row */}
          <tr className="bg-gray-50 font-medium">
            <td className="px-4 py-2 text-sm text-gray-900">Total</td>
            <td className="px-4 py-2 text-sm text-blue-800 text-center">{data?.totalBoys || 0}</td>
            <td className="px-4 py-2 text-sm text-pink-800 text-center">{data?.totalGirls || 0}</td>
            <td className="px-4 py-2 text-sm text-indigo-800 text-center">{data?.grandTotal || 0}</td>
            {normalized && (
              <>
                <td className="px-4 py-2 text-sm text-blue-800 text-center">{data?.grandTotal > 0 ? Math.round((data?.totalBoys / data?.grandTotal) * 100) : 0}%</td>
                <td className="px-4 py-2 text-sm text-pink-800 text-center">{data?.grandTotal > 0 ? Math.round((data?.totalGirls / data?.grandTotal) * 100) : 0}%</td>
              </>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// Hostel Statistics Table component
const HostelStatisticsTable = ({ data }) => {
  if (!data) {
    return <div className="h-full flex items-center justify-center text-gray-500">No hostel data available</div>
  }

  return (
    <div className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Name:</span>
              <span className="text-sm font-medium text-gray-800">{data.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm font-medium text-gray-800">{data.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Gender:</span>
              <span className="text-sm font-medium text-gray-800">{data.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Maintenance Issues:</span>
              <span className={`text-sm font-medium ${data.maintenanceIssues > 0 ? "text-red-600" : "text-green-600"}`}>{data.maintenanceIssues}</span>
            </div>
          </div>
        </div>

        {/* Room Statistics */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-800 border-b pb-2">Room Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Rooms:</span>
              <span className="text-sm font-medium text-gray-800">{data.totalRooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Rooms:</span>
              <span className="text-sm font-medium text-blue-600">{data.totalActiveRooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Occupied Rooms:</span>
              <span className="text-sm font-medium text-green-600">{data.occupiedRooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vacant Rooms:</span>
              <span className="text-sm font-medium text-orange-600">{data.vacantRooms}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity and Occupancy Statistics */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-center">
            <p className="text-xs text-blue-600 mb-1">Total Capacity</p>
            <p className="text-2xl font-bold text-blue-700">{data.capacity}</p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-center">
            <p className="text-xs text-green-600 mb-1">Occupancy Rate</p>
            <p className="text-2xl font-bold text-green-700">{data.occupancyRate?.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-center">
            <p className="text-xs text-purple-600 mb-1">Active Rooms Occupancy</p>
            <p className="text-2xl font-bold text-purple-700">{data.activeRoomsOccupancy}</p>
            <p className="text-xs text-gray-500 mt-1">of {data.activeRoomsCapacity}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardWarden
