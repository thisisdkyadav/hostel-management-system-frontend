import { studentApi } from "@/service"
import { queryKeys } from "@/lib/query"

/** The student dining portal read: shared by the Dining page, the allocation screen and the boot prefetch. */
export const studentDiningPortalQuery = () => ({
  queryKey: queryKeys.dining.portalState(),
  queryFn: () => studentApi.getDiningPortalState(),
})

export const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")
  } catch {
    return null
  }
}

/**
 * Start the portal read for a student before any page asks for it, so the
 * allocation screen can decide straight away. A stale hint (expired session)
 * just fails quietly and the gate refetches once it mounts.
 */
export const warmStudentPortal = (queryClient, user) => {
  if (user?.role !== "Student") return
  queryClient.prefetchQuery(studentDiningPortalQuery())
}
