import React, { useState } from "react"
import { FaTools, FaEdit, FaEnvelope, FaWrench, FaBolt, FaBuilding, FaBroom, FaWifi, FaEllipsisH, FaUserCog, FaPhone, FaEye, FaUserTie } from "react-icons/fa"
import EditMaintenanceForm from "./EditMaintenanceForm"
import MaintenanceStaffDetailsModal from "./MaintenanceStaffDetailsModal"
import { getMediaUrl } from "../../../utils/mediaUtils"
import Card from "../../common/Card"

const CATEGORY_DISPLAY_LABELS = {
  Plumbing: "Plumber",
  Electrical: "Electrician",
  Civil: "Carpenter",
  Cleanliness: "House Keeping",
  Internet: "IT Technician",
  Attendant: "Attendant",
  Other: "Other",
}
const getCategoryDisplayLabel = (value) => CATEGORY_DISPLAY_LABELS[value] || value
const MaintenanceCard = ({ staff, onUpdate, onDelete }) => {
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Plumbing":
        return <FaWrench className="text-blue-500" />
      case "Electrical":
        return <FaBolt className="text-yellow-500" />
      case "Civil":
        return <FaBuilding className="text-orange-500" />
      case "Cleanliness":
        return <FaBroom className="text-green-500" />
      case "Internet":
        return <FaWifi className="text-purple-500" />
      case "Attendant":
        return <FaUserTie className="text-pink-500" />
      default:
        return <FaEllipsisH className="text-gray-500" />
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "Plumbing":
        return { bg: "bg-blue-100", text: "text-blue-700" }
      case "Electrical":
        return { bg: "bg-yellow-100", text: "text-yellow-700" }
      case "Civil":
        return { bg: "bg-orange-100", text: "text-orange-700" }
      case "Cleanliness":
        return { bg: "bg-green-100", text: "text-green-700" }
      case "Internet":
        return { bg: "bg-purple-100", text: "text-purple-700" }
      case "Attendant":
        return { bg: "bg-pink-100", text: "text-pink-700" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-700" }
    }
  }

  const categoryColor = getCategoryColor(staff.category)

  return (
    <>
      <Card className="group relative">
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColor.bg} ${categoryColor.text}`}>{getCategoryDisplayLabel(staff.category)}</span>
        </div>

        <Card.Header className="mb-0">
          <div className="flex items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mr-4 overflow-hidden">
              {staff.profileImage ? (
                <img src={getMediaUrl(staff.profileImage)} alt={staff.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1360AB] flex items-center justify-center text-[#ffffff] text-xl">
                  <FaUserCog />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{staff.name}</h3>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                {getCategoryIcon(staff.category)}
                <span className="ml-1.5">{getCategoryDisplayLabel(staff.category)}</span>
              </div>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="mt-5 pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center">
            <div className="w-7 h-7 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
              <FaEnvelope className="text-[#1360AB] text-xs" />
            </div>
            <span className="text-sm text-gray-700 truncate">{staff.email}</span>
          </div>

          <div className="flex items-center">
            <div className="w-7 h-7 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
              <FaPhone className="text-[#1360AB] text-xs" />
            </div>
            <span className="text-sm text-gray-700 truncate">{staff.phone || "Not provided"}</span>
          </div>
        </Card.Body>

        <Card.Footer className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
          <button onClick={() => setShowDetailsModal(true)} className="flex-1 p-2.5 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300 flex items-center justify-center">
            <FaEye className="mr-1" /> <span className="text-sm">View Details</span>
          </button>
          <button onClick={() => setShowEditForm(true)} className="flex-1 p-2.5 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300 flex items-center justify-center">
            <FaEdit className="mr-1" /> <span className="text-sm">Edit</span>
          </button>
        </Card.Footer>
      </Card>

      {showEditForm && <EditMaintenanceForm staff={staff} onClose={() => setShowEditForm(false)} onUpdate={onUpdate} onDelete={onDelete} />}
      {showDetailsModal && <MaintenanceStaffDetailsModal staff={staff} onClose={() => setShowDetailsModal(false)} />}
    </>
  )
}

export default MaintenanceCard
