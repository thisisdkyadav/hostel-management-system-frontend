import React from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import ChartCard from "./ChartCard"
import { TbBuildingCommunity } from "react-icons/tb"

ChartJS.register(ArcElement, Tooltip, Legend)

const HostelOccupancyChart = ({ hostelStats }) => {
  // Calculate occupied rooms
  const totalRooms = hostelStats?.totalRooms || 0
  const availableRooms = hostelStats?.availableRooms || 0
  const occupiedRooms = totalRooms - availableRooms

  const data = {
    labels: ["Occupied", "Available"],
    datasets: [
      {
        data: [occupiedRooms, availableRooms],
        backgroundColor: ["#3B82F6", "#22C55E"],
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
            const percentage = Math.round((context.raw / totalRooms) * 100)
            return `${context.label}: ${context.raw} (${percentage}%)`
          },
        },
      },
    },
    cutout: "65%",
  }

  return (
    <ChartCard title="Room Occupancy Status" icon={<TbBuildingCommunity />}>
      <Doughnut data={data} options={options} />
    </ChartCard>
  )
}

export default HostelOccupancyChart
