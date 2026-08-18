import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { Button, DataTable, StatusBadge, Text } from "hzero"
import { BookOpen, Plus } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { accommodationApi } from "@/service"
import { getStatusTone, getStudentStatusLabel } from "@/constants/accommodationStatus"
import { shortId, StayCell } from "../../components/accommodation/AccommodationKit"
import AccommodationRequestWizard from "../../components/accommodation/AccommodationRequestWizard"
import AccommodationRequestDetail from "../../components/accommodation/AccommodationRequestDetail"
import AccommodationGuidelinesModal from "../../components/accommodation/AccommodationGuidelinesModal"

const AccommodationPage = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [resubmitTarget, setResubmitTarget] = useState(null)
  const [selected, setSelected] = useState(null)
  const [guidelinesOpen, setGuidelinesOpen] = useState(true)
  const [searchParams] = useSearchParams()
  const handledRequestParamRef = useRef(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await accommodationApi.listRequests({ limit: 100 })
      setRequests(res?.data?.items || [])
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const openNew = () => {
    setResubmitTarget(null)
    setWizardOpen(true)
  }

  const openDetail = async (row) => {
    setSelected(row)
    try {
      const res = await accommodationApi.getRequest(row._id || row.id)
      if (res?.data) setSelected(res.data)
    } catch {
      /* keep row data */
    }
  }

  // Open a specific request's detail when deep-linked via ?request=<id> (from emails).
  // Wait until guidelines are dismissed so the two modals do not stack.
  useEffect(() => {
    const id = searchParams.get("request")
    if (!id || loading || guidelinesOpen) return
    if (handledRequestParamRef.current === id) return
    const match = requests.find((r) => String(r._id) === String(id) || String(r.id) === String(id))
    if (match) {
      handledRequestParamRef.current = id
      openDetail(match)
    }
  }, [searchParams, requests, loading, guidelinesOpen])

  const handleResubmit = (request) => {
    setSelected(null)
    setResubmitTarget(request)
    setWizardOpen(true)
  }

  const refreshSelected = async () => {
    await fetchRequests()
    if (selected) {
      try {
        const res = await accommodationApi.getRequest(selected._id || selected.id)
        setSelected(res?.data || null)
      } catch {
        setSelected(null)
      }
    }
  }

  const columns = [
    { key: "id", header: "Request", render: (r) => <Text as="span" size="xs" color="muted" style={{ fontFamily: "monospace" }}>{shortId(r._id || r.id)}</Text> },
    { key: "stay", header: "Stay", render: (r) => <StayCell request={r} /> },
    { key: "persons", header: "Guests", align: "center", render: (r) => r.persons ?? (r.guests?.length || 0) },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const label = getStudentStatusLabel(r.status)
        return <StatusBadge status={label} tone={getStatusTone(r.status)}>{label}</StatusBadge>
      },
    },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PageHeader title="Guest Accommodation" subtitle="Request and track hostel stays for your visitors">
        <Button variant="ghost" size="md" onClick={() => setGuidelinesOpen(true)}>
          <BookOpen size={16} /> Guidelines
        </Button>
        <Button variant="primary" size="md" onClick={openNew}>
          <Plus size={16} /> New Request
        </Button>
      </PageHeader>

      <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-6) var(--spacing-8)" }}>
        <DataTable
          data={requests}
          columns={columns}
          isLoading={loading}
          pagination
          pageSize={10}
          onRowClick={openDetail}
          emptyMessage="No accommodation requests yet. Create one to get started."
        />
      </div>

      <AccommodationGuidelinesModal open={guidelinesOpen} onClose={() => setGuidelinesOpen(false)} />

      <AccommodationRequestWizard
        open={wizardOpen}
        existingRequest={resubmitTarget}
        onClose={() => setWizardOpen(false)}
        onSubmitted={fetchRequests}
      />

      <AccommodationRequestDetail
        open={Boolean(selected)}
        request={selected}
        onClose={() => setSelected(null)}
        onChanged={refreshSelected}
        onResubmit={handleResubmit}
      />
    </div>
  )
}

export default AccommodationPage
