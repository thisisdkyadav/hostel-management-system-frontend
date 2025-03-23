import React, { useState } from "react"
import { FaUserAlt, FaTrash, FaUserPlus, FaToggleOn, FaToggleOff, FaBed, FaBuilding } from "react-icons/fa"
import { hostelApi } from "../../services/apiService"
import Modal from "../../components/common/Modal"

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
    <Modal title={`Room ${room.roomNumber} Details`} onClose={onClose} width={800}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-5 rounded-xl">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <FaBed className="mr-2 text-[#1360AB]" /> Room Information
            </h3>
            <ul className="space-y-3">
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

          <div className="bg-gray-50 p-5 rounded-xl">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <FaBuilding className="mr-2 text-[#1360AB]" /> Additional Details
            </h3>
            <ul className="space-y-3">
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
                  className={`font-medium px-2.5 py-0.5 rounded-full text-sm ${room.status === "Inactive" ? "bg-red-100 text-red-800" : room.currentOccupancy >= room.capacity ? "bg-green-100 text-green-800" : room.currentOccupancy > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {room.status === "Inactive" ? "Inactive" : room.currentOccupancy >= room.capacity ? "Full" : room.currentOccupancy > 0 ? "Partially Occupied" : "Empty"}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <button onClick={handleToggleStatus} disabled={loading} className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${room.status === "Inactive" ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>
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
            <h3 className="text-lg font-medium flex items-center">
              <FaUserAlt className="mr-2 text-[#1360AB]" /> Allocated Students
            </h3>
            {room.status !== "Inactive" && room.currentOccupancy < room.capacity && (
              <button onClick={onAllocate} className="flex items-center text-sm bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">
                <FaUserPlus className="mr-2" /> Allocate Student
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Roll Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Year</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {room.students.map((student, index) => (
                      <tr key={student.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaUserAlt className="text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-xs text-gray-500 sm:hidden">{student.rollNumber}</div>
                              <div className="text-xs text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden sm:table-cell">{student.rollNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">{student.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden lg:table-cell">{student.year} Year</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button onClick={() => handleRemoveStudent(student.allocationId)} disabled={loading} className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors" title="Remove from Room">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <FaUserAlt className="mx-auto text-gray-300 text-4xl mb-3" />
              <p className="text-gray-500">No students allocated to this room</p>
              {room.capacity > 0 && (
                <button onClick={onAllocate} className="mt-4 bg-blue-50 text-[#1360AB] px-4 py-2 rounded-lg hover:bg-blue-100 inline-flex items-center transition-colors">
                  <FaUserPlus className="mr-2" /> Allocate Student
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default RoomDetailModal
