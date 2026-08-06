import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button, DataTable, StatusBadge } from "czero/react"
import { Alert, Avatar, ConfirmDialog, Heading, HStack, IconButton, Surface, Text } from "@/components/ui"
import { ArrowLeft, Upload, Pencil, Trash2, Lock, LockOpen } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { useAuth } from "../../contexts/AuthProvider.jsx"
import { useToast } from "@/components/ui/feedback"
import { attendanceApi } from "../../service"
import AttendanceScanner from "../../components/attendance/AttendanceScanner"
import CreateOccurrenceModal from "../../components/attendance/CreateOccurrenceModal"
import RosterUploadModal from "../../components/attendance/RosterUploadModal"
import { isManagerRole, OCCURRENCE_STATUS } from "../../components/attendance/attendanceConstants"

const formatDateTime = (value) => {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

const formatTime = (value) => {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" })
}

const StatTile = ({ label, value, tone = "default" }) => {
  const color =
    tone === "success"
      ? "var(--color-success)"
      : tone === "danger"
        ? "var(--color-danger)"
        : tone === "warning"
          ? "var(--color-warning)"
          : "var(--color-text-heading)"
  return (
    <div
      style={{
        flex: "1 1 120px",
        minWidth: 120,
        padding: "var(--spacing-4)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--color-border-primary)",
        backgroundColor: "var(--color-bg-primary)",
      }}
    >
      <Text as="div" size="xs" color="muted" style={{ textTransform: "uppercase", letterSpacing: "0.03em" }}>
        {label}
      </Text>
      <Text as="div" size="3xl" weight="bold">{value}</Text>
    </div>
  )
}

const AttendanceOccurrencePage = ({ basePath = "/admin/attendance" }) => {
  const { occurrenceId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const canManage = isManagerRole(user?.role)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [rosterOpen, setRosterOpen] = useState(false)
  const [confirmDeleteOcc, setConfirmDeleteOcc] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState(null)
  const [statusBusy, setStatusBusy] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await attendanceApi.get(occurrenceId)
      setData(res)
    } catch (err) {
      setError(err?.message || "Failed to load this occurrence.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occurrenceId])

  const occurrence = data?.occurrence
  const records = useMemo(() => (Array.isArray(data?.records) ? data.records : []), [data])
  const reconciliation = data?.reconciliation

  const isClosed = occurrence?.status === OCCURRENCE_STATUS.CLOSED

  const toggleStatus = async () => {
    try {
      setStatusBusy(true)
      await attendanceApi.update(occurrenceId, {
        status: isClosed ? OCCURRENCE_STATUS.OPEN : OCCURRENCE_STATUS.CLOSED,
      })
      toast.success(isClosed ? "Occurrence reopened" : "Occurrence closed")
      fetchData()
    } catch (err) {
      toast.error(err?.message || "Failed to update status")
    } finally {
      setStatusBusy(false)
    }
  }

  const handleDeleteOccurrence = async () => {
    try {
      await attendanceApi.remove(occurrenceId)
      toast.success("Occurrence deleted")
      navigate(basePath)
    } catch (err) {
      toast.error(err?.message || "Failed to delete occurrence")
    } finally {
      setConfirmDeleteOcc(false)
    }
  }

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return
    try {
      await attendanceApi.deleteRecord(occurrenceId, recordToDelete._id)
      toast.success("Attendance record removed")
      fetchData()
    } catch (err) {
      toast.error(err?.message || "Failed to remove record")
    } finally {
      setRecordToDelete(null)
    }
  }

  const recordColumns = [
    {
      key: "name",
      header: "Student",
      render: (row) => (
        <HStack gap={2} align="center">
          <Avatar src={row.userId?.profileImage} name={row.userId?.name} size="small" />
          <Text as="span" weight="medium">{row.userId?.name || "—"}</Text>
        </HStack>
      ),
    },
    { key: "rollNumber", header: "Roll Number" },
    {
      key: "inRoster",
      header: "Roster",
      render: (row) => {
        if (row.inRoster === null || row.inRoster === undefined) return "—"
        return row.inRoster ? (
          <StatusBadge tone="success" showDot={false}>In roster</StatusBadge>
        ) : (
          <StatusBadge tone="warning" showDot={false}>Extra</StatusBadge>
        )
      },
    },
    { key: "source", header: "Source", className: "hidden md:table-cell" },
    {
      key: "scannedAt",
      header: "Marked at",
      className: "hidden md:table-cell",
      render: (row) => formatTime(row.scannedAt),
    },
    {
      key: "scannedBy",
      header: "By",
      className: "hidden lg:table-cell",
      render: (row) => row.scannedBy?.name || "—",
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <IconButton
          icon={<Trash2 size={16} />}
          variant="danger"
          size="small"
          ariaLabel="Remove record"
          onClick={(e) => {
            e.stopPropagation()
            setRecordToDelete(row)
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader title={occurrence?.title || "Attendance"} subtitle={occurrence ? [occurrence.location, formatDateTime(occurrence.startAt)].filter((x) => x && x !== "—").join(" · ") : ""}>
        <Button variant="ghost" onClick={() => navigate(basePath)}>
          <ArrowLeft size={16} /> Back
        </Button>
        {canManage && occurrence && (
          <>
            <Button variant="outline" onClick={() => setRosterOpen(true)}>
              <Upload size={16} /> Roster
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil size={16} /> Edit
            </Button>
            <Button variant={isClosed ? "success" : "secondary"} onClick={toggleStatus} loading={statusBusy}>
              {isClosed ? <><LockOpen size={16} /> Reopen</> : <><Lock size={16} /> Close</>}
            </Button>
            <Button variant="danger" onClick={() => setConfirmDeleteOcc(true)}>
              <Trash2 size={16} /> Delete
            </Button>
          </>
        )}
      </PageHeader>

      <div style={{ padding: "var(--spacing-4) var(--spacing-4) var(--spacing-8)", display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
        {error && <Alert type="error" icon>{error}</Alert>}

        {loading && !data ? (
          <Text as="div" color="muted">Loading…</Text>
        ) : occurrence ? (
          <>
            <HStack gap={3} align="center" wrap>
              <StatusBadge tone={isClosed ? "warning" : "success"}>{isClosed ? "Closed" : "Open"}</StatusBadge>
              {occurrence.description && (
                <Text as="span" color="muted" size="sm">{occurrence.description}</Text>
              )}
            </HStack>

            {/* Reconciliation */}
            <HStack gap={4} wrap>
              <StatTile label="Present" value={reconciliation?.presentCount ?? records.length} tone="success" />
              <StatTile label="Roster" value={reconciliation?.hasRoster ? reconciliation.rosterCount : "—"} />
              <StatTile label="Absent" value={reconciliation?.hasRoster ? reconciliation.absentCount : "—"} tone="danger" />
              <StatTile label="Extra" value={reconciliation?.hasRoster ? reconciliation.extraCount : "—"} tone="warning" />
            </HStack>

            {!reconciliation?.hasRoster && (
              <Alert type="info" icon>
                No roster uploaded yet. {canManage ? "Upload a CSV of expected roll numbers to see absent and extra counts." : "Absent/extra counts appear once an admin uploads a roster."}
              </Alert>
            )}

            {/* Scanner */}
            <Surface bg="primary" padding={5} radius="card" border="1px solid var(--color-border-primary)">
              <Heading as="h3" weight="semibold" color="heading" style={{ marginBottom: "var(--spacing-4)" }}>
                Scan attendance
              </Heading>
              <AttendanceScanner occurrenceId={occurrenceId} disabled={isClosed} onMarked={fetchData} />
            </Surface>

            {/* Present records */}
            <div>
              <Heading as="h3" weight="semibold" color="heading" style={{ marginBottom: "var(--spacing-3)" }}>
                Present students ({records.length})
              </Heading>
              <DataTable
                data={records}
                columns={recordColumns}
                emptyMessage="No students marked present yet."
                getRowId={(row) => row._id}
              />
            </div>

            {/* Absent list */}
            {reconciliation?.hasRoster && reconciliation.absentRollNumbers?.length > 0 && (
              <div>
                <Heading as="h3" weight="semibold" color="heading" style={{ marginBottom: "var(--spacing-3)" }}>
                  Absent ({reconciliation.absentCount})
                </Heading>
                <HStack gap={2} wrap>
                  {reconciliation.absentRollNumbers.map((roll) => (
                    <span
                      key={roll}
                      style={{
                        padding: "var(--spacing-1) var(--spacing-2-5)",
                        borderRadius: "var(--radius-badge)",
                        fontSize: "var(--font-size-xs)",
                        backgroundColor: "var(--color-danger-bg-light, var(--color-bg-tertiary))",
                        color: "var(--color-danger)",
                        border: "1px solid var(--color-border-primary)",
                      }}
                    >
                      {roll}
                    </span>
                  ))}
                </HStack>
              </div>
            )}
          </>
        ) : (
          !error && <Text as="div" color="muted">Occurrence not found.</Text>
        )}
      </div>

      {editOpen && occurrence && (
        <CreateOccurrenceModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          occurrence={occurrence}
          onSaved={() => fetchData()}
        />
      )}

      {rosterOpen && (
        <RosterUploadModal
          isOpen={rosterOpen}
          onClose={() => setRosterOpen(false)}
          occurrenceId={occurrenceId}
          currentCount={reconciliation?.rosterCount || 0}
          onUploaded={() => fetchData()}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDeleteOcc}
        onClose={() => setConfirmDeleteOcc(false)}
        onConfirm={handleDeleteOccurrence}
        title="Delete occurrence?"
        message="This permanently deletes the occurrence and all its attendance records. This cannot be undone."
        confirmText="Delete"
        isDestructive
      />

      <ConfirmDialog
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDeleteRecord}
        title="Remove attendance record?"
        message={recordToDelete ? `Remove ${recordToDelete.userId?.name || recordToDelete.rollNumber} from the present list?` : ""}
        confirmText="Remove"
        isDestructive
      />
    </div>
  )
}

export default AttendanceOccurrencePage
