import { useState, useEffect } from "react"
import { FaSearch, FaUserPlus, FaTimes, FaExclamationTriangle, FaBed } from "react-icons/fa"
import { hostelApi } from "../../services/apiService"
import { useStudents } from "../../hooks/useStudents"

const AllocateStudentModal = ({ room, isOpen, onClose, onSuccess }) => {
  console.log(room)

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
        studentId: selectedStudent.id,
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Allocate Student to Room {room.roomNumber}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Room Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Room Number:</p>
              <p className="font-medium">{room.roomNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Floor:</p>
              <p className="font-medium">{room.floorNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Capacity:</p>
              <p className="font-medium">{room.capacity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Currently Occupied:</p>
              <p className="font-medium">
                {room.occupiedCount} / {room.capacity}
              </p>
            </div>
          </div>

          {room.occupiedCount >= room.capacity && (
            <div className="flex items-center mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
              <FaExclamationTriangle className="mr-2" />
              <p>This room is already at full capacity.</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="relative">
            <input type="text" placeholder="Search student by name, ID or email..." value={filters.searchTerm} onChange={handleSearchChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <span className="absolute left-3 top-3 text-gray-400">
              <FaSearch />
            </span>
          </div>
        </div>

        {/* Bed Selection Section */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
            <FaBed className="mr-2" /> Select Bed Number
          </h3>
          {availableBeds.length === 0 ? (
            <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md">No beds available in this room</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableBeds.map((bedNumber) => (
                <button
                  key={bedNumber}
                  onClick={() => handleBedSelect(bedNumber)}
                  className={`px-4 py-2 rounded-md border flex items-center justify-center w-16 transition-colors ${selectedBed === bedNumber ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                >
                  {bedNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1360AB]"></div>
          </div>
        ) : (
          <>
            {unallocatedStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No unallocated students found</div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unallocatedStudents.map((student) => (
                      <tr key={student.id} className={`hover:bg-gray-50 ${selectedStudent?.id === student.id ? "bg-blue-50" : ""}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">{student.fullName?.charAt(0) || "S"}</div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentId || student.rollNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleStudentSelect(student)} className={`px-3 py-1 rounded-md ${selectedStudent?.id === student.id ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}>
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

        <div className="mt-8 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium transition-colors">
            Cancel
          </button>
          <button
            onClick={handleAllocateStudent}
            disabled={!selectedStudent || !selectedBed || allocating || room.occupiedCount >= room.capacity}
            className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${!selectedStudent || !selectedBed || allocating || room.occupiedCount >= room.capacity ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#1360AB] text-white hover:bg-blue-700"}`}
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
    </div>
  )
}

export default AllocateStudentModal
