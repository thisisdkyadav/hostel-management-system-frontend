import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DataTable, StatusBadge, Tabs, Button } from "hzero"
import { SearchInput, Text } from "@/components/ui"
import { Plus } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { useAuth } from "../../contexts/AuthProvider.jsx"
import { attendanceApi } from "../../service"
import CreateOccurrenceModal from "../../components/attendance/CreateOccurrenceModal"
import { isManagerRole, OCCURRENCE_STATUS } from "../../components/attendance/attendanceConstants"

const formatDateTime = (value) => {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

const AttendancePage = ({ basePath = "/admin/attendance" }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = isManagerRole(user?.role)

  const [occurrences, setOccurrences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusTab, setStatusTab] = useState("all")
  const [createOpen, setCreateOpen] = useState(false)

  const fetchList = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await attendanceApi.list()
      setOccurrences(Array.isArray(data?.occurrences) ? data.occurrences : [])
    } catch (err) {
      setError(err?.message || "Failed to load attendance occurrences.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return occurrences.filter((o) => {
      if (statusTab !== "all" && o.status !== statusTab) return false
      if (term && !String(o.title || "").toLowerCase().includes(term)) return false
      return true
    })
  }, [occurrences, search, statusTab])

  const counts = useMemo(
    () => ({
      all: occurrences.length,
      open: occurrences.filter((o) => o.status === OCCURRENCE_STATUS.OPEN).length,
      closed: occurrences.filter((o) => o.status === OCCURRENCE_STATUS.CLOSED).length,
    }),
    [occurrences]
  )

  const columns = [
    {
      key: "title",
      header: "Occurrence",
      render: (row) => (
        <div>
          <Text as="div" weight="semibold" color="heading">
            {row.title}
          </Text>
          <Text as="div" size="sm" color="muted">
            {[row.location, formatDateTime(row.startAt)].filter((x) => x && x !== "—").join(" · ") || "No date set"}
          </Text>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge tone={row.status === OCCURRENCE_STATUS.OPEN ? "success" : "warning"}>
          {row.status === OCCURRENCE_STATUS.OPEN ? "Open" : "Closed"}
        </StatusBadge>
      ),
    },
    { key: "presentCount", header: "Present", align: "center", render: (row) => row.presentCount ?? 0 },
    {
      key: "rosterCount",
      header: "Roster",
      align: "center",
      render: (row) => (row.rosterCount ? row.rosterCount : "—"),
    },
    {
      key: "assignedUsers",
      header: "Scanners",
      align: "center",
      className: "hidden md:table-cell",
      render: (row) => (Array.isArray(row.assignedUsers) ? row.assignedUsers.length : 0),
    },
    {
      key: "createdBy",
      header: "Created by",
      className: "hidden lg:table-cell",
      render: (row) => row.createdBy?.name || "—",
    },
  ]

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Create occurrences and scan student QR codes to mark attendance">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search occurrences..." />
        {canManage && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> New Occurrence
          </Button>
        )}
      </PageHeader>

      <div style={{ padding: "var(--spacing-4) var(--spacing-4) var(--spacing-8)" }}>
        <div style={{ marginBottom: "var(--spacing-4)" }}>
          <Tabs
            variant="pills"
            activeTab={statusTab}
            setActiveTab={setStatusTab}
            tabs={[
              { value: "all", label: "All", count: counts.all },
              { value: "open", label: "Open", count: counts.open },
              { value: "closed", label: "Closed", count: counts.closed },
            ]}
          />
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          loading={loading}
          onRowClick={(row) => navigate(`${basePath}/${row._id}`)}
          emptyMessage={error || "No attendance occurrences yet."}
          getRowId={(row) => row._id}
        />
      </div>

      {createOpen && (
        <CreateOccurrenceModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onSaved={() => fetchList()}
        />
      )}
    </div>
  )
}

export default AttendancePage
