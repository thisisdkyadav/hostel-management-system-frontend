import React, { useState, useRef, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { FaQrcode, FaTimes, FaUser } from "react-icons/fa"
import { securityApi } from "../../service"
import Button from "../common/Button"

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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
        <div style={{ padding: 'var(--spacing-2-5)', marginRight: 'var(--spacing-3)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
          <FaQrcode size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-lg'))} />
        </div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)' }}>Scan Staff Attendance QR Code</h2>
      </div>

      {error && (
        <div style={{ marginBottom: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg-light)', color: 'var(--color-danger-text)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', borderLeft: `var(--border-4) solid var(--color-danger)`, display: 'flex', alignItems: 'flex-start' }}>
          <FaTimes style={{ marginRight: 'var(--spacing-2)', marginTop: 'var(--spacing-0-5)', flexShrink: 0 }} />
          <p style={{ fontSize: 'var(--font-size-sm)' }}>{error}</p>
        </div>
      )}

      {success && (
        <div style={{ marginBottom: 'var(--spacing-4)', backgroundColor: 'var(--color-success-bg-light)', color: 'var(--color-success-text)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', borderLeft: `var(--border-4) solid var(--color-success)`, display: 'flex', alignItems: 'flex-start' }}>
          <FaUser style={{ marginRight: 'var(--spacing-2)', marginTop: 'var(--spacing-0-5)', flexShrink: 0 }} />
          <p style={{ fontSize: 'var(--font-size-sm)' }}>{success}</p>
        </div>
      )}

      {!scanning && !scannedPerson && !loading && (
        <Button onClick={startScanner} variant="primary" size="medium" icon={<FaQrcode />} fullWidth>
          Start QR Scanner
        </Button>
      )}

      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <div id="qr-reader" style={{ width: '100%', maxWidth: 'var(--container-sm)', margin: '0 auto', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}></div>
        {scanning && (
          <Button onClick={stopScanner} variant="danger" size="medium" icon={<FaTimes />} fullWidth>
            Stop Scanner
          </Button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8) 0' }}>
          <div style={{ width: 'var(--spacing-12)', height: 'var(--spacing-12)', border: `var(--border-4) solid var(--color-primary)`, borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite', margin: '0 auto var(--spacing-4)' }}></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Processing QR code...</p>
        </div>
      )}

      {scannedPerson && !loading && (
        <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-4)', border: `var(--border-1) solid var(--color-border-primary)`, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-tertiary)' }}>
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>{scannedPerson.name}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{scannedPerson.email}</p>
            <div style={{ marginTop: 'var(--spacing-2)', display: 'inline-block', padding: 'var(--spacing-1) var(--spacing-2)', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info-text)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', borderRadius: 'var(--radius-full)' }}>{scannedPerson.type === "security" ? "Security Guard" : "Maintenance Staff"}</div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' }}>
            <Button onClick={recordAttendance} disabled={recordingAttendance} variant="success" size="medium" icon={<FaUser />} isLoading={recordingAttendance} fullWidth>
              Record Attendance
            </Button>
            <Button onClick={handleReset} variant="secondary" size="medium">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceQRScanner
