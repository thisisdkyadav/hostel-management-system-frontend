import React from "react"
import { StatCards } from "@/components/ui"
import { HiAnnotation, HiEye, HiClipboardList, HiClock } from "react-icons/hi"

const FeedbackStats = ({ feedbacks = [], stats = null }) => {
  const totalFeedbacks = stats?.total ?? feedbacks.length
  const pendingFeedbacks = stats?.pending ?? feedbacks.filter((f) => f.status === "Pending").length
  const seenFeedbacks = stats?.seen ?? feedbacks.filter((f) => f.status === "Seen").length

  // Get most recent feedback date
  const getLatestFeedbackDate = () => {
    if (stats?.latestFeedbackDate) {
      const latestDate = new Date(stats.latestFeedbackDate)
      return latestDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }

    if (feedbacks.length === 0) return "No feedbacks"

    const sortedFeedbacks = [...feedbacks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const latestDate = new Date(sortedFeedbacks[0].createdAt)
    return latestDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const statsData = [
    {
      title: "Total Feedbacks",
      value: totalFeedbacks,
      subtitle: "All submitted feedbacks",
      icon: <HiAnnotation className="text-2xl" />,
      color: "var(--color-primary)",
    },
    {
      title: "Pending",
      value: pendingFeedbacks,
      subtitle: "Require attention",
      icon: <HiClipboardList className="text-2xl" />,
      color: "var(--color-warning)",
    },
    {
      title: "Seen",
      value: seenFeedbacks,
      subtitle: "Acknowledged feedbacks",
      icon: <HiEye className="text-2xl" />,
      color: "var(--color-success)",
    },
    {
      title: "Latest Feedback",
      value: getLatestFeedbackDate(),
      subtitle: "Most recent submission",
      icon: <HiClock className="text-2xl" />,
      color: "var(--color-info)",
    },
  ]

  return <StatCards stats={statsData} />
}

export default FeedbackStats
