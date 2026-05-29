import { useEffect, useMemo, useRef, useState } from "react"
import Papa from "papaparse"
import { Button, Input, Modal, Table } from "czero/react"
import {
  Archive,
  CalendarDays,
  FileDown,
  FileUp,
  Pencil,
  Plus,
  Search,
  Users,
  UtensilsCrossed,
} from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { adminApi } from "../../service"
import { Alert, EmptyState, FileInput, HStack, Label, SearchInput, StatCards, VStack } from "@/components/ui"
import { BULK_RECORD_LIMIT_MESSAGE, MAX_BULK_RECORDS } from "@/constants/systemLimits"

const ELIGIBILITY_MODE_ALL_ACTIVE = "all-active"
const ELIGIBILITY_MODE_CUSTOM = "custom"

const initialFormState = {
  startDate: "",
  endDate: "",
  catererIds: [],
  eligibilityMode: ELIGIBILITY_MODE_ALL_ACTIVE,
  eligibleRollNumbers: [],
}

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.message || fallback
}

const toDateInputValue = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

const formatDate = (value) => {
  if (!value) return "-"
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const normalizePeriod = (period = {}) => ({
  id: period.id || period._id,
  startDate: period.startDate,
  endDate: period.endDate,
  catererIds: Array.isArray(period.catererIds) ? period.catererIds.map((id) => String(id)) : [],
  caterers: Array.isArray(period.caterers) ? period.caterers : [],
  eligibilityMode: period.eligibilityMode || ELIGIBILITY_MODE_ALL_ACTIVE,
  eligibleRollNumbers: Array.isArray(period.eligibleRollNumbers) ? period.eligibleRollNumbers : [],
  eligibleStudentCount: Number(period.eligibleStudentCount || 0),
  isArchived: Boolean(period.isArchived),
  status: period.status || "Upcoming",
  createdAt: period.createdAt,
  updatedAt: period.updatedAt,
})

const DiningPeriodStats = ({ periods, fetchArchive }) => {
  const openCount = periods.filter((period) => period.status === "Open").length
  const upcomingCount = periods.filter((period) => period.status === "Upcoming").length
  const customCount = periods.filter((period) => period.eligibilityMode === ELIGIBILITY_MODE_CUSTOM).length

  return (
    <StatCards
      columns={4}
      stats={[
        {
          title: fetchArchive ? "Archived Periods" : "Visible Periods",
          value: periods.length,
          subtitle: fetchArchive ? "Hidden dining windows" : "Dining allocation windows",
          icon: <CalendarDays size={20} />,
          color: "var(--color-primary)",
        },
        {
          title: "Open",
          value: openCount,
          subtitle: "Currently active",
          icon: <UtensilsCrossed size={20} />,
          color: "var(--color-success)",
        },
        {
          title: "Upcoming",
          value: upcomingCount,
          subtitle: "Scheduled later",
          icon: <CalendarDays size={20} />,
          color: "var(--color-warning)",
        },
        {
          title: "Custom Lists",
          value: customCount,
          subtitle: "CSV eligibility",
          icon: <Users size={20} />,
          color: "var(--color-primary)",
        },
      ]}
    />
  )
}

const RollNumberCsvInput = ({ rollNumbers, onChange, disabled = false }) => {
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  const downloadTemplate = () => {
    const blob = new Blob(["rollNumber\n"], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "dining_period_students_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const parseCsv = (file) => {
    setError("")
    setFileName(file.name)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || []
        if (!headers.includes("rollNumber")) {
          setError("Missing required field: rollNumber")
          return
        }

        if (results.data.length > MAX_BULK_RECORDS) {
          setError(BULK_RECORD_LIMIT_MESSAGE)
          return
        }

        const parsedRollNumbers = [
          ...new Set(
            results.data
              .map((row) => String(row.rollNumber || "").trim().toUpperCase())
              .filter(Boolean)
          ),
        ]

        if (parsedRollNumbers.length === 0) {
          setError("No roll numbers found in the CSV.")
          return
        }

        onChange(parsedRollNumbers)
      },
      error: (parseError) => {
        setError(`Error parsing CSV: ${parseError.message}`)
      },
    })
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type && file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a valid CSV file.")
      return
    }

    parseCsv(file)
  }

  return (
    <VStack gap="small">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) fileInputRef.current?.click()
        }}
        style={{
          border: "var(--border-2) dashed var(--color-border-input)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--spacing-5)",
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          backgroundColor: "var(--color-bg-hover)",
          opacity: disabled ? 0.65 : 1,
        }}
      >
        <FileUp size={28} style={{ margin: "0 auto var(--spacing-2)", color: "var(--color-text-muted)" }} />
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          Upload CSV with a <strong>rollNumber</strong> column
        </p>
        {fileName && (
          <p style={{ color: "var(--color-primary)", fontSize: "var(--font-size-sm)", marginTop: "var(--spacing-2)" }}>
            Selected: {fileName}
          </p>
        )}
        <FileInput ref={fileInputRef} accept=".csv" onChange={handleFileChange} hidden disabled={disabled} />
      </div>

      <HStack justify="between" gap="small">
        <Button type="button" variant="secondary" size="sm" onClick={downloadTemplate}>
          <FileDown size={16} /> Download Template
        </Button>
        <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          {rollNumbers.length} roll number{rollNumbers.length === 1 ? "" : "s"} loaded
        </span>
      </HStack>

      {error && (
        <Alert type="error" icon>
          {error}
        </Alert>
      )}
    </VStack>
  )
}

const PeriodFormModal = ({
  isOpen,
  title,
  submitLabel,
  initialData = initialFormState,
  caterers,
  onClose,
  onSubmit,
  archiveAction = null,
}) => {
  const [formData, setFormData] = useState(initialFormState)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    setFormData({
      startDate: toDateInputValue(initialData.startDate),
      endDate: toDateInputValue(initialData.endDate),
      catererIds: Array.isArray(initialData.catererIds) ? initialData.catererIds.map((id) => String(id)) : [],
      eligibilityMode: initialData.eligibilityMode || ELIGIBILITY_MODE_ALL_ACTIVE,
      eligibleRollNumbers: Array.isArray(initialData.eligibleRollNumbers) ? initialData.eligibleRollNumbers : [],
    })
    setError("")
    setIsSubmitting(false)
  }, [initialData, isOpen])

  const handleCatererToggle = (catererId) => {
    setFormData((prev) => {
      const catererSet = new Set(prev.catererIds)
      if (catererSet.has(catererId)) catererSet.delete(catererId)
      else catererSet.add(catererId)
      return { ...prev, catererIds: [...catererSet] }
    })
  }

  const handleEligibilityModeChange = (mode) => {
    setFormData((prev) => ({
      ...prev,
      eligibilityMode: mode,
      eligibleRollNumbers: mode === ELIGIBILITY_MODE_ALL_ACTIVE ? [] : prev.eligibleRollNumbers,
    }))
  }

  const validateForm = () => {
    if (!formData.startDate || !formData.endDate) return "Start date and end date are required."
    if (new Date(formData.startDate) > new Date(formData.endDate)) return "Start date must be before or equal to end date."
    if (formData.catererIds.length === 0) return "Please select at least one caterer."
    if (formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM && formData.eligibleRollNumbers.length === 0) {
      return "Please upload at least one roll number for custom eligibility."
    }
    return ""
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationMessage = validateForm()
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        startDate: formData.startDate,
        endDate: formData.endDate,
        catererIds: formData.catererIds,
        eligibilityMode: formData.eligibilityMode,
        eligibleRollNumbers: formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM ? formData.eligibleRollNumbers : [],
      })
      onClose()
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to save dining period. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width={820} minHeight="60vh">
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          {error && (
            <Alert type="error" icon>
              {error}
            </Alert>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-4)" }}>
            <div>
              <Label htmlFor="startDate" required>Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, startDate: event.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate" required>End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, endDate: event.target.value }))}
                required
              />
            </div>
          </div>

          <VStack gap="small">
            <Label required>Allowed Caterers</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-2)" }}>
              {caterers.map((caterer) => (
                <label
                  key={caterer.id}
                  style={{
                    display: "flex",
                    gap: "var(--spacing-2)",
                    alignItems: "flex-start",
                    padding: "var(--spacing-3)",
                    border: "var(--border-1) solid var(--color-border-light)",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: formData.catererIds.includes(caterer.id) ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.catererIds.includes(caterer.id)}
                    onChange={() => handleCatererToggle(caterer.id)}
                    style={{ marginTop: 3 }}
                  />
                  <span>
                    <span style={{ display: "block", color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-semibold)" }}>{caterer.name}</span>
                    <span style={{ display: "block", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{caterer.email}</span>
                  </span>
                </label>
              ))}
            </div>
            {caterers.length === 0 && (
              <Alert type="warning" icon>
                No active caterers found. Please add a caterer before creating a period.
              </Alert>
            )}
          </VStack>

          <VStack gap="small">
            <Label required>Student Eligibility</Label>
            <HStack gap="small" style={{ flexWrap: "wrap" }}>
              <Button
                type="button"
                variant={formData.eligibilityMode === ELIGIBILITY_MODE_ALL_ACTIVE ? "primary" : "secondary"}
                onClick={() => handleEligibilityModeChange(ELIGIBILITY_MODE_ALL_ACTIVE)}
              >
                All Active Students
              </Button>
              <Button
                type="button"
                variant={formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM ? "primary" : "secondary"}
                onClick={() => handleEligibilityModeChange(ELIGIBILITY_MODE_CUSTOM)}
              >
                Custom Roll Number CSV
              </Button>
            </HStack>

            {formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM && (
              <RollNumberCsvInput
                rollNumbers={formData.eligibleRollNumbers}
                onChange={(rollNumbers) => setFormData((prev) => ({ ...prev, eligibleRollNumbers: rollNumbers }))}
              />
            )}
          </VStack>

          {archiveAction && (
            <Button type="button" variant="secondary" fullWidth onClick={archiveAction.onClick}>
              <Archive size={16} /> {archiveAction.label}
            </Button>
          )}

          <HStack justify="end" gap="small" style={{ paddingTop: "var(--spacing-5)", marginTop: "auto", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={isSubmitting} disabled={isSubmitting || caterers.length === 0}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

const DiningPeriodsPage = () => {
  const [periods, setPeriods] = useState([])
  const [caterers, setCaterers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [fetchArchive, setFetchArchive] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState(null)

  const filteredPeriods = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return periods

    return periods.filter((period) => {
      const catererNames = period.caterers.map((caterer) => caterer.name).join(" ")
      return (
        period.status.toLowerCase().includes(normalizedSearch) ||
        period.eligibilityMode.toLowerCase().includes(normalizedSearch) ||
        catererNames.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [periods, searchTerm])

  const fetchPeriods = async (archive = fetchArchive) => {
    try {
      const response = await adminApi.getAllDiningPeriods(archive ? "archive=true" : "")
      setPeriods(Array.isArray(response) ? response.map(normalizePeriod) : [])
    } catch (error) {
      console.error("Error fetching dining periods:", error)
      setPeriods([])
    }
  }

  const fetchCaterers = async () => {
    try {
      const response = await adminApi.getAllCaterers("")
      setCaterers(Array.isArray(response) ? response.map((caterer) => ({
        id: String(caterer.id || caterer._id),
        name: caterer.name || "",
        email: caterer.email || "",
      })) : [])
    } catch (error) {
      console.error("Error fetching caterers:", error)
      setCaterers([])
    }
  }

  const handleArchiveToggle = () => {
    const nextArchiveState = !fetchArchive
    setFetchArchive(nextArchiveState)
    fetchPeriods(nextArchiveState)
  }

  const handleAddPeriod = async (payload) => {
    await adminApi.addDiningPeriod(payload)
    await fetchPeriods()
  }

  const handleUpdatePeriod = async (payload) => {
    if (!editingPeriod?.id) return
    await adminApi.updateDiningPeriod(editingPeriod.id, payload)
    setEditingPeriod(null)
    await fetchPeriods()
  }

  const handleArchivePeriod = async () => {
    if (!editingPeriod?.id) return

    const action = editingPeriod.isArchived ? "unarchive" : "archive"
    const shouldProceed = window.confirm(`Are you sure you want to ${action} this dining period?`)
    if (!shouldProceed) return

    try {
      await adminApi.changeDiningPeriodArchiveStatus(editingPeriod.id, !editingPeriod.isArchived)
      setEditingPeriod(null)
      await fetchPeriods()
    } catch (error) {
      alert(getErrorMessage(error, `Unable to ${action} dining period. Please try again.`))
    }
  }

  useEffect(() => {
    fetchPeriods(false)
    fetchCaterers()
  }, [])

  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Dining Periods">
          <Button variant="secondary" onClick={handleArchiveToggle}>
            <Archive size={18} /> {fetchArchive ? "Show Active" : "Show Archived"}
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Period
          </Button>
        </PageHeader>

        <div className="flex-1 overflow-y-scroll px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
          <DiningPeriodStats periods={periods} fetchArchive={fetchArchive} />

          <div className="mt-[var(--spacing-8)] flex justify-end">
            <div className="w-full sm:w-[18rem]">
              <SearchInput
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search periods..."
              />
            </div>
          </div>

          <div className="mt-[var(--spacing-6)] overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Period</Table.Head>
                  <Table.Head>Caterers</Table.Head>
                  <Table.Head>Students</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredPeriods.map((period) => (
                  <Table.Row key={period.id}>
                    <Table.Cell>
                      <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>
                        {formatDate(period.startDate)} - {formatDate(period.endDate)}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {period.caterers.length > 0 ? period.caterers.map((caterer) => caterer.name).join(", ") : "-"}
                    </Table.Cell>
                    <Table.Cell>
                      {period.eligibilityMode === ELIGIBILITY_MODE_ALL_ACTIVE ? "All active students" : "Custom CSV"} ({period.eligibleStudentCount})
                    </Table.Cell>
                    <Table.Cell>{period.status}</Table.Cell>
                    <Table.Cell>
                      <Button variant="secondary" size="sm" onClick={() => setEditingPeriod(period)}>
                        <Pencil size={16} /> Edit
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {filteredPeriods.length === 0 && (
            <EmptyState
              icon={Search}
              title="No Dining Periods Found"
              message="No dining periods match your search criteria. Try adjusting your search or archive view."
            />
          )}
        </div>
      </div>

      <PeriodFormModal
        isOpen={showAddModal}
        title="Add Dining Period"
        submitLabel="Create Period"
        caterers={caterers}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPeriod}
      />

      <PeriodFormModal
        isOpen={Boolean(editingPeriod)}
        title="Edit Dining Period"
        submitLabel="Save Changes"
        initialData={editingPeriod || initialFormState}
        caterers={caterers}
        onClose={() => setEditingPeriod(null)}
        onSubmit={handleUpdatePeriod}
        archiveAction={
          editingPeriod
            ? {
              label: editingPeriod.isArchived ? "Unarchive Period" : "Archive Period",
              onClick: handleArchivePeriod,
            }
            : null
        }
      />
    </>
  )
}

export default DiningPeriodsPage
