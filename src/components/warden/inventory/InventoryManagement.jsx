import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../services/inventoryApi"
import { FaBoxes, FaUserGraduate, FaPlus } from "react-icons/fa"
import Modal from "../../common/Modal"
import { useAuth } from "../../../contexts/AuthProvider"

const InventoryManagement = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hostelInventory, setHostelInventory] = useState([])
  const [students, setStudents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [assignFormData, setAssignFormData] = useState({
    studentProfileId: "",
    hostelInventoryId: "",
    itemTypeId: "",
    count: 1,
    condition: "Good",
    notes: "",
  })

  // Fetch hostel inventory
  const fetchHostelInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.getAllHostelInventory({
        limit: 100, // Get all available inventory
      })
      // Filter to only show items with available count > 0
      setHostelInventory(response.data.filter((item) => item.availableCount > 0))
    } catch (err) {
      setError(err.message || "Failed to fetch hostel inventory")
    } finally {
      setLoading(false)
    }
  }

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true)
    setError(null)
    try {
      // This would be replaced with your actual students API call
      // For now, we'll use a placeholder
      const response = await fetch("/api/students?hostelId=" + user.hostel._id)
      const data = await response.json()
      setStudents(data)
    } catch (err) {
      setError(err.message || "Failed to fetch students")
      // For development, let's provide some sample data
      setStudents([
        { _id: "1", rollNumber: "B19CS001", userId: { name: "John Doe" } },
        { _id: "2", rollNumber: "B19CS002", userId: { name: "Jane Smith" } },
        { _id: "3", rollNumber: "B19CS003", userId: { name: "Alice Johnson" } },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostelInventory()
    fetchStudents()
  }, [])

  // Handle student selection
  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    setAssignFormData((prev) => ({
      ...prev,
      studentProfileId: student._id,
    }))
    setShowModal(true)
  }

  // Handle form change
  const handleAssignFormChange = (e) => {
    const { name, value } = e.target

    if (name === "hostelInventoryId") {
      const selectedInventory = hostelInventory.find((item) => item._id === value)
      if (selectedInventory) {
        setAssignFormData((prev) => ({
          ...prev,
          [name]: value,
          itemTypeId: selectedInventory.itemTypeId._id,
        }))
      }
    } else {
      setAssignFormData((prev) => ({
        ...prev,
        [name]: name === "count" ? Math.max(1, parseInt(value) || 1) : value,
      }))
    }
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    setSelectedStudent(null)
    setAssignFormData({
      studentProfileId: "",
      hostelInventoryId: "",
      itemTypeId: "",
      count: 1,
      condition: "Good",
      notes: "",
    })
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await inventoryApi.assignInventoryToStudent(assignFormData)
      fetchHostelInventory() // Refresh inventory after assignment
      closeModal()
    } catch (err) {
      setError(err.message || "Failed to assign inventory to student")
    } finally {
      setLoading(false)
    }
  }

  // Get max count for selected inventory
  const getMaxCount = () => {
    if (!assignFormData.hostelInventoryId) return 1
    const selectedInventory = hostelInventory.find((item) => item._id === assignFormData.hostelInventoryId)
    return selectedInventory ? selectedInventory.availableCount : 1
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Assign Inventory to Students</h3>
          <p className="text-sm text-gray-500">Select a student to assign inventory items</p>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-[#1360AB] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <div key={student._id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow flex items-center cursor-pointer" onClick={() => handleSelectStudent(student)}>
              <div className="w-12 h-12 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-4">
                <FaUserGraduate className="text-[#1360AB] text-xl" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{student.userId.name}</h4>
                <p className="text-sm text-gray-500">{student.rollNumber}</p>
              </div>
              <div className="ml-auto">
                <button className="w-8 h-8 rounded-full bg-[#E4F1FF] flex items-center justify-center text-[#1360AB]">
                  <FaPlus />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {showModal && selectedStudent && (
        <Modal title={`Assign Inventory to ${selectedStudent.userId.name}`} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
              <select name="hostelInventoryId" value={assignFormData.hostelInventoryId} onChange={handleAssignFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" required>
                <option value="">Select Item</option>
                {hostelInventory.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.itemTypeId.name} - Available: {item.availableCount}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
              <input type="number" name="count" value={assignFormData.count} onChange={handleAssignFormChange} min="1" max={getMaxCount()} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" required />
              {assignFormData.hostelInventoryId && <p className="text-xs text-gray-500 mt-1">Maximum available: {getMaxCount()}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select name="condition" value={assignFormData.condition} onChange={handleAssignFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" required>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea name="notes" value={assignFormData.notes} onChange={handleAssignFormChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" placeholder="Any additional notes..."></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button type="submit" disabled={loading || !assignFormData.hostelInventoryId} className="px-4 py-2 bg-[#1360AB] text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Assign Item"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default InventoryManagement
