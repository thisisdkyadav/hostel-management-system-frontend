import React from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import ChartCard from "./ChartCard"
import { BiCalendarEvent } from "react-icons/bi"

ChartJS.register(ArcElement, Tooltip, Legend)

const EventsChart = ({ eventStats }) => {
  const data = {
    labels: ["Upcoming Events", "Past Events"],
    datasets: [
      {
        data: [eventStats?.upcoming || 0, eventStats?.past || 0],
        backgroundColor: ["#4F46E5", "#8B5CF6"],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = Math.round((context.raw / total) * 100)
            return `${context.label}: ${context.raw} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <ChartCard title="Events Timeline" icon={<BiCalendarEvent />}>
      <Pie data={data} options={options} />
    </ChartCard>
  )
}

export default EventsChart
