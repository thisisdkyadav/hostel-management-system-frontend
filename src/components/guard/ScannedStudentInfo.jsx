import React, { useState } from "react"
import { FaUser, FaIdCard, FaEnvelope, FaPhone, FaVenusMars, FaBuilding, FaCalendarAlt, FaClock, FaSignInAlt, FaSignOutAlt, FaTimes, FaExclamationTriangle } from "react-icons/fa"
import { getMediaUrl } from "../../utils/mediaUtils"
import { Button, Grid, Heading, HStack, Label, Surface, Text, VStack } from "hzero"

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
    <Surface bg="primary" padding={6} radius="xl" shadow="md">
      <Surface bg="var(--color-success-bg-light)" padding={3} radius="lg" style={{ borderLeft: `var(--border-4) solid var(--color-success)`, marginBottom: 'var(--spacing-6)' }}>
        <Text color="success-text" weight="medium">Student verified successfully!</Text>
      </Surface>

      {/* Cross-Hostel Alert */}
      {student.isSameHostel === false && (
        <Surface bg="var(--color-warning-bg-light)" padding={4} radius="lg" border="var(--border-2) solid var(--color-warning)" style={{ marginBottom: 'var(--spacing-6)' }}>
          <HStack gap="none" align="start">
            <div style={{ flexShrink: 0 }}>
              <FaExclamationTriangle style={{ height: 'var(--icon-xl)', width: 'var(--icon-xl)', marginTop: 'var(--spacing-0-5)' }} color="var(--color-warning)" />
            </div>
            <div style={{ marginLeft: 'var(--spacing-3)', flex: 1 }}>
              <Heading as="h3" size="lg" weight="semibold" color="warning-text" style={{ marginBottom: 'var(--spacing-2)' }}>Cross-Hostel Entry Alert</Heading>
              <Text color="warning-text" size="sm" style={{ marginBottom: 'var(--spacing-3)' }}>This student belongs to a different hostel. Please provide a reason for allowing entry.</Text>
              <VStack gap={2}>
                <Label color="warning-text" spacing="0" htmlFor="crossHostelReason">
                  Reason for Cross-Hostel Entry <Text as="span" color="danger">*</Text>
                </Label>
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
              </VStack>
            </div>
          </HStack>
        </Surface>
      )}

      <VStack gap={6}>
        {/* Profile Image Section */}
        <VStack gap={6}>
          <div style={{ width: '100%', maxWidth: '250px', margin: '0 auto' }}>
            <div style={{ aspectRatio: '1', width: '100%', borderRadius: 'var(--radius-full)', overflow: 'hidden', backgroundColor: 'var(--color-bg-hover)' }}>
              {student.profileImage ? (
                <img src={getMediaUrl(student.profileImage)} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-info-bg-light)' }}>
                  <FaUser style={{ width: '33%', height: '33%' }} color="var(--color-primary)" />
                </div>
              )}
            </div>
          </div>

          {/* Student Details Section */}
          <div>
            <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'center' }}>
              <FaUser style={{ marginRight: 'var(--spacing-3)' }} color="var(--color-primary)" />
              {student.name}
            </h3>

            <Grid min={200} gap={4}>
              <HStack gap={3} align="start">
                <FaIdCard style={{ width: 'var(--icon-lg)', marginTop: 'var(--spacing-1)' }} color="var(--color-primary)" />
                <div>
                  <Text size="xs" color="muted">Roll Number</Text>
                  <Text size="sm" weight="medium" color="primary">{student.rollNumber}</Text>
                </div>
              </HStack>

              <HStack gap={3} align="start">
                <FaEnvelope style={{ width: 'var(--icon-lg)', marginTop: 'var(--spacing-1)' }} color="var(--color-primary)" />
                <div>
                  <Text size="xs" color="muted">Email</Text>
                  <Text size="sm" weight="medium" color="primary" style={{ wordBreak: 'break-all' }}>{student.email}</Text>
                </div>
              </HStack>

              <HStack gap={3} align="start">
                <FaPhone style={{ width: 'var(--icon-lg)', marginTop: 'var(--spacing-1)' }} color="var(--color-primary)" />
                <div>
                  <Text size="xs" color="muted">Phone</Text>
                  <Text size="sm" weight="medium" color="primary">{student.phone || "N/A"}</Text>
                </div>
              </HStack>

              <HStack gap={3} align="start">
                <FaVenusMars style={{ width: 'var(--icon-lg)', marginTop: 'var(--spacing-1)' }} color="var(--color-primary)" />
                <div>
                  <Text size="xs" color="muted">Gender</Text>
                  <Text size="sm" weight="medium" color="primary" style={{ textTransform: 'capitalize' }}>{student.gender || "N/A"}</Text>
                </div>
              </HStack>

              <HStack gap={3} align="start">
                <FaBuilding style={{ width: 'var(--icon-lg)', marginTop: 'var(--spacing-1)' }} color="var(--color-primary)" />
                <div>
                  <Text size="xs" color="muted">Hostel & Room</Text>
                  <Text size="sm" weight="medium" color="primary">
                    {student.hostel}, Room {student.displayRoom}
                  </Text>
                </div>
              </HStack>
            </Grid>

            {/* Last Check In/Out Section */}
            {lastCheckInOut && (
              <Surface bg="var(--color-info-bg-light)" padding={4} radius="lg" style={{ marginTop: 'var(--spacing-6)' }}>
                <Heading as="h4" weight="medium" color="body" style={{ marginBottom: 'var(--spacing-3)' }}>Last {lastCheckInOut.status}</Heading>
                <HStack gap={4} wrap>
                  <HStack gap="none" align="center">
                    <FaCalendarAlt style={{ marginRight: 'var(--spacing-2)' }} color="var(--color-primary)" />
                    <Text as="span" size="sm">{formatDate(lastCheckInOut.dateAndTime)}</Text>
                  </HStack>
                  <HStack gap="none" align="center">
                    <FaClock style={{ marginRight: 'var(--spacing-2)' }} color="var(--color-primary)" />
                    <Text as="span" size="sm">{formatTime(lastCheckInOut.dateAndTime)}</Text>
                  </HStack>
                  <HStack gap="none" align="center">
                    {lastCheckInOut.status === "Checked In" ? (
                      <FaSignInAlt style={{ marginRight: 'var(--spacing-2)' }} color="var(--color-success)" />
                    ) : (
                      <FaSignOutAlt style={{ marginRight: 'var(--spacing-2)' }} color="var(--color-warning)" />
                    )}
                    <Text as="span" size="sm" weight="medium">{lastCheckInOut.status}</Text>
                  </HStack>
                </HStack>
              </Surface>
            )}

            {/* Action Buttons */}
            <HStack gap={4} style={{ marginTop: 'var(--spacing-6)' }}>
              <Button onClick={onReset} variant="secondary" size="md" fullWidth>
                <FaTimes /> Reset
              </Button>

              <Button onClick={() => onRecordEntry(student.isSameHostel === false ? crossHostelReason.trim() : null)}
                disabled={recordingEntry || (student.isSameHostel === false && !crossHostelReason.trim())}
                variant="primary" size="md"
                fullWidth
              >
                {getNextStatus() === "Checked In" ? <FaSignInAlt /> : <FaSignOutAlt />} {getNextStatus() === "Checked In" ? "Check In" : "Check Out"}
              </Button>
            </HStack>
          </div>
        </VStack>
      </VStack>
    </Surface>
  )
}

export default ScannedStudentInfo
