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
      <div className="grid grid-cols-3 gap-3 md:gap-5">
        {features.map((feature, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center justify-center rounded-2xl transition-all duration-400 overflow-hidden group hover:shadow-xl cursor-pointer"
            style={{
              backgroundColor: `${feature.color}06`,
              borderBottom: `3px solid ${feature.color}`,
              aspectRatio: "1/1",
              perspective: "1000px",
              boxShadow: `0 4px 12px -2px ${feature.color}15`,
            }}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
          >
            {/* Enhanced geometric patterns with better visibility */}
            <div
              className="absolute inset-0 opacity-40 overflow-hidden"
              style={{
                backgroundColor: `${feature.color}08`,
              }}
            >
              {/* Top-right shape - made larger and more visible */}
              <div
                className="absolute -right-6 -top-6 w-32 h-32 rotate-12 transform group-hover:rotate-45 transition-transform duration-700 ease-out"
                style={{
                  backgroundColor: `${feature.color}25`,
                  borderRadius: "38% 62% 63% 37% / 41% 44% 56% 59%",
                  boxShadow: `0 0 20px 0 ${feature.color}20`,
                }}
              />

              {/* Bottom-left shape - made larger and more visible */}
              <div
                className="absolute -left-3 -bottom-3 w-24 h-24 -rotate-12 transform group-hover:-rotate-45 transition-transform duration-700 ease-out"
                style={{
                  backgroundColor: `${feature.color}20`,
                  borderRadius: "38% 62% 63% 37% / 41% 44% 56% 59%",
                  boxShadow: `0 0 15px 0 ${feature.color}18`,
                }}
              />

              {/* Additional center decoration */}
              <div
                className="absolute inset-0 opacity-15 group-hover:opacity-30 transition-opacity duration-500"
                style={{
                  backgroundColor: `${feature.color}`,
                  borderRadius: "50%",
                  transform: "scale(0.6)",
                  filter: "blur(30px)",
                }}
              />
            </div>

            {/* Simplified icon with ping animation */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transform transition-all duration-400 ease-out"
              style={{
                color: feature.color,
                backgroundColor: `${feature.color}20`,
                boxShadow: activeCard === index ? `0 10px 20px -4px ${feature.color}35, 0 4px 8px -2px ${feature.color}20` : `0 4px 12px -2px ${feature.color}15`,
                transform: activeCard === index ? "scale(1.12) translateY(-2px)" : "scale(1)",
              }}
            >
              {feature.icon}
              {activeCard === index && <div className="absolute w-full h-full rounded-full animate-ping opacity-30" style={{ backgroundColor: feature.color }} />}
            </div>

            {/* Simplified label */}
            <div
              className="mt-3.5 text-xs font-semibold text-center leading-tight px-2 transition-all duration-400 tracking-wide"
              style={{
                color: activeCard === index ? feature.color : "#4B5563",
              }}
            >
              {feature.label}
            </div>

            {/* Simplified description overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-md rounded-2xl"
              style={{
                backgroundColor: `${feature.color}ee`,
                transform: activeCard === index ? "scale(1)" : "scale(0.97)",
              }}
            >
              <p className="text-white text-xs text-center font-semibold leading-relaxed drop-shadow-sm">{feature.description}</p>
            </div>

            {/* Glowing border effect on active */}
            {activeCard === index && (
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 0 2px ${feature.color}50, 0 0 20px ${feature.color}20`,
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
