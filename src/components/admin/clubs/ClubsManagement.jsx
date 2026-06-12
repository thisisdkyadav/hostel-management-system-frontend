import { useEffect, useMemo, useState } from "react"
import { Button, Input, Modal } from "czero/react"
import { Building2, Pencil, Plus, Users } from "lucide-react"
import toast from "react-hot-toast"
import NoResults from "../../common/NoResults"
import { Card, CardBody, CardFooter, CardHeader, Label, SearchInput, Select, StatCards } from "@/components/ui"
import { clubApi } from "../../../service"

const createDefaultForm = () => ({
  name: "",
  email: "",
  gymkhanaCategoryKey: "",
})

const normalizeCategoryOptions = (categories = []) =>
  (Array.isArray(categories) ? categories : [])
    .map((category) => ({
      value: String(category?.key || "").trim(),
      label: String(category?.label || "").trim(),
    }))
    .filter((category) => category.value && category.label)

const ClubFormFields = ({ formData, onChange, categoryOptions, fieldPrefix = "club", disabled = false }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <Label htmlFor={`${fieldPrefix}-name`} required>Name</Label>
        <Input
          id={`${fieldPrefix}-name`}
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="Club name"
          required
          disabled={disabled}
        />
      </div>

      <div>
        <Label htmlFor={`${fieldPrefix}-email`} required>Email</Label>
        <Input
          id={`${fieldPrefix}-email`}
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder="club@iitb.ac.in"
          required
          disabled={disabled}
        />
      </div>

      <div>
        <Label htmlFor={`${fieldPrefix}-category`} required>GS Category</Label>
        <Select
          id={`${fieldPrefix}-category`}
          name="gymkhanaCategoryKey"
          value={formData.gymkhanaCategoryKey}
          onChange={onChange}
          options={categoryOptions}
          placeholder="Select GS category"
          disabled={disabled}
          required
        />
      </div>
    </div>
  )
}

const ClubModal = ({
  title,
  submitLabel,
  formData,
  categoryOptions,
  isOpen,
  isSaving,
  fieldPrefix,
  onClose,
  onChange,
  onSubmit,
}) => {
  if (!isOpen) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit?.()
  }

  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose} width={760} minHeight="50vh">
      <form onSubmit={handleSubmit} className="flex min-h-[42vh] flex-col justify-between gap-6">
        <div className="space-y-6">
          <ClubFormFields
            formData={formData}
            onChange={onChange}
            categoryOptions={categoryOptions}
            fieldPrefix={fieldPrefix}
            disabled={isSaving}
          />

          {categoryOptions.length === 0 ? (
            <div
              style={{
                borderRadius: "var(--radius-lg)",
                border: "var(--border-1) solid var(--color-border-primary)",
                backgroundColor: "var(--color-bg-secondary)",
                padding: "var(--spacing-4)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
              }}
            >
              No GS categories are configured yet. Add them in Settings before creating or updating clubs.
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" loading={isSaving} disabled={isSaving || categoryOptions.length === 0}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

const EditClubModal = ({ club, categoryOptions, isOpen, isSaving, onClose, onSave }) => {
  const [formData, setFormData] = useState(createDefaultForm())

  useEffect(() => {
    if (!club) {
      setFormData(createDefaultForm())
      return
    }

    setFormData({
      name: club.name || "",
      email: club.email || "",
      gymkhanaCategoryKey: club.gymkhanaCategoryKey || "",
    })
  }, [club])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  return (
    <ClubModal
      title={club ? `Edit ${club.name}` : "Edit Club"}
      submitLabel="Save Changes"
      formData={formData}
      categoryOptions={categoryOptions}
      isOpen={isOpen && Boolean(club)}
      isSaving={isSaving}
      fieldPrefix="edit-club"
      onClose={onClose}
      onChange={handleChange}
      onSubmit={() => onSave?.(formData)}
    />
  )
}

const ClubsManagement = ({ showAddModal = false, setShowAddModal }) => {
  const [clubs, setClubs] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [createForm, setCreateForm] = useState(createDefaultForm())
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editingClub, setEditingClub] = useState(null)

  const closeAddModal = () => {
    setShowAddModal?.(false)
    setCreateForm(createDefaultForm())
  }

  const fetchClubs = async ({ keepLoadingState = false } = {}) => {
    if (!keepLoadingState) {
      setIsLoading(true)
    }

    try {
      const response = await clubApi.list()
      setClubs(Array.isArray(response?.clubs) ? response.clubs : [])
      setCategoryOptions(normalizeCategoryOptions(response?.gymkhanaCategories))
    } catch (error) {
      console.error("Failed to load clubs:", error)
      toast.error(error?.message || "Failed to load clubs.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClubs()
  }, [])

  const filteredClubs = useMemo(() => {
    const normalizedSearch = String(searchTerm || "").trim().toLowerCase()
    if (!normalizedSearch) return clubs

    return clubs.filter((club) =>
      [club.name, club.email, club.gymkhanaCategoryLabel]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    )
  }, [clubs, searchTerm])

  const handleCreateChange = (event) => {
    const { name, value } = event.target
    setCreateForm((current) => ({ ...current, [name]: value }))
  }

  const handleCreateClub = async () => {
    setIsCreating(true)

    try {
      await clubApi.create(createForm)
      toast.success("Club created successfully. Login account created with the same email.")
      setCreateForm(createDefaultForm())
      setShowAddModal?.(false)
      await fetchClubs({ keepLoadingState: true })
    } catch (error) {
      console.error("Failed to create club:", error)
      toast.error(error?.message || "Failed to create club.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleSaveEdit = async (formData) => {
    if (!editingClub?.id) return

    setIsSavingEdit(true)

    try {
      await clubApi.update(editingClub.id, formData)
      toast.success("Club updated successfully.")
      setEditingClub(null)
      await fetchClubs({ keepLoadingState: true })
    } catch (error) {
      console.error("Failed to update club:", error)
      toast.error(error?.message || "Failed to update club.")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const stats = useMemo(() => {
    const categoryCounts = clubs.reduce((counts, club) => {
      const key = String(club?.gymkhanaCategoryKey || "").trim()
      if (!key) return counts
      counts[key] = (counts[key] || 0) + 1
      return counts
    }, {})

    return [
      {
        title: "Total Clubs",
        value: clubs.length,
        subtitle: `${categoryOptions.length} GS categories configured`,
        icon: <Users />,
        color: "var(--color-primary)",
      },
      ...categoryOptions.map((category, index) => {
        const palette = [
          "var(--color-primary)",
          "var(--color-success)",
          "var(--color-warning)",
          "var(--color-info)",
          "var(--color-danger)",
        ]
        return {
          _key: category.value,
          title: category.label,
          value: categoryCounts[category.value] || 0,
          subtitle: `${categoryCounts[category.value] || 0} club${categoryCounts[category.value] === 1 ? "" : "s"}`,
          icon: <Building2 />,
          color: palette[index % palette.length],
        }
      }),
    ]
  }, [clubs, categoryOptions])

  return (
    <div className="mt-6">
      <div style={{ marginBottom: "var(--spacing-6)" }}>
        <StatCards
          stats={stats}
          columns={Math.min(Math.max(stats.length, 1), 5)}
          loading={isLoading}
          loadingCount={Math.min(Math.max(stats.length, 1), 5)}
        />
      </div>

      {categoryOptions.length === 0 && !isLoading ? (
        <div
          style={{
            marginBottom: "var(--spacing-6)",
            borderRadius: "var(--radius-lg)",
            border: "var(--border-1) solid var(--color-border-primary)",
            backgroundColor: "var(--color-bg-secondary)",
            padding: "var(--spacing-4)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
          }}
        >
          No GS categories are configured yet. Add them in Settings before creating clubs.
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            style={{
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-secondary)",
            }}
          >
            Existing Clubs
          </h2>
          <p
            style={{
              marginTop: "var(--spacing-1)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-muted)",
            }}
          >
            Review clubs and update their details anytime.
          </p>
        </div>

        <SearchInput
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search clubs by name, email, or category"
          className="w-full sm:w-80"
        />
      </div>

      {isLoading ? (
        <div
          className="mt-6 flex items-center justify-center rounded-2xl"
          style={{
            minHeight: "14rem",
            backgroundColor: "var(--color-bg-primary)",
            border: "var(--border-1) solid var(--color-border-primary)",
            color: "var(--color-text-muted)",
          }}
        >
          Loading clubs...
        </div>
      ) : filteredClubs.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredClubs.map((club) => (
            <Card key={club.id} className="overflow-hidden">
              <CardHeader className="mb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3
                      style={{
                        fontSize: "var(--font-size-lg)",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {club.name}
                    </h3>
                    <p
                      style={{
                        marginTop: "var(--spacing-1)",
                        fontSize: "var(--font-size-sm)",
                        color: "var(--color-text-muted)",
                        wordBreak: "break-word",
                      }}
                    >
                      {club.email}
                    </p>
                  </div>

                  <div
                    style={{
                      flexShrink: 0,
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--color-primary-bg)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Users size={16} />
                  </div>
                </div>
              </CardHeader>

              <CardBody style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>GS Category</span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--spacing-2)",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--color-primary-bg)",
                      color: "var(--color-primary)",
                      padding: "var(--spacing-1) var(--spacing-3)",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    <Building2 size={14} />
                    {club.gymkhanaCategoryLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Last Updated</span>
                  <span style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
                    {club.updatedAt
                      ? new Date(club.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </CardBody>

              <CardFooter
                style={{
                  marginTop: "var(--spacing-5)",
                  paddingTop: "var(--spacing-4)",
                  borderTop: "var(--border-1) solid var(--color-border-primary)",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingClub(club)}>
                  <Pencil size={16} /> Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <NoResults
            icon={<Users size={48} style={{ color: "var(--color-border-primary)" }} />}
            message={clubs.length === 0 ? "No clubs created yet" : "No clubs match your search"}
            suggestion={
              clubs.length === 0
                ? "Create your first club using the Add button above."
                : "Try a different name, email, or GS category."
            }
          />
        </div>
      )}

      <EditClubModal
        club={editingClub}
        categoryOptions={categoryOptions}
        isOpen={Boolean(editingClub)}
        isSaving={isSavingEdit}
        onClose={() => setEditingClub(null)}
        onSave={handleSaveEdit}
      />

      <ClubModal
        title="Add Club"
        submitLabel="Create Club"
        formData={createForm}
        categoryOptions={categoryOptions}
        isOpen={showAddModal}
        isSaving={isCreating}
        fieldPrefix="create-club"
        onClose={closeAddModal}
        onChange={handleCreateChange}
        onSubmit={handleCreateClub}
      />
    </div>
  )
}

export default ClubsManagement
