

export const nominationTemplateHeaders = ["rollNumber"]

export const votingListTemplateHeaders = ["rollNumber"]

export const wizardSteps = [
  { id: "basics", label: "Basics", sublabel: "Identity & phase" },
  { id: "timeline", label: "Timeline", sublabel: "D-15 schedule" },
  { id: "commission", label: "Commission", sublabel: "CEO & officers" },
  { id: "posts", label: "Posts", sublabel: "Electorate & rules" },
]

export const nominationTabs = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Modification Requested", value: "modification_requested" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
]

export const phaseOptions = [
  { value: "phase1", label: "Phase 1" },
  { value: "horc", label: "HORC" },
  { value: "custom", label: "Custom" },
]

export const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export const votingAccessOptions = [
  { value: "both", label: "Email + Student Portal" },
  { value: "email", label: "Email Only" },
  { value: "portal", label: "Student Portal Only" },
]

export const postCategoryOptions = [
  { value: "executive", label: "Executive" },
  { value: "senator", label: "Senator" },
  { value: "horc", label: "HORC" },
  { value: "custom", label: "Custom" },
]

export const timelineFieldDefs = [
  { key: "announcementAt", label: "Announcement", day: "D-15" },
  { key: "nominationStartAt", label: "Nomination Start", day: "D-14" },
  { key: "nominationEndAt", label: "Nomination End", day: "D-12" },
  { key: "withdrawalEndAt", label: "Withdrawal", day: "D-10" },
  { key: "campaigningStartAt", label: "Campaigning Start", day: "D-8" },
  { key: "campaigningEndAt", label: "Campaigning End", day: "D-2" },
  { key: "votingEmailStartAt", label: "Link Sending Starts", day: "Configurable" },
  { key: "votingStartAt", label: "Voting Start", day: "D" },
  { key: "votingEndAt", label: "Voting End", day: "D" },
  { key: "resultsAnnouncedAt", label: "Results", day: "D+1" },
  { key: "handoverAt", label: "Handover", day: "Post-election" },
]

export const requirementFieldDefs = [
  { key: "minCgpa", label: "Minimum CGPA", step: "0.1" },
]
