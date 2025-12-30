import { useState, useEffect } from "react"
import QRCodeGenerator from "../../components/QRCodeGenerator"
import AccessHistory from "../../components/AccessHistory"
import OfflineBanner from "../../components/common/OfflineBanner"
import { useAuth } from "../../contexts/AuthProvider"
import { securityApi } from "../../service"

const SECURITY_CACHE_KEY = "student_security_data"

const Security = () => {
  const { isOnline } = useAuth()
  const [isOfflineData, setIsOfflineData] = useState(false)
  const [accessData, setAccessData] = useState(null)

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        if (isOnline) {
          try {
            const response = await securityApi.getStudentEntries()

            localStorage.setItem(
              SECURITY_CACHE_KEY,
              JSON.stringify({
                data: response,
                timestamp: new Date().toISOString(),
              })
            )

            setAccessData(response)
            setIsOfflineData(false)
          } catch (err) {
            console.error("Error fetching security data:", err)
            const cachedData = localStorage.getItem(SECURITY_CACHE_KEY)
            if (cachedData) {
              const { data } = JSON.parse(cachedData)
              setAccessData(data)
              setIsOfflineData(true)
            }
          }
        } else {
          const cachedData = localStorage.getItem(SECURITY_CACHE_KEY)
          if (cachedData) {
            const { data } = JSON.parse(cachedData)
            setAccessData(data)
            setIsOfflineData(true)
          }
        }
      } catch (err) {
        console.error("Error in security data handling:", err)
      }
    }

    fetchSecurityData()
  }, [isOnline])

  const styles = {
    container: {
      maxWidth: "var(--container-xl)",
      margin: "0 auto",
      padding: "var(--spacing-6) var(--spacing-4)",
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
    gridContainer: {
      display: "grid",
      gap: "var(--spacing-6)",
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Campus Security Access</h1>
        <p style={styles.subtitle}>Generate your QR code for security verification, and view your access history.</p>
      </div>

      {isOfflineData && <OfflineBanner message="You are offline. Viewing cached security data. Some features may be limited." style={{ marginBottom: "var(--spacing-6)" }} />}

      <div style={styles.gridContainer} className="security-grid">
        <div className="qr-section">
          <QRCodeGenerator isOfflineMode={isOfflineData} />
        </div>

        <div className="history-section">
          <AccessHistory cachedData={isOfflineData ? accessData : null} />
        </div>
      </div>
      <style>{`
        .security-grid { display: grid; grid-template-columns: 1fr; gap: var(--spacing-6); }
        @media (min-width: 1024px) { 
          .security-grid { grid-template-columns: repeat(3, 1fr); }
          .qr-section { grid-column: span 1; }
          .history-section { grid-column: span 2; }
        }
      `}</style>
    </div>
  )
}

export default Security
