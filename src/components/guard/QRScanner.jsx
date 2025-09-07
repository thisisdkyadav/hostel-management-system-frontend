import React, { useState, useRef, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { FaQrcode, FaTimes } from "react-icons/fa"
import { securityApi } from "../../services/securityApi"
import ScannedStudentInfo from "./ScannedStudentInfo"

const QRScanner = ({ onRefresh }) => {
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

  const handleScanError = (err) => {}

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
      handleReset()
      setRecordingEntry(false)
    } catch (error) {
      setError("Failed to record entry: " + error.message)
      setRecordingEntry(false)
      console.error("Entry recording error:", error)
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="p-2.5 mr-3 rounded-xl bg-blue-100 text-[#1360AB]">
          <FaQrcode size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Scan Student QR Code</h2>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border-l-4 border-red-500 flex items-start">
          <FaTimes className="mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!scanning && !scannedStudent && !loading && (
        <button onClick={startScanner} className="w-full py-3 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors shadow-sm hover:shadow-md flex items-center justify-center">
          <FaQrcode className="mr-2" /> Start QR Scanner
        </button>
      )}

      <div className="mb-4">
        <div id="qr-reader" className="w-full max-w-sm mx-auto rounded-lg overflow-hidden"></div>
        {scanning && (
          <button onClick={stopScanner} className="w-full mt-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <FaTimes className="mr-2 inline" /> Stop Scanner
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-[#1360AB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processing QR code...</p>
        </div>
      )}

      {scannedStudent && !loading && (
        <div className="mt-4" ref={studentInfoRef}>
          <ScannedStudentInfo student={scannedStudent} lastCheckInOut={lastCheckInOut} onReset={handleReset} onRecordEntry={recordEntry} recordingEntry={recordingEntry} getNextStatus={getNextStatus} />
        </div>
      )}
    </div>
  )
}

export default QRScanner
