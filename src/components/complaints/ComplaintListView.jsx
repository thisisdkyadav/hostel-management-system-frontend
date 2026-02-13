import { getStatusColor, getTimeSince } from "../../utils/adminUtils"
import { useAuth } from "../../contexts/AuthProvider"
import { DataTable } from "czero/react"
import { getMediaUrl } from "../../utils/mediaUtils"

const ComplaintListView = ({ complaints, onViewDetails, loading = false }) => {
  const { user } = useAuth()

  const isStudent = user?.role === 'Student'

  const columns = [
    {
      header: "ID/Title",
      key: "title",
      render: (complaint) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-placeholder)' }}>{complaint.id?.substring(0, 8)}</div>
          <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }} className="line-clamp-1">{complaint.title}</div>
        </div>
      ),
    },
    !isStudent && {
      header: "Reported",
      key: "reportedBy",
      className: "hidden md:table-cell",
      render: (complaint) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flexShrink: 0, height: 'var(--avatar-sm)', width: 'var(--avatar-sm)' }}>
            {complaint.reportedBy?.profileImage ? (
              <img style={{ height: 'var(--avatar-sm)', width: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} src={getMediaUrl(complaint.reportedBy.profileImage)} alt="" />
            ) : (
              <div style={{ height: 'var(--avatar-sm)', width: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-white)', fontWeight: 'var(--font-weight-medium)', backgroundColor: 'var(--color-primary)' }} >
                {complaint.reportedBy?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div style={{ marginLeft: 'var(--spacing-3)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }} className="line-clamp-1">{complaint.reportedBy?.name}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-placeholder)' }}>{getTimeSince(complaint.createdDate)}</div>
          </div>
        </div>
      ),
    },
    !isStudent && {
      header: "Location",
      key: "location",
      className: "hidden sm:table-cell",
      render: (complaint) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }} className="truncate max-w-[150px]">{complaint.hostel || complaint.location}</div>
          {complaint.roomNumber ? <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Room {complaint.roomNumber}</div> : complaint.hostel ? <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }} className="truncate max-w-[150px]">{complaint.location}</div> : null}
        </div>
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
