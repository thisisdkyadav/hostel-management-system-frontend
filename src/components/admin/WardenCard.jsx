import React from "react"
import { FaBuilding, FaEdit, FaEnvelope, FaPhone, FaTrash } from "react-icons/fa"
import { BsCalendarCheck } from "react-icons/bs"

const WardenCard = ({ warden }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return { bg: "bg-green-500", light: "bg-green-100", text: "text-green-700" }
      case "unassigned":
        return { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700" }
      default:
        return { bg: "bg-gray-400", light: "bg-gray-100", text: "text-gray-700" }
    }
  }

  const statusColor = getStatusColor(warden.status)

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)] relative">
      {/* Status indicator */}
      <div className={`absolute top-4 right-4 h-3 w-3 rounded-full ${statusColor.bg}`}></div>

      <div className="flex items-center">
        <img src={warden.image} alt={warden.name} className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-[#1360AB]" />
        <div>
          <h3 className="font-bold text-lg">{warden.name}</h3>
          <p className="text-sm text-gray-600">{warden.department}</p>
          <p className="text-xs text-[#1360AB] mt-1">{warden.education}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center">
          <FaEnvelope className="text-gray-400 mr-2" />
          <span>{warden.email}</span>
        </div>
        <div className="flex items-center">
          <FaPhone className="text-gray-400 mr-2" />
          <span>{warden.phone}</span>
        </div>
        <div className="flex items-center">
          <FaBuilding className="text-gray-400 mr-2" />
          <span>{warden.hostelAssigned || "Not assigned"}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <BsCalendarCheck className="text-[#1360AB] mr-2" />
          <span className="text-sm">{warden.experience} years experience</span>
        </div>
        <div className={`text-xs px-2 py-1 rounded ${statusColor.light} ${statusColor.text}`}>{warden.status.charAt(0).toUpperCase() + warden.status.slice(1)}</div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Joined on{" "}
          {new Date(warden.joinDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>

        <div className="flex space-x-2">
          <button className="p-2 bg-blue-50 text-[#1360AB] rounded-lg hover:bg-blue-100">
            <FaEdit />
          </button>
          <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  )
}

export default WardenCard
