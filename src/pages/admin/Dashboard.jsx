import React, { useState, useEffect } from "react"
import { FaUser, FaUsers, FaCalendarAlt, FaExclamationCircle } from "react-icons/fa"
import { BiBuildings } from "react-icons/bi"
import { TbBuildingCommunity } from "react-icons/tb"
import { MdDashboard, MdOutlineEvent, MdNotifications } from "react-icons/md"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { useAuth } from "../../contexts/AuthProvider"
import { dashboardApi } from "../../services/dashboardApi"

// Chart components
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend, PointElement, LineElement, LogarithmicScale } from "chart.js"
import { Bar, Doughnut } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, Title, ArcElement, Tooltip, Legend, PointElement, LineElement)

// Enhanced shimmer loader components
const ShimmerLoader = ({ height, width = "100%", className = "" }) => <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg ${className}`} style={{ height, width }}></div>

// Shimmer with blurred preview for charts
const ChartShimmer = ({ height, className = "" }) => (
  <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ height }}>
    <div className="absolute inset-0 bg-gray-100 backdrop-blur-sm"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-400 animate-spin"></div>
    </div>
    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-200 to-transparent"></div>
    <div className="absolute inset-0 animate-pulse opacity-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
  </div>
)

// Shimmer for tables
const TableShimmer = ({ rows = 4, className = "" }) => (
  <div className={`overflow-hidden rounded-lg ${className}`}>
    <div className="bg-gray-50 py-2 px-4 flex">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-1 px-2">
          <ShimmerLoader height="1rem" className="mb-1" />
        </div>
      ))}
    </div>

    {[...Array(rows)].map((_, i) => (
      <div key={i} className={`flex py-2 px-4 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
        {[...Array(4)].map((_, j) => (
          <div key={j} className="flex-1 px-2">
            <ShimmerLoader height="0.8rem" width={j === 0 ? "80%" : "50%"} className="mx-auto" />
          </div>
        ))}
      </div>
    ))}
  </div>
)

// Shimmer for stat cards
const StatCardShimmer = ({ className = "" }) => (
  <div className={`rounded-lg border-l-4 border-gray-300 bg-gray-50 p-4 ${className}`}>
    <div className="absolute right-2 top-2">
      <ShimmerLoader height="1rem" width="2rem" />
    </div>
    <div className="flex justify-center items-center h-full">
      <ShimmerLoader height="2.5rem" width="50%" className="mx-auto" />
    </div>
  </div>
)

// Shimmer for event cards
const EventCardShimmer = ({ count = 3, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300">
        <ShimmerLoader height="1rem" width="70%" className="mb-3" />
        <div className="flex justify-between">
          <ShimmerLoader height="0.8rem" width="40%" />
          <ShimmerLoader height="0.8rem" width="25%" />
        </div>
        <ShimmerLoader height="0.7rem" width="50%" className="mt-2" />
      </div>
    ))}
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentDate] = useState(new Date())
  const [studentView, setStudentView] = useState("degree") // Default to degree view
  const [normalizedView, setNormalizedView] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await dashboardApi.getAdminDashboardData()
        setDashboardData(response.data)
        setLoading(false)
        // Using dummy data for now
        // setTimeout(() => {
        //   setDashboardData(getDummyData())
        //   setLoading(false)
        // }, 1200) // Simulate API delay
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard statistics")
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Format date for header
  const formatHeaderDate = () => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return currentDate.toLocaleDateString(undefined, options)
  }

  return (
    <div className="px-6 py-6 flex-1 bg-gray-50">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <MdDashboard className="text-blue-600 text-2xl mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">{formatHeaderDate()}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {loading ? (
            <>
              <ShimmerLoader height="2rem" width="10rem" className="rounded-lg" />
              <ShimmerLoader height="2rem" width="10rem" className="rounded-lg" />
            </>
          ) : (
            <>
              <div className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                <MdNotifications className="mr-2" />
                <span>
                  <span className="font-semibold">{dashboardData?.complaints?.pending || 0}</span> pending complaints
                </span>
              </div>
              <div className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg">
                <FaCalendarAlt className="mr-2" />
                <span>
                  <span className="font-semibold">{dashboardData?.events?.length || 0}</span> upcoming events
                </span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Student data card */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 xl:col-span-2 h-[24rem]">
          {loading ? (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <ShimmerLoader height="1.5rem" width="60%" />
                <ShimmerLoader height="1.5rem" width="20%" className="rounded-full" />
              </div>
              <ChartShimmer height="calc(100% - 6rem)" />
              <div className="mt-4 grid grid-cols-3 gap-4">
                <ShimmerLoader height="3rem" className="rounded-lg" />
                <ShimmerLoader height="3rem" className="rounded-lg" />
                <ShimmerLoader height="3rem" className="rounded-lg" />
              </div>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="h-full flex flex-col">
              <h2 className="flex justify-between items-center text-lg font-semibold text-gray-700 mb-4">
                <div className="flex items-center">
                  <FaUsers className="mr-2 text-indigo-500" /> Student Distribution
                </div>

                <div className="flex items-center">
                  {/* View type toggle (normalized vs absolute) */}
                  <div className="flex items-center bg-gray-100 rounded-full p-1 text-xs">
                    <button onClick={() => setNormalizedView(false)} className={`px-2 py-1 rounded-full transition-all duration-200 ${!normalizedView ? "bg-green-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>
                      Absolute
                    </button>
                    <button onClick={() => setNormalizedView(true)} className={`px-2 py-1 rounded-full transition-all duration-200 ${normalizedView ? "bg-green-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>
                      Normalized
                    </button>
                  </div>

                  {/* Branch/Degree toggle hidden for now */}
                  {/* 
                  <div className="ml-2 flex items-center bg-gray-100 rounded-full p-1 text-sm">
                    <button
                      onClick={() => setStudentView('branch')}
                      className={`px-3 py-1 rounded-full transition-all duration-200 ${
                        studentView === 'branch' 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Branch
                    </button>
                    <button
                      onClick={() => setStudentView('degree')}
                      className={`px-3 py-1 rounded-full transition-all duration-200 ${
                        studentView === 'degree' 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Degree
                    </button>
                  </div>
                  */}
                </div>
              </h2>

              <div className="flex-1 flex flex-col">
                {/* Always use degree-wise chart */}
                <div className="h-3/4">
                  <DegreeWiseStudentsChart data={dashboardData?.students} normalized={normalizedView} />
                </div>

                {/* Summary totals */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Total Boys</p>
                    <p className="text-lg font-bold text-blue-600">{dashboardData?.students?.totalBoys}</p>
                  </div>
                  <div className="bg-pink-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Total Girls</p>
                    <p className="text-lg font-bold text-pink-600">{dashboardData?.students?.totalGirls}</p>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Grand Total</p>
                    <p className="text-lg font-bold text-indigo-600">{dashboardData?.students?.grandTotal}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hostel occupancy card */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 xl:col-span-2 h-[24rem]">
          {loading ? (
            <div className="h-full flex flex-col">
              <ShimmerLoader height="1.5rem" width="60%" className="mb-4" />
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="flex items-center justify-center">
                  <ChartShimmer height="140px" width="140px" className="rounded-full" />
                </div>
                <div className="col-span-2">
                  <TableShimmer rows={4} className="h-[16rem]" />
                </div>
              </div>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="h-full flex flex-col">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <TbBuildingCommunity className="mr-2 text-blue-600" /> Hostel Occupancy Overview
              </h2>

              <div className="flex-1 grid grid-cols-3 gap-4">
                {/* Hostel distribution chart - reduced size */}
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-[120px]">
                    <HostelOccupancyChart data={dashboardData?.hostels} />
                  </div>
                </div>

                {/* Hostel details table - increased width */}
                <div className="col-span-2 overflow-hidden">
                  {/* <div className="text-xs text-gray-500 font-medium mb-2">Detailed Occupancy Information</div> */}
                  <div className="overflow-x-auto max-h-[20rem] scrollbar-thin scrollbar-thumb-gray-300">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 text-left">Hostel</th>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 text-center">Capacity</th>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 text-center">Occupancy</th>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 text-center">Vacancy</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData?.hostels?.map((hostel, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-4 py-2 text-sm text-gray-800">{hostel.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600 text-center">{hostel.totalCapacity}</td>
                            <td className="px-4 py-2 text-sm text-blue-600 text-center font-medium">{hostel.currentOccupancy}</td>
                            <td className="px-4 py-2 text-sm text-emerald-600 text-center font-medium">{hostel.vacantCapacity}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-medium">
                          <td className="px-4 py-2 text-sm text-gray-800">Total</td>
                          <td className="px-4 py-2 text-sm text-gray-800 text-center">{dashboardData?.hostels?.reduce((sum, hostel) => sum + hostel.totalCapacity, 0)}</td>
                          <td className="px-4 py-2 text-sm text-blue-700 text-center">{dashboardData?.hostels?.reduce((sum, hostel) => sum + hostel.currentOccupancy, 0)}</td>
                          <td className="px-4 py-2 text-sm text-emerald-700 text-center">{dashboardData?.hostels?.reduce((sum, hostel) => sum + hostel.vacantCapacity, 0)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hostler vs Day Scholar Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-[20rem] xl:col-span-2">
          {loading ? (
            <div className="h-full flex flex-col">
              <ShimmerLoader height="1.5rem" width="60%" className="mb-4" />
              <ChartShimmer height="calc(100% - 2rem)" />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="h-full flex flex-col">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaUser className="mr-2 text-teal-600" /> Hostler vs Day Scholar
              </h2>

              <div className="flex-1 flex flex-col">
                <div className="flex-1">
                  <HostlerDayScholarChart data={dashboardData?.hostlerAndDayScholarCounts} />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-3 rounded-lg border-l-4 border-teal-400">
                    <p className="text-xs text-gray-600 mb-1">Hostlers</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-teal-700">{dashboardData?.hostlerAndDayScholarCounts?.hostler?.total}</span>
                      <div className="flex items-center text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md mr-1">B: {dashboardData?.hostlerAndDayScholarCounts?.hostler?.boys}</span>
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-md">G: {dashboardData?.hostlerAndDayScholarCounts?.hostler?.girls}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg border-l-4 border-orange-400">
                    <p className="text-xs text-gray-600 mb-1">Day Scholars</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-orange-700">{dashboardData?.hostlerAndDayScholarCounts?.dayScholar?.total}</span>
                      <div className="flex items-center text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md mr-1">B: {dashboardData?.hostlerAndDayScholarCounts?.dayScholar?.boys}</span>
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-md">G: {dashboardData?.hostlerAndDayScholarCounts?.dayScholar?.girls}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Complaints summary card */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-[20rem]">
          {loading ? (
            <div className="h-full flex flex-col">
              <ShimmerLoader height="1.5rem" width="60%" className="mb-6" />
              <div className="grid grid-cols-3 gap-3 mb-6">
                <StatCardShimmer className="relative h-24" />
                <StatCardShimmer className="relative h-24" />
                <StatCardShimmer className="relative h-24" />
              </div>
              <ShimmerLoader height="4rem" className="rounded-lg mt-auto" />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="h-full flex flex-col">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaExclamationCircle className="mr-2 text-amber-500" /> Complaints Overview
              </h2>

              <div className="flex-1 flex flex-col justify-center">
                {/* Simplified complaints stats with bigger numbers */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-400 p-4 flex flex-col items-center justify-center">
                    <div className="absolute right-0 top-0 bg-amber-400 text-white text-xs px-2 py-0.5 rounded-bl-md">Pending</div>
                    <p className="text-4xl font-bold text-amber-600 mt-2">{dashboardData?.complaints?.pending}</p>
                  </div>

                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400 p-4 flex flex-col items-center justify-center">
                    <div className="absolute right-0 top-0 bg-blue-400 text-white text-xs px-2 py-0.5 rounded-bl-md">In Progress</div>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{dashboardData?.complaints?.inProgress}</p>
                  </div>

                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-400 p-4 flex flex-col items-center justify-center">
                    <div className="absolute right-0 top-0 bg-green-400 text-white text-xs px-2 py-0.5 rounded-bl-md">Resolved Today</div>
                    <p className="text-4xl font-bold text-green-600 mt-2">{dashboardData?.complaints?.resolvedToday}</p>
                  </div>
                </div>

                {/* Total complaints indicator */}
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="text-gray-600">Total Active Complaints</span>
                  <p className="text-2xl font-bold text-gray-800">{dashboardData?.complaints?.pending + dashboardData?.complaints?.inProgress}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming events card */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-[20rem]">
          {loading ? (
            <div className="h-full flex flex-col">
              <ShimmerLoader height="1.5rem" width="60%" className="mb-4" />
              <div className="flex-1 overflow-hidden">
                <EventCardShimmer count={3} />
              </div>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="h-full flex flex-col">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <MdOutlineEvent className="mr-2 text-purple-600" /> Upcoming Events
              </h2>

              <div className="flex-1 overflow-hidden">
                <div className="overflow-y-auto max-h-[16rem] pr-1 scrollbar-thin scrollbar-thumb-gray-300">
                  {dashboardData?.events?.map((event) => (
                    <div key={event.id} className="mb-3 bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400 hover:shadow-sm transition-all">
                      <h3 className="font-medium text-purple-900">{event.title}</h3>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <FaCalendarAlt className="mr-1 text-xs" />
                          {formatDate(event.date)}
                        </div>
                        <div className="text-gray-600">{event.time}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{event.location}</div>
                    </div>
                  ))}

                  {dashboardData?.events?.length === 0 && <div className="text-center py-6 text-gray-500">No upcoming events</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function for date formatting
const formatDate = (dateString) => {
  const options = { month: "short", day: "numeric", year: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Chart components
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
          display: false, // Hide the y-axis labels
          precision: 0,
        },
        // Set y-axis scale based on view type
        suggestedMax: normalized ? 100 : Math.ceil(maxValue * 1.1),
        grid: {
          drawBorder: false, // Optional: removes the y-axis line
        },
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

const HostelOccupancyChart = ({ data }) => {
  const chartData = {
    labels: ["Occupied", "Vacant"],
    datasets: [
      {
        data: [data?.reduce((sum, hostel) => sum + hostel.currentOccupancy, 0), data?.reduce((sum, hostel) => sum + hostel.vacantCapacity, 0)],
        backgroundColor: ["#3B82F6", "#22C55E"],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 8,
          boxWidth: 8,
          boxHeight: 8,
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const value = context.raw
            const percentage = Math.round((value / total) * 100)
            return `${context.label}: ${percentage}%`
          },
        },
      },
    },
  }

  return <Doughnut data={chartData} options={options} />
}

// Add the new chart component for Hostler vs Day Scholar
const HostlerDayScholarChart = ({ data }) => {
  if (!data) return null

  // Generate a unique ID for the chart to avoid canvas reuse issues
  const chartId = `hostler-chart-${Math.random().toString(36).substr(2, 9)}`

  const chartData = {
    labels: ["Hostlers", "Day Scholars"],
    datasets: [
      {
        label: "Boys",
        data: [data.hostler.boys, data.dayScholar.boys],
        backgroundColor: "#3B82F6",
        barThickness: 25,
      },
      {
        label: "Girls",
        data: [data.hostler.girls, data.dayScholar.girls],
        backgroundColor: "#EC4899",
        barThickness: 25,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            // Use original data for tooltip values
            const originalValue = context.dataset.originalData ? context.dataset.originalData[context.dataIndex] : context.raw
            return `${context.dataset.label}: ${originalValue}`
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
          display: false, // Hide the y-axis labels
          precision: 0,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false, // Optional: removes the y-axis line
        },
      },
    },
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

export default Dashboard
