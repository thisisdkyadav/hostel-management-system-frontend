import React, { useState } from "react"
import { FaUserAlt, FaTrash, FaUserPlus, FaToggleOn, FaToggleOff, FaBed, FaBuilding } from "react-icons/fa"
import { hostelApi } from "../../service"
import { Modal } from "czero/react"
import { Button } from "czero/react"
import { useAuth } from "../../contexts/AuthProvider"
import { getMediaUrl } from "../../utils/mediaUtils"
import StudentDetailModal from "../common/students/StudentDetailModal"
const RoomDetailModal = ({ room, onClose, onUpdate, onAllocate }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)

  const handleRemoveStudent = async (allocationId) => {
    if (!confirm("Are you sure you want to remove this student from the room?")) {
      return
    }

    try {
      setLoading(true)
      await hostelApi.deallocateRoom(allocationId)
      alert("Student removed successfully")
      onUpdate()
    } catch (error) {
      console.error("Failed to remove student:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStudentClick = (student) => {
    const userId = student?.userId
    if (!student?.id) return
    setSelectedStudentId(student.id)
    setSelectedUserId(userId)
    setShowStudentDetailModal(true)
  }

  const handleToggleStatus = async () => {
    const newStatus = room.status === "Inactive" ? "Active" : "Inactive"
    const message = newStatus === "Inactive" ? "Are you sure you want to mark this room as inactive? All Students allocated to this room will be removed." : "Are you sure you want to activate this room?"

    if (!confirm(message)) {
      return
    }

    try {
      setLoading(true)
      await hostelApi.updateRoomStatus(room.id, newStatus)
      alert(`Room status changed to ${newStatus} successfully`)
      onUpdate()
    } catch (error) {
      console.error("Failed to update room status:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Modal title={`Room ${room.roomNumber} Details`} onClose={onClose} width={800}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--spacing-6)' }}>
            <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-base)' }}>
                <FaBed style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-primary)', fontSize: 'var(--icon-md)' }} /> Room Information
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>Room Number:</span>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>{room.roomNumber}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>Type:</span>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>{room.type || "Standard"}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>Capacity:</span>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>{room.capacity} students</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>Current Occupancy:</span>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>{room.status === "Inactive" ? "Inactive" : `${room.currentOccupancy}/${room.capacity}`}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>Floor:</span>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>{room.floor || "Ground"}</span>
                </li>
              </ul>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-base)' }}>
                <FaBuilding style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-primary)', fontSize: 'var(--icon-md)' }} /> Additional Details
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>Hostel:</span>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>{room.hostel?.name || "N/A"}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>Unit:</span>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>{room.unit?.name || "N/A"}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>Status:</span>
                  <span style={{
                    fontWeight: 'var(--font-weight-medium)', padding: 'var(--spacing-0-5) var(--spacing-2-5)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', backgroundColor: room.status === "Inactive" ? 'var(--color-danger-bg)' : room.currentOccupancy >= room.capacity ? 'var(--color-success-bg)' : room.currentOccupancy > 0 ? 'var(--color-info-bg)' : 'var(--color-bg-muted)',
                    color: room.status === "Inactive" ? 'var(--color-danger-text)' : room.currentOccupancy >= room.capacity ? 'var(--color-success-text)' : room.currentOccupancy > 0 ? 'var(--color-info-text)' : 'var(--color-text-secondary)'
                  }}
                  >
                    {room.status === "Inactive" ? "Inactive" : room.currentOccupancy >= room.capacity ? "Full" : room.currentOccupancy > 0 ? "Partially Occupied" : "Empty"}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {["Admin"].includes(user.role) && (
            <div style={{ marginTop: 'var(--spacing-4)' }}>
              <Button onClick={handleToggleStatus} disabled={loading} variant={room.status === "Inactive" ? "success" : "danger"} size="md">
                {room.status === "Inactive" ? <FaToggleOff /> : <FaToggleOn />} {room.status === "Inactive" ? "Activate Room" : "Mark as Inactive"}
              </Button>
            </div>
          )}

          <div style={{ marginTop: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center' }}>
                <FaUserAlt style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-primary)', fontSize: 'var(--icon-md)' }} /> Allocated Students
              </h3>
              {["Admin"].includes(user.role) && room.status !== "Inactive" && room.currentOccupancy < room.capacity && (
                <Button onClick={onAllocate} variant="success" size="sm">
                  <FaUserPlus /> Allocate Student
                </Button>
              )}
            </div>

            {room.status === "Inactive" ? (
              <div style={{ backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-8)', textAlign: 'center' }}>
                <FaToggleOff style={{ margin: '0 auto', color: 'var(--color-border-primary)', fontSize: 'var(--icon-4xl)', marginBottom: 'var(--spacing-3)' }} />
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>This room is currently inactive and not available for allocation</p>
              </div>
            ) : room.students && room.students.length > 0 ? (
              <div style={{ backgroundColor: 'var(--color-bg-primary)', border: `var(--border-1) solid var(--color-border-primary)`, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                      <tr>
                        <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Student</th>
                        <th className="hidden sm:table-cell" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Roll Number</th>
                        <th className="hidden lg:table-cell" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Bed Number</th>
                        <th className="hidden md:table-cell" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Department</th>
                        {["Admin"].includes(user.role) && <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'right', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Action</th>}
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                      {room.students.map((student, index) => (
                        <tr key={student.id || index} style={{ borderTop: `var(--border-1) solid var(--color-border-primary)`, transition: 'var(--transition-colors)' }} onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                        }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                          }}
                        >
                          <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => handleStudentClick(student)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ height: 'var(--spacing-8)', width: 'var(--spacing-8)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {student.profileImage ? (
                                  <img src={getMediaUrl(student.profileImage)} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
                                ) : (
                                  <FaUserAlt style={{ color: 'var(--color-text-muted)', fontSize: 'var(--icon-sm)' }} />
                                )}
                              </div>
                              <div style={{ marginLeft: 'var(--spacing-3)' }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{student.name}</div>
                                <div className="sm:hidden" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{student.rollNumber}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell" style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{student.rollNumber}</td>
                          <td className="hidden lg:table-cell" style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{student.bedNumber}</td>
                          <td className="hidden md:table-cell" style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{student.department}</td>
                          <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', textAlign: 'right' }}>
                            {["Admin"].includes(user.role) && (
                              <Button onClick={() => handleRemoveStudent(student.allocationId)} disabled={loading} variant="ghost" size="sm" aria-label="Remove from Room"><FaTrash /></Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-8)', textAlign: 'center' }}>
                <FaUserAlt style={{ margin: '0 auto', color: 'var(--color-border-primary)', fontSize: 'var(--icon-4xl)', marginBottom: 'var(--spacing-3)' }} />
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>No students allocated to this room</p>
                {room.capacity > 0 && (
                  <Button onClick={onAllocate} variant="primary" size="md">
                    <FaUserPlus /> Allocate Student
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
      {showStudentDetailModal && selectedStudentId && <StudentDetailModal selectedStudent={{ _id: selectedStudentId, userId: selectedUserId }} setShowStudentDetail={setShowStudentDetailModal} onUpdate={() => setShowStudentDetailModal(false)} />}
    </>
  )
}

export default RoomDetailModal
