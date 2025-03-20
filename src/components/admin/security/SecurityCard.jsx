import React, { useState } from "react"
import { FaBuilding, FaEdit, FaEnvelope, FaShieldAlt } from "react-icons/fa"
import EditSecurityForm from "./EditSecurityForm"
import { useAdmin } from "../../../contexts/AdminProvider"

const SecurityCard = ({ security, onUpdate, onDelete }) => {
  const { hostelList } = useAdmin()

  const [showEditForm, setShowEditForm] = useState(false)

  const getHostelName = (hostelId) => {
    const hostel = hostelList.find((hostel) => hostel._id === hostelId)
    return hostel ? hostel.name : "Not assigned to any hostel"
  }

  const getStatusColor = () => {
    return security.hostelId ? { bg: "bg-green-500", light: "bg-green-100", text: "text-green-700" } : { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700" }
  }

  const statusColor = getStatusColor()
  const hostelName = getHostelName(security.hostelId)

  return (
    <>
      <div className="bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)] relative hover:shadow-md transition duration-300">
        <div className={`absolute top-4 right-4 h-3 w-3 rounded-full ${statusColor.bg}`}></div>

        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-[#1360AB] flex items-center justify-center text-white text-2xl mr-4">
            <FaShieldAlt />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{security.name}</h3>
            <p className={`text-xs mt-1 ${statusColor.light} ${statusColor.text} inline-block px-2 py-0.5 rounded-full`}>{security.hostelId ? "Assigned" : "Unassigned"}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center">
            <FaEnvelope className="text-gray-400 mr-2 flex-shrink-0" />
            <span className="truncate">{security.email}</span>
          </div>
          <div className="flex items-center">
            <FaBuilding className="text-gray-400 mr-2 flex-shrink-0" />
            <span className="font-medium">{hostelName}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end items-center">
          <button onClick={() => setShowEditForm(true)} className="p-2 bg-blue-50 text-[#1360AB] rounded-lg hover:bg-blue-100 transition duration-200">
            <FaEdit />
          </button>
        </div>
      </div>

      {showEditForm && <EditSecurityForm security={security} onClose={() => setShowEditForm(false)} onUpdate={onUpdate} onDelete={onDelete} />}
    </>
  )
}

export default SecurityCard
