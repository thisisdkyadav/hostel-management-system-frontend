import { fromDateTimeLocal, getDefaultVotingEmailStartAt, toDateTimeLocal } from "./helpers"

export const createBlankPost = () => ({
  id: "",
  title: "",
  code: "",
  category: "custom",
  description: "",
  candidateEligibility: {
    batches: [],
    groups: [],
    extraRollNumbers: [],
  },
  voterEligibility: {
    batches: [],
    groups: [],
    extraRollNumbers: [],
  },
  requirements: {
    minCgpa: 6,
    minCompletedSemestersUg: 0,
    minCompletedSemestersPg: 0,
    minRemainingSemesters: 0,
    proposersRequired: 1,
    secondersRequired: 1,
    requireElectorateMembership: false,
    requireHostelResident: false,
    allowedHostelNames: [],
    notes: "",
  },
})

export const createBlankElectionForm = () => ({
  title: "",
  academicYear: "",
  phase: "phase1",
  description: "",
  status: "draft",
  votingAccess: {
    mode: "both",
    autoSendEnabled: true,
  },
  mockSettings: {
    enabled: false,
    voterRollNumbers: [],
  },
  electionCommission: {
    chiefElectionOfficerRollNumber: "",
    officerRollNumbers: [],
  },
  timeline: {
    announcementAt: "",
    nominationStartAt: "",
    nominationEndAt: "",
    withdrawalEndAt: "",
    campaigningStartAt: "",
    campaigningEndAt: "",
    votingEmailStartAt: "",
    votingStartAt: "",
    votingEndAt: "",
    resultsAnnouncedAt: "",
    handoverAt: "",
  },
  posts: [createBlankPost()],
})

export const createBlankNominationForm = () => ({
  cgpa: "",
  hasNoActiveBacklogs: false,
  proposerEntries: [],
  seconderEntries: [],
  gradeCardUrl: "",
  manifestoUrl: "",
  porDocumentUrl: "",
})

export const createBlankSupporterEntry = () => ({
  rollNumber: "",
  userId: "",
  name: "",
  email: "",
  profileImage: "",
  lookupStatus: "idle",
  lookupMessage: "",
  supportStatus: "",
  supportRole: "",
})

export const hydrateSupporterEntries = (entries = [], minimumCount = 0) => {
  const nextEntries = Array.isArray(entries)
    ? entries.map((entry) => ({
        ...createBlankSupporterEntry(),
        rollNumber: String(entry?.rollNumber || "").toUpperCase(),
        userId: entry?.userId || "",
        name: entry?.name || "",
        email: entry?.email || "",
        profileImage: entry?.profileImage || "",
        lookupStatus: entry?.rollNumber ? "validated" : "idle",
        lookupMessage: entry?.status
          ? `Support ${String(entry.status).replace(/^\w/, (match) => match.toUpperCase())}`
          : "",
        supportStatus: entry?.status || "",
        supportRole: entry?.supportRole || "",
      }))
    : []

  while (nextEntries.length < minimumCount) {
    nextEntries.push(createBlankSupporterEntry())
  }

  return nextEntries
}

export const buildNominationDraftFromPost = (post = {}) => ({
  cgpa: post?.myNomination?.cgpa ?? "",
  hasNoActiveBacklogs: Boolean(post?.myNomination?.hasNoActiveBacklogs),
  proposerEntries: hydrateSupporterEntries(
    post?.myNomination?.proposerEntries || [],
    Math.max(1, Number(post?.requirements?.proposersRequired || 1))
  ),
  seconderEntries: hydrateSupporterEntries(
    post?.myNomination?.seconderEntries || [],
    Math.max(1, Number(post?.requirements?.secondersRequired || 1))
  ),
  gradeCardUrl: post?.myNomination?.gradeCardUrl || "",
  manifestoUrl: post?.myNomination?.manifestoUrl || "",
  porDocumentUrl: post?.myNomination?.porDocumentUrl || "",
})

export const normalizeScopeForForm = (scope = {}) => ({
  batches: Array.isArray(scope?.batches) ? scope.batches : [],
  groups: Array.isArray(scope?.groups) ? scope.groups : [],
  extraRollNumbers: Array.isArray(scope?.extraRollNumbers) ? scope.extraRollNumbers : [],
})

export const buildElectionFormFromDetail = (detail) => ({
  title: detail?.title || "",
  academicYear: detail?.academicYear || "",
  phase: detail?.phase || "phase1",
  description: detail?.description || "",
  status: detail?.status || "draft",
  votingAccess: {
    mode: detail?.votingAccess?.mode || "both",
    autoSendEnabled: detail?.votingAccess?.autoSendEnabled !== false,
  },
  mockSettings: {
    enabled: Boolean(detail?.mockSettings?.enabled),
    voterRollNumbers: Array.isArray(detail?.mockSettings?.voterRollNumbers)
      ? detail.mockSettings.voterRollNumbers
      : [],
  },
  electionCommission: {
    chiefElectionOfficerRollNumber: detail?.electionCommission?.chiefElectionOfficerRollNumber || "",
    officerRollNumbers: detail?.electionCommission?.officerRollNumbers || [],
  },
  timeline: {
    announcementAt: toDateTimeLocal(detail?.timeline?.announcementAt),
    nominationStartAt: toDateTimeLocal(detail?.timeline?.nominationStartAt),
    nominationEndAt: toDateTimeLocal(detail?.timeline?.nominationEndAt),
    withdrawalEndAt: toDateTimeLocal(detail?.timeline?.withdrawalEndAt),
    campaigningStartAt: toDateTimeLocal(detail?.timeline?.campaigningStartAt),
    campaigningEndAt: toDateTimeLocal(detail?.timeline?.campaigningEndAt),
    votingEmailStartAt: toDateTimeLocal(
      detail?.timeline?.votingEmailStartAt ||
        ((detail?.votingAccess?.autoSendEnabled !== false && ["email", "both"].includes(detail?.votingAccess?.mode || "both"))
          ? getDefaultVotingEmailStartAt(detail?.timeline?.votingStartAt)
          : null)
    ),
    votingStartAt: toDateTimeLocal(detail?.timeline?.votingStartAt),
    votingEndAt: toDateTimeLocal(detail?.timeline?.votingEndAt),
    resultsAnnouncedAt: toDateTimeLocal(detail?.timeline?.resultsAnnouncedAt),
    handoverAt: toDateTimeLocal(detail?.timeline?.handoverAt),
  },
  posts:
    (detail?.posts || []).length > 0
      ? detail.posts.map((post) => ({
          id: post.id || "",
          title: post.title || "",
          code: post.code || "",
          category: post.category || "custom",
          description: post.description || "",
          candidateEligibility: normalizeScopeForForm(post.candidateEligibility),
          voterEligibility: normalizeScopeForForm(post.voterEligibility),
          requirements: {
            minCgpa: post.requirements?.minCgpa ?? 6,
            minCompletedSemestersUg: post.requirements?.minCompletedSemestersUg ?? 0,
            minCompletedSemestersPg: post.requirements?.minCompletedSemestersPg ?? 0,
            minRemainingSemesters: post.requirements?.minRemainingSemesters ?? 0,
            proposersRequired: 1,
            secondersRequired: 1,
            requireElectorateMembership: false,
            requireHostelResident: Boolean(post.requirements?.requireHostelResident),
            allowedHostelNames: post.requirements?.allowedHostelNames || [],
            notes: post.requirements?.notes || "",
          },
        }))
      : [createBlankPost()],
})

export const serializeElectionFormForApi = (form) => ({
  title: form.title.trim(),
  academicYear: form.academicYear.trim(),
  phase: form.phase,
  description: form.description.trim(),
  status: form.status,
  votingAccess: {
    mode: form.votingAccess?.mode || "both",
    autoSendEnabled: Boolean(form.votingAccess?.autoSendEnabled !== false),
  },
  mockSettings: {
    enabled: Boolean(form.mockSettings?.enabled),
    voterRollNumbers: Array.isArray(form.mockSettings?.voterRollNumbers)
      ? form.mockSettings.voterRollNumbers
      : [],
  },
  electionCommission: {
    chiefElectionOfficerRollNumber: form.electionCommission.chiefElectionOfficerRollNumber
      .trim()
      .toUpperCase(),
    officerRollNumbers: form.electionCommission.officerRollNumbers,
  },
  timeline: Object.fromEntries(
    Object.entries(form.timeline).map(([key, value]) => [key, fromDateTimeLocal(value)])
  ),
  posts: form.posts.map((post) => ({
    ...(post.id ? { id: post.id } : {}),
    title: post.title.trim(),
    code: post.code.trim().toUpperCase(),
    category: post.category,
    description: post.description.trim(),
    candidateEligibility: {
      batches: post.candidateEligibility.batches,
      groups: post.candidateEligibility.groups,
      extraRollNumbers: post.candidateEligibility.extraRollNumbers,
    },
    voterEligibility: {
      batches: post.voterEligibility.batches,
      groups: post.voterEligibility.groups,
      extraRollNumbers: post.voterEligibility.extraRollNumbers,
    },
    requirements: {
      minCgpa: Number(post.requirements.minCgpa || 0),
      minCompletedSemestersUg: 0,
      minCompletedSemestersPg: 0,
      minRemainingSemesters: 0,
      proposersRequired: 1,
      secondersRequired: 1,
      requireElectorateMembership: false,
      requireHostelResident: Boolean(post.requirements.requireHostelResident),
      allowedHostelNames: post.requirements.allowedHostelNames,
      notes: post.requirements.notes.trim(),
    },
  })),
})

export const buildNominationPayload = (form) => ({
  cgpa: Number(form.cgpa || 0),
  completedSemesters: null,
  remainingSemesters: null,
  hasNoActiveBacklogs: Boolean(form.hasNoActiveBacklogs),
  proposerRollNumbers: (form.proposerEntries || [])
    .map((entry) => String(entry?.rollNumber || "").trim().toUpperCase())
    .filter(Boolean),
  seconderRollNumbers: (form.seconderEntries || [])
    .map((entry) => String(entry?.rollNumber || "").trim().toUpperCase())
    .filter(Boolean),
  gradeCardUrl: form.gradeCardUrl.trim(),
  manifestoUrl: form.manifestoUrl.trim(),
  porDocumentUrl: form.porDocumentUrl.trim(),
  attachments: [],
})
