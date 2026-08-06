import React, { useState } from "react"
import { Scan, AlertTriangle, Check, RefreshCw, Wifi, WifiOff, User } from "lucide-react"
import { useFaceScannerEntries } from "../../hooks/useFaceScannerEntries"
import { Badge, Card, Heading, HStack, IconCircle, Spinner, Surface, Switch, Text, VStack } from "@/components/ui"
import { Button, StatusBadge, Table } from "czero/react"
import { getMediaUrl } from "../../utils/mediaUtils"

const FaceScannerEntriesPage = () => {
    const {
        entries,
        pendingCrossHostelEntries,
        loading,
        error,
        isConnected,
        lastRealtimeEntryId,
        refresh,
        updateCrossHostelReason,
    } = useFaceScannerEntries()

    const [reasonInputs, setReasonInputs] = useState({})
    const [updatingReasons, setUpdatingReasons] = useState({})
    const [promptForReason, setPromptForReason] = useState(true)

    const handleReasonChange = (entryId, reason) => setReasonInputs((prev) => ({ ...prev, [entryId]: reason }))

    const handleUpdateReason = async (entry) => {
        const reason = reasonInputs[entry._id]
        if (!reason || !reason.trim()) return alert("Please provide a reason for the cross-hostel entry")
        try {
            setUpdatingReasons((prev) => ({ ...prev, [entry._id]: true }))
            await updateCrossHostelReason(entry._id, reason.trim())
            setReasonInputs((prev) => {
                const n = { ...prev }
                delete n[entry._id]
                return n
            })
        } catch (err) {
            alert("Failed to update reason: " + err.message)
        } finally {
            setUpdatingReasons((prev) => {
                const n = { ...prev }
                delete n[entry._id]
                return n
            })
        }
    }

    const formatDateTime = (dt) => ({
        date: new Date(dt).toLocaleDateString(),
        time: new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })

    const CrossHostelReasonCard = ({ entry }) => {
        const isUpdating = updatingReasons[entry._id]
        const currentReason = reasonInputs[entry._id] || ""
        return (
            <Surface bg="var(--color-warning-bg-light)" padding={4} radius="lg" border="var(--border-2) solid var(--color-warning)" style={{ marginBottom: "var(--spacing-4)" }}>
                <HStack gap="none" align="start">
                    <AlertTriangle
                        style={{
                            height: "var(--icon-xl)",
                            width: "var(--icon-xl)",
                            color: "var(--color-warning)",
                            marginTop: "var(--spacing-0-5)",
                            flexShrink: 0,
                        }}
                    />
                    <div style={{ marginLeft: "var(--spacing-3)", flex: 1 }}>
                        <Heading as="h3" size="lg" weight="semibold" color="warning-text" style={{ marginBottom: "var(--spacing-2)" }}>
                            Cross-Hostel Entry Requires Reason
                        </Heading>
                        <HStack gap="none" align="center" style={{ marginBottom: "var(--spacing-3)" }}>
                            <IconCircle size="var(--icon-4xl)" bg="muted" style={{ overflow: "hidden", marginRight: "var(--spacing-3)" }}>
                                {entry.userId?.profileImage ? (
                                    <img
                                        src={getMediaUrl(entry.userId.profileImage)}
                                        alt={entry.userId.name}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "var(--color-info-bg-light)",
                                        }}
                                    >
                                        <User style={{ color: "var(--color-info)", width: "var(--icon-xl)", height: "var(--icon-xl)" }} />
                                    </div>
                                )}
                            </IconCircle>
                            <div>
                                <Text weight="medium" color="primary">
                                    {entry.userId?.name}
                                </Text>
                                <Text size="sm" color="muted">
                                    {entry.userId?.email}
                                </Text>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "var(--spacing-4)",
                                        fontSize: "var(--font-size-sm)",
                                        color: "var(--color-text-muted)",
                                        marginTop: "var(--spacing-1)",
                                    }}
                                >
                                    <span>
                                        Room: {entry.room}
                                        {entry.bed}
                                    </span>
                                    <StatusBadge status={entry.status} />
                                </div>
                            </div>
                        </HStack>
                        <Text color="warning-text" size="sm" style={{ marginBottom: "var(--spacing-3)" }}>
                            This student belongs to a different hostel. Please provide a reason for allowing this check-in entry.
                        </Text>
                        <div style={{ marginBottom: "var(--spacing-3)" }}>
                            <label
                                htmlFor={`reason-${entry._id}`}
                                style={{
                                    display: "block",
                                    fontSize: "var(--font-size-sm)",
                                    fontWeight: "var(--font-weight-medium)",
                                    color: "var(--color-warning-text)",
                                    marginBottom: "var(--spacing-1)",
                                }}
                            >
                                Reason for Cross-Hostel Check-In <Text as="span" color="danger">*</Text>
                            </label>
                            <textarea
                                id={`reason-${entry._id}`}
                                value={currentReason}
                                onChange={(e) => handleReasonChange(entry._id, e.target.value)}
                                placeholder="Enter reason..."
                                style={{
                                    width: "100%",
                                    padding: "var(--spacing-2) var(--spacing-3)",
                                    border: "var(--border-1) solid var(--color-warning-light)",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: "var(--font-size-sm)",
                                }}
                                rows="3"
                                disabled={isUpdating}
                            />
                        </div>
                        <Button
                            onClick={() => handleUpdateReason(entry)}
                            disabled={!currentReason.trim() || isUpdating}
                            variant="warning"
                            size="sm"
                            loading={isUpdating}
                        >
                            {isUpdating ? null : <Check size={16} />} {isUpdating ? "Updating..." : "Add Check-In Reason"}
                        </Button>
                    </div>
                </HStack>
            </Surface>
        )
    }

    return (
        <Surface bg="var(--color-bg-page)" padding="var(--spacing-6) var(--spacing-4)">
            <div style={{ maxWidth: "var(--container-xl)", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ marginBottom: "var(--spacing-6)" }}>
                    <HStack justify="between" align="start">
                        <div>
                            <Heading as="h1" size="3xl" weight="bold" color="secondary" style={{ marginBottom: "var(--spacing-2)" }}>
                                Face Scanner Entries
                            </Heading>
                            <Text size="base" color="muted">
                                Real-time entries from face scanner devices at the hostel gate.
                            </Text>
                        </div>
                        <HStack gap="small">
                            {/* Connection Status */}
                            <Badge variant={isConnected ? "success" : "danger"} size="small">
                                <HStack gap="xsmall" align="center">
                                    {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                                    <span>{isConnected ? "Live" : "Offline"}</span>
                                </HStack>
                            </Badge>
                        </HStack>
                    </HStack>
                </div>

                {/* Toggle for prompting reason */}
                <Card style={{ marginBottom: "var(--spacing-6)", padding: "var(--spacing-4)" }}>
                    <HStack justify="between" align="center">
                        <VStack gap="xsmall">
                            <Text as="span" weight="medium" color="primary">
                                Prompt for Cross-Hostel Reason
                            </Text>
                            <Text as="span" size="sm" color="muted">
                                Show reason input for students from other hostels
                            </Text>
                        </VStack>
                        <Switch checked={promptForReason} onChange={(e) => setPromptForReason(e.target.checked)} />
                    </HStack>
                </Card>

                {/* Error Message */}
                {error && (
                    <Surface bg="var(--color-danger-bg-light)" color="danger-text" padding={3} radius="lg" accent="danger" style={{ marginBottom: "var(--spacing-4)", display: "flex", alignItems: "flex-start" }}>
                        <AlertTriangle
                            style={{ marginRight: "var(--spacing-2)", marginTop: "var(--spacing-0-5)", flexShrink: 0 }}
                            size={16}
                        />
                        <Text size="sm">{error}</Text>
                    </Surface>
                )}

                {/* Pending Cross-Hostel Entries */}
                {promptForReason && pendingCrossHostelEntries.length > 0 && (
                    <div style={{ marginBottom: "var(--spacing-8)" }}>
                        <h2
                            style={{
                                fontSize: "var(--font-size-2xl)",
                                fontWeight: "var(--font-weight-bold)",
                                color: "var(--color-text-secondary)",
                                marginBottom: "var(--spacing-4)",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <AlertTriangle style={{ color: "var(--color-warning)", marginRight: "var(--spacing-2)" }} size={24} />
                            Pending Cross-Hostel Check-In Entries ({pendingCrossHostelEntries.length})
                        </h2>
                        {pendingCrossHostelEntries.map((entry) => (
                            <CrossHostelReasonCard key={entry._id} entry={entry} />
                        ))}
                    </div>
                )}

                {/* Main Entries Card */}
                <Card style={{ padding: "var(--spacing-6)" }}>
                    <HStack gap="none" align="center" justify="between" style={{ marginBottom: "var(--spacing-4)" }}>
                        <HStack gap="none" align="center">
                            <div
                                style={{
                                    padding: "var(--spacing-2-5)",
                                    marginRight: "var(--spacing-3)",
                                    borderRadius: "var(--radius-xl)",
                                    backgroundColor: "var(--color-info-bg)",
                                    color: "var(--color-primary)",
                                }}
                            >
                                <Scan size={20} />
                            </div>
                            <Heading as="h2" size="2xl" weight="bold" color="secondary">
                                Recent Face Scanner Entries
                            </Heading>
                        </HStack>
                        <Button
                            onClick={refresh}
                            disabled={loading}
                            variant="primary"
                            size="sm"
                            loading={loading}
                        >
                            {loading ? null : <RefreshCw size={16} />} {loading ? "Loading..." : "Refresh"}
                        </Button>
                    </HStack>

                    {/* Loading State */}
                    {loading && entries.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "var(--spacing-8)" }}>
                            <Spinner size="var(--icon-4xl)" thickness="thick" style={{ margin: "0 auto var(--spacing-4)" }} />
                            <Text color="muted">Loading face scanner entries...</Text>
                        </div>
                    ) : entries.length === 0 ? (
                        /* Empty State */
                        <div style={{ textAlign: "center", padding: "var(--spacing-8)" }}>
                            <Scan
                                style={{
                                    width: "var(--icon-4xl)",
                                    height: "var(--icon-4xl)",
                                    color: "var(--color-text-disabled)",
                                    margin: "0 auto var(--spacing-4)",
                                }}
                            />
                            <Text color="muted" size="lg">
                                No face scanner entries found
                            </Text>
                            <Text color="light" size="sm" style={{ marginTop: "var(--spacing-2)" }}>
                                Entries will appear here in real-time when students scan their face
                            </Text>
                        </div>
                    ) : (
                        /* Entries Table */
                        <div style={{ overflowX: "auto" }}>
                            <Table>
                                <Table.Header>
                                    <Table.Row>
                                        {["Student", "Room", "Date", "Time", "Status", "Cross-Hostel"].map((h) => (
                                            <Table.Head key={h}>
                                                {h}
                                            </Table.Head>
                                        ))}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {entries.map((entry) => {
                                        const { date, time } = formatDateTime(entry.dateAndTime)
                                        const isNewEntry = entry._id === lastRealtimeEntryId
                                        return (
                                            <Table.Row className="table-row-hover" style={{ backgroundColor: isNewEntry ? "var(--color-success-bg-light)" : undefined }} key={entry._id}>
                                                <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                                                    <HStack gap="none" align="center">
                                                        <IconCircle size="var(--avatar-md)" bg="muted" style={{ overflow: "hidden", marginRight: "var(--spacing-3)" }}>
                                                            {entry.userId?.profileImage ? (
                                                                <img
                                                                    src={getMediaUrl(entry.userId.profileImage)}
                                                                    alt={entry.userId.name}
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                />
                                                            ) : (
                                                                <div
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        backgroundColor: "var(--color-info-bg-light)",
                                                                    }}
                                                                >
                                                                    <User
                                                                        style={{
                                                                            color: "var(--color-info)",
                                                                            width: "var(--icon-lg)",
                                                                            height: "var(--icon-lg)",
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </IconCircle>
                                                        <div>
                                                            <Text as="div" size="sm" weight="medium" color="primary">
                                                                {entry.userId?.name}
                                                            </Text>
                                                            <Text as="div" size="sm" color="muted">
                                                                {entry.userId?.email}
                                                            </Text>
                                                        </div>
                                                    </HStack>
                                                </Table.Cell>
                                                <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                                                    <Text as="div" size="sm" color="muted">
                                                        {entry.room}
                                                        {entry.bed}-{entry.unit}
                                                    </Text>
                                                    <Text as="div" size="xs" color="light">
                                                        {entry.hostelName}
                                                    </Text>
                                                </Table.Cell>
                                                <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)", fontSize: "var(--font-size-sm)" }}>
                                                    {date}
                                                </Table.Cell>
                                                <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)", fontSize: "var(--font-size-sm)" }}>
                                                    {time}
                                                </Table.Cell>
                                                <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                                                    <StatusBadge status={entry.status} />
                                                </Table.Cell>
                                                <Table.Cell style={{ whiteSpace: "nowrap", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                                                    {entry.isSameHostel === false ? (
                                                        <HStack gap="none" align="center">
                                                            <AlertTriangle
                                                                style={{ color: "var(--color-warning)", marginRight: "var(--spacing-1)" }}
                                                                size={16}
                                                            />
                                                            <Text as="span" size="sm" color="warning">
                                                                Yes
                                                            </Text>
                                                            {entry.reason && (
                                                                <Text as="div" size="xs" color="muted" style={{ marginLeft: "var(--spacing-2)" }} title={entry.reason}>
                                                                    (Reason provided)
                                                                </Text>
                                                            )}
                                                        </HStack>
                                                    ) : (
                                                        <Text as="span" size="sm" color="muted">
                                                            No
                                                        </Text>
                                                    )}
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    })}
                                </Table.Body>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>

            <style>
                {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .table-row-hover:hover {
            background-color: var(--table-row-hover);
          }
        `}
            </style>
        </Surface>
    )
}

export default FaceScannerEntriesPage
