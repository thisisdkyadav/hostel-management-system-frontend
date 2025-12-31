import React, { useState, useRef, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { FaQrcode, FaTimes } from "react-icons/fa"
import { securityApi } from "../../service"
import { useQRScanner } from "../../contexts/QRScannerProvider"
import ScannedStudentInfo from "./ScannedStudentInfo"
import { Button } from "@/components/ui"

const QRScanner = ({ onRefresh }) => {
  const { fetchScannerEntries } = useQRScanner()
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  const [scannedStudent, setScannedStudent] = useState(null)
  const [lastCheckInOut, setLastCheckInOut] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recordingEntry, setRecordingEntry] = useState(false)
  const scannerRef = useRef(null)
  const lastProcessedEmailRef = useRef(null)
  const studentInfoRef = useRef(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch((err) => console.error("Error stopping scanner:", err))
      }
    }
  }, [])

  useEffect(() => {
    if (scannedStudent && studentInfoRef.current) {
      studentInfoRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [scannedStudent])

  const startScanner = () => {
    setScanning(true)
    setError("")
    setScannedStudent(null)
    setLastCheckInOut(null)
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
    handleScanSuccess(decodedText)
  }

  const handleScanSuccess = async (decodedText) => {
    try {
      const data = JSON.parse(decodedText)
      if (!data || !data.e || !data.d) {
        setError("Invalid QR code format. Please try again.")
        return
      }

      const email = data.e
      const encryptedData = data.d
      setError("")

      if (lastProcessedEmailRef.current === email) return

      setLoading(true)
      const response = await securityApi.verifyQRCode(email, encryptedData)
      const studentProfile = response.studentProfile || null
      const lastCheckInOut = response.lastCheckInOut || null

      setScannedStudent(studentProfile)
      setLastCheckInOut(lastCheckInOut)
      lastProcessedEmailRef.current = email
      setLoading(false)

      if (onScanSuccess) {
        onScanSuccess(studentProfile)
      }
    } catch (error) {
      setError("Invalid QR code. Please try again.")
      setLoading(false)
      console.error("QR processing error:", error)
    }
  }

  const handleScanError = (err) => { }

  const handleReset = () => {
    setScannedStudent(null)
    setLastCheckInOut(null)
    setError("")
    lastProcessedEmailRef.current = null
  }

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

  const getNextStatus = () => {
    if (!lastCheckInOut) return "Checked In"
    return lastCheckInOut.status === "Checked In" ? "Checked Out" : "Checked In"
  }

  const recordEntry = async (crossHostelReason = null) => {
    if (!scannedStudent) return

    try {
      setRecordingEntry(true)
      setError("")

      const status = getNextStatus()

      const entryData = {
        email: scannedStudent.email,
        status: status,
      }

      // Add cross-hostel reason if provided
      if (crossHostelReason) {
        entryData.crossHostelReason = crossHostelReason
      }

      await securityApi.addStudentEntryWithEmail(entryData)
      onRefresh()
      fetchScannerEntries() // Also refresh the scanner entries context
      handleReset()
      setRecordingEntry(false)
    } catch (error) {
      setError("Failed to record entry: " + error.message)
      setRecordingEntry(false)
      console.error("Entry recording error:", error)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)', boxShadow: 'var(--shadow-sm)', border: `var(--border-1) solid var(--color-border-light)`, transition: 'var(--transition-all)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
        <div style={{ padding: 'var(--spacing-2-5)', marginRight: 'var(--spacing-3)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
          <FaQrcode size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-lg'))} />
        </div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)' }}>Scan Student QR Code</h2>
      </div>

      {error && (
        <div style={{ marginBottom: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg-light)', color: 'var(--color-danger-text)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', borderLeft: `var(--border-4) solid var(--color-danger)`, display: 'flex', alignItems: 'flex-start' }}>
          <FaTimes style={{ marginRight: 'var(--spacing-2)', marginTop: 'var(--spacing-0-5)', flexShrink: 0 }} />
          <p style={{ fontSize: 'var(--font-size-sm)' }}>{error}</p>
        </div>
      )}

      {!scanning && !scannedStudent && !loading && (
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

      {scannedStudent && !loading && (
        <div style={{ marginTop: 'var(--spacing-4)' }} ref={studentInfoRef}>
          <ScannedStudentInfo student={scannedStudent} lastCheckInOut={lastCheckInOut} onReset={handleReset} onRecordEntry={recordEntry} recordingEntry={recordingEntry} getNextStatus={getNextStatus} />
        </div>
      )}
    </div>
  )
}

export default QRScanner
