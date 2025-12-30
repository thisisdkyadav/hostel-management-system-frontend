import { createContext, useState, useContext, useEffect, useRef } from "react"
import { securityApi } from "../service"
import { useAuth } from "./AuthProvider"
import { useNotification } from "./NotificationProvider"

const QRScannerContext = createContext(null)
export const useQRScanner = () => useContext(QRScannerContext)

const QRScannerProvider = ({ children }) => {
  const { user } = useAuth()
  const notification = useNotification()
  const [scannerEntries, setScannerEntries] = useState([])
  const [pendingCrossHostelEntries, setPendingCrossHostelEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Refs for managing scanner input
  const scannerInputRef = useRef("")
  const scannerTimeoutRef = useRef(null)
  const lastProcessedQRRef = useRef("")
  const processingRef = useRef(false)

  // Fetch recent scanner entries
  const fetchScannerEntries = async () => {
    try {
      setLoading(true)
      const data = await securityApi.getRecentStudentEntries()
      setScannerEntries(data)

      // Separate pending cross-hostel entries (entries without reason that need one)
      // Only check-in entries from other hostels need reasons
      const pending = data.filter((entry) => entry.isSameHostel === false && !entry.reason && entry.status === "Checked In")
      setPendingCrossHostelEntries(pending)
    } catch (error) {
      console.error("Error fetching scanner entries:", error)
      setError("Failed to fetch scanner entries")
    } finally {
      setLoading(false)
    }
  }

  // Process QR code data
  const processQRCode = async (qrData, scannerType) => {
    if (processingRef.current) return
    processingRef.current = true

    try {
      setError("")

      // Parse QR code data
      const data = JSON.parse(qrData)
      if (!data || !data.e || !data.d) {
        throw new Error("Invalid QR code format")
      }

      const email = data.e
      const encryptedData = data.d

      // Prevent duplicate processing
      //   if (lastProcessedQRRef.current === qrData) {
      //     processingRef.current = false
      //     return
      //   }

      console.log("email", email)
      console.log("encryptedData", encryptedData)

      // Verify QR code and get student info
      const response = await securityApi.verifyQRCode(email, encryptedData)
      const studentProfile = response.studentProfile

      if (!studentProfile) {
        throw new Error("Student not found")
      }

      // Determine status based on scanner type and last entry
      const lastEntry = response.lastCheckInOut
      let status

      if (scannerType === "checkin") {
        status = "Checked In"
      } else if (scannerType === "checkout") {
        status = "Checked Out"
      } else {
        // Auto-determine based on last status
        status = !lastEntry || lastEntry.status === "Checked Out" ? "Checked In" : "Checked Out"
      }

      // Create entry data
      const entryData = {
        email: email,
        status: status,
        scannerType: scannerType,
      }

      // For cross-hostel entries, no special handling needed - backend will handle it

      // Add the entry
      await securityApi.addStudentEntryWithEmail(entryData)

      // Refresh entries to show the new one
      await fetchScannerEntries()

      lastProcessedQRRef.current = qrData

      // Show success notification
      showNotification(`${studentProfile.name} - ${status}`, "success")
    } catch (error) {
      console.error("QR processing error:", error)
      setError(error.message || "Failed to process QR code")
      showNotification(error.message || "Failed to process QR code", "error")
    } finally {
      processingRef.current = false
    }
  }

  // Show notification
  const showNotification = (message, type = "info") => {
    if (notification) {
      if (type === "success") {
        notification.showSuccess(message)
      } else if (type === "error") {
        notification.showError(message)
      } else {
        notification.showInfo(message)
      }
    } else {
      console.log(`${type.toUpperCase()}: ${message}`)
    }
  }

  // Handle keyboard input from external QR scanners
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only process if we're in a hostel gate context
      if (!user || user.role !== "Hostel Gate") return

      // Prevent processing if user is typing in an input field
      const activeElement = document.activeElement
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.isContentEditable ||
          activeElement.closest('[contenteditable="true"]') ||
          activeElement.closest("input") ||
          activeElement.closest("textarea") ||
          activeElement.hasAttribute("data-no-scanner") ||
          activeElement.closest('[data-no-scanner="true"]'))
      ) {
        return
      }

      const key = event.key
      console.log("key", key, "current", scannerInputRef.current)

      // Handle scanner input termination
      if (key === "ArrowDown" || key === "Tab") {
        event.preventDefault()

        const qrData = scannerInputRef.current.trim()
        if (qrData) {
          const scannerType = key === "ArrowDown" ? "checkin" : "checkout"
          processQRCode(qrData, scannerType)
        }

        // Reset scanner input
        scannerInputRef.current = ""

        // Clear any existing timeout
        if (scannerTimeoutRef.current) {
          clearTimeout(scannerTimeoutRef.current)
        }

        return
      }

      // Accumulate scanner input
      if (key.length === 1) {
        scannerInputRef.current += key

        // Set timeout to reset scanner input if no termination key is pressed
        if (scannerTimeoutRef.current) {
          clearTimeout(scannerTimeoutRef.current)
        }

        scannerTimeoutRef.current = setTimeout(() => {
          scannerInputRef.current = ""
        }, 2000) // Reset after 2 seconds of inactivity
      }
    }

    // Add event listener
    document.addEventListener("keydown", handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      if (scannerTimeoutRef.current) {
        clearTimeout(scannerTimeoutRef.current)
      }
    }
  }, [user])

  // Update cross-hostel entry reason
  const updateCrossHostelReason = async (entryId, reason) => {
    try {
      setLoading(true)
      await securityApi.updateCrossHostelReason(entryId, reason)
      await fetchScannerEntries()
      showNotification("Cross-hostel reason updated successfully", "success")
    } catch (error) {
      console.error("Error updating cross-hostel reason:", error)
      setError("Failed to update cross-hostel reason")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Initialize entries on mount
  useEffect(() => {
    if (user && user.role === "Hostel Gate") {
      fetchScannerEntries()
    }
  }, [user])

  const value = {
    scannerEntries,
    pendingCrossHostelEntries,
    loading,
    error,
    fetchScannerEntries,
    updateCrossHostelReason,
    processQRCode,
  }

  return <QRScannerContext.Provider value={value}>{children}</QRScannerContext.Provider>
}

export default QRScannerProvider
