import { eventsApi } from "../../service"

/** Events list (shared by EventsPage and the phone app's background preload). */
export const eventsListQuery = ({ page = 1, filter = "upcoming", search = "" } = {}) => ({
  queryKey: ["events", "list", { page, filter, search }],
  queryFn: () => eventsApi.getAllEvents({ page, limit: 10, filter, search }),
})
