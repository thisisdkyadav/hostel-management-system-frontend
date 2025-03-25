import React from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import ChartCard from "./ChartCard"
import { FaTools } from "react-icons/fa"

ChartJS.register(ArcElement, Tooltip, Legend)

const MaintenanceBreakdownChart = ({ maintenanceStats }) => {
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
    <ChartCard title="Maintenance Staff Breakdown" icon={<FaTools />}>
      <Pie data={data} options={options} />
    </ChartCard>
  )
}

export default MaintenanceBreakdownChart
