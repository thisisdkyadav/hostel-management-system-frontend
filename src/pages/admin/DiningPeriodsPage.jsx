import { useEffect, useMemo, useState } from "react"
import { Alert, Button, ConfirmDialog, EmptyState, Grid, Heading, HStack, Page, SearchInput, StatCards, Surface, VStack } from "hzero"
import { Archive, ArchiveRestore, CalendarDays, Plus, UtensilsCrossed, Users } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { adminApi } from "../../service"
import PeriodCard from "@/components/dining/PeriodCard"
import PeriodDetailModal from "@/components/dining/PeriodDetailModal"
import PeriodFormModal from "@/components/dining/PeriodFormModal"
import ManageAllocationsModal from "@/components/dining/ManageAllocationsModal"
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
  <HStack gap={2} align="center" style={{ marginBottom: "var(--spacing-3)" }}>
    <Heading as="h2" size="sm" weight="semibold" color="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {title}
    </Heading>
    <Surface as="span" bg="var(--color-bg-hover)" padding="0 var(--spacing-2)" radius="full" color="secondary" size="xs" weight="semibold" align="center" style={{ minWidth: "20px" }}>
      {count}
    </Surface>
    <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border-primary)" }} />
  </HStack>
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
  const [managingPeriod, setManagingPeriod] = useState(null)
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
      <Page>
        <PageHeader title="Dining Periods">
          <Button variant="secondary" onClick={handleArchiveToggle}>
            {fetchArchive ? <ArchiveRestore size={18} /> : <Archive size={18} />}
            {fetchArchive ? "Show Active" : "Show Archived"}
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Period
          </Button>
        </PageHeader>

        <Page.Body>
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
            <VStack gap={8} className="mt-[var(--spacing-6)]">
              {sections.map((section) => (
                <section key={section.key}>
                  <SectionHeader title={section.title} count={section.items.length} />
                  <Grid cols={{ sm: 2, xl: 3 }} gap={4}>
                    {section.items.map((period) => (
                      <PeriodCard
                        key={period.id}
                        period={period}
                        onView={setViewingPeriod}
                        onEdit={openEdit}
                        onManage={setManagingPeriod}
                      />
                    ))}
                  </Grid>
                </section>
              ))}
            </VStack>
          )}
        </Page.Body>
      </Page>

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

      <ManageAllocationsModal
        isOpen={Boolean(managingPeriod)}
        period={managingPeriod}
        onClose={() => setManagingPeriod(null)}
        onChanged={() => fetchPeriods()}
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
