import React from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import ChartCard from "./ChartCard"
import { MdChangeCircle } from "react-icons/md"

ChartJS.register(ArcElement, Tooltip, Legend)

const RoomChangeRequestsChart = ({ roomChangeStats }) => {
  const data = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        data: [roomChangeStats?.pending || 0, roomChangeStats?.approved || 0, roomChangeStats?.rejected || 0],
        backgroundColor: ["#F97316", "#10B981", "#EF4444"],
        borderColor: ["#ffffff", "#ffffff", "#ffffff"],
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
    cutout: "65%",
  }

  return (
    <ChartCard title="Room Change Requests Status" icon={<MdChangeCircle />}>
      <Doughnut data={data} options={options} />
    </ChartCard>
  )
}

export default RoomChangeRequestsChart
