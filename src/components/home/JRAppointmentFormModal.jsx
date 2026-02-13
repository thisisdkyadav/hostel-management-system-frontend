import React, { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { useToast } from "@/components/ui"
import { jrAppointmentsApi } from "../../service"

const initialFormState = {
  visitorName: "",
  mobileNumber: "",
  email: "",
  idType: "Aadhaar",
  idNumber: "",
  reason: "",
  preferredDate: "",
  preferredTime: "",
}

const JRAppointmentFormModal = ({ isOpen, onClose }) => {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(initialFormState)

  const minimumPreferredDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 2)
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0]
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleFieldChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const requiredFields = [
      "visitorName",
      "mobileNumber",
      "email",
      "idType",
      "idNumber",
      "reason",
      "preferredDate",
      "preferredTime",
    ]

    const missingField = requiredFields.find((field) => {
      const value = formData[field]
      if (typeof value === "string") return value.trim() === ""
      return value === null || value === undefined
    })

    if (missingField) {
      toast.error("Please fill all required fields")
      return
    }

    if (formData.preferredDate < minimumPreferredDate) {
      toast.error("Preferred date must be at least day-after-tomorrow")
      return
    }

    try {
      setSubmitting(true)
      const response = await jrAppointmentsApi.submitPublicAppointment(formData)
      toast.success(response.message || "Appointment request submitted")
      setFormData(initialFormState)
      onClose()
    } catch (error) {
      toast.error(error.message || "Failed to submit appointment request")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="jrapptmodal-overlay" onClick={onClose}>
      <div className="jrapptmodal-container" onClick={(event) => event.stopPropagation()}>
        <button className="jrapptmodal-close" onClick={onClose} aria-label="Close appointment form">
          <X size={20} />
        </button>

        <div className="jrapptmodal-header">
          <h2 className="jrapptmodal-title">Appointment with JR</h2>
          <p className="jrapptmodal-subtitle">Submit your request to meet Joint Registrar.</p>
        </div>

        <form className="jrapptmodal-grid" onSubmit={handleSubmit}>
          <label className="jrapptmodal-field">
            <span>Name</span>
            <input value={formData.visitorName} onChange={handleFieldChange("visitorName")} required />
          </label>

          <label className="jrapptmodal-field">
            <span>Mobile Number</span>
            <input value={formData.mobileNumber} onChange={handleFieldChange("mobileNumber")} required />
          </label>

          <label className="jrapptmodal-field">
            <span>Email</span>
            <input type="email" value={formData.email} onChange={handleFieldChange("email")} required />
          </label>

          <label className="jrapptmodal-field">
            <span>ID Type</span>
            <select value={formData.idType} onChange={handleFieldChange("idType")} required>
              <option value="Aadhaar">Aadhaar</option>
              <option value="PAN">PAN</option>
            </select>
          </label>

          <label className="jrapptmodal-field">
            <span>ID Number</span>
            <input value={formData.idNumber} onChange={handleFieldChange("idNumber")} required />
          </label>

          <label className="jrapptmodal-field">
            <span>Preferred Date</span>
            <input
              type="date"
              min={minimumPreferredDate}
              value={formData.preferredDate}
              onChange={handleFieldChange("preferredDate")}
              required
            />
          </label>

          <label className="jrapptmodal-field">
            <span>Preferred Time</span>
            <input
              type="time"
              value={formData.preferredTime}
              onChange={handleFieldChange("preferredTime")}
              required
            />
          </label>

          <label className="jrapptmodal-field jrapptmodal-field-full">
            <span>Reason for Meeting</span>
            <textarea rows={4} value={formData.reason} onChange={handleFieldChange("reason")} required />
          </label>

          <div className="jrapptmodal-actions jrapptmodal-field-full">
            <button type="button" className="jrapptmodal-btn jrapptmodal-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="jrapptmodal-btn jrapptmodal-btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JRAppointmentFormModal
