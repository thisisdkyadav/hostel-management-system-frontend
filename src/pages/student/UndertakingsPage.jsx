import { useState, useEffect } from "react"
import { FaFileSignature, FaCheck, FaClock, FaExclamationTriangle } from "react-icons/fa"
import { undertakingApi } from "../../service"
import UndertakingDetailModal from "../../components/student/undertakings/UndertakingDetailModal"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui"
import { Tabs, Button } from "czero/react"
const UndertakingsPage = () => {
  const [pendingUndertakings, setPendingUndertakings] = useState([])
  const [acceptedUndertakings, setAcceptedUndertakings] = useState([])
  const [selectedUndertaking, setSelectedUndertaking] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("pending")

  // Fetch undertakings on component mount
  useEffect(() => {
    fetchUndertakings()
  }, [])

  // Function to fetch both pending and accepted undertakings
  const fetchUndertakings = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch both types of undertakings in parallel
      const [pendingResponse, acceptedResponse] = await Promise.all([undertakingApi.getPendingUndertakings(), undertakingApi.getAcceptedUndertakings()])

      setPendingUndertakings(pendingResponse.pendingUndertakings || [])
      setAcceptedUndertakings(acceptedResponse.acceptedUndertakings || [])
    } catch (err) {
      console.error("Error fetching undertakings:", err)
      setError("Failed to load undertakings. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Function to view undertaking details
  const handleViewUndertaking = async (undertakingId) => {
    try {
      setLoading(true)
      const response = await undertakingApi.getUndertakingDetails(undertakingId)
      setSelectedUndertaking(response.undertaking)
      setShowDetailModal(true)
    } catch (err) {
      console.error("Error fetching undertaking details:", err)
      alert("Failed to load undertaking details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Function to accept an undertaking
  const handleAcceptUndertaking = async (undertakingId) => {
    try {
      await undertakingApi.acceptUndertaking(undertakingId)
      alert("Undertaking accepted successfully!")
      setShowDetailModal(false)
      fetchUndertakings() // Refresh the lists
    } catch (err) {
      console.error("Error accepting undertaking:", err)
      alert("Failed to accept undertaking. Please try again.")
    }
  }

  // Function to check if deadline is approaching (within 3 days)
  const isDeadlineApproaching = (deadline) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const daysRemaining = Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24))
    return daysRemaining <= 3 && daysRemaining >= 0
  }

  // Function to check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    return deadlineDate < now
  }

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  }

  if (loading && pendingUndertakings.length === 0 && acceptedUndertakings.length === 0) {
    return <LoadingState message="Loading undertakings..." />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 flex-1" style={{ paddingTop: 'var(--spacing-6)', paddingBottom: 'var(--spacing-6)', backgroundColor: 'var(--color-bg-page)' }}>
      <header className="flex justify-between items-center" style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-6) var(--spacing-6) var(--spacing-4) var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
        <div className="flex items-center">
          <FaFileSignature style={{ color: 'var(--color-info)', fontSize: 'var(--font-size-2xl)', marginRight: 'var(--spacing-3)' }} />
          <h1 className="font-bold" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-secondary)' }}>My Undertakings</h1>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ padding: '0 var(--spacing-4)' }}>
          <Tabs variant="underline"
            tabs={[
              { value: "pending", label: `Pending (${pendingUndertakings.length})` },
              { value: "accepted", label: `Accepted (${acceptedUndertakings.length})` },
            ]}
            value={activeTab}
            onChange={setActiveTab}
            size="md"
          />
        </div>
      </div>

      {/* Pending Undertakings */}
      {activeTab === "pending" && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center" style={{ height: '16rem' }}>
              <div className="animate-spin rounded-full" style={{ height: 'var(--spacing-12)', width: 'var(--spacing-12)', borderTop: 'var(--border-2) solid var(--color-info)', borderBottom: 'var(--border-2) solid var(--color-info)' }}></div>
            </div>
          ) : pendingUndertakings.length === 0 ? (
            <EmptyState icon={FaFileSignature} title="No Pending Undertakings" message="You don't have any undertakings that require your attention." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-6)' }}>
              {pendingUndertakings.map((undertaking) => (
                <div key={undertaking.id} className="transition-shadow" style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-5)', borderLeft: 'var(--border-4) solid var(--color-info)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
                  <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-3)' }}>
                    <h3 className="font-semibold" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>{undertaking.title}</h3>
                    <span className="rounded-full" style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-xs)', backgroundColor: undertaking.status === "not_viewed" ? 'var(--color-info-bg)' : 'var(--color-warning-bg)', color: undertaking.status === "not_viewed" ? 'var(--color-info-text)' : 'var(--color-warning-text)' }}>{undertaking.status === "not_viewed" ? "New" : "Pending"}</span>
                  </div>
                  <p className="line-clamp-2" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>{undertaking.description}</p>

                  <div className="flex items-center justify-between" style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-3)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
                    <div className="flex items-center">
                      <FaClock style={{ color: 'var(--color-text-placeholder)', marginRight: 'var(--spacing-1)' }} />
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Due: {formatDate(undertaking.deadline)}</span>

                      {isDeadlineApproaching(undertaking.deadline) && (
                        <span className="flex items-center" style={{ marginLeft: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-warning-text)' }}>
                          <FaExclamationTriangle style={{ marginRight: 'var(--spacing-1)' }} /> Approaching
                        </span>
                      )}

                      {isDeadlinePassed(undertaking.deadline) && (
                        <span className="flex items-center" style={{ marginLeft: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-danger-text)' }}>
                          <FaExclamationTriangle style={{ marginRight: 'var(--spacing-1)' }} /> Overdue
                        </span>
                      )}
                    </div>

                    <Button onClick={() => handleViewUndertaking(undertaking.id)} variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accepted Undertakings */}
      {activeTab === "accepted" && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center" style={{ height: '16rem' }}>
              <div className="animate-spin rounded-full" style={{ height: 'var(--spacing-12)', width: 'var(--spacing-12)', borderTop: 'var(--border-2) solid var(--color-info)', borderBottom: 'var(--border-2) solid var(--color-info)' }}></div>
            </div>
          ) : acceptedUndertakings.length === 0 ? (
            <EmptyState icon={FaCheck} title="No Accepted Undertakings" message="You haven't accepted any undertakings yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-6)' }}>
              {acceptedUndertakings.map((undertaking) => (
                <div key={undertaking.id} className="transition-shadow" style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-5)', borderLeft: 'var(--border-4) solid var(--color-success)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
                  <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-3)' }}>
                    <h3 className="font-semibold" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>{undertaking.title}</h3>
                    <span className="rounded-full" style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-xs)', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}>Accepted</span>
                  </div>
                  <p className="line-clamp-2" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>{undertaking.description}</p>

                  <div className="flex items-center justify-between" style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-3)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
                    <div className="flex items-center">
                      <FaCheck style={{ color: 'var(--color-success)', marginRight: 'var(--spacing-1)' }} />
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Accepted on: {formatDate(undertaking.acceptedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Undertaking Detail Modal */}
      {selectedUndertaking && <UndertakingDetailModal show={showDetailModal} undertaking={selectedUndertaking} onClose={() => setShowDetailModal(false)} onAccept={handleAcceptUndertaking} />}
    </div>
  )
}

export default UndertakingsPage

