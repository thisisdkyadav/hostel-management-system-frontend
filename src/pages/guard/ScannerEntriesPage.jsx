import React, { useState } from "react"
import { FaQrcode, FaExclamationTriangle, FaCheck, FaTimes, FaHistory, FaKeyboard, FaArrowDown, FaArrowRight, FaInfoCircle } from "react-icons/fa"
import { useQRScanner } from "../../contexts/QRScannerProvider"
import { Button, StatusBadge, Table } from "czero/react"
import { getMediaUrl } from "../../utils/mediaUtils"
import { Heading, HStack, IconCircle, Spinner, Surface, Text } from "@/components/ui"

const ScannerEntriesPage = () => {
  const { scannerEntries, pendingCrossHostelEntries, loading, error, fetchScannerEntries, updateCrossHostelReason } = useQRScanner()
  const [reasonInputs, setReasonInputs] = useState({})
  const [updatingReasons, setUpdatingReasons] = useState({})

  const handleReasonChange = (entryId, reason) => setReasonInputs((prev) => ({ ...prev, [entryId]: reason }))

  const handleUpdateReason = async (entry) => {
    const reason = reasonInputs[entry._id]
    if (!reason || !reason.trim()) return alert("Please provide a reason for the cross-hostel entry")
    try {
      setUpdatingReasons((prev) => ({ ...prev, [entry._id]: true }))
      await updateCrossHostelReason(entry._id, reason.trim())
      setReasonInputs((prev) => { const n = { ...prev }; delete n[entry._id]; return n })
    } catch (err) { alert("Failed to update reason: " + err.message) }
    finally { setUpdatingReasons((prev) => { const n = { ...prev }; delete n[entry._id]; return n }) }
  }

  const formatDateTime = (dt) => ({ date: new Date(dt).toLocaleDateString(), time: new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })

  const CrossHostelReasonCard = ({ entry }) => {
    const isUpdating = updatingReasons[entry._id], currentReason = reasonInputs[entry._id] || ""
    return (
      <Surface bg="var(--color-warning-bg-light)" padding={4} radius="lg" border="var(--border-2) solid var(--color-warning)" style={{ marginBottom: "var(--spacing-4)" }}>
        <HStack gap="none" align="start">
          <FaExclamationTriangle style={{ height: "var(--icon-xl)", width: "var(--icon-xl)", color: "var(--color-warning)", marginTop: "var(--spacing-0-5)", flexShrink: 0 }} />
          <div style={{ marginLeft: "var(--spacing-3)", flex: 1 }}>
            <Heading as="h3" size="lg" weight="semibold" color="warning-text" style={{ marginBottom: "var(--spacing-2)" }}>Cross-Hostel Entry Requires Reason</Heading>
            <HStack gap="none" align="center" style={{ marginBottom: "var(--spacing-3)" }}>
              <IconCircle size="var(--icon-4xl)" bg="muted" style={{ overflow: "hidden", marginRight: "var(--spacing-3)" }}>
                {entry.userId.profileImage ? <img src={getMediaUrl(entry.userId.profileImage)} alt={entry.userId.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-info-bg-light)" }}><FaQrcode style={{ color: "var(--color-info)", width: "var(--icon-xl)", height: "var(--icon-xl)" }} /></div>}
              </IconCircle>
              <div>
                <Text weight="medium" color="primary">{entry.userId.name}</Text>
                <Text size="sm" color="muted">{entry.userId.rollNumber}</Text>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}><span>Room: {entry.room}{entry.bed}</span><StatusBadge status={entry.status} /></div>
              </div>
            </HStack>
            <Text color="warning-text" size="sm" style={{ marginBottom: "var(--spacing-3)" }}>This student belongs to a different hostel. Please provide a reason for allowing this check-in entry.</Text>
            <div style={{ marginBottom: "var(--spacing-3)" }}>
              <label htmlFor={`reason-${entry._id}`} style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-warning-text)", marginBottom: "var(--spacing-1)" }}>Reason for Cross-Hostel Check-In <Text as="span" color="danger">*</Text></label>
              <textarea id={`reason-${entry._id}`} value={currentReason} onChange={(e) => handleReasonChange(entry._id, e.target.value)} placeholder="Enter reason..." style={{ width: "100%", padding: "var(--spacing-2) var(--spacing-3)", border: "var(--border-1) solid var(--color-warning-light)", borderRadius: "var(--radius-md)", fontSize: "var(--font-size-sm)" }} rows="3" disabled={isUpdating} data-no-scanner="true" />
            </div>
            <Button onClick={() => handleUpdateReason(entry)} disabled={!currentReason.trim() || isUpdating} variant="warning" size="sm" loading={isUpdating}>
              {isUpdating ? null : <FaCheck />} {isUpdating ? "Updating..." : "Add Check-In Reason"}
            </Button>
          </div>
        </HStack>
      </Surface>
    )
  }

  return (
    <Surface bg="var(--color-bg-page)" padding="var(--spacing-6) var(--spacing-4)">
      <div style={{ maxWidth: "var(--container-xl)", margin: "0 auto" }}>
        <div style={{ marginBottom: "var(--spacing-6)" }}>
          <Heading as="h1" size="3xl" weight="bold" color="secondary" style={{ marginBottom: "var(--spacing-2)" }}>External QR Scanner Entries</Heading>
          <Text size="base" color="muted">Entries recorded from external QR scanners with keyboard input.</Text>
        </div>
        <Surface bg="var(--color-info-bg-light)" padding={4} radius="lg" style={{ marginBottom: "var(--spacing-6)", borderLeft: "var(--border-4) solid var(--color-primary)" }}>
          <HStack gap="none" align="start">
            <FaInfoCircle style={{ color: "var(--color-primary)", marginTop: "var(--spacing-0-5)", marginRight: "var(--spacing-3)", flexShrink: 0 }} />
            <div>
              <Text size="sm" color="body" weight="medium" style={{ marginBottom: "var(--spacing-2)" }}>External QR Scanner Instructions:</Text>
              <Text as="div" size="sm" color="muted" className="info-grid">
                <HStack gap="none" align="center"><FaKeyboard style={{ marginRight: "var(--spacing-2)", color: "var(--color-primary)" }} /><span>Check-in Scanner: Ends with</span><FaArrowDown style={{ margin: "0 var(--spacing-2)", color: "var(--color-success)" }} /><span>(Down Arrow)</span></HStack>
                <HStack gap="none" align="center"><FaKeyboard style={{ marginRight: "var(--spacing-2)", color: "var(--color-primary)" }} /><span>Check-out Scanner: Ends with</span><FaArrowRight style={{ margin: "0 var(--spacing-2)", color: "var(--color-warning)", transform: "rotate(90deg)" }} /><span>(Tab Key)</span></HStack>
              </Text>
            </div>
          </HStack>
        </Surface>
        {error && <div style={{ marginBottom: "var(--spacing-4)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger-text)", padding: "var(--spacing-3)", borderRadius: "var(--radius-lg)", borderLeft: "var(--border-4) solid var(--color-danger)", display: "flex", alignItems: "flex-start" }}><FaTimes style={{ marginRight: "var(--spacing-2)", marginTop: "var(--spacing-0-5)", flexShrink: 0 }} /><Text size="sm">{error}</Text></div>}
        {pendingCrossHostelEntries.length > 0 && (
          <div style={{ marginBottom: "var(--spacing-8)" }}>
            <h2 style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-4)", display: "flex", alignItems: "center" }}><FaExclamationTriangle style={{ color: "var(--color-warning)", marginRight: "var(--spacing-2)" }} />Pending Cross-Hostel Check-In Entries ({pendingCrossHostelEntries.length})</h2>
            {pendingCrossHostelEntries.map((entry) => <CrossHostelReasonCard key={entry._id} entry={entry} />)}
          </div>
        )}
        <Surface bg="primary" padding={6} radius="xl" shadow="sm" border="var(--border-1) solid var(--color-border-light)">
          <HStack gap="none" align="center" justify="between" style={{ marginBottom: "var(--spacing-4)" }}>
            <HStack gap="none" align="center">
              <div style={{ padding: "var(--spacing-2-5)", marginRight: "var(--spacing-3)", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-info-bg)", color: "var(--color-primary)" }}><FaHistory size={20} /></div>
              <Heading as="h2" size="2xl" weight="bold" color="secondary">Recent Scanner Entries</Heading>
            </HStack>
            <Button onClick={fetchScannerEntries} disabled={loading} variant="primary" size="sm" loading={loading}>
              {loading ? null : <FaHistory />} {loading ? "Loading..." : "Refresh"}
            </Button>
          </HStack>
          {loading && scannerEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--spacing-8)" }}><Spinner size="var(--icon-4xl)" thickness="thick" style={{ margin: "0 auto var(--spacing-4)" }} /><Text color="muted">Loading scanner entries...</Text></div>
          ) : scannerEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--spacing-8)" }}><FaQrcode style={{ width: "var(--icon-4xl)", height: "var(--icon-4xl)", color: "var(--color-text-disabled)", margin: "0 auto var(--spacing-4)" }} /><Text color="muted" size="lg">No scanner entries found</Text><Text color="light" size="sm" style={{ marginTop: "var(--spacing-2)" }}>Entries will appear here when scanned with external QR scanners</Text></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <Table>
                <Table.Header>
                  <Table.Row>{["Student", "Room", "Date", "Time", "Status", "Scanner", "Cross-Hostel"].map((h) => <Table.Head key={h}>{h}</Table.Head>)}</Table.Row>
                </Table.Header>
                <Table.Body>
                  {scannerEntries.map((entry) => {
                    const { date, time } = formatDateTime(entry.dateAndTime)
                    return (
                      <Table.Row className="table-row-hover" key={entry._id}>
                        <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                          <HStack gap="none" align="center">
                            <IconCircle size="var(--avatar-md)" bg="muted" style={{ overflow: "hidden", marginRight: "var(--spacing-3)" }}>
                              {entry.userId.profileImage ? <img src={getMediaUrl(entry.userId.profileImage)} alt={entry.userId.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-info-bg-light)" }}><FaQrcode style={{ color: "var(--color-info)", width: "var(--icon-lg)", height: "var(--icon-lg)" }} /></div>}
                            </IconCircle>
                            <div><Text as="div" size="sm" weight="medium" color="primary">{entry.userId.name}</Text><Text as="div" size="sm" color="muted">{entry.userId.email}</Text></div>
                          </HStack>
                        </Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}><Text as="div" size="sm" color="muted">{entry.room}{entry.bed}-{entry.unit}</Text><Text as="div" size="xs" color="light">{entry.hostelName}</Text></Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)", fontSize: "var(--font-size-sm)" }}>{date}</Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)", fontSize: "var(--font-size-sm)" }}>{time}</Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}><StatusBadge status={entry.status} /></Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                          <div style={{ display: "flex", alignItems: "center", fontSize: "var(--font-size-sm)" }}>
                            {entry.scannerType === "checkin" ? <div style={{ display: "flex", alignItems: "center", color: "var(--color-success)" }}><FaArrowDown style={{ marginRight: "var(--spacing-1)" }} /><span>Check-in</span></div> : entry.scannerType === "checkout" ? <div style={{ display: "flex", alignItems: "center", color: "var(--color-warning)" }}><FaArrowRight style={{ marginRight: "var(--spacing-1)", transform: "rotate(90deg)" }} /><span>Check-out</span></div> : <Text as="span" color="muted">Auto</Text>}
                          </div>
                        </Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                          {entry.isSameHostel === false ? <HStack gap="none" align="center"><FaExclamationTriangle style={{ color: "var(--color-warning)", marginRight: "var(--spacing-1)" }} /><Text as="span" size="sm" color="warning">Yes</Text>{entry.reason && <Text as="div" size="xs" color="muted" style={{ marginLeft: "var(--spacing-2)" }} title={entry.reason}>(Reason provided)</Text>}</HStack> : <Text as="span" size="sm" color="muted">No</Text>}
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table>
            </div>
          )}
        </Surface>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .info-grid { display: grid; grid-template-columns: 1fr; gap: var(--spacing-4); } @media (min-width: 768px) { .info-grid { grid-template-columns: 1fr 1fr; } } .table-row-hover:hover { background-color: var(--table-row-hover); }`}</style>
    </Surface>
  )
}

export default ScannerEntriesPage

