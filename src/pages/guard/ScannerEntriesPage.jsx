import React, { useState } from "react"
import { FaQrcode, FaExclamationTriangle, FaCheck, FaTimes, FaHistory, FaKeyboard, FaArrowDown, FaArrowRight, FaInfoCircle } from "react-icons/fa"
import { useQRScanner } from "../../contexts/QRScannerProvider"
import { StatusBadge } from "@/components/ui"
import { Button } from "czero/react"
import { getMediaUrl } from "../../utils/mediaUtils"

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
      <div style={{ backgroundColor: "var(--color-warning-bg-light)", border: "var(--border-2) solid var(--color-warning)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-4)", marginBottom: "var(--spacing-4)" }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <FaExclamationTriangle style={{ height: "var(--icon-xl)", width: "var(--icon-xl)", color: "var(--color-warning)", marginTop: "var(--spacing-0-5)", flexShrink: 0 }} />
          <div style={{ marginLeft: "var(--spacing-3)", flex: 1 }}>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-warning-text)", marginBottom: "var(--spacing-2)" }}>Cross-Hostel Entry Requires Reason</h3>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)" }}>
              <div style={{ width: "var(--icon-4xl)", height: "var(--icon-4xl)", borderRadius: "var(--radius-full)", overflow: "hidden", backgroundColor: "var(--color-bg-muted)", marginRight: "var(--spacing-3)" }}>
                {entry.userId.profileImage ? <img src={getMediaUrl(entry.userId.profileImage)} alt={entry.userId.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-info-bg-light)" }}><FaQrcode style={{ color: "var(--color-info)", width: "var(--icon-xl)", height: "var(--icon-xl)" }} /></div>}
              </div>
              <div>
                <p style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{entry.userId.name}</p>
                <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{entry.userId.rollNumber}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}><span>Room: {entry.room}{entry.bed}</span><StatusBadge status={entry.status} /></div>
              </div>
            </div>
            <p style={{ color: "var(--color-warning-text)", fontSize: "var(--font-size-sm)", marginBottom: "var(--spacing-3)" }}>This student belongs to a different hostel. Please provide a reason for allowing this check-in entry.</p>
            <div style={{ marginBottom: "var(--spacing-3)" }}>
              <label htmlFor={`reason-${entry._id}`} style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-warning-text)", marginBottom: "var(--spacing-1)" }}>Reason for Cross-Hostel Check-In <span style={{ color: "var(--color-danger)" }}>*</span></label>
              <textarea id={`reason-${entry._id}`} value={currentReason} onChange={(e) => handleReasonChange(entry._id, e.target.value)} placeholder="Enter reason..." style={{ width: "100%", padding: "var(--spacing-2) var(--spacing-3)", border: "var(--border-1) solid var(--color-warning-light)", borderRadius: "var(--radius-md)", fontSize: "var(--font-size-sm)" }} rows="3" disabled={isUpdating} data-no-scanner="true" />
            </div>
            <Button onClick={() => handleUpdateReason(entry)} disabled={!currentReason.trim() || isUpdating} variant="warning" size="sm" loading={isUpdating}>
              {isUpdating ? null : <FaCheck />} {isUpdating ? "Updating..." : "Add Check-In Reason"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-4)", backgroundColor: "var(--color-bg-page)" }}>
      <div style={{ maxWidth: "var(--container-xl)", margin: "0 auto" }}>
        <div style={{ marginBottom: "var(--spacing-6)" }}>
          <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" }}>External QR Scanner Entries</h1>
          <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-muted)" }}>Entries recorded from external QR scanners with keyboard input.</p>
        </div>
        <div style={{ marginBottom: "var(--spacing-6)", backgroundColor: "var(--color-info-bg-light)", padding: "var(--spacing-4)", borderRadius: "var(--radius-lg)", borderLeft: "var(--border-4) solid var(--color-primary)" }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <FaInfoCircle style={{ color: "var(--color-primary)", marginTop: "var(--spacing-0-5)", marginRight: "var(--spacing-3)", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>External QR Scanner Instructions:</p>
              <div className="info-grid" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                <div style={{ display: "flex", alignItems: "center" }}><FaKeyboard style={{ marginRight: "var(--spacing-2)", color: "var(--color-primary)" }} /><span>Check-in Scanner: Ends with</span><FaArrowDown style={{ margin: "0 var(--spacing-2)", color: "var(--color-success)" }} /><span>(Down Arrow)</span></div>
                <div style={{ display: "flex", alignItems: "center" }}><FaKeyboard style={{ marginRight: "var(--spacing-2)", color: "var(--color-primary)" }} /><span>Check-out Scanner: Ends with</span><FaArrowRight style={{ margin: "0 var(--spacing-2)", color: "var(--color-warning)", transform: "rotate(90deg)" }} /><span>(Tab Key)</span></div>
              </div>
            </div>
          </div>
        </div>
        {error && <div style={{ marginBottom: "var(--spacing-4)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger-text)", padding: "var(--spacing-3)", borderRadius: "var(--radius-lg)", borderLeft: "var(--border-4) solid var(--color-danger)", display: "flex", alignItems: "flex-start" }}><FaTimes style={{ marginRight: "var(--spacing-2)", marginTop: "var(--spacing-0-5)", flexShrink: 0 }} /><p style={{ fontSize: "var(--font-size-sm)" }}>{error}</p></div>}
        {pendingCrossHostelEntries.length > 0 && (
          <div style={{ marginBottom: "var(--spacing-8)" }}>
            <h2 style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-4)", display: "flex", alignItems: "center" }}><FaExclamationTriangle style={{ color: "var(--color-warning)", marginRight: "var(--spacing-2)" }} />Pending Cross-Hostel Check-In Entries ({pendingCrossHostelEntries.length})</h2>
            {pendingCrossHostelEntries.map((entry) => <CrossHostelReasonCard key={entry._id} entry={entry} />)}
          </div>
        )}
        <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-xl)", padding: "var(--spacing-6)", boxShadow: "var(--shadow-sm)", border: "var(--border-1) solid var(--color-border-light)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--spacing-4)" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ padding: "var(--spacing-2-5)", marginRight: "var(--spacing-3)", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-info-bg)", color: "var(--color-primary)" }}><FaHistory size={20} /></div>
              <h2 style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)" }}>Recent Scanner Entries</h2>
            </div>
            <Button onClick={fetchScannerEntries} disabled={loading} variant="primary" size="sm" loading={loading}>
              {loading ? null : <FaHistory />} {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
          {loading && scannerEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--spacing-8)" }}><div style={{ width: "var(--icon-4xl)", height: "var(--icon-4xl)", border: "var(--border-4) solid var(--color-primary)", borderTop: "var(--border-4) solid transparent", borderRadius: "var(--radius-full)", animation: "spin 1s linear infinite", margin: "0 auto var(--spacing-4)" }}></div><p style={{ color: "var(--color-text-muted)" }}>Loading scanner entries...</p></div>
          ) : scannerEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--spacing-8)" }}><FaQrcode style={{ width: "var(--icon-4xl)", height: "var(--icon-4xl)", color: "var(--color-text-disabled)", margin: "0 auto var(--spacing-4)" }} /><p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-lg)" }}>No scanner entries found</p><p style={{ color: "var(--color-text-light)", fontSize: "var(--font-size-sm)", marginTop: "var(--spacing-2)" }}>Entries will appear here when scanned with external QR scanners</p></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "var(--table-header-bg)" }}>
                  <tr>{["Student", "Room", "Date", "Time", "Status", "Scanner", "Cross-Hostel"].map((h) => <th key={h} style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wider)" }}>{h}</th>)}</tr>
                </thead>
                <tbody style={{ borderTop: "var(--border-1) solid var(--color-border-primary)" }}>
                  {scannerEntries.map((entry) => {
                    const { date, time } = formatDateTime(entry.dateAndTime)
                    return (
                      <tr key={entry._id} className="table-row-hover" style={{ transition: "var(--transition-colors)" }}>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ width: "var(--avatar-md)", height: "var(--avatar-md)", borderRadius: "var(--radius-full)", overflow: "hidden", backgroundColor: "var(--color-bg-muted)", marginRight: "var(--spacing-3)" }}>
                              {entry.userId.profileImage ? <img src={getMediaUrl(entry.userId.profileImage)} alt={entry.userId.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-info-bg-light)" }}><FaQrcode style={{ color: "var(--color-info)", width: "var(--icon-lg)", height: "var(--icon-lg)" }} /></div>}
                            </div>
                            <div><div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{entry.userId.name}</div><div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{entry.userId.email}</div></div>
                          </div>
                        </td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}><div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{entry.room}{entry.bed}-{entry.unit}</div><div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-light)" }}>{entry.hostelName}</div></td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{date}</td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{time}</td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}><StatusBadge status={entry.status} /></td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                          <div style={{ display: "flex", alignItems: "center", fontSize: "var(--font-size-sm)" }}>
                            {entry.scannerType === "checkin" ? <div style={{ display: "flex", alignItems: "center", color: "var(--color-success)" }}><FaArrowDown style={{ marginRight: "var(--spacing-1)" }} /><span>Check-in</span></div> : entry.scannerType === "checkout" ? <div style={{ display: "flex", alignItems: "center", color: "var(--color-warning)" }}><FaArrowRight style={{ marginRight: "var(--spacing-1)", transform: "rotate(90deg)" }} /><span>Check-out</span></div> : <span style={{ color: "var(--color-text-muted)" }}>Auto</span>}
                          </div>
                        </td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                          {entry.isSameHostel === false ? <div style={{ display: "flex", alignItems: "center" }}><FaExclamationTriangle style={{ color: "var(--color-warning)", marginRight: "var(--spacing-1)" }} /><span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-warning)" }}>Yes</span>{entry.reason && <div style={{ marginLeft: "var(--spacing-2)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }} title={entry.reason}>(Reason provided)</div>}</div> : <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>No</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .info-grid { display: grid; grid-template-columns: 1fr; gap: var(--spacing-4); } @media (min-width: 768px) { .info-grid { grid-template-columns: 1fr 1fr; } } .table-row-hover:hover { background-color: var(--table-row-hover); }`}</style>
    </div>
  )
}

export default ScannerEntriesPage

