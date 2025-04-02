import { useState, useEffect } from "react"
import QRCodeGenerator from "../../components/QRCodeGenerator"
import AccessHistory from "../../components/AccessHistory"
import OfflineBanner from "../../components/common/OfflineBanner"
import { useAuth } from "../../contexts/AuthProvider"
import { securityApi } from "../../services/apiService"

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Campus Security Access</h1>
        <p className="text-gray-600">Generate your QR code for security verification, and view your access history.</p>
      </div>

      {isOfflineData && <OfflineBanner message="You are offline. Viewing cached security data. Some features may be limited." className="mb-6" />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QRCodeGenerator isOfflineMode={isOfflineData} />
        </div>

        <AccessHistory cachedData={isOfflineData ? accessData : null} />
      </div>
    </div>
  )
}

export default Security
