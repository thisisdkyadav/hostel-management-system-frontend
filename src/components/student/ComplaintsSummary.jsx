import React from "react"
import { FaExclamationCircle, FaEye } from "react-icons/fa"
import { MdPendingActions } from "react-icons/md"
import { Link } from "react-router-dom"
import { getStatusColor, getTimeSince } from "../../utils/adminUtils"

const ComplaintsSummary = ({ complaints = [], loading = false }) => {
  if (loading) {
    return (
      <div className="animate-pulse" style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-3)' }}>
        <div style={{ height: 'var(--spacing-5)', backgroundColor: 'var(--skeleton-base)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-3)', width: '33.333333%' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <div style={{ height: 'var(--spacing-12)', backgroundColor: 'var(--skeleton-base)', borderRadius: 'var(--radius-md)' }}></div>
          <div style={{ height: 'var(--spacing-12)', backgroundColor: 'var(--skeleton-base)', borderRadius: 'var(--radius-md)' }}></div>
        </div>
      </div>
    )
  }

  if (!complaints || complaints.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-4)', border: 'var(--border-1) solid var(--color-border-light)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-3)' }}>
          <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>Your Complaints</h3>
          <Link to="complaints" className="hover:underline" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>
            View All
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center" style={{ paddingTop: 'var(--spacing-4)', paddingBottom: 'var(--spacing-4)', color: 'var(--color-text-muted)' }}>
          <FaExclamationCircle style={{ color: 'var(--color-bg-muted)', fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-1)' }} />
          <p style={{ fontSize: 'var(--font-size-xs)' }}>No active complaints</p>
          <Link to="complaints" className="hover:underline" style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>
            Submit a new complaint
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: 'var(--border-1) solid var(--color-border-light)' }}>
      <div className="flex justify-between items-center" style={{ padding: 'var(--spacing-3) var(--spacing-4)', borderBottom: 'var(--border-1) solid var(--color-border-light)' }}>
        <h3 className="flex items-center" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>
          <MdPendingActions style={{ marginRight: 'var(--spacing-1-5)', color: 'var(--color-primary)' }} />
          Your Active Complaints
        </h3>
        <Link to="complaints" className="hover:underline" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>
          View All
        </Link>
      </div>
      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        {complaints.map((complaint) => (
          <div key={complaint.id} className="last:border-0" style={{ padding: 'var(--spacing-2) var(--spacing-4)', borderBottom: 'var(--border-1) solid var(--color-border-light)', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-info-bg-light)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="line-clamp-1" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>{complaint.title}</h4>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-0-5)' }}>
                  {complaint.hostel} · Room {complaint.roomNumber} · {complaint.category}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={getStatusColor(complaint.status)} style={{ padding: 'var(--spacing-0-5) var(--spacing-1-5)', fontSize: 'var(--font-size-2xs)', borderRadius: 'var(--radius-full)' }}>{complaint.status}</span>
                <span style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-0-5)' }}>{getTimeSince(complaint.createdDate)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center" style={{ marginTop: 'var(--spacing-1)' }}>
              <p className="line-clamp-1" style={{ fontSize: 'var(--badge-font-xs)', color: 'var(--color-text-tertiary)', maxWidth: '70%' }}>{complaint.description}</p>
              <Link to={`complaints`} className="transition-colors" style={{ padding: 'var(--spacing-1)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-info-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <FaEye style={{ height: 'var(--icon-xs)', width: 'var(--icon-xs)' }} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ComplaintsSummary
