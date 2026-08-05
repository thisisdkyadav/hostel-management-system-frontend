import React, { useState } from "react"
import { FaEdit } from "react-icons/fa"
import { Button, StatusBadge, Table } from "czero/react"
import EditStudentEntryModal from "./EditStudentEntryModal"
import { securityApi } from "../../service"

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
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Student Name</Table.Head>
                <Table.Head>Unit</Table.Head>
                <Table.Head>Room</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head>Time</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {entries.map((entry) => {
                const { date, time } = formatDateTime(entry.dateAndTime)
                return (
                  <Table.Row key={entry._id}  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{entry.userId.name}</div>
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{entry.unit || "-"}</div>
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {entry.room}
                        {entry.bed}
                      </div>
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{date}</div>
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{time}</div>
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <StatusBadge status={entry.status} />
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      <Button onClick={() => handleEditClick(entry)} variant="ghost" size="sm" aria-label="Edit entry">
                        <FaEdit />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </div>
      </div>
      {showEditModal && selectedEntry && <EditStudentEntryModal entry={selectedEntry} onClose={handleCloseModal} onSave={handleSaveEntry} onDelete={handleDeleteEntry} />}
    </>
  )
}

export default StudentEntryTable
