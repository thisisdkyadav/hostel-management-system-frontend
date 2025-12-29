import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../services/inventoryApi"
import { FaBoxes, FaUserGraduate, FaPlus } from "react-icons/fa"
import Modal from "../../common/Modal"
import { useAuth } from "../../../contexts/AuthProvider"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import Select from "../../common/ui/Select"
import Textarea from "../../common/ui/Textarea"

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
          <h3 style={{ fontSize: 'var(--text-heading-3)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>Assign Inventory to Students</h3>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>Select a student to assign inventory items</p>
        </div>
      </div>

      {error && <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}>{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center" style={{ paddingTop: 'var(--spacing-12)', paddingBottom: 'var(--spacing-12)' }}>
          <div className="animate-spin" style={{ width: 'var(--icon-3xl)', height: 'var(--icon-3xl)', border: 'var(--border-4) solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: 'var(--radius-full)' }}></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--gap-md)' }}>
          {students.map((student) => (
            <div key={student._id} className="flex items-center cursor-pointer" style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', border: `var(--border-1) solid var(--color-border-primary)`, transition: 'var(--transition-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'} onClick={() => handleSelectStudent(student)}>
              <div className="flex items-center justify-center" style={{ width: 'var(--avatar-lg)', height: 'var(--avatar-lg)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', marginRight: 'var(--spacing-4)' }}>
                <FaUserGraduate style={{ color: 'var(--color-primary)', fontSize: 'var(--icon-lg)' }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>{student.userId.name}</h4>
                <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>{student.rollNumber}</p>
              </div>
              <div className="ml-auto">
                <Button onClick={() => handleSelectStudent(student)} variant="ghost" size="small" icon={<FaPlus />} aria-label="Assign inventory" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {showModal && selectedStudent && (
        <Modal title={`Assign Inventory to ${selectedStudent.userId.name}`} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label className="block" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Item</label>
              <Select name="hostelInventoryId" value={assignFormData.hostelInventoryId} onChange={handleAssignFormChange} options={[
                { value: "", label: "Select Item" },
                ...hostelInventory.map((item) => ({
                  value: item._id,
                  label: `${item.itemTypeId.name} - Available: ${item.availableCount}`
                }))
              ]} required />
            </div>

            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label className="block" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Count</label>
              <Input type="number" name="count" value={assignFormData.count} onChange={handleAssignFormChange} min="1" max={getMaxCount()} required />
              {assignFormData.hostelInventoryId && <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Maximum available: {getMaxCount()}</p>}
            </div>

            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label className="block" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Condition</label>
              <Select name="condition" value={assignFormData.condition} onChange={handleAssignFormChange} options={[
                { value: "Good", label: "Good" },
                { value: "Fair", label: "Fair" },
                { value: "Poor", label: "Poor" }
              ]} required />
            </div>

            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label className="block" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Notes</label>
              <Textarea name="notes" value={assignFormData.notes} onChange={handleAssignFormChange} rows={3} placeholder="Any additional notes..." />
            </div>

            <div className="flex justify-end" style={{ gap: 'var(--gap-sm)', paddingTop: 'var(--spacing-2)' }}>
              <Button type="button" onClick={closeModal} variant="secondary" size="medium">
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !assignFormData.hostelInventoryId} variant="primary" size="medium" isLoading={loading}>
                {loading ? "Assigning..." : "Assign Item"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default InventoryManagement
