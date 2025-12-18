import React from "react"
import { FaTimes, FaUserCircle, FaDoorOpen, FaClock, FaCalendarAlt } from "react-icons/fa"

const EntryDetails = ({ entry, onClose }) => {
  if (!entry) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'var(--modal-backdrop)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 'var(--z-modal)'
    }}>
      <div style={{
        backgroundColor: 'var(--modal-bg)',
        borderRadius: 'var(--modal-radius)',
        boxShadow: 'var(--modal-shadow)',
        width: '100%',
        maxWidth: 'var(--container-md)',
        margin: '0 var(--spacing-4)',
        padding: 'var(--spacing-6)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-4)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--modal-title-color)'
          }}>Entry Details</h2>
          <button onClick={onClose} style={{
            color: 'var(--color-text-muted)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--spacing-2)',
            transition: 'var(--transition-colors)'
          }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-body)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}>
            <FaTimes size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-lg'))} />
          </button>
        </div>

        <div style={{
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-4)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 'var(--spacing-4)'
          }}>
            <div style={{
              backgroundColor: 'var(--button-primary-bg)',
              padding: 'var(--spacing-3)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-white)',
              marginRight: 'var(--spacing-4)'
            }}>
              <FaUserCircle size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-2xl'))} />
            </div>
            <div>
              <h3 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)'
              }}>{entry.name}</h3>
              <p style={{
                color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-sm)'
              }}>{entry.id}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaDoorOpen style={{
                color: 'var(--color-primary)',
                marginRight: 'var(--spacing-3)',
                width: 'var(--icon-lg)'
              }} />
              <div>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)'
                }}>Room Number</p>
                <p style={{
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>{entry.room}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaCalendarAlt style={{
                color: 'var(--color-primary)',
                marginRight: 'var(--spacing-3)',
                width: 'var(--icon-lg)'
              }} />
              <div>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)'
                }}>Date</p>
                <p style={{
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>{entry.date}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaClock style={{
                color: 'var(--color-primary)',
                marginRight: 'var(--spacing-3)',
                width: 'var(--icon-lg)'
              }} />
              <div>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)'
                }}>Time</p>
                <p style={{
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>{entry.time}</p>
              </div>
            </div>

            <div style={{ paddingTop: 'var(--spacing-2)' }}>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-muted)'
              }}>Status</p>
              <span style={{
                marginTop: 'var(--spacing-1)',
                padding: 'var(--spacing-1) var(--spacing-3)',
                display: 'inline-flex',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                borderRadius: 'var(--radius-full)',
                backgroundColor: entry.status === "Checked In" ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                color: entry.status === "Checked In" ? 'var(--color-success-text)' : 'var(--color-danger-text)'
              }}>{entry.status}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            backgroundColor: 'var(--color-bg-muted)',
            color: 'var(--color-text-body)',
            padding: 'var(--spacing-2) var(--spacing-4)',
            borderRadius: 'var(--radius-lg)',
            transition: 'var(--transition-colors)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-medium)'
          }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-dark)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default EntryDetails
