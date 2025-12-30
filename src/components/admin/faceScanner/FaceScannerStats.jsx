import StatCards from "../../common/StatCards"
import { FaCamera, FaCheckCircle, FaArrowRight, FaArrowLeft } from "react-icons/fa"

const FaceScannerStats = ({ scanners }) => {
    const totalScanners = scanners.length
    const activeScanners = scanners.filter((s) => s.isActive).length
    const entryScanners = scanners.filter((s) => s.direction === "in").length
    const exitScanners = scanners.filter((s) => s.direction === "out").length

    const statsData = [
        {
            title: "Total Scanners",
            value: totalScanners,
            subtitle: "Registered devices",
            icon: <FaCamera style={{ fontSize: "var(--icon-xl)" }} />,
            color: "var(--color-primary)",
        },
        {
            title: "Active",
            value: activeScanners,
            subtitle: "Currently enabled",
            icon: <FaCheckCircle style={{ fontSize: "var(--icon-xl)" }} />,
            color: "var(--color-success)",
        },
        {
            title: "Entry Scanners",
            value: entryScanners,
            subtitle: "Check-in devices",
            icon: <FaArrowRight style={{ fontSize: "var(--icon-xl)" }} />,
            color: "var(--color-success)",
        },
        {
            title: "Exit Scanners",
            value: exitScanners,
            subtitle: "Check-out devices",
            icon: <FaArrowLeft style={{ fontSize: "var(--icon-xl)" }} />,
            color: "var(--color-warning)",
        },
    ]

    return <StatCards stats={statsData} />
}

export default FaceScannerStats
