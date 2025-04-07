import React from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { FiSettings } from "react-icons/fi"

ChartJS.register(ArcElement, Tooltip, Legend)

const ComplaintsChart = ({ complaintsStats, subtitle }) => {
  const data = {
    labels: ["Pending", "In Process", "Resolved"],
    datasets: [
      {
        data: [complaintsStats?.pending || 0, complaintsStats?.inProgress || 0, complaintsStats?.resolved || 0],
        backgroundColor: ["#F59E0B", "#EC4899", "#10B981"],
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
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <FiSettings className="mr-2 text-pink-500" /> Complaints Status
      </h2>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
      {subtitle}
    </div>
  )
}

export default ComplaintsChart
