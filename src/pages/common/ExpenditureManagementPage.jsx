import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, DataTable, SearchInput, StatusBadge, Tabs, Text } from "hzero"
import { Plus } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { useAuth } from "../../contexts/AuthProvider.jsx"
import { expenditureApi } from "../../service"
import CreateExpenditureModal from "../../components/expenditure/CreateExpenditureModal"
import { isManagerRole, OCCURRENCE_STATUS, formatINR } from "../../components/expenditure/expenditureConstants"

const ExpenditureManagementPage = ({ basePath = "/admin/expenditure" }) => {
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
      const data = await expenditureApi.list()
      setOccurrences(Array.isArray(data?.occurrences) ? data.occurrences : [])
    } catch (err) {
      setError(err?.message || "Failed to load expenditure occurrences.")
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
            {row.expenseCount || 0} expenses · {row.paymentCount || 0} payments
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
    { key: "totalBudget", header: "Budget", align: "right", render: (row) => formatINR(row.totalBudget) },
    { key: "expenseTotal", header: "Spent", align: "right", render: (row) => formatINR(row.expenseTotal) },
    {
      key: "paymentTotal",
      header: "Received",
      align: "right",
      className: "hidden md:table-cell",
      render: (row) => formatINR(row.paymentTotal),
    },
    {
      key: "remainingBudget",
      header: "Remaining",
      align: "right",
      render: (row) => (
        <Text as="span" color={Number(row.remainingBudget) < 0 ? "danger" : "body"} weight="medium">
          {formatINR(row.remainingBudget)}
        </Text>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Expenditure" subtitle="Track budgets, expenses, bills, and payments for Student Affairs events">
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
          emptyMessage={error || "No expenditure occurrences yet."}
          getRowId={(row) => row._id}
        />
      </div>

      {createOpen && (
        <CreateExpenditureModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onSaved={() => fetchList()}
        />
      )}
    </div>
  )
}

export default ExpenditureManagementPage
