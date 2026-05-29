import { useEffect, useMemo, useState } from "react"
import { Button, Input, Modal } from "czero/react"
import {
  Archive,
  ClipboardList,
  Mail,
  Pencil,
  Plus,
  Search,
  Store,
  UtensilsCrossed,
} from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { adminApi } from "../../service"
import {
  Alert,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  EmptyState,
  HStack,
  Label,
  SearchInput,
  StatCards,
  VStack,
} from "@/components/ui"

const initialFormState = {
  name: "",
  email: "",
}

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.message || fallback
}

const normalizeCaterer = (caterer = {}) => ({
  id: caterer.id || caterer._id,
  name: caterer.name || "",
  email: caterer.email || "",
  isArchived: Boolean(caterer.isArchived),
  createdAt: caterer.createdAt,
  updatedAt: caterer.updatedAt,
})

const CatererStats = ({ caterers, fetchArchive }) => {
  const activeCount = caterers.filter((caterer) => !caterer.isArchived).length
  const archivedCount = caterers.filter((caterer) => caterer.isArchived).length

  const statsData = [
    {
      title: fetchArchive ? "Archived Caterers" : "Active Caterers",
      value: caterers.length,
      subtitle: fetchArchive ? "Hidden from active operations" : "Available for dining setup",
      icon: <UtensilsCrossed size={20} />,
      color: "var(--color-primary)",
    },
    {
      title: "Active",
      value: activeCount,
      subtitle: "Currently listed",
      icon: <Store size={20} />,
      color: "var(--color-success)",
    },
    {
      title: "Archived",
      value: archivedCount,
      subtitle: "In this view",
      icon: <Archive size={20} />,
      color: "var(--color-warning)",
    },
  ]

  return <StatCards stats={statsData} columns={3} />
}

const CatererFormModal = ({
  isOpen,
  title,
  submitLabel,
  initialData = initialFormState,
  onClose,
  onSubmit,
  archiveAction = null,
}) => {
  const [formData, setFormData] = useState(initialFormState)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
      })
      setError("")
      setIsSubmitting(false)
    }
  }, [initialData.email, initialData.name, isOpen])

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
      await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
      })
      onClose()
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to save caterer. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width={640} minHeight="50vh">
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          {error && (
            <Alert type="error" icon>
              {error}
            </Alert>
          )}

          <div style={{ backgroundColor: "var(--color-primary-bg)", padding: "var(--spacing-3) var(--spacing-4)", borderRadius: "var(--radius-lg)" }}>
            <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary-dark)" }}>
              Caterer Information
            </h4>
          </div>

          <div>
            <Label htmlFor="name" required>Caterer Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter caterer name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="caterer@example.com"
              required
            />
          </div>

          {archiveAction && (
            <Button type="button" variant="secondary" fullWidth onClick={archiveAction.onClick}>
              <Archive size={16} /> {archiveAction.label}
            </Button>
          )}

          <HStack justify="end" gap="small" style={{ paddingTop: "var(--spacing-5)", marginTop: "auto", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

const CatererDetailsModal = ({ caterer, onClose }) => {
  if (!caterer) return null

  const formatDate = (date) => {
    if (!date) return "Not available"
    return new Date(date).toLocaleString()
  }

  return (
    <Modal isOpen={Boolean(caterer)} onClose={onClose} title="Caterer Details" width={560} minHeight="50vh">
      <VStack gap="large">
        <div style={{ backgroundColor: "var(--color-primary-bg)", padding: "var(--spacing-4)", borderRadius: "var(--radius-lg)" }}>
          <HStack gap="medium" align="center">
            <div className="w-[52px] h-[52px] rounded-[16px] flex items-center justify-center" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-primary)" }}>
              <UtensilsCrossed size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)" }}>
                {caterer.name}
              </h3>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                {caterer.isArchived ? "Archived caterer" : "Active caterer"}
              </p>
            </div>
          </HStack>
        </div>

        <VStack gap="medium">
          <HStack justify="between" gap="medium">
            <span style={{ color: "var(--color-text-muted)" }}>Email</span>
            <span style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>{caterer.email}</span>
          </HStack>
          <HStack justify="between" gap="medium">
            <span style={{ color: "var(--color-text-muted)" }}>Created</span>
            <span style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>{formatDate(caterer.createdAt)}</span>
          </HStack>
          <HStack justify="between" gap="medium">
            <span style={{ color: "var(--color-text-muted)" }}>Last Updated</span>
            <span style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>{formatDate(caterer.updatedAt)}</span>
          </HStack>
        </VStack>

        <HStack justify="end" style={{ paddingTop: "var(--spacing-5)", marginTop: "auto", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </HStack>
      </VStack>
    </Modal>
  )
}

const CatererCard = ({ caterer, onEdit, onView }) => {
  return (
    <Card className="group">
      <CardHeader>
        <HStack gap="medium" align="center">
          <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center transition-all duration-300" style={{ backgroundColor: "var(--color-primary-bg)", color: "var(--color-primary)" }}>
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)" }}>
              {caterer.name}
            </h3>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              {caterer.isArchived ? "Archived" : "Active"}
            </p>
          </div>
        </HStack>
      </CardHeader>

      <CardBody style={{ marginBottom: "var(--spacing-5)" }}>
        <VStack gap="small">
          <HStack gap="xsmall" align="center" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>
            <Mail size={16} style={{ color: "var(--color-text-muted)" }} />
            <span>{caterer.email}</span>
          </HStack>
          <HStack gap="xsmall" align="center" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>
            <Store size={16} style={{ color: "var(--color-text-muted)" }} />
            <span>Dining caterer profile</span>
          </HStack>
        </VStack>
      </CardBody>

      <CardFooter style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", marginTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
          <Button onClick={() => onEdit(caterer)} variant="secondary" size="md" fullWidth>
            <Pencil size={16} /> Edit Details
          </Button>
          <Button onClick={() => onView(caterer)} variant="secondary" size="md" fullWidth>
            <ClipboardList size={16} /> View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

const CaterersPage = () => {
  const [caterers, setCaterers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [fetchArchive, setFetchArchive] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCaterer, setEditingCaterer] = useState(null)
  const [viewingCaterer, setViewingCaterer] = useState(null)

  const filteredCaterers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return caterers

    return caterers.filter((caterer) => {
      return (
        caterer.name.toLowerCase().includes(normalizedSearch) ||
        caterer.email.toLowerCase().includes(normalizedSearch)
      )
    })
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

  const handleArchiveToggle = () => {
    const nextArchiveState = !fetchArchive
    setFetchArchive(nextArchiveState)
    fetchCaterers(nextArchiveState)
  }

  const handleAddCaterer = async (payload) => {
    await adminApi.addCaterer(payload)
    await fetchCaterers()
  }

  const handleUpdateCaterer = async (payload) => {
    if (!editingCaterer?.id) return

    await adminApi.updateCaterer(editingCaterer.id, payload)
    await fetchCaterers()
    setEditingCaterer(null)
  }

  const handleArchiveCaterer = async () => {
    if (!editingCaterer?.id) return

    const action = editingCaterer.isArchived ? "unarchive" : "archive"
    const shouldProceed = window.confirm(`Are you sure you want to ${action} this caterer?`)
    if (!shouldProceed) return

    try {
      await adminApi.changeCatererArchiveStatus(editingCaterer.id, !editingCaterer.isArchived)
      setEditingCaterer(null)
      await fetchCaterers()
    } catch (error) {
      alert(getErrorMessage(error, `Unable to ${action} caterer. Please try again.`))
    }
  }

  useEffect(() => {
    fetchCaterers(false)
  }, [])

  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Caterer Management">
          <Button variant="secondary" onClick={handleArchiveToggle}>
            <Archive size={18} /> {fetchArchive ? "Show Active" : "Show Archived"}
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Caterer
          </Button>
        </PageHeader>

        <div className="flex-1 overflow-y-scroll px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
          <CatererStats caterers={caterers} fetchArchive={fetchArchive} />

          <div className="mt-[var(--spacing-8)] flex justify-end">
            <div className="w-full sm:w-[16rem] md:w-[18rem]">
              <SearchInput
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search caterer..."
              />
            </div>
          </div>

          <div className="mt-[var(--spacing-6)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-4)] md:gap-[var(--spacing-6)]">
            {filteredCaterers.map((caterer) => (
              <CatererCard
                key={caterer.id}
                caterer={caterer}
                onEdit={setEditingCaterer}
                onView={setViewingCaterer}
              />
            ))}
          </div>

          {filteredCaterers.length === 0 && (
            <EmptyState
              icon={Search}
              title="No Caterers Found"
              message="No caterers match your search criteria. Try adjusting your search or archive view."
            />
          )}
        </div>
      </div>

      <CatererFormModal
        isOpen={showAddModal}
        title="Add New Caterer"
        submitLabel="Add Caterer"
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCaterer}
      />

      <CatererFormModal
        isOpen={Boolean(editingCaterer)}
        title="Edit Caterer Details"
        submitLabel="Save Changes"
        initialData={editingCaterer || initialFormState}
        onClose={() => setEditingCaterer(null)}
        onSubmit={handleUpdateCaterer}
        archiveAction={
          editingCaterer
            ? {
              label: editingCaterer.isArchived ? "Unarchive Caterer" : "Archive Caterer",
              onClick: handleArchiveCaterer,
            }
            : null
        }
      />

      <CatererDetailsModal caterer={viewingCaterer} onClose={() => setViewingCaterer(null)} />
    </>
  )
}

export default CaterersPage
