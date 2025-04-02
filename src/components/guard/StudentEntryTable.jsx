import React, { useState } from "react"
import { FaEdit } from "react-icons/fa"
import StatusBadge from "../common/StatusBadge"
import EditStudentEntryModal from "./EditStudentEntryModal"
import { securityApi } from "../../services/apiService"

const StudentEntryTable = ({ entries, refresh }) => {
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleEditClick = (entry) => {
    setSelectedEntry(entry)
    setShowEditModal(true)
  }

  const handleCloseModal = () => {
    setShowEditModal(false)
    setSelectedEntry(null)
  }

  const handleSaveEntry = async (updatedEntry) => {
    try {
      const entryToUpdate = {
        ...updatedEntry,
        dateAndTime: new Date(updatedEntry.dateAndTime).toISOString(),
      }

      const response = await securityApi.updateStudentEntry(entryToUpdate)
      if (response.success) {
        refresh()
        handleCloseModal()
      } else {
        throw new Error("Failed to update student entry")
      }
    } catch (error) {
      console.error("Error updating entry:", error)
      alert("Failed to update student entry.")
    }
  }

  const handleDeleteEntry = async (entryId) => {
    try {
      await securityApi.deleteStudentEntry(entryId)
      refresh()
    } catch (error) {
      console.error("Error deleting entry:", error)
      alert("Failed to delete student entry.")
    }
  }

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString)
    return {
      date: dateTime.toLocaleDateString(),
      time: dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0px_1px_20px_rgba(0,0,0,0.06)] p-6 text-center">
        <p className="text-gray-500">No student entries found</p>
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
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((entry) => {
                const { date, time } = formatDateTime(entry.dateAndTime)
                return (
                  <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.studentId}</div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.userId.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{entry.unit || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {entry.room}
                        {entry.bed}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditClick(entry)} className="text-[#1360AB] hover:text-[#0d4c8b] bg-[#E4F1FF] p-2 rounded-lg">
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
      {showEditModal && selectedEntry && <EditStudentEntryModal entry={selectedEntry} onClose={handleCloseModal} onSave={handleSaveEntry} onDelete={handleDeleteEntry} />}
    </>
  )
}

export default StudentEntryTable
