import { useEffect, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { studentApi } from "@/service"
import { queryKeys } from "@/lib/query"
import { addDays } from "../menu/menuHelpers"

/** The student's menu for the Mon–Sun week starting `weekStart` → { today, days }. */
export const useStudentMenuWeek = (weekStart) => {
  const params = { from: weekStart, to: addDays(weekStart, 6) }
  return useQuery({
    queryKey: queryKeys.dining.menu(params),
    queryFn: () => studentApi.getDiningMenu(params),
    placeholderData: keepPreviousData,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

/** A Date that re-renders its component every `intervalMs` (for "in 2 h 10 m" style lines). */
export const useNow = (intervalMs = 30000) => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}
