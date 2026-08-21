import { useRef, useState } from "react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import { createDefaultOverlapState, normalizeEventId } from "@/components/gymkhana/events-page/shared"

export const useEventOverlapCheck = ({ calendar }) => {
  const [dateOverlapInfo, setDateOverlapInfo] = useState(createDefaultOverlapState)
  const overlapCheckRequestRef = useRef(0)

  const resetDateOverlapInfo = () => {
    overlapCheckRequestRef.current += 1
    setDateOverlapInfo(createDefaultOverlapState())
  }

  const checkDateOverlap = async (candidateForm, eventId = null) => {
    if (!calendar?._id || !candidateForm.startDate || !candidateForm.endDate) {
      resetDateOverlapInfo()
      return
    }

    if (new Date(candidateForm.endDate) < new Date(candidateForm.startDate)) {
      resetDateOverlapInfo()
      return
    }

    const normalizedEventId = normalizeEventId(eventId)
    const checkKey = `${calendar._id}:${normalizedEventId || "new"}:${candidateForm.startDate}:${candidateForm.endDate}`
    const requestId = overlapCheckRequestRef.current + 1
    overlapCheckRequestRef.current = requestId

    setDateOverlapInfo((previous) => ({
      ...previous,
      status: "pending",
      checkingKey: checkKey,
      errorMessage: "",
    }))

    try {
      const overlapRequestPayload = {
        startDate: candidateForm.startDate,
        endDate: candidateForm.endDate,
        ...(normalizedEventId ? { eventId: normalizedEventId } : {}),
      }
      const response = await gymkhanaEventsApi.checkDateOverlap(calendar._id, overlapRequestPayload)
      if (requestId !== overlapCheckRequestRef.current) return
      const data = response.data || response || {}
      setDateOverlapInfo({
        status: "checked",
        hasOverlap: Boolean(data.hasOverlap),
        overlaps: data.overlaps || [],
        checkedKey: checkKey,
        checkingKey: null,
        errorMessage: "",
      })
    } catch {
      if (requestId !== overlapCheckRequestRef.current) return
      setDateOverlapInfo({
        status: "error",
        hasOverlap: false,
        overlaps: [],
        checkedKey: null,
        checkingKey: null,
        errorMessage: "Could not verify date overlap. Please retry.",
      })
    }
  }

  return {
    dateOverlapInfo,
    setDateOverlapInfo,
    resetDateOverlapInfo,
    checkDateOverlap,
  }
}

export default useEventOverlapCheck
