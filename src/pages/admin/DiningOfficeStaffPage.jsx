import { useEffect, useMemo, useState } from "react"
import { DataTable, StatusBadge, Button } from "hzero"
import { Plus, Pencil, Trash2, UserCog, Users } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { adminApi } from "../../service"
import { Alert, ConfirmDialog, EmptyState, HStack, LoadingState, Page, SearchInput, StatCards, Text } from "@/components/ui"
import DiningOfficeFormModal, { DINING_OFFICE_CATEGORIES } from "@/components/dining/DiningOfficeFormModal"
import { getErrorMessage } from "@/components/dining/diningBillingHelpers"

const CATEGORY_FILTERS = [{ id: "all", label: "All" }, ...DINING_OFFICE_CATEGORIES.map((c) => ({ id: c, label: c }))]

const DiningOfficeStaffPage = () => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [formState, setFormState] = useState(null) // { mode, data }
  const [pendingDelete, setPendingDelete] = useState(null)

  const fetchStaff = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const response = await adminApi.getAllDiningOfficeStaff()
      setStaff(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error("Error fetching dining office logins:", error)
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to load dining office logins.") })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return staff.filter((entry) => {
      if (categoryFilter !== "all" && entry.category !== categoryFilter) return false
      if (!search) return true
      return (
        String(entry.name || "").toLowerCase().includes(search) ||
        String(entry.email || "").toLowerCase().includes(search)
      )
    })
  }, [staff, searchTerm, categoryFilter])

  const stats = [
    { title: "Total Logins", value: staff.length, subtitle: "Dining office staff", icon: <UserCog size={20} />, color: "var(--color-primary)" },
    { title: "Dining Wardens", value: staff.filter((s) => s.category === "Dining Warden").length, subtitle: "Category", icon: <Users size={20} />, color: "var(--color-success)" },
    { title: "Hall Supervisors", value: staff.filter((s) => s.category === "Dining Hall Supervisor").length, subtitle: "Category", icon: <Users size={20} />, color: "var(--color-warning)" },
  ]

  const handleSubmit = async (payload) => {
    if (formState?.mode === "edit") {
      await adminApi.updateDiningOfficeStaff(formState.data.id, payload)
      setFeedback({ type: "success", message: "Dining office login updated." })
    } else {
      await adminApi.addDiningOfficeStaff(payload)
      setFeedback({ type: "success", message: "Dining office login created." })
    }
    await fetchStaff({ silent: true })
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    try {
      await adminApi.deleteDiningOfficeStaff(pendingDelete.id)
      setFeedback({ type: "success", message: "Dining office login deleted." })
      await fetchStaff({ silent: true })
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to delete login.") })
    } finally {
      setPendingDelete(null)
    }
  }

  const columns = [
    { key: "name", header: "Name", render: (row) => <Text as="span" weight="semibold" color="secondary">{row.name || "—"}</Text> },
    { key: "email", header: "Email", render: (row) => <Text as="span" color="muted">{row.email || "—"}</Text> },
    { key: "category", header: "Category", render: (row) => <StatusBadge status={row.category || "—"} tone={row.category === "Dining Warden" ? "success" : "primary"} /> },
    { key: "phone", header: "Phone", render: (row) => <Text as="span" color="muted">{row.phone || "—"}</Text> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <HStack gap={2} justify="end">
          <Button variant="secondary" size="sm" onClick={() => setFormState({ mode: "edit", data: row })}><Pencil size={16} /></Button>
          <Button variant="danger" size="sm" onClick={() => setPendingDelete(row)}><Trash2 size={16} /></Button>
        </HStack>
      ),
    },
  ]

  if (loading) return <LoadingState message="Loading dining office logins..." />

  return (
    <Page>
      <PageHeader title="Dining Office" subtitle="Manage dining office logins (Dining Warden, Dining Hall Supervisor)">
        <Button variant="primary" onClick={() => setFormState({ mode: "create", data: {} })}>
          <Plus size={18} /> New Login
        </Button>
      </PageHeader>

      <Page.Body>
        {feedback && (
          <Alert type={feedback.type} icon dismissible onDismiss={() => setFeedback(null)} style={{ marginBottom: "var(--spacing-4)" }}>
            {feedback.message}
          </Alert>
        )}

        <StatCards columns={3} stats={stats} />

        <HStack align="center" justify="between" gap={3} wrap className="mt-[var(--spacing-6)]">
          <HStack gap={2} wrap>
            {CATEGORY_FILTERS.map((filter) => (
              <Button
                key={filter.id}
                variant={categoryFilter === filter.id ? "primary" : "secondary"}
                size="sm"
                onClick={() => setCategoryFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </HStack>
          <div className="w-full sm:w-[18rem]">
            <SearchInput value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name / email..." />
          </div>
        </HStack>

        <div className="mt-[var(--spacing-4)]">
          {filtered.length === 0 ? (
            <EmptyState
              icon={UserCog}
              title="No Dining Office Logins"
              message="Create a login for a Dining Warden or Dining Hall Supervisor to get started."
            />
          ) : (
            <DataTable data={filtered} columns={columns} getRowId={(row) => row.id} pagination pageSize={15} />
          )}
        </div>
      </Page.Body>

      {formState && (
        <DiningOfficeFormModal
          key={formState.mode === "edit" ? formState.data.id : "create"}
          isOpen
          mode={formState.mode}
          initialData={formState.data}
          onClose={() => setFormState(null)}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete Dining Office Login"
        message={`Remove ${pendingDelete?.name || "this login"}? This permanently deletes their account.`}
        confirmText="Delete"
        isDestructive
      />
    </Page>
  )
}

export default DiningOfficeStaffPage
