export const queryKeys = {
  gymkhana: {
    all: ["gymkhana"],
    years: () => [...queryKeys.gymkhana.all, "years"],
    calendar: (year) => [...queryKeys.gymkhana.all, "calendar", String(year)],
    monthView: (startDate, endDate) => [
      ...queryKeys.gymkhana.all,
      "month-view",
      startDate,
      endDate,
    ],
    dateOverlap: (calendarId, startDate, endDate, eventId) => [
      ...queryKeys.gymkhana.all,
      "date-overlap",
      calendarId,
      startDate,
      endDate,
      eventId ?? "new",
    ],
    postStudentAffairsApprovers: () => [
      ...queryKeys.gymkhana.all,
      "post-student-affairs-approvers",
    ],
  },
  complaints: {
    all: ["complaints"],
    list: (filters) => [...queryKeys.complaints.all, "list", filters ?? {}],
    detail: (id) => [...queryKeys.complaints.all, "detail", id],
    stats: (hostelId) => [...queryKeys.complaints.all, "stats", hostelId ?? null],
  },
  visitors: {
    all: ["visitors"],
    list: (filters) => [...queryKeys.visitors.all, "list", filters ?? {}],
    detail: (id) => [...queryKeys.visitors.all, "detail", id],
    profiles: () => [...queryKeys.visitors.all, "profiles"],
    stats: (hostelId) => [...queryKeys.visitors.all, "stats", hostelId ?? null],
  },
  dining: {
    all: ["dining"],
    portalState: () => [...queryKeys.dining.all, "portal-state"],
    rebates: (filters) => [...queryKeys.dining.all, "rebates", filters ?? {}],
    billing: () => [...queryKeys.dining.all, "billing"],
  },
  lostAndFound: {
    all: ["lost-and-found"],
    list: (filters) => [...queryKeys.lostAndFound.all, "list", filters ?? {}],
    detail: (id) => [...queryKeys.lostAndFound.all, "detail", id],
  },
  feedback: {
    all: ["feedback"],
    list: (filters) => [...queryKeys.feedback.all, "list", filters ?? {}],
    stats: (filters) => [...queryKeys.feedback.all, "stats", filters ?? {}],
  },
  studentDashboard: {
    all: ["student-dashboard"],
    data: () => [...queryKeys.studentDashboard.all, "data"],
    activeVotingElection: () => [
      ...queryKeys.studentDashboard.all,
      "active-voting-election",
    ],
  },
  idCard: {
    all: ["id-card"],
    mine: (userId) => [...queryKeys.idCard.all, "mine", userId],
  },
  undertakings: {
    all: ["undertakings"],
    studentLists: () => [...queryKeys.undertakings.all, "student", "lists"],
    detail: (id) => [...queryKeys.undertakings.all, "detail", id],
    wardenList: (filters) => [...queryKeys.undertakings.all, "warden", filters ?? {}],
  },
  securityEntries: {
    all: ["security-entries"],
    student: () => [...queryKeys.securityEntries.all, "student"],
  },
  accommodationRequests: {
    all: ["accommodation-requests"],
    list: (filters) => [...queryKeys.accommodationRequests.all, "list", filters ?? {}],
    detail: (id) => [...queryKeys.accommodationRequests.all, "detail", id],
  },
  elections: {
    all: ["elections"],
    list: (filters) => [...queryKeys.elections.all, "list", filters ?? {}],
    detail: (id) => [...queryKeys.elections.all, "detail", id],
    liveStats: (id) => [...queryKeys.elections.all, "live-stats", id],
    votingEmailRecipients: (id) => [...queryKeys.elections.all, "voting-email-recipients", id],
    testEmailRecipients: (id) => [...queryKeys.elections.all, "test-email-recipients", id],
    studentCurrent: () => [...queryKeys.elections.all, "student-current"],
    batchList: () => [...queryKeys.elections.all, "batch-list"],
    studentGroups: () => [...queryKeys.elections.all, "student-groups"],
  },
  megaEvents: {
    all: ["mega-events"],
    seriesList: () => [...queryKeys.megaEvents.all, "series"],
    seriesDetail: (id) => [...queryKeys.megaEvents.all, "series", id],
    occurrenceBundle: (occurrenceId) => [
      ...queryKeys.megaEvents.all,
      "occurrence-bundle",
      occurrenceId,
    ],
  },
  notifications: {
    all: ["notifications"],
    list: (filters) => [...queryKeys.notifications.all, "list", filters ?? {}],
    detail: (id) => [...queryKeys.notifications.all, "detail", id],
    stats: (filters) => [...queryKeys.notifications.all, "stats", filters ?? {}],
  },
}
