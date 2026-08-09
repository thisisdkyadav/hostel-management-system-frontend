import { StatCards } from "hzero"
import { ArrowLeft, ArrowRight, Camera, CircleCheck } from "lucide-react"

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
            icon: <Camera size={24} />,
            color: "var(--color-primary)",
        },
        {
            title: "Active",
            value: activeScanners,
            subtitle: "Currently enabled",
            icon: <CircleCheck size={24} />,
            color: "var(--color-success)",
        },
        {
            title: "Entry Scanners",
            value: entryScanners,
            subtitle: "Check-in devices",
            icon: <ArrowRight size={24} />,
            color: "var(--color-success)",
        },
        {
            title: "Exit Scanners",
            value: exitScanners,
            subtitle: "Check-out devices",
            icon: <ArrowLeft size={24} />,
            color: "var(--color-warning)",
        },
    ]

    return <StatCards stats={statsData} />
}

export default FaceScannerStats
