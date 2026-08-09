import { useEffect, useState } from "react"
import { ClipboardList } from "lucide-react"
import { Badge, DataTable, EmptyState, Text, VStack } from "hzero"
import { studentApi } from "../../../../service"
import ComplaintDetailModal from "../../../complaints/ComplaintDetailModal"

/**
 * A student's last ten complaints.
 *
 * Was a hand-built table with its own spinner, its own empty state, and a row
 * hover written as onMouseEnter/onMouseLeave assigning backgroundColor —
 * which no theme could reach and which no keyboard user ever saw. DataTable
 * has all three.
 */

const STATUS_VARIANT = {
  Pending: "warning",
  "In Progress": "info",
  Resolved: "success",
}

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"

const columns = [
  { key: "createdDate", header: "Date", render: (c) => formatDate(c.createdDate) },
  {
    key: "title",
    header: "Title",
    render: (c) => <Text as="span" size="sm" weight="medium" color="primary">{c.title}</Text>,
  },
  { key: "category", header: "Category" },
  {
    key: "status",
    header: "Status",
    render: (c) => <Badge variant={STATUS_VARIANT[c.status] || "danger"} size="small">{c.status}</Badge>,
  },
]

const ComplaintsTab = ({ userId }) => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  const fetchStudentComplaints = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const response = await studentApi.getStudentComplaints(userId, { limit: 10 })
      setComplaints(response.data?.items || [])
    } catch (error) {
      console.error("Error fetching student complaints:", error)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const run = async () => { await fetchStudentComplaints() }
    run()
  }, [userId])

  return (
    <VStack gap="medium" className="px-[var(--spacing-4)]">
      <Text as="h3" size="lg" weight="semibold" color="body">Complaints History</Text>

      <DataTable
        columns={columns}
        data={complaints}
        loading={loading}
        onRowClick={setSelectedComplaint}
        emptyState={
          <EmptyState
            icon={ClipboardList}
            title="No complaints"
            message="This student has not raised any complaints."
          />
        }
      />

      {selectedComplaint && (
        <ComplaintDetailModal
          selectedComplaint={selectedComplaint}
          setShowDetailModal={() => setSelectedComplaint(null)}
          onComplaintUpdate={fetchStudentComplaints}
        />
      )}
    </VStack>
  )
}

export default ComplaintsTab
