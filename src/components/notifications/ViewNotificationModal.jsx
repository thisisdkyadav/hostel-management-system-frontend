import React from "react"
import Modal from "../common/Modal"
import { FaRegClock, FaUserAlt, FaBuilding, FaGraduationCap, FaVenusMars } from "react-icons/fa"
import { format } from "date-fns"

const ViewNotificationModal = ({ isOpen, onClose, notification }) => {
  if (!notification) return null

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const isExpired = new Date(notification.expiryDate) < new Date()

  return (
    <Modal title="Notification Details" onClose={onClose} width={700} isOpen={isOpen}>
      <div className="space-y-5">
        <header className="flex flex-col sm:flex-row justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">{notification.title}</h2>
          <div>{isExpired ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span> : <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>}</div>
        </header>

        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-gray-700 whitespace-pre-line">{notification.message}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FaRegClock />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Expires</h4>
              <p className="text-gray-600">{formatDate(notification.expiryDate)}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Target Audience</h3>
          <div className="space-y-3">
            {notification.hostelId && notification.hostelId.length > 0 ? (
              <div className="flex items-start bg-gray-50 rounded-lg p-3">
                <FaBuilding className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium">Hostels:</span>
                  <span className="text-sm ml-1">{notification.hostelId.map((h) => h.name).join(", ")}</span>
                </div>
              </div>
            ) : null}

            {notification.department && notification.department.length > 0 ? (
              <div className="flex items-start bg-gray-50 rounded-lg p-3">
                <FaGraduationCap className="text-indigo-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium">Departments:</span>
                  <span className="text-sm ml-1">{notification.department.join(", ")}</span>
                </div>
              </div>
            ) : null}

            {notification.degree && notification.degree.length > 0 ? (
              <div className="flex items-start bg-gray-50 rounded-lg p-3">
                <FaUserAlt className="text-purple-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium">Degrees:</span>
                  <span className="text-sm ml-1">{notification.degree.join(", ")}</span>
                </div>
              </div>
            ) : null}

            {notification.gender ? (
              <div className="flex items-start bg-gray-50 rounded-lg p-3">
                <FaVenusMars className="text-pink-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium">Gender:</span>
                  <span className="text-sm ml-1">{notification.gender}</span>
                </div>
              </div>
            ) : null}

            {!notification.hostelId?.length && !notification.department?.length && !notification.degree?.length && !notification.gender && (
              <div className="flex items-center bg-gray-50 rounded-lg p-3">
                <FaUserAlt className="text-gray-500 mr-2" />
                <span className="text-sm">All Students</span>
              </div>
            )}
          </div>
        </div>

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
