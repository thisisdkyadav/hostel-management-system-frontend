import React from "react"
import StatCards from "../admin/StatCards"
import { MdInventory, MdCheckCircle } from "react-icons/md"
import { FaSearch, FaCalendarAlt } from "react-icons/fa"

const LostAndFoundStats = ({ items }) => {
  const totalItems = items.length
  const activeItems = items.filter((item) => item.status === "Active").length
  const claimedItems = items.filter((item) => item.status === "Claimed").length

  // Calculate the newest item date
  const getNewestItemDate = () => {
    if (items.length === 0) return "No items yet"

    const dates = items.map((item) => new Date(item.dateFound))
    const newest = new Date(Math.max(...dates))

    return newest.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const statsData = [
    {
      title: "Total Items",
      value: totalItems,
      subtitle: "In inventory",
      icon: <MdInventory className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Active Items",
      value: activeItems,
      subtitle: "Awaiting claim",
      icon: <FaSearch className="text-2xl" />,
      color: "#22c55e",
    },
    {
      title: "Claimed Items",
      value: claimedItems,
      subtitle: "Retrieved by owners",
      icon: <MdCheckCircle className="text-2xl" />,
      color: "#f97316",
    },
    {
      title: "Latest Item",
      value: getNewestItemDate(),
      subtitle: "Most recent finding",
      icon: <FaCalendarAlt className="text-2xl" />,
      color: "#8b5cf6",
    },
  ]

  return <StatCards stats={statsData} />
}

export default LostAndFoundStats
