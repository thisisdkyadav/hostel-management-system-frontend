import { useEffect } from "react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import { formatINR } from "@/utils/formatters"
import {
  buildBudgetCapsPayload,
  getConfiguredBudgetCapsTotal,
  validateCategoryBudgetCaps,
} from "@/components/gymkhana/events-page/shared"
import { buildCalendarSettingsForm } from "./useCalendarData"

export const useCalendarSettings = ({
  toast,
  calendar,
  events,
  selectedYear,
  canManageCalendarLock,
  showSettingsModal,
  setShowSettingsModal,
  calendarSettingsForm,
  setCalendarSettingsForm,
  fetchCalendar,
  fetchYears,
  setSubmitting,
}) => {
  useEffect(() => {
    if (!showSettingsModal) return
    setCalendarSettingsForm(buildCalendarSettingsForm(calendar))
  }, [calendar, showSettingsModal])

  const handleCalendarSettingsFieldChange = (field, value) => {
    setCalendarSettingsForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCalendarBudgetCapChange = (category, value) => {
    setCalendarSettingsForm((current) => ({
      ...current,
      budgetCaps: {
        ...current.budgetCaps,
        [category]: value,
      },
    }))
  }

  const handleSaveCalendarSettings = async () => {
    if (!canManageCalendarLock) {
      toast.error("You do not have permission to manage calendar settings")
      return
    }

    if (!calendar?._id) return

    const nextBudgetCaps = buildBudgetCapsPayload(
      calendarSettingsForm.budgetCaps,
      calendarSettingsForm.categoryDefinitions
    )
    const budgetCapValidation = validateCategoryBudgetCaps(
      events,
      nextBudgetCaps,
      calendarSettingsForm.categoryDefinitions
    )
    if (!budgetCapValidation.isValid) {
      toast.error(
        "Cannot set the " +
          budgetCapValidation.label +
          " cap below the current allocated budget of " +
          formatINR(budgetCapValidation.total) +
          ". Increase the cap or reduce events in that category first."
      )
      return
    }

    const rawOverallBudget = String(calendarSettingsForm.overallBudget ?? "").trim()
    const nextOverallBudget = rawOverallBudget === "" ? null : Number(rawOverallBudget)

    if (rawOverallBudget !== "" && (!Number.isFinite(nextOverallBudget) || nextOverallBudget < 0)) {
      toast.error("Enter a valid overall calendar budget (0 or more), or leave it blank for no cap")
      return
    }

    const configuredCategoryCapsTotal = getConfiguredBudgetCapsTotal(
      nextBudgetCaps,
      calendarSettingsForm.categoryDefinitions
    )

    if (nextOverallBudget !== null && configuredCategoryCapsTotal > nextOverallBudget) {
      toast.error(
        "Total configured category caps (" +
          formatINR(configuredCategoryCapsTotal) +
          ") exceed overall calendar budget (" +
          formatINR(nextOverallBudget) +
          "). Reduce category caps or increase overall budget."
      )
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.updateCalendarSettings(calendar._id, {
        allowProposalBeforeApproval: Boolean(calendarSettingsForm.allowProposalBeforeApproval),
        overallBudget: nextOverallBudget,
        budgetCaps: nextBudgetCaps,
      })
      toast.success("Calendar settings updated")
      setShowSettingsModal(false)
      await fetchCalendar(selectedYear)
      await fetchYears()
    } catch (err) {
      toast.error(err.message || "Failed to update calendar settings")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    handleCalendarSettingsFieldChange,
    handleCalendarBudgetCapChange,
    handleSaveCalendarSettings,
  }
}

export default useCalendarSettings
