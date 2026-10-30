import { useState } from "react"
import { Alert, StatusBadge } from "hzero"
import { Lock } from "lucide-react"
import { queryKeys, useOptimisticMutation } from "@/lib/query"
import { studentApi } from "@/service"
import { formatRange } from "../caterer/catererHelpers"
import { getErrorMessage } from "../diningPeriodHelpers"
import { YesNoToggle } from "./DiningModals"
import { needsResponse } from "./studentDiningHelpers"

const yesNo = (value) => (value ? "Yes" : "No")

const formatWhen = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""

const rowRange = (item) => {
  const start = item.period?.startDate || item.startDate
  const end = item.period?.endDate || item.endDate
  return formatRange(start, end)
}

const unansweredText = (item) =>
  typeof item.defaultValue === "boolean" ? `Not answered — default: ${yesNo(item.defaultValue)}` : "Not answered"

/**
 * "Dining preferences": yes/no questions about the student's meals (e.g. Jain
 * food). Open ones can be answered or changed until the shown deadline; closed
 * ones stay visible, locked. Hidden when there is nothing to show.
 */
const TagAnswersCard = ({ items = [] }) => {
  const [error, setError] = useState("")

  const answer = useOptimisticMutation({
    queryKey: queryKeys.dining.tags(),
    updateFn: (previous, { tagId, value }) => {
      if (!previous || !Array.isArray(previous.items)) return undefined
      return {
        ...previous,
        items: previous.items.map((item) => (item.tagId === tagId ? { ...item, value, effective: value } : item)),
      }
    },
    mutationFn: ({ tagId, value }) => studentApi.setDiningTagAnswer(tagId, value),
    onMutate: () => setError(""),
    onError: (err) => setError(getErrorMessage(err, "Couldn't save that answer. Please try again.")),
  })

  if (items.length === 0) return null
  const pendingId = answer.isPending ? answer.variables?.tagId : ""
  const waiting = items.some(needsResponse)

  return (
    <section className="sd-card sd-tags" data-attention={waiting || undefined}>
      <header className="sd-card__head">
        <h2 className="sd-card__title">Dining preferences</h2>
      </header>
      <p className="sd-card__note">Tell the mess about your meals. Your answers help the caterer plan.</p>
      {error && (
        <Alert type="error" icon dismissible onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}
      <ul className="sd-tags__list">
        {items.map((item) => {
          const open = needsResponse(item)
          const answered = typeof item.value === "boolean"
          return (
            <li key={item.tagId} className="sd-tags__row" data-open={open || undefined}>
              <div className="sd-tags__text">
                <span className="sd-tags__title">{item.question || item.name}</span>
                <span className="sd-tags__meta">
                  {item.question ? `${item.name} · ` : ""}
                  {rowRange(item)}
                </span>
                {item.editable ? (
                  <span className="sd-tags__meta">
                    {!answered ? `${unansweredText(item)}. ` : ""}
                    {item.editableUntil ? `Change until ${formatWhen(item.editableUntil)}` : ""}
                  </span>
                ) : (
                  <span className="sd-tags__meta">
                    <Lock size={12} aria-hidden="true" /> Locked
                    {!answered ? ` · ${unansweredText(item)}` : ""}
                  </span>
                )}
              </div>
              {item.editable ? (
                <div className="sd-tags__control">
                  {open && <StatusBadge status="Response needed" tone="warning" showDot={false} />}
                  <YesNoToggle
                    value={answered ? item.value : null}
                    disabled={pendingId === item.tagId}
                    onChange={(value) => value !== item.value && answer.mutate({ tagId: item.tagId, value })}
                  />
                </div>
              ) : (
                <span className="sd-tags__value">{answered ? yesNo(item.value) : "—"}</span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default TagAnswersCard
