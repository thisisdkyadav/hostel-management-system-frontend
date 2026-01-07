import React, { useState, useEffect } from "react"
import { Modal } from "@/components/ui"
import StudentEditForm from "./forms/StudentEditForm"
import { studentApi } from "../../../service"

const EditStudentModal = ({ isOpen, onClose, studentData, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    if (studentData) {
      setFormData(studentData)
    }
  }, [studentData])

  const handleSubmit = async (updatedData) => {
    try {
      setLoading(true)
      await studentApi.updateStudent(studentData.userId, updatedData)
      alert("Student information updated successfully")
      onUpdate()
      onClose()
    } catch (error) {
      console.error("Error updating student:", error)
      alert("Failed to update student information")
    } finally {
      setLoading(false)
    }
  }

  if (!formData) return null

  return (
    <Modal title="Edit Student" onClose={onClose} width={900}>
      <StudentEditForm initialData={formData} onSubmit={handleSubmit} onCancel={onClose} loading={loading} />
    </Modal>
  )
}

export default EditStudentModal
