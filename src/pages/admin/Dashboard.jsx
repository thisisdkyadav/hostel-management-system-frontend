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
import DashboardHeader from "../../components/headers/DashboardHeader"
import Card from "../../components/common/Card"

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

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader>
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
              <div className="flex items-center gap-2.5 border-l border-gray-200 pl-5">
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
      </DashboardHeader>

      {/* Main Content with padding */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Student data card */}
          <Card className="xl:col-span-2 h-[24rem]" padding="p-2.5">
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
                {/* Compact Header */}
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-[0.8125rem] font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-1 h-4 bg-[#1360AB] rounded-full"></span>
                    Student Distribution
                  </h2>
                  <div className="flex items-center gap-1.5">
                    {/* Normal/Registered Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-full p-0.5 text-[0.7rem]" role="tablist">
                      <button 
                        onClick={() => setStudentDataView("normal")} 
                        className={`px-2.5 py-1 rounded-full transition-all duration-150 font-medium ${studentDataView === "normal" ? "bg-[#1360AB] text-white" : "text-gray-600 hover:bg-gray-200"}`} 
                      >
                        Hostler
                      </button>
                      <button
                        onClick={() => setStudentDataView("registered")}
                        className={`px-2.5 py-1 rounded-full transition-all duration-150 font-medium ${studentDataView === "registered" ? "bg-[#1360AB] text-white" : "text-gray-600 hover:bg-gray-200"}`}
                      >
                        Registered
                      </button>
                    </div>
                    {/* Absolute/Normalized Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-full p-0.5 text-[0.7rem]" role="tablist">
                      <button 
                        onClick={() => setNormalizedView(false)} 
                        className={`px-2.5 py-1 rounded-full transition-all duration-150 font-medium ${!normalizedView ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-200"}`} 
                      >
                        Abs
                      </button>
                      <button 
                        onClick={() => setNormalizedView(true)} 
                        className={`px-2.5 py-1 rounded-full transition-all duration-150 font-medium ${normalizedView ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-200"}`} 
                      >
                        %
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <div className="h-full">
                    <DegreeWiseStudentsChart data={dashboardData?.students} normalized={normalizedView} studentDataView={studentDataView} />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Hostel occupancy card */}
          <Card className="xl:col-span-2 h-[24rem]" padding="p-2.5">
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
                {/* Compact Header */}
                <h2 className="text-[0.8125rem] font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                  <span className="w-1 h-4 bg-[#1360AB] rounded-full"></span>
                  <BiBuildings className="text-[#1360AB] text-sm" />
                  Hostel Occupancy
                </h2>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  <div className="rounded-[14px] border border-gray-200 flex flex-col h-full min-h-0 overflow-hidden">
                    {/* Fixed Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200 flex-shrink-0">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-[0.7rem] font-bold text-gray-600 text-left uppercase tracking-wider w-[40%]">
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
                                  className="w-3.5 h-3.5 text-[#1360AB] bg-white border-gray-300 rounded focus:ring-[#1360AB] focus:ring-1 cursor-pointer accent-[#1360AB]"
                                />
                                Hostel
                              </div>
                            </th>
                            <th className="px-2 py-2 text-[0.7rem] font-bold text-gray-600 text-center uppercase tracking-wider w-[15%]">Rooms</th>
                            <th className="px-2 py-2 text-[0.7rem] font-bold text-gray-600 text-center uppercase tracking-wider w-[15%]">Capacity</th>
                            <th className="px-2 py-2 text-[0.7rem] font-bold text-gray-600 text-center uppercase tracking-wider w-[15%]">Occupied</th>
                            <th className="px-2 py-2 text-[0.7rem] font-bold text-gray-600 text-center uppercase tracking-wider w-[15%]">Vacant</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    
                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <table className="min-w-full">
                        <tbody className="bg-white divide-y divide-gray-50">
                          {dashboardData?.hostels?.map((hostel, index) => {
                            return (
                              <tr key={index} className={`group hover:bg-blue-50/50 transition-all duration-150 ${selectedHostels.includes(index) ? "bg-white" : "bg-gray-50/30"}`}>
                                <td className="px-3 py-1.5 w-[40%]">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedHostels.includes(index)}
                                      onChange={() => toggleHostelSelection(index)}
                                      className={`w-3.5 h-3.5 text-[#1360AB] bg-white border-gray-300 rounded focus:ring-[#1360AB] focus:ring-1 cursor-pointer accent-[#1360AB] transition-opacity ${allHostelsSelected ? "opacity-40" : "opacity-100"}`}
                                    />
                                    <span className={`text-[0.8125rem] font-semibold transition-colors ${selectedHostels.includes(index) ? "text-gray-800 group-hover:text-[#1360AB]" : "text-gray-500"}`}>{hostel.name}</span>
                                  </div>
                                </td>
                                <td className="px-2 py-1.5 text-[0.8125rem] text-gray-600 text-center font-medium tabular-nums w-[15%]">{hostel.totalRooms}</td>
                                <td className="px-2 py-1.5 text-[0.8125rem] text-gray-600 text-center font-medium tabular-nums w-[15%]">{hostel.totalCapacity}</td>
                                <td className="px-2 py-1.5 text-[0.8125rem] text-blue-700 text-center font-bold tabular-nums w-[15%]">{hostel.currentOccupancy}</td>
                                <td className="px-2 py-1.5 text-[0.8125rem] text-emerald-700 text-center font-bold tabular-nums w-[15%]">{hostel.vacantCapacity}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Fixed Footer */}
                    <div className="bg-gradient-to-r from-slate-100 to-gray-100 border-t-2 border-gray-300 flex-shrink-0">
                      <table className="min-w-full">
                        <tfoot>
                          <tr>
                            <td className="px-3 py-2 text-[0.75rem] text-gray-900 w-[40%]">
                              <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5"></div>
                                <div className="flex items-center gap-1.5">
                                  <span className="uppercase tracking-wider font-extrabold">Total</span>
                                  {selectedHostels.length > 0 && selectedHostels.length < (dashboardData?.hostels?.length || 0) && (
                                    <span className="px-1.5 py-0.5 bg-[#1360AB] text-white text-[0.65rem] rounded font-bold">{selectedHostels.length}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-2 text-[0.8125rem] text-gray-900 text-center font-extrabold tabular-nums w-[15%]">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.totalRooms, 0) || 0}</td>
                            <td className="px-2 py-2 text-[0.8125rem] text-gray-900 text-center font-extrabold tabular-nums w-[15%]">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.totalCapacity, 0) || 0}</td>
                            <td className="px-2 py-2 text-[0.8125rem] text-blue-800 text-center font-extrabold tabular-nums w-[15%]">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.currentOccupancy, 0) || 0}</td>
                            <td className="px-2 py-2 text-[0.8125rem] text-emerald-800 text-center font-extrabold tabular-nums w-[15%]">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.vacantCapacity, 0) || 0}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Staff Leaves card */}
          <Card className="xl:col-span-2 h-[24rem]" padding="p-2.5">
            {loading ? (
              <div className="h-full flex flex-col">
                <ShimmerLoader height="1.25rem" width="50%" className="mb-4" />
                <TableShimmer rows={4} className="flex-1" />
              </div>
            ) : error ? (
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
            ) : (
              <div className="h-full flex flex-col">
                {/* Compact Header */}
                <h2 className="text-[0.8125rem] font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                  <span className="w-1 h-4 bg-[#1360AB] rounded-full"></span>
                  <FaCalendarAlt className="text-[#1360AB] text-xs" />
                  Staff Upcoming Joins
                </h2>

                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {!dashboardData?.leaves || !dashboardData.leaves.data || (dashboardData.leaves.data.leaves || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <FaCalendarAlt className="text-gray-400 text-lg" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">No upcoming returns</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {dashboardData.leaves.data.leaves.map((lv, index) => {
                        const name = lv?.userId?.name || lv?.userId?.email || "Unknown"
                        // compute joining date = endDate + 1 day
                        let joinDate = ""
                        let daysRemaining = null
                        try {
                          const end = lv && lv.endDate ? new Date(lv.endDate) : null
                          if (end) {
                            const j = new Date(end)
                            j.setDate(j.getDate() + 1)
                            joinDate = j.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                            // Calculate days remaining
                            const today = new Date()
                            const timeDiff = j.getTime() - today.getTime()
                            daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
                          }
                        } catch (e) {
                          joinDate = "Invalid date"
                        }

                        const statusColors = {
                          'pending': 'bg-amber-50 text-amber-700 border-amber-200',
                          'approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          'rejected': 'bg-red-50 text-red-700 border-red-200',
                        }
                        const status = (lv.joinStatus || lv.status || '').toLowerCase()
                        const statusStyle = statusColors[status] || 'bg-gray-50 text-gray-700 border-gray-200'

                        return (
                          <li 
                            key={lv._id} 
                            className="group relative flex items-center justify-between bg-white rounded-[12px] p-2.5 border border-gray-100 hover:border-[#1360AB]/30 transition-all duration-150"
                          >
                            {/* Left accent bar */}
                            <div className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full ${daysRemaining !== null && daysRemaining <= 1 ? 'bg-emerald-500' : daysRemaining !== null && daysRemaining <= 3 ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                            
                            <div className="pl-2">
                              <p className="text-[0.8125rem] font-semibold text-gray-900 group-hover:text-[#1360AB] transition-colors">{name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[0.7rem] text-gray-500">Leave ends:</span>
                                <span className="text-[0.7rem] font-medium text-gray-700">{lv.endDate ? new Date(lv.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}</span>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[0.7rem] text-gray-500">Returns:</span>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[0.75rem] font-bold border border-emerald-200">{joinDate || "—"}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-md text-[0.65rem] font-semibold uppercase tracking-wide border ${statusStyle}`}>
                                {lv.joinStatus || lv.status || "Pending"}
                              </span>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Complaints summary card */}
          <Card className="h-[20rem]" padding="p-2.5">
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
                {/* Compact Header */}
                <h2 className="text-[0.8125rem] font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                  <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                  <FaExclamationCircle className="text-amber-600 text-xs" />
                  Complaints
                </h2>

                <div className="flex-1 flex flex-col justify-between">
                  {/* Primary stats - 2x2 grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Pending */}
                    <div className="rounded-[12px] bg-amber-50 border border-amber-200/60 p-2 hover:border-amber-300 transition-all">
                      <div className="flex items-center justify-between">
                        <p className="text-[0.65rem] font-semibold text-amber-600 uppercase">Pending</p>
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-xl font-black text-amber-700 tabular-nums mt-0.5">{dashboardData?.complaints?.pending || 0}</p>
                    </div>

                    {/* In Progress */}
                    <div className="rounded-[12px] bg-blue-50 border border-blue-200/60 p-2 hover:border-blue-300 transition-all">
                      <div className="flex items-center justify-between">
                        <p className="text-[0.65rem] font-semibold text-blue-600 uppercase">In Progress</p>
                        <AiOutlineLoading3Quarters className="w-3 h-3 text-blue-500 animate-spin" />
                      </div>
                      <p className="text-xl font-black text-blue-700 tabular-nums mt-0.5">{dashboardData?.complaints?.inProgress || 0}</p>
                    </div>

                    {/* Forwarded to IDO */}
                    <div className="rounded-[12px] bg-purple-50 border border-purple-200/60 p-2 hover:border-purple-300 transition-all">
                      <div className="flex items-center justify-between">
                        <p className="text-[0.65rem] font-semibold text-purple-600 uppercase">To IDO</p>
                        <span className="text-[0.5rem] font-bold text-purple-500">FWD</span>
                      </div>
                      <p className="text-xl font-black text-purple-700 tabular-nums mt-0.5">{dashboardData?.complaints?.forwardedToIDO || 0}</p>
                    </div>

                    {/* Resolved Today */}
                    <div className="rounded-[12px] bg-emerald-50 border border-emerald-200/60 p-2 hover:border-emerald-300 transition-all">
                      <div className="flex items-center justify-between">
                        <p className="text-[0.65rem] font-semibold text-emerald-600 uppercase">Today</p>
                        <span className="text-xs text-emerald-600">✓</span>
                      </div>
                      <p className="text-xl font-black text-emerald-700 tabular-nums mt-0.5">{dashboardData?.complaints?.resolvedToday || 0}</p>
                    </div>
                  </div>

                  {/* Overdue Summary */}
                  <div className="mt-1.5 bg-red-50 p-2 rounded-[12px] border border-red-200/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-red-500 text-xs">⚠</span>
                        <p className="text-[0.7rem] font-bold text-red-600">Overdue 20+ days</p>
                      </div>
                      <p className="text-xl font-black text-red-700 tabular-nums">{dashboardData?.complaints?.overdueCount || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Upcoming events card */}
          <Card className="h-[20rem]" padding="p-2.5">
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
                {/* Compact Header */}
                <h2 className="text-[0.8125rem] font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                  <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                  <MdOutlineEvent className="text-purple-600 text-sm" />
                  Upcoming Events
                </h2>

                <div className="flex-1 overflow-hidden">
                  <div className="overflow-y-auto max-h-[16rem] pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {dashboardData?.events?.map((event, index) => {
                      // Determine event date status
                      const eventDate = new Date(event.date)
                      const today = new Date()
                      const timeDiff = eventDate.getTime() - today.getTime()
                      const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
                      const isToday = daysUntil === 0
                      const isTomorrow = daysUntil === 1
                      const isThisWeek = daysUntil > 1 && daysUntil <= 7
                      
                      const dateColors = isToday ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                                        isTomorrow ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                        isThisWeek ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                        'bg-gray-50 border-gray-200 text-gray-600'
                      
                      return (
                        <div 
                          key={event.id} 
                          className="group mb-1.5 bg-white p-2 rounded-[12px] border border-gray-100 hover:border-purple-300 transition-all duration-150 relative overflow-hidden"
                        >
                          {/* Left accent bar */}
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-500 rounded-l-[12px]"></div>
                          
                          <div className="pl-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-[0.8125rem] text-gray-900 group-hover:text-purple-700 transition-colors leading-tight flex-1">{event.title}</h3>
                              <span className={`px-2 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-wide border whitespace-nowrap ${dateColors}`}>
                                {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : formatDate(event.date)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1 text-[0.7rem] text-gray-500">
                                <FaCalendarAlt className="text-[0.6rem] text-purple-400" />
                                <span className="font-medium">{formatDate(event.date)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[0.7rem]">
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="font-semibold text-purple-600">{event.time}</span>
                              </div>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center gap-1 mt-1.5 text-[0.7rem] text-gray-500">
                                <span className="text-purple-400">📍</span>
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {dashboardData?.events?.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3">
                          <MdOutlineEvent className="text-purple-400 text-xl" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">No upcoming events</p>
                        <p className="text-xs text-gray-400 mt-1">Check back later for updates</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
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

  // Calculate totals for footer
  const totalBoys = studentDataView === "registered" 
    ? degreeData.reduce((sum, item) => sum + (item.boys || 0), 0)
    : data?.totalBoys || 0
  const totalGirls = studentDataView === "registered"
    ? degreeData.reduce((sum, item) => sum + (item.girls || 0), 0)
    : data?.totalGirls || 0
  const grandTotal = studentDataView === "registered"
    ? degreeData.reduce((sum, item) => sum + (item.total || 0), 0)
    : data?.grandTotal || 0
  const boysPercentTotal = grandTotal > 0 ? Math.round((totalBoys / grandTotal) * 100) : 0
  const girlsPercentTotal = grandTotal > 0 ? Math.round((totalGirls / grandTotal) * 100) : 0

  return (
    <div className="h-full flex flex-col rounded-[14px] border border-gray-200 overflow-hidden">
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex-shrink-0">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-3 py-2 text-[0.75rem] font-bold text-gray-600 text-left uppercase tracking-wide w-[30%]">Degree</th>
              <th className="px-2 py-2 text-[0.75rem] font-bold text-gray-600 text-center uppercase tracking-wide w-[17.5%]">Boys</th>
              <th className="px-2 py-2 text-[0.75rem] font-bold text-gray-600 text-center uppercase tracking-wide w-[17.5%]">Girls</th>
              <th className="px-2 py-2 text-[0.75rem] font-bold text-gray-600 text-center uppercase tracking-wide w-[17.5%]">Total</th>
              {normalized && (
                <>
                  <th className="px-2 py-2 text-[0.75rem] font-bold text-gray-600 text-center uppercase tracking-wide w-[8.75%]">B%</th>
                  <th className="px-2 py-2 text-[0.75rem] font-bold text-gray-600 text-center uppercase tracking-wide w-[8.75%]">G%</th>
                </>
              )}
            </tr>
          </thead>
        </table>
      </div>
      
      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="min-w-full">
          <tbody className="bg-white divide-y divide-gray-100">
            {degreeData.map((item, index) => {
              const boysPercent = item.total > 0 ? Math.round((item.boys / item.total) * 100) : 0
              const girlsPercent = item.total > 0 ? Math.round((item.girls / item.total) * 100) : 0

              return (
                <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-3 py-1.5 text-[0.8125rem] text-gray-800 font-medium w-[30%]">{item.degree}</td>
                  <td className="px-2 py-1.5 text-[0.8125rem] text-blue-700 text-center font-medium w-[17.5%]">{item.boys}</td>
                  <td className="px-2 py-1.5 text-[0.8125rem] text-pink-700 text-center font-medium w-[17.5%]">{item.girls}</td>
                  <td className="px-2 py-1.5 text-[0.8125rem] text-indigo-700 text-center font-semibold w-[17.5%]">{item.total}</td>
                  {normalized && (
                    <>
                      <td className="px-2 py-1.5 text-[0.8125rem] text-blue-700 text-center font-medium w-[8.75%]">{boysPercent}%</td>
                      <td className="px-2 py-1.5 text-[0.8125rem] text-pink-700 text-center font-medium w-[8.75%]">{girlsPercent}%</td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* Fixed Footer */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-t-2 border-gray-300 flex-shrink-0">
        <table className="min-w-full">
          <tfoot>
            <tr>
              <td className="px-3 py-2 text-[0.8125rem] text-gray-900 font-extrabold uppercase tracking-wide w-[30%]">Total</td>
              <td className="px-2 py-2 text-[0.8125rem] text-blue-800 text-center font-extrabold w-[17.5%]">{totalBoys}</td>
              <td className="px-2 py-2 text-[0.8125rem] text-pink-800 text-center font-extrabold w-[17.5%]">{totalGirls}</td>
              <td className="px-2 py-2 text-[0.8125rem] text-indigo-800 text-center font-extrabold w-[17.5%]">{grandTotal}</td>
              {normalized && (
                <>
                  <td className="px-2 py-2 text-[0.8125rem] text-blue-800 text-center font-extrabold w-[8.75%]">{boysPercentTotal}%</td>
                  <td className="px-2 py-2 text-[0.8125rem] text-pink-800 text-center font-extrabold w-[8.75%]">{girlsPercentTotal}%</td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
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
