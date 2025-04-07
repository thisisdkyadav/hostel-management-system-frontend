import React from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { TbBuildingCommunity } from "react-icons/tb"

ChartJS.register(ArcElement, Tooltip, Legend)

const HostelOccupancyChart = ({ hostelStats, subtitle }) => {
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
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <TbBuildingCommunity className="mr-2 text-blue-600" /> Hostel Occupancy Status
      </h2>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
      {subtitle}
    </div>
  )
}

export default HostelOccupancyChart
