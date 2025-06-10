import React, { useState } from "react"
import { FaBuilding, FaEdit, FaEnvelope, FaShieldAlt, FaIdCard, FaCircle, FaEye } from "react-icons/fa"
import EditSecurityForm from "./EditSecurityForm"
import SecurityStaffDetailsModal from "./SecurityStaffDetailsModal"
import { useAdmin } from "../../../contexts/AdminProvider"

const SecurityCard = ({ security, onUpdate, onDelete }) => {
  const { hostelList } = useAdmin()
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const getHostelName = (hostelId) => {
    const hostel = hostelList?.find((hostel) => hostel._id === hostelId)
    return hostel ? hostel.name : "Not assigned to any hostel"
  }

  const getStatusColor = () => {
    return security.hostelId ? { bg: "bg-green-500", light: "bg-green-100", text: "text-green-700" } : { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700" }
  }

  const statusColor = getStatusColor()
  const hostelName = getHostelName(security.hostelId)

  return (
    <>
      <div className="group bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 relative">
        <div className="absolute top-3 right-3 flex items-center">
          <div className={` right-4 h-3 w-3 rounded-full ${statusColor.bg}`}></div>

          <span className={`ml-1.5 text-xs font-medium ${statusColor.text}`}>{security.hostelId ? "Assigned" : "Unassigned"}</span>
        </div>

        <div className="flex items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1360AB] flex items-center justify-center text-[#ffffff] text-xl mr-4">
            <FaShieldAlt />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{security.name}</h3>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <FaIdCard className="mr-1.5 text-[#1360AB] opacity-70" />
              <span>Security Staff</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center">
            <div className="w-7 h-7 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
              <FaEnvelope className="text-[#1360AB] text-xs" />
            </div>
            <span className="text-sm text-gray-700 truncate">{security.email}</span>
          </div>

          <div className="flex items-center">
            <div className="w-7 h-7 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
              <FaBuilding className="text-[#1360AB] text-xs" />
            </div>
            <div>
              <span className="text-sm text-gray-700 font-medium">{hostelName}</span>
              {/* {!security.hostelId && <span className="ml-2 text-xs text-orange-500">(Needs assignment)</span>} */}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
          <button onClick={() => setShowDetailsModal(true)} className="flex-1 p-2.5 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300 flex items-center justify-center">
            <FaEye className="mr-1" /> <span className="text-sm">View Details</span>
          </button>
          <button onClick={() => setShowEditForm(true)} className="flex-1 p-2.5 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300 flex items-center justify-center">
            <FaEdit className="mr-1" /> <span className="text-sm">Edit</span>
          </button>
        </div>
      </div>

      {showEditForm && <EditSecurityForm security={security} onClose={() => setShowEditForm(false)} onUpdate={onUpdate} onDelete={onDelete} />}
      {showDetailsModal && <SecurityStaffDetailsModal staff={security} onClose={() => setShowDetailsModal(false)} />}
    </>
  )
}

export default SecurityCard
