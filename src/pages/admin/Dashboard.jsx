import { useState, useEffect } from "react"
import { FaUser, FaUsers, FaUserTie, FaUserShield, FaBuilding, FaTools, FaWrench } from "react-icons/fa"
import { MdSecurity, MdMeetingRoom, MdPendingActions, MdDoneAll } from "react-icons/md"
import { BiError, BiCheckCircle } from "react-icons/bi"
import { TbBuildingWarehouse, TbBuildingCommunity } from "react-icons/tb"
import { GiElectric, GiBroom, GiNetworkBars, GiHouseKeys } from "react-icons/gi"
import { FiAlertTriangle, FiXCircle, FiSettings } from "react-icons/fi"
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

  const complaintsStatCards = [
    {
      title: "Total Complaints",
      value: complaintsStats?.total || 0,
      subtitle: "All registered complaints",
      icon: <FiSettings />,
      color: "#3B82F6",
    },
    {
      title: "Pending Complaints",
      value: complaintsStats?.pending || 0,
      subtitle: "Awaiting assignment",
      icon: <MdPendingActions />,
      color: "#F59E0B",
    },
    {
      title: "In Process",
      value: complaintsStats?.inProgress || 0,
      subtitle: "Currently being addressed",
      icon: <FiAlertTriangle />,
      color: "#EC4899",
    },
    {
      title: "Resolved Complaints",
      value: complaintsStats?.resolved || 0,
      subtitle: "Successfully resolved",
      icon: <BiCheckCircle />,
      color: "#10B981",
    },
  ]

  const hostelStatCards = [
    {
      title: "Total Hostels",
      value: hostelStats?.totalHostels || 0,
      subtitle: "All managed hostels",
      icon: <TbBuildingCommunity />,
      color: "#6366F1",
    },
    {
      title: "Total Rooms",
      value: hostelStats?.totalRooms || 0,
      subtitle: "Available in all hostels",
      icon: <MdMeetingRoom />,
      color: "#8B5CF6",
    },
    {
      title: "Available Rooms",
      value: hostelStats?.availableRooms || 0,
      subtitle: "Rooms ready for allocation",
      icon: <GiHouseKeys />,
      color: "#22C55E",
    },
    {
      title: "Occupancy Rate",
      value: `${hostelStats?.occupancyRate || 0}%`,
      subtitle: "Current utilization",
      icon: <FaBuilding />,
      color: "#3B82F6",
    },
  ]

  const wardenStatCards = [
    {
      title: "Total Wardens",
      value: wardenStats?.total || 0,
      subtitle: "All registered wardens",
      icon: <FaUserTie />,
      color: "#6366F1",
    },
    {
      title: "Assigned Wardens",
      value: wardenStats?.assigned || 0,
      subtitle: "Managing hostels",
      icon: <FaUser />,
      color: "#10B981",
    },
    {
      title: "Unassigned Wardens",
      value: wardenStats?.unassigned || 0,
      subtitle: "Available for assignment",
      icon: <FiXCircle />,
      color: "#F97316",
    },
  ]

  const securityStatCards = [
    {
      title: "Total Security Staff",
      value: securityStats?.total || 0,
      subtitle: "All security personnel",
      icon: <MdSecurity />,
      color: "#3B82F6",
    },
    {
      title: "Assigned Staff",
      value: securityStats?.assigned || 0,
      subtitle: "Currently on duty",
      icon: <FaUserShield />,
      color: "#10B981",
    },
    {
      title: "Unassigned Staff",
      value: securityStats?.unassigned || 0,
      subtitle: "Available for duty",
      icon: <FiXCircle />,
      color: "#F97316",
    },
  ]

  const maintenanceStatCards = [
    {
      title: "Total Maintenance Staff",
      value: maintenanceStats?.total || 0,
      subtitle: "All maintenance personnel",
      icon: <FaTools />,
      color: "#3B82F6",
    },
    {
      title: "Plumbing Staff",
      value: maintenanceStats?.plumbing || 0,
      subtitle: "Water system specialists",
      icon: <FaWrench />,
      color: "#0EA5E9",
    },
    {
      title: "Electrical Staff",
      value: maintenanceStats?.electrical || 0,
      subtitle: "Electrical specialists",
      icon: <GiElectric />,
      color: "#F59E0B",
    },
    {
      title: "Cleanliness Staff",
      value: maintenanceStats?.cleanliness || 0,
      subtitle: "Cleaning specialists",
      icon: <GiBroom />,
      color: "#10B981",
    },
    {
      title: "Internet Staff",
      value: maintenanceStats?.internet || 0,
      subtitle: "Network specialists",
      icon: <GiNetworkBars />,
      color: "#8B5CF6",
    },
    {
      title: "Civil Staff",
      value: maintenanceStats?.civil || 0,
      subtitle: "Building maintenance",
      icon: <TbBuildingWarehouse />,
      color: "#6B7280",
    },
  ]

  return (
    <div className="px-10 py-6 flex-1">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px] mb-6">
        <h1 className="text-2xl px-3 font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-2 text-black text-base px-5 py-2 rounded-[12px] hover:text-gray-600">
            <FaUser className="w-5 h-5" />
            <span>{user?.name}</span>
          </button>
        </div>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <TbBuildingCommunity className="mr-2" /> Hostel Statistics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <HostelOccupancyChart hostelStats={hostelStats} />
            <div className="grid grid-cols-2 gap-3 h-full">
              <StatCard title="Total Hostels" value={hostelStats?.totalHostels || 0} subtitle="All managed hostels" icon={<TbBuildingCommunity />} color="#6366F1" />
              <StatCard title="Total Rooms" value={hostelStats?.totalRooms || 0} subtitle="Available in all hostels" icon={<MdMeetingRoom />} color="#8B5CF6" />
            </div>
          </div>
          <StatCards stats={hostelStatCards} columns={4} />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FiSettings className="mr-2" /> Complaints Overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <ComplaintsChart complaintsStats={complaintsStats} />
            <StatCard title="Total Complaints" value={complaintsStats?.total || 0} subtitle="All registered complaints" icon={<FiSettings />} color="#3B82F6" className="h-full" />
          </div>
          <StatCards stats={complaintsStatCards} columns={4} />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaUsers className="mr-2" /> Staff Overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <StaffDistributionChart wardenStats={wardenStats} securityStats={securityStats} maintenanceStats={maintenanceStats} />
            <MaintenanceBreakdownChart maintenanceStats={maintenanceStats} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaUserTie className="mr-2" /> Warden Statistics
          </h2>
          <StatCards stats={wardenStatCards} columns={3} />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <MdSecurity className="mr-2" /> Security Staff
          </h2>
          <StatCards stats={securityStatCards} columns={3} />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaTools className="mr-2" /> Maintenance Staff
          </h2>
          <StatCards stats={maintenanceStatCards} columns={3} />
        </section>
      </div>
    </div>
  )
}

export default Dashboard
