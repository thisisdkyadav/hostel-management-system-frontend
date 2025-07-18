import { useState, useEffect } from "react"
import { statsApi } from "../../services/apiService"
import { dashboardApi } from "../../services/dashboardApi"
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
  const [normalizedView, setNormalizedView] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true)

        const [lostAndFoundData, eventsData, visitorData, studentData] = await Promise.all([statsApi.getLostAndFoundStats(), statsApi.getEventStats(profile?.hostelId?._id), statsApi.getVisitorStats(profile?.hostelId?._id), dashboardApi.getStudentStatistics()])

        setLostFoundStats(lostAndFoundData)
        setEventStats(eventsData)
        setVisitorStats(visitorData)
        setStudentStats({ students: studentData.data })
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
            <DegreeWiseStudentsChart data={studentStats?.students} normalized={normalizedView} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <AiOutlineLoading3Quarters className="text-4xl text-blue-600 animate-spin" />
            </div>
          )}
        </div>

        {studentStats && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-2 rounded-lg">
              <p className="text-xs text-gray-500">Total Boys</p>
              <p className="text-lg font-bold text-blue-600">{studentStats?.students?.totalBoys || 0}</p>
            </div>
            <div className="bg-pink-50 p-2 rounded-lg">
              <p className="text-xs text-gray-500">Total Girls</p>
              <p className="text-lg font-bold text-pink-600">{studentStats?.students?.totalGirls || 0}</p>
            </div>
            <div className="bg-indigo-50 p-2 rounded-lg">
              <p className="text-xs text-gray-500">Grand Total</p>
              <p className="text-lg font-bold text-indigo-600">{studentStats?.students?.grandTotal || 0}</p>
            </div>
          </div>
        )}
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

// Chart component for degree-wise student distribution
const DegreeWiseStudentsChart = ({ data, normalized = false }) => {
  // Prepare data for absolute or normalized view
  let labels = data?.degreeWise?.map((item) => item.degree) || []
  let boysData, girlsData

  if (normalized) {
    // For normalized view, convert to percentages
    boysData =
      data?.degreeWise?.map((item) => {
        const total = item.boys + item.girls
        return total > 0 ? Math.round((item.boys / total) * 100) : 0
      }) || []

    girlsData =
      data?.degreeWise?.map((item) => {
        const total = item.boys + item.girls
        return total > 0 ? Math.round((item.girls / total) * 100) : 0
      }) || []
  } else {
    // For absolute view, use raw numbers
    boysData = data?.degreeWise?.map((item) => item.boys) || []
    girlsData = data?.degreeWise?.map((item) => item.girls) || []
  }

  // Generate a unique ID for the chart to avoid canvas reuse issues
  const chartId = `degree-chart-${normalized ? "normalized" : "absolute"}-${Math.random().toString(36).substr(2, 9)}`

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: normalized ? "Boys %" : "Boys",
        data: boysData,
        backgroundColor: "#3B82F6",
        barThickness: 20,
      },
      {
        label: normalized ? "Girls %" : "Girls",
        data: girlsData,
        backgroundColor: "#EC4899",
        barThickness: 20,
      },
    ],
  }

  // Find max value to set appropriate scale
  const allValues = [...boysData, ...girlsData]
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 100

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            // Use original data for tooltip values
            const originalValue = context.dataset.originalData ? context.dataset.originalData[context.dataIndex] : context.raw
            return `${context.dataset.label}: ${originalValue}${normalized ? "%" : ""}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          callback: function (value) {
            return value + (normalized ? "%" : "")
          },
        },
        // Set y-axis scale based on view type
        suggestedMax: normalized ? 100 : Math.ceil(maxValue * 1.1),
      },
    },
    // Only set minBarLength for non-zero values
    barPercentage: 0.8,
  }

  // Process each dataset to apply square root transformation for better visualization
  chartData.datasets = chartData.datasets.map((dataset) => {
    // Find the maximum value in this dataset for scaling
    const maxDatasetValue = Math.max(...dataset.data.filter((v) => v > 0), 1)

    // Apply a square root transformation to make small values more visible
    // while maintaining the relative differences between large values
    const processedData = dataset.data.map((value) => {
      if (value === 0) return null // Null values won't be drawn

      // Apply square root transformation to make small values more visible
      // We multiply by a factor to maintain a reasonable scale
      const scaleFactor = Math.sqrt(maxDatasetValue)
      return Math.sqrt(value) * scaleFactor
    })

    // Store original values for tooltips
    const originalData = [...dataset.data]

    return {
      ...dataset,
      data: processedData,
      originalData: originalData, // Store original data for tooltips
    }
  })

  return <Bar data={chartData} options={options} />
}

export default DashboardWarden
