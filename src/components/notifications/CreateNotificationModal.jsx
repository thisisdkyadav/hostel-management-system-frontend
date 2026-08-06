import React, { useState, useEffect } from "react"
import { FaExclamationTriangle, FaBell, FaArrowRight, FaArrowLeft, FaTimes } from "react-icons/fa"
import { Checkbox, EmptyState, Grid, HStack, Select, Surface, Text, Textarea, VStack } from "@/components/ui"
import { Button, Input } from "czero/react"
import { Modal } from "@/components/ui"
import { notificationApi, studentApi } from "../../service"
import { useGlobal } from "../../contexts/GlobalProvider"

const CreateNotificationModal = ({ isOpen, onClose, onSuccess }) => {
  const { hostelList } = useGlobal()

  if (!isOpen) return null

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [availableDepartments, setAvailableDepartments] = useState([])
  const [availableDegrees, setAvailableDegrees] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "announcement",
    hostelIds: [],
    degrees: [],
    departments: [],
    gender: "",
    expiryDate: "",
  })

  useEffect(() => {
    const date = new Date()
    date.setDate(date.getDate() + 15)
    setFormData((prev) => ({
      ...prev,
      expiryDate: date.toISOString().split("T")[0],
    }))

    // Fetch departments and degrees when component mounts
    const fetchOptions = async () => {
      setLoadingOptions(true)
      try {
        const [departmentsResponse, degreesResponse] = await Promise.all([studentApi.getDepartmentList(), studentApi.getDegreesList()])

        setAvailableDepartments(departmentsResponse || [])
        setAvailableDegrees(degreesResponse || [])
      } catch (error) {
        console.error("Error fetching departments/degrees:", error)
        setError("Failed to load departments and degrees")
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  const getHostelNamesByIds = (ids) => {
    return ids
      .map((id) => {
        const hostel = hostelList.find((hostel) => hostel._id === id)
        return hostel ? hostel.name : id
      })
      .join(", ")
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "hostelIds" && type === "checkbox") {
      setFormData((prev) => {
        const currentHostelIds = prev.hostelIds || []
        if (checked) {
          return { ...prev, hostelIds: [...currentHostelIds, value] }
        } else {
          return { ...prev, hostelIds: currentHostelIds.filter((id) => id !== value) }
        }
      })
    } else if (name === "departments" && type === "checkbox") {
      setFormData((prev) => {
        const currentDepartments = prev.departments || []
        if (checked) {
          return { ...prev, departments: [...currentDepartments, value] }
        } else {
          return { ...prev, departments: currentDepartments.filter((dept) => dept !== value) }
        }
      })
    } else if (name === "degrees" && type === "checkbox") {
      setFormData((prev) => {
        const currentDegrees = prev.degrees || []
        if (checked) {
          return { ...prev, degrees: [...currentDegrees, value] }
        } else {
          return { ...prev, degrees: currentDegrees.filter((degree) => degree !== value) }
        }
      })
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Title is required")
      return false
    }

    if (!formData.message.trim()) {
      setError("Message is required")
      return false
    }

    return true
  }

  const moveToStep2 = () => {
    if (!validateForm()) return
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        expiryDate: formData.expiryDate,
      }

      if (formData.hostelIds.length > 0) payload.hostelId = formData.hostelIds
      if (formData.degrees.length > 0) payload.degree = formData.degrees
      if (formData.departments.length > 0) payload.department = formData.departments
      if (formData.gender) payload.gender = formData.gender

      const response = await notificationApi.createNotification(payload)

      if (response) {
        alert("Notification sent successfully")
        if (onSuccess) onSuccess()
        onClose()
      }
    } catch (err) {
      setError(err.message || "An error occurred while creating the notification")
      console.error("Error creating notification:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    const date = new Date()
    date.setDate(date.getDate() + 15)

    setFormData({
      title: "",
      message: "",
      type: "announcement",
      hostelIds: [],
      degrees: [],
      departments: [],
      gender: "",
      expiryDate: date.toISOString().split("T")[0],
    })
    setStep(1)
    setError(null)
  }

  return (
    <Modal
      title={step === 1 ? "Create New Notification" : "Review & Send Notification"}
      onClose={() => {
        onClose()
        handleReset()
      }}
      width={700}
    >
      {step === 1 ? (
        <form style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
          {error && (
            <div style={{ padding: "var(--spacing-4)", backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "flex-start" }}>
              <FaExclamationTriangle style={{ marginTop: "var(--spacing-0-5)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Notification Title</label>
            <Input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter notification title" required />
          </div>

          <div>
            <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Message</label>
            <Textarea name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="Enter notification message" required />
          </div>

          <div>
            <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Expiry Date</label>
            <Input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} min={new Date().toISOString().split("T")[0]} required />
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}>Notifications will be shown to students until this date</p>
          </div>

          <div style={{ borderTop: `var(--border-1) solid var(--color-border-light)`, paddingTop: "var(--spacing-4)", marginTop: "var(--spacing-4)" }}>
            <h3 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-3)" }}>Target Recipients (Optional)</h3>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginBottom: "var(--spacing-4)" }}>Leave all fields empty to target all students</p>

            <Grid min={250} gap={4}>
              <div>
                <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Hostel(s)</label>
                <div style={{ maxHeight: "160px", overflowY: "auto", border: `var(--border-1) solid var(--input-border)`, borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)", backgroundColor: "var(--color-bg-primary)" }}>
                  {hostelList && hostelList.length > 0 ? (
                    hostelList.map((hostel) => <Checkbox key={hostel._id} id={`hostel-${hostel._id}`} name="hostelIds" value={hostel._id} checked={formData.hostelIds.includes(hostel._id)} onChange={handleChange} label={hostel.name} />)
                  ) : (
                    <EmptyState variant="inline" message="No hostels available." />
                  )}
                </div>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}>Select one or more hostels</p>
              </div>

              <div>
                <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Department(s)</label>
                <div style={{ maxHeight: "160px", overflowY: "auto", border: `var(--border-1) solid var(--input-border)`, borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)", backgroundColor: "var(--color-bg-primary)" }}>
                  {loadingOptions ? (
                    <Text size="sm" color="muted">Loading departments...</Text>
                  ) : availableDepartments && availableDepartments.length > 0 ? (
                    availableDepartments.map((department) => <Checkbox key={department} id={`dept-${department}`} name="departments" value={department} checked={formData.departments.includes(department)} onChange={handleChange} label={department} />)
                  ) : (
                    <EmptyState variant="inline" message="No departments available." />
                  )}
                </div>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}>Select one or more departments</p>
              </div>

              <div>
                <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Degree(s)</label>
                <div style={{ maxHeight: "160px", overflowY: "auto", border: `var(--border-1) solid var(--input-border)`, borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)", backgroundColor: "var(--color-bg-primary)" }}>
                  {loadingOptions ? (
                    <Text size="sm" color="muted">Loading degrees...</Text>
                  ) : availableDegrees && availableDegrees.length > 0 ? (
                    availableDegrees.map((degree) => <Checkbox key={degree} id={`degree-${degree}`} name="degrees" value={degree} checked={formData.degrees.includes(degree)} onChange={handleChange} label={degree} />)
                  ) : (
                    <EmptyState variant="inline" message="No degrees available." />
                  )}
                </div>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}>Select one or more degrees</p>
              </div>

              <div>
                <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Gender</label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "All Genders" },
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              </div>
            </Grid>
          </div>

          <div style={{ paddingTop: "var(--spacing-4)", borderTop: `var(--border-1) solid var(--color-border-light)` }}>
            <HStack gap={4} justify="end">
              <Button
                type="button"
                onClick={() => {
                  onClose()
                  handleReset()
                }}
                variant="secondary"
                size="md"
              >
                <FaTimes /> Cancel
              </Button>
              <Button type="button" onClick={moveToStep2} variant="primary" size="md">
                <FaArrowRight /> Continue
              </Button>
            </HStack>
          </div>
        </form>
      ) : (
        <VStack gap={6}>
          {error && (
            <div style={{ padding: "var(--spacing-4)", backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "flex-start" }}>
              <FaExclamationTriangle style={{ marginTop: "var(--spacing-0-5)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
              <p>{error}</p>
            </div>
          )}

          <Surface bg="tertiary" padding={5} radius="xl">
            <h3 style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-3)" }}>Notification Summary</h3>
            <VStack gap={3}>
              <HStack gap="none" justify="between">
                <Text as="span" color="muted">Title:</Text>
                <Text as="span" weight="medium">{formData.title}</Text>
              </HStack>
              <HStack gap="none" justify="between">
                <Text as="span" color="muted">Type:</Text>
                <span style={{ fontWeight: "var(--font-weight-medium)", textTransform: "capitalize" }}>{formData.type}</span>
              </HStack>
              <HStack gap="none" justify="between">
                <Text as="span" color="muted">Expiry:</Text>
                <Text as="span" weight="medium">{new Date(formData.expiryDate).toLocaleDateString()}</Text>
              </HStack>
            </VStack>
          </Surface>

          <Surface bg="tertiary" padding={5} radius="xl">
            <h3 style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-3)" }}>Target Recipients</h3>
            <VStack gap={2}>
              {!formData.hostelIds?.length && !formData.departments?.length && !formData.degrees?.length && !formData.gender ? (
                <Text color="body">All Students</Text>
              ) : (
                <>
                  {formData.hostelIds.length > 0 && (
                    <HStack gap="none" justify="between">
                      <Text as="span" color="muted">Hostel(s):</Text>
                      <Text as="span" weight="medium" align="right">{getHostelNamesByIds(formData.hostelIds)}</Text>
                    </HStack>
                  )}
                  {formData.departments.length > 0 && (
                    <HStack gap="none" justify="between">
                      <Text as="span" color="muted">Department(s):</Text>
                      <Text as="span" weight="medium" align="right">{formData.departments.join(", ")}</Text>
                    </HStack>
                  )}
                  {formData.degrees.length > 0 && (
                    <HStack gap="none" justify="between">
                      <Text as="span" color="muted">Degree(s):</Text>
                      <Text as="span" weight="medium" align="right">{formData.degrees.join(", ")}</Text>
                    </HStack>
                  )}
                  {formData.gender && (
                    <HStack gap="none" justify="between">
                      <Text as="span" color="muted">Gender:</Text>
                      <Text as="span" weight="medium">{formData.gender}</Text>
                    </HStack>
                  )}
                </>
              )}
            </VStack>
          </Surface>

          <Surface bg="tertiary" padding={5} radius="xl">
            <h3 style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-3)" }}>Message</h3>
            <p style={{ color: "var(--color-text-body)", whiteSpace: "pre-line" }}>{formData.message}</p>
          </Surface>

          <div style={{ paddingTop: "var(--spacing-4)", borderTop: `var(--border-1) solid var(--color-border-light)` }}>
            <HStack gap={4} justify="end">
              <Button type="button" onClick={() => setStep(1)} variant="secondary" size="md">
                <FaArrowLeft /> Back
              </Button>
              <Button type="button" onClick={handleSubmit} variant="primary" size="md" loading={loading} disabled={loading}>
                <FaBell /> {loading ? "Sending..." : "Send Notification"}
              </Button>
            </HStack>
          </div>
        </VStack>
      )}
    </Modal>
  )
}

export default CreateNotificationModal
