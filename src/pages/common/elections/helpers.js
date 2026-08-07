

export const formatStageLabel = (value) =>
  String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())

export const formatDateTime = (value) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString()
}

export const toDateTimeLocal = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export const fromDateTimeLocal = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export const splitListInput = (value) =>
  [...new Set(
    String(value || "")
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  )]

export const daysToMs = (days) => days * 24 * 60 * 60 * 1000

export const buildD15Timeline = (votingStartValue) => {
  const sourceValue =
    typeof votingStartValue === "string" && votingStartValue.length === 16
      ? fromDateTimeLocal(votingStartValue)
      : votingStartValue
  const votingStart = new Date(sourceValue)
  if (Number.isNaN(votingStart.getTime())) return null

  const votingEnd = new Date(votingStart.getTime() + 10 * 60 * 60 * 1000)
  return {
    announcementAt: toDateTimeLocal(new Date(votingStart.getTime() - daysToMs(15))),
    nominationStartAt: toDateTimeLocal(new Date(votingStart.getTime() - daysToMs(14))),
    nominationEndAt: toDateTimeLocal(new Date(votingStart.getTime() - daysToMs(12))),
    withdrawalEndAt: toDateTimeLocal(new Date(votingStart.getTime() - daysToMs(10))),
    campaigningStartAt: toDateTimeLocal(new Date(votingStart.getTime() - daysToMs(8))),
    campaigningEndAt: toDateTimeLocal(new Date(votingStart.getTime() - daysToMs(2))),
    votingEmailStartAt: toDateTimeLocal(new Date(votingStart.getTime() - 6 * 60 * 60 * 1000)),
    votingStartAt: toDateTimeLocal(votingStart),
    votingEndAt: toDateTimeLocal(votingEnd),
    resultsAnnouncedAt: toDateTimeLocal(new Date(votingEnd.getTime() + daysToMs(1))),
    handoverAt: toDateTimeLocal(new Date(votingEnd.getTime() + daysToMs(20))),
  }
}

export const getDefaultVotingEmailStartAt = (votingStartValue) => {
  if (!votingStartValue) return null
  const votingStart = new Date(votingStartValue)
  if (Number.isNaN(votingStart.getTime())) return null
  return new Date(votingStart.getTime() - 6 * 60 * 60 * 1000)
}

export const summarizeScope = (scope = {}) => {
  const batches = Array.isArray(scope?.batches) ? scope.batches.length : 0
  const groups = Array.isArray(scope?.groups) ? scope.groups.length : 0
  const extra = Array.isArray(scope?.extraRollNumbers) ? scope.extraRollNumbers.length : 0
  const parts = []
  if (batches > 0) parts.push(`${batches} batch(es)`)
  if (groups > 0) parts.push(`${groups} group(s)`)
  if (extra > 0) parts.push(`${extra} CSV student(s)`)
  if (parts.length === 0) return "Not configured"
  return parts.join(" + ")
}

export const hasScopeSelection = (scope = {}) =>
  (Array.isArray(scope?.batches) ? scope.batches.length : 0) > 0 ||
  (Array.isArray(scope?.groups) ? scope.groups.length : 0) > 0 ||
  (Array.isArray(scope?.extraRollNumbers) ? scope.extraRollNumbers.length : 0) > 0

export const sortByActivity = (items = []) => {
  const activeStages = new Set([
    "announced",
    "nomination",
    "withdrawal",
    "campaigning",
    "voting",
    "results",
    "handover",
  ])
  const active = items.find((item) => activeStages.has(item.currentStage))
  return active?.id || ""
}

export const formatElectionOptionLabel = (election) => {
  const stage = formatStageLabel(election.currentStage)
  return `${election.title} • ${election.academicYear} • ${stage}`
}

export const formatApiErrorMessage = (error, fallbackMessage) => {
  const detailedMessages = Array.isArray(error?.errors)
    ? [...new Set(
        error.errors
          .map((item) => (typeof item === "string" ? item : item?.message || ""))
          .filter(Boolean)
      )]
    : []

  if (detailedMessages.length > 0) {
    return detailedMessages.join("\n")
  }

  return error?.message || fallbackMessage
}

export const formatVotePercentage = (voteCount, totalVotes) => {
  const votes = Number(voteCount || 0)
  const total = Number(totalVotes || 0)
  if (total <= 0) return "0%"

  const percentage = (votes / total) * 100
  return percentage >= 10 ? `${percentage.toFixed(1)}%` : `${percentage.toFixed(2)}%`
}

export const buildResultsDraftMap = (results = {}) =>
  Object.fromEntries(
    (results.posts || []).map((post) => [
      String(post.postId),
      {
        winnerNominationIds:
          (post.publishedWinnerNominationIds || []).length > 0 || post.publishedWinnerIsNota
            ? [
                ...(post.publishedWinnerNominationIds || []),
                ...(post.publishedWinnerIsNota ? ["nota"] : []),
              ]
            : [
                ...(post.previewWinnerNominationIds || []),
                ...(post.previewWinnerIsNota &&
                !(post.previewWinnerNominationIds || []).includes("nota")
                  ? ["nota"]
                  : []),
              ],
        winnerNominationId:
          post.publishedWinnerIsNota && !(post.publishedWinnerNominationIds || []).length
            ? "nota"
            : post.publishedWinnerNominationId ||
              (post.previewWinnerIsNota && !(post.previewWinnerNominationIds || []).length
                ? "nota"
                : post.previewWinnerNominationId || ""),
        winnerIsTie: Boolean(post.publishedWinnerIsTie || post.previewWinnerIsTie),
        showVoteCountToStudents: post.showVoteCountToStudents !== false,
        notes: post.notes || "",
      },
    ])
  )
