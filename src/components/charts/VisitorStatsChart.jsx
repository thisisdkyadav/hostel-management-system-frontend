import React from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import ChartCard from "./ChartCard"
import { FaUsers } from "react-icons/fa"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const VisitorStatsChart = ({ visitorStats }) => {
  const data = {
    labels: ["Checked In", "Checked Out", "Today's Visitors"],
    datasets: [
      {
        label: "Visitor Count",
        data: [visitorStats?.checkedIn || 0, visitorStats?.checkedOut || 0, visitorStats?.today || 0],
        backgroundColor: ["#22C55E", "#6B7280", "#F59E0B"],
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
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Count: ${context.raw}`
          },
        },
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
    <ChartCard title="Visitor Statistics" icon={<FaUsers />}>
      <Bar data={data} options={options} />
    </ChartCard>
  )
}

export default VisitorStatsChart
