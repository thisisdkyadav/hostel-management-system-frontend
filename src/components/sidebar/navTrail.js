import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useGlobal } from "../../contexts/GlobalProvider"
import { queryKeys } from "../../lib/query"
import { complaintApi } from "../../service"
import { COMPLAINT_FILTER_TABS } from "../../constants/adminConstants"

/**
 * V8 "Trail": the sidebar follows you into a page.
 *
 * For the open page, returns its sections (each hostel under Hostels, each status
 * under Complaints, ...) so they can be listed right under its row and reached
 * with one click. Each entry: { key, label, to, active, count?, depth? }.
 * Only pages whose sections live in the URL are listed, so a click always lands
 * on exactly that section.
 */

const segmentAfter = (pathname, prefix) => {
  if (!pathname.startsWith(prefix)) return null
  const rest = pathname.slice(prefix.length).split("/").filter(Boolean)
  return rest.map((part) => {
    try {
      return decodeURIComponent(part)
    } catch {
      return part
    }
  })
}

const COMPLAINT_STAT_KEYS = {
  all: "total",
  Pending: "pending",
  "In Progress": "inProgress",
  "Forwarded to IDO": "forwardedToIDO",
  Resolved: "resolved",
}

const DINING_TAG_TABS = [
  { value: "standalone", label: "Standalone" },
  { value: "period", label: "Allocation tags" },
]

const useNavTrail = ({ enabled, pathname, search }) => {
  const { hostelList } = useGlobal() || {}
  const params = useMemo(() => new URLSearchParams(search || ""), [search])

  const onComplaints = enabled && pathname === "/admin/complaints"
  // Same cache entry as the Complaints page's own counts, so no extra request there.
  const complaintStats = useQuery({
    queryKey: queryKeys.complaints.stats("all"),
    queryFn: () => complaintApi.getStats({}),
    enabled: onComplaints,
    staleTime: 30000,
  })

  const hostelEntries = useMemo(() => {
    if (!enabled || !Array.isArray(hostelList)) return null
    const [openHostel, unitWord, unitNumber] = segmentAfter(pathname, "/admin/hostels") || []
    const entries = []
    for (const hostel of hostelList) {
      if (!hostel?.name) continue
      const active = openHostel ? hostel.name.toLowerCase() === openHostel.toLowerCase() : false
      entries.push({
        key: `hostel:${hostel.name}`,
        label: hostel.name,
        to: `/admin/hostels/${encodeURIComponent(hostel.name)}`,
        active: active && !unitNumber,
        open: active,
      })
      if (active && unitWord === "units" && unitNumber) {
        entries.push({
          key: `unit:${unitNumber}`,
          label: `Unit ${unitNumber}`,
          to: pathname,
          active: true,
          depth: 2,
        })
      }
    }
    return entries
  }, [enabled, hostelList, pathname])

  const complaintEntries = useMemo(() => {
    if (!onComplaints) return null
    const stats = complaintStats.data?.data || complaintStats.data || null
    const current = params.get("status") || "all"
    return COMPLAINT_FILTER_TABS.map((tab) => ({
      key: `status:${tab.value}`,
      label: tab.value === "all" ? "All" : tab.label,
      to: tab.value === "all" ? "/admin/complaints" : `/admin/complaints?status=${encodeURIComponent(tab.value)}`,
      active: current === tab.value,
      count: stats ? stats[COMPLAINT_STAT_KEYS[tab.value]] ?? null : null,
    }))
  }, [complaintStats.data, onComplaints, params])

  const tagEntries = useMemo(() => {
    if (!enabled || pathname !== "/admin/dining-tags") return null
    const current = params.get("tab") === "period" ? "period" : "standalone"
    return DINING_TAG_TABS.map((tab) => ({
      key: `tags:${tab.value}`,
      label: tab.label,
      to: tab.value === "standalone" ? "/admin/dining-tags" : "/admin/dining-tags?tab=period",
      active: current === tab.value,
    }))
  }, [enabled, params, pathname])

  return useCallback(
    (item) => {
      if (!enabled || !item?.path) return null
      if (item.path === "/admin/hostels") return hostelEntries
      if (item.path === "/admin/complaints") return complaintEntries
      if (item.path === "/admin/dining-tags") return tagEntries
      return null
    },
    [complaintEntries, enabled, hostelEntries, tagEntries]
  )
}

export default useNavTrail
