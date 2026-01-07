import { FaBuilding } from "react-icons/fa"
import { BiSolidCategory } from "react-icons/bi"
import { getStatusColor, getPriorityColor, getTimeSince } from "../../utils/adminUtils"
import { getMediaUrl } from "../../utils/mediaUtils"
import { Card } from "@/components/ui"

const ComplaintCardView = ({ complaints, onViewDetails }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-4)' }} >
      {complaints.map((complaint) => (
        <Card key={complaint.id} className="cursor-pointer" onClick={() => onViewDetails(complaint)}
        >
          <Card.Header style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{complaint.id?.substring(0, 8)}</span>
                <h3 style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-xl)', marginTop: 'var(--spacing-1)', color: 'var(--color-text-secondary)' }} className="line-clamp-1">{complaint.title}</h3>
              </div>
              <span className={`${getStatusColor(complaint.status)}`} style={{ padding: 'var(--badge-padding-sm)', fontSize: 'var(--badge-font-sm)', fontWeight: 'var(--font-weight-medium)', borderRadius: 'var(--radius-full)' }}>{complaint.status}</span>
            </div>
          </Card.Header>

          <Card.Body>
            <div style={{ marginTop: 'var(--spacing-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaBuilding style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-70)', fontSize: 'var(--font-size-sm)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)' }} className="truncate max-w-[150px]">
                  {complaint.hostel}, Room {complaint.roomNumber}
                </span>
              </div>
              <span className={`${getPriorityColor(complaint.priority)}`} style={{ padding: 'var(--badge-padding-sm)', fontSize: 'var(--badge-font-sm)', fontWeight: 'var(--font-weight-medium)', borderRadius: 'var(--radius-full)' }}>{complaint.priority}</span>
            </div>

            <div style={{ marginTop: 'var(--spacing-4)' }}>
              <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)' }} className="line-clamp-3">{complaint.description}</div>
            </div>

            <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BiSolidCategory style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-70)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)' }}>{complaint.category}</span>
              </div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{getTimeSince(complaint.createdDate)}</span>
            </div>
          </Card.Body>

          <Card.Footer style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: `var(--border-1) solid var(--color-border-light)`, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {complaint.reportedBy?.profileImage ? (
                <img src={getMediaUrl(complaint.reportedBy.profileImage)} alt={complaint.reportedBy.name} style={{ height: 'var(--avatar-sm)', width: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', objectFit: 'cover', marginRight: 'var(--spacing-2)' }} />
              ) : (
                <div style={{ height: 'var(--avatar-sm)', width: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)', marginRight: 'var(--spacing-2)' }}>{complaint.reportedBy?.name?.charAt(0) || "U"}</div>
              )}
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)' }} className="line-clamp-1">{complaint.reportedBy?.name}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Reporter</div>
              </div>
            </div>
          </Card.Footer>
        </Card>
      ))}
    </div>
  )
}

export default ComplaintCardView
