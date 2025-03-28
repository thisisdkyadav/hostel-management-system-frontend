import React, { useState } from "react"
import { MdMeetingRoom, MdPeople, MdSecurity, MdDashboard } from "react-icons/md"
import { FaClipboardCheck, FaTools } from "react-icons/fa"
import { HiOutlineDocumentReport } from "react-icons/hi"

const StatisticsGraphic = () => {
  const [activeCard, setActiveCard] = useState(null)

  // Core hostel management features
  const features = [
    {
      icon: <MdMeetingRoom />,
      color: "#3B82F6",
      label: "Room Management",
      description: "Allocate and manage hostel rooms",
    },
    {
      icon: <MdPeople />,
      color: "#8B5CF6",
      label: "Student Management",
      description: "Track student information",
    },
    {
      icon: <HiOutlineDocumentReport />,
      color: "#EF4444",
      label: "Complaints",
      description: "Process and resolve issues",
    },
    {
      icon: <FaClipboardCheck />,
      color: "#10B981",
      label: "Approvals",
      description: "Handle student requests",
    },
    {
      icon: <MdSecurity />,
      color: "#F59E0B",
      label: "Security",
      description: "Manage entries and visitors",
    },
    {
      icon: <FaTools />,
      color: "#6B7280",
      label: "Maintenance",
      description: "Track repair requests",
    },
  ]

  return (
    <div className="text-gray-800">
      <h3 className="text-xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Hostel Management System</h3>

      <div className="grid grid-cols-3 gap-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-300 overflow-hidden group"
            style={{
              backgroundColor: `${feature.color}15`,
              borderLeft: `3px solid ${feature.color}`,
            }}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
          >
            {/* Top corner accent */}
            <div
              className="absolute top-0 right-0 w-16 h-16 -translate-y-8 translate-x-8 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-500"
              style={{
                background: `linear-gradient(135deg, ${feature.color}30, ${feature.color}00)`,
                borderRadius: "50%",
              }}
            />

            {/* Icon wrapper */}
            <div className="w-10 h-10 rounded flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{ color: feature.color }}>
              <div className="text-xl">{feature.icon}</div>
            </div>

            {/* Label */}
            <div className="mt-2 text-xs font-medium text-center leading-tight">{feature.label}</div>

            {/* Description overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b" style={{ background: `linear-gradient(180deg, ${feature.color}95, ${feature.color}BB)` }}>
              <p className="text-white text-xs text-center">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600 max-w-xs mx-auto">Modern hostel management solution for streamlined administration</p>
      </div>
    </div>
  )
}

export default StatisticsGraphic
