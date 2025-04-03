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
            className="relative flex flex-col items-center justify-center rounded-xl transition-all duration-300 overflow-hidden group hover:shadow-lg"
            style={{
              backgroundColor: `${feature.color}08`,
              borderBottom: `3px solid ${feature.color}`,
              aspectRatio: "1/1",
              perspective: "1000px",
            }}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
          >
            {/* Enhanced geometric patterns with better visibility */}
            <div
              className="absolute inset-0 opacity-50 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${feature.color}20, transparent)`,
              }}
            >
              {/* Top-right shape - made larger and more visible */}
              <div
                className="absolute -right-6 -top-6 w-32 h-32 rotate-12 transform group-hover:rotate-45 transition-transform duration-700 ease-out"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}40, ${feature.color}10)`,
                  borderRadius: "38% 62% 63% 37% / 41% 44% 56% 59%",
                  boxShadow: `0 0 20px 0 ${feature.color}30`,
                }}
              />

              {/* Bottom-left shape - made larger and more visible */}
              <div
                className="absolute -left-3 -bottom-3 w-24 h-24 -rotate-12 transform group-hover:-rotate-45 transition-transform duration-700 ease-out"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}35, ${feature.color}10)`,
                  borderRadius: "38% 62% 63% 37% / 41% 44% 56% 59%",
                  boxShadow: `0 0 15px 0 ${feature.color}25`,
                }}
              />

              {/* Additional center decoration */}
              <div
                className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, ${feature.color}40 0%, transparent 70%)`,
                }}
              />
            </div>

            {/* Simplified icon with ping animation */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center transform transition-all duration-300 ease-out"
              style={{
                color: feature.color,
                background: `linear-gradient(135deg, ${feature.color}35, ${feature.color}15)`,
                boxShadow: activeCard === index ? `0 8px 12px -2px ${feature.color}30` : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                transform: activeCard === index ? "scale(1.1)" : "scale(1)",
              }}
            >
              {feature.icon}
              {activeCard === index && <div className="absolute w-full h-full rounded-full animate-ping opacity-30" style={{ backgroundColor: feature.color }} />}
            </div>

            {/* Simplified label */}
            <div
              className="mt-3 text-xs font-medium text-center leading-tight px-2 transition-all duration-300 group-hover:font-semibold"
              style={{
                color: activeCard === index ? feature.color : "inherit",
              }}
            >
              {feature.label}
            </div>

            {/* Simplified description overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-400 backdrop-blur-sm"
              style={{
                background: `linear-gradient(145deg, ${feature.color}85, ${feature.color}95)`,
                transform: activeCard === index ? "scale(1)" : "scale(0.95)",
              }}
            >
              <p className="text-white text-xs text-center font-medium">{feature.description}</p>
            </div>

            {/* Glowing border effect on active */}
            {activeCard === index && (
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 0 2px ${feature.color}60`,
                  animation: "pulse 2s infinite",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Add keyframe animations using style tag */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default StatisticsGraphic
