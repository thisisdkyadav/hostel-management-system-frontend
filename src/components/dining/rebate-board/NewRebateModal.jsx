import { useEffect, useRef, useState } from "react"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { Button, Input, Modal, Textarea } from "hzero"
import { Plus, Search, UserCheck, X } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { diningRebateBoardApi } from "@/service"
import { getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { useDebouncedValue } from "@/components/dining/caterer/rebates/rebateHelpers"
import RebateRibbon from "./RebateRibbon"
import { PlanChecks, Photo, Seg } from "./RebateCard"
import { STATES, TYPES, addDays, days, listKeys, periodText, rangeText } from "./rebateBoardHelpers"

const MAX = 50
const LENGTHS = [
  [1, "1 day"],
  [3, "3 days"],
  [7, "1 week"],
  [14, "2 weeks"],
  [30, "30 days"],
]

const where = (student) => [student.hostel, student.room].filter(Boolean).join(" · ")

/** What helps confirm it's the right student. */
const StudentFacts = ({ student, period }) => {
  const allocation = student.allocation
  return (
    <span className="rn-facts">
      {student.status && student.status !== "Active" && (
        <span className="rc-tag" data-tone="bad">
          {student.status}
        </span>
      )}
      {(student.degree || student.department) && <span className="rc-tag">{[student.degree, student.department].filter(Boolean).join(" ")}</span>}
      {where(student) && <span className="rc-tag">{where(student)}</span>}
      {period && allocation && (
        <span className="rc-tag" data-tone={allocation.unregistered ? "bad" : allocation.caterer ? "ok" : "warn"}>
          {allocation.caterer ? `${allocation.caterer}${allocation.unregistered ? " (auto-allocated)" : ""}` : "No caterer"} · {periodText(period)}
        </span>
      )}
    </span>
  )
}

/**
 * New rebate, for one student or a group: find and confirm the students
 * (photo, room, caterer, their rebates), then the dates, type, status and
 * message. The server checks each student as the form changes.
 */
const NewRebateModal = ({ period, today, onClose, onCreated }) => {
  const [searchInput, setSearchInput] = useState("")
  const [picked, setPicked] = useState([])
  const [startDate, setStartDate] = useState(() => addDays(today || new Date().toISOString().slice(0, 10), 1))
  const [endDate, setEndDate] = useState(() => addDays(today || new Date().toISOString().slice(0, 10), 1))
  const [type, setType] = useState("auto")
  const [status, setStatus] = useState("approved")
  const [reason, setReason] = useState("")
  const [adminComment, setAdminComment] = useState("")
  const [error, setError] = useState("")
  const search = useDebouncedValue(searchInput.trim(), 250)
  // The modal focuses itself on open; move focus to the search box after it.
  const searchRef = useRef(null)
  useEffect(() => {
    const timer = setTimeout(() => searchRef.current?.focus(), 60)
    return () => clearTimeout(timer)
  }, [])

  const results = useQuery({
    queryKey: queryKeys.diningRebateBoard.students({ search, periodId: period?.id || "" }),
    queryFn: () => diningRebateBoardApi.students({ search, periodId: period?.id }),
    enabled: search.length >= 2,
    placeholderData: keepPreviousData,
  })

  const datesValid = Boolean(startDate && endDate && startDate <= endDate)
  const ids = picked.map((student) => student.userId)
  const planKey = useDebouncedValue(`${ids.join(",")}|${startDate}|${endDate}|${type}`, 300)
  const plan = useQuery({
    queryKey: [...queryKeys.diningRebateBoard.all, "preview-new", planKey],
    queryFn: () => {
      const [list, from, to, kind] = planKey.split("|")
      return diningRebateBoardApi.preview({ studentUserIds: list.split(","), startDate: from, endDate: to, type: kind === "auto" ? undefined : kind })
    },
    enabled: Boolean(ids.length && datesValid && planKey.startsWith(ids.join(","))),
    placeholderData: keepPreviousData,
    retry: false,
  })
  const planned = plan.data?.plan
  const planFor = (userId) => planned?.students?.find((student) => student.studentUserId === userId)
  const blocked = Boolean(planned?.blocked)

  const create = useMutation({
    mutationFn: () =>
      diningRebateBoardApi.create({
        studentUserIds: ids,
        startDate,
        endDate,
        type: type === "auto" ? undefined : type,
        status,
        reason,
        adminComment,
      }),
    onSuccess: (data) => onCreated?.(data.rebates || []),
    onError: (err) => setError(getErrorMessage(err, "Couldn't create the rebate.")),
  })

  const add = (student) => {
    if (picked.length >= MAX || picked.some((p) => p.userId === student.userId)) return
    setPicked((current) => [...current, student])
    setSearchInput("")
  }
  const remove = (userId) => setPicked((current) => current.filter((student) => student.userId !== userId))
  const setLength = (n) => setEndDate(addDays(startDate, n - 1))

  const count = datesValid ? listKeys(startDate, endDate).length : 0
  const autoType = planned?.autoType
  const items = results.data?.items || []

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="New rebate"
      width={1000}
      footer={
        <>
          {error && <p className="rc-feedback">{error}</p>}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => create.mutate()} loading={create.isPending} disabled={!ids.length || !datesValid || blocked || plan.isFetching || create.isPending}>
            <Plus size={16} /> {ids.length > 1 ? `Create for ${ids.length} students` : "Create rebate"}
          </Button>
        </>
      }
    >
      <div className="rb-modal rn">
        <section className="rn-pane" aria-label="Students">
          <p className="rn-step">
            <i>1</i> Who&apos;s away
          </p>
          <label className="rb-search">
            <Search size={16} aria-hidden="true" />
            <input
              ref={searchRef}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && items[0]) {
                  event.preventDefault()
                  add(items[0])
                }
              }}
              placeholder="Roll number or name"
              aria-label="Find a student by roll number or name"
            />
            {searchInput && (
              <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </label>

          {search.length >= 2 && (
            <ul className="rn-results" aria-label="Matching students">
              {results.isLoading ? (
                <li className="rn-hint">Searching…</li>
              ) : items.length ? (
                items.map((student) => {
                  const already = picked.some((p) => p.userId === student.userId)
                  return (
                    <li key={student.userId}>
                      <button type="button" onClick={() => add(student)} disabled={already}>
                        <Photo name={student.name} image={student.profileImage} />
                        <span className="rn-person">
                          <strong>{student.name || student.rollNumber}</strong>
                          <span>
                            {student.rollNumber}
                            {where(student) ? ` · ${where(student)}` : ""}
                          </span>
                        </span>
                        {already ? <UserCheck size={16} aria-label="Added" /> : <Plus size={16} aria-label="Add" />}
                      </button>
                    </li>
                  )
                })
              ) : (
                <li className="rn-hint">Nobody matches &ldquo;{search}&rdquo;.</li>
              )}
            </ul>
          )}

          {picked.length > 0 ? (
            <ul className="rn-picked" aria-label="Picked students">
              {picked.map((student) => {
                const check = planFor(student.userId)
                const clash = status !== "rejected" && check?.conflicts?.length > 0
                return (
                  <li key={student.userId}>
                    <div className="rn-picked__card" data-tone={clash ? "bad" : undefined}>
                      <Photo name={student.name} image={student.profileImage} />
                      <span className="rn-person">
                        <strong>{student.name || student.rollNumber}</strong>
                        <span>
                          {student.rollNumber}
                          {student.email ? ` · ${student.email}` : ""}
                        </span>
                        <StudentFacts student={student} period={period} />
                        {student.rebates?.length > 0 && (
                          <span className="rn-picked__rebates">
                            Rebates:{" "}
                            {student.rebates
                              .map((r) => `${rangeText(r.startDate, r.endDate)} (${STATES[r.status]?.label.toLowerCase()})`)
                              .join(", ")}
                          </span>
                        )}
                        {check && (check.conflicts.length > 0 || check.warnings.length > 0) && (
                          <span className="rn-checks">
                            <PlanChecks student={check} status={status} />
                          </span>
                        )}
                      </span>
                      <button type="button" className="rb-x" onClick={() => remove(student.userId)} aria-label={`Remove ${student.rollNumber}`}>
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="rn-hint">
              Search, then pick one student or several (a team going on a trip, say). Each gets their own rebate with the same dates.
            </p>
          )}
        </section>

        <section className="rn-pane" aria-label="Dates and details">
          <p className="rn-step">
            <i>2</i> When and why
          </p>
          <div className="rb-field">
            <span>Dates</span>
            <div className="rb-dates">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-label="First day" />
              <span>→</span>
              <Input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} aria-label="Last day" />
            </div>
          </div>
          <div className="rn-quick rb-chips" role="group" aria-label="Length">
            {LENGTHS.map(([n, label]) => (
              <button key={n} type="button" aria-pressed={count === n} onClick={() => setLength(n)} disabled={!startDate}>
                {label}
              </button>
            ))}
          </div>
          <p className="rn-summary">
            <b>{count ? days(count) : "—"}</b>
            {datesValid ? rangeText(startDate, endDate) : "Pick the first and last day"}
          </p>

          {datesValid && (
            <RebateRibbon
              period={period}
              startKey={startDate}
              endKey={endDate}
              state={status}
              placements={planned?.students?.[0]?.placements}
              today={today}
            />
          )}

          <div className="rb-field">
            <span>Type</span>
            <Seg
              label="Type"
              value={type}
              onChange={setType}
              options={[
                { value: "auto", label: autoType ? `By the rules (${TYPES[autoType].short.toLowerCase()})` : "By the rules" },
                { value: "short-term", label: "Short-term" },
                { value: "long-term", label: "Long-term" },
              ]}
            />
          </div>
          <div className="rb-field">
            <span>Status</span>
            <Seg
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "approved", label: "Approved", tone: "ok" },
                { value: "pending", label: "Pending", tone: "warn" },
              ]}
            />
          </div>
          <label className="rb-field">
            <span>Reason</span>
            <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why they're away (the student sees this)" />
          </label>
          <label className="rb-field">
            <span>Office comment</span>
            <Textarea rows={2} value={adminComment} onChange={(e) => setAdminComment(e.target.value)} placeholder="Optional" />
          </label>
          {planned?.notes?.length > 0 && <PlanChecks student={{ conflicts: [], warnings: [] }} notes={planned.notes} status={status} />}
        </section>
      </div>
    </Modal>
  )
}

export default NewRebateModal
