import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useSocket } from "@/contexts/SocketProvider"
import { queryKeys } from "./queryKeys"

const SOCKET_EVENT_TO_INVALIDATIONS = {
  "visitor-update": () => [queryKeys.visitors.all],
  "complaint-update": () => [queryKeys.complaints.all],
  notification: () => [queryKeys.notifications.all],
}

const QueryInvalidationBridge = () => {
  const queryClient = useQueryClient()
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return undefined

    const subscriptions = Object.entries(SOCKET_EVENT_TO_INVALIDATIONS).map(
      ([event, keysForEvent]) => {
        const handler = () => {
          for (const queryKey of keysForEvent()) {
            queryClient.invalidateQueries({ queryKey })
          }
        }
        socket.on(event, handler)
        return { event, handler }
      }
    )

    return () => {
      for (const { event, handler } of subscriptions) {
        socket.off(event, handler)
      }
    }
  }, [socket, queryClient])

  return null
}

export default QueryInvalidationBridge
