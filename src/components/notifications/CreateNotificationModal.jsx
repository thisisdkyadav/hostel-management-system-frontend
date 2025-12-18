import React, { useState, useEffect } from "react"
import { FaExclamationTriangle, FaBell } from "react-icons/fa"
import Modal from "../common/Modal"
import { notificationApi } from "../../services/notificationApi"
import { useGlobal } from "../../contexts/GlobalProvider"
import { getDepartmentList, getDegreesList } from "../../services/studentService"

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
        const [departmentsResponse, degreesResponse] = await Promise.all([getDepartmentList(), getDegreesList()])

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
        <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {error && (
            <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start' }}>
              <FaExclamationTriangle style={{ marginTop: 'var(--spacing-0-5)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Notification Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)' }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)' }} placeholder="Enter notification title" required />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Message</label>
            <textarea name="message" value={formData.message} onChange={handleChange} rows={4} style={{ width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)' }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)' }} placeholder="Enter notification message" required />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Expiry Date</label>
            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} style={{ width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)' }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)' }} min={new Date().toISOString().split("T")[0]} required />
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Notifications will be shown to students until this date</p>
          </div>

          <div style={{ borderTop: `var(--border-1) solid var(--color-border-light)`, paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-4)' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-3)' }}>Target Recipients (Optional)</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>Leave all fields empty to target all students</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Hostel(s)</label>
                <div style={{ maxHeight: '160px', overflowY: 'auto', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', backgroundColor: 'var(--color-bg-primary)' }}>
                  {hostelList && hostelList.length > 0 ? (
                    hostelList.map((hostel) => (
                      <div key={hostel._id} style={{ display: 'flex', alignItems: 'center' }}>
                        <input type="checkbox" id={`hostel-${hostel._id}`} name="hostelIds" value={hostel._id} checked={formData.hostelIds.includes(hostel._id)} onChange={handleChange} style={{ height: 'var(--spacing-4)', width: 'var(--spacing-4)', accentColor: 'var(--color-primary)', borderColor: 'var(--input-border)', borderRadius: 'var(--radius-sm)' }} />
                        <label htmlFor={`hostel-${hostel._id}`} style={{ marginLeft: 'var(--spacing-2)', display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                          {hostel.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>No hostels available.</p>
                  )}
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Select one or more hostels</p>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Department(s)</label>
                <div style={{ maxHeight: '160px', overflowY: 'auto', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', backgroundColor: 'var(--color-bg-primary)' }}>
                  {loadingOptions ? (
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Loading departments...</p>
                  ) : availableDepartments && availableDepartments.length > 0 ? (
                    availableDepartments.map((department) => (
                      <div key={department} style={{ display: 'flex', alignItems: 'center' }}>
                        <input type="checkbox" id={`dept-${department}`} name="departments" value={department} checked={formData.departments.includes(department)} onChange={handleChange} style={{ height: 'var(--spacing-4)', width: 'var(--spacing-4)', accentColor: 'var(--color-primary)', borderColor: 'var(--input-border)', borderRadius: 'var(--radius-sm)' }} />
                        <label htmlFor={`dept-${department}`} style={{ marginLeft: 'var(--spacing-2)', display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                          {department}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>No departments available.</p>
                  )}
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Select one or more departments</p>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Degree(s)</label>
                <div style={{ maxHeight: '160px', overflowY: 'auto', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', backgroundColor: 'var(--color-bg-primary)' }}>
                  {loadingOptions ? (
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Loading degrees...</p>
                  ) : availableDegrees && availableDegrees.length > 0 ? (
                    availableDegrees.map((degree) => (
                      <div key={degree} style={{ display: 'flex', alignItems: 'center' }}>
                        <input type="checkbox" id={`degree-${degree}`} name="degrees" value={degree} checked={formData.degrees.includes(degree)} onChange={handleChange} style={{ height: 'var(--spacing-4)', width: 'var(--spacing-4)', accentColor: 'var(--color-primary)', borderColor: 'var(--input-border)', borderRadius: 'var(--radius-sm)' }} />
                        <label htmlFor={`degree-${degree}`} style={{ marginLeft: 'var(--spacing-2)', display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                          {degree}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>No degrees available.</p>
                  )}
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Select one or more degrees</p>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-colors)', backgroundColor: 'var(--color-bg-primary)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)' }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)' }}>
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 'var(--spacing-4)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-4)' }}>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  handleReset()
                }}
                style={{ padding: 'var(--button-padding-md)', color: 'var(--color-text-body)', backgroundColor: 'var(--color-bg-primary)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', cursor: 'pointer' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-primary)'}
              >
                Cancel
              </button>
              <button type="button" onClick={moveToStep2} style={{ padding: 'var(--button-padding-md)', backgroundColor: 'var(--button-primary-bg)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', border: 'none' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-primary-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--button-primary-bg)'}>
                Continue
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {error && (
            <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start' }}>
              <FaExclamationTriangle style={{ marginTop: 'var(--spacing-0-5)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <p>{error}</p>
            </div>
          )}

          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)' }}>Notification Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Title:</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{formData.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Type:</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)', textTransform: 'capitalize' }}>{formData.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Expiry:</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{new Date(formData.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)' }}>Target Recipients</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {!formData.hostelIds?.length && !formData.departments?.length && !formData.degrees?.length && !formData.gender ? (
                <p style={{ color: 'var(--color-text-body)' }}>All Students</p>
              ) : (
                <>
                  {formData.hostelIds.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Hostel(s):</span>
                      <span style={{ fontWeight: 'var(--font-weight-medium)', textAlign: 'right' }}>{getHostelNamesByIds(formData.hostelIds)}</span>
                    </div>
                  )}
                  {formData.departments.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Department(s):</span>
                      <span style={{ fontWeight: 'var(--font-weight-medium)', textAlign: 'right' }}>{formData.departments.join(", ")}</span>
                    </div>
                  )}
                  {formData.degrees.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Degree(s):</span>
                      <span style={{ fontWeight: 'var(--font-weight-medium)', textAlign: 'right' }}>{formData.degrees.join(", ")}</span>
                    </div>
                  )}
                  {formData.gender && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Gender:</span>
                      <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{formData.gender}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)' }}>Message</h3>
            <p style={{ color: 'var(--color-text-body)', whiteSpace: 'pre-line' }}>{formData.message}</p>
          </div>

          <div style={{ paddingTop: 'var(--spacing-4)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-4)' }}>
              <button type="button" onClick={() => setStep(1)} style={{ padding: 'var(--button-padding-md)', color: 'var(--color-text-body)', backgroundColor: 'var(--color-bg-primary)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-primary)'}>
                Back
              </button>
              <button type="button" onClick={handleSubmit} style={{ padding: 'var(--button-padding-md)', backgroundColor: loading ? 'var(--color-bg-disabled)' : 'var(--button-primary-bg)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', cursor: loading ? 'not-allowed' : 'pointer', border: 'none', opacity: loading ? 'var(--opacity-disabled)' : 1 }} disabled={loading} onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-hover)')} onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-bg)')}>
                {loading ? (
                  <>
                    <div style={{ width: 'var(--spacing-4)', height: 'var(--spacing-4)', marginRight: 'var(--spacing-2)', border: 'var(--border-2) solid var(--color-white)', borderTop: 'var(--border-2) solid transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaBell style={{ marginRight: 'var(--spacing-2)' }} /> Send Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default CreateNotificationModal
