import React, { useState } from "react"
import { MdMeetingRoom, MdPeople, MdSecurity, MdDashboard } from "react-icons/md"
import { FaClipboardCheck, FaTools, FaUserClock } from "react-icons/fa"
import { HiOutlineDocumentReport } from "react-icons/hi"
import { FiBell, FiUsers } from "react-icons/fi"

const StatisticsGraphic = () => {
  const [activeCard, setActiveCard] = useState(null)

  // Core hostel management features
  const features = [
    {
      icon: <MdMeetingRoom className="text-xl md:text-2xl" />,
      color: "#3B82F6", // Blue
      label: "Room Management",
      description: "Allocate and manage hostel rooms efficiently",
    },
    {
      icon: <FiUsers className="text-xl md:text-2xl" />,
      color: "#8B5CF6", // Purple
      label: "Student Management",
      description: "Track student information and history",
    },
    {
      icon: <HiOutlineDocumentReport className="text-xl md:text-2xl" />,
      color: "#EF4444", // Red
      label: "Complaints",
      description: "Process and resolve student issues quickly",
    },
    {
      icon: <FaClipboardCheck className="text-xl md:text-2xl" />,
      color: "#10B981", // Green
      label: "Approvals",
      description: "Streamline student request approvals",
    },
    {
      icon: <MdSecurity className="text-xl md:text-2xl" />,
      color: "#F59E0B", // Amber
      label: "Security",
      description: "Ensure campus safety and security",
    },
    {
      icon: <FaTools className="text-xl md:text-2xl" />,
      color: "#6B7280", // Gray
      label: "Maintenance",
      description: "Manage repair tasks and requests",
    },
    {
      icon: <FiBell className="text-xl md:text-2xl" />,
      color: "#F97316", // Orange
      label: "Notifications",
      description: "Real-time alerts for all residents",
    },
    {
      icon: <MdDashboard className="text-xl md:text-2xl" />,
      color: "#9333EA", // Indigo
      label: "Dashboard",
      description: "Monitor all hostel activities",
    },
    {
      icon: <FaUserClock className="text-xl md:text-2xl" />,
      color: "#14B8A6", // Teal
      label: "Visitor Management",
      description: "Track and manage campus visitors",
    },
  ]

  return (
    <div className="text-gray-800">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center justify-center rounded-xl transition-all duration-300 overflow-hidden group hover:shadow-md"
            style={{
              backgroundColor: `${feature.color}15`,
              borderBottom: `3px solid ${feature.color}`,
              aspectRatio: "1/1",
            }}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
          >
            {/* Improved background patterns */}
            <div
              className="absolute top-0 right-0 w-16 h-16 -translate-y-8 translate-x-8 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-500"
              style={{
                background: `radial-gradient(circle, ${feature.color}30 0%, ${feature.color}00 70%)`,
                borderRadius: "50%",
              }}
            />

            <div
              className="absolute bottom-0 left-0 w-12 h-12 translate-y-6 -translate-x-6 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-500"
              style={{
                background: `radial-gradient(circle, ${feature.color}30 0%, ${feature.color}00 70%)`,
                borderRadius: "50%",
              }}
            />

            {/* Improved icon wrapper with pulsing animation on hover */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:shadow-md"
              style={{
                color: feature.color,
                background: `linear-gradient(135deg, ${feature.color}25, ${feature.color}10)`,
              }}
            >
              {feature.icon}
              {activeCard === index && <div className="absolute w-full h-full animate-ping rounded-full opacity-30" style={{ backgroundColor: feature.color }}></div>}
            </div>

            {/* Improved label with subtle animation */}
            <div className="mt-3 text-xs font-medium text-center leading-tight px-1 transition-all duration-300 group-hover:font-semibold" style={{ color: activeCard === index ? feature.color : "inherit" }}>
              {feature.label}
            </div>

            {/* Improved description overlay with blur effect */}
            <div
              className="absolute inset-0 flex items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
              style={{
                background: `linear-gradient(180deg, ${feature.color}95, ${feature.color}A0)`,
                transform: activeCard === index ? "scale(1)" : "scale(0.9)",
              }}
            >
              <p className="text-white text-xs text-center font-medium">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatisticsGraphic
