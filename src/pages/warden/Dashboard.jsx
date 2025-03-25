import { useState, useEffect } from "react"
import { statsApi } from "../../services/apiService"
import StatCards, { StatCard } from "../../components/common/StatCards"
import { BiBriefcase, BiCalendarEvent, BiError, BiCheck } from "react-icons/bi"
import { FaUser, FaUsers, FaUserCheck, FaUserClock } from "react-icons/fa"
import { MdEventAvailable, MdEventBusy, MdChangeCircle } from "react-icons/md"
import { GiExitDoor, GiEntryDoor } from "react-icons/gi"
import { FiSearch, FiCheckCircle, FiXCircle, FiAlertTriangle } from "react-icons/fi"
import { AiOutlineClockCircle, AiOutlineHistory } from "react-icons/ai"
import { TbBuildingWarehouse, TbBuildingCommunity } from "react-icons/tb"
import { useWarden } from "../../contexts/WardenProvider"
import RoomChangeRequestsChart from "../../components/charts/RoomChangeRequestsChart"
import VisitorStatsChart from "../../components/charts/VisitorStatsChart"
import EventsChart from "../../components/charts/EventsChart"
import LostFoundChart from "../../components/charts/LostFoundChart"

const DashboardWarden = () => {
  const { profile } = useWarden()

  if (!profile) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-600">Loading profile...</div>
      </div>
    )
  }

  const [lostFoundStats, setLostFoundStats] = useState(null)
  const [eventStats, setEventStats] = useState(null)
  const [roomChangeStats, setRoomChangeStats] = useState(null)
  const [visitorStats, setVisitorStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true)

        // Fetch all stats in parallel
        const [lostAndFoundData, eventsData, visitorData, roomChangeRequestData] = await Promise.all([statsApi.getLostAndFoundStats(), statsApi.getEventStats(profile.hostelId._id), statsApi.getVisitorStats(profile.hostelId._id), statsApi.getRoomChangeRequestsStats(profile.hostelId._id)])

        setLostFoundStats(lostAndFoundData)
        setEventStats(eventsData)
        setRoomChangeStats(roomChangeRequestData)
        setVisitorStats(visitorData)
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
      <div className="p-6 h-full flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-600">Loading dashboard data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 flex items-center justify-center">
        <BiError className="mr-2" /> {error}
      </div>
    )
  }

  const lostFoundStatCards = [
    {
      title: "Total Lost & Found Items",
      value: lostFoundStats?.total || 0,
      subtitle: "All items reported",
      icon: <FiSearch />,
      color: "#3B82F6",
    },
    {
      title: "Active Items",
      value: lostFoundStats?.active || 0,
      subtitle: "Items waiting to be claimed",
      icon: <AiOutlineClockCircle />,
      color: "#F59E0B",
    },
    {
      title: "Claimed Items",
      value: lostFoundStats?.claimed || 0,
      subtitle: "Successfully returned items",
      icon: <BiCheck />,
      color: "#10B981",
    },
  ]

  const eventStatCards = [
    {
      title: "Total Events",
      value: eventStats?.total || 0,
      subtitle: "All events",
      icon: <BiCalendarEvent />,
      color: "#6366F1",
    },
    {
      title: "Upcoming Events",
      value: eventStats?.upcoming || 0,
      subtitle: "Events in the future",
      icon: <MdEventAvailable />,
      color: "#4F46E5",
    },
    {
      title: "Past Events",
      value: eventStats?.past || 0,
      subtitle: "Completed events",
      icon: <MdEventBusy />,
      color: "#8B5CF6",
    },
  ]

  const roomChangeStatCards = [
    {
      title: "Total Requests",
      value: roomChangeStats?.total || 0,
      subtitle: "All room change requests",
      icon: <MdChangeCircle />,
      color: "#EC4899",
    },
    {
      title: "Pending Requests",
      value: roomChangeStats?.pending || 0,
      subtitle: "Awaiting decision",
      icon: <FiAlertTriangle />,
      color: "#F97316",
    },
    {
      title: "Approved Requests",
      value: roomChangeStats?.approved || 0,
      subtitle: "Successfully approved",
      icon: <FiCheckCircle />,
      color: "#10B981",
    },
    {
      title: "Rejected Requests",
      value: roomChangeStats?.rejected || 0,
      subtitle: "Declined requests",
      icon: <FiXCircle />,
      color: "#EF4444",
    },
  ]

  const visitorStatCards = [
    {
      title: "Total Visitors",
      value: visitorStats?.total || 0,
      subtitle: "All time visitors",
      icon: <FaUsers />,
      color: "#3B82F6",
    },
    {
      title: "Checked In",
      value: visitorStats?.checkedIn || 0,
      subtitle: "Currently in hostel",
      icon: <GiEntryDoor />,
      color: "#22C55E",
    },
    {
      title: "Checked Out",
      value: visitorStats?.checkedOut || 0,
      subtitle: "Completed visits",
      icon: <GiExitDoor />,
      color: "#6B7280",
    },
    {
      title: "Today's Visitors",
      value: visitorStats?.today || 0,
      subtitle: "Visits in last 24 hours",
      icon: <FaUserClock />,
      color: "#F59E0B",
    },
  ]

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Warden Dashboard</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FiSearch className="mr-2" /> Lost & Found Items
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <LostFoundChart lostFoundStats={lostFoundStats} />
            <div className="grid grid-cols-1 gap-3 h-full">
              <StatCard title="Active Items" value={lostFoundStats?.active || 0} subtitle="Items waiting to be claimed" icon={<AiOutlineClockCircle />} color="#F59E0B" />
            </div>
          </div>
          <StatCards stats={lostFoundStatCards.slice(1, 3)} columns={2} />
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <MdChangeCircle className="mr-2" /> Room Change Requests
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <RoomChangeRequestsChart roomChangeStats={roomChangeStats} />
            <div className="grid grid-cols-1 gap-3 h-full">
              <StatCard title="Pending Requests" value={roomChangeStats?.pending || 0} subtitle="Awaiting decision" icon={<FiAlertTriangle />} color="#F97316" />
              <StatCard title="Approved Requests" value={roomChangeStats?.approved || 0} subtitle="Successfully approved" icon={<FiCheckCircle />} color="#10B981" />
            </div>
          </div>
          <StatCards stats={[roomChangeStatCards[0], roomChangeStatCards[roomChangeStatCards.length - 1]]} columns={2} />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaUsers className="mr-2" /> Visitor Statistics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <VisitorStatsChart visitorStats={visitorStats} />
            <div className="grid grid-cols-1 gap-3 h-full">
              <StatCard title="Checked In" value={visitorStats?.checkedIn || 0} subtitle="Currently in hostel" icon={<GiEntryDoor />} color="#22C55E" />
              <StatCard title="Checked Out" value={visitorStats?.checkedOut || 0} subtitle="Completed visits" icon={<GiExitDoor />} color="#6B7280" />
            </div>
          </div>
          <StatCards stats={[visitorStatCards[0], visitorStatCards[visitorStatCards.length - 1]]} columns={2} />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <BiCalendarEvent className="mr-2" /> Events Overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <EventsChart eventStats={eventStats} />
            <div className="grid grid-cols-1 gap-3 h-full">
              <StatCard title="Upcoming Events" value={eventStats?.upcoming || 0} subtitle="Events in the future" icon={<MdEventAvailable />} color="#4F46E5" />
              <StatCard title="Past Events" value={eventStats?.past || 0} subtitle="Completed events" icon={<MdEventBusy />} color="#8B5CF6" />
            </div>
          </div>
          <StatCards stats={eventStatCards.slice(0, 1)} columns={1} />
        </section>
      </div>
    </div>
  )
}

export default DashboardWarden
