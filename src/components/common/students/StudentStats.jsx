import { FaUsers } from "react-icons/fa"
import { BsGenderMale, BsGenderFemale } from "react-icons/bs"
import { IoMdSchool } from "react-icons/io"
import StatCards from "../StatCards"
import { useEffect, useState } from "react"
import { dashboardApi } from "../../../services/dashboardApi"

// Shimmer loader component for stats
const StatCardShimmer = () => (
  <div
    style={{
      backgroundColor: "var(--color-bg-primary)",
      padding: "var(--spacing-4)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      borderLeft: "4px solid var(--skeleton-base)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div className="animate-pulse" style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          height: "var(--spacing-5)",
          width: "6rem",
          backgroundColor: "var(--skeleton-base)",
          borderRadius: "var(--radius-sm)",
          marginBottom: "var(--spacing-2)",
        }}
      ></div>
      <div
        style={{
          height: "var(--spacing-8)",
          width: "4rem",
          backgroundColor: "var(--skeleton-highlight)",
          borderRadius: "var(--radius-sm)",
          marginBottom: "var(--spacing-2)",
        }}
      ></div>
      <div
        style={{
          height: "var(--spacing-4)",
          width: "8rem",
          backgroundColor: "var(--skeleton-base)",
          borderRadius: "var(--radius-sm)",
        }}
      ></div>
    </div>
    <div style={{ position: "absolute", right: "var(--spacing-4)", top: "var(--spacing-4)" }}>
      <div
        className="animate-pulse"
        style={{
          height: "var(--spacing-8)",
          width: "var(--spacing-8)",
          backgroundColor: "var(--skeleton-base)",
          borderRadius: "var(--radius-full)",
        }}
      ></div>
    </div>
  </div>
)

const StudentStats = () => {
  const [studentCounts, setStudentCounts] = useState({
    total: 0,
    boys: 0,
    girls: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentCounts = async () => {
      try {
        setLoading(true)
        const response = await dashboardApi.getStudentCount()
        setStudentCounts(response.data.count || { total: 0, boys: 0, girls: 0 })
      } catch (error) {
        console.error("Failed to fetch student counts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentCounts()
  }, [])

  const statsData = [
    {
      title: "Total Students",
      value: studentCounts.total,
      subtitle: "Currently enrolled",
      icon: <FaUsers style={{ fontSize: "var(--font-size-2xl)" }} />,
      color: "var(--color-primary)",
    },
    {
      title: "Male Students",
      value: studentCounts.boys,
      subtitle: studentCounts.total > 0 ? `${((studentCounts.boys / studentCounts.total) * 100).toFixed(1)}% of total` : "0% of total",
      icon: <BsGenderMale style={{ fontSize: "var(--font-size-2xl)" }} />,
      color: "var(--color-info)",
    },
    {
      title: "Female Students",
      value: studentCounts.girls,
      subtitle: studentCounts.total > 0 ? `${((studentCounts.girls / studentCounts.total) * 100).toFixed(1)}% of total` : "0% of total",
      icon: <BsGenderFemale style={{ fontSize: "var(--font-size-2xl)" }} />,
      color: "var(--color-girls-text)",
    },
  ]

  return loading ? (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(1, 1fr)",
        gap: "var(--spacing-4)",
        marginBottom: "var(--spacing-6)",
      }}
      className="md:grid-cols-3"
    >
      <StatCardShimmer />
      <StatCardShimmer />
      <StatCardShimmer />
    </div>
  ) : (
    <StatCards stats={statsData} columns={3} />
  )
}

export default StudentStats
