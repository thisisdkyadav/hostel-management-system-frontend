import { useQuery } from "@tanstack/react-query"
import QRCodeGenerator from "../../components/QRCodeGenerator"
import AccessHistory from "../../components/AccessHistory"
import OfflineBanner from "../../components/common/OfflineBanner"
import { useAuth } from "../../contexts/AuthProvider"
import { securityApi } from "../../service"
import { queryKeys } from "../../lib/query"

const SECURITY_CACHE_KEY = "student_security_data"

const readCachedSecurityData = () => {
  try {
    const cachedData = localStorage.getItem(SECURITY_CACHE_KEY)
    if (!cachedData) return null
    const { data } = JSON.parse(cachedData)
    return data ?? null
  } catch {
    return null
  }
}

// Cache fallbacks are wrapped so the page can tell served-from-cache data apart
// from a fresh successful response without mirroring anything into useState.
const wrapFromCache = (data) => ({ __fromCache: true, data })

const isFromCache = (value) => Boolean(value && typeof value === "object" && value.__fromCache === true)

const SecurityPage = () => {
  const { isOnline } = useAuth()

  const { data } = useQuery({
    queryKey: queryKeys.securityEntries.student(),
    queryFn: async () => {
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

          return response
        } catch (err) {
          console.error("Error fetching security data:", err)
          const cachedData = readCachedSecurityData()
          if (cachedData) {
            return wrapFromCache(cachedData)
          }
          throw err
        }
      }

      const cachedData = readCachedSecurityData()
      if (cachedData) {
        return wrapFromCache(cachedData)
      }
      throw new Error("Offline and no cached security data available")
    },
    retry: false,
  })

  const isOfflineData = isFromCache(data)
  const accessData = isOfflineData ? data.data : (data ?? null)

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

export default SecurityPage

