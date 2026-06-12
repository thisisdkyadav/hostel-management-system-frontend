import { useEffect, useState } from "react"
import { Button, Tabs } from "czero/react"
import { RefreshCw } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { adminApi } from "../../service"
import { Alert } from "@/components/ui"
import RebateRequestsPanel from "@/components/dining/RebateRequestsPanel"
import { getErrorMessage } from "@/components/dining/diningPeriodHelpers"

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

const EMPTY_MESSAGES = {
  pending: "No long-term rebate requests are awaiting approval.",
  approved: "No approved rebate requests yet.",
  rejected: "No rejected rebate requests yet.",
}

const DiningRebatesPage = () => {
  const [status, setStatus] = useState("pending")
  const [rebates, setRebates] = useState([])
  const [loading, setLoading] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const fetchRebates = async (nextStatus = status) => {
    setLoading(true)
    try {
      const response = await adminApi.getDiningRebates({ status: nextStatus })
      const list = Array.isArray(response?.rebates) ? response.rebates : []
      setRebates(list)
      if (nextStatus === "pending") setPendingCount(list.length)
    } catch (error) {
      console.error("Error fetching dining rebates:", error)
      setRebates([])
    } finally {
      setLoading(false)
    }
  }

  const refreshPendingCount = async () => {
    try {
      const response = await adminApi.getDiningRebates({ status: "pending" })
      setPendingCount(Array.isArray(response?.rebates) ? response.rebates.length : 0)
    } catch {
      /* count is best-effort */
    }
  }

  useEffect(() => {
    fetchRebates("pending")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStatusChange = (nextStatus) => {
    setStatus(nextStatus)
    fetchRebates(nextStatus)
  }

  const handleApprove = async (rebate) => {
    try {
      await adminApi.approveDiningRebate(rebate.id)
      setFeedback({ type: "success", message: `Rebate for ${rebate.rollNumber} approved.` })
      await Promise.all([fetchRebates(), refreshPendingCount()])
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to approve rebate.") })
    }
  }

  const handleReject = async (rebate, comment) => {
    try {
      await adminApi.rejectDiningRebate(rebate.id, comment)
      setFeedback({ type: "success", message: `Rebate for ${rebate.rollNumber} rejected.` })
      await Promise.all([fetchRebates(), refreshPendingCount()])
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to reject rebate.") })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Dining Rebates" subtitle="Review and approve long-term meal rebate requests">
        <Button variant="secondary" onClick={() => fetchRebates()}>
          <RefreshCw size={18} /> Refresh
        </Button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
        <Tabs
          variant="pills"
          tabs={STATUS_TABS.map((tab) =>
            tab.value === "pending" ? { ...tab, count: pendingCount || undefined } : tab
          )}
          activeTab={status}
          setActiveTab={handleStatusChange}
        />

        {feedback && (
          <Alert
            type={feedback.type}
            icon
            dismissible
            onDismiss={() => setFeedback(null)}
            style={{ marginTop: "var(--spacing-4)" }}
          >
            {feedback.message}
          </Alert>
        )}

        {status === "pending" && (
          <Alert type="info" icon style={{ marginTop: "var(--spacing-4)" }}>
            Pending requests need admin approval before caterer counts are reduced.
          </Alert>
        )}

        <div style={{ marginTop: "var(--spacing-6)" }}>
          <RebateRequestsPanel
            rebates={rebates}
            loading={loading}
            onApprove={handleApprove}
            onReject={handleReject}
            emptyMessage={EMPTY_MESSAGES[status]}
          />
        </div>
      </div>
    </div>
  )
}

export default DiningRebatesPage
