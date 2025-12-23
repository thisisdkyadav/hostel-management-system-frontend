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
      icon: <MdMeetingRoom style={{ fontSize: '1.25rem' }} />,
      color: "#3B82F6", // Blue
      label: "Room Management",
      description: "Allocate and manage hostel rooms efficiently",
    },
    {
      icon: <FiUsers style={{ fontSize: '1.25rem' }} />,
      color: "#8B5CF6", // Purple
      label: "Student Management",
      description: "Track student information and history",
    },
    {
      icon: <HiOutlineDocumentReport style={{ fontSize: '1.25rem' }} />,
      color: "#EF4444", // Red
      label: "Complaints",
      description: "Process and resolve student issues quickly",
    },
    {
      icon: <FaClipboardCheck style={{ fontSize: '1.25rem' }} />,
      color: "#10B981", // Green
      label: "Approvals",
      description: "Streamline student request approvals",
    },
    {
      icon: <MdSecurity style={{ fontSize: '1.25rem' }} />,
      color: "#F59E0B", // Amber
      label: "Security",
      description: "Ensure campus safety and security",
    },
    {
      icon: <FaTools style={{ fontSize: '1.25rem' }} />,
      color: "#6B7280", // Gray
      label: "Maintenance",
      description: "Manage repair tasks and requests",
    },
    {
      icon: <FiBell style={{ fontSize: '1.25rem' }} />,
      color: "#F97316", // Orange
      label: "Notifications",
      description: "Real-time alerts for all residents",
    },
    {
      icon: <MdDashboard style={{ fontSize: '1.25rem' }} />,
      color: "#9333EA", // Indigo
      label: "Dashboard",
      description: "Monitor all hostel activities",
    },
    {
      icon: <FaUserClock style={{ fontSize: '1.25rem' }} />,
      color: "#14B8A6", // Teal
      label: "Visitor Management",
      description: "Track and manage campus visitors",
    },
  ]

  return (
    <div className="stats-graphic">
      <div className="stats-graphic-grid">
        {features.map((feature, index) => (
          <div
            key={index}
            className="stats-feature-card"
            style={{
              backgroundColor: `${feature.color}06`,
              borderBottom: `3px solid ${feature.color}`,
              boxShadow: `0 4px 12px -2px ${feature.color}15`,
            }}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
          >
            {/* Background Pattern */}
            <div className="stats-feature-card-bg" style={{ backgroundColor: `${feature.color}08` }}>
              <div
                className="stats-feature-card-shape-1"
                style={{
                  backgroundColor: `${feature.color}25`,
                  boxShadow: `0 0 20px 0 ${feature.color}20`,
                }}
              />
              <div
                className="stats-feature-card-shape-2"
                style={{
                  backgroundColor: `${feature.color}20`,
                  boxShadow: `0 0 15px 0 ${feature.color}18`,
                }}
              />
              <div
                className="stats-feature-card-center"
                style={{ backgroundColor: feature.color }}
              />
            </div>

            {/* Icon */}
            <div
              className={`stats-feature-icon ${activeCard === index ? "active" : ""}`}
              style={{
                color: feature.color,
                backgroundColor: `${feature.color}20`,
                boxShadow: activeCard === index
                  ? `0 10px 20px -4px ${feature.color}35, 0 4px 8px -2px ${feature.color}20`
                  : `0 4px 12px -2px ${feature.color}15`,
              }}
            >
              {feature.icon}
              {activeCard === index && (
                <div
                  className="stats-feature-icon-ping"
                  style={{ backgroundColor: feature.color }}
                />
              )}
            </div>

            {/* Label */}
            <div
              className={`stats-feature-label ${activeCard === index ? "active" : ""}`}
              style={{ color: activeCard === index ? feature.color : "#4B5563" }}
            >
              {feature.label}
            </div>

            {/* Description Overlay */}
            <div
              className="stats-feature-overlay"
              style={{
                backgroundColor: `${feature.color}ee`,
                transform: activeCard === index ? "scale(1)" : "scale(0.97)",
              }}
            >
              <p className="stats-feature-overlay-text">{feature.description}</p>
            </div>

            {/* Glowing Border */}
            {activeCard === index && (
              <div
                className="stats-feature-glow"
                style={{
                  boxShadow: `inset 0 0 0 2px ${feature.color}50, 0 0 20px ${feature.color}20`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatisticsGraphic
