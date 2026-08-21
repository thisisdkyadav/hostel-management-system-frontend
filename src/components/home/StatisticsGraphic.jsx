import React, { useState } from "react"
import {
  DoorOpen,
  Users,
  FileWarning,
  ClipboardCheck,
  Shield,
  Wrench,
  Bell,
  LayoutDashboard,
  UserCheck
} from "lucide-react"
import { Text } from "hzero"


const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`

const StatisticsGraphic = () => {
  const [activeCard, setActiveCard] = useState(null)

  // Core hostel management features
  const features = [
    {
      icon: <DoorOpen size={20} />,
      color: "var(--color-info)",
      label: "Room Management",
      description: "Allocate and manage hostel rooms efficiently",
    },
    {
      icon: <Users size={20} />,
      color: "var(--color-primary)",
      label: "Student Management",
      description: "Track student information and history",
    },
    {
      icon: <FileWarning size={20} />,
      color: "var(--color-danger)",
      label: "Complaints",
      description: "Process and resolve student issues quickly",
    },
    {
      icon: <ClipboardCheck size={20} />,
      color: "var(--color-success)",
      label: "Approvals",
      description: "Streamline student request approvals",
    },
    {
      icon: <Shield size={20} />,
      color: "var(--color-warning)",
      label: "Security",
      description: "Ensure campus safety and security",
    },
    {
      icon: <Wrench size={20} />,
      color: "var(--color-text-muted)",
      label: "Maintenance",
      description: "Manage repair tasks and requests",
    },
    {
      icon: <Bell size={20} />,
      color: "var(--color-warning)",
      label: "Notifications",
      description: "Real-time alerts for all residents",
    },
    {
      icon: <LayoutDashboard size={20} />,
      color: "var(--color-primary)",
      label: "Dashboard",
      description: "Monitor all hostel activities",
    },
    {
      icon: <UserCheck size={20} />,
      color: "var(--color-success)",
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
              backgroundColor: tint(feature.color, 2),
              borderBottom: `3px solid ${feature.color}`,
              boxShadow: `0 4px 12px -2px ${tint(feature.color, 8)}`,
            }}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
          >
            {/* Background Pattern */}
            <div className="stats-feature-card-bg" style={{ backgroundColor: tint(feature.color, 3) }}>
              <div
                className="stats-feature-card-shape-1"
                style={{
                  backgroundColor: tint(feature.color, 15),
                  boxShadow: `0 0 20px 0 ${tint(feature.color, 12)}`,
                }}
              />
              <div
                className="stats-feature-card-shape-2"
                style={{
                  backgroundColor: tint(feature.color, 12),
                  boxShadow: `0 0 15px 0 ${tint(feature.color, 9)}`,
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
                backgroundColor: tint(feature.color, 12),
                boxShadow: activeCard === index
                  ? `0 10px 20px -4px ${tint(feature.color, 21)}, 0 4px 8px -2px ${tint(feature.color, 12)}`
                  : `0 4px 12px -2px ${tint(feature.color, 8)}`,
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
            <Text as="div" color={activeCard === index ? feature.color : "var(--color-text-secondary)"} className={`stats-feature-label ${activeCard === index ? "active" : ""}`}>
              {feature.label}
            </Text>

            {/* Description Overlay */}
            <div
              className="stats-feature-overlay"
              style={{
                backgroundColor: tint(feature.color, 93),
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
                  boxShadow: `inset 0 0 0 2px ${tint(feature.color, 31)}, 0 0 20px ${tint(feature.color, 12)}`,
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
