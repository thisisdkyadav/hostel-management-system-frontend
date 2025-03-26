import React from "react"
import StatCards from "../common/StatCards"
import { FaUserFriends, FaCalendarDay } from "react-icons/fa"
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5"

const VisitorStats = ({ visitors }) => {
  const totalVisitors = visitors.length
  const checkedInVisitors = visitors.filter((v) => v.status === "Checked In").length
  const checkedOutVisitors = visitors.filter((v) => v.status === "Checked Out").length

  const getTodayVisitorsCount = () => {
    return visitors.filter((v) => {
      const today = new Date().toISOString().split("T")[0]
      const visitorDate = new Date(v.DateTime).toISOString().split("T")[0]
      console.log(today, visitorDate, "Visitor date")

      return visitorDate === today
    }).length
  }

  const statsData = [
    {
      title: "Total Visitors",
      value: totalVisitors,
      subtitle: "All time",
      icon: <FaUserFriends className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Checked In",
      value: checkedInVisitors,
      subtitle: "Currently in hostel",
      icon: <IoCheckmarkCircle className="text-2xl" />,
      color: "#22c55e",
    },
    {
      title: "Checked Out",
      value: checkedOutVisitors,
      subtitle: "Departed",
      icon: <IoCloseCircle className="text-2xl" />,
      color: "#ef4444",
    },
    {
      title: "Today's Visitors",
      value: getTodayVisitorsCount(),
      subtitle: "Last 24 hours",
      icon: <FaCalendarDay className="text-2xl" />,
      color: "#1360AB",
    },
  ]

  return <StatCards stats={statsData} />
}

export default VisitorStats
