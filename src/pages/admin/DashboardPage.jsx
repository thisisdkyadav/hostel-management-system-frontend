import React, { useState, useEffect } from "react"
import { FaUser, FaUsers, FaCalendarAlt, FaExclamationCircle } from "react-icons/fa"
import { BiBuildings } from "react-icons/bi"
import { TbBuildingCommunity } from "react-icons/tb"
import { MdDashboard, MdOutlineEvent, MdNotifications } from "react-icons/md"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { HiStatusOnline } from "react-icons/hi"
import { useAuth } from "../../contexts/AuthProvider"
import { dashboardApi } from "../../service"
import { useOnlineUsers } from "../../hooks/useOnlineUsers"
import DashboardHeader from "../../components/headers/DashboardHeader"
import { Card, Checkbox, Popover } from "@/components/ui"
import OnlineUsersPopupContent from "../../components/admin/OnlineUsersPopupContent"

// Chart components
// (Removed chart.js imports as they were unused)

// Enhanced shimmer loader components
const ShimmerLoader = ({ height, width = "100%", className = "" }) => <div className={`animate-pulse bg-gradient-to-r from-[var(--color-bg-muted)] via-[var(--color-bg-hover)] to-[var(--color-bg-muted)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] ${className}`} style={{ height, width }} aria-hidden="true" />

// Shimmer with blurred preview for charts
const ChartShimmer = ({ height, className = "" }) => (
  <div className={`relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-primary)] ${className}`} style={{ height }} role="status" aria-label="Loading chart">
    <div className="absolute inset-0 bg-[var(--color-bg-primary)]/60 backdrop-blur-[var(--blur-sm)]"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="rounded-[var(--radius-full)] h-[var(--spacing-12)] w-[var(--spacing-12)] border-[var(--border-4)] border-[var(--color-border-gray)] border-t-[var(--color-border-dark)] animate-spin"></div>
    </div>
    <div className="absolute inset-x-0 bottom-0 h-[var(--spacing-8)] bg-gradient-to-t from-[var(--color-bg-muted)] to-transparent"></div>
    <div className="absolute inset-0 animate-pulse opacity-[var(--opacity-20)] bg-gradient-to-r from-[var(--color-bg-hover)] via-[var(--color-border-gray)] to-[var(--color-bg-hover)]"></div>
  </div>
)

// Shimmer for tables
const TableShimmer = ({ rows = 4, className = "" }) => (
  <div className={`overflow-hidden rounded-[var(--radius-lg)] ${className}`}>
    <div className="bg-[var(--color-bg-tertiary)] py-[var(--spacing-2)] px-[var(--spacing-4)] flex">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-1 px-[var(--spacing-2)]">
          <ShimmerLoader height="1rem" className="mb-[var(--spacing-1)]" />
        </div>
      ))}
    </div>

    {[...Array(rows)].map((_, i) => (
      <div key={i} className={`flex py-[var(--spacing-2)] px-[var(--spacing-4)] ${i % 2 === 0 ? "bg-[var(--color-bg-primary)]" : "bg-[var(--color-bg-tertiary)]"}`}>
        {[...Array(4)].map((_, j) => (
          <div key={j} className="flex-1 px-[var(--spacing-2)]">
            <ShimmerLoader height="0.8rem" width={j === 0 ? "80%" : "50%"} className="mx-auto" />
          </div>
        ))}
      </div>
    ))}
  </div>
)

// Shimmer for stat cards
const StatCardShimmer = ({ className = "" }) => (
  <div className={`rounded-[var(--radius-lg)] border-l-[var(--border-4)] border-[var(--color-border-gray)] bg-[var(--color-bg-tertiary)] p-[var(--spacing-4)] ${className}`}>
    <div className="absolute right-[var(--spacing-2)] top-[var(--spacing-2)]">
      <ShimmerLoader height="1rem" width="2rem" />
    </div>
    <div className="flex justify-center items-center h-full">
      <ShimmerLoader height="2.5rem" width="50%" className="mx-auto" />
    </div>
  </div>
)

// Shimmer for event cards
const EventCardShimmer = ({ count = 3, className = "" }) => (
  <div className={`space-y-[var(--spacing-3)] ${className}`}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-[var(--color-bg-tertiary)] p-[var(--spacing-3)] rounded-[var(--radius-lg)] border-l-[var(--border-4)] border-[var(--color-border-gray)]">
        <ShimmerLoader height="1rem" width="70%" className="mb-[var(--spacing-3)]" />
        <div className="flex justify-between">
          <ShimmerLoader height="0.8rem" width="40%" />
          <ShimmerLoader height="0.8rem" width="25%" />
        </div>
        <ShimmerLoader height="0.7rem" width="50%" className="mt-[var(--spacing-2)]" />
      </div>
    ))}
  </div>
)

const HeaderStatCard = ({ icon, label, value, children }) => (
  <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-xl px-3.5 py-1.5 hover:border-[var(--color-primary)] transition-[var(--transition-all)]">
    <div className="flex items-center gap-2.5">
      {icon}
      <div className="flex items-center gap-2.5">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wide leading-none mb-0.5">{label}</p>
          <p className="text-lg font-bold text-[var(--color-text-primary)] leading-none">{value}</p>
        </div>
        <div className="flex gap-1 ml-1.5 border-l border-[var(--color-border-primary)] pl-2">
          {children}
        </div>
      </div>
    </div>
  </div>
)

const HeaderStatBadge = ({ label, value }) => (
  <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-body)] rounded-[var(--radius-sm)] text-xs font-medium">
    {label} {value}
  </span>
)

const DashboardPage = () => {
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
          <div className="flex gap-[var(--spacing-2-5)]">
            <ShimmerLoader height="2.25rem" width="8.5rem" className="rounded-[var(--radius-md)]" />
            <ShimmerLoader height="2.25rem" width="8.5rem" className="rounded-[var(--radius-md)]" />
          </div>
        ) : error ? (
          <div className="text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-md)] px-[var(--spacing-3)] py-[var(--spacing-1-5)] text-[var(--font-size-xs)]">Error loading data</div>
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
              <div className="flex items-center gap-[var(--spacing-2-5)] border-l border-[var(--color-border-primary)] pl-[var(--spacing-5)]">
                <HeaderStatCard icon={<FaUser className="text-[var(--color-primary)] text-sm" />} label="Hostlers" value={hostler.total}>
                  <HeaderStatBadge label="B" value={hostler.boys} />
                  <HeaderStatBadge label="G" value={hostler.girls} />
                </HeaderStatCard>

                <HeaderStatCard icon={<FaUser className="text-[var(--color-primary)] text-sm" />} label="Day Scholars" value={finalDayScholar.total}>
                  <HeaderStatBadge label="B" value={finalDayScholar.boys} />
                  <HeaderStatBadge label="G" value={finalDayScholar.girls} />
                </HeaderStatCard>

                {/* Online Users Card */}
                <div className="bg-[var(--color-success-bg-light)] border border-[var(--color-success-light)] rounded-xl px-3.5 py-1.5 hover:border-[var(--color-success)] transition-[var(--transition-all)]">
                  <div className="flex items-center gap-2.5">
                    <HiStatusOnline className="text-[var(--color-success)] text-sm animate-pulse" />
                    <div className="flex items-center gap-2.5">
                      <div>
                        <p className="text-xs text-[var(--color-success-text)] font-medium uppercase tracking-wide leading-none mb-0.5">Online Now</p>
                        <p className="text-lg font-bold text-[var(--color-success-text)] leading-none">{onlineStats?.totalOnline || 0}</p>
                      </div>
                      <div className="flex gap-1 ml-1.5 border-l border-[var(--color-success-light)] pl-2">
                        <Popover
                          trigger="hover"
                          placement="bottom"
                          content={<OnlineUsersPopupContent role="Student" roleLabel="Students" />}
                        >
                          <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-success-bg)] text-[var(--color-success-text)] rounded-[var(--radius-sm)] text-xs font-medium cursor-pointer hover:bg-[var(--color-success-bg)] transition-[var(--transition-colors)]">
                            S: {onlineStats?.byRole?.Student || 0}
                          </span>
                        </Popover>
                        <Popover
                          trigger="hover"
                          placement="bottom"
                          content={<OnlineUsersPopupContent role="Hostel Supervisor" roleLabel="Hostel Supervisors" />}
                        >
                          <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-success-bg)] text-[var(--color-success-text)] rounded-[var(--radius-sm)] text-xs font-medium cursor-pointer hover:bg-[var(--color-success-bg)] transition-[var(--transition-colors)]">
                            HS: {onlineStats?.byRole?.["Hostel Supervisor"] || 0}
                          </span>
                        </Popover>
                        <Popover
                          trigger="hover"
                          placement="bottom"
                          content={<OnlineUsersPopupContent role="Admin" roleLabel="Admins" />}
                        >
                          <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-success-bg)] text-[var(--color-success-text)] rounded-[var(--radius-sm)] text-xs font-medium cursor-pointer hover:bg-[var(--color-success-bg)] transition-[var(--transition-colors)]">
                            A: {onlineStats?.byRole?.Admin || 0}
                          </span>
                        </Popover>
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
      <div className="flex-1 overflow-y-auto px-[var(--spacing-6)] py-[var(--spacing-6)]">
        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-[var(--spacing-6)]">
          {/* Student data card */}
          <Card className="xl:col-span-2 h-[24rem]" padding="p-2.5">
            {loading ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-[var(--spacing-4)]">
                  <ShimmerLoader height="1.25rem" width="50%" />
                  <ShimmerLoader height="1.75rem" width="8rem" className="rounded-[var(--radius-full)]" />
                </div>
                <TableShimmer rows={6} className="flex-1" />
              </div>
            ) : error ? (
              <p className="text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-lg)] p-[var(--spacing-3)]">{error}</p>
            ) : (
              <div className="h-full flex flex-col overflow-auto">
                {/* Compact Header */}
                <div className="flex justify-between items-center mb-[var(--spacing-2)]">
                  <h2 className="text-[0.8125rem] font-bold text-[var(--color-text-secondary)] flex items-center gap-[var(--spacing-1-5)]">
                    <span className="w-1 h-4 bg-[var(--color-primary)] rounded-[var(--radius-full)]"></span>
                    Student Distribution
                  </h2>
                  <div className="flex items-center gap-[var(--spacing-1-5)]">
                    {/* Normal/Registered Toggle */}
                    <div className="flex items-center bg-[var(--color-bg-muted)] rounded-[var(--radius-full)] p-[var(--spacing-0-5)] text-[0.7rem]" role="tablist">
                      <button onClick={() => setStudentDataView("normal")}
                        className={`px-[var(--spacing-2-5)] py-[var(--spacing-1)] rounded-[var(--radius-full)] transition-all duration-150 font-medium ${studentDataView === "normal" ? "bg-[var(--color-primary)] text-[var(--color-white)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"}`}
                      >
                        Hostler
                      </button>
                      <button onClick={() => setStudentDataView("registered")}
                        className={`px-[var(--spacing-2-5)] py-[var(--spacing-1)] rounded-[var(--radius-full)] transition-all duration-150 font-medium ${studentDataView === "registered" ? "bg-[var(--color-primary)] text-[var(--color-white)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"}`}
                      >
                        Registered
                      </button>
                    </div>
                    {/* Absolute/Normalized Toggle */}
                    <div className="flex items-center bg-[var(--color-bg-muted)] rounded-[var(--radius-full)] p-[var(--spacing-0-5)] text-[0.7rem]" role="tablist">
                      <button onClick={() => setNormalizedView(false)}
                        className={`px-[var(--spacing-2-5)] py-[var(--spacing-1)] rounded-[var(--radius-full)] transition-all duration-150 font-medium ${!normalizedView ? "bg-[var(--color-success)] text-[var(--color-white)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"}`}
                      >
                        Abs
                      </button>
                      <button onClick={() => setNormalizedView(true)}
                        className={`px-[var(--spacing-2-5)] py-[var(--spacing-1)] rounded-[var(--radius-full)] transition-all duration-150 font-medium ${normalizedView ? "bg-[var(--color-success)] text-[var(--color-white)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"}`}
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
                <ShimmerLoader height="1.25rem" width="50%" className="mb-[var(--spacing-4)]" />
                <div className="flex-1 grid grid-cols-3 gap-[var(--spacing-4)]">
                  <div className="flex items-center justify-center">
                    <ChartShimmer height="140px" className="rounded-[var(--radius-full)]" />
                  </div>
                  <div className="col-span-2">
                    <TableShimmer rows={4} className="h-[16rem]" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <p className="text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-lg)] p-[var(--spacing-3)]">{error}</p>
            ) : (
              <div className="h-full flex flex-col">
                {/* Compact Header */}
                <h2 className="text-[0.8125rem] font-bold text-[var(--color-text-secondary)] flex items-center gap-[var(--spacing-1-5)] mb-[var(--spacing-2)]">
                  <span className="w-1 h-4 bg-[var(--color-primary)] rounded-[var(--radius-full)]"></span>
                  Hostel Occupancy
                </h2>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)] flex flex-col h-full min-h-0 overflow-hidden">
                    {/* Fixed Header */}
                    <div className="bg-gradient-to-r from-[var(--color-bg-tertiary)] to-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)] flex-shrink-0">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="px-[var(--spacing-3)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-left uppercase tracking-wider w-[40%]">
                              <div className="flex items-center gap-[var(--spacing-2)]">
                                <Checkbox checked={allHostelsSelected} onChange={() => {
                                  if (allHostelsSelected) {
                                    setSelectedHostels([])
                                  } else {
                                    setSelectedHostels(dashboardData.hostels.map((_, index) => index))
                                  }
                                }} />
                                Hostel
                              </div>
                            </th>
                            <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[15%]">Rooms</th>
                            <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[15%]">Capacity</th>
                            <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[15%]">Occupancy</th>
                            <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[15%]">Vacant</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--color-bg-tertiary)]">
                      <table className="min-w-full">
                        <tbody className="bg-[var(--color-bg-primary)] divide-y divide-[var(--color-border-light)]">
                          {dashboardData?.hostels?.map((hostel, index) => {
                            return (
                              <tr key={index} className={`group hover:bg-[var(--color-primary-bg)] transition-all duration-150 ${index % 2 === 0 ? 'bg-[var(--color-bg-primary)]' : 'bg-[var(--color-bg-tertiary)]'}`}>
                                <td className="px-[var(--spacing-3)] py-[var(--spacing-1-5)] w-[40%]">
                                  <div className="flex items-center gap-[var(--spacing-2)]">
                                    <Checkbox checked={selectedHostels.includes(index)} onChange={() => toggleHostelSelection(index)} />
                                    <span className={`text-[0.8125rem] font-semibold transition-colors ${selectedHostels.includes(index) ? "text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}>{hostel.name}</span>
                                  </div>
                                </td>
                                <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-text-muted)] text-center font-medium tabular-nums w-[15%]">{hostel.totalRooms}</td>
                                <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-text-muted)] text-center font-medium tabular-nums w-[15%]">{hostel.totalCapacity}</td>
                                <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-info)] text-center font-bold tabular-nums w-[15%]">{hostel.currentOccupancy}</td>
                                <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-success)] text-center font-bold tabular-nums w-[15%]">{hostel.vacantCapacity}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Fixed Footer */}
                    <div className="bg-gradient-to-r from-[var(--color-bg-muted)] to-[var(--color-bg-tertiary)] border-t-2 border-[var(--color-border-dark)] flex-shrink-0">
                      <table className="min-w-full">
                        <tfoot>
                          <tr>
                            <td className="px-[var(--spacing-3)] py-[var(--spacing-2)] text-[0.75rem] text-[var(--color-text-primary)] w-[40%]">
                              <div className="flex items-center gap-[var(--spacing-2)]">
                                <div className="w-3.5 h-3.5"></div>
                                <div className="flex items-center gap-[var(--spacing-1-5)]">
                                  <span className="uppercase tracking-wider font-extrabold">Total</span>
                                  {selectedHostels.length > 0 && selectedHostels.length < (dashboardData?.hostels?.length || 0) && (
                                    <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-primary)] text-[var(--color-white)] text-[0.65rem] rounded-[var(--radius-sm)] font-bold">{selectedHostels.length}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-text-primary)] text-center font-extrabold tabular-nums w-[15%]">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.totalRooms, 0) || 0}</td>
                            <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-text-primary)] text-center font-extrabold tabular-nums w-[15%]">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.totalCapacity, 0) || 0}</td>
                            <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-info)] text-center font-extrabold tabular-nums w-[15%]">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.currentOccupancy, 0) || 0}</td>
                            <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-success)] text-center font-extrabold tabular-nums w-[15%]">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.vacantCapacity, 0) || 0}</td>
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
                <ShimmerLoader height="1.25rem" width="50%" className="mb-[var(--spacing-4)]" />
                <TableShimmer rows={4} className="flex-1" />
              </div>
            ) : error ? (
              <p className="text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-lg)] p-[var(--spacing-3)]">{error}</p>
            ) : (
              <div className="h-full flex flex-col">
                {/* Compact Header */}
                <h2 className="text-[0.8125rem] font-bold text-[var(--color-text-secondary)] flex items-center gap-[var(--spacing-1-5)] mb-[var(--spacing-2)]">
                  <span className="w-1 h-4 bg-[var(--color-primary)] rounded-[var(--radius-full)]"></span>
                  Staff Upcoming Joins
                </h2>

                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--color-bg-tertiary)]">
                  {!dashboardData?.leaves || !dashboardData.leaves.data || (dashboardData.leaves.data.leaves || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-[var(--spacing-8)]">
                      <div className="w-12 h-12 bg-[var(--color-bg-muted)] rounded-[var(--radius-full)] flex items-center justify-center mb-[var(--spacing-3)]">
                        <FaCalendarAlt className="text-[var(--color-text-light)] text-lg" />
                      </div>
                      <p className="text-sm font-medium text-[var(--color-text-muted)]">No upcoming returns</p>
                    </div>
                  ) : (
                    <ul className="space-y-[var(--spacing-2)]">
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
                          'pending': 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-light)]',
                          'approved': 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-light)]',
                          'rejected': 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-light)]',
                        }
                        const status = (lv.joinStatus || lv.status || '').toLowerCase()
                        const statusStyle = statusColors[status] || 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-body)] border-[var(--color-border-primary)]'

                        return (
                          <li key={lv._id} className="group relative flex items-center justify-between bg-[var(--color-bg-primary)] rounded-[var(--radius-xl)] p-[var(--spacing-2-5)] border border-[var(--color-border-light)] hover:border-[var(--color-primary-muted)] transition-all duration-150" >
                            {/* Left accent bar */}
                            <div className={`absolute left-0 top-[var(--spacing-1-5)] bottom-[var(--spacing-1-5)] w-0.5 rounded-[var(--radius-full)] ${daysRemaining !== null && daysRemaining <= 1 ? 'bg-[var(--color-success)]' : daysRemaining !== null && daysRemaining <= 3 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-info)]'}`}></div>

                            <div className="pl-[var(--spacing-2)]">
                              <p className="text-[0.8125rem] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">{name}</p>
                              <div className="flex items-center gap-[var(--spacing-2)] mt-[var(--spacing-1)]">
                                <span className="text-[0.7rem] text-[var(--color-text-muted)]">Leave ends:</span>
                                <span className="text-[0.7rem] font-medium text-[var(--color-text-body)]">{lv.endDate ? new Date(lv.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}</span>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-[var(--spacing-1-5)]">
                              <div className="flex items-center gap-[var(--spacing-1-5)]">
                                <span className="text-[0.7rem] text-[var(--color-text-muted)]">Returns:</span>
                                <span className="px-[var(--spacing-2)] py-[var(--spacing-0-5)] bg-[var(--color-success-bg)] text-[var(--color-success-text)] rounded-[var(--radius-md)] text-[0.75rem] font-bold border border-[var(--color-success-light)]">{joinDate || "—"}</span>
                              </div>
                              <span className={`px-[var(--spacing-2)] py-[var(--spacing-0-5)] rounded-[var(--radius-md)] text-[0.65rem] font-semibold uppercase tracking-wide border ${statusStyle}`}>
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
                <ShimmerLoader height="1.25rem" width="50%" className="mb-[var(--spacing-4)]" />
                <div className="grid grid-cols-2 gap-[var(--spacing-3)] mb-[var(--spacing-3)]">
                  <StatCardShimmer className="relative h-16" />
                  <StatCardShimmer className="relative h-16" />
                </div>
                <div className="grid grid-cols-3 gap-[var(--spacing-3)] mb-[var(--spacing-3)]">
                  <StatCardShimmer className="relative h-16" />
                  <StatCardShimmer className="relative h-16" />
                  <StatCardShimmer className="relative h-16" />
                </div>
                <ShimmerLoader height="3rem" className="rounded-[var(--radius-lg)] mt-auto" />
              </div>
            ) : error ? (
              <p className="text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-lg)] p-[var(--spacing-3)]">{error}</p>
            ) : (
              <div className="h-full flex flex-col">
                {/* Compact Header */}
                <h2 className="text-[0.8125rem] font-bold text-[var(--color-text-secondary)] flex items-center gap-[var(--spacing-1-5)] mb-[var(--spacing-2)]">
                  <span className="w-1 h-4 bg-[var(--color-warning)] rounded-[var(--radius-full)]"></span>
                  Complaints
                </h2>

                <div className="flex-1 flex flex-col justify-between">
                  {/* Primary stats - 2x2 grid */}
                  <div className="grid grid-cols-2 gap-[var(--spacing-1-5)]">
                    {/* Pending */}
                    <div className="rounded-[var(--radius-xl)] bg-[var(--color-warning-bg)] border border-[var(--color-warning-light)] p-[var(--spacing-2)] hover:border-[var(--color-warning)] transition-all">
                      <div className="flex items-center justify-between">
                        <p className="text-[0.65rem] font-semibold text-[var(--color-warning-text)] uppercase">Pending</p>
                        <div className="w-2 h-2 bg-[var(--color-warning)] rounded-[var(--radius-full)] animate-pulse"></div>
                      </div>
                      <p className="text-xl font-black text-[var(--color-warning-text)] tabular-nums mt-[var(--spacing-0-5)]">{dashboardData?.complaints?.pending || 0}</p>
                    </div>

                    {/* In Progress */}
                    <div className="rounded-[var(--radius-xl)] bg-[var(--color-info-bg)] border border-[var(--color-info-light)] p-[var(--spacing-2)] hover:border-[var(--color-info)] transition-all">
                      <div className="flex items-center justify-between">
                        <p className="text-[0.65rem] font-semibold text-[var(--color-info-text)] uppercase">In Progress</p>
                        <AiOutlineLoading3Quarters className="w-3 h-3 text-[var(--color-info)] animate-spin" />
                      </div>
                      <p className="text-xl font-black text-[var(--color-info-text)] tabular-nums mt-[var(--spacing-0-5)]">{dashboardData?.complaints?.inProgress || 0}</p>
                    </div>

                    {/* Forwarded to IDO */}
                    <div className="rounded-[var(--radius-xl)] bg-[var(--color-purple-bg)] border border-[var(--color-purple-light-bg)] p-[var(--spacing-2)] hover:border-[var(--color-purple-text)] transition-all">
                      <div className="flex items-center justify-between">
                        <p className="text-[0.65rem] font-semibold text-[var(--color-purple-text)] uppercase">To IDO</p>
                        <span className="text-[0.5rem] font-bold text-[var(--color-purple-text)]">FWD</span>
                      </div>
                      <p className="text-xl font-black text-[var(--color-purple-text)] tabular-nums mt-[var(--spacing-0-5)]">{dashboardData?.complaints?.forwardedToIDO || 0}</p>
                    </div>

                    {/* Resolved Today */}
                    <div className="rounded-[var(--radius-xl)] bg-[var(--color-success-bg)] border border-[var(--color-success-light)] p-[var(--spacing-2)] hover:border-[var(--color-success)] transition-all">
                      <div className="flex items-center justify-between">
                        <p className="text-[0.65rem] font-semibold text-[var(--color-success-text)] uppercase">Today</p>
                        <span className="text-xs text-[var(--color-success)]">✓</span>
                      </div>
                      <p className="text-xl font-black text-[var(--color-success-text)] tabular-nums mt-[var(--spacing-0-5)]">{dashboardData?.complaints?.resolvedToday || 0}</p>
                    </div>
                  </div>

                  {/* Overdue Summary */}
                  <div className="mt-[var(--spacing-1-5)] bg-[var(--color-danger-bg)] p-[var(--spacing-2)] rounded-[var(--radius-xl)] border border-[var(--color-danger-light)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-[var(--spacing-1-5)]">
                        <span className="text-[var(--color-danger)] text-xs">⚠</span>
                        <p className="text-[0.7rem] font-bold text-[var(--color-danger-text)]">Overdue 20+ days</p>
                      </div>
                      <p className="text-xl font-black text-[var(--color-danger-text)] tabular-nums">{dashboardData?.complaints?.overdueCount || 0}</p>
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
                <ShimmerLoader height="1.25rem" width="50%" className="mb-[var(--spacing-4)]" />
                <div className="flex-1 overflow-hidden">
                  <EventCardShimmer count={3} />
                </div>
              </div>
            ) : error ? (
              <p className="text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-lg)] p-[var(--spacing-3)]">{error}</p>
            ) : (
              <div className="h-full flex flex-col">
                {/* Compact Header */}
                <h2 className="text-[0.8125rem] font-bold text-[var(--color-text-secondary)] flex items-center gap-[var(--spacing-1-5)] mb-[var(--spacing-2)]">
                  <span className="w-1 h-4 bg-[var(--color-purple-text)] rounded-[var(--radius-full)]"></span>
                  Upcoming Events
                </h2>

                <div className="flex-1 overflow-hidden">
                  <div className="overflow-y-auto max-h-[16rem] pr-[var(--spacing-1)] scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--color-bg-tertiary)]">
                    {dashboardData?.events?.map((event, index) => {
                      // Determine event date status
                      const eventDate = new Date(event.date)
                      const today = new Date()
                      const timeDiff = eventDate.getTime() - today.getTime()
                      const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
                      const isToday = daysUntil === 0
                      const isTomorrow = daysUntil === 1
                      const isThisWeek = daysUntil > 1 && daysUntil <= 7

                      const dateColors = isToday ? 'bg-[var(--color-success-bg)] border-[var(--color-success-light)] text-[var(--color-success-text)]' :
                        isTomorrow ? 'bg-[var(--color-warning-bg)] border-[var(--color-warning-light)] text-[var(--color-warning-text)]' :
                          isThisWeek ? 'bg-[var(--color-info-bg)] border-[var(--color-info-light)] text-[var(--color-info-text)]' :
                            'bg-[var(--color-bg-tertiary)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]'

                      return (
                        <div key={event.id} className="group mb-[var(--spacing-1-5)] bg-[var(--color-bg-primary)] p-[var(--spacing-2)] rounded-[var(--radius-xl)] border border-[var(--color-border-light)] hover:border-[var(--color-purple-text)] transition-all duration-150 relative overflow-hidden" >
                          {/* Left accent bar */}
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--color-purple-text)] rounded-l-[var(--radius-xl)]"></div>

                          <div className="pl-[var(--spacing-2)]">
                            <div className="flex items-start justify-between gap-[var(--spacing-2)]">
                              <h3 className="font-bold text-[0.8125rem] text-[var(--color-text-primary)] group-hover:text-[var(--color-purple-text)] transition-colors leading-tight flex-1">{event.title}</h3>
                              <span className={`px-[var(--spacing-2)] py-[var(--spacing-0-5)] rounded-[var(--radius-md)] text-[0.6rem] font-bold uppercase tracking-wide border whitespace-nowrap ${dateColors}`}>
                                {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : formatDate(event.date)}
                              </span>
                            </div>

                            <div className="flex items-center gap-[var(--spacing-3)] mt-[var(--spacing-2)]">
                              <div className="flex items-center gap-[var(--spacing-1)] text-[0.7rem] text-[var(--color-text-muted)]">
                                <FaCalendarAlt className="text-[0.6rem] text-[var(--color-purple-text)]" />
                                <span className="font-medium">{formatDate(event.date)}</span>
                              </div>
                              <div className="flex items-center gap-[var(--spacing-1)] text-[0.7rem]">
                                <span className="w-1 h-1 bg-[var(--color-border-dark)] rounded-[var(--radius-full)]"></span>
                                <span className="font-semibold text-[var(--color-purple-text)]">{event.time}</span>
                              </div>
                            </div>

                            {event.location && (
                              <div className="flex items-center gap-[var(--spacing-1)] mt-[var(--spacing-1-5)] text-[0.7rem] text-[var(--color-text-muted)]">
                                <span className="text-[var(--color-purple-text)]">📍</span>
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {dashboardData?.events?.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-[var(--spacing-8)]">
                        <div className="w-12 h-12 bg-[var(--color-purple-bg)] rounded-[var(--radius-full)] flex items-center justify-center mb-[var(--spacing-3)]">
                          <MdOutlineEvent className="text-[var(--color-purple-text)] text-xl" />
                        </div>
                        <p className="text-sm font-medium text-[var(--color-text-muted)]">No upcoming events</p>
                        <p className="text-xs text-[var(--color-text-light)] mt-[var(--spacing-1)]">Check back later for updates</p>
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
  const degreeWiseData = data?.degreeWise || []
  const [deselectedDegrees, setDeselectedDegrees] = useState([])

  if (!degreeWiseData.length) return <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">No student data available</div>

  const degreeData = degreeWiseData.map((item) => {
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
  })

  const toggleDegreeSelection = (index) => {
    setDeselectedDegrees((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      }
      return [...prev, index]
    })
  }

  const selectedDegreeData = degreeData.filter((_, index) => !deselectedDegrees.includes(index))
  const allDegreesSelected = degreeData.length > 0 && selectedDegreeData.length === degreeData.length

  // Calculate totals for footer based on selected degrees
  const totalBoys = selectedDegreeData.reduce((sum, item) => sum + (item.boys || 0), 0)
  const totalGirls = selectedDegreeData.reduce((sum, item) => sum + (item.girls || 0), 0)
  const grandTotal = selectedDegreeData.reduce((sum, item) => sum + (item.total || 0), 0)
  const boysPercentTotal = grandTotal > 0 ? Math.round((totalBoys / grandTotal) * 100) : 0
  const girlsPercentTotal = grandTotal > 0 ? Math.round((totalGirls / grandTotal) * 100) : 0

  return (
    <div className="h-full flex flex-col rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)] overflow-hidden">
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-[var(--color-bg-tertiary)] to-[var(--color-bg-muted)] border-b border-[var(--color-border-primary)] flex-shrink-0">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-[var(--spacing-3)] py-[var(--spacing-2)] text-[0.75rem] font-bold text-[var(--color-text-muted)] text-left uppercase tracking-wide w-[30%]">
                <div className="flex items-center gap-[var(--spacing-2)]">
                  <Checkbox checked={allDegreesSelected} onChange={() => {
                    if (allDegreesSelected) {
                      setDeselectedDegrees(degreeData.map((_, index) => index))
                    } else {
                      setDeselectedDegrees([])
                    }
                  }} />
                  Degree
                </div>
              </th>
              <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.75rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wide w-[17.5%]">Boys</th>
              <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.75rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wide w-[17.5%]">Girls</th>
              <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.75rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wide w-[17.5%]">Total</th>
              {normalized && (
                <>
                  <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.75rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wide w-[8.75%]">B%</th>
                  <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.75rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wide w-[8.75%]">G%</th>
                </>
              )}
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--color-bg-tertiary)]">
        <table className="min-w-full">
          <tbody className="bg-[var(--color-bg-primary)] divide-y divide-[var(--color-border-light)]">
            {degreeData.map((item, index) => {
              const boysPercent = item.total > 0 ? Math.round((item.boys / item.total) * 100) : 0
              const girlsPercent = item.total > 0 ? Math.round((item.girls / item.total) * 100) : 0
              const isSelected = !deselectedDegrees.includes(index)

              return (
                <tr key={index} className={`group hover:bg-[var(--color-primary-bg)] transition-colors ${index % 2 === 0 ? 'bg-[var(--color-bg-primary)]' : 'bg-[var(--color-bg-tertiary)]'}`}>
                  <td className="px-[var(--spacing-3)] py-[var(--spacing-1-5)] w-[30%]">
                    <div className="flex items-center gap-[var(--spacing-2)]">
                      <Checkbox checked={isSelected} onChange={() => toggleDegreeSelection(index)} />
                      <span className={`text-[0.8125rem] font-medium transition-colors ${isSelected ? "text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}>{item.degree}</span>
                    </div>
                  </td>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-info)] text-center font-medium w-[17.5%]">{item.boys}</td>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-girls-text)] text-center font-medium w-[17.5%]">{item.girls}</td>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-purple-text)] text-center font-semibold w-[17.5%]">{item.total}</td>
                  {normalized && (
                    <>
                      <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-info)] text-center font-medium w-[8.75%]">{boysPercent}%</td>
                      <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-girls-text)] text-center font-medium w-[8.75%]">{girlsPercent}%</td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Fixed Footer */}
      <div className="bg-gradient-to-r from-[var(--color-bg-muted)] to-[var(--color-bg-tertiary)] border-t-2 border-[var(--color-border-dark)] flex-shrink-0">
        <table className="min-w-full">
          <tfoot>
            <tr>
              <td className="px-[var(--spacing-3)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-text-primary)] font-extrabold uppercase tracking-wide w-[30%]">
                <div className="flex items-center gap-[var(--spacing-1-5)]">
                  <span>Total</span>
                  {selectedDegreeData.length > 0 && selectedDegreeData.length < degreeData.length && (
                    <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-primary)] text-[var(--color-white)] text-[0.65rem] rounded-[var(--radius-sm)] font-bold">{selectedDegreeData.length}</span>
                  )}
                </div>
              </td>
              <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-info)] text-center font-extrabold w-[17.5%]">{totalBoys}</td>
              <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-girls-text)] text-center font-extrabold w-[17.5%]">{totalGirls}</td>
              <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-purple-text)] text-center font-extrabold w-[17.5%]">{grandTotal}</td>
              {normalized && (
                <>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-info)] text-center font-extrabold w-[8.75%]">{boysPercentTotal}%</td>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-girls-text)] text-center font-extrabold w-[8.75%]">{girlsPercentTotal}%</td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}


export default DashboardPage

