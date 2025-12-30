import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaExclamationTriangle, FaFileSignature, FaTimes } from "react-icons/fa"
import { undertakingApi } from "../../service"
import Button from "../common/Button"

const UndertakingsBanner = () => {
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        setLoading(true)
        const response = await undertakingApi.pendingUndertakingsCount()
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
    <div style={{ backgroundColor: 'var(--color-warning-bg-light)', borderLeft: `var(--border-4) solid var(--color-warning)`, padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FaExclamationTriangle style={{ color: 'var(--color-warning)', marginRight: 'var(--spacing-3)', fontSize: 'var(--icon-xl)' }} />
          <div>
            <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-warning-text)', fontSize: 'var(--font-size-lg)' }}>
              {pendingCount === 1 ? "You have 1 pending undertaking" : `You have ${pendingCount} pending undertakings`}
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-warning-text)', opacity: 'var(--opacity-90)' }}>
              Please review and accept your pending undertakings.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/student/undertakings" style={{ backgroundColor: 'var(--color-warning)', color: 'var(--color-white)', padding: `var(--spacing-2) var(--spacing-4)`, borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginRight: 'var(--spacing-2)', display: 'flex', alignItems: 'center', textDecoration: 'none', transition: 'var(--transition-colors)', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-warning-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-warning)'}
          >
            <FaFileSignature style={{ marginRight: 'var(--spacing-2)', fontSize: 'var(--icon-sm)' }} />
            View Undertakings
          </Link>
          <Button onClick={() => setDismissed(true)} variant="ghost" size="small" icon={<FaTimes />} aria-label="Dismiss" />
        </div>
      </div>
    </div>
  )
}

export default UndertakingsBanner
