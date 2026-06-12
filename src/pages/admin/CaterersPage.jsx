import { useEffect, useMemo, useState } from "react"
import { Button, DataTable, Input, Modal, StatusBadge } from "czero/react"
import { Archive, ArchiveRestore, Mail, Pencil, Plus, Search } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { adminApi } from "../../service"
import { Alert, Avatar, ConfirmDialog, EmptyState, HStack, Label, SearchInput, VStack } from "@/components/ui"

const initialFormState = { name: "", email: "" }

const getErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback

const normalizeCaterer = (caterer = {}) => ({
  id: caterer.id || caterer._id,
  name: caterer.name || "",
  email: caterer.email || "",
  isArchived: Boolean(caterer.isArchived),
  createdAt: caterer.createdAt,
  updatedAt: caterer.updatedAt,
})

const formatDateTime = (value) => {
  if (!value) return "Not available"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not available"
  return date.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

const CatererFormModal = ({ isOpen, title, submitLabel, initialData = initialFormState, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(() => ({ name: initialData.name || "", email: initialData.email || "" }))
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required.")
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({ name: formData.name.trim(), email: formData.email.trim() })
      onClose()
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to save caterer. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={560}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="caterer-form" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </>
      }
    >
      <form id="caterer-form" onSubmit={handleSubmit}>
        <VStack gap="large">
          {error && <Alert type="error" icon>{error}</Alert>}
          <div>
            <Label htmlFor="name" required>Caterer Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter caterer name" required />
          </div>
          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="caterer@iiti.ac.in" required />
          </div>
          <Alert type="info" icon>
            A caterer login is created automatically from this email so they can run meal verification.
          </Alert>
        </VStack>
      </form>
    </Modal>
  )
}

const DetailRow = ({ label, value }) => (
  <HStack justify="between" gap="medium">
    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{label}</span>
    <span style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)" }}>{value}</span>
  </HStack>
)

const CatererDetailsModal = ({ caterer, onClose, onEdit, onToggleArchive }) => {
  if (!caterer) return null

  return (
    <Modal
      isOpen={Boolean(caterer)}
      onClose={onClose}
      title="Caterer Details"
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={() => onToggleArchive(caterer)}>
            {caterer.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
            {caterer.isArchived ? "Unarchive" : "Archive"}
          </Button>
          <Button variant="primary" onClick={() => onEdit(caterer)}>
            <Pencil size={16} /> Edit
          </Button>
        </>
      }
    >
      <VStack gap="large">
        <HStack gap="medium" align="center">
          <Avatar name={caterer.name || "?"} size="large" />
          <div>
            <h3 style={{ margin: 0, fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>{caterer.name}</h3>
            <StatusBadge status={caterer.isArchived ? "Archived" : "Active"} tone={caterer.isArchived ? "primary" : "success"} />
          </div>
        </HStack>
        <VStack gap="medium">
          <DetailRow label="Email" value={caterer.email} />
          <DetailRow label="Created" value={formatDateTime(caterer.createdAt)} />
          <DetailRow label="Last updated" value={formatDateTime(caterer.updatedAt)} />
        </VStack>
      </VStack>
    </Modal>
  )
}

const CaterersPage = () => {
  const [caterers, setCaterers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [fetchArchive, setFetchArchive] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCaterer, setEditingCaterer] = useState(null)
  const [viewingCaterer, setViewingCaterer] = useState(null)
  const [archiveTarget, setArchiveTarget] = useState(null)

  const filteredCaterers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return caterers
    return caterers.filter(
      (caterer) =>
        caterer.name.toLowerCase().includes(normalizedSearch) || caterer.email.toLowerCase().includes(normalizedSearch)
    )
  }, [caterers, searchTerm])

  const fetchCaterers = async (archive = fetchArchive) => {
    try {
      const response = await adminApi.getAllCaterers(archive ? "archive=true" : "")
      setCaterers(Array.isArray(response) ? response.map(normalizeCaterer) : [])
    } catch (error) {
      console.error("Error fetching caterers:", error)
      setCaterers([])
    }
  }

  useEffect(() => {
    fetchCaterers(false)
  }, [])

  const handleArchiveToggle = () => {
    const next = !fetchArchive
    setFetchArchive(next)
    fetchCaterers(next)
  }

  const handleAddCaterer = async (payload) => {
    await adminApi.addCaterer(payload)
    setFeedback({ type: "success", message: `${payload.name} added.` })
    await fetchCaterers()
  }

  const handleUpdateCaterer = async (payload) => {
    if (!editingCaterer?.id) return
    await adminApi.updateCaterer(editingCaterer.id, payload)
    setEditingCaterer(null)
    setFeedback({ type: "success", message: "Caterer updated." })
    await fetchCaterers()
  }

  const handleConfirmArchive = async () => {
    if (!archiveTarget?.id) return
    const action = archiveTarget.isArchived ? "unarchive" : "archive"
    try {
      await adminApi.changeCatererArchiveStatus(archiveTarget.id, !archiveTarget.isArchived)
      setArchiveTarget(null)
      setEditingCaterer(null)
      setViewingCaterer(null)
      setFeedback({ type: "success", message: `Caterer ${action}d.` })
      await fetchCaterers()
    } catch (error) {
      setArchiveTarget(null)
      setFeedback({ type: "error", message: getErrorMessage(error, `Unable to ${action} caterer.`) })
    }
  }

  const openEdit = (caterer) => {
    setViewingCaterer(null)
    setEditingCaterer(caterer)
  }

  const columns = [
    {
      key: "name",
      header: "Caterer",
      render: (row) => (
        <HStack gap="small" align="center">
          <Avatar name={row.name || "?"} size="small" />
          <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>{row.name}</span>
        </HStack>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <HStack gap="xsmall" align="center" style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          <Mail size={14} /> {row.email}
        </HStack>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.isArchived ? "Archived" : "Active"} tone={row.isArchived ? "primary" : "success"} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }} onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
            <Pencil size={15} /> Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setArchiveTarget(row)}>
            {row.isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Caterers">
          <Button variant="secondary" onClick={handleArchiveToggle}>
            {fetchArchive ? <ArchiveRestore size={18} /> : <Archive size={18} />}
            {fetchArchive ? "Show Active" : "Show Archived"}
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Caterer
          </Button>
        </PageHeader>

        <div className="flex-1 overflow-y-auto px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
          {feedback && (
            <Alert type={feedback.type} icon dismissible onDismiss={() => setFeedback(null)} style={{ marginBottom: "var(--spacing-4)" }}>
              {feedback.message}
            </Alert>
          )}

          <div className="flex items-center justify-between gap-[var(--spacing-3)] flex-wrap mb-[var(--spacing-4)]">
            <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              {filteredCaterers.length} {fetchArchive ? "archived" : "active"} caterer{filteredCaterers.length === 1 ? "" : "s"}
            </span>
            <div className="w-full sm:w-[18rem]">
              <SearchInput value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search caterer..." />
            </div>
          </div>

          {filteredCaterers.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Caterers Found"
              message="No caterers match your search criteria. Try adjusting your search or archive view."
            />
          ) : (
            <DataTable
              data={filteredCaterers}
              columns={columns}
              getRowId={(row) => row.id}
              onRowClick={setViewingCaterer}
              pagination
              pageSize={10}
            />
          )}
        </div>
      </div>

      {showAddModal && (
        <CatererFormModal
          isOpen
          title="Add New Caterer"
          submitLabel="Add Caterer"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCaterer}
        />
      )}

      {editingCaterer && (
        <CatererFormModal
          key={editingCaterer.id}
          isOpen
          title="Edit Caterer Details"
          submitLabel="Save Changes"
          initialData={editingCaterer}
          onClose={() => setEditingCaterer(null)}
          onSubmit={handleUpdateCaterer}
        />
      )}

      <CatererDetailsModal
        caterer={viewingCaterer}
        onClose={() => setViewingCaterer(null)}
        onEdit={openEdit}
        onToggleArchive={setArchiveTarget}
      />

      <ConfirmDialog
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleConfirmArchive}
        title={archiveTarget?.isArchived ? "Unarchive Caterer" : "Archive Caterer"}
        message={
          archiveTarget?.isArchived
            ? `Restore ${archiveTarget?.name || "this caterer"} to active caterers?`
            : `Archive ${archiveTarget?.name || "this caterer"}? They will be hidden from dining setup but their data is kept.`
        }
        confirmText={archiveTarget?.isArchived ? "Unarchive" : "Archive"}
        isDestructive={!archiveTarget?.isArchived}
      />
    </>
  )
}

export default CaterersPage
