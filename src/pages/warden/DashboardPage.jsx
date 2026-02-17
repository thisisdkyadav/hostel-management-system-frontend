import { useState, useEffect } from "react"
import { statsApi } from "../../service"
import { dashboardApi } from "../../service"
import { Card } from "@/components/ui"
import { BiError, BiCalendarEvent } from "react-icons/bi"
import { FaUser, FaUsers } from "react-icons/fa"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { useWarden } from "../../contexts/WardenProvider"
import { useAuth } from "../../contexts/AuthProvider"
import DashboardHeader from "../../components/headers/DashboardHeader"

const DashboardPage = () => {
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
          <AiOutlineLoading3Quarters style={{ fontSize: 'var(--font-size-4xl)', color: 'var(--color-primary)', animation: 'spin 1s linear infinite', marginBottom: 'var(--spacing-3)' }} />
          <div style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-muted)' }}>Loading profile...</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="px-10 py-6 flex-1 h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <AiOutlineLoading3Quarters style={{ fontSize: 'var(--font-size-4xl)', color: 'var(--color-primary)', animation: 'spin 1s linear infinite', marginBottom: 'var(--spacing-3)' }} />
          <div style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-muted)' }}>Loading dashboard data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-10 py-6 flex-1 flex items-center justify-center" style={{ color: 'var(--color-danger)' }}>
        <BiError style={{ marginRight: 'var(--spacing-2)', fontSize: 'var(--font-size-2xl)' }} /> {error}
      </div>
    )
  }

  // Get dashboard title based on role
  const getDashboardTitle = () => {
    if (authUser?.role === "Hostel Supervisor") return "Hostel Supervisor Dashboard"
    if (isAssociateWardenOrSupervisor) return "Associate Warden Dashboard"
    return "Warden Dashboard"
  }

  // Header stats (3 compact stat cards)
  const renderHeaderStats = () => {
    const totalStudents = studentStats?.students?.grandTotal || 0
    const totalBoys = studentStats?.students?.totalBoys || 0
    const totalGirls = studentStats?.students?.totalGirls || 0
    const totalVisitors = visitorStats?.total || 0
    const todayVisitors = visitorStats?.today || 0
    const totalEvents = eventStats?.total || 0
    const upcomingEvents = eventStats?.upcoming || 0

    return (
      <div className="flex items-center gap-[var(--spacing-2-5)] border-l border-[var(--color-border-primary)] pl-[var(--spacing-5)]">
        {/* Students Card */}
        <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-[var(--radius-md)] px-[var(--spacing-3)] py-[var(--spacing-1)] hover:border-[var(--color-primary)] transition-[var(--transition-all)]">
          <div className="flex items-center gap-[var(--spacing-2)]">
            <FaUsers className="text-[var(--color-primary)] text-sm" />
            <div className="flex items-center gap-[var(--spacing-2)]">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wide">Students</p>
                <p className="text-lg font-bold text-[var(--color-text-primary)] leading-none">{totalStudents}</p>
              </div>
              <div className="flex gap-[var(--spacing-1)] ml-[var(--spacing-1-5)] border-l border-[var(--color-border-primary)] pl-[var(--spacing-2)]">
                <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-body)] rounded-[var(--radius-sm)] text-xs font-medium">B {totalBoys}</span>
                <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-body)] rounded-[var(--radius-sm)] text-xs font-medium">G {totalGirls}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visitors Card */}
        <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-[var(--radius-md)] px-[var(--spacing-3)] py-[var(--spacing-1)] hover:border-[var(--color-info)] transition-[var(--transition-all)]">
          <div className="flex items-center gap-[var(--spacing-2)]">
            <FaUser className="text-[var(--color-info)] text-sm" />
            <div className="flex items-center gap-[var(--spacing-2)]">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wide">Visitors</p>
                <p className="text-lg font-bold text-[var(--color-text-primary)] leading-none">{totalVisitors}</p>
              </div>
              <div className="flex gap-[var(--spacing-1)] ml-[var(--spacing-1-5)] border-l border-[var(--color-border-primary)] pl-[var(--spacing-2)]">
                <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-info-bg)] text-[var(--color-info)] rounded-[var(--radius-sm)] text-xs font-medium">Today {todayVisitors}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Events Card */}
        <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-[var(--radius-md)] px-[var(--spacing-3)] py-[var(--spacing-1)] hover:border-[var(--color-warning)] transition-[var(--transition-all)]">
          <div className="flex items-center gap-[var(--spacing-2)]">
            <BiCalendarEvent className="text-[var(--color-warning)] text-sm" />
            <div className="flex items-center gap-[var(--spacing-2)]">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wide">Events</p>
                <p className="text-lg font-bold text-[var(--color-text-primary)] leading-none">{totalEvents}</p>
              </div>
              <div className="flex gap-[var(--spacing-1)] ml-[var(--spacing-1-5)] border-l border-[var(--color-border-primary)] pl-[var(--spacing-2)]">
                <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] rounded-[var(--radius-sm)] text-xs font-medium">Upcoming {upcomingEvents}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Shimmer loader for header stats
  const renderHeaderShimmer = () => (
    <div className="flex gap-[var(--spacing-2-5)]">
      <div className="animate-pulse bg-gradient-to-r from-[var(--color-bg-muted)] via-[var(--color-bg-hover)] to-[var(--color-bg-muted)] rounded-[var(--radius-md)] h-9 w-36"></div>
      <div className="animate-pulse bg-gradient-to-r from-[var(--color-bg-muted)] via-[var(--color-bg-hover)] to-[var(--color-bg-muted)] rounded-[var(--radius-md)] h-9 w-32"></div>
      <div className="animate-pulse bg-gradient-to-r from-[var(--color-bg-muted)] via-[var(--color-bg-hover)] to-[var(--color-bg-muted)] rounded-[var(--radius-md)] h-9 w-32"></div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title={getDashboardTitle()}>
        {loading ? renderHeaderShimmer() : error ? (
          <div className="text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-md)] px-[var(--spacing-3)] py-[var(--spacing-1-5)] text-[var(--font-size-xs)]">Error loading data</div>
        ) : renderHeaderStats()}
      </DashboardHeader>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-6)] py-[var(--spacing-6)]">
        {/* Main grid - 80/20 split */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-[var(--spacing-6)]">
          {/* Student Distribution - 80% width (4 cols) */}
          <Card className="xl:col-span-4 h-[32rem]" padding="p-2.5">
            {loading ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-[var(--spacing-4)]">
                  <div className="animate-pulse bg-gradient-to-r from-[var(--color-bg-muted)] via-[var(--color-bg-hover)] to-[var(--color-bg-muted)] rounded-[var(--radius-md)] h-5 w-48"></div>
                  <div className="animate-pulse bg-gradient-to-r from-[var(--color-bg-muted)] via-[var(--color-bg-hover)] to-[var(--color-bg-muted)] rounded-[var(--radius-full)] h-7 w-32"></div>
                </div>
                <div className="flex-1 space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gradient-to-r from-[var(--color-bg-muted)] via-[var(--color-bg-hover)] to-[var(--color-bg-muted)] rounded-[var(--radius-sm)] h-8 w-full"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <p className="text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-lg)] p-[var(--spacing-3)]">{error}</p>
            ) : (
              <div className="h-full flex flex-col overflow-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-[var(--spacing-2)]">
                  <h2 className="text-[0.8125rem] font-bold text-[var(--color-text-secondary)] flex items-center gap-[var(--spacing-1-5)]">
                    <span className="w-1 h-4 bg-[var(--color-primary)] rounded-[var(--radius-full)]"></span>
                    Student Distribution by Department
                  </h2>
                  <div className="flex items-center gap-[var(--spacing-1-5)]">
                    {/* Absolute/Normalized Toggle */}
                    <div className="flex items-center bg-[var(--color-bg-muted)] rounded-[var(--radius-full)] p-[var(--spacing-0-5)] text-[0.7rem]" role="tablist">
                      <button onClick={() => setNormalizedView(false)}
                        className={`px-[var(--spacing-2-5)] py-[var(--spacing-1)] rounded-[var(--radius-full)] transition-all duration-150 font-medium ${!normalizedView ? "bg-[var(--color-primary)] text-[var(--color-white)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"}`}
                      >
                        Absolute
                      </button>
                      <button onClick={() => setNormalizedView(true)}
                        className={`px-[var(--spacing-2-5)] py-[var(--spacing-1)] rounded-[var(--radius-full)] transition-all duration-150 font-medium ${normalizedView ? "bg-[var(--color-primary)] text-[var(--color-white)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"}`}
                      >
                        %
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <div className="h-full">
                    {studentStats ? (
                      <DegreeWiseStudentsTable data={studentStats?.students} normalized={normalizedView} />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <AiOutlineLoading3Quarters className="text-4xl text-[var(--color-primary)] animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Room Status - 20% width (1 col) */}
          <Card className="xl:col-span-1 h-[32rem]" padding="p-2.5">
            {loading ? (
              <div className="h-full flex flex-col">
                <div className="animate-pulse bg-gradient-to-r from-[var(--color-bg-muted)] via-[var(--color-bg-hover)] to-[var(--color-bg-muted)] rounded-[var(--radius-md)] h-5 w-32 mb-4"></div>
                <div className="flex-1 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gradient-to-r from-[var(--color-bg-muted)] via-[var(--color-bg-hover)] to-[var(--color-bg-muted)] rounded-[var(--radius-lg)] h-16 w-full"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <p className="text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-lg)] p-[var(--spacing-3)]">{error}</p>
            ) : (
              <div className="h-full flex flex-col overflow-auto">
                {/* Header */}
                <h2 className="text-[0.8125rem] font-bold text-[var(--color-text-secondary)] flex items-center gap-[var(--spacing-1-5)] mb-[var(--spacing-3)]">
                  <span className="w-1 h-4 bg-[var(--color-success)] rounded-[var(--radius-full)]"></span>
                  Room Status
                </h2>

                {hostelStats ? (
                  <RoomStatusPanel data={hostelStats} />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <AiOutlineLoading3Quarters className="text-4xl text-[var(--color-primary)] animate-spin" />
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

// Table component for degree-wise student distribution
const DegreeWiseStudentsTable = ({ data, normalized = false }) => {
  if (!data?.degreeWise?.length) {
    return <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">No student data available</div>
  }

  const degreeData =
    data?.degreeWise?.map((item) => ({
      ...item,
      boys: item.boys || 0,
      girls: item.girls || 0,
      total: (item.boys || 0) + (item.girls || 0),
    }))
      .filter((item) => !(item.boys === 0 && item.girls === 0)) || []

  if (!degreeData.length) {
    return <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">No student data available</div>
  }

  return (
    <div className="h-full overflow-hidden flex flex-col rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)]">
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-[var(--color-bg-tertiary)] to-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)] flex-shrink-0">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-[var(--spacing-3)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-left uppercase tracking-wider w-[35%]">Department</th>
              <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[15%]">Boys</th>
              <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[15%]">Girls</th>
              <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[15%]">Total</th>
              {normalized && (
                <>
                  <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[10%]">Boys %</th>
                  <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[10%]">Girls %</th>
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

              return (
                <tr key={index} className={`group hover:bg-[var(--color-primary-bg)] transition-all duration-150 ${index % 2 === 0 ? 'bg-[var(--color-bg-primary)]' : 'bg-[var(--color-bg-tertiary)]'}`}>
                  <td className="px-[var(--spacing-3)] py-[var(--spacing-2)] text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] w-[35%]">{item.degree}</td>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-boys-text)] text-center font-medium tabular-nums w-[15%]">{item.boys}</td>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-girls-text)] text-center font-medium tabular-nums w-[15%]">{item.girls}</td>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-coed-text)] text-center font-bold tabular-nums w-[15%]">{item.total}</td>
                  {normalized && (
                    <>
                      <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-boys-text)] text-center font-medium tabular-nums w-[10%]">{boysPercent}%</td>
                      <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-girls-text)] text-center font-medium tabular-nums w-[10%]">{girlsPercent}%</td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Fixed Footer - Totals */}
      <div className="bg-gradient-to-r from-[var(--color-bg-tertiary)] to-[var(--color-bg-secondary)] border-t border-[var(--color-border-primary)] flex-shrink-0">
        <table className="min-w-full">
          <tfoot>
            <tr>
              <td className="px-[var(--spacing-3)] py-[var(--spacing-2)] text-[0.8125rem] font-bold text-[var(--color-text-primary)] w-[35%]">Total</td>
              <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-boys-text)] text-center font-bold tabular-nums w-[15%]">{data?.totalBoys || 0}</td>
              <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-girls-text)] text-center font-bold tabular-nums w-[15%]">{data?.totalGirls || 0}</td>
              <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-coed-text)] text-center font-bold tabular-nums w-[15%]">{data?.grandTotal || 0}</td>
              {normalized && (
                <>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-boys-text)] text-center font-bold tabular-nums w-[10%]">{data?.grandTotal > 0 ? Math.round((data?.totalBoys / data?.grandTotal) * 100) : 0}%</td>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-girls-text)] text-center font-bold tabular-nums w-[10%]">{data?.grandTotal > 0 ? Math.round((data?.totalGirls / data?.grandTotal) * 100) : 0}%</td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// Room Status Panel component for sidebar
const RoomStatusPanel = ({ data }) => {
  if (!data) {
    return <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">No room data available</div>
  }

  const occupancyRate = data.occupancyRate || 0
  const occupancyColor = occupancyRate >= 80 ? 'var(--color-success)' : occupancyRate >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'

  return (
    <div className="flex-1 flex flex-col gap-[var(--spacing-2)]">
      {/* Occupancy Rate - Compact Display */}
      <div className="bg-gradient-to-br from-[var(--color-success-bg-light)] to-[var(--color-success-bg)] border border-[var(--color-success-light)] rounded-[var(--radius-lg)] p-[var(--spacing-2-5)] text-center">
        <p className="text-[0.6875rem] text-[var(--color-success-text)] font-medium uppercase tracking-wide mb-0.5">Occupancy Rate</p>
        <p className="text-2xl font-bold leading-none" style={{ color: occupancyColor }}>{occupancyRate.toFixed(1)}%</p>
      </div>

      {/* Room Stats Grid */}
      <div className="space-y-[var(--spacing-1-5)]">
        <StatRow label="Total Rooms" value={data.totalRooms} color="var(--color-text-primary)" />
        <StatRow label="Active Rooms" value={data.totalActiveRooms} color="var(--color-primary)" />
        <StatRow label="Occupied" value={data.occupiedRooms} color="var(--color-success)" />
        <StatRow label="Vacant" value={data.vacantRooms} color="var(--color-warning)" />
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--color-border-light)] my-1"></div>

      {/* Capacity Stats */}
      <div className="space-y-[var(--spacing-1-5)]">
        <StatRow label="Total Capacity" value={data.capacity} color="var(--color-text-primary)" />
        <StatRow label="Current Occupancy" value={data.activeRoomsOccupancy} color="var(--color-info)" subtext={`of ${data.activeRoomsCapacity}`} />
      </div>

      {/* Maintenance */}
      {data.maintenanceIssues !== undefined && (
        <>
          <div className="border-t border-[var(--color-border-light)] my-1"></div>
          <div className={`rounded-[var(--radius-md)] p-[var(--spacing-2)] text-center ${data.maintenanceIssues > 0 ? 'bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)]' : 'bg-[var(--color-success-bg)] border border-[var(--color-success-border)]'}`}>
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide mb-0.5" style={{ color: data.maintenanceIssues > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>Maintenance</p>
            <p className="text-lg font-bold" style={{ color: data.maintenanceIssues > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{data.maintenanceIssues}</p>
          </div>
        </>
      )}
    </div>
  )
}

// Helper component for stat rows in sidebar
const StatRow = ({ label, value, color, subtext }) => (
  <div className="flex justify-between items-center px-[var(--spacing-2)] py-[var(--spacing-1-5)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg-hover)] transition-colors">
    <span className="text-[0.8125rem] text-[var(--color-text-muted)]">{label}</span>
    <div className="text-right">
      <span className="text-[0.9375rem] font-bold tabular-nums" style={{ color }}>{value}</span>
      {subtext && <span className="text-[0.6875rem] text-[var(--color-text-muted)] ml-1">{subtext}</span>}
    </div>
  </div>
)

export default DashboardPage
