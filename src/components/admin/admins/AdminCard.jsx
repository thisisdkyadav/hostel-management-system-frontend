import React, { useState } from "react"
import { FaEdit, FaEnvelope, FaPhone, FaUserShield, FaTrash } from "react-icons/fa"
import { BsCalendarCheck } from "react-icons/bs"
import EditAdminForm from "./EditAdminForm"
import { getMediaUrl } from "../../../utils/mediaUtils"

const AdminCard = ({ admin, onUpdate, onDelete }) => {
  const [showEditForm, setShowEditForm] = useState(false)

  const calculateServiceYears = (createdAt) => {
    if (!createdAt) return 0
    const start = new Date(createdAt)
    const now = new Date()
    return Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000))
  }

  const serviceYears = calculateServiceYears(admin.createdAt)
  const status = admin.isActive !== false ? "active" : "inactive"

  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case "active":
        return { bg: "bg-green-500", light: "bg-green-100", text: "text-green-700" }
      case "inactive":
        return { bg: "bg-red-500", light: "bg-red-100", text: "text-red-700" }
      default:
        return { bg: "bg-gray-400", light: "bg-gray-100", text: "text-gray-700" }
    }
  }

  const statusColor = getStatusColor(status)

  const handleSave = () => {
    if (onUpdate) onUpdate()
    setShowEditForm(false)
  }

  const handleDelete = () => {
    if (onDelete) onDelete()
    setShowEditForm(false)
  }

  return (
    <>
      <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-16 h-16`}>
          <div className={`absolute rotate-45 transform origin-bottom-right ${statusColor.bg} text-white text-xs font-medium py-1 right-[-6px] top-[-2px] w-24 text-center`}>{status === "active" ? "Active" : "Inactive"}</div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex-shrink-0 mb-3 md:mb-0 md:mr-4">
            {admin.profileImage ? (
              <img src={getMediaUrl(admin.profileImage)} alt={admin.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#1360AB] shadow-sm" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center border-2 border-[#1360AB]">
                <FaUserShield className="text-[#1360AB] text-2xl" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800 truncate">{admin.name}</h3>
            <div className="text-sm text-gray-600 mt-0.5 truncate">{admin.category || "Admin"}</div>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 flex justify-center">
              <FaEnvelope className="text-gray-400" />
            </div>
            <span className="truncate text-gray-700">{admin.email}</span>
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 flex justify-center">
              <FaPhone className="text-gray-400" />
            </div>
            {admin.phone ? <span className="text-gray-700">{admin.phone}</span> : <span className="text-gray-400 italic">Not provided</span>}
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 flex justify-center pt-0.5">
              <FaUserShield className="text-gray-400" />
            </div>
            <span className="font-medium text-gray-800 break-words">System Administrator</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Added on{" "}
            {admin.createdAt
              ? new Date(admin.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </div>

          <div className="flex space-x-2">
            <button onClick={() => setShowEditForm(true)} className="flex items-center justify-center p-2.5 bg-blue-50 text-[#1360AB] rounded-lg hover:bg-blue-100 transition-all duration-200" aria-label="Edit administrator">
              <FaEdit className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      {showEditForm && <EditAdminForm admin={admin} onClose={() => setShowEditForm(false)} onSave={handleSave} onDelete={handleDelete} />}
    </>
  )
}

export default AdminCard
