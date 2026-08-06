import { POST_SA_STAGE_ORDER } from "@/components/por/porStatus"

export const createDefaultForm = () => ({
  porCategoryId: "",
  hasDisciplinaryAction: null,
  disciplinaryActionDetails: "",
  positionTitle: "",
  positionDetails: "",
  tenure: "",
  supportingDocumentUrl: "",
  supportingDocumentName: "",
  undertakingAccepted: false,
})

export const createEmptyCategoryStep = (index = 0) => ({
  label: `Gymkhana Step ${index + 1}`,
  reviewerUserIds: [],
  reviewerPickerId: "",
})

export const createDefaultCategoryForm = () => ({
  name: "",
  gymkhanaSteps: [createEmptyCategoryStep(0)],
})

export const countSelectedPostSaApprovers = (assignments = {}) =>
  POST_SA_STAGE_ORDER.reduce(
    (count, stage) => (String(assignments?.[stage] || "").trim() ? count + 1 : count),
    0
  )
