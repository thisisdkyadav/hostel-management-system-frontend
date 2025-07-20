import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaExclamationTriangle, FaFileSignature, FaTimes } from "react-icons/fa"
import { studentUndertakingApi } from "../../services/studentUndertakingApi"

const UndertakingsBanner = () => {
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        setLoading(true)
        const response = await studentUndertakingApi.pendingUndertakingsCount()
        console.log(response)

        setPendingCount(response.count || 0)
      } catch (error) {
        console.error("Error fetching pending undertakings count:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingCount()
  }, [])

  if (loading || pendingCount === 0 || dismissed) {
    return null
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-amber-500 mr-3 text-xl" />
          <div>
            <h3 className="font-medium text-amber-800">{pendingCount === 1 ? "You have 1 pending undertaking" : `You have ${pendingCount} pending undertakings`}</h3>
            <p className="text-sm text-amber-700">Please review and accept your pending undertakings.</p>
          </div>
        </div>
        <div className="flex items-center">
          <Link to="/student/undertakings" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium mr-2 flex items-center">
            <FaFileSignature className="mr-2" />
            View Undertakings
          </Link>
          <button onClick={() => setDismissed(true)} className="text-amber-700 hover:text-amber-900 p-1" aria-label="Dismiss">
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  )
}

export default UndertakingsBanner
