import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, EmptyState, ErrorState, FilterTabs, LoadingState, Page, Skeleton, Switch, useConfirm, useToast } from "hzero"
import { Plus, Tags } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { queryKeys } from "@/lib/query"
import { diningTagsApi } from "@/service"
import { getErrorMessage } from "@/components/dining/caterer/catererHelpers"
import TagDrawer from "@/components/dining/tags/TagDrawer"
import TagFormModal from "@/components/dining/tags/TagFormModal"
import TagList from "@/components/dining/tags/TagList"
import "@/components/dining/tags/Tags.css"

const TABS = [
  { value: "standalone", label: "Standalone" },
  { value: "period", label: "Allocation tags" },
]
const NO_TAGS = []

const emptyCopy = (kind, showArchived) => {
  if (kind === "period") {
    return {
      title: "No allocation tags",
      message: showArchived
        ? "No allocation tags, archived or not. Add them while editing a dining period."
        : "Allocation tags are added while creating or editing a dining period. They then show up here.",
    }
  }
  return {
    title: "No standalone tags yet",
    message: "Create a tag such as \"Jain food\" to mark students for the kitchens, then set answers by hand, CSV or a student form.",
  }
}

/**
 * Dining Tags: yes/no student attributes (e.g. "Jain food"). Standalone tags are created and edited
 * here; allocation tags are defined in the dining period form and only listed (read-only) here.
 * Answers for either kind are managed in the tag drawer. For Admin and the Dining Office.
 */
const DiningTagsPage = () => {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showArchived, setShowArchived] = useState(false)
  const [openTagId, setOpenTagId] = useState(null)
  // { tag } while the form is open; tag is null when creating.
  const [editing, setEditing] = useState(null)

  const kind = searchParams.get("tab") === "period" ? "period" : "standalone"
  const pickKind = (next) => {
    const params = new URLSearchParams(searchParams)
    if (next === "standalone") params.delete("tab")
    else params.set("tab", next)
    setSearchParams(params, { replace: true })
    setOpenTagId(null)
  }

  const liveQuery = useQuery({
    queryKey: queryKeys.diningTags.list({ kind, archived: false }),
    queryFn: () => diningTagsApi.getTags({ kind, archived: false }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
  const archivedQuery = useQuery({
    queryKey: queryKeys.diningTags.list({ kind, archived: true }),
    queryFn: () => diningTagsApi.getTags({ kind, archived: true }),
    enabled: showArchived,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })

  const live = liveQuery.data
  const archived = archivedQuery.data
  const tags = useMemo(() => [...(live || NO_TAGS), ...(showArchived ? archived || NO_TAGS : NO_TAGS)], [live, archived, showArchived])
  const openTag = tags.find((item) => item.id === openTagId) || null

  const archive = useMutation({
    mutationFn: ({ tag, next }) => diningTagsApi.setTagArchived(tag.id, next),
    onSuccess: async (_saved, { tag, next }) => {
      toast.success(next ? `Archived ${tag.name}` : `Restored ${tag.name}`)
      if (openTagId === tag.id) setOpenTagId(null)
      await queryClient.invalidateQueries({ queryKey: queryKeys.diningTags.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to update the tag.")),
  })

  const runArchive = async (tag) => {
    const next = !tag.isArchived
    const ok = await confirm({
      title: next ? "Archive this tag?" : "Restore this tag?",
      message: next
        ? `${tag.name} stops applying and students can no longer answer it. Answers already given are kept, and you can restore it later.`
        : `${tag.name} will be active again.`,
      confirmText: next ? "Archive" : "Restore",
      isDestructive: next,
    })
    if (ok) archive.mutate({ tag, next })
  }

  const header = (
    <PageHeader title="Dining Tags" subtitle="Mark students for special dining needs, like Jain food.">
      <Button size="sm" onClick={() => setEditing({ tag: null })}>
        <Plus size={16} /> New tag
      </Button>
    </PageHeader>
  )

  if (liveQuery.isPending && !live) {
    return (
      <Page>
        {header}
        <Page.Body>
          <LoadingState message="Loading tags..." />
        </Page.Body>
      </Page>
    )
  }

  const stale = liveQuery.isPlaceholderData || (showArchived && archivedQuery.isPlaceholderData)
  const copy = emptyCopy(kind, showArchived)

  return (
    <Page>
      {header}
      <Page.Body>
        <div className="tg-page">
          <div className="tg-bar">
            <div className="tg-bar__tabs">
              <FilterTabs tabs={TABS} activeTab={kind} setActiveTab={pickKind} size="sm" />
            </div>
            <div className="tg-bar__end">
              <Switch size="small" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} label="Show archived" />
            </div>
          </div>

          {liveQuery.isError && !live ? (
            <ErrorState message={getErrorMessage(liveQuery.error, "Unable to load the tags.")} onRetry={() => liveQuery.refetch()} />
          ) : showArchived && archivedQuery.isError && !archived ? (
            <ErrorState message={getErrorMessage(archivedQuery.error, "Unable to load archived tags.")} onRetry={() => archivedQuery.refetch()} />
          ) : showArchived && archivedQuery.isPending ? (
            <div className="tg-page__loading" aria-busy="true">
              <Skeleton variant="rounded" height={160} />
            </div>
          ) : tags.length === 0 ? (
            <EmptyState
              icon={Tags}
              title={copy.title}
              message={copy.message}
              buttonText={kind === "standalone" ? "New tag" : undefined}
              buttonAction={kind === "standalone" ? () => setEditing({ tag: null }) : undefined}
            />
          ) : (
            <div className="tg-list-wrap" data-stale={stale || undefined}>
              <TagList tags={tags} onOpen={setOpenTagId} onEdit={(tag) => setEditing({ tag })} onArchive={runArchive} />
            </div>
          )}
        </div>

        <TagDrawer tag={openTag} onClose={() => setOpenTagId(null)} />
        <TagFormModal isOpen={Boolean(editing)} tag={editing?.tag || null} onClose={() => setEditing(null)} />
      </Page.Body>
    </Page>
  )
}

export default DiningTagsPage
