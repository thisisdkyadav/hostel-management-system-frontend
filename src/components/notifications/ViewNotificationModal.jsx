import React from "react"
import Modal from "../common/Modal"
import { FaRegClock, FaUserAlt, FaEnvelope, FaRegCalendarAlt } from "react-icons/fa"
import { format } from "date-fns"

const ViewNotificationModal = ({ isOpen, onClose, notification }) => {
  if (!notification) return null

  const getTargetTypeLabel = () => {
    const { targetType, targets } = notification

    switch (targetType) {
      case "all":
        return "All Students"
      case "hostel":
        return `${targets.hostelIds?.length || 0} Hostels`
      case "department":
        return `${targets.departments?.length || 0} Departments`
      case "degree":
        return `${targets.degrees?.length || 0} Degrees`
      case "admission_year":
        return `Admission Years ${targets.admissionYearStart}-${targets.admissionYearEnd}`
      case "specific":
        return `${targets.specific?.length || 0} Specific Students`
      default:
        return "Unknown"
    }
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "sent":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Sent</span>
      case "draft":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Draft</span>
      case "cancelled":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>
      default:
        return null
    }
  }

  return (
    <Modal title="Notification Details" onClose={onClose} width={700} isOpen={isOpen}>
      <div className="space-y-5">
        <header className="flex flex-col sm:flex-row justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">{notification.title}</h2>
          <div>{getStatusBadge(notification.status)}</div>
        </header>

        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-gray-700 whitespace-pre-line">{notification.message}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="mr-3 mt-0.5 text-blue-500">
              <FaUserAlt />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Target Audience</h4>
              <p className="text-gray-600">{getTargetTypeLabel()}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="mr-3 mt-0.5 text-green-500">
              <FaRegClock />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Created</h4>
              <p className="text-gray-600">{formatDate(notification.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="mr-3 mt-0.5 text-orange-500">
              <FaRegCalendarAlt />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Expires</h4>
              <p className="text-gray-600">{formatDate(notification.expiryDate)}</p>
            </div>
          </div>

          {/* <div className="flex items-start">
            <div className="mr-3 mt-0.5 text-purple-500">
              <FaEnvelope />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Email Status</h4>
              <p className="text-gray-600">{notification.emailSent ? "Sent" : "Not sent"}</p>
            </div>
          </div> */}
        </div>

        {notification.targetType !== "all" && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Target Details</h4>
            <div className="bg-gray-50 p-4 rounded-xl max-h-40 overflow-y-auto">
              {notification.targetType === "hostel" && notification.targets.hostelIds?.length > 0 && (
                <div>
                  <strong className="text-xs text-gray-500">Hostels:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {notification.targets.hostelIds.map((hostel, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        {hostel.name || hostel}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {notification.targetType === "department" && notification.targets.departments?.length > 0 && (
                <div>
                  <strong className="text-xs text-gray-500">Departments:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {notification.targets.departments.map((dept, idx) => (
                      <span key={idx} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {notification.targetType === "degree" && notification.targets.degrees?.length > 0 && (
                <div>
                  <strong className="text-xs text-gray-500">Degrees:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {notification.targets.degrees.map((degree, idx) => (
                      <span key={idx} className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">
                        {degree}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {notification.targetType === "admission_year" && (
                <div>
                  <strong className="text-xs text-gray-500">Admission Years:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                      {notification.targets.admissionYearStart} - {notification.targets.admissionYearEnd}
                    </span>
                  </div>
                </div>
              )}

              {notification.targetType === "specific" && notification.targets.specific?.length > 0 && (
                <div>
                  <strong className="text-xs text-gray-500">Specific Students:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {notification.targets.specific.map((student, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {student.name || student}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ViewNotificationModal
