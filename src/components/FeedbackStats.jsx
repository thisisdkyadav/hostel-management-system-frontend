import React from "react"
import StatCards from "./common/StatCards"
import { HiAnnotation, HiEye, HiClipboardList, HiClock } from "react-icons/hi"

const FeedbackStats = ({ feedbacks }) => {
  const totalFeedbacks = feedbacks.length
  const pendingFeedbacks = feedbacks.filter((f) => f.status === "Pending").length
  const seenFeedbacks = feedbacks.filter((f) => f.status === "Seen").length

  // Get most recent feedback date
  const getLatestFeedbackDate = () => {
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
      color: "#1360AB",
    },
    {
      title: "Pending",
      value: pendingFeedbacks,
      subtitle: "Require attention",
      icon: <HiClipboardList className="text-2xl" />,
      color: "#f97316",
    },
    {
      title: "Seen",
      value: seenFeedbacks,
      subtitle: "Acknowledged feedbacks",
      icon: <HiEye className="text-2xl" />,
      color: "#22c55e",
    },
    {
      title: "Latest Feedback",
      value: getLatestFeedbackDate(),
      subtitle: "Most recent submission",
      icon: <HiClock className="text-2xl" />,
      color: "#8b5cf6",
    },
  ]

  return <StatCards stats={statsData} />
}

export default FeedbackStats
