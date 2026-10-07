import { useEffect, useMemo, useState } from "react"
import { Alert, Avatar, Button, Card, EmptyState, Field, Heading, HStack, Input, Page, StatusBadge, Table, Tabs, Text, VStack } from "hzero"
import { Clock, RefreshCw, Search } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { catererApi } from "../../service"
import { useSocket } from "../../contexts/SocketProvider"
import { getMediaUrl } from "../../utils/mediaUtils"

const STATUS_LABELS = {
  verified: "Verified",
  duplicate: "Duplicate",
  "wrong-caterer": "Wrong Caterer",
  "not-allocated": "Not Allocated",
  "unknown-student": "Unknown Student",
  "outside-meal-time": "Outside Meal Time",
  "no-active-period": "No Active Period",
  "on-rebate": "On Rebate",
}

const STATUS_TONES = {
  verified: "success",
  duplicate: "warning",
  "wrong-caterer": "danger",
  "not-allocated": "danger",
  "unknown-student": "danger",
  "outside-meal-time": "warning",
  "no-active-period": "warning",
  "on-rebate": "warning",
}

const STATUS_ROW_BACKGROUNDS = {
  verified: "var(--color-bg-primary)",
  duplicate: "color-mix(in srgb, var(--color-warning) 4%, var(--color-bg-primary))",
  "outside-meal-time": "color-mix(in srgb, var(--color-warning) 4%, var(--color-bg-primary))",
}

const formatTime = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

const LiveIndicator = ({ connected }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1-5)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: connected ? "var(--color-success)" : "var(--color-text-muted)" }}>
    <span
      className={connected ? "animate-pulse" : ""}
      style={{ width: 8, height: 8, borderRadius: "var(--radius-full)", backgroundColor: connected ? "var(--color-success)" : "var(--color-text-placeholder)" }}
    />
    {connected ? "Live" : "Offline"}
  </span>
)

const getErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback

const fetchFeedEntries = async () => {
  const response = await catererApi.getMealVerificationFeed({ limit: 50 })
  return Array.isArray(response?.entries) ? response.entries : []
}

const MealVerificationPage = () => {
  const { socket, isConnected } = useSocket()
  const [entries, setEntries] = useState([])
  const [feedFilter, setFeedFilter] = useState("all")
  const [rollNumber, setRollNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [manualLoading, setManualLoading] = useState(false)
  const [showManualVerification, setShowManualVerification] = useState(false)
  const [feedError, setFeedError] = useState("")
  const [manualError, setManualError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const issuesCount = useMemo(() => entries.filter((entry) => entry.status !== "verified").length, [entries])
  const visibleEntries = useMemo(
    () => (feedFilter === "issues" ? entries.filter((entry) => entry.status !== "verified") : entries),
    [entries, feedFilter]
  )

  const refreshFeed = async () => {
    setLoading(true)
    setFeedError("")
    try {
      setEntries(await fetchFeedEntries())
    } catch (refreshError) {
      setFeedError(getErrorMessage(refreshError, "Unable to load the live verification feed."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    fetchFeedEntries()
      .then((feedEntries) => { if (active) setEntries(feedEntries) })
      .catch((error) => { if (active) setFeedError(getErrorMessage(error, "Unable to load the live verification feed.")) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!socket) return undefined
    const handleNewVerification = (payload) => {
      const verification = payload?.verification
      if (!verification) return
      setEntries((prev) => {
        if (prev.some((entry) => entry.id === verification.id)) return prev
        return [verification, ...prev].slice(0, 50)
      })
    }
    socket.on("dining-meal-verification:new", handleNewVerification)
    return () => socket.off("dining-meal-verification:new", handleNewVerification)
  }, [socket])

  const handleManualVerify = async (event) => {
    event.preventDefault()
    if (!rollNumber.trim()) {
      setManualError("Please enter a roll number.")
      return
    }
    setManualLoading(true)
    setManualError("")
    setSuccessMessage("")
    try {
      const response = await catererApi.manualMealVerification({ rollNumber: rollNumber.trim() })
      const verification = response?.verification
      if (verification) {
        setEntries((prev) => [verification, ...prev.filter((entry) => entry.id !== verification.id)].slice(0, 50))
      }
      setSuccessMessage(response?.verification?.message || "Manual meal verification recorded.")
      setRollNumber("")
    } catch (manualError) {
      setManualError(getErrorMessage(manualError, "Unable to verify meal manually."))
    } finally {
      setManualLoading(false)
    }
  }

  return (
    <Page>
      <PageHeader title="Meal Verification">
        <HStack gap="small">
          <Button
            variant="secondary"
            onClick={() => setShowManualVerification((visible) => !visible)}
            aria-expanded={showManualVerification}
            aria-controls="manual-verification"
          >
            <Search size={18} /> {showManualVerification ? "Hide Manual Verification" : "Manual Verification"}
          </Button>
          <Button variant="secondary" onClick={refreshFeed} disabled={loading}>
            <RefreshCw size={18} /> {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </HStack>
      </PageHeader>

      <Page.Body>
        <VStack gap="large">
          {showManualVerification && (
            <Card id="manual-verification">
              <VStack gap="medium">
                {manualError && <Alert type="error" icon dismissible onDismiss={() => setManualError("")}>{manualError}</Alert>}
                {successMessage && <Alert type="success" icon dismissible onDismiss={() => setSuccessMessage("")}>{successMessage}</Alert>}
                <form onSubmit={handleManualVerify}>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-[var(--spacing-3)] items-end">
                    <Field label="Manual Verification" htmlFor="manual-roll" required>
                      <Input id="manual-roll" value={rollNumber} onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                        placeholder="Enter roll number, e.g. 22BCS001" required />
                    </Field>
                    <Button type="submit" variant="primary" loading={manualLoading} disabled={manualLoading}>
                      <Search size={18} /> Verify Meal
                    </Button>
                  </div>
                </form>
              </VStack>
            </Card>
          )}

          {/* Live feed */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            {feedError && <Alert type="error" icon dismissible onDismiss={() => setFeedError("")}>{feedError}</Alert>}
            <HStack gap={3} align="center" justify="between" wrap>
              <HStack gap={2} align="center">
                <Heading as="h3" size="md" weight="bold" color="heading" style={{ margin: 0 }}>Live Verification Feed</Heading>
                <LiveIndicator connected={isConnected} />
              </HStack>
              <Tabs
                variant="pills"
                size="sm"
                tabs={[
                  { value: "all", label: "All", count: entries.length || undefined },
                  { value: "issues", label: "Issues", count: issuesCount || undefined },
                ]}
                activeTab={feedFilter}
                setActiveTab={setFeedFilter}
              />
            </HStack>

            {visibleEntries.length === 0 ? (
              <EmptyState
                icon={Search}
                title={feedFilter === "issues" ? "No Issues" : "No Scans Yet"}
                message={feedFilter === "issues" ? "Failed or flagged scans will appear here." : "Face scanner and manual verification attempts will appear here in real time."}
              />
            ) : (
              <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-primary)]">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Time</Table.Head>
                      <Table.Head width="var(--spacing-20)" style={{ paddingInline: "var(--spacing-2)" }}>Photo</Table.Head>
                      <Table.Head>Student</Table.Head>
                      <Table.Head>Meal</Table.Head>
                      <Table.Head>Status</Table.Head>
                      <Table.Head>Source</Table.Head>
                      <Table.Head>Message</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {visibleEntries.map((entry) => (
                      <Table.Row key={entry.id} style={{ backgroundColor: STATUS_ROW_BACKGROUNDS[entry.status] || "color-mix(in srgb, var(--color-danger) 4%, var(--color-bg-primary))" }}>
                        <Table.Cell>
                          <HStack gap="small" align="center">
                            <Clock size={14} style={{ color: "var(--color-text-muted)" }} />
                            {formatTime(entry.scannedAt)}
                          </HStack>
                        </Table.Cell>
                        <Table.Cell style={{ position: "relative", width: "var(--spacing-20)", minWidth: "var(--spacing-20)", padding: 0 }}>
                          <Avatar
                            src={entry.student?.profileImage ? getMediaUrl(entry.student.profileImage) : undefined}
                            name={entry.student?.name || "Unknown Student"}
                            alt={`${entry.student?.name || "Unknown Student"} profile photo`}
                            shape="square"
                            size="large"
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Text as="div" weight="semibold" color="secondary">{entry.student?.name || "Unknown Student"}</Text>
                          <Text as="div" color="muted" size="sm">{entry.rollNumber}</Text>
                        </Table.Cell>
                        <Table.Cell>{entry.mealSlotName || "-"}</Table.Cell>
                        <Table.Cell>
                          <StatusBadge status={STATUS_LABELS[entry.status] || entry.status} tone={STATUS_TONES[entry.status] || "primary"} />
                        </Table.Cell>
                        <Table.Cell>{entry.source === "manual" ? "Manual" : "Face Scanner"}</Table.Cell>
                        <Table.Cell>{entry.message || "-"}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </Card>
        </VStack>
      </Page.Body>
    </Page>
  )
}

export default MealVerificationPage
