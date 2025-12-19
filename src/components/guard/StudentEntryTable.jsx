import React, { useState } from "react"
import { FaEdit } from "react-icons/fa"
import StatusBadge from "../common/StatusBadge"
import EditStudentEntryModal from "./EditStudentEntryModal"
import { securityApi } from "../../services/apiService"

const StudentEntryTable = ({ entries, refresh }) => {
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleEditClick = (entry) => {
    setSelectedEntry(entry)
    setShowEditModal(true)
  }

  const handleCloseModal = () => {
    setShowEditModal(false)
    setSelectedEntry(null)
  }

  const handleSaveEntry = async (updatedEntry) => {
    try {
      const entryToUpdate = {
        ...updatedEntry,
        dateAndTime: new Date(updatedEntry.dateAndTime).toISOString(),
      }

      const response = await securityApi.updateStudentEntry(entryToUpdate)
      if (response.success) {
        refresh()
        handleCloseModal()
      } else {
        throw new Error("Failed to update student entry")
      }
    } catch (error) {
      console.error("Error updating entry:", error)
      alert("Failed to update student entry.")
    }
  }

  const handleDeleteEntry = async (entryId) => {
    try {
      await securityApi.deleteStudentEntry(entryId)
      refresh()
    } catch (error) {
      console.error("Error deleting entry:", error)
      alert("Failed to delete student entry.")
    }
  }

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString)
    return {
      date: dateTime.toLocaleDateString(),
      time: dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  if (entries.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: 'var(--spacing-6)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>No student entries found</p>
      </div>
    )
  }

  return (
    <>
      <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
              <tr>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Student Name</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Unit</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Room</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Date</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Time</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Status</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: `var(--border-1) solid var(--table-border)` }}>
              {entries.map((entry) => {
                const { date, time } = formatDateTime(entry.dateAndTime)
                return (
                  <tr key={entry._id} style={{ borderBottom: `var(--border-1) solid var(--table-border)`, transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{entry.userId.name}</div>
                    </td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{entry.unit || "-"}</div>
                    </td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {entry.room}
                        {entry.bed}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{date}</div>
                    </td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{time}</div>
                    </td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={entry.status} />
                    </td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      <button onClick={() => handleEditClick(entry)}
                        style={{
                          color: 'var(--color-primary)',
                          backgroundColor: 'var(--color-primary-bg)',
                          padding: 'var(--spacing-2)',
                          borderRadius: 'var(--radius-lg)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'var(--transition-colors)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showEditModal && selectedEntry && <EditStudentEntryModal entry={selectedEntry} onClose={handleCloseModal} onSave={handleSaveEntry} onDelete={handleDeleteEntry} />}
    </>
  )
}

export default StudentEntryTable
