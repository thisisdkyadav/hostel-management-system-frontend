import React, { useState, useRef, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { FaQrcode, FaTimes, FaUser } from "react-icons/fa"
import { securityApi } from "../../services/apiService"

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
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="p-2.5 mr-3 rounded-xl bg-blue-100 text-[#1360AB]">
          <FaQrcode size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Scan Staff Attendance QR Code</h2>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border-l-4 border-red-500 flex items-start">
          <FaTimes className="mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg border-l-4 border-green-500 flex items-start">
          <FaUser className="mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {!scanning && !scannedPerson && !loading && (
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

      {scannedPerson && !loading && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-gray-800 mb-1">{scannedPerson.name}</h3>
            <p className="text-gray-600 text-sm">{scannedPerson.email}</p>
            <div className="mt-2 inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">{scannedPerson.type === "security" ? "Security Guard" : "Maintenance Staff"}</div>
          </div>

          <div className="flex space-x-2 mt-4">
            <button onClick={recordAttendance} disabled={recordingAttendance} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
              {recordingAttendance ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : <FaUser className="mr-2" />}
              Record Attendance
            </button>
            <button onClick={handleReset} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceQRScanner
