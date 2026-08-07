import { fromDateTimeLocal, hasScopeSelection } from "./helpers"
import { phaseOptions, postCategoryOptions, statusOptions, timelineFieldDefs, votingAccessOptions } from "./constants"

export const createEmptyWizardErrors = () => ({
  basics: {},
  timeline: {},
  commission: {},
  posts: [],
  general: "",
})

export const isValidUrlOrEmpty = (value) => {
  const trimmed = String(value || "").trim()
  if (!trimmed) return true
  if (trimmed.startsWith("/")) return true
  try {
    new URL(trimmed)
    return true
  } catch {
    return false
  }
}

export const isPdfDocumentPathOrEmpty = (value) => {
  const trimmed = String(value || "").trim()
  if (!trimmed) return true
  return /\.pdf(\?.*)?$/i.test(trimmed)
}

export const hasAnyWizardErrors = (errors = createEmptyWizardErrors()) =>
  Boolean(
    errors.general ||
      Object.keys(errors.basics || {}).length ||
      Object.keys(errors.timeline || {}).length ||
      Object.keys(errors.commission || {}).length ||
      (errors.posts || []).some((postError) => Object.keys(postError || {}).length > 0)
  )

export const validateElectionWizard = (form, step = "all", hostels = []) => {
  const errors = createEmptyWizardErrors()
  const hostelNames = new Set(hostels.map((hostel) => hostel.name))
  let firstInvalidStep = null
  let firstInvalidPostIndex = null

  const markStep = (stepId) => {
    if (!firstInvalidStep) firstInvalidStep = stepId
  }

  const markPostError = (index, key, message) => {
    if (!errors.posts[index]) errors.posts[index] = {}
    if (!errors.posts[index][key]) {
      errors.posts[index][key] = message
      markStep("posts")
      if (firstInvalidPostIndex === null) firstInvalidPostIndex = index
    }
  }

  const shouldValidate = (stepId) => step === "all" || step === stepId

  if (shouldValidate("basics")) {
    const title = String(form.title || "").trim()
    const academicYear = String(form.academicYear || "").trim()
    const description = String(form.description || "").trim()

    if (title.length < 3 || title.length > 200) {
      errors.basics.title = "Title must be between 3 and 200 characters."
      markStep("basics")
    }

    if (academicYear.length < 4 || academicYear.length > 50) {
      errors.basics.academicYear = "Academic year must be between 4 and 50 characters."
      markStep("basics")
    }

    if (!phaseOptions.some((option) => option.value === form.phase)) {
      errors.basics.phase = "Select a valid election phase."
      markStep("basics")
    }

    if (!statusOptions.some((option) => option.value === form.status)) {
      errors.basics.status = "Select a valid election status."
      markStep("basics")
    }

    if (!votingAccessOptions.some((option) => option.value === form.votingAccess?.mode)) {
      errors.basics.votingAccess = "Select how students should be allowed to vote."
      markStep("basics")
    }

    if (typeof form.votingAccess?.autoSendEnabled !== "boolean") {
      errors.basics.autoSendEnabled = "Choose whether voting links should be auto-sent."
      markStep("basics")
    }

    if (description.length > 5000) {
      errors.basics.description = "Description cannot exceed 5000 characters."
      markStep("basics")
    }

    if (Boolean(form.mockSettings?.enabled)) {
      const mockRollNumbers = Array.isArray(form.mockSettings?.voterRollNumbers)
        ? form.mockSettings.voterRollNumbers
        : []

      if (mockRollNumbers.length === 0) {
        errors.basics.mockSettings = "Upload a mock voter list before enabling a mock election."
        markStep("basics")
      }

      if (mockRollNumbers.some((value) => String(value || "").trim().length > 30)) {
        errors.basics.mockSettings = "Mock voter roll numbers cannot exceed 30 characters."
        markStep("basics")
      }
    }
  }

  if (shouldValidate("timeline")) {
    const parsedTimeline = {}

    timelineFieldDefs.forEach((field) => {
      const rawValue = form.timeline?.[field.key]
      const requiresVotingEmailStartAt =
        field.key === "votingEmailStartAt" &&
        ["email", "both"].includes(String(form.votingAccess?.mode || "both"))

      if (!rawValue && field.key !== "handoverAt" && field.key !== "votingEmailStartAt") {
        errors.timeline[field.key] = `${field.label} is required.`
        markStep("timeline")
        return
      }

      if (!rawValue && requiresVotingEmailStartAt) {
        errors.timeline[field.key] = `${field.label} is required when email voting is enabled.`
        markStep("timeline")
        return
      }

      if (rawValue) {
        const isoValue = fromDateTimeLocal(rawValue)
        const parsedDate = new Date(isoValue)
        if (Number.isNaN(parsedDate.getTime())) {
          errors.timeline[field.key] = `${field.label} must be a valid date and time.`
          markStep("timeline")
          return
        }
        parsedTimeline[field.key] = parsedDate
      }
    })

    const orderedKeys = [
      "announcementAt",
      "nominationStartAt",
      "nominationEndAt",
      "withdrawalEndAt",
      "campaigningStartAt",
      "campaigningEndAt",
      "votingStartAt",
      "votingEndAt",
      "resultsAnnouncedAt",
    ]

    for (let index = 0; index < orderedKeys.length - 1; index += 1) {
      const currentKey = orderedKeys[index]
      const nextKey = orderedKeys[index + 1]
      if (
        parsedTimeline[currentKey] &&
        parsedTimeline[nextKey] &&
        parsedTimeline[currentKey] > parsedTimeline[nextKey]
      ) {
        errors.timeline[nextKey] = `${timelineFieldDefs.find((item) => item.key === nextKey)?.label || nextKey} must be after ${
          timelineFieldDefs.find((item) => item.key === currentKey)?.label || currentKey
        }.`
        markStep("timeline")
      }
    }

    if (
      parsedTimeline.votingEmailStartAt &&
      parsedTimeline.votingStartAt &&
      parsedTimeline.votingEmailStartAt > parsedTimeline.votingStartAt
    ) {
      errors.timeline.votingEmailStartAt = "Auto send must be on or before voting start."
      markStep("timeline")
    }

    if (
      parsedTimeline.handoverAt &&
      parsedTimeline.resultsAnnouncedAt &&
      parsedTimeline.handoverAt < parsedTimeline.resultsAnnouncedAt
    ) {
      errors.timeline.handoverAt = "Handover must be on or after results announcement."
      markStep("timeline")
    }
  }

  if (shouldValidate("commission")) {
    const chief = String(form.electionCommission?.chiefElectionOfficerRollNumber || "").trim().toUpperCase()
    const officers = Array.isArray(form.electionCommission?.officerRollNumbers)
      ? form.electionCommission.officerRollNumbers
      : []

    if (chief.length > 30) {
      errors.commission.chiefElectionOfficerRollNumber =
        "Chief Election Officer roll number cannot exceed 30 characters."
      markStep("commission")
    }

    if (officers.length > 12) {
      errors.commission.officerRollNumbers = "You can add up to 12 election officers."
      markStep("commission")
    }

    if (
      officers.some((rollNumber) => !String(rollNumber || "").trim() || String(rollNumber || "").trim().length > 30)
    ) {
      errors.commission.officerRollNumbers =
        "Each election officer roll number must be between 1 and 30 characters."
      markStep("commission")
    }
  }

  if (shouldValidate("posts")) {
    if (!Array.isArray(form.posts) || form.posts.length === 0) {
      errors.general = "Add at least one post before creating the election."
      markStep("posts")
    }

    ;(form.posts || []).forEach((post, index) => {
      const title = String(post.title || "").trim()
      const code = String(post.code || "").trim().toUpperCase()
      const description = String(post.description || "").trim()
      const candidateScope = post.candidateEligibility || { batches: [], groups: [], extraRollNumbers: [] }
      const voterScope = post.voterEligibility || { batches: [], groups: [], extraRollNumbers: [] }
      const requirements = post.requirements || {}

      if (title.length < 2 || title.length > 200) {
        markPostError(index, "title", "Post title must be between 2 and 200 characters.")
      }

      if (code.length > 60) {
        markPostError(index, "code", "Code cannot exceed 60 characters.")
      }

      if (!postCategoryOptions.some((option) => option.value === post.category)) {
        markPostError(index, "category", "Select a valid post category.")
      }

      if (description.length > 4000) {
        markPostError(index, "description", "Description cannot exceed 4000 characters.")
      }

      if (!hasScopeSelection(candidateScope)) {
        markPostError(index, "candidateEligibility", "Select at least one batch, group, or CSV student for candidates.")
      }

      if (!hasScopeSelection(voterScope)) {
        markPostError(index, "voterEligibility", "Select at least one batch, group, or CSV student for voters.")
      }

      if ((candidateScope.extraRollNumbers || []).some((value) => String(value || "").trim().length > 30)) {
        markPostError(index, "candidateEligibility", "Candidate roll numbers cannot exceed 30 characters.")
      }

      if ((voterScope.extraRollNumbers || []).some((value) => String(value || "").trim().length > 30)) {
        markPostError(index, "voterEligibility", "Voter roll numbers cannot exceed 30 characters.")
      }

      if ((candidateScope.groups || []).some((value) => String(value || "").trim().length > 120)) {
        markPostError(index, "candidateEligibility", "Candidate group names cannot exceed 120 characters.")
      }

      if ((voterScope.groups || []).some((value) => String(value || "").trim().length > 120)) {
        markPostError(index, "voterEligibility", "Voter group names cannot exceed 120 characters.")
      }

      if (Number(requirements.minCgpa) < 0 || Number(requirements.minCgpa) > 10) {
        markPostError(index, "minCgpa", "Minimum CGPA must be between 0 and 10.")
      }

      if (String(requirements.notes || "").trim().length > 2000) {
        markPostError(index, "notes", "Notes cannot exceed 2000 characters.")
      }

      if (
        Boolean(requirements.requireHostelResident) &&
        (requirements.allowedHostelNames || []).some((hostelName) => !hostelNames.has(hostelName))
      ) {
        markPostError(index, "allowedHostelNames", "Select hostels only from the available hostel list.")
      }
    })
  }

  return {
    isValid: !hasAnyWizardErrors(errors),
    errors,
    firstInvalidStep,
    firstInvalidPostIndex,
  }
}

export const validateNominationForm = (form, post) => {
  const proposerEntries = form.proposerEntries || []
  const seconderEntries = form.seconderEntries || []
  const proposerRollNumbers = proposerEntries
    .map((entry) => String(entry?.rollNumber || "").trim().toUpperCase())
    .filter(Boolean)
  const seconderRollNumbers = seconderEntries
    .map((entry) => String(entry?.rollNumber || "").trim().toUpperCase())
    .filter(Boolean)
  const requiredProposers = Math.max(1, Number(post?.requirements?.proposersRequired || 1))
  const requiredSeconders = Math.max(1, Number(post?.requirements?.secondersRequired || 1))

  if (!Number.isFinite(Number(form.cgpa)) || Number(form.cgpa) < 0 || Number(form.cgpa) > 10) {
    return "CGPA must be between 0 and 10."
  }

  if (!form.hasNoActiveBacklogs) {
    return "Confirm that you do not have any active backlog before saving the nomination."
  }

  if (new Set([...proposerRollNumbers, ...seconderRollNumbers]).size !== proposerRollNumbers.length + seconderRollNumbers.length) {
    return "The same student cannot be added as both proposer and seconder."
  }

  if (
    proposerRollNumbers.length > 20 ||
    seconderRollNumbers.length > 20 ||
    proposerRollNumbers.some((item) => item.length > 30) ||
    seconderRollNumbers.some((item) => item.length > 30)
  ) {
    return "Proposer and seconder roll numbers must stay within the allowed limits."
  }

  if (proposerRollNumbers.length < requiredProposers) {
    return `Add ${requiredProposers} proposer${requiredProposers === 1 ? "" : "s"} before saving the nomination.`
  }

  if (seconderRollNumbers.length < requiredSeconders) {
    return `Add ${requiredSeconders} seconder${requiredSeconders === 1 ? "" : "s"} before saving the nomination.`
  }

  const invalidSupporter = [...proposerEntries, ...seconderEntries].find((entry) => {
    const hasValue = Boolean(String(entry?.rollNumber || "").trim())
    return hasValue && entry?.lookupStatus !== "validated"
  })

  if (invalidSupporter) {
    return invalidSupporter.lookupMessage || `Verify roll number ${invalidSupporter.rollNumber} before saving the nomination.`
  }

  if (
    !isValidUrlOrEmpty(form.gradeCardUrl) ||
    !isValidUrlOrEmpty(form.manifestoUrl) ||
    !isValidUrlOrEmpty(form.porDocumentUrl)
  ) {
    return "Uploaded nomination documents are invalid. Please upload them again."
  }

  if (
    !isPdfDocumentPathOrEmpty(form.gradeCardUrl) ||
    !isPdfDocumentPathOrEmpty(form.manifestoUrl) ||
    !isPdfDocumentPathOrEmpty(form.porDocumentUrl)
  ) {
    return "Only PDF files are allowed for nomination documents."
  }

  return ""
}
