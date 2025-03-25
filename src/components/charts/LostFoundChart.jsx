import React from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import ChartCard from "./ChartCard"
import { FiSearch } from "react-icons/fi"

ChartJS.register(ArcElement, Tooltip, Legend)

const LostFoundChart = ({ lostFoundStats }) => {
  const data = {
    labels: ["Active Items", "Claimed Items"],
    datasets: [
      {
        data: [lostFoundStats?.active || 0, lostFoundStats?.claimed || 0],
        backgroundColor: ["#F59E0B", "#10B981"],
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
    cutout: "65%",
  }

  return (
    <ChartCard title="Lost & Found Items Status" icon={<FiSearch />}>
      <Doughnut data={data} options={options} />
    </ChartCard>
  )
}

export default LostFoundChart
