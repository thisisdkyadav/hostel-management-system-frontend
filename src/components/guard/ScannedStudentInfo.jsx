import React, { useState } from "react"
import { FaUser, FaIdCard, FaEnvelope, FaPhone, FaVenusMars, FaBuilding, FaCalendarAlt, FaClock, FaSignInAlt, FaSignOutAlt, FaTimes, FaExclamationTriangle } from "react-icons/fa"
import { getMediaUrl } from "../../utils/mediaUtils"
import { Button } from "@/components/ui"

const ScannedStudentInfo = ({ student, lastCheckInOut, onReset, onRecordEntry, recordingEntry, getNextStatus }) => {
  const [crossHostelReason, setCrossHostelReason] = useState("")

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', padding: 'var(--spacing-6)' }}>
      <div style={{ backgroundColor: 'var(--color-success-bg-light)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', borderLeft: `var(--border-4) solid var(--color-success)`, marginBottom: 'var(--spacing-6)' }}>
        <p style={{ color: 'var(--color-success-text)', fontWeight: 'var(--font-weight-medium)' }}>Student verified successfully!</p>
      </div>

      {/* Cross-Hostel Alert */}
      {student.isSameHostel === false && (
        <div style={{ backgroundColor: 'var(--color-warning-bg-light)', border: `var(--border-2) solid var(--color-warning)`, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0 }}>
              <FaExclamationTriangle style={{ height: 'var(--icon-xl)', width: 'var(--icon-xl)', color: 'var(--color-warning)', marginTop: 'var(--spacing-0-5)' }} />
            </div>
            <div style={{ marginLeft: 'var(--spacing-3)', flex: 1 }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-warning-text)', marginBottom: 'var(--spacing-2)' }}>Cross-Hostel Entry Alert</h3>
              <p style={{ color: 'var(--color-warning-text)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-3)' }}>This student belongs to a different hostel. Please provide a reason for allowing entry.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                <label htmlFor="crossHostelReason" style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-warning-text)' }}>
                  Reason for Cross-Hostel Entry <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <textarea id="crossHostelReason" value={crossHostelReason} onChange={(e) => setCrossHostelReason(e.target.value)}
                  placeholder="Enter reason for allowing this cross-hostel entry..."
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-3)',
                    border: `var(--border-1) solid var(--color-warning)`,
                    borderRadius: 'var(--radius-input)',
                    boxShadow: 'var(--shadow-sm)',
                    outline: 'none',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-focus)'
                    e.currentTarget.style.borderColor = 'var(--color-warning)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                    e.currentTarget.style.borderColor = 'var(--color-warning)'
                  }}
                  rows="3"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {/* Profile Image Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          <div style={{ width: '100%', maxWidth: '250px', margin: '0 auto' }}>
            <div style={{ aspectRatio: '1', width: '100%', borderRadius: 'var(--radius-full)', overflow: 'hidden', backgroundColor: 'var(--color-bg-hover)' }}>
              {student.profileImage ? (
                <img src={getMediaUrl(student.profileImage)} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-info-bg-light)' }}>
                  <FaUser style={{ color: 'var(--color-primary)', width: '33%', height: '33%' }} />
                </div>
              )}
            </div>
          </div>

          {/* Student Details Section */}
          <div>
            <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'center' }}>
              <FaUser style={{ marginRight: 'var(--spacing-3)', color: 'var(--color-primary)' }} />
              {student.name}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                <FaIdCard style={{ color: 'var(--color-primary)', width: 'var(--icon-lg)', marginTop: 'var(--spacing-1)' }} />
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Roll Number</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{student.rollNumber}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                <FaEnvelope style={{ color: 'var(--color-primary)', width: 'var(--icon-lg)', marginTop: 'var(--spacing-1)' }} />
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Email</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', wordBreak: 'break-all' }}>{student.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                <FaPhone style={{ color: 'var(--color-primary)', width: 'var(--icon-lg)', marginTop: 'var(--spacing-1)' }} />
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Phone</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{student.phone || "N/A"}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                <FaVenusMars style={{ color: 'var(--color-primary)', width: 'var(--icon-lg)', marginTop: 'var(--spacing-1)' }} />
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Gender</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>{student.gender || "N/A"}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                <FaBuilding style={{ color: 'var(--color-primary)', width: 'var(--icon-lg)', marginTop: 'var(--spacing-1)' }} />
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Hostel & Room</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                    {student.hostel}, Room {student.displayRoom}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Check In/Out Section */}
            {lastCheckInOut && (
              <div style={{ marginTop: 'var(--spacing-6)', padding: 'var(--spacing-4)', backgroundColor: 'var(--color-info-bg-light)', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-3)' }}>Last {lastCheckInOut.status}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FaCalendarAlt style={{ color: 'var(--color-primary)', marginRight: 'var(--spacing-2)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)' }}>{formatDate(lastCheckInOut.dateAndTime)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FaClock style={{ color: 'var(--color-primary)', marginRight: 'var(--spacing-2)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)' }}>{formatTime(lastCheckInOut.dateAndTime)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {lastCheckInOut.status === "Checked In" ? (
                      <FaSignInAlt style={{ color: 'var(--color-success)', marginRight: 'var(--spacing-2)' }} />
                    ) : (
                      <FaSignOutAlt style={{ color: 'var(--color-warning)', marginRight: 'var(--spacing-2)' }} />
                    )}
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{lastCheckInOut.status}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', gap: 'var(--spacing-4)' }}>
              <Button onClick={onReset} variant="secondary" size="medium" icon={<FaTimes />} fullWidth>
                Reset
              </Button>

              <Button onClick={() => onRecordEntry(student.isSameHostel === false ? crossHostelReason.trim() : null)}
                disabled={recordingEntry || (student.isSameHostel === false && !crossHostelReason.trim())}
                variant="primary" size="medium"
                icon={getNextStatus() === "Checked In" ? <FaSignInAlt /> : <FaSignOutAlt />}
                fullWidth
              >
                {getNextStatus() === "Checked In" ? "Check In" : "Check Out"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScannedStudentInfo
