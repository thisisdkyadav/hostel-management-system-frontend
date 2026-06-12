import { useEffect, useMemo, useState } from "react"
import { Button, Input, Modal, StatusBadge, Table } from "czero/react"
import { CalendarDays, CheckCircle2, Clock, FileText, Mail, RefreshCw, UtensilsCrossed, Users } from "lucide-react"
import { Alert, Avatar, Card, ConfirmDialog, EmptyState, HStack, Label, LoadingState, Textarea, VStack } from "@/components/ui"
import PageHeader from "../../components/common/PageHeader"
import { studentApi } from "../../service"
import CapacityBar from "@/components/dining/CapacityBar"
import {
  formatDate,
  formatRebateStatus,
  formatRebateType,
  getErrorMessage,
  rebateStatusTone,
} from "@/components/dining/diningPeriodHelpers"

const REFRESH_INTERVAL_MS = 5000

const formatDateTime = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatPeriodRange = (period) => {
  if (!period) return "-"
  return `${formatDate(period.startDate)} – ${formatDate(period.endDate)}`
}

const getPeriodId = (period) => String(period?.id || period?._id || "")

/* ------------------------------------------------------------------ */
/* Hero status banner                                                 */
/* ------------------------------------------------------------------ */

const HERO_TONES = {
  success: { color: "var(--color-success)", bg: "var(--color-success-bg-light)" },
  warning: { color: "var(--color-warning)", bg: "var(--color-warning-bg-light)" },
  primary: { color: "var(--color-primary)", bg: "var(--color-primary-bg)" },
  neutral: { color: "var(--color-text-muted)", bg: "var(--color-bg-hover)" },
}

const DiningHero = ({ tone = "primary", icon: Icon, title, subtitle, action }) => {
  const palette = HERO_TONES[tone] || HERO_TONES.primary
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-4)",
        padding: "var(--spacing-5)",
        borderRadius: "var(--radius-card)",
        border: `1px solid ${palette.color}33`,
        backgroundColor: palette.bg,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ width: 56, height: 56, borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-bg-primary)", color: palette.color, flexShrink: 0 }}
      >
        {Icon && <Icon size={26} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>{subtitle}</p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Info cards                                                         */
/* ------------------------------------------------------------------ */

const InfoCard = ({ title, badge, children }) => (
  <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-2)" }}>
      <h3 style={{ margin: 0, fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)" }}>
        {title}
      </h3>
      {badge}
    </div>
    {children}
  </Card>
)

const CatererIdentity = ({ caterer, selectedAt }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
    <HStack gap="medium" align="center">
      <Avatar name={caterer?.name || "?"} size="medium" />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>
          {caterer?.name || "Not selected"}
        </div>
        {caterer?.email && (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-1-5)", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
            <Mail size={14} /> {caterer.email}
          </div>
        )}
      </div>
    </HStack>
    {selectedAt && (
      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Selected on {formatDateTime(selectedAt)}</div>
    )}
  </div>
)

const Detail = ({ label, value }) => (
  <div>
    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{label}</div>
    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>{value || "-"}</div>
  </div>
)

/* ------------------------------------------------------------------ */
/* Modals                                                             */
/* ------------------------------------------------------------------ */

const RebateRequestModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({ startDate: "", endDate: "", reason: "" })
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.startDate || !formData.endDate) {
      setError("Please select start and end dates.")
      return
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Start date must be before or equal to end date.")
      return
    }
    setError("")
    await onSubmit(formData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Dining Rebate"
      width={620}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="rebate-form" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            Submit Request
          </Button>
        </>
      }
    >
      <form id="rebate-form" onSubmit={handleSubmit}>
        <VStack gap="large">
          <Alert type="info" icon>
            Short-term rebates that follow the period rules are approved automatically. Longer requests are sent to admin for approval.
          </Alert>
          {error && <Alert type="error" icon>{error}</Alert>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--spacing-4)" }}>
            <div>
              <Label htmlFor="rebate-start" required>Start Date</Label>
              <Input id="rebate-start" type="date" value={formData.startDate}
                onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="rebate-end" required>End Date</Label>
              <Input id="rebate-end" type="date" value={formData.endDate}
                onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))} required />
            </div>
          </div>

          <div>
            <Label htmlFor="rebate-reason">Reason</Label>
            <Textarea id="rebate-reason" rows={3} value={formData.reason}
              onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
              placeholder="Add a short reason for the rebate request" />
          </div>
        </VStack>
      </form>
    </Modal>
  )
}

const CatererSelectionModal = ({ isOpen, period, selectedCatererId, selectingCatererId, onClose, onSelect }) => {
  const capacityCards = Array.isArray(period?.catererCapacities) ? period.catererCapacities : []
  if (!isOpen || !period) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Dining Caterer" width={920}>
      <VStack gap="large">
        <Alert type="info" icon>
          Choose one caterer for {formatPeriodRange(period)}. Seat counts refresh every few seconds.
        </Alert>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[var(--spacing-4)]">
          {capacityCards.map((capacity) => {
            const isSelected = selectedCatererId === String(capacity.catererId)
            const remaining = Number(capacity.remainingSeats || 0)
            const max = Number(capacity.maxStudentCount || 0)
            const isFull = remaining <= 0 && !isSelected
            const isSelecting = selectingCatererId === capacity.catererId

            return (
              <Card key={capacity.catererId} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", opacity: isFull ? 0.7 : 1 }}>
                <HStack gap="medium" align="center">
                  <Avatar name={capacity.caterer?.name || "?"} size="small" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>
                      {capacity.caterer?.name || "Caterer"}
                    </div>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{capacity.caterer?.email || ""}</div>
                  </div>
                  {isSelected && <div style={{ marginLeft: "auto" }}><StatusBadge status="Selected" tone="success" /></div>}
                </HStack>

                <CapacityBar allocated={max - remaining} total={max} label="Seats" />

                <Button
                  variant={isSelected ? "secondary" : "primary"}
                  fullWidth
                  disabled={isFull || isSelecting || isSelected}
                  loading={isSelecting}
                  onClick={() => onSelect(capacity)}
                  style={{ marginTop: "auto" }}
                >
                  {isSelected ? "Selected" : isFull ? "Full" : "Select Caterer"}
                </Button>
              </Card>
            )
          })}
        </div>
      </VStack>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

const DiningPage = () => {
  const [portalState, setPortalState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectingCatererId, setSelectingCatererId] = useState("")
  const [pendingCaterer, setPendingCaterer] = useState(null)
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [showRebateModal, setShowRebateModal] = useState(false)
  const [rebates, setRebates] = useState([])
  const [rebateSubmitting, setRebateSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const currentPeriod = portalState?.currentPeriod || null
  const activeAllocationPeriod = portalState?.activeAllocationPeriod || portalState?.period || null
  const upcomingAllocationPeriod = portalState?.upcomingAllocationPeriod || null
  const canSelect = Boolean(portalState?.canSelect && activeAllocationPeriod)
  const activeSelectedCatererId = activeAllocationPeriod?.selectedAllocation?.catererId
    ? String(activeAllocationPeriod.selectedAllocation.catererId)
    : ""

  const selectedUpcomingPeriod = useMemo(() => {
    const currentId = getPeriodId(currentPeriod)
    return (
      [activeAllocationPeriod, upcomingAllocationPeriod].find(
        (period) => period?.selectedAllocation && getPeriodId(period) !== currentId
      ) || null
    )
  }, [activeAllocationPeriod, currentPeriod, upcomingAllocationPeriod])

  const currentAllocation = currentPeriod?.selectedAllocation || null
  const activeUnselected = Boolean(activeAllocationPeriod && !activeAllocationPeriod.selectedAllocation)
  const canRequestRebate = Boolean(currentAllocation || selectedUpcomingPeriod?.selectedAllocation)

  const hero = useMemo(() => {
    const openSelect = (
      <Button variant="primary" onClick={() => setShowAllocationModal(true)}>
        <UtensilsCrossed size={18} /> Select Caterer
      </Button>
    )

    if (canSelect && activeUnselected) {
      return {
        tone: "warning",
        icon: Clock,
        title: "Choose your dining caterer",
        subtitle: `Selection closes ${formatDateTime(activeAllocationPeriod.allocationEndAt)}`,
        action: openSelect,
      }
    }
    if (currentAllocation || selectedUpcomingPeriod?.selectedAllocation) {
      const set = currentAllocation || selectedUpcomingPeriod?.selectedAllocation
      const setPeriod = currentAllocation ? currentPeriod : selectedUpcomingPeriod
      return {
        tone: "success",
        icon: CheckCircle2,
        title: "You're all set for dining",
        subtitle: `${set?.caterer?.name || "Caterer"} · ${formatPeriodRange(setPeriod)}`,
        action: canSelect ? (
          <Button variant="secondary" onClick={() => setShowAllocationModal(true)}>Change</Button>
        ) : null,
      }
    }
    if (upcomingAllocationPeriod && !activeAllocationPeriod) {
      return {
        tone: "primary",
        icon: CalendarDays,
        title: "Dining selection opens soon",
        subtitle: `Opens ${formatDateTime(upcomingAllocationPeriod.allocationStartAt)}`,
      }
    }
    return {
      tone: "neutral",
      icon: CalendarDays,
      title: "No dining allocation scheduled",
      subtitle: portalState?.message || "Any future dining allocation window will appear here automatically.",
    }
  }, [activeAllocationPeriod, activeUnselected, canSelect, currentAllocation, currentPeriod, portalState, selectedUpcomingPeriod, upcomingAllocationPeriod])

  const fetchPortalState = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true)
      else setLoading(true)
      const response = await studentApi.getDiningPortalState()
      setPortalState(response || null)
      setError("")
      if (!response?.canSelect) setShowAllocationModal(false)
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Unable to load dining allocation details."))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchRebates = async () => {
    try {
      const response = await studentApi.getDiningRebates()
      setRebates(Array.isArray(response?.rebates) ? response.rebates : [])
    } catch (rebateError) {
      setError(getErrorMessage(rebateError, "Unable to load dining rebate requests."))
    }
  }

  useEffect(() => {
    fetchPortalState()
    fetchRebates()
    const intervalId = window.setInterval(() => fetchPortalState({ silent: true }), REFRESH_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [])

  const performSelect = async (capacity) => {
    const catererName = capacity.caterer?.name || "this caterer"
    setSelectingCatererId(capacity.catererId)
    setSuccessMessage("")
    setError("")
    try {
      const response = await studentApi.selectDiningCaterer(capacity.catererId)
      setPortalState(response || null)
      setShowAllocationModal(false)
      setSuccessMessage(`${catererName} selected successfully.`)
    } catch (selectError) {
      setError(getErrorMessage(selectError, "Unable to select caterer. Please try another option."))
      await fetchPortalState({ silent: true })
    } finally {
      setSelectingCatererId("")
    }
  }

  const handleRequestRebate = async (payload) => {
    setRebateSubmitting(true)
    setSuccessMessage("")
    setError("")
    try {
      const response = await studentApi.requestDiningRebate(payload)
      await fetchRebates()
      await fetchPortalState({ silent: true })
      setShowRebateModal(false)
      const hasPending = Array.isArray(response?.rebates) && response.rebates.some((rebate) => rebate.status === "pending")
      setSuccessMessage(hasPending ? "Long-term rebate request submitted for approval." : "Short-term rebate approved successfully.")
    } catch (rebateError) {
      setError(getErrorMessage(rebateError, "Unable to submit rebate request."))
    } finally {
      setRebateSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading dining allocation..." />
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Dining">
        <Button variant="secondary" onClick={() => fetchPortalState({ silent: true })} disabled={refreshing}>
          <RefreshCw size={18} /> {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
        {error && <div className="mb-[var(--spacing-4)]"><Alert type="error" icon dismissible onDismiss={() => setError("")}>{error}</Alert></div>}
        {successMessage && <div className="mb-[var(--spacing-4)]"><Alert type="success" icon dismissible onDismiss={() => setSuccessMessage("")}>{successMessage}</Alert></div>}

        <VStack gap="large">
          <DiningHero {...hero} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-4)]">
            <InfoCard
              title="Current Caterer"
              badge={currentAllocation ? <StatusBadge status="Active" tone="success" /> : <StatusBadge status="None" tone="primary" showDot={false} />}
            >
              <CatererIdentity caterer={currentAllocation?.caterer} selectedAt={currentAllocation?.selectedAt} />
              {currentPeriod && <Detail label="Dining period" value={formatPeriodRange(currentPeriod)} />}
            </InfoCard>

            {selectedUpcomingPeriod ? (
              <InfoCard title="Next Period" badge={<StatusBadge status="Upcoming" tone="warning" />}>
                <CatererIdentity
                  caterer={selectedUpcomingPeriod.selectedAllocation?.caterer}
                  selectedAt={selectedUpcomingPeriod.selectedAllocation?.selectedAt}
                />
                <Detail label="Dining period" value={formatPeriodRange(selectedUpcomingPeriod)} />
              </InfoCard>
            ) : activeUnselected ? (
              <InfoCard title="Allocation Window" badge={<StatusBadge status="Open" tone="warning" />}>
                <Detail label="Dining period" value={formatPeriodRange(activeAllocationPeriod)} />
                <Detail label="Selection closes" value={formatDateTime(activeAllocationPeriod.allocationEndAt)} />
                {canSelect && (
                  <Button variant="primary" onClick={() => setShowAllocationModal(true)} style={{ marginTop: "var(--spacing-1)" }}>
                    <UtensilsCrossed size={16} /> Select Caterer
                  </Button>
                )}
              </InfoCard>
            ) : upcomingAllocationPeriod ? (
              <InfoCard title="Upcoming Allocation" badge={<StatusBadge status="Scheduled" tone="primary" showDot={false} />}>
                <Detail label="Dining period" value={formatPeriodRange(upcomingAllocationPeriod)} />
                <Detail label="Selection opens" value={formatDateTime(upcomingAllocationPeriod.allocationStartAt)} />
              </InfoCard>
            ) : null}
          </div>

          {/* Rebates */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>
                  Rebate Requests
                </h3>
                <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  Your approved, pending and rejected dining rebate requests.
                </p>
              </div>
              <Button variant="secondary" onClick={() => setShowRebateModal(true)} disabled={!canRequestRebate}>
                <FileText size={16} /> Request Rebate
              </Button>
            </div>

            {rebates.length === 0 ? (
              <EmptyState icon={FileText} title="No Rebate Requests" message="Requests you submit will be tracked here." />
            ) : (
              <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-primary)]">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Dates</Table.Head>
                      <Table.Head>Caterer</Table.Head>
                      <Table.Head>Days</Table.Head>
                      <Table.Head>Type</Table.Head>
                      <Table.Head>Status</Table.Head>
                      <Table.Head>Comment</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {rebates.map((rebate) => (
                      <Table.Row key={rebate.id}>
                        <Table.Cell>{formatDate(rebate.startDate)} – {formatDate(rebate.endDate)}</Table.Cell>
                        <Table.Cell>{rebate.caterer?.name || "-"}</Table.Cell>
                        <Table.Cell>{rebate.dayCount}</Table.Cell>
                        <Table.Cell>{formatRebateType(rebate.type)}</Table.Cell>
                        <Table.Cell>
                          <StatusBadge status={formatRebateStatus(rebate.status)} tone={rebateStatusTone(rebate.status)} />
                        </Table.Cell>
                        <Table.Cell>{rebate.adminComment || rebate.reason || "-"}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </Card>
        </VStack>
      </div>

      <CatererSelectionModal
        isOpen={showAllocationModal && canSelect}
        period={activeAllocationPeriod}
        selectedCatererId={activeSelectedCatererId}
        selectingCatererId={selectingCatererId}
        onClose={() => setShowAllocationModal(false)}
        onSelect={setPendingCaterer}
      />

      {showRebateModal && (
        <RebateRequestModal
          isOpen={showRebateModal}
          onClose={() => setShowRebateModal(false)}
          onSubmit={handleRequestRebate}
          isSubmitting={rebateSubmitting}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingCaterer)}
        onClose={() => setPendingCaterer(null)}
        onConfirm={() => {
          const target = pendingCaterer
          setPendingCaterer(null)
          if (target) performSelect(target)
        }}
        title="Confirm Caterer"
        message={`Confirm ${pendingCaterer?.caterer?.name || "this caterer"} as your dining caterer for this period?`}
        confirmText="Confirm Selection"
      />
    </div>
  )
}

export default DiningPage
