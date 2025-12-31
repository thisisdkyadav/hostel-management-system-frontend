import { useState, useEffect } from "react"
import { statsApi } from "../../service"
import { dashboardApi } from "../../service"
import { StatCards, Button, ToggleButtonGroup } from "@/components/ui"
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

  // Key statistics data
  const keyStats = [
    {
      title: "Total Students",
      value: studentStats?.students?.grandTotal || 0,
      subtitle: `${studentStats?.students?.totalBoys || 0} Boys, ${studentStats?.students?.totalGirls || 0} Girls`,
      icon: <FaUsers />,
      color: "var(--color-purple-text)",
    },
    {
      title: "Total Visitors",
      value: visitorStats?.total || 0,
      subtitle: `${visitorStats?.today || 0} Today`,
      icon: <FaUsers />,
      color: "var(--color-info)",
    },
    {
      title: "Events",
      value: eventStats?.total || 0,
      subtitle: `${eventStats?.upcoming || 0} Upcoming`,
      icon: <BiCalendarEvent />,
      color: "var(--color-warning)",
    },
  ]

  return (
    <div className="px-10 py-6 flex-1" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <header className="flex justify-between items-center rounded-xl shadow-sm px-6 py-4 mb-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="flex items-center">
          <MdDashboard style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-2xl)', marginRight: 'var(--spacing-3)' }} />
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>{authUser?.role === "Hostel Supervisor" ? "Hostel Supervisor" : isAssociateWardenOrSupervisor ? "Associate Warden" : "Warden"} Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-boys-light-bg)', color: 'var(--color-boys-text)' }}>
          <FaUser className="w-4 h-4" />
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{profile.name}</span>
        </div>
      </header>

      {/* Key metrics cards */}
      <div className="mb-6">
        <StatCards stats={keyStats} columns={3} />
      </div>

      {/* Student distribution section */}
      <div className="mb-6 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="flex items-center" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
            <FaUsers style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-coed-text)' }} /> Student Distribution
          </h2>

          <div className="flex items-center">
            <ToggleButtonGroup
              options={[
                { value: false, label: "Absolute" },
                { value: true, label: "Normalized" },
              ]}
              value={normalizedView}
              onChange={setNormalizedView}
              shape="pill"
              size="small"
              variant="muted"
              hideLabelsOnMobile={false}
            />
          </div>
        </div>

        <div className="h-64">
          {studentStats ? (
            <DegreeWiseStudentsTable data={studentStats?.students} normalized={normalizedView} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <AiOutlineLoading3Quarters style={{ fontSize: 'var(--font-size-4xl)', color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
            </div>
          )}
        </div>
      </div>

      {/* Hostel Statistics section */}
      <div className="mb-6 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="flex items-center" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
            <BiBuildings style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-primary)' }} /> Hostel Overview
          </h2>
        </div>

        <div className="h-64">
          {hostelStats ? (
            <HostelStatisticsTable data={hostelStats} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <AiOutlineLoading3Quarters style={{ fontSize: 'var(--font-size-4xl)', color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
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
    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{label}</p>
    <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: isBold ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)', color }}>
      {value}
    </p>
  </div>
)

// Table component for degree-wise student distribution
const DegreeWiseStudentsTable = ({ data, normalized = false }) => {
  if (!data?.degreeWise?.length) {
    return <div className="h-full flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>No student data available</div>
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
      <table className="min-w-full" style={{ borderCollapse: 'separate' }}>
        <thead style={{ backgroundColor: 'var(--color-bg-secondary)', position: 'sticky', top: 0, zIndex: 10 }}>
          <tr>
            <th style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textAlign: 'left' }}>Degree</th>
            <th style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Boys</th>
            <th style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Girls</th>
            <th style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Total</th>
            {normalized && (
              <>
                <th style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Boys %</th>
                <th style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Girls %</th>
              </>
            )}
          </tr>
        </thead>
        <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          {degreeData.map((item, index) => {
            const boysPercent = item.total > 0 ? Math.round((item.boys / item.total) * 100) : 0
            const girlsPercent = item.total > 0 ? Math.round((item.girls / item.total) * 100) : 0

            return (
              <tr key={index} style={{ borderTop: '1px solid var(--color-border-light)', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{item.degree}</td>
                <td style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-boys-text)', textAlign: 'center', fontWeight: 'var(--font-weight-medium)' }}>{item.boys}</td>
                <td style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-girls-text)', textAlign: 'center', fontWeight: 'var(--font-weight-medium)' }}>{item.girls}</td>
                <td style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-coed-text)', textAlign: 'center', fontWeight: 'var(--font-weight-semibold)' }}>{item.total}</td>
                {normalized && (
                  <>
                    <td style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-boys-text)', textAlign: 'center', fontWeight: 'var(--font-weight-medium)' }}>{boysPercent}%</td>
                    <td style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-girls-text)', textAlign: 'center', fontWeight: 'var(--font-weight-medium)' }}>{girlsPercent}%</td>
                  </>
                )}
              </tr>
            )
          })}

          {/* Totals row */}
          <tr style={{ backgroundColor: 'var(--color-bg-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
            <td style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>Total</td>
            <td style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-boys-text)', textAlign: 'center' }}>{data?.totalBoys || 0}</td>
            <td style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-girls-text)', textAlign: 'center' }}>{data?.totalGirls || 0}</td>
            <td style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-coed-text)', textAlign: 'center' }}>{data?.grandTotal || 0}</td>
            {normalized && (
              <>
                <td style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-boys-text)', textAlign: 'center' }}>{data?.grandTotal > 0 ? Math.round((data?.totalBoys / data?.grandTotal) * 100) : 0}%</td>
                <td style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-girls-text)', textAlign: 'center' }}>{data?.grandTotal > 0 ? Math.round((data?.totalGirls / data?.grandTotal) * 100) : 0}%</td>
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
    return <div className="h-full flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>No hostel data available</div>
  }

  return (
    <div className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: 'var(--spacing-2)' }}>Basic Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Name:</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{data.name}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Type:</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{data.type}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Gender:</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{data.gender}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Maintenance Issues:</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: data.maintenanceIssues > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{data.maintenanceIssues}</span>
            </div>
          </div>
        </div>

        {/* Room Statistics */}
        <div className="space-y-4">
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: 'var(--spacing-2)' }}>Room Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Total Rooms:</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{data.totalRooms}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Active Rooms:</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>{data.totalActiveRooms}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Occupied Rooms:</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-success)' }}>{data.occupiedRooms}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Vacant Rooms:</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-warning)' }}>{data.vacantRooms}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity and Occupancy Statistics */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div style={{ backgroundColor: 'var(--color-boys-light-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-boys-border)' }}>
          <div className="text-center">
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-boys-text)', marginBottom: 'var(--spacing-1)' }}>Total Capacity</p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-boys-text)' }}>{data.capacity}</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-success-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-success-border)' }}>
          <div className="text-center">
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', marginBottom: 'var(--spacing-1)' }}>Occupancy Rate</p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>{data.occupancyRate?.toFixed(1)}%</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-coed-light-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-coed-border)' }}>
          <div className="text-center">
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-coed-text)', marginBottom: 'var(--spacing-1)' }}>Active Rooms Occupancy</p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-coed-text)' }}>{data.activeRoomsOccupancy}</p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>of {data.activeRoomsCapacity}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
