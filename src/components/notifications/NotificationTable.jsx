import React, { useState } from "react"
import { FaEye, FaEnvelope } from "react-icons/fa"
import { format } from "date-fns"
import ViewNotificationModal from "./ViewNotificationModal"

const NotificationTable = ({ notifications, onResendEmail }) => {
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification)
    setShowViewModal(true)
  }

  // const getStatusBadge = (status) => {
  //   switch (status) {
  //     case "sent":
  //       return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Sent</span>
  //     case "draft":
  //       return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Draft</span>
  //     case "cancelled":
  //       return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>
  //     default:
  //       return null
  //   }
  // }

  // const getTargetTypeBadge = (notification) => {
  //   const { targetType, targets } = notification
  //   switch (targetType) {
  //     case "all":
  //       return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">All Students</span>
  //     case "hostel":
  //       return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{targets.hostelIds?.length || 0} Hostels</span>
  //     case "department":
  //       return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{targets.departments?.length || 0} Departments</span>
  //     case "degree":
  //       return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">{targets.degrees?.length || 0} Degrees</span>
  //     case "admission_year":
  //       return (
  //         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
  //           Years {targets.admissionYearStart} - {targets.admissionYearEnd}
  //         </span>
  //       )
  //     case "specific":
  //       return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{targets.specific?.length || 0} Specific Students</span>
  //     default:
  //       return null
  //   }
  // }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
                {/* & Status */}
              </th>
              {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th> */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notifications.map((notification) => (
              <tr key={notification._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-start flex-col">
                    <div className="text-sm font-medium text-gray-900 mb-1">{notification.title}</div>
                    {/* {getStatusBadge(notification.status)} */}
                  </div>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">{getTargetTypeBadge(notification)}</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(notification.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(notification.expiryDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => handleViewNotification(notification)} className="text-blue-600 hover:text-blue-900 p-1" title="View">
                      <FaEye />
                    </button>

                    {/* {notification.status === "sent" && (
                      <button onClick={() => onResendEmail(notification._id)} className="text-green-600 hover:text-green-900 p-1" title="Resend Email">
                        <FaEnvelope />
                      </button>
                    )} */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showViewModal && <ViewNotificationModal isOpen={showViewModal} onClose={() => setShowViewModal(false)} notification={selectedNotification} />}
    </>
  )
}

export default NotificationTable
