import React from "react"
import { StatCards } from "@/components/ui"
import { MdInventory, MdCheckCircle } from "react-icons/md"
import { FaSearch, FaCalendarAlt } from "react-icons/fa"

const LostAndFoundStats = ({ items = [], stats = null }) => {
  const totalItems = stats?.total ?? items.length
  const activeItems = stats?.active ?? items.filter((item) => item.status === "Active").length
  const claimedItems = stats?.claimed ?? items.filter((item) => item.status === "Claimed").length

  // Calculate the newest item date
  const getNewestItemDate = () => {
    if (stats?.latestItemDate) {
      return new Date(stats.latestItemDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }

    if (totalItems === 0) return "No items yet"

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
      color: "var(--color-primary)",
    },
    {
      title: "Active Items",
      value: activeItems,
      subtitle: "Awaiting claim",
      icon: <FaSearch className="text-2xl" />,
      color: "var(--color-success)",
    },
    {
      title: "Claimed Items",
      value: claimedItems,
      subtitle: "Retrieved by owners",
      icon: <MdCheckCircle className="text-2xl" />,
      color: "var(--color-warning)",
    },
    {
      title: "Latest Item",
      value: getNewestItemDate(),
      subtitle: "Most recent finding",
      icon: <FaCalendarAlt className="text-2xl" />,
      color: "var(--color-purple-text)",
    },
  ]

  return <StatCards stats={statsData} />
}

export default LostAndFoundStats
