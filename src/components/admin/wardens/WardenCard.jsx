import React, { useState } from "react"
import { FaBuilding, FaEdit, FaEnvelope, FaPhone } from "react-icons/fa"
import { BsCalendarCheck } from "react-icons/bs"
import EditWardenForm from "./EditWardenForm"

const WardenCard = ({ warden, onUpdate, onDelete, hostelList }) => {
  const [showEditForm, setShowEditForm] = useState(false)

  const getHostelName = (hostelId) => {
    const hostel = hostelList.find((hostel) => hostel._id === hostelId)
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
      <div className="bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)] relative hover:shadow-md transition duration-300">
        <div className={`absolute top-4 right-4 h-3 w-3 rounded-full ${statusColor.bg}`}></div>

        <div className="flex items-center">
          <img src={warden.profilePic} alt={warden.name} className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-[#1360AB]" />
          <div>
            <h3 className="font-bold text-lg text-gray-800">{warden.name}</h3>
            <p className={`text-xs mt-1 ${statusColor.light} ${statusColor.text} inline-block px-2 py-0.5 rounded-full`}>{warden.status === "assigned" ? "Assigned" : "Unassigned"}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center">
            <FaEnvelope className="text-gray-400 mr-2 flex-shrink-0" />
            <span className="truncate">{warden.email}</span>
          </div>
          <div className="flex items-center">
            <FaPhone className="text-gray-400 mr-2 flex-shrink-0" />
            {warden.phone ? <span>{warden.phone}</span> : <span className="text-gray-400">Phone number not provided</span>}
          </div>
          <div className="flex items-center">
            <FaBuilding className="text-gray-400 mr-2 flex-shrink-0" />
            <span className="font-medium">{getHostelName(warden.hostelAssigned) || "Not assigned to any hostel"}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <BsCalendarCheck className="text-[#1360AB] mr-2" />
          <span className="text-sm">
            {serviceYears} {serviceYears === 1 ? "year" : "years"} of service
          </span>
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

          <div>
            <button onClick={() => setShowEditForm(true)} className="p-2 bg-blue-50 text-[#1360AB] rounded-lg hover:bg-blue-100 transition duration-200">
              <FaEdit />
            </button>
          </div>
        </div>
      </div>

      {showEditForm && <EditWardenForm warden={warden} onClose={() => setShowEditForm(false)} onSave={handleSave} onDelete={onDelete} hostelList={hostelList} />}
    </>
  )
}

export default WardenCard
