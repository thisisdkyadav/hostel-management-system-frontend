import React, { useState, useEffect } from "react"
import { FaUser, FaUsers, FaCalendarAlt, FaExclamationCircle } from "react-icons/fa"
import { BiBuildings } from "react-icons/bi"
import { TbBuildingCommunity } from "react-icons/tb"
import { MdDashboard, MdOutlineEvent, MdNotifications } from "react-icons/md"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { HiStatusOnline } from "react-icons/hi"
import { useAuth } from "../../contexts/AuthProvider"
import { dashboardApi } from "../../services/dashboardApi"
import { useOnlineUsers } from "../../hooks/useOnlineUsers"

// Chart components
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend, PointElement, LineElement, LogarithmicScale } from "chart.js"
import { Bar, Doughnut } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, Title, ArcElement, Tooltip, Legend, PointElement, LineElement)

// Enhanced shimmer loader components
const ShimmerLoader = ({ height, width = "100%", className = "" }) => <div className={`animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg shadow-sm ${className}`} style={{ height, width }} aria-hidden="true" />

// Shimmer with blurred preview for charts
const ChartShimmer = ({ height, className = "" }) => (
  <div className={`relative overflow-hidden rounded-xl border border-gray-200 ${className}`} style={{ height }} role="status" aria-label="Loading chart">
    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-400 animate-spin"></div>
    </div>
    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-100 to-transparent"></div>
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
  const [studentDataView, setStudentDataView] = useState("normal") // Toggle between "normal" and "registered"
  const [selectedHostels, setSelectedHostels] = useState([]) // Track selected hostels for total calculation

  // Fetch online users stats with auto-refresh every 5 seconds
  const { stats: onlineStats, loading: onlineLoading } = useOnlineUsers({
    autoFetch: true,
    refreshInterval: 5000, // Refresh every 5 seconds
  })

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

  // Initialize selected hostels when data loads
  useEffect(() => {
    if (dashboardData?.hostels) {
      setSelectedHostels(dashboardData.hostels.map((_, index) => index))
    }
  }, [dashboardData])

  // Toggle hostel selection
  const toggleHostelSelection = (index) => {
    setSelectedHostels((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  // Check if all hostels are selected
  const allHostelsSelected = dashboardData?.hostels ? selectedHostels.length === dashboardData.hostels.length : false

  // Format date for header
  const formatHeaderDate = () => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return currentDate.toLocaleDateString(undefined, options)
  }

  return (
    <div className="flex-1">
      {/* Modern Compact Header - Full Width with 0 margin */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="px-6 py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* Left Section - Dashboard Title & Stats */}
            <div className="flex items-center gap-5 flex-1">
              {/* Dashboard Title */}
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-semibold text-[#0b57d0] tracking-tight">Admin Dashboard</h1>
                  <p className="text-xs text-gray-500 mt-0.5">{formatHeaderDate()}</p>
                </div>
              </div>

              {/* Left area keeps title; stats moved to right header section */}
              <div />
            </div>

            {/* Right Section - Hostler vs Day Scholar Stats (moved) */}
            <div className="flex items-center gap-2.5 border-l border-gray-200 pl-5">
              {loading ? (
                <div className="flex gap-2.5">
                  <ShimmerLoader height="2.25rem" width="8.5rem" className="rounded-md" />
                  <ShimmerLoader height="2.25rem" width="8.5rem" className="rounded-md" />
                </div>
              ) : error ? (
                <div className="text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-1.5 text-xs">Error loading data</div>
              ) : (
                (() => {
                  // Safe access to degreeWise and registered data
                  const degreeWise = dashboardData?.students?.degreeWise || []

                  // Sum normal (actual) counts by gender and total
                  const normalSums = degreeWise.reduce(
                    (acc, d) => {
                      const boys = parseInt(d.boys) || 0
                      const girls = parseInt(d.girls) || 0
                      acc.boys += boys
                      acc.girls += girls
                      acc.total += boys + girls
                      return acc
                    },
                    { boys: 0, girls: 0, total: 0 }
                  )

                  // Sum registered counts; try multiple possible shapes
                  const registeredSums = degreeWise.reduce(
                    (acc, d) => {
                      // preferred: d.registered (object with boys/girls/total)
                      if (d.registered && typeof d.registered === "object") {
                        const rb = parseInt(d.registered.boys) || 0
                        const rg = parseInt(d.registered.girls) || 0
                        const rt = parseInt(d.registered.total) || rb + rg
                        acc.boys += rb
                        acc.girls += rg
                        acc.total += rt
                      } else if (d.registeredStudents != null) {
                        // older format: registeredStudents might be a number
                        const rt = parseInt(d.registeredStudents) || 0
                        // if no breakdown available, split evenly
                        const rb = Math.floor(rt / 2)
                        const rg = rt - rb
                        acc.boys += rb
                        acc.girls += rg
                        acc.total += rt
                      } else {
                        // fallback: use d.totalRegistered or d.total if available
                        const rt = parseInt(d.totalRegistered || d.registeredTotal || 0) || 0
                        const rb = Math.floor(rt / 2)
                        const rg = rt - rb
                        acc.boys += rb
                        acc.girls += rg
                        acc.total += rt
                      }

                      return acc
                    },
                    { boys: 0, girls: 0, total: 0 }
                  )

                  // Derive day scholar = registered - normal (per gender and total)
                  const dayScholar = {
                    boys: Math.max(0, registeredSums.boys - normalSums.boys),
                    girls: Math.max(0, registeredSums.girls - normalSums.girls),
                  }
                  dayScholar.total = Math.max(0, registeredSums.total - normalSums.total)

                  // Hostlers are the normal/actual counts (fallback to dashboardData if no degreeWise)
                  const hostler = {
                    boys: normalSums.boys || dashboardData?.hostlerAndDayScholarCounts?.hostler?.boys || 0,
                    girls: normalSums.girls || dashboardData?.hostlerAndDayScholarCounts?.hostler?.girls || 0,
                  }
                  hostler.total = normalSums.total || dashboardData?.hostlerAndDayScholarCounts?.hostler?.total || hostler.boys + hostler.girls

                  // Fallback for day scholar if registered info missing: use provided counts
                  const finalDayScholar = {
                    boys: dayScholar.boys || dashboardData?.hostlerAndDayScholarCounts?.dayScholar?.boys || 0,
                    girls: dayScholar.girls || dashboardData?.hostlerAndDayScholarCounts?.dayScholar?.girls || 0,
                  }
                  finalDayScholar.total = dayScholar.total || dashboardData?.hostlerAndDayScholarCounts?.dayScholar?.total || finalDayScholar.boys + finalDayScholar.girls

                  return (
                    <div className="flex items-center gap-2.5">
                      {/* Hostlers Card - Compact */}
                      <div className="bg-white border border-gray-200 rounded-md px-3 py-1.5 hover:border-[#1360AB] transition-all">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-[#1360AB] text-sm" />
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Hostlers</p>
                              <p className="text-lg font-bold text-gray-900 leading-none">{hostler.total}</p>
                            </div>
                            <div className="flex gap-1 ml-1.5 border-l border-gray-200 pl-2">
                              <span className="px-1.5 py-0.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">B {hostler.boys}</span>
                              <span className="px-1.5 py-0.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">G {hostler.girls}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Day Scholars Card - Compact */}
                      <div className="bg-white border border-gray-200 rounded-md px-3 py-1.5 hover:border-[#1360AB] transition-all">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-[#1360AB] text-sm" />
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Day Scholars</p>
                              <p className="text-lg font-bold text-gray-900 leading-none">{finalDayScholar.total}</p>
                            </div>
                            <div className="flex gap-1 ml-1.5 border-l border-gray-200 pl-2">
                              <span className="px-1.5 py-0.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">B {finalDayScholar.boys}</span>
                              <span className="px-1.5 py-0.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">G {finalDayScholar.girls}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Online Users Card - Compact (Rightmost) */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-md px-3 py-1.5 hover:border-green-400 transition-all">
                        <div className="flex items-center gap-2">
                          <HiStatusOnline className="text-green-600 text-sm animate-pulse" />
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Online Now</p>
                              <p className="text-lg font-bold text-green-800 leading-none">{onlineStats?.totalOnline || 0}</p>
                            </div>
                            <div className="flex gap-1 ml-1.5 border-l border-green-300 pl-2">
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium" title="Students online">
                                S: {onlineStats?.byRole?.Student || 0}
                              </span>
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium" title="Hostel Supervisors online">
                                HS: {onlineStats?.byRole?.["Hostel Supervisor"] || 0}
                              </span>
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium" title="Admins online">
                                A: {onlineStats?.byRole?.Admin || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with padding */}
      <div className="px-6 py-6">
        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Student data card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all duration-300 xl:col-span-2 h-[24rem] p-3">
            {loading ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <ShimmerLoader height="1.25rem" width="50%" />
                  <ShimmerLoader height="1.75rem" width="8rem" className="rounded-full" />
                </div>
                <TableShimmer rows={6} className="flex-1" />
              </div>
            ) : error ? (
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
            ) : (
              <div className="h-full flex flex-col overflow-auto">
                <h2 className="flex justify-between items-center text-sm font-semibold text-gray-800 mb-1.5 leading-tight">
                  <div className="flex items-center">Student Distribution</div>

                  <div className="flex items-center space-x-2">
                    {/* Normal/Registered Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-full p-0.5 text-[0.8125rem] shadow-inner" role="tablist" aria-label="Student data type">
                      <button onClick={() => setStudentDataView("normal")} className={`px-2.5 py-1 rounded-full transition-all duration-200 ${studentDataView === "normal" ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-200"}`} aria-selected={studentDataView === "normal"}>
                        Hostler
                      </button>
                      <button
                        onClick={() => setStudentDataView("registered")}
                        className={`px-2.5 py-1 rounded-full transition-all duration-200 ${studentDataView === "registered" ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-200"}`}
                        aria-selected={studentDataView === "registered"}
                      >
                        Registered
                      </button>
                    </div>

                    {/* Absolute/Normalized Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-full p-0.5 text-[0.8125rem] shadow-inner" role="tablist" aria-label="Distribution mode">
                      <button onClick={() => setNormalizedView(false)} className={`px-2.5 py-1 rounded-full transition-all duration-200 ${!normalizedView ? "bg-green-600 text-white shadow" : "text-gray-700 hover:bg-gray-200"}`} aria-selected={!normalizedView}>
                        Absolute
                      </button>
                      <button onClick={() => setNormalizedView(true)} className={`px-2.5 py-1 rounded-full transition-all duration-200 ${normalizedView ? "bg-green-600 text-white shadow" : "text-gray-700 hover:bg-gray-200"}`} aria-selected={!!normalizedView}>
                        Normalized
                      </button>
                    </div>
                  </div>
                </h2>

                <div className="flex-1 flex flex-col">
                  <div className="h-full">
                    <DegreeWiseStudentsChart data={dashboardData?.students} normalized={normalizedView} studentDataView={studentDataView} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hostel occupancy card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all duration-300 xl:col-span-2 h-[24rem] p-3">
            {loading ? (
              <div className="h-full flex flex-col">
                <ShimmerLoader height="1.25rem" width="50%" className="mb-4" />
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-center">
                    <ChartShimmer height="140px" className="rounded-full" />
                  </div>
                  <div className="col-span-2">
                    <TableShimmer rows={4} className="h-[16rem]" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
            ) : (
              <div className="h-full flex flex-col">
                <h2 className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center leading-tight">
                  <BiBuildings className="mr-1.5 text-[#1360AB] text-base" />
                  Hostel Occupancy Overview
                </h2>

                <div className="flex-1 overflow-hidden">
                  <div className="overflow-x-auto max-h-[21rem] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2 text-[0.8125rem] font-semibold text-gray-700 text-left uppercase tracking-wide">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={allHostelsSelected}
                                onChange={() => {
                                  if (allHostelsSelected) {
                                    setSelectedHostels([])
                                  } else {
                                    setSelectedHostels(dashboardData.hostels.map((_, index) => index))
                                  }
                                }}
                                className="w-3.5 h-3.5 text-[#1360AB] bg-white border-gray-300 rounded focus:ring-[#1360AB] focus:ring-2 cursor-pointer"
                              />
                              Hostel
                            </div>
                          </th>
                          <th className="px-2 py-2 text-[0.8125rem] font-semibold text-gray-700 text-center uppercase tracking-wide">Rooms</th>
                          <th className="px-2 py-2 text-[0.8125rem] font-semibold text-gray-700 text-center uppercase tracking-wide">Capacity</th>
                          <th className="px-2 py-2 text-[0.8125rem] font-semibold text-gray-700 text-center uppercase tracking-wide">Occupancy</th>
                          <th className="px-2 py-2 text-[0.8125rem] font-semibold text-gray-700 text-center uppercase tracking-wide">Vacancy</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {dashboardData?.hostels?.map((hostel, index) => (
                          <tr key={index} className={`hover:bg-blue-50/30 transition-colors ${selectedHostels.includes(index) ? "bg-white" : "bg-gray-50/50"}`}>
                            <td className="px-3 py-1.5">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedHostels.includes(index)}
                                  onChange={() => toggleHostelSelection(index)}
                                  className={`w-3.5 h-3.5 text-[#1360AB] bg-white border-gray-300 rounded focus:ring-[#1360AB] focus:ring-2 cursor-pointer transition-opacity ${allHostelsSelected ? "opacity-30" : "opacity-100"}`}
                                />
                                <span className={`text-[0.8125rem] font-medium ${selectedHostels.includes(index) ? "text-gray-800" : "text-gray-500"}`}>{hostel.name}</span>
                              </div>
                            </td>
                            <td className="px-2 py-1.5 text-[0.8125rem] text-gray-700 text-center font-medium">{hostel.totalRooms}</td>
                            <td className="px-2 py-1.5 text-[0.8125rem] text-gray-700 text-center font-medium">{hostel.totalCapacity}</td>
                            <td className="px-2 py-1.5 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.8125rem] font-semibold bg-blue-100 text-blue-800">{hostel.currentOccupancy}</span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.8125rem] font-semibold bg-emerald-100 text-emerald-800">{hostel.vacantCapacity}</span>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gradient-to-r from-gray-100 to-gray-50 font-semibold border-t-2 border-gray-300">
                          <td className="px-3 py-2 text-[0.8125rem] text-gray-900">
                            <div className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5"></div>
                              <span className="uppercase tracking-wide font-bold">Total {selectedHostels.length > 0 && selectedHostels.length < (dashboardData?.hostels?.length || 0) && `(${selectedHostels.length})`}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-[0.8125rem] text-gray-900 text-center font-bold">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.totalRooms, 0) || 0}</td>
                          <td className="px-2 py-2 text-[0.8125rem] text-gray-900 text-center font-bold">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.totalCapacity, 0) || 0}</td>
                          <td className="px-2 py-2 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.8125rem] font-bold bg-blue-200 text-blue-900">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.currentOccupancy, 0) || 0}</span>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.8125rem] font-bold bg-emerald-200 text-emerald-900">
                              {dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.vacantCapacity, 0) || 0}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Leaves card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all duration-300 xl:col-span-2 h-[24rem] p-3">
            {loading ? (
              <div className="h-full flex flex-col">
                <ShimmerLoader height="1.25rem" width="50%" className="mb-4" />
                <TableShimmer rows={4} className="flex-1" />
              </div>
            ) : error ? (
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
            ) : (
              <div className="h-full flex flex-col">
                <h2 className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center leading-tight">
                  <FaCalendarAlt className="mr-1.5 text-[#1360AB] text-base" />
                  Upcoming Joins (from Leaves)
                </h2>

                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {!dashboardData?.leaves || !dashboardData.leaves.data || (dashboardData.leaves.data.leaves || []).length === 0 ? (
                    <p className="text-[0.8125rem] text-gray-500">No recent leaves</p>
                  ) : (
                    <ul className="space-y-2">
                      {dashboardData.leaves.data.leaves.map((lv) => {
                        const name = lv?.userId?.name || lv?.userId?.email || "Unknown"
                        // compute joining date = endDate + 1 day
                        let joinDate = ""
                        try {
                          const end = lv && lv.endDate ? new Date(lv.endDate) : null
                          if (end) {
                            const j = new Date(end)
                            j.setDate(j.getDate() + 1)
                            joinDate = j.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                          }
                        } catch (e) {
                          joinDate = "Invalid date"
                        }

                        return (
                          <li key={lv._id} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-white rounded-lg p-2.5 border border-gray-100 hover:border-gray-300 transition-all">
                            <div>
                              <p className="text-[0.8125rem] font-semibold text-gray-800">{name}</p>
                              <p className="text-[0.75rem] text-gray-500 mt-0.5">Leave ends: {lv.endDate ? new Date(lv.endDate).toLocaleDateString() : "—"}</p>
                            </div>

                            <div className="text-right">
                              <p className="text-[0.8125rem] text-green-700 font-bold">Join: {joinDate || "—"}</p>
                              <p className="text-[0.75rem] text-gray-500 mt-0.5">Status: {lv.joinStatus || lv.status || "—"}</p>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Complaints summary card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all duration-300 h-[20rem] p-3">
            {loading ? (
              <div className="h-full flex flex-col">
                <ShimmerLoader height="1.25rem" width="50%" className="mb-4" />
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <StatCardShimmer className="relative h-16" />
                  <StatCardShimmer className="relative h-16" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <StatCardShimmer className="relative h-16" />
                  <StatCardShimmer className="relative h-16" />
                  <StatCardShimmer className="relative h-16" />
                </div>
                <ShimmerLoader height="3rem" className="rounded-lg mt-auto" />
              </div>
            ) : error ? (
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
            ) : (
              <div className="h-full flex flex-col">
                <h2 className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center leading-tight">
                  <FaExclamationCircle className="mr-1.5 text-[#1360AB] text-base" />
                  Complaints Overview
                </h2>

                <div className="flex-1 flex flex-col justify-center">
                  {/* Top row - Primary stats */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="relative overflow-hidden rounded-xl bg-white border border-amber-100 p-2 flex flex-col items-center justify-center shadow-sm">
                      <div className="absolute right-0 top-0 bg-amber-100 text-amber-700 text-[0.65rem] px-1.5 py-0.5 rounded-bl-md font-medium">Pending</div>
                      <p className="text-2xl font-extrabold text-amber-700 mt-1">{dashboardData?.complaints?.pending || 0}</p>
                    </div>

                    <div className="relative overflow-hidden rounded-xl bg-white border border-blue-100 p-2 flex flex-col items-center justify-center shadow-sm">
                      <div className="absolute right-0 top-0 bg-blue-100 text-blue-700 text-[0.65rem] px-1.5 py-0.5 rounded-bl-md font-medium">In Progress</div>
                      <p className="text-2xl font-extrabold text-blue-700 mt-1">{dashboardData?.complaints?.inProgress || 0}</p>
                    </div>
                  </div>

                  {/* Bottom row - Secondary stats */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="relative overflow-hidden rounded-lg bg-white border border-purple-100 p-2 flex flex-col items-center justify-center shadow-sm">
                      <div className="absolute right-0 top-0 bg-purple-100 text-purple-700 text-[0.65rem] px-1.5 py-0.5 rounded-bl-md font-medium">IDO</div>
                      <p className="text-xl font-bold text-purple-700 mt-1">{dashboardData?.complaints?.forwardedToIDO || 0}</p>
                    </div>

                    <div className="relative overflow-hidden rounded-lg bg-white border border-emerald-100 p-2 flex flex-col items-center justify-center shadow-sm">
                      <div className="absolute right-0 top-0 bg-emerald-100 text-emerald-700 text-[0.65rem] px-1.5 py-0.5 rounded-bl-md font-medium">Today</div>
                      <p className="text-xl font-bold text-emerald-700 mt-1">{dashboardData?.complaints?.resolvedToday || 0}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-r from-gray-50 to-white p-2.5 rounded-xl border border-gray-200 shadow-sm text-center">
                    <span className="text-gray-600 text-[0.8125rem] font-medium">Active for more than 20 days</span>
                    <p className="text-xl font-bold text-gray-900 mt-0.5">{dashboardData?.complaints?.overdueCount || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming events card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all duration-300 h-[20rem] p-3">
            {loading ? (
              <div className="h-full flex flex-col">
                <ShimmerLoader height="1.25rem" width="50%" className="mb-4" />
                <div className="flex-1 overflow-hidden">
                  <EventCardShimmer count={3} />
                </div>
              </div>
            ) : error ? (
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
            ) : (
              <div className="h-full flex flex-col">
                <h2 className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center leading-tight">
                  <MdOutlineEvent className="mr-1.5 text-[#1360AB] text-base" />
                  Upcoming Events
                </h2>

                <div className="flex-1 overflow-hidden">
                  <div className="overflow-y-auto max-h-[17rem] pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {dashboardData?.events?.map((event) => (
                      <div key={event.id} className="mb-2 bg-gradient-to-r from-purple-50 to-white p-2.5 rounded-xl border border-purple-200 hover:shadow-sm hover:border-purple-300 transition-all">
                        <h3 className="font-semibold text-[0.8125rem] text-purple-900">{event.title}</h3>
                        <div className="flex justify-between items-center mt-1.5 text-[0.75rem]">
                          <div className="flex items-center text-gray-600">
                            <FaCalendarAlt className="mr-1 text-[0.65rem]" />
                            {formatDate(event.date)}
                          </div>
                          <div className="text-gray-600 font-medium">{event.time}</div>
                        </div>
                        <div className="text-[0.75rem] text-gray-500 mt-1">{event.location}</div>
                      </div>
                    ))}

                    {dashboardData?.events?.length === 0 && <div className="text-center py-6 text-[0.8125rem] text-gray-500">No upcoming events</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
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
const DegreeWiseStudentsChart = ({ data, normalized = false, studentDataView = "normal" }) => {
  if (!data?.degreeWise?.length) return <div className="h-full flex items-center justify-center text-gray-500">No student data available</div>

  const degreeData =
    data?.degreeWise?.map((item) => {
      // Choose which data to display based on studentDataView toggle
      let displayBoys, displayGirls, displayTotal
      if (studentDataView === "registered") {
        // Show registered students data from settings
        const registeredData = item.registeredStudents
        const registered = item?.registered || null
        if (registered !== null) {
          displayBoys = registered.boys || 0
          displayGirls = registered.girls || 0
          displayTotal = registered.total || 0
        } else {
          // If old format or no breakdown available, show total as boys+girls split evenly or 0
          const total = parseInt(registeredData) || 0
          displayBoys = Math.floor(total / 2)
          displayGirls = Math.ceil(total / 2)
          displayTotal = total
        }
      } else {
        // Show normal/actual students data (default)
        displayBoys = item.boys || 0
        displayGirls = item.girls || 0
        displayTotal = displayBoys + displayGirls
      }

      return {
        ...item,
        boys: displayBoys,
        girls: displayGirls,
        total: displayTotal,
      }
    }) || []

  return (
    <div className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2 text-[0.8125rem] font-semibold text-gray-700 text-left uppercase tracking-wide">Degree</th>
            <th className="px-2 py-2 text-[0.8125rem] font-semibold text-gray-700 text-center uppercase tracking-wide">Boys</th>
            <th className="px-2 py-2 text-[0.8125rem] font-semibold text-gray-700 text-center uppercase tracking-wide">Girls</th>
            <th className="px-2 py-2 text-[0.8125rem] font-semibold text-gray-700 text-center uppercase tracking-wide">Total</th>
            {normalized && (
              <>
                <th className="px-2 py-2 text-[0.8125rem] font-semibold text-gray-700 text-center uppercase tracking-wide">Boys %</th>
                <th className="px-2 py-2 text-[0.8125rem] font-semibold text-gray-700 text-center uppercase tracking-wide">Girls %</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {degreeData.map((item, index) => {
            const boysPercent = item.total > 0 ? Math.round((item.boys / item.total) * 100) : 0
            const girlsPercent = item.total > 0 ? Math.round((item.girls / item.total) * 100) : 0

            return (
              <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-3 py-1.5 text-[0.8125rem] text-gray-800 font-medium">{item.degree}</td>
                <td className="px-2 py-1.5 text-[0.8125rem] text-blue-700 text-center font-medium">{item.boys}</td>
                <td className="px-2 py-1.5 text-[0.8125rem] text-pink-700 text-center font-medium">{item.girls}</td>
                <td className="px-2 py-1.5 text-[0.8125rem] text-indigo-700 text-center font-semibold">{item.total}</td>
                {normalized && (
                  <>
                    <td className="px-2 py-1.5 text-[0.8125rem] text-blue-700 text-center font-medium">{boysPercent}%</td>
                    <td className="px-2 py-1.5 text-[0.8125rem] text-pink-700 text-center font-medium">{girlsPercent}%</td>
                  </>
                )}
              </tr>
            )
          })}

          {/* Totals row */}
          <tr className="bg-gradient-to-r from-gray-100 to-gray-50 font-semibold border-t-2 border-gray-300">
            <td className="px-3 py-2 text-[0.8125rem] text-gray-900 font-bold uppercase tracking-wide">Total</td>
            <td className="px-2 py-2 text-[0.8125rem] text-blue-800 text-center font-bold">
              {(() => {
                if (studentDataView === "registered") {
                  // Calculate total registered boys from all degrees
                  return degreeData.reduce((sum, item) => sum + (item.boys || 0), 0)
                } else {
                  return data?.totalBoys || 0
                }
              })()}
            </td>
            <td className="px-2 py-2 text-[0.8125rem] text-pink-800 text-center font-bold">
              {(() => {
                if (studentDataView === "registered") {
                  // Calculate total registered girls from all degrees
                  return degreeData.reduce((sum, item) => sum + (item.girls || 0), 0)
                } else {
                  return data?.totalGirls || 0
                }
              })()}
            </td>
            <td className="px-2 py-2 text-[0.8125rem] text-indigo-800 text-center font-bold">
              {(() => {
                if (studentDataView === "registered") {
                  // Calculate total registered students from all degrees
                  return degreeData.reduce((sum, item) => sum + (item.total || 0), 0)
                } else {
                  return data?.grandTotal || 0
                }
              })()}
            </td>
            {normalized && (
              <>
                <td className="px-2 py-2 text-[0.8125rem] text-blue-800 text-center font-bold">
                  {(() => {
                    let totalBoys, grandTotal
                    if (studentDataView === "registered") {
                      totalBoys = degreeData.reduce((sum, item) => sum + (item.boys || 0), 0)
                      grandTotal = degreeData.reduce((sum, item) => sum + (item.total || 0), 0)
                    } else {
                      totalBoys = data?.totalBoys || 0
                      grandTotal = data?.grandTotal || 0
                    }
                    return grandTotal > 0 ? Math.round((totalBoys / grandTotal) * 100) : 0
                  })()}
                  %
                </td>
                <td className="px-2 py-2 text-[0.8125rem] text-pink-800 text-center font-bold">
                  {(() => {
                    let totalGirls, grandTotal
                    if (studentDataView === "registered") {
                      totalGirls = degreeData.reduce((sum, item) => sum + (item.girls || 0), 0)
                      grandTotal = degreeData.reduce((sum, item) => sum + (item.total || 0), 0)
                    } else {
                      totalGirls = data?.totalGirls || 0
                      grandTotal = data?.grandTotal || 0
                    }
                    return grandTotal > 0 ? Math.round((totalGirls / grandTotal) * 100) : 0
                  })()}
                  %
                </td>
              </>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  )
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
            const originalValue = context.dataset.originalData ? context.dataset.originalData[context.dataIndex] : context.raw
            return `${context.dataset.label}: ${originalValue}`
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { display: false, precision: 0 },
        grid: { color: "rgba(0, 0, 0, 0.05)", drawBorder: false },
      },
    },
    barPercentage: 0.75,
    categoryPercentage: 0.6,
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
