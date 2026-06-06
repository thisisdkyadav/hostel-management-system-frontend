import { useEffect, useMemo, useState } from "react"
import { Button, Modal } from "czero/react"
import { Alert, Card, CardBody, CardFooter, CardHeader, HStack, LoadingState, VStack } from "@/components/ui"
import PageHeader from "../../components/common/PageHeader"
import { studentApi } from "../../service"
import { CalendarDays, CheckCircle2, Clock, RefreshCw, UtensilsCrossed, Users } from "lucide-react"

const REFRESH_INTERVAL_MS = 5000

const formatDateTime = (value) => {
  if (!value) return "-"
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatPeriodRange = (period) => {
  if (!period) return "-"
  return `${formatDateTime(period.startDate)} to ${formatDateTime(period.endDate)}`
}

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.message || fallback
}

const getPeriodId = (period) => String(period?.id || period?._id || "")

const InfoTile = ({ label, value }) => (
  <div>
    <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{label}</p>
    <p style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-semibold)" }}>
      {value || "-"}
    </p>
  </div>
)

const DiningStatusCard = ({ title, subtitle, icon: Icon, children, tone = "primary" }) => {
  const toneColor = tone === "success" ? "var(--color-success)" : tone === "warning" ? "var(--color-warning)" : "var(--color-primary)"
  const toneBg = tone === "success" ? "var(--color-success-bg-light)" : tone === "warning" ? "var(--color-warning-bg-light)" : "var(--color-primary-bg)"

  return (
    <Card>
      <CardHeader>
        <HStack gap="medium" align="center">
          <div className="w-[52px] h-[52px] rounded-[16px] flex items-center justify-center" style={{ backgroundColor: toneBg, color: toneColor }}>
            <Icon size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                {subtitle}
              </p>
            )}
          </div>
        </HStack>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  )
}

const CatererSelectionModal = ({
  isOpen,
  period,
  selectedCatererId,
  selectingCatererId,
  onClose,
  onSelect,
}) => {
  const capacityCards = Array.isArray(period?.catererCapacities) ? period.catererCapacities : []

  if (!isOpen || !period) return null

  return (
    <Modal title="Select Dining Caterer" onClose={onClose} width={960} minHeight="60vh">
      <VStack gap="large">
        <Alert type="info" icon>
          Choose one caterer for {formatPeriodRange(period)}. Seat counts refresh every 5 seconds while this page is open.
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[var(--spacing-4)]">
          {capacityCards.map((capacity) => {
            const isSelected = selectedCatererId === String(capacity.catererId)
            const isFull = Number(capacity.remainingSeats || 0) <= 0 && !isSelected
            const isSelecting = selectingCatererId === capacity.catererId

            return (
              <Card key={capacity.catererId} className="group" style={{ opacity: isFull ? 0.62 : 1 }}>
                <CardHeader>
                  <HStack gap="medium" align="center">
                    <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center" style={{ backgroundColor: isSelected ? "var(--color-success-bg-light)" : "var(--color-primary-bg)", color: isSelected ? "var(--color-success)" : "var(--color-primary)" }}>
                      {isSelected ? <CheckCircle2 size={22} /> : <UtensilsCrossed size={22} />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)" }}>
                        {capacity.caterer?.name || "Caterer"}
                      </h3>
                      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                        {capacity.caterer?.email || ""}
                      </p>
                    </div>
                  </HStack>
                </CardHeader>

                <CardBody>
                  <HStack gap="small" align="center" style={{ color: "var(--color-text-tertiary)" }}>
                    <Users size={18} />
                    <span>
                      {capacity.remainingSeats} seat{capacity.remainingSeats === 1 ? "" : "s"} remaining of {capacity.maxStudentCount}
                    </span>
                  </HStack>
                </CardBody>

                <CardFooter>
                  <Button
                    variant={isSelected ? "secondary" : "primary"}
                    fullWidth
                    disabled={isFull || isSelecting || isSelected}
                    loading={isSelecting}
                    onClick={() => onSelect(capacity)}
                  >
                    {isSelected ? "Selected" : isFull ? "Full" : "Select Caterer"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </VStack>
    </Modal>
  )
}

const DiningPage = () => {
  const [portalState, setPortalState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectingCatererId, setSelectingCatererId] = useState("")
  const [showAllocationModal, setShowAllocationModal] = useState(false)
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
    return [activeAllocationPeriod, upcomingAllocationPeriod].find((period) => (
      period?.selectedAllocation && getPeriodId(period) !== currentId
    )) || null
  }, [activeAllocationPeriod, currentPeriod, upcomingAllocationPeriod])

  const fetchPortalState = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true)
      else setLoading(true)
      const response = await studentApi.getDiningPortalState()
      setPortalState(response || null)
      setError("")

      if (!response?.canSelect) {
        setShowAllocationModal(false)
      }
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Unable to load dining allocation details."))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPortalState()

    const intervalId = window.setInterval(() => {
      fetchPortalState({ silent: true })
    }, REFRESH_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  const handleSelectCaterer = async (capacity) => {
    const catererName = capacity.caterer?.name || "this caterer"
    const confirmed = window.confirm(`Confirm ${catererName} as your dining caterer for this period?`)
    if (!confirmed) return

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
        {error && (
          <div className="mb-[var(--spacing-4)]">
            <Alert type="error" icon>{error}</Alert>
          </div>
        )}

        {successMessage && (
          <div className="mb-[var(--spacing-4)]">
            <Alert type="success" icon>{successMessage}</Alert>
          </div>
        )}

        <VStack gap="large">
          <DiningStatusCard
            title="Current Caterer"
            subtitle={currentPeriod ? formatPeriodRange(currentPeriod) : "No current dining period is active right now"}
            icon={UtensilsCrossed}
            tone={currentPeriod?.selectedAllocation ? "success" : "primary"}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-3)" }}>
              <InfoTile label="Caterer" value={currentPeriod?.selectedAllocation?.caterer?.name || "Not available"} />
              <InfoTile label="Email" value={currentPeriod?.selectedAllocation?.caterer?.email || "-"} />
              <InfoTile label="Selected On" value={formatDateTime(currentPeriod?.selectedAllocation?.selectedAt)} />
            </div>

            {canSelect && (
              <div style={{ marginTop: "var(--spacing-5)" }}>
                <Button variant="primary" onClick={() => setShowAllocationModal(true)}>
                  <UtensilsCrossed size={18} /> Select Caterer for New Allocation
                </Button>
              </div>
            )}
          </DiningStatusCard>

          {selectedUpcomingPeriod && (
            <DiningStatusCard
              title="Selected Caterer for Next Period"
              subtitle={formatPeriodRange(selectedUpcomingPeriod)}
              icon={CheckCircle2}
              tone="success"
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-3)" }}>
                <InfoTile label="Caterer" value={selectedUpcomingPeriod.selectedAllocation?.caterer?.name} />
                <InfoTile label="Email" value={selectedUpcomingPeriod.selectedAllocation?.caterer?.email} />
                <InfoTile label="Selected On" value={formatDateTime(selectedUpcomingPeriod.selectedAllocation?.selectedAt)} />
              </div>
            </DiningStatusCard>
          )}

          {activeAllocationPeriod && !activeAllocationPeriod.selectedAllocation && (
            <DiningStatusCard
              title="Allocation Window Open"
              subtitle={`Selection closes at ${formatDateTime(activeAllocationPeriod.allocationEndAt)}`}
              icon={Clock}
              tone="warning"
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-3)" }}>
                <InfoTile label="Dining Period" value={formatPeriodRange(activeAllocationPeriod)} />
                <InfoTile label="Selection Window" value={`${formatDateTime(activeAllocationPeriod.allocationStartAt)} to ${formatDateTime(activeAllocationPeriod.allocationEndAt)}`} />
              </div>
            </DiningStatusCard>
          )}

          {upcomingAllocationPeriod && !activeAllocationPeriod && (
            <DiningStatusCard
              title="Upcoming Allocation"
              subtitle={`Selection opens at ${formatDateTime(upcomingAllocationPeriod.allocationStartAt)}`}
              icon={CalendarDays}
              tone="primary"
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-3)" }}>
                <InfoTile label="Dining Period" value={formatPeriodRange(upcomingAllocationPeriod)} />
                <InfoTile label="Selection Window" value={`${formatDateTime(upcomingAllocationPeriod.allocationStartAt)} to ${formatDateTime(upcomingAllocationPeriod.allocationEndAt)}`} />
              </div>
            </DiningStatusCard>
          )}

          {!currentPeriod && !activeAllocationPeriod && !upcomingAllocationPeriod && (
            <DiningStatusCard
              title="No Dining Allocation Scheduled"
              subtitle={portalState?.message || "There is no active or upcoming dining allocation window right now."}
              icon={CalendarDays}
            >
              <Alert type="info" icon>
                Please check back later. Any future dining allocation window will appear here automatically.
              </Alert>
            </DiningStatusCard>
          )}
        </VStack>
      </div>

      <CatererSelectionModal
        isOpen={showAllocationModal && canSelect}
        period={activeAllocationPeriod}
        selectedCatererId={activeSelectedCatererId}
        selectingCatererId={selectingCatererId}
        onClose={() => setShowAllocationModal(false)}
        onSelect={handleSelectCaterer}
      />
    </div>
  )
}

export default DiningPage
