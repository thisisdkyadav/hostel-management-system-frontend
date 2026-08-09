import { getStatusColor, getTimeSince } from "../../utils/adminUtils"
import { useAuth } from "../../contexts/AuthProvider"
import { DataTable, HStack, IconCircle, Text, VStack } from "hzero"
import { getMediaUrl } from "../../utils/mediaUtils"

const ComplaintListView = ({ complaints, onViewDetails, loading = false }) => {
  const { user } = useAuth()

  const isStudent = user?.role === 'Student'

  const columns = [
    {
      header: "ID/Title",
      key: "title",
      render: (complaint) => (
        <VStack gap="none">
          <Text as="div" size="xs" color="placeholder">{complaint.id?.substring(0, 8)}</Text>
          <Text as="div" weight="medium" color="primary" className="line-clamp-1">{complaint.title}</Text>
        </VStack>
      ),
    },
    !isStudent && {
      header: "Reported",
      key: "reportedBy",
      className: "hidden md:table-cell",
      render: (complaint) => (
        <HStack gap="none" align="center">
          <div style={{ flexShrink: 0, height: 'var(--avatar-sm)', width: 'var(--avatar-sm)' }}>
            {complaint.reportedBy?.profileImage ? (
              <img style={{ height: 'var(--avatar-sm)', width: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} src={getMediaUrl(complaint.reportedBy.profileImage)} alt="" />
            ) : (
              <IconCircle size="var(--avatar-sm)" bg="var(--color-primary)" color="var(--color-white)" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {complaint.reportedBy?.name?.charAt(0) || "U"}
              </IconCircle>
            )}
          </div>
          <div style={{ marginLeft: 'var(--spacing-3)' }}>
            <Text as="div" size="sm" weight="medium" color="primary" className="line-clamp-1">{complaint.reportedBy?.name}</Text>
            <Text as="div" size="xs" color="placeholder">{getTimeSince(complaint.createdDate)}</Text>
          </div>
        </HStack>
      ),
    },
    !isStudent && {
      header: "Location",
      key: "location",
      className: "hidden sm:table-cell",
      render: (complaint) => (
        <VStack gap="none">
          <Text as="div" weight="medium" size="sm" className="truncate max-w-[150px]">{complaint.hostel || complaint.location}</Text>
          {complaint.roomNumber ? <Text as="div" size="xs" color="muted">Room {complaint.roomNumber}</Text> : complaint.hostel ? <Text as="div" size="xs" color="muted" className="truncate max-w-[150px]">{complaint.location}</Text> : null}
        </VStack>
      ),
    },
    {
      header: "Category",
      key: "category",
      className: "hidden md:table-cell",
      style: {
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-body)'
      }
    },
    {
      header: "Status",
      key: "status",
      render: (complaint) => <span className={`${getStatusColor(complaint.status)}`} style={{ padding: 'var(--badge-padding-sm)', display: 'inline-flex', fontSize: 'var(--badge-font-sm)', lineHeight: 'var(--line-height-tight)', fontWeight: 'var(--font-weight-medium)', borderRadius: 'var(--radius-full)' }}>{complaint.status}</span>,
    },
  ].filter(Boolean)

  return <DataTable columns={columns} data={complaints} emptyMessage="No complaints to display" onRowClick={onViewDetails} loading={loading} />
}

export default ComplaintListView
