import React, { useState } from "react"
import { FaBuilding, FaEdit, FaEnvelope, FaPhone, FaUserTie } from "react-icons/fa"
import { BsCalendarCheck } from "react-icons/bs"
import EditWardenForm from "./EditWardenForm"
import { useAdmin } from "../../../contexts/AdminProvider"

const WardenCard = ({ warden, onUpdate, onDelete }) => {
  const { hostelList } = useAdmin()

  const [showEditForm, setShowEditForm] = useState(false)

  const getHostelName = (hostelId) => {
    const hostel = hostelList?.find((hostel) => hostel._id === hostelId)
    return hostel ? hostel.name : "Not assigned to any hostel"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return { bg: "bg-green-500", light: "bg-green-100", text: "text-green-700" }
      case "unassigned":
        return { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700" }
      default:
        return { bg: "bg-gray-400", light: "bg-gray-100", text: "text-gray-700" }
    }
  }

  const calculateServiceYears = (joinDate) => {
    const start = new Date(joinDate)
    const now = new Date()
    return Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000))
  }

  const serviceYears = calculateServiceYears(warden.joinDate)
  const statusColor = getStatusColor(warden.status)

  const handleSave = (updatedWarden) => {
    onUpdate(updatedWarden)
    setShowEditForm(false)
  }

  return (
    <>
      <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
        {/* Status indicator */}
        <div className={`absolute top-0 right-0 w-16 h-16`}>
          <div className={`absolute rotate-45 transform origin-bottom-right ${statusColor.bg} text-white text-xs font-medium py-1 right-[-6px] top-[-2px] w-24 text-center`}>{warden.status === "assigned" ? "Assigned" : "Unassigned"}</div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex-shrink-0 mb-3 md:mb-0 md:mr-4">
            {warden.profilePic ? (
              <img src={warden.profilePic} alt={warden.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#1360AB] shadow-sm" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center border-2 border-[#1360AB]">
                <FaUserTie className="text-[#1360AB] text-2xl" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800 truncate">{warden.name}</h3>
            <div className="flex flex-wrap items-center mt-1 text-sm">
              <BsCalendarCheck className="text-[#1360AB] mr-1.5" />
              <span className="text-gray-600">
                {serviceYears} {serviceYears === 1 ? "year" : "years"} of service
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 flex justify-center">
              <FaEnvelope className="text-gray-400" />
            </div>
            <span className="truncate text-gray-700">{warden.email}</span>
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 flex justify-center">
              <FaPhone className="text-gray-400" />
            </div>
            {warden.phone ? <span className="text-gray-700">{warden.phone}</span> : <span className="text-gray-400 italic">Not provided</span>}
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 flex justify-center">
              <FaBuilding className="text-gray-400" />
            </div>
            <span className="font-medium text-gray-800">{getHostelName(warden.hostelAssigned) || "Not assigned to any hostel"}</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Joined on{" "}
            {new Date(warden.joinDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>

          <button onClick={() => setShowEditForm(true)} className="flex items-center justify-center p-2.5 bg-blue-50 text-[#1360AB] rounded-lg hover:bg-blue-100 transition-all duration-200" aria-label="Edit warden">
            <FaEdit className="text-sm" />
          </button>
        </div>
      </div>

      {showEditForm && <EditWardenForm warden={warden} onClose={() => setShowEditForm(false)} onSave={handleSave} onDelete={onDelete} />}
    </>
  )
}

export default WardenCard
