import React from "react"
import Modal from "../common/Modal"
import Button from "../common/Button"
import { FaRegClock, FaUserAlt, FaBuilding, FaGraduationCap, FaVenusMars } from "react-icons/fa"
import { format } from "date-fns"

const ViewNotificationModal = ({ isOpen, onClose, notification }) => {
  if (!notification) return null

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const isExpired = new Date(notification.expiryDate) < new Date()

  return (
    <Modal title="Notification Details" onClose={onClose} width={700} isOpen={isOpen}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        <header style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 'var(--spacing-4)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>{notification.title}</h2>
          <div>{isExpired ? <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--badge-padding-sm)', borderRadius: 'var(--radius-full)', fontSize: 'var(--badge-font-xs)', fontWeight: 'var(--font-weight-medium)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)' }}>Expired</span> : <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--badge-padding-sm)', borderRadius: 'var(--radius-full)', fontSize: 'var(--badge-font-xs)', fontWeight: 'var(--font-weight-medium)', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}>Active</span>}</div>
        </header>

        <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)' }}>
          <p style={{ color: 'var(--color-text-body)', whiteSpace: 'pre-line' }}>{notification.message}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ marginRight: 'var(--spacing-3)', marginTop: 'var(--spacing-0-5)', color: 'var(--color-success)' }}>
              <FaRegClock />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Created</h4>
              <p style={{ color: 'var(--color-text-muted)' }}>{formatDate(notification.createdAt)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ marginRight: 'var(--spacing-3)', marginTop: 'var(--spacing-0-5)', color: 'var(--color-warning)' }}>
              <FaRegClock />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Expires</h4>
              <p style={{ color: 'var(--color-text-muted)' }}>{formatDate(notification.expiryDate)}</p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: `var(--border-1) solid var(--color-border-light)`, paddingTop: 'var(--spacing-4)' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-3)' }}>Target Audience</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {notification.hostelId && notification.hostelId.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)' }}>
                <FaBuilding style={{ color: 'var(--color-info)', marginRight: 'var(--spacing-3)', marginTop: 'var(--spacing-1)', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>Hostels:</span>
                  <span style={{ fontSize: 'var(--font-size-sm)', marginLeft: 'var(--spacing-1)' }}>{notification.hostelId.map((h) => h.name).join(", ")}</span>
                </div>
              </div>
            ) : null}

            {notification.department && notification.department.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)' }}>
                <FaGraduationCap style={{ color: 'var(--color-purple-text)', marginRight: 'var(--spacing-3)', marginTop: 'var(--spacing-1)', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>Departments:</span>
                  <span style={{ fontSize: 'var(--font-size-sm)', marginLeft: 'var(--spacing-1)' }}>{notification.department.join(", ")}</span>
                </div>
              </div>
            ) : null}

            {notification.degree && notification.degree.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)' }}>
                <FaUserAlt style={{ color: 'var(--color-purple-text)', marginRight: 'var(--spacing-3)', marginTop: 'var(--spacing-1)', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>Degrees:</span>
                  <span style={{ fontSize: 'var(--font-size-sm)', marginLeft: 'var(--spacing-1)' }}>{notification.degree.join(", ")}</span>
                </div>
              </div>
            ) : null}

            {notification.gender ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)' }}>
                <FaVenusMars style={{ color: 'var(--color-girls-text)', marginRight: 'var(--spacing-3)', marginTop: 'var(--spacing-1)', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>Gender:</span>
                  <span style={{ fontSize: 'var(--font-size-sm)', marginLeft: 'var(--spacing-1)' }}>{notification.gender}</span>
                </div>
              </div>
            ) : null}

            {!notification.hostelId?.length && !notification.department?.length && !notification.degree?.length && !notification.gender && (
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)' }}>
                <FaUserAlt style={{ color: 'var(--color-text-muted)', marginRight: 'var(--spacing-2)' }} />
                <span style={{ fontSize: 'var(--font-size-sm)' }}>All Students</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
          <Button onClick={onClose} variant="secondary" size="medium">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ViewNotificationModal
