import React from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { FaTools } from "react-icons/fa"

ChartJS.register(ArcElement, Tooltip, Legend)

const MaintenanceBreakdownChart = ({ maintenanceStats, subtitle }) => {
  const data = {
    labels: ["Plumbing", "Electrical", "Cleanliness", "Internet", "Civil"],
    datasets: [
      {
        data: [maintenanceStats?.plumbing || 0, maintenanceStats?.electrical || 0, maintenanceStats?.cleanliness || 0, maintenanceStats?.internet || 0, maintenanceStats?.civil || 0],
        backgroundColor: ["#0EA5E9", "#F59E0B", "#10B981", "#8B5CF6", "#6B7280"],
        borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
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
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <FaTools className="mr-2 text-green-500" /> Maintenance Team Breakdown
      </h2>
      <div className="h-64">
        <Pie data={data} options={options} />
      </div>
      {subtitle}
    </div>
  )
}

export default MaintenanceBreakdownChart
