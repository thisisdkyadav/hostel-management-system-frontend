import { useEffect, useState } from "react"
import { Button } from "czero/react"
import { HStack, Modal, Surface, Text, VStack } from "@/components/ui"
import { Radio, Trash2, ShieldCheck, ShieldAlert } from "lucide-react"
import { useSocket } from "@/contexts/SocketProvider"

const MAX_EVENTS = 50

const formatTime = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return String(iso || "")
  const time = date.toLocaleTimeString([], { hour12: false })
  return `${time}.${String(date.getMilliseconds()).padStart(3, "0")}`
}

const Pill = ({ children, color, bg }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--spacing-1)",
      padding: "2px var(--spacing-2)",
      borderRadius: "var(--radius-full)",
      fontSize: "var(--font-size-xs)",
      fontWeight: "var(--font-weight-semibold)",
      color,
      backgroundColor: bg,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
)

const codeBlock = {
  margin: 0,
  padding: "var(--spacing-3)",
  borderRadius: "var(--radius-md)",
  backgroundColor: "var(--color-bg-secondary)",
  border: "1px solid var(--color-border-primary)",
  color: "var(--color-text-secondary)",
  fontSize: "var(--font-size-xs)",
  fontFamily: "var(--font-family-mono, monospace)",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  overflowX: "auto",
}

const ScanEventRow = ({ event, showHeaders }) => {
  const authOk = Boolean(event.authSuccess)
  return (
    <div
      style={{
        border: `1px solid ${authOk ? "var(--color-success)" : "var(--color-danger)"}`,
        borderLeftWidth: 4,
        borderRadius: "var(--radius-lg)",
        padding: "var(--spacing-3)",
        backgroundColor: "var(--color-bg-primary)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-2)",
      }}
    >
      <HStack gap={2} align="center" wrap>
        {authOk ? (
          <Pill color="var(--color-success)" bg="var(--color-success-bg, rgba(34,197,94,0.12))">
            <ShieldCheck size={13} /> AUTH OK
          </Pill>
        ) : (
          <Pill color="var(--color-danger)" bg="var(--color-danger-bg, rgba(239,68,68,0.12))">
            <ShieldAlert size={13} /> AUTH FAILED
          </Pill>
        )}

        <Text as="span" weight="semibold" color="secondary">
          {event.scanner?.name || "Unrecognized device"}
        </Text>

        {event.scanner?.type && (
          <Pill color="var(--color-text-muted)" bg="var(--color-bg-hover)">
            {event.scanner.type}
            {event.scanner.direction ? ` · ${event.scanner.direction}` : ""}
          </Pill>
        )}

        {event.authMethod && (
          <Pill color="var(--color-primary)" bg="var(--color-primary-bg, rgba(59,130,246,0.12))">
            {event.authMethod === "basic" ? "Basic Auth" : "Header Auth"}
          </Pill>
        )}

        <Text as="span" size="xs" color="muted" style={{ marginLeft: "auto", fontFamily: "var(--font-family-mono, monospace)" }}>
          {formatTime(event.timestamp)}
        </Text>
      </HStack>

      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
        <Text as="span" weight="semibold" color="secondary">{event.method}</Text>
        <span style={{ fontFamily: "var(--font-family-mono, monospace)" }}>{event.path}</span>
        {event.ip && <span>· {event.ip}</span>}
      </div>

      <div>
        <span style={{ display: "block", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginBottom: "var(--spacing-1)" }}>Body</span>
        <pre style={codeBlock}>{JSON.stringify(event.body ?? null, null, 2)}</pre>
      </div>

      {showHeaders && (
        <div>
          <span style={{ display: "block", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginBottom: "var(--spacing-1)" }}>Headers</span>
          <pre style={codeBlock}>{JSON.stringify(event.headers ?? {}, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

/**
 * Live monitor for incoming face-scanner REST hits. Streams the raw request
 * body, matched scanner, and auth outcome over Socket.IO (event
 * `face-scanner:live`) — nothing is read from the database. The advanced
 * toggle additionally reveals the request headers (which carry the credentials).
 */
const LiveScanMonitorModal = ({ isOpen, onClose }) => {
  const { socket, isConnected } = useSocket()
  const [events, setEvents] = useState([])
  const [showHeaders, setShowHeaders] = useState(false)

  useEffect(() => {
    if (!isOpen || !socket) return undefined
    const handler = (event) => {
      setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS))
    }
    socket.on("face-scanner:live", handler)
    return () => socket.off("face-scanner:live", handler)
  }, [isOpen, socket])

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Scan Monitor"
      width={760}
      footer={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", width: "100%" }}>
          <Text as="span" size="xs" color="muted">
            {events.length} event{events.length === 1 ? "" : "s"} · newest first · keeps last {MAX_EVENTS}
          </Text>
          <HStack gap={2}>
            <Button variant="secondary" onClick={() => setEvents([])} disabled={events.length === 0}>
              <Trash2 size={16} /> Clear
            </Button>
            <Button variant="primary" onClick={onClose}>Close</Button>
          </HStack>
        </div>
      }
    >
      <VStack gap={3}>
        {/* Status + advanced toggle */}
        <HStack gap={3} align="center" justify="between" wrap>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            <Radio size={16} style={{ color: isConnected ? "var(--color-success)" : "var(--color-danger)" }} />
            {isConnected ? "Listening for live scans…" : "Socket disconnected"}
          </span>
          <Button
            variant={showHeaders ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowHeaders((value) => !value)}
            title="Advanced: reveal request header values (includes credentials)"
          >
            Show Headers: {showHeaders ? "On" : "Off"}
          </Button>
        </HStack>

        {/* Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", maxHeight: "56vh", overflowY: "auto" }}>
          {events.length === 0 ? (
            <Surface padding={6} radius="lg" border="1px dashed var(--color-border-input)" color="muted" size="sm" align="center">
              Waiting for incoming scans… Trigger a punch on the device, or POST to
              <br />
              <code style={{ fontFamily: "var(--font-family-mono, monospace)" }}>/api/v1/face-scanner/scan</code>
            </Surface>
          ) : (
            events.map((event) => <ScanEventRow key={event.id} event={event} showHeaders={showHeaders} />)
          )}
        </div>
      </VStack>
    </Modal>
  )
}

export default LiveScanMonitorModal
