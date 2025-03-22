import React, { useState } from "react"
import { FaUserAlt, FaTrash, FaUserPlus, FaToggleOn, FaToggleOff } from "react-icons/fa"
import { MdClose } from "react-icons/md"
import { hostelApi } from "../../services/apiService"

const RoomDetailModal = ({ room, onClose, onUpdate, onAllocate }) => {
  const [loading, setLoading] = useState(false)

  const handleRemoveStudent = async (allocationId) => {
    if (!confirm("Are you sure you want to remove this student from the room?")) {
      return
    }

    try {
      setLoading(true)
      await hostelApi.deallocateRoom(allocationId)
      alert("Student removed successfully")
      onUpdate()
    } catch (error) {
      console.error("Failed to remove student:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = room.status === "Inactive" ? "Active" : "Inactive"
    const message = newStatus === "Inactive" ? "Are you sure you want to mark this room as inactive? All Students allocated to this room will be removed." : "Are you sure you want to activate this room?"

    if (!confirm(message)) {
      return
    }

    try {
      setLoading(true)
      await hostelApi.updateRoomStatus(room.id, newStatus)
      alert(`Room status changed to ${newStatus} successfully`)
      onUpdate()
    } catch (error) {
      console.error("Failed to update room status:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Room {room.roomNumber} Details</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <MdClose size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Room Information</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-500">Room Number:</span>
                  <span className="font-medium">{room.roomNumber}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{room.type || "Standard"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Capacity:</span>
                  <span className="font-medium">{room.capacity} students</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Current Occupancy:</span>
                  <span className="font-medium">{room.status === "Inactive" ? "Inactive" : `${room.currentOccupancy}/${room.capacity}`}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Floor:</span>
                  <span className="font-medium">{room.floor || "Ground"}</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Additional Details</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-500">Hostel:</span>
                  <span className="font-medium">{room.hostel?.name || "N/A"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Unit:</span>
                  <span className="font-medium">{room.unit?.name || "N/A"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`font-medium px-2 py-0.5 rounded-full text-sm ${room.status === "Inactive" ? "bg-red-100 text-red-800" : room.currentOccupancy >= room.capacity ? "bg-green-100 text-green-800" : room.currentOccupancy > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {room.status === "Inactive" ? "Inactive" : room.currentOccupancy >= room.capacity ? "Full" : room.currentOccupancy > 0 ? "Partially Occupied" : "Empty"}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 mb-6">
            <button onClick={handleToggleStatus} disabled={loading} className={`flex items-center ${room.status === "Inactive" ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-700 hover:bg-red-100"} px-4 py-2 rounded-lg transition-colors`}>
              {room.status === "Inactive" ? (
                <>
                  <FaToggleOff className="mr-2" /> Activate Room
                </>
              ) : (
                <>
                  <FaToggleOn className="mr-2" /> Mark as Inactive
                </>
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Allocated Students</h3>
              {room.status !== "Inactive" && room.currentOccupancy < room.capacity && (
                <button onClick={onAllocate} className="flex items-center text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100">
                  <FaUserPlus className="mr-1" /> Allocate Student
                </button>
              )}
            </div>

            {room.status === "Inactive" ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <FaToggleOff className="mx-auto text-gray-300 text-4xl mb-3" />
                <p className="text-gray-500">This room is currently inactive and not available for allocation</p>
              </div>
            ) : room.students && room.students.length > 0 ? (
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {room.students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaUserAlt className="text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.year} Year</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button onClick={() => handleRemoveStudent(student.allocationId)} disabled={loading} className="text-red-600 hover:text-red-900 p-1" title="Remove from Room">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <FaUserAlt className="mx-auto text-gray-300 text-4xl mb-3" />
                <p className="text-gray-500">No students allocated to this room</p>
                {room.capacity > 0 && (
                  <button onClick={onAllocate} className="mt-4 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 inline-flex items-center">
                    <FaUserPlus className="mr-2" /> Allocate Student
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoomDetailModal
