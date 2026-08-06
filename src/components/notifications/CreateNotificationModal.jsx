import React, { useState, useEffect } from "react"
import { FaExclamationTriangle, FaBell, FaArrowRight, FaArrowLeft, FaTimes } from "react-icons/fa"
import { Checkbox, EmptyState, Field, Grid, Heading, HStack, InfoRow, Label, Select, Surface, Text, Textarea, VStack } from "@/components/ui"
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
            <HStack align="start" gap="none" color="danger-text" style={{ padding: "var(--spacing-4)", backgroundColor: "var(--color-danger-bg)", borderRadius: "var(--radius-lg)" }}>
              <FaExclamationTriangle style={{ marginTop: "var(--spacing-0-5)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
              <p>{error}</p>
            </HStack>
          )}

          <Field label="Notification Title" color="body" spacing={2}>
            <Input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter notification title" required />
          </Field>

          <Field label="Message" color="body" spacing={2}>
            <Textarea name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="Enter notification message" required />
          </Field>

          <Field label="Expiry Date" color="body" spacing={2}>
            <Input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} min={new Date().toISOString().split("T")[0]} required />
            <Text size="xs" color="muted" style={{ marginTop: "var(--spacing-1)" }}>Notifications will be shown to students until this date</Text>
          </Field>

          <div style={{ borderTop: `var(--border-1) solid var(--color-border-light)`, paddingTop: "var(--spacing-4)", marginTop: "var(--spacing-4)" }}>
            <Heading as="h3" size="sm" weight="medium" color="body" style={{ marginBottom: "var(--spacing-3)" }}>Target Recipients (Optional)</Heading>
            <Text size="xs" color="muted" style={{ marginBottom: "var(--spacing-4)" }}>Leave all fields empty to target all students</Text>

            <Grid min={250} gap={4}>
              <Field label="Hostel(s)" color="body" spacing={2}>
                <div style={{ maxHeight: "160px", overflowY: "auto", border: `var(--border-1) solid var(--input-border)`, borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)", backgroundColor: "var(--color-bg-primary)" }}>
                  {hostelList && hostelList.length > 0 ? (
                    hostelList.map((hostel) => <Checkbox key={hostel._id} id={`hostel-${hostel._id}`} name="hostelIds" value={hostel._id} checked={formData.hostelIds.includes(hostel._id)} onChange={handleChange} label={hostel.name} />)
                  ) : (
                    <EmptyState variant="inline" message="No hostels available." />
                  )}
                </div>
                <Text size="xs" color="muted" style={{ marginTop: "var(--spacing-1)" }}>Select one or more hostels</Text>
              </Field>

              <Field label="Department(s)" color="body" spacing={2}>
                <div style={{ maxHeight: "160px", overflowY: "auto", border: `var(--border-1) solid var(--input-border)`, borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)", backgroundColor: "var(--color-bg-primary)" }}>
                  {loadingOptions ? (
                    <Text size="sm" color="muted">Loading departments...</Text>
                  ) : availableDepartments && availableDepartments.length > 0 ? (
                    availableDepartments.map((department) => <Checkbox key={department} id={`dept-${department}`} name="departments" value={department} checked={formData.departments.includes(department)} onChange={handleChange} label={department} />)
                  ) : (
                    <EmptyState variant="inline" message="No departments available." />
                  )}
                </div>
                <Text size="xs" color="muted" style={{ marginTop: "var(--spacing-1)" }}>Select one or more departments</Text>
              </Field>

              <Field label="Degree(s)" color="body" spacing={2}>
                <div style={{ maxHeight: "160px", overflowY: "auto", border: `var(--border-1) solid var(--input-border)`, borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)", backgroundColor: "var(--color-bg-primary)" }}>
                  {loadingOptions ? (
                    <Text size="sm" color="muted">Loading degrees...</Text>
                  ) : availableDegrees && availableDegrees.length > 0 ? (
                    availableDegrees.map((degree) => <Checkbox key={degree} id={`degree-${degree}`} name="degrees" value={degree} checked={formData.degrees.includes(degree)} onChange={handleChange} label={degree} />)
                  ) : (
                    <EmptyState variant="inline" message="No degrees available." />
                  )}
                </div>
                <Text size="xs" color="muted" style={{ marginTop: "var(--spacing-1)" }}>Select one or more degrees</Text>
              </Field>

              <Field label="Gender" color="body" spacing={2}>
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
              </Field>
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
            <HStack align="start" gap="none" color="danger-text" style={{ padding: "var(--spacing-4)", backgroundColor: "var(--color-danger-bg)", borderRadius: "var(--radius-lg)" }}>
              <FaExclamationTriangle style={{ marginTop: "var(--spacing-0-5)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
              <p>{error}</p>
            </HStack>
          )}

          <Surface bg="tertiary" padding={5} radius="xl">
            <Heading as="h3" weight="medium" color="secondary" style={{ marginBottom: "var(--spacing-3)" }}>Notification Summary</Heading>
            <VStack gap={3}>
              <InfoRow label="Title:" value={formData.title} />
              <InfoRow label="Type:" value={formData.type} />
              <InfoRow label="Expiry:" value={new Date(formData.expiryDate).toLocaleDateString()} />
            </VStack>
          </Surface>

          <Surface bg="tertiary" padding={5} radius="xl">
            <Heading as="h3" weight="medium" color="secondary" style={{ marginBottom: "var(--spacing-3)" }}>Target Recipients</Heading>
            <VStack gap={2}>
              {!formData.hostelIds?.length && !formData.departments?.length && !formData.degrees?.length && !formData.gender ? (
                <Text color="body">All Students</Text>
              ) : (
                <>
                  {formData.hostelIds.length > 0 && (
                    <InfoRow label="Hostel(s):" value={getHostelNamesByIds(formData.hostelIds)} />
                  )}
                  {formData.departments.length > 0 && (
                    <InfoRow label="Department(s):" value={formData.departments.join(", ")} />
                  )}
                  {formData.degrees.length > 0 && (
                    <InfoRow label="Degree(s):" value={formData.degrees.join(", ")} />
                  )}
                  {formData.gender && (
                    <InfoRow label="Gender:" value={formData.gender} />
                  )}
                </>
              )}
            </VStack>
          </Surface>

          <Surface bg="tertiary" padding={5} radius="xl">
            <Heading as="h3" weight="medium" color="secondary" style={{ marginBottom: "var(--spacing-3)" }}>Message</Heading>
            <Text color="body" style={{ whiteSpace: "pre-line" }}>{formData.message}</Text>
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
