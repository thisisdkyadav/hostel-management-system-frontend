import { useEffect, useMemo, useState } from "react"
import { Button } from "czero/react"
import { Archive, ArchiveRestore, CalendarDays, Plus, UtensilsCrossed, Users } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { adminApi } from "../../service"
import { Alert, ConfirmDialog, EmptyState, SearchInput, StatCards } from "@/components/ui"
import PeriodCard from "@/components/dining/PeriodCard"
import PeriodDetailModal from "@/components/dining/PeriodDetailModal"
import PeriodFormModal from "@/components/dining/PeriodFormModal"
import {
  ELIGIBILITY_MODE_CUSTOM,
  getErrorMessage,
  normalizePeriod,
} from "@/components/dining/diningPeriodHelpers"

const LIFECYCLE_SECTIONS = [
  { key: "Open", title: "Active now" },
  { key: "Upcoming", title: "Upcoming" },
  { key: "Closed", title: "Closed" },
]

const SectionHeader = ({ title, count }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", marginBottom: "var(--spacing-3)" }}>
    <h2
      style={{
        margin: 0,
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-semibold)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "var(--color-text-muted)",
      }}
    >
      {title}
    </h2>
    <span
      style={{
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-semibold)",
        color: "var(--color-text-secondary)",
        backgroundColor: "var(--color-bg-hover)",
        borderRadius: "var(--radius-full)",
        padding: "0 var(--spacing-2)",
        minWidth: "20px",
        textAlign: "center",
      }}
    >
      {count}
    </span>
    <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border-primary)" }} />
  </div>
)

const DiningPeriodsPage = () => {
  const [periods, setPeriods] = useState([])
  const [caterers, setCaterers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [fetchArchive, setFetchArchive] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState(null)
  const [viewingPeriod, setViewingPeriod] = useState(null)
  const [archiveTarget, setArchiveTarget] = useState(null)

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

  const sections = useMemo(() => {
    if (fetchArchive) {
      return [{ key: "Archived", title: "Archived", items: filteredPeriods }]
    }
    return LIFECYCLE_SECTIONS.map((section) => ({
      ...section,
      items: filteredPeriods.filter((period) => period.status === section.key),
    })).filter((section) => section.items.length > 0)
  }, [filteredPeriods, fetchArchive])

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
      setCaterers(
        Array.isArray(response)
          ? response.map((caterer) => ({
              id: String(caterer.id || caterer._id),
              name: caterer.name || "",
              email: caterer.email || "",
            }))
          : []
      )
    } catch (error) {
      console.error("Error fetching caterers:", error)
      setCaterers([])
    }
  }

  useEffect(() => {
    fetchPeriods(false)
    fetchCaterers()
  }, [])

  const handleArchiveToggle = () => {
    const next = !fetchArchive
    setFetchArchive(next)
    fetchPeriods(next)
  }

  const handleAddPeriod = async (payload) => {
    await adminApi.addDiningPeriod(payload)
    setFeedback({ type: "success", message: "Dining period created." })
    await fetchPeriods()
  }

  const handleUpdatePeriod = async (payload) => {
    if (!editingPeriod?.id) return
    await adminApi.updateDiningPeriod(editingPeriod.id, payload)
    setEditingPeriod(null)
    setFeedback({ type: "success", message: "Dining period updated." })
    await fetchPeriods()
  }

  const handleConfirmArchive = async () => {
    if (!archiveTarget?.id) return
    const action = archiveTarget.isArchived ? "unarchive" : "archive"
    try {
      await adminApi.changeDiningPeriodArchiveStatus(archiveTarget.id, !archiveTarget.isArchived)
      setArchiveTarget(null)
      setEditingPeriod(null)
      setViewingPeriod(null)
      setFeedback({ type: "success", message: `Dining period ${action}d.` })
      await fetchPeriods()
    } catch (error) {
      setArchiveTarget(null)
      setFeedback({ type: "error", message: getErrorMessage(error, `Unable to ${action} dining period.`) })
    }
  }

  const openEdit = (period) => {
    setViewingPeriod(null)
    setEditingPeriod(period)
  }

  const stats = useMemo(() => {
    const openCount = periods.filter((period) => period.status === "Open").length
    const upcomingCount = periods.filter((period) => period.status === "Upcoming").length
    const customCount = periods.filter((period) => period.eligibilityMode === ELIGIBILITY_MODE_CUSTOM).length
    return [
      {
        title: fetchArchive ? "Archived Periods" : "Visible Periods",
        value: periods.length,
        subtitle: fetchArchive ? "Hidden dining windows" : "Dining allocation windows",
        icon: <CalendarDays size={20} />,
        color: "var(--color-primary)",
      },
      {
        title: "Active now",
        value: openCount,
        subtitle: "Currently open",
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
    ]
  }, [periods, fetchArchive])

  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Dining Periods">
          <Button variant="secondary" onClick={handleArchiveToggle}>
            {fetchArchive ? <ArchiveRestore size={18} /> : <Archive size={18} />}
            {fetchArchive ? "Show Active" : "Show Archived"}
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Period
          </Button>
        </PageHeader>

        <div className="flex-1 overflow-y-auto px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
          {feedback && (
            <Alert
              type={feedback.type}
              icon
              dismissible
              onDismiss={() => setFeedback(null)}
              style={{ marginBottom: "var(--spacing-4)" }}
            >
              {feedback.message}
            </Alert>
          )}

          <StatCards columns={4} stats={stats} />

          <div className="mt-[var(--spacing-6)] flex justify-end">
            <div className="w-full sm:w-[18rem]">
              <SearchInput
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search periods..."
              />
            </div>
          </div>

          {sections.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No Dining Periods Found"
              message={
                fetchArchive
                  ? "No archived dining periods match your search."
                  : "Create a dining period or adjust your search to get started."
              }
            />
          ) : (
            <div className="mt-[var(--spacing-6)] flex flex-col gap-[var(--spacing-8)]">
              {sections.map((section) => (
                <section key={section.key}>
                  <SectionHeader title={section.title} count={section.items.length} />
                  <div className="grid gap-[var(--spacing-4)] sm:grid-cols-2 xl:grid-cols-3">
                    {section.items.map((period) => (
                      <PeriodCard key={period.id} period={period} onView={setViewingPeriod} onEdit={openEdit} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      <PeriodDetailModal
        period={viewingPeriod}
        isOpen={Boolean(viewingPeriod)}
        onClose={() => setViewingPeriod(null)}
        onEdit={openEdit}
        onToggleArchive={setArchiveTarget}
      />

      <PeriodFormModal
        isOpen={showAddModal}
        title="Add Dining Period"
        submitLabel="Create Period"
        mode="create"
        caterers={caterers}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPeriod}
      />

      <PeriodFormModal
        isOpen={Boolean(editingPeriod)}
        title="Edit Dining Period"
        submitLabel="Save Changes"
        mode="edit"
        initialData={editingPeriod || undefined}
        caterers={caterers}
        onClose={() => setEditingPeriod(null)}
        onSubmit={handleUpdatePeriod}
        archiveAction={
          editingPeriod
            ? {
                label: editingPeriod.isArchived ? "Unarchive Period" : "Archive Period",
                isArchived: editingPeriod.isArchived,
                onClick: () => setArchiveTarget(editingPeriod),
              }
            : null
        }
      />

      <ConfirmDialog
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleConfirmArchive}
        title={archiveTarget?.isArchived ? "Unarchive Period" : "Archive Period"}
        message={
          archiveTarget?.isArchived
            ? "This dining period will be visible and editable again."
            : "Archiving hides this period and stops new student allocations. Existing data is kept."
        }
        confirmText={archiveTarget?.isArchived ? "Unarchive" : "Archive"}
        isDestructive={!archiveTarget?.isArchived}
      />
    </>
  )
}

export default DiningPeriodsPage
