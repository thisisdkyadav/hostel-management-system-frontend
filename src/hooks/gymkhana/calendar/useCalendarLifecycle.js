import { useState } from "react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"

export const useCalendarLifecycle = ({
  toast,
  calendar,
  selectedYear,
  canCreateEventsCapability,
  canCreateCalendar,
  canManageCalendarLock,
  fetchCalendar,
  fetchYears,
  setSelectedYear,
  setSubmitting,
}) => {
  const [newAcademicYear, setNewAcademicYear] = useState("")
  const [showCreateCalendarModal, setShowCreateCalendarModal] = useState(false)
  const [showOverlapConfirmModal, setShowOverlapConfirmModal] = useState(false)
  const [submitOverlapInfo, setSubmitOverlapInfo] = useState(null)

  const handleSubmitCalendar = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to submit calendar")
      return
    }

    try {
      setSubmitting(true)
      const response = await gymkhanaEventsApi.submitCalendar(calendar._id, false)
      const data = response.data || response || {}

      if (data.requiresOverlapConfirmation) {
        setSubmitOverlapInfo(data)
        setShowOverlapConfirmModal(true)
        setSubmitting(false)
        return
      }

      toast.success("Calendar submitted for approval")
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to submit calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmSubmitWithOverlap = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to submit calendar")
      return
    }

    if (!calendar?._id) return

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.submitCalendar(calendar._id, true)
      toast.success("Calendar submitted with overlap warning")
      setShowOverlapConfirmModal(false)
      setSubmitOverlapInfo(null)
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to submit calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateCalendar = async () => {
    if (!canCreateCalendar) {
      toast.error("You do not have permission to create calendar")
      return
    }

    if (!newAcademicYear) {
      toast.error("Please select an academic year")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.createCalendar({ academicYear: newAcademicYear })
      toast.success("Calendar created successfully")
      setShowCreateCalendarModal(false)
      setNewAcademicYear("")
      await fetchYears()
      setSelectedYear(newAcademicYear)
    } catch (err) {
      toast.error(err.message || "Failed to create calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLockCalendar = async () => {
    if (!canManageCalendarLock) {
      toast.error("You do not have permission to manage calendar lock")
      return
    }

    if (!calendar?._id) return
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.lockCalendar(calendar._id)
      toast.success("Calendar locked")
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to lock calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnlockCalendar = async () => {
    if (!canManageCalendarLock) {
      toast.error("You do not have permission to manage calendar lock")
      return
    }

    if (!calendar?._id) return
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.unlockCalendar(calendar._id)
      toast.success("Calendar unlocked")
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to unlock calendar")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    newAcademicYear,
    setNewAcademicYear,
    showCreateCalendarModal,
    setShowCreateCalendarModal,
    showOverlapConfirmModal,
    setShowOverlapConfirmModal,
    submitOverlapInfo,
    setSubmitOverlapInfo,
    handleSubmitCalendar,
    handleConfirmSubmitWithOverlap,
    handleCreateCalendar,
    handleLockCalendar,
    handleUnlockCalendar,
  }
}

export default useCalendarLifecycle
