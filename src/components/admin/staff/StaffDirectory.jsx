import { useEffect, useMemo, useState } from "react"
import { Eye, Pencil, Plus, SearchX } from "lucide-react"
import {
  Button, EmptyState, ErrorState, FilterTabs, Grid, HStack, Page, ProfileCard,
  SearchInput, Skeleton, StatCards, Badge,
} from "hzero"
import PageHeader from "../../common/PageHeader"
import StaffFormModal from "./StaffFormModal"
import { STAFF_TYPES } from "../../../config/staffDirectory"
import { adminApi } from "../../../service"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { getMediaUrl } from "../../../utils/mediaUtils"

/**
 * Every staff directory in the admin area.
 *
 * Eight screens listed people, narrowed the list, and opened an add or edit
 * form. They agreed on all of that and on none of the details — three grid
 * breakpoint sets, three empty states, two placements for the search box. The
 * page is here once; what differs is in config/staffDirectory.
 *
 *   <StaffDirectory type="warden" />
 */

const StaffDirectory = ({ type }) => {
  const config = STAFF_TYPES[type]
  const { hostelList } = useGlobal()

  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  // { mode: "create" } or { mode: "edit", staff }
  const [form, setForm] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [gymkhanaCategories, setGymkhanaCategories] = useState([])

  const ctx = useMemo(() => ({ hostelList, gymkhanaCategories }), [hostelList, gymkhanaCategories])

  const load = async () => {
    try {
      const response = await config.api.list()
      setStaff(response || [])
      setError(null)
    } catch (err) {
      console.error(`Error loading ${config.plural}:`, err)
      setError(`The ${config.plural.toLowerCase()} list could not be loaded.`)
    } finally {
      setLoading(false)
    }
  }

  // Wrapped rather than called directly: react-hooks/set-state-in-effect reads
  // any call to a setState-containing function as a synchronous one, and an
  // async function body is the boundary it recognises. Nothing is set before
  // the fetch returns in either case.
  useEffect(() => {
    const run = async () => { await load() }
    run()
  }, [type])

  // Only Gymkhana has a category list, and it is configurable rather than
  // constant, so it has to be fetched before its form can offer it.
  useEffect(() => {
    if (type !== "gymkhana") return
    let live = true
    adminApi
      .getGymkhanaEventCategories()
      .then((response) => {
        if (!live) return
        const list = Array.isArray(response?.value) ? response.value : []
        setGymkhanaCategories(
          list
            .map((c) => ({ key: String(c?.key || "").trim(), label: String(c?.label || "").trim() }))
            .filter((c) => c.key && c.label)
        )
      })
      .catch((err) => {
        console.error("Error loading Gymkhana categories:", err)
        if (live) setGymkhanaCategories([])
      })
    return () => {
      live = false
    }
  }, [type])

  const visible = useMemo(() => {
    const active = config.filters.find((f) => f.value === filter)
    const term = search.trim().toLowerCase()
    const matched = staff
      .filter((s) => !active?.match || active.match(s))
      .filter((s) => !term || config.search(s, ctx).some((field) => field && String(field).toLowerCase().includes(term)))
    return config.sort ? [...matched].sort(config.sort) : matched
  }, [staff, filter, search, config, ctx])

  const Icon = config.icon
  const Details = config.detailsModal

  // The config keeps icons as component references so it can stay pure data;
  // StatCards wants elements.
  const stats = useMemo(
    () => config.stats(staff).map((stat) => ({ ...stat, icon: <stat.icon /> })),
    [config, staff]
  )

  const body = () => {
    if (loading) {
      return (
        <Grid cols={config.gridCols} gap={4}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" height="12rem" />
          ))}
        </Grid>
      )
    }

    if (error) return <ErrorState message={error} onRetry={load} />

    if (visible.length === 0) {
      const filtered = staff.length > 0
      return (
        <EmptyState
          icon={filtered ? SearchX : Icon}
          title={filtered ? `No ${config.plural.toLowerCase()} match that` : `No ${config.plural.toLowerCase()} yet`}
          message={filtered ? "Try a different search or filter." : `Add the first ${config.title.toLowerCase()} to get started.`}
          action={filtered ? undefined : <Button variant="primary" onClick={() => setForm({ mode: "create" })}><Plus /> Add {config.title.toLowerCase()}</Button>}
        />
      )
    }

    return (
      <Grid cols={config.gridCols} gap={4}>
        {visible.map((person) => {
          const card = config.card(person, ctx)
          return (
            <ProfileCard
              key={person.id ?? person._id}
              name={person.name}
              subtitle={card.subtitle}
              icon={Icon}
              avatar={card.image ? { src: getMediaUrl(card.image) } : undefined}
              status={card.status && <Badge variant={card.status.variant} size="small">{card.status.label}</Badge>}
              meta={card.meta}
              actions={
                <>
                  {Details && (
                    <Button variant="secondary" size="sm" onClick={() => setViewing(person)}>
                      <Eye /> Details
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setForm({ mode: "edit", staff: person })}>
                    <Pencil /> Edit
                  </Button>
                </>
              }
            >
              {card.fields
                .filter((field) => field.value)
                .map((field) => (
                  <ProfileCard.Field key={field.label} icon={field.icon} label={field.label} value={field.value} />
                ))}
            </ProfileCard>
          )
        })}
      </Grid>
    )
  }

  return (
    <Page>
      <PageHeader title={config.plural}>
        <Button variant="primary" onClick={() => setForm({ mode: "create" })}>
          <Plus /> Add {config.title.toLowerCase()}
        </Button>
      </PageHeader>

      <Page.Body>
        {!error && (
          <StatCards
            stats={stats}
            columns={Math.min(stats.length, 4)}
            // A directory with a stat per category runs to eight of these; at
            // full size that is more stat than staff on the first screen.
            valueSize={stats.length > 4 ? "sm" : "lg"}
          />
        )}

        <HStack
          justify="between"
          align="center"
          gap="medium"
          className="mt-[var(--spacing-8)] flex-col sm:flex-row items-start sm:items-center"
        >
          {config.filters.length > 0 ? (
            <FilterTabs tabs={config.filters.map((f) => ({ value: f.value, label: f.label }))} activeTab={filter} setActiveTab={setFilter} />
          ) : (
            <span />
          )}
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={config.searchPlaceholder}
            className="w-full sm:w-[20rem]"
          />
        </HStack>

        <div className="mt-[var(--spacing-6)]">{body()}</div>

        {form && (
          <StaffFormModal
            config={config}
            mode={form.mode}
            staff={form.staff}
            ctx={ctx}
            onClose={() => setForm(null)}
            onSaved={load}
          />
        )}

        {viewing && Details && <Details staff={viewing} onClose={() => setViewing(null)} />}
      </Page.Body>
    </Page>
  )
}

export default StaffDirectory
