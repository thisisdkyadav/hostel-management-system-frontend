import React, { useState, useEffect } from "react"
import { FaQrcode, FaRegKeyboard, FaHistory, FaInfoCircle } from "react-icons/fa"
import StudentEntryTable from "../../components/guard/StudentEntryTable"
import { securityApi } from "../../service"
import NewEntryForm from "../../components/guard/NewEntryForm"
import QRScanner from "../../components/guard/QRScanner"
import ScannerStatusIndicator from "../../components/guard/ScannerStatusIndicator"
import { useAuth } from "../../contexts/AuthProvider"
import { Button, ToggleButtonGroup } from "@/components/ui"

const AddStudentEntry = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("qr")
  const [entries, setEntries] = useState([])
  const [scannedStudent, setScannedStudent] = useState(null)

  const fetchRecentEntries = async () => {
    try {
      const data = await securityApi.getRecentStudentEntries()
      setEntries(data)
    } catch (error) {
      console.error("Error fetching recent entries:", error)
    }
  }

  useEffect(() => {
    fetchRecentEntries()
  }, [])

  const handleAddEntry = async (newEntry) => {
    try {
      const entryToAdd = {
        ...newEntry,
        hostelId: user?.hostel?._id,
      }

      const response = await securityApi.addStudentEntry(entryToAdd)
      if (response.success) {
        fetchRecentEntries()
        return true
      }
    } catch (error) {
      alert(error.message || "Failed to add student entry")
      return false
    }
  }

  const handleQRScanSuccess = (student) => {
    setScannedStudent(student)
  }

  const styles = {
    container: {
      padding: "var(--spacing-6) var(--spacing-4)",
      backgroundColor: "var(--color-bg-page)",
    },
    containerResponsive: {
      maxWidth: "var(--container-xl)",
      margin: "0 auto",
    },
    header: {
      marginBottom: "var(--spacing-6)",
    },
    title: {
      fontSize: "var(--font-size-3xl)",
      fontWeight: "var(--font-weight-bold)",
      color: "var(--color-text-secondary)",
      marginBottom: "var(--spacing-2)",
    },
    subtitle: {
      fontSize: "var(--font-size-base)",
      color: "var(--color-text-muted)",
    },
    tabContainer: {
      display: "flex",
      marginBottom: "var(--spacing-6)",
      backgroundColor: "var(--color-bg-primary)",
      padding: "var(--spacing-1)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
    },
    tab: {
      flex: 1,
      padding: "var(--spacing-3) var(--spacing-4)",
      borderRadius: "var(--radius-md)",
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)",
      transition: "var(--transition-colors)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      border: "none",
    },
    tabActive: {
      backgroundColor: "var(--color-primary-bg)",
      color: "var(--color-primary)",
    },
    tabInactive: {
      backgroundColor: "transparent",
      color: "var(--color-text-muted)",
    },
    tabIcon: {
      marginRight: "var(--spacing-2)",
    },
    statusIndicator: {
      marginBottom: "var(--spacing-6)",
    },
    contentSection: {
      marginBottom: "var(--spacing-8)",
    },
    card: {
      backgroundColor: "var(--color-bg-primary)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--spacing-6)",
      boxShadow: "var(--shadow-sm)",
      transition: "var(--transition-all)",
      border: "var(--border-1) solid var(--color-border-light)",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      marginBottom: "var(--spacing-4)",
    },
    cardIconWrapper: {
      padding: "var(--spacing-2-5)",
      marginRight: "var(--spacing-3)",
      borderRadius: "var(--radius-xl)",
      backgroundColor: "var(--color-info-bg)",
      color: "var(--color-primary)",
    },
    cardTitle: {
      fontSize: "var(--font-size-2xl)",
      fontWeight: "var(--font-weight-bold)",
      color: "var(--color-text-secondary)",
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.containerResponsive}>
        <div style={styles.header}>
          <h1 style={styles.title}>Student Entry Management</h1>
          <p style={styles.subtitle}>Record student check-ins and check-outs using the form or QR scanner.</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabContainer}>
          <ToggleButtonGroup
            options={[
              { value: "qr", label: "QR Scanner", icon: <FaQrcode /> },
              { value: "manual", label: "Manual Entry", icon: <FaRegKeyboard /> },
            ]}
            value={activeTab}
            onChange={setActiveTab}
            shape="rounded"
            size="medium"
            variant="muted"
            fullWidth
            hideLabelsOnMobile={false}
          />
        </div>

        {/* Scanner Status Indicator */}
        <div style={styles.statusIndicator}>
          <ScannerStatusIndicator />
        </div>

        {/* Content based on active tab */}
        <div style={styles.contentSection}>
          {activeTab === "qr" ? (
            <QRScanner onScanSuccess={handleQRScanSuccess} onRefresh={fetchRecentEntries} />
          ) : (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIconWrapper}>
                  <FaRegKeyboard size={20} />
                </div>
                <h2 style={styles.cardTitle}>Manual Entry Form</h2>
              </div>
              <NewEntryForm onAddEntry={handleAddEntry} />
            </div>
          )}
        </div>

        {/* Recent entries section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrapper}>
              <FaHistory size={20} />
            </div>
            <h2 style={styles.cardTitle}>Recent Entry Records</h2>
          </div>
          <StudentEntryTable entries={entries} refresh={fetchRecentEntries} />
        </div>
      </div>
    </div>
  )
}

export default AddStudentEntry
