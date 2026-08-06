import React, { useState, useRef, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { FaQrcode, FaTimes, FaUser } from "react-icons/fa"
import { securityApi } from "../../service"
import { Button } from "czero/react"
import { Heading, HStack, Spinner, Surface, Text } from "@/components/ui"

const AttendanceQRScanner = ({ onRefresh }) => {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  const [scannedPerson, setScannedPerson] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recordingAttendance, setRecordingAttendance] = useState(false)
  const [success, setSuccess] = useState(null)
  const scannerRef = useRef(null)
  const lastProcessedEmailRef = useRef(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch((err) => console.error("Error stopping scanner:", err))
      }
    }
  }, [])

  const startScanner = () => {
    setScanning(true)
    setError("")
    setScannedPerson(null)
    setSuccess(null)
    lastProcessedEmailRef.current = null

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    }

    scannerRef.current = new Html5Qrcode("qr-reader")

    scannerRef.current.start({ facingMode: "environment" }, config, onScanSuccess, handleScanError).catch((err) => {
      setError("Failed to start camera: " + err.message)
      setScanning(false)
    })
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          setScanning(false)
        })
        .catch((err) => {
          console.error("Error stopping scanner:", err)
          setScanning(false)
        })
    }
  }

  const onScanSuccess = async (decodedText) => {
    try {
      // Prevent duplicate processing of the same QR code
      if (lastProcessedEmailRef.current === decodedText) {
        return
      }

      lastProcessedEmailRef.current = decodedText
      setLoading(true)
      stopScanner()

      // Parse the QR data
      const qrData = JSON.parse(decodedText)

      // Verify the QR code with the backend
      const response = await securityApi.verifyQRCode(qrData)

      if (response.success) {
        setScannedPerson({
          ...response.staffInfo,
          type: response.staffInfo.staffType,
          latestAttendance: response.latestAttendance,
        })
        setError("")
      } else {
        setError(response.message || "Invalid QR code")
        setScannedPerson(null)
      }
    } catch (error) {
      console.error("Error processing QR code:", error)
      setError("Failed to process QR code. Please try again.")
      setScannedPerson(null)
    } finally {
      setLoading(false)
    }
  }

  const handleScanError = (err) => {
    // We don't need to show QR scan errors to the user
    console.error("QR scan error:", err)
  }

  const handleReset = () => {
    setScannedPerson(null)
    setError("")
    setSuccess(null)
    lastProcessedEmailRef.current = null
  }

  const recordAttendance = async () => {
    if (!scannedPerson) return

    try {
      setRecordingAttendance(true)
      setError("")

      // Determine check-in or check-out based on latest attendance
      const attendanceType = scannedPerson.latestAttendance?.type === "checkIn" ? "checkOut" : "checkIn"

      // Prepare attendance data
      const attendanceData = {
        email: scannedPerson.email,
        type: attendanceType,
      }

      // Add hostelId for maintenance staff if needed
      if (scannedPerson.type === "maintenance" && scannedPerson.hostelId) {
        attendanceData.hostelId = scannedPerson.hostelId
      }

      // Call the API for recording attendance
      const response = await securityApi.recordStaffAttendance(attendanceData)

      if (response.success) {
        setSuccess(`${attendanceType === "checkIn" ? "Check-in" : "Check-out"} recorded successfully for ${scannedPerson.name}`)
        onRefresh && onRefresh()

        // Clear the person after a delay to show success message
        setTimeout(() => {
          handleReset()
        }, 3000)
      } else {
        setError(response.message || "Failed to record attendance")
      }
    } catch (error) {
      console.error("Attendance recording error:", error)
      setError("Failed to record attendance: " + error.message)
    } finally {
      setRecordingAttendance(false)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)', boxShadow: 'var(--shadow-sm)', border: `var(--border-1) solid var(--color-border-light)`, transition: 'var(--transition-all)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
      <HStack gap="none" align="center" style={{ marginBottom: 'var(--spacing-4)' }}>
        <div style={{ padding: 'var(--spacing-2-5)', marginRight: 'var(--spacing-3)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
          <FaQrcode size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-lg'))} />
        </div>
        <Heading as="h2" size="xl" weight="bold" color="secondary">Scan Staff Attendance QR Code</Heading>
      </HStack>

      {error && (
        <Surface bg="var(--color-danger-bg-light)" color="danger-text" padding={3} radius="lg" accent="danger" style={{ marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'flex-start' }}>
          <FaTimes style={{ marginRight: 'var(--spacing-2)', marginTop: 'var(--spacing-0-5)', flexShrink: 0 }} />
          <Text size="sm">{error}</Text>
        </Surface>
      )}

      {success && (
        <Surface bg="var(--color-success-bg-light)" color="success-text" padding={3} radius="lg" accent="success" style={{ marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'flex-start' }}>
          <FaUser style={{ marginRight: 'var(--spacing-2)', marginTop: 'var(--spacing-0-5)', flexShrink: 0 }} />
          <Text size="sm">{success}</Text>
        </Surface>
      )}

      {!scanning && !scannedPerson && !loading && (
        <Button onClick={startScanner} variant="primary" size="md" fullWidth>
          <FaQrcode /> Start QR Scanner
        </Button>
      )}

      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <div id="qr-reader" style={{ width: '100%', maxWidth: 'var(--container-sm)', margin: '0 auto', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}></div>
        {scanning && (
          <Button onClick={stopScanner} variant="danger" size="md" fullWidth>
            <FaTimes /> Stop Scanner
          </Button>
        )}
      </div>

      {loading && (
        <Surface padding="var(--spacing-8) 0" align="center">
          <Spinner size="var(--spacing-12)" thickness="thick" style={{ margin: '0 auto var(--spacing-4)' }} />
          <Text color="muted">Processing QR code...</Text>
        </Surface>
      )}

      {scannedPerson && !loading && (
        <Surface bg="tertiary" padding={4} radius="lg" border="var(--border-1) solid var(--color-border-primary)" style={{ marginTop: 'var(--spacing-4)' }}>
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <Heading as="h3" weight="semibold" size="lg" color="secondary" style={{ marginBottom: 'var(--spacing-1)' }}>{scannedPerson.name}</Heading>
            <Text color="muted" size="sm">{scannedPerson.email}</Text>
            <Surface bg="info" padding="var(--spacing-1) var(--spacing-2)" radius="full" color="info-text" size="xs" weight="medium" style={{ marginTop: 'var(--spacing-2)', display: 'inline-block' }}>{scannedPerson.type === "security" ? "Security Guard" : "Maintenance Staff"}</Surface>
          </div>

          <HStack gap={2} style={{ marginTop: 'var(--spacing-4)' }}>
            <Button onClick={recordAttendance} disabled={recordingAttendance} variant="success" size="md" loading={recordingAttendance} fullWidth>
              <FaUser /> Record Attendance
            </Button>
            <Button onClick={handleReset} variant="secondary" size="md">
              Cancel
            </Button>
          </HStack>
        </Surface>
      )}
    </div>
  )
}

export default AttendanceQRScanner
