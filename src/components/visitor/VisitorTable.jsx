import React, { useState } from "react"
import { FaEdit } from "react-icons/fa"
import StatusBadge from "../common/StatusBadge"
import EditVisitorModal from "./EditVisitorModal"

const VisitorTable = ({ visitors, onUpdateVisitor }) => {
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  console.log(visitors[0], "Visitors data in VisitorTable")

  const handleEditClick = (visitor) => {
    setSelectedVisitor(visitor)
    setShowEditModal(true)
  }

  const handleCloseModal = () => {
    setShowEditModal(false)
    setSelectedVisitor(null)
  }

  const handleSaveVisitor = (updatedVisitor) => {
    if (onUpdateVisitor) {
      onUpdateVisitor(updatedVisitor)
    }
  }

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString)
    return {
      date: dateTime.toLocaleDateString(),
      time: dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  if (visitors.length === 0) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0px_1px_20px_rgba(0,0,0,0.06)] p-6 text-center">
        <p className="text-gray-500">No visitors found</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-[20px] shadow-[0px_1px_20px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {visitors.map((visitor) => {
                const { date, time } = formatDateTime(visitor.DateTime)
                return (
                  <tr key={visitor._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{visitor.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{visitor.room}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={visitor.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditClick(visitor)} className="text-[#1360AB] hover:text-[#0d4c8b] bg-[#E4F1FF] p-2 rounded-lg">
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showEditModal && selectedVisitor && <EditVisitorModal visitor={selectedVisitor} onClose={handleCloseModal} onSave={handleSaveVisitor} />}
    </>
  )
}

export default VisitorTable
