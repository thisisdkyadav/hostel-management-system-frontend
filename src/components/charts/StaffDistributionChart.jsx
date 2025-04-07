import React from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { FaUserTie } from "react-icons/fa"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const StaffDistributionChart = ({ wardenStats, securityStats, maintenanceStats, subtitle }) => {
  const data = {
    labels: ["Wardens", "Security", "Maintenance"],
    datasets: [
      {
        label: "Total Staff",
        data: [wardenStats?.total || 0, securityStats?.total || 0, maintenanceStats?.total || 0],
        backgroundColor: ["#6366F1", "#3B82F6", "#10B981"],
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <FaUserTie className="mr-2 text-purple-500" /> Staff Distribution
      </h2>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
      {subtitle}
    </div>
  )
}

export default StaffDistributionChart
