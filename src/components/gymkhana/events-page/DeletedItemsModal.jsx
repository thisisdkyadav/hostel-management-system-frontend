/**
 * Deleted Items Modal (Admin)
 *
 * Lists soft-deleted proposals + bills and lets an admin restore them.
 * Backed by GET /student-affairs/events/admin/deleted. Mount only when open
 * (parent renders conditionally) so the fetch runs once on mount.
 */

import { useState, useEffect } from "react"
import { Button, Modal, Spinner, Surface, Tabs, Text, useToast, VStack } from "hzero"
import { Clock, RotateCcw } from "lucide-react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import { formatIndianDateTime } from "@/utils/formatters"

const formatTimestamp = (value) => {
  if (!value) return "—"
  const date = new Date(value)
  return formatIndianDateTime(date)
}

const DeletedRow = ({ item, onRestore, restoring, lastRow }) => (
  <div
    style={{
      display: "flex",
      gap: "var(--spacing-3)",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingBottom: "var(--spacing-3)",
      borderBottom: lastRow ? "none" : "var(--border-1) solid var(--color-border-primary)",
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <Text size="sm" weight="medium" color="heading" style={{ marginBottom: "var(--spacing-1)" }}>
        {item.eventId?.title || "Untitled event"}
        {item.eventId?.category ? (
          <Text as="span" color="muted" weight="normal">
            {" "}· {item.eventId.category}
          </Text>
        ) : null}
      </Text>
      <Text size="xs" color="muted">
        Submitted by {item.submittedBy?.name || "Unknown"}
      </Text>
      <Text size="xs" color="muted">
        Deleted by {item.deletedBy?.name || "Unknown"} · {formatTimestamp(item.deletedAt)}
      </Text>
      {item.deleteReason ? (
        <Text size="xs" color="muted" style={{ fontStyle: "italic", marginTop: "var(--spacing-1)" }}>
          "{item.deleteReason}"
        </Text>
      ) : null}
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={() => onRestore(item._id)}
      loading={restoring}
      disabled={restoring}
    >
      <RotateCcw size={14} /> Restore
    </Button>
  </div>
)

const EmptyState = ({ label }) => (
  <Surface padding={6} color="muted" align="center">
    <Clock size={32} style={{ margin: "0 auto var(--spacing-2)" }} />
    <p>No deleted {label}</p>
  </Surface>
)

const DeletedItemsModal = ({ isOpen = true, onClose, onRestored }) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [proposals, setProposals] = useState([])
  const [expenses, setExpenses] = useState([])
  const [activeTab, setActiveTab] = useState("proposals")
  const [restoringId, setRestoringId] = useState(null)

  useEffect(() => {
    let cancelled = false
    gymkhanaEventsApi
      .getDeletedEventEntities()
      .then((res) => {
        if (cancelled) return
        const data = res?.data ?? res ?? {}
        setProposals(data.proposals || [])
        setExpenses(data.expenses || [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        toast.error(err.message || "Failed to load deleted items")
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const restore = async (kind, id) => {
    try {
      setRestoringId(id)
      if (kind === "proposal") {
        await gymkhanaEventsApi.adminRestoreProposal(id)
        setProposals((prev) => prev.filter((p) => p._id !== id))
        toast.success("Proposal restored")
      } else {
        await gymkhanaEventsApi.adminRestoreExpense(id)
        setExpenses((prev) => prev.filter((e) => e._id !== id))
        toast.success("Bill restored")
      }
      onRestored?.()
    } catch (err) {
      toast.error(err.message || "Failed to restore")
    } finally {
      setRestoringId(null)
    }
  }

  const tabs = [
    { value: "proposals", label: "Proposals", count: proposals.length },
    { value: "bills", label: "Bills", count: expenses.length },
  ]

  const renderList = (items, kind, label) => {
    if (!items.length) return <EmptyState label={label} />
    return (
      <VStack gap={3}>
        {items.map((item, idx) => (
          <DeletedRow
            key={item._id}
            item={item}
            onRestore={(id) => restore(kind, id)}
            restoring={restoringId === item._id}
            lastRow={idx === items.length - 1}
          />
        ))}
      </VStack>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deleted items"
      width={680}
      footer={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-6)" }}>
          <Spinner size="medium" />
        </div>
      ) : (
        <>
          <Tabs
            variant="pills"
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <div style={{ marginTop: "var(--spacing-4)" }}>
            {activeTab === "proposals"
              ? renderList(proposals, "proposal", "proposals")
              : renderList(expenses, "expense", "bills")}
          </div>
        </>
      )}
    </Modal>
  )
}

export default DeletedItemsModal
