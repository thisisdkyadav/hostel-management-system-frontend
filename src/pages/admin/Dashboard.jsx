import React, { useState, useEffect } from "react"
import { FaUser, FaUsers, FaUserTie, FaUserShield, FaBuilding, FaTools } from "react-icons/fa"
import { MdSecurity, MdDashboard } from "react-icons/md"
import { BiError } from "react-icons/bi"
import { TbBuildingCommunity } from "react-icons/tb"
import { FiSettings } from "react-icons/fi"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { useAuth } from "../../contexts/AuthProvider"
import { statsApi } from "../../services/apiService"
import StatCards, { StatCard } from "../../components/common/StatCards"
import ComplaintsChart from "../../components/charts/ComplaintsChart"
import HostelOccupancyChart from "../../components/charts/HostelOccupancyChart"
import StaffDistributionChart from "../../components/charts/StaffDistributionChart"
import MaintenanceBreakdownChart from "../../components/charts/MaintenanceBreakdownChart"

const Dashboard = () => {
  const { user } = useAuth()
  const [complaintsStats, setComplaintsStats] = useState(null)
  const [hostelStats, setHostelStats] = useState(null)
  const [wardenStats, setWardenStats] = useState(null)
  const [securityStats, setSecurityStats] = useState(null)
  const [maintenanceStats, setMaintenanceStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true)

        const [complaintsData, hostelData, wardenData, securityData, maintenanceData] = await Promise.all([statsApi.getComplaintsStats(), statsApi.getHostelStats(), statsApi.getWardenStats(), statsApi.getSecurityStats(), statsApi.getMaintenanceStaffStats()])

        setComplaintsStats(complaintsData)
        setHostelStats(hostelData)
        setWardenStats(wardenData)
        setSecurityStats(securityData)
        setMaintenanceStats(maintenanceData)
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError("Failed to load dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchAllStats()
  }, [])

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
      title: "Hostels",
      value: hostelStats?.totalHostels || 0,
      subtitle: `${hostelStats?.occupancyRate || 0}% Occupancy Rate`,
      icon: <TbBuildingCommunity />,
      color: "#6366F1",
    },
    {
      title: "Total Rooms",
      value: hostelStats?.totalRooms || 0,
      subtitle: `${hostelStats?.availableRooms || 0} Available`,
      icon: <FaBuilding />,
      color: "#3B82F6",
    },
    {
      title: "Total Complaints",
      value: complaintsStats?.total || 0,
      subtitle: `${complaintsStats?.resolved || 0} Resolved`,
      icon: <FiSettings />,
      color: "#EC4899",
    },
    {
      title: "Staff Members",
      value: (wardenStats?.total || 0) + (securityStats?.total || 0) + (maintenanceStats?.total || 0),
      subtitle: "Total Personnel",
      icon: <FaUsers />,
      color: "#8B5CF6",
    },
  ]

  return (
    <div className="px-10 py-6 flex-1 bg-gray-50">
      <header className="flex justify-between items-center bg-white rounded-xl shadow-sm px-6 py-4 mb-6">
        <div className="flex items-center">
          <MdDashboard className="text-blue-600 text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        <button className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
          <FaUser className="w-4 h-4" />
          <span className="font-medium">{user?.name}</span>
        </button>
      </header>

      {/* Key metrics cards */}
      <div className="mb-6">
        <StatCards stats={keyStats} columns={4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* First row of charts */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <HostelOccupancyChart
            hostelStats={hostelStats}
            subtitle={
              <div className="grid grid-cols-2 sm:grid-cols-4 mt-3 gap-4 text-center">
                <StatInfo label="Total Hostels" value={hostelStats?.totalHostels || 0} color="#6366F1" />
                <StatInfo label="Total Rooms" value={hostelStats?.totalRooms || 0} color="#8B5CF6" />
                <StatInfo label="Available" value={hostelStats?.availableRooms || 0} color="#22C55E" />
                <StatInfo label="Occupied" value={(hostelStats?.totalRooms || 0) - (hostelStats?.availableRooms || 0)} color="#3B82F6" />
              </div>
            }
          />
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <ComplaintsChart
            complaintsStats={complaintsStats}
            subtitle={
              <div className="grid grid-cols-3 mt-3 gap-4 text-center">
                <StatInfo label="Pending" value={complaintsStats?.pending || 0} color="#F59E0B" />
                <StatInfo label="In Process" value={complaintsStats?.inProgress || 0} color="#EC4899" />
                <StatInfo label="Resolved" value={complaintsStats?.resolved || 0} color="#10B981" />
              </div>
            }
          />
        </div>

        {/* Second row of charts */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <StaffDistributionChart
            wardenStats={wardenStats}
            securityStats={securityStats}
            maintenanceStats={maintenanceStats}
            subtitle={
              <div className="grid grid-cols-3 mt-3 gap-4 text-center">
                <StatInfo label="Wardens" value={wardenStats?.total || 0} color="#6366F1" />
                <StatInfo label="Security" value={securityStats?.total || 0} color="#3B82F6" />
                <StatInfo label="Maintenance" value={maintenanceStats?.total || 0} color="#10B981" />
              </div>
            }
          />
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <MaintenanceBreakdownChart
            maintenanceStats={maintenanceStats}
            subtitle={
              <div className="grid grid-cols-3 sm:grid-cols-5 mt-3 gap-2 text-center">
                <StatInfo label="Plumbing" value={maintenanceStats?.plumbing || 0} color="#0EA5E9" />
                <StatInfo label="Electrical" value={maintenanceStats?.electrical || 0} color="#F59E0B" />
                <StatInfo label="Cleaning" value={maintenanceStats?.cleanliness || 0} color="#10B981" />
                <StatInfo label="Internet" value={maintenanceStats?.internet || 0} color="#8B5CF6" />
                <StatInfo label="Civil" value={maintenanceStats?.civil || 0} color="#6B7280" />
              </div>
            }
          />
        </div>

        {/* Staff assignment summary - spans full width */}
        {/* <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 xl:col-span-2">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FaUsers className="mr-2 text-blue-500" /> Staff Assignment Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <AssignmentCard title="Wardens" total={wardenStats?.total || 0} assigned={wardenStats?.assigned || 0} icon={<FaUserTie className="text-purple-600" />} gradientFrom="#EEF2FF" gradientTo="#C7D2FE" />
            <AssignmentCard title="Security Staff" total={securityStats?.total || 0} assigned={securityStats?.assigned || 0} icon={<MdSecurity className="text-amber-600" />} gradientFrom="#FEF3C7" gradientTo="#FDE68A" />
            <AssignmentCard title="Maintenance Staff" total={maintenanceStats?.total || 0} assigned={maintenanceStats?.total - (maintenanceStats?.unassigned || 0)} icon={<FaTools className="text-emerald-600" />} gradientFrom="#DCFCE7" gradientTo="#86EFAC" />
          </div>
        </div> */}
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

// const AssignmentCard = ({ title, total, assigned, icon, gradientFrom, gradientTo }) => {
//   const percentage = total > 0 ? Math.round((assigned / total) * 100) : 0

//   return (
//     <div className="relative overflow-hidden rounded-xl p-5 hover:shadow-md transition-all duration-300" style={{ background: `linear-gradient(145deg, ${gradientFrom}, ${gradientTo})` }}>
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h3 className="text-gray-700 font-medium">{title}</h3>
//           <p className="text-gray-600 text-sm">Assignment Status</p>
//         </div>
//         <div className="p-2 bg-white bg-opacity-70 rounded-lg">{icon}</div>
//       </div>

//       <div className="flex items-end justify-between">
//         <div>
//           <p className="text-gray-600 text-xs">Assigned</p>
//           <p className="text-2xl font-bold text-gray-800">
//             {assigned} / {total}
//           </p>
//         </div>
//         <div className="text-right">
//           <p className="text-gray-600 text-xs">Utilization</p>
//           <p className="text-2xl font-bold text-gray-800">{percentage}%</p>
//         </div>
//       </div>

//       <div className="mt-3 bg-white bg-opacity-50 h-2 rounded-full overflow-hidden">
//         <div
//           className="h-full rounded-full"
//           style={{
//             width: `${percentage}%`,
//             background: "rgba(0,0,0,0.2)",
//           }}
//         />
//       </div>
//     </div>
//   )
// }

export default Dashboard
