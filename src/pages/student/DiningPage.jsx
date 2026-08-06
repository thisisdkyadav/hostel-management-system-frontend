import { useEffect, useMemo, useState } from "react"
import { Button, Input, StatusBadge, Table } from "czero/react"
import { Field, Grid, Heading, InfoRow, Modal, Page, Surface, Text } from "@/components/ui"
import { CalendarDays, CheckCircle2, ChevronDown, ChevronRight, Clock, FileText, Mail, RefreshCw, UtensilsCrossed, Users, Wallet } from "lucide-react"
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
import {
  balanceTone,
  clearanceTone,
  formatClearance,
  formatCurrency,
} from "@/components/dining/diningBillingHelpers"

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
        <Heading as="h2" size="xl" weight="bold" color="heading" style={{ margin: 0 }}>
          {title}
        </Heading>
        {subtitle && (
          <Text color="body" size="sm" style={{ margin: "var(--spacing-1) 0 0" }}>{subtitle}</Text>
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
    <HStack gap={2} align="center" justify="between">
      <Heading as="h3" size="sm" weight="semibold" color="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {title}
      </Heading>
      {badge}
    </HStack>
    {children}
  </Card>
)

const CatererIdentity = ({ caterer, selectedAt }) => (
  <VStack gap={3}>
    <HStack gap="medium" align="center">
      <Avatar name={caterer?.name || "?"} size="medium" />
      <div style={{ minWidth: 0 }}>
        <Text as="div" size="lg" weight="bold" color="heading">
          {caterer?.name || "Not selected"}
        </Text>
        {caterer?.email && (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-1-5)", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
            <Mail size={14} /> {caterer.email}
          </div>
        )}
      </div>
    </HStack>
    {selectedAt && (
      <Text as="div" size="xs" color="muted">Selected on {formatDateTime(selectedAt)}</Text>
    )}
  </VStack>
)

const Detail = ({ label, value }) => (
  <div>
    <Text as="div" size="xs" color="muted">{label}</Text>
    <Text as="div" size="sm" color="secondary" weight="medium">{value || "-"}</Text>
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

          <Grid min={200} gap={4}>
            <Field label="Start Date" htmlFor="rebate-start" required>
              <Input id="rebate-start" type="date" value={formData.startDate}
                onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))} required />
            </Field>
            <Field label="End Date" htmlFor="rebate-end" required>
              <Input id="rebate-end" type="date" value={formData.endDate}
                onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))} required />
            </Field>
          </Grid>

          <Field label="Reason" htmlFor="rebate-reason">
            <Textarea id="rebate-reason" rows={3} value={formData.reason}
              onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
              placeholder="Add a short reason for the rebate request" />
          </Field>
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

        <Grid cols={{ base: 1, sm: 2, xl: 3 }} gap={4}>
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
                    <Text as="div" size="md" weight="bold" color="heading">
                      {capacity.caterer?.name || "Caterer"}
                    </Text>
                    <Text as="div" size="xs" color="muted">{capacity.caterer?.email || ""}</Text>
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
        </Grid>
      </VStack>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* Billing                                                            */
/* ------------------------------------------------------------------ */

const BillingFigure = ({ label, value, tone }) => (
  <div>
    <Text as="div" size="xs" color="muted">{label}</Text>
    <Text as="div" size="md" weight="bold" color={tone === "danger" ? "var(--color-danger)" : tone === "success" ? "var(--color-success)" : "var(--color-text-heading)"}>
      {value}
    </Text>
  </div>
)

const StudentBillingCard = ({ billingPeriod }) => {
  const [expanded, setExpanded] = useState(false)
  const hasBreakdown = Array.isArray(billingPeriod.perPeriod) && billingPeriod.perPeriod.length > 0

  return (
    <Surface bg="secondary" padding={4} radius="lg" border="1px solid var(--color-border-primary)">
      <HStack gap={2} align="start" justify="between">
        <div style={{ minWidth: 0 }}>
          <Text as="div" size="md" weight="bold" color="heading">
            {billingPeriod.name}
          </Text>
          <Text as="div" size="xs" color="muted">
            {billingPeriod.startDate ? `${formatDate(billingPeriod.startDate)} – ${formatDate(billingPeriod.endDate)}` : "No dining periods"}
          </Text>
        </div>
        <StatusBadge status={formatClearance(billingPeriod.clearance)} tone={clearanceTone(billingPeriod.clearance)} />
      </HStack>

      <Grid cols={3} gap={3} style={{ marginTop: "var(--spacing-3)" }}>
        <BillingFigure label="Allocated" value={formatCurrency(billingPeriod.allocatedAmount)} />
        <BillingFigure label="Charged" value={formatCurrency(billingPeriod.totalCharged)} />
        <BillingFigure label="Balance" value={formatCurrency(billingPeriod.balance)} tone={balanceTone(billingPeriod.balance)} />
      </Grid>

      {hasBreakdown && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)", marginTop: "var(--spacing-3)",
              background: "none", border: "none", cursor: "pointer", padding: 0,
              color: "var(--color-primary)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)",
            }}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {expanded ? "Hide breakdown" : "Show breakdown"}
          </button>

          {expanded && (
            <VStack gap={2} style={{ marginTop: "var(--spacing-2)" }}>
              {billingPeriod.perPeriod.map((row) => (
                <InfoRow label={<>{formatDate(row.startDate)} – {formatDate(row.endDate)} · {row.chargeableDays}d × {formatCurrency(row.dailyRate)}
                    {row.rebateDays > 0 ? ` (−${row.rebateDays} rebate)` : ""}</>} value={formatCurrency(row.amount)} key={row.periodId} style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }} />
              ))}
            </VStack>
          )}
        </>
      )}
    </Surface>
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
  const [billing, setBilling] = useState([])
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

  const fetchBilling = async () => {
    try {
      const response = await studentApi.getDiningBilling()
      setBilling(Array.isArray(response?.billingPeriods) ? response.billingPeriods : [])
    } catch (billingError) {
      // Billing is supplementary — don't block the dining page on it.
      console.error("Error fetching dining billing:", billingError)
    }
  }

  useEffect(() => {
    fetchPortalState()
    fetchRebates()
    fetchBilling()
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
      await fetchBilling()
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
    <Page>
      <PageHeader title="Dining">
        <Button variant="secondary" onClick={() => fetchPortalState({ silent: true })} disabled={refreshing}>
          <RefreshCw size={18} /> {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </PageHeader>

      <Page.Body>
        {error && <div className="mb-[var(--spacing-4)]"><Alert type="error" icon dismissible onDismiss={() => setError("")}>{error}</Alert></div>}
        {successMessage && <div className="mb-[var(--spacing-4)]"><Alert type="success" icon dismissible onDismiss={() => setSuccessMessage("")}>{successMessage}</Alert></div>}

        <VStack gap="large">
          <DiningHero {...hero} />

          <Grid cols={{ base: 1, md: 2 }} gap={4}>
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
          </Grid>

          {/* Rebates */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <HStack gap={3} align="center" justify="between" wrap>
              <div>
                <Heading as="h3" size="lg" weight="bold" color="heading" style={{ margin: 0 }}>
                  Rebate Requests
                </Heading>
                <Text color="muted" size="sm" style={{ margin: "var(--spacing-1) 0 0" }}>
                  Your approved, pending and rejected dining rebate requests.
                </Text>
              </div>
              <Button variant="secondary" onClick={() => setShowRebateModal(true)} disabled={!canRequestRebate}>
                <FileText size={16} /> Request Rebate
              </Button>
            </HStack>

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

          {/* Billing */}
          {billing.length > 0 && (
            <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              <div>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "var(--spacing-2)", fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>
                  <Wallet size={18} style={{ color: "var(--color-primary)" }} /> Mess Billing
                </h3>
                <Text color="muted" size="sm" style={{ margin: "var(--spacing-1) 0 0" }}>
                  Your allocated funds, daily charges and balance for each billing period. Approved-rebate days are not charged.
                </Text>
              </div>
              <Grid cols={{ base: 1, md: 2 }} gap={3}>
                {billing.map((billingPeriod) => (
                  <StudentBillingCard key={billingPeriod.id} billingPeriod={billingPeriod} />
                ))}
              </Grid>
            </Card>
          )}
        </VStack>
      </Page.Body>

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
    </Page>
  )
}

export default DiningPage
