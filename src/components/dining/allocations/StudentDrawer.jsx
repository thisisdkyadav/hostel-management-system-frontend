import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Avatar, Button, Drawer, DetailSection, InfoRow, Select, Skeleton, StatusBadge, useConfirm, useToast } from "hzero"
import { ArrowRightLeft, Banknote, CalendarClock, History, ShieldCheck, Tags, UserRound, UserMinus, Utensils } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { adminApi, diningAllocationsApi, diningTagsApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"
import { catererColor } from "../caterer/diningScope"
import { formatDayMonth, getErrorMessage, toDayKey } from "../caterer/catererHelpers"
import { clearanceTone, formatClearance } from "../diningBillingHelpers"
import { mealPaletteFor, slotKey } from "../meal-planner/mealPlanner"
import DiningTagChips from "../DiningTagChips"
import { describeTagEntry, formatCurrency, formatPct, tagChipsFor, PHASE_META, periodRange, programLabel, roomLabel, todayStatus } from "./allocationHelpers"
import "./Allocations.css"

const mentionsForce = (message) => /force/i.test(message || "")

const HistoryList = ({ studentId, currentPeriodId, palette, onPickPeriod }) => {
  const query = useQuery({
    queryKey: queryKeys.diningAllocations.history(studentId),
    queryFn: () => diningAllocationsApi.getStudentHistory(studentId),
    enabled: Boolean(studentId),
  })

  if (query.isPending) return <Skeleton variant="rounded" height={72} />
  if (query.isError) return <Alert type="error" icon>{getErrorMessage(query.error, "Unable to load the allocation history.")}</Alert>

  const history = query.data?.history || []
  if (!history.length) return <p className="al-muted">No other periods on record.</p>

  return (
    <ul className="al-history">
      {history.map((item) => {
        const meta = PHASE_META[item.phase] || PHASE_META.past
        const current = item.periodId === currentPeriodId
        return (
          <li key={item.periodId}>
            <button type="button" className="al-history__row" aria-current={current ? "true" : undefined} onClick={() => onPickPeriod(item.periodId)}>
              <span className="al-history__main">
                <span className="al-history__range">{periodRange(item.startDate, item.endDate)}</span>
                <span className="al-caterer" style={{ "--kitchen": catererColor(palette, item.caterer?.id) }}>
                  <span className="al-caterer__dot" aria-hidden="true" />
                  {item.caterer?.name}
                </span>
              </span>
              <StatusBadge tone={meta.tone} showDot={false}>{item.isArchived ? "Archived" : meta.label}</StatusBadge>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** One tag's answer for this student, with Yes / No / Clear controls when the viewer may manage it. */
const TagRow = ({ tag, entry, canManage, pending, onSet }) => {
  const info = describeTagEntry(entry, tag)
  const answered = entry && entry.value !== null && entry.value !== undefined
  return (
    <li className="al-tagrow">
      <div className="al-tagrow__main">
        <span className="al-tagrow__name">{tag.name}</span>
        <span className="al-tagrow__note">
          <StatusBadge tone={entry?.effective === true ? "warning" : "neutral"} showDot={false}>{info.label}</StatusBadge> {info.note}
        </span>
      </div>
      {canManage && (
        <div className="al-tagrow__actions" role="group" aria-label={`${tag.name} answer`}>
          <Button size="sm" variant={entry?.value === true ? "primary" : "secondary"} onClick={() => onSet(tag.id, true)} disabled={pending}>Yes</Button>
          <Button size="sm" variant={entry?.value === false ? "primary" : "secondary"} onClick={() => onSet(tag.id, false)} disabled={pending}>No</Button>
          <Button size="sm" variant="ghost" onClick={() => onSet(tag.id, null)} disabled={pending || !answered}>Clear</Button>
        </div>
      )}
    </li>
  )
}

const DrawerBody = ({ student, tags, period, slots, caterers, palette, canManage, oversight, onClose, onPickPeriod }) => {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const { toast } = useToast()
  const [target, setTarget] = useState("")
  const mealPalette = useMemo(() => mealPaletteFor(slots), [slots])

  const others = caterers.filter((caterer) => caterer.id !== student.caterer?.id)
  const moveTo = others.some((caterer) => caterer.id === target) ? target : others[0]?.id || ""

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.diningAllocations.all })

  const move = useMutation({
    mutationFn: ({ catererId, force }) => adminApi.assignDiningAllocation(period.id, { studentUserId: student.id, catererId, force }),
    onSuccess: async (res) => {
      toast.success(res?.message || `Moved ${student.name || student.rollNumber}`)
      await refresh()
    },
  })
  const setTag = useMutation({
    mutationFn: ({ tagId, value }) => diningTagsApi.setStudentValue(tagId, student.id, value),
    onSuccess: async () => {
      await Promise.all([refresh(), queryClient.invalidateQueries({ queryKey: queryKeys.diningTags.all })])
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to save the tag answer.")),
  })
  const markRegistered = useMutation({
    mutationFn: () => diningAllocationsApi.markRegistered(period.id, student.id),
    onSuccess: async () => {
      toast.success(`${student.name || student.rollNumber} is marked as registered`)
      await refresh()
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to mark the student as registered.")),
  })
  const remove = useMutation({
    mutationFn: () => adminApi.removeDiningAllocation(period.id, student.id),
    onSuccess: async () => {
      toast.success(`Removed ${student.name || student.rollNumber} from this period`)
      await refresh()
      onClose()
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to remove the student.")),
  })

  const runMove = async (catererId, force = false) => {
    try {
      await move.mutateAsync({ catererId, force })
    } catch (error) {
      const message = getErrorMessage(error, "Unable to move the student.")
      // A full kitchen asks for "force"; offer it rather than leaving the admin stuck.
      if (!force && mentionsForce(message)) {
        const ok = await confirm({
          title: "That caterer is full",
          message: `${message} Move ${student.name || student.rollNumber} anyway?`,
          confirmText: "Move anyway",
          isDestructive: true,
        })
        if (ok) await runMove(catererId, true)
        return
      }
      toast.error(message)
    }
  }

  const runMarkRegistered = async () => {
    const ok = await confirm({
      title: "Mark as registered?",
      message: `${student.name || student.rollNumber} will be able to request rebates for ${periodRange(period.startDate, period.endDate)} again.`,
      confirmText: "Mark as registered",
    })
    if (ok) markRegistered.mutate()
  }

  const runRemove = async () => {
    const ok = await confirm({
      title: "Remove from this period?",
      message: `${student.name || student.rollNumber} will no longer be allocated to ${student.caterer?.name} for ${periodRange(period.startDate, period.endDate)}.`,
      confirmText: "Remove",
      isDestructive: true,
    })
    if (ok) remove.mutate()
  }

  const tagChips = tagChipsFor(student, tags)
  const status = todayStatus(student)
  const showUsage = period.phase !== "upcoming"
  const rebateText = [
    `${student.rebateDays} taken`,
    student.approvedRebateDays > student.rebateDays ? `${student.approvedRebateDays - student.rebateDays} booked ahead` : null,
    student.pendingRebates ? `${student.pendingRebates} pending` : null,
  ].filter(Boolean).join(" · ")

  return (
    <div className="al-drawer">
      <header className="al-drawer__hero">
        <Avatar src={getMediaUrl(student.profileImage)} name={student.name} alt="" size="xxlarge" />
        <div className="al-drawer__who">
          <h3 className="al-drawer__name">{student.name || "Unnamed student"}</h3>
          <p className="al-drawer__roll">{student.rollNumber}</p>
          {student.email && <p className="al-drawer__email">{student.email}</p>}
          <div className="al-drawer__tags">
            <span className="al-caterer" style={{ "--kitchen": catererColor(palette, student.caterer?.id) }}>
              <span className="al-caterer__dot" aria-hidden="true" />
              {student.caterer?.name}
            </span>
            {period.phase === "current" && (
              <StatusBadge tone={status.tone} showDot={false}>{status.label}</StatusBadge>
            )}
            {student.unregistered && <StatusBadge tone="warning" showDot={false}>Unregistered</StatusBadge>}
            <DiningTagChips tags={tagChips} />
          </div>
        </div>
      </header>

      {student.unregistered && (
        <DetailSection title="Registration" icon={ShieldCheck}>
          <div className="al-registration">
            <Alert type="warning" icon>
              Auto-allocated — didn't choose a caterer. Can't request rebates for this period.
            </Alert>
            {oversight && (
              <Button variant="secondary" onClick={runMarkRegistered} loading={markRegistered.isPending}>
                <ShieldCheck size={16} /> Mark as registered
              </Button>
            )}
          </div>
        </DetailSection>
      )}
      {!student.unregistered && student.registrationClearedAt && (
        <DetailSection title="Registration" icon={ShieldCheck}>
          <InfoRow
            label="Marked registered"
            value={`${student.registrationClearedBy?.name ? `by ${student.registrationClearedBy.name} on ` : "on "}${formatDayMonth(toDayKey(student.registrationClearedAt))}`}
          />
        </DetailSection>
      )}

      <DetailSection title="Student" icon={UserRound} columns={2}>
        <InfoRow label="Hostel / room" value={roomLabel(student) || "-"} />
        <InfoRow label="Program" value={programLabel(student) || "-"} />
        <InfoRow label="Allocated on" value={student.selectedAt ? formatDayMonth(toDayKey(student.selectedAt)) : "-"} />
        <InfoRow label="Caterer" value={student.caterer?.name || "-"} />
      </DetailSection>

      {tags.length > 0 && (
        <DetailSection title="Tags" icon={Tags}>
          <ul className="al-tagrows">
            {tags.map((tag) => (
              <TagRow
                key={tag.id}
                tag={tag}
                entry={student.tags?.[tag.id]}
                canManage={canManage}
                pending={setTag.isPending}
                onSet={(tagId, value) => setTag.mutate({ tagId, value })}
              />
            ))}
          </ul>
        </DetailSection>
      )}

      {showUsage ? (
        <>
          <DetailSection title="Meals this period" icon={Utensils}>
            <ul className="al-slots">
              {slots.map((slot) => (
                <li key={slot.key} className="al-slots__item">
                  <span className="al-slots__dot" style={{ background: (mealPalette[slot.key] || mealPalette[slotKey(slot.name)])?.color }} aria-hidden="true" />
                  <span className="al-slots__name">{slot.name}</span>
                  <span className="al-slots__count">{student.mealsBySlot?.[slot.key] || 0}</span>
                </li>
              ))}
            </ul>
            <InfoRow label="Meals eaten" value={`${student.meals} of ${student.mealsOffered}`} />
            <InfoRow label="Attendance" value={formatPct(student.attendance)} />
            <InfoRow label="Last meal" value={student.lastMealDate ? formatDayMonth(toDayKey(student.lastMealDate)) : "Never"} />
          </DetailSection>

          <DetailSection title="Rebates and billing" icon={Banknote}>
            <InfoRow label="Rebate days" value={rebateText} />
            <InfoRow label="Billable days" value={student.chargeableDays} />
            <InfoRow label="Billed" value={formatCurrency(student.billed)} strong />
            {oversight && (
              <InfoRow
                label="Mess fee"
                value={
                  student.fee ? (
                    <StatusBadge tone={clearanceTone(student.fee.clearance)} showDot={false}>
                      {formatClearance(student.fee.clearance)} · {formatCurrency(student.fee.balance)}
                    </StatusBadge>
                  ) : (
                    "No mess fee period"
                  )
                }
              />
            )}
          </DetailSection>
        </>
      ) : (
        <DetailSection title="Rebates" icon={CalendarClock}>
          <InfoRow label="Rebate days booked" value={student.approvedRebateDays} />
          {student.pendingRebates > 0 && <InfoRow label="Pending requests" value={student.pendingRebates} />}
        </DetailSection>
      )}

      <DetailSection title="Allocation history" icon={History}>
        <HistoryList studentId={student.id} currentPeriodId={period.id} palette={palette} onPickPeriod={onPickPeriod} />
      </DetailSection>

      {canManage && (
        <DetailSection title="Manage allocation" icon={ArrowRightLeft}>
          {others.length > 0 && (
            <div className="al-move">
              <Select
                value={moveTo}
                onChange={(event) => setTarget(event.target.value)}
                options={others.map((caterer) => ({ value: caterer.id, label: `${caterer.name} (${caterer.allocated}/${caterer.capacity})` }))}
                aria-label="Move to caterer"
              />
              <Button variant="secondary" onClick={() => runMove(moveTo)} loading={move.isPending} disabled={!moveTo || remove.isPending}>
                <ArrowRightLeft size={16} /> Move
              </Button>
            </div>
          )}
          <Button variant="danger" onClick={runRemove} loading={remove.isPending} disabled={move.isPending}>
            <UserMinus size={16} /> Remove from period
          </Button>
        </DetailSection>
      )}
    </div>
  )
}

/** A student's numbers for the period, their allocation history, and (for the office) move / remove. */
const StudentDrawer = ({ student, tags, period, slots, caterers, palette, canManage, oversight, onClose, onPickPeriod }) => (
  <Drawer isOpen={Boolean(student)} onClose={onClose} title="Student" size="large">
    {student && (
      <DrawerBody
        key={student.id}
        student={student}
        tags={tags || []}
        period={period}
        slots={slots}
        caterers={caterers}
        palette={palette}
        canManage={canManage}
        oversight={oversight}
        onClose={onClose}
        onPickPeriod={onPickPeriod}
      />
    )}
  </Drawer>
)

export default StudentDrawer
