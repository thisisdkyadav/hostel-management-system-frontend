import { useState, useEffect, useCallback, useMemo, createElement } from "react"
import { Tabs, DataTable, StatusBadge } from "czero/react"
import { StatCards } from "@/components/ui"
import { FaClipboardList, FaInbox, FaRegCheckCircle, FaDoorOpen } from "react-icons/fa"
import { MdOutlineWatchLater } from "react-icons/md"
import PageHeader from "../../components/common/PageHeader"
import { useAuth } from "../../contexts/AuthProvider"
import { accommodationApi } from "@/service"
import { ACCOMMODATION_STATUS, getStatusTone } from "@/constants/accommodationStatus"
import { money, shortId, ApplicantCell, StayCell } from "../../components/accommodation/AccommodationKit"
import AccommodationStaffDetail from "../../components/accommodation/AccommodationStaffDetail"

const LANE_PALETTE = [
  { color: "var(--color-warning)", icon: FaInbox },
  { color: "var(--color-info)", icon: MdOutlineWatchLater },
  { color: "var(--color-success)", icon: FaRegCheckCircle },
  { color: "var(--color-primary)", icon: FaDoorOpen },
]

const S = ACCOMMODATION_STATUS
const ALL = "__all"

const lanesFor = (user) => {
  const l = (status, label) => ({ status, label })
  if (user?.role === "Hostel Supervisor") return [l(S.HOSTEL_ALLOTTED, "Assign rooms"), l(S.ROOMS_ASSIGNED, "Assigned"), l(S.CHECKED_IN, "Checked in")]
  if (user?.role === "Admin" && user.subRole === "Chief Warden") return [l(S.PENDING_CW_APPROVAL, "Awaiting you"), l(S.CW_APPROVED, "Approved"), l(S.RETURNED_TO_STUDENT, "Returned")]
  if (user?.role === "Admin" && user.subRole === "Chief Warden Office") return [l(S.CW_APPROVED, "Request payment"), l(S.PAYMENT_VERIFIED, "Allot hostel"), l(S.HOSTEL_ALLOTTED, "Allotted")]
  if (user?.role === "Admin" && user.subRole === "Accountant") return [l(S.PAYMENT_SUBMITTED, "Verify payment"), l(S.PAYMENT_VERIFIED, "Verified")]
  return [l(S.PENDING_CW_APPROVAL, "In approval"), l(S.PAYMENT_SUBMITTED, "In payment"), l(S.HOSTEL_ALLOTTED, "Allotted")]
}

const subtitleFor = (user) => {
  if (user?.role === "Hostel Supervisor") return "Assign rooms to allotted guest bookings."
  if (user?.subRole === "Chief Warden") return "Review and approve guest accommodation requests."
  if (user?.subRole === "Chief Warden Office") return "Issue payment requests and allot hostels."
  if (user?.subRole === "Accountant") return "Verify guest accommodation payments."
  return "Manage guest accommodation requests."
}

const AccommodationStaffPage = () => {
  const { user } = useAuth()
  const lanes = useMemo(() => lanesFor(user), [user])
  const subtitle = useMemo(() => subtitleFor(user), [user])

  const [allRequests, setAllRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(ALL)
  const [selected, setSelected] = useState(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await accommodationApi.listRequests({ limit: 200 })
      setAllRequests(res?.data?.items || [])
    } catch {
      setAllRequests([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const counts = useMemo(() => {
    const map = {}
    for (const r of allRequests) map[r.status] = (map[r.status] || 0) + 1
    return map
  }, [allRequests])

  const tabs = useMemo(
    () => [
      { value: ALL, label: "All", count: allRequests.length },
      ...lanes.map((l) => ({ value: l.status, label: l.label, count: counts[l.status] || 0 })),
    ],
    [lanes, counts, allRequests.length]
  )

  const statCards = useMemo(() => {
    const cards = [
      { title: "Total", value: allRequests.length, subtitle: "Guest requests", icon: <FaClipboardList />, color: "var(--color-primary)" },
    ]
    lanes.forEach((l, i) => {
      const p = LANE_PALETTE[i % LANE_PALETTE.length]
      cards.push({ title: l.label, value: counts[l.status] || 0, subtitle: "In queue", icon: createElement(p.icon), color: p.color })
    })
    return cards
  }, [lanes, counts, allRequests.length])

  const visible = useMemo(() => (filter === ALL ? allRequests : allRequests.filter((r) => r.status === filter)), [allRequests, filter])

  const openDetail = async (row) => {
    setSelected(row)
    try {
      const res = await accommodationApi.getRequest(row._id || row.id)
      if (res?.data) setSelected(res.data)
    } catch {
      /* keep row data */
    }
  }

  const refreshAfterAction = async () => {
    await fetchRequests()
    setSelected(null)
  }

  const columns = [
    { key: "applicant", header: "Applicant", render: (r) => <ApplicantCell request={r} /> },
    { key: "stay", header: "Stay", render: (r) => <StayCell request={r} /> },
    { key: "persons", header: "Guests", align: "center", render: (r) => r.persons ?? (r.guests?.length || 0) },
    { key: "total", header: "Amount", align: "right", render: (r) => money(r.quote?.total) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} tone={getStatusTone(r.status)}>{r.status}</StatusBadge> },
    { key: "id", header: "ID", align: "right", render: (r) => <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--color-text-muted)" }}>{shortId(r._id || r.id)}</span> },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PageHeader title="Guest Accommodation" subtitle={subtitle} />

      <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-6) var(--spacing-8)" }}>
        <div style={{ marginBottom: "var(--spacing-5)" }}>
          <StatCards stats={statCards} columns={statCards.length} loading={loading} loadingCount={statCards.length} />
        </div>

        <div style={{ marginBottom: "var(--spacing-4)" }}>
          <Tabs variant="pills" size="md" tabs={tabs} activeTab={filter} setActiveTab={setFilter} />
        </div>

        <DataTable
          data={visible}
          columns={columns}
          isLoading={loading}
          pagination
          pageSize={10}
          onRowClick={openDetail}
          emptyMessage="Nothing in this queue right now."
        />
      </div>

      <AccommodationStaffDetail
        open={Boolean(selected)}
        request={selected}
        user={user}
        onClose={() => setSelected(null)}
        onChanged={refreshAfterAction}
      />
    </div>
  )
}

export default AccommodationStaffPage
