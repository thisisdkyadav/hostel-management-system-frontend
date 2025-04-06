import { useState, useEffect } from "react"
import { FaSearch, FaUserPlus, FaExclamationTriangle, FaBed, FaHome, FaUserGraduate } from "react-icons/fa"
import { hostelApi } from "../../services/hostelApi"
import { useStudents } from "../../hooks/useStudents"
import Modal from "../common/Modal"

const AllocateStudentModal = ({ room, isOpen, onClose, onSuccess }) => {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [allocating, setAllocating] = useState(false)
  const [error, setError] = useState(null)
  const [availableBeds, setAvailableBeds] = useState([])
  const [selectedBed, setSelectedBed] = useState(null)

  const {
    students: unallocatedStudents,
    loading,
    filters,
    updateFilter,
    fetchWithParams,
  } = useStudents({
    autoFetch: true,
    initialFilters: {
      hasAllocation: "false",
    },
  })

  useEffect(() => {
    if (isOpen) {
      calculateAvailableBeds()
    }
  }, [isOpen, fetchWithParams])

  const calculateAvailableBeds = () => {
    if (!room || !room.capacity) return
    const allBeds = Array.from({ length: room.capacity }, (_, i) => i + 1)
    const occupiedBeds = room.students?.map((student) => student.bedNumber) || []
    const available = allBeds.filter((bed) => !occupiedBeds.includes(bed))
    setAvailableBeds(available)
    if (available.length > 0) {
      setSelectedBed(available[0])
    } else {
      setSelectedBed(null)
    }
  }

  const handleSearchChange = (e) => {
    updateFilter("searchTerm", e.target.value)
  }

  const handleStudentSelect = (student) => {
    setSelectedStudent(student)
  }

  const handleBedSelect = (bedNumber) => {
    setSelectedBed(bedNumber)
  }

  const handleAllocateStudent = async () => {
    if (!selectedStudent) {
      setError("Please select a student to allocate")
      return
    }
    if (!selectedBed) {
      setError("Please select a bed number")
      return
    }
    try {
      setAllocating(true)
      setError(null)

      const response = await hostelApi.allocateRoom({
        roomId: room.id,
        hostelId: room.hostel,
        unitId: room.unit,
        studentId: selectedStudent.id,
        userId: selectedStudent.userId,
        bedNumber: selectedBed,
      })

      if (response.success) {
        onSuccess()
      } else {
        setError(response.message || "Failed to allocate room")
      }
    } catch (err) {
      setError("An error occurred while allocating the room. Please try again.")
      console.error("Error allocating room:", err)
    } finally {
      setAllocating(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal title={`Allocate Student to Room ${room.roomNumber}`} onClose={onClose} width={650}>
      <div className="space-y-6">
        <div className="bg-blue-50 p-5 rounded-xl">
          <h3 className="font-medium text-[#1360AB] flex items-center mb-3">
            <FaHome className="mr-2" /> Room Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Room Number</p>
              <p className="font-medium">{room.roomNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Floor</p>
              <p className="font-medium">{room.floorNumber || room.floor || "Ground"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Capacity</p>
              <p className="font-medium">{room.capacity}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Currently Occupied</p>
              <p className="font-medium">
                {room.occupiedCount || room.currentOccupancy} / {room.capacity}
              </p>
            </div>
          </div>

          {(room.occupiedCount >= room.capacity || room.currentOccupancy >= room.capacity) && (
            <div className="flex items-center mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
              <FaExclamationTriangle className="mr-2 flex-shrink-0" />
              <p className="text-sm">This room is already at full capacity.</p>
            </div>
          )}
        </div>

        <div>
          <div className="relative">
            <input type="text" placeholder="Search student by name, ID or email..." value={filters.searchTerm} onChange={handleSearchChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" />
            <span className="absolute left-3 top-3 text-gray-400">
              <FaSearch />
            </span>
          </div>
        </div>

        {/* Bed Selection Section */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <FaBed className="mr-2 text-[#1360AB]" /> Select Bed Number
          </h3>
          {availableBeds.length === 0 ? (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-center">
              <FaExclamationTriangle className="mr-2 flex-shrink-0" />
              <p>No beds available in this room</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableBeds.map((bedNumber) => (
                <button
                  key={bedNumber}
                  onClick={() => handleBedSelect(bedNumber)}
                  className={`px-4 py-2 rounded-lg border flex items-center justify-center w-14 transition-colors ${selectedBed === bedNumber ? "bg-[#1360AB] text-white border-[#1360AB]" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                >
                  {bedNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-start">
            <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div>
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <FaUserGraduate className="mr-2 text-[#1360AB]" /> Unallocated Students
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1360AB] rounded-full animate-spin border-t-transparent"></div>
              </div>
            </div>
          ) : (
            <>
              {unallocatedStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No unallocated students found</div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">ID</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unallocatedStudents.map((student) => (
                        <tr key={student.id} className={`hover:bg-gray-50 transition-colors ${selectedStudent?.id === student.id ? "bg-blue-50" : ""}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">{student.fullName?.charAt(0) || "S"}</div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                                <div className="text-sm text-gray-500">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{student.studentId || student.rollNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleStudentSelect(student)} className={`px-3 py-1 rounded-md ${selectedStudent?.id === student.id ? "bg-[#1360AB] text-white" : "bg-blue-50 text-[#1360AB] hover:bg-blue-100"}`}>
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 pt-4 mt-3 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors">
            Cancel
          </button>
          <button
            onClick={handleAllocateStudent}
            disabled={!selectedStudent || !selectedBed || allocating || room.occupiedCount >= room.capacity}
            className={`flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-colors ${!selectedStudent || !selectedBed || allocating || room.occupiedCount >= room.capacity ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#1360AB] text-white hover:bg-[#0d4b86]"}`}
          >
            {allocating ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Allocating...
              </>
            ) : (
              <>
                <FaUserPlus className="mr-2" />
                Allocate Student
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default AllocateStudentModal
