import React, { useState } from "react"
import { FaUserAlt, FaTrash, FaUserPlus, FaToggleOn, FaToggleOff, FaBed, FaBuilding } from "react-icons/fa"
import { hostelApi } from "../../service"
import { HStack, IconCircle, InfoRow, Modal, Surface, Text, VStack } from "@/components/ui"
import { Table, Button } from "hzero"
import { useAuth } from "../../contexts/AuthProvider"
import { getMediaUrl } from "../../utils/mediaUtils"
import { isRoomActive } from "@/constants/roomStatus"
import StudentDetailModal from "../common/students/StudentDetailModal"
const RoomDetailModal = ({ room, onClose, onUpdate, onAllocate }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)

  // Only "Active" rooms are operational; every other status is out of service.
  const isActive = isRoomActive(room.status)

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
    const newStatus = isActive ? "Inactive" : "Active"
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
        <VStack gap={6}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--spacing-6)' }}>
            <Surface bg="tertiary" padding={5} radius="xl">
              <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-base)' }}>
                <FaBed style={{ marginRight: 'var(--spacing-2)', fontSize: 'var(--icon-md)' }} color="var(--color-primary)" /> Room Information
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                <InfoRow label="Room Number:" value={room.roomNumber} />
                <InfoRow label="Type:" value={room.type || "Standard"} />
                <InfoRow label="Capacity:" value={<>{room.capacity} students</>} />
                <InfoRow label="Current Occupancy:" value={isActive ? `${room.currentOccupancy}/${room.capacity}` : room.status} />
                <InfoRow label="Floor:" value={room.floor || "Ground"} />
              </ul>
            </Surface>

            <Surface bg="tertiary" padding={5} radius="xl">
              <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-base)' }}>
                <FaBuilding style={{ marginRight: 'var(--spacing-2)', fontSize: 'var(--icon-md)' }} color="var(--color-primary)" /> Additional Details
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                <InfoRow label="Hostel:" value={room.hostel?.name || "N/A"} />
                <InfoRow label="Unit:" value={room.unit?.name || "N/A"} />
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text as="span" color="muted" size="base">Status:</Text>
                  <Surface as="span" bg={!isActive ? 'var(--color-danger-bg)' : room.currentOccupancy >= room.capacity ? 'var(--color-success-bg)' : room.currentOccupancy > 0 ? 'var(--color-info-bg)' : 'var(--color-bg-muted)'} padding="var(--spacing-0-5) var(--spacing-2-5)" radius="full" color={!isActive ? 'var(--color-danger-text)' : room.currentOccupancy >= room.capacity ? 'var(--color-success-text)' : room.currentOccupancy > 0 ? 'var(--color-info-text)' : 'var(--color-text-secondary)'} size="sm" weight="medium">
                    {!isActive ? room.status : room.currentOccupancy >= room.capacity ? "Full" : room.currentOccupancy > 0 ? "Partially Occupied" : "Empty"}
                  </Surface>
                </li>
              </ul>
            </Surface>
          </div>

          {["Admin"].includes(user.role) && (
            <div style={{ marginTop: 'var(--spacing-4)' }}>
              <Button onClick={handleToggleStatus} disabled={loading} variant={isActive ? "danger" : "success"} size="md">
                {isActive ? <FaToggleOn /> : <FaToggleOff />} {isActive ? "Mark as Inactive" : "Activate Room"}
              </Button>
            </div>
          )}

          <div style={{ marginTop: 'var(--spacing-6)' }}>
            <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-4)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center' }}>
                <FaUserAlt style={{ marginRight: 'var(--spacing-2)', fontSize: 'var(--icon-md)' }} color="var(--color-primary)" /> Allocated Students
              </h3>
              {["Admin"].includes(user.role) && isActive && room.currentOccupancy < room.capacity && (
                <Button onClick={onAllocate} variant="success" size="sm">
                  <FaUserPlus /> Allocate Student
                </Button>
              )}
            </HStack>

            {!isActive ? (
              <Surface bg="tertiary" padding={8} radius="lg" align="center">
                <FaToggleOff style={{ margin: '0 auto', fontSize: 'var(--icon-4xl)', marginBottom: 'var(--spacing-3)' }} color="var(--color-border-primary)" />
                <Text color="muted" size="base">{`This room is currently ${room.status.toLowerCase()} and not available for allocation`}</Text>
              </Surface>
            ) : room.students && room.students.length > 0 ? (
              <div style={{ backgroundColor: 'var(--color-bg-primary)', border: `var(--border-1) solid var(--color-border-primary)`, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Student</Table.Head>
                        <Table.Head className="hidden sm:table-cell">Roll Number</Table.Head>
                        <Table.Head className="hidden lg:table-cell">Bed Number</Table.Head>
                        <Table.Head className="hidden md:table-cell">Department</Table.Head>
                        {["Admin"].includes(user.role) && <Table.Head>Action</Table.Head>}
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {room.students.map((student, index) => (
                        <Table.Row style={{ borderTop: `var(--border-1) solid var(--color-border-primary)` }} key={student.id || index}  onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                        }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                          }}
                        >
                          <Table.Cell style={{ whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => handleStudentClick(student)}
                          >
                            <HStack gap="none" align="center">
                              <IconCircle size="var(--spacing-8)" bg="muted" style={{ overflow: 'hidden' }}>
                                {student.profileImage ? (
                                  <img src={getMediaUrl(student.profileImage)} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
                                ) : (
                                  <FaUserAlt style={{ fontSize: 'var(--icon-sm)' }} color="var(--color-text-muted)" />
                                )}
                              </IconCircle>
                              <div style={{ marginLeft: 'var(--spacing-3)' }}>
                                <Text as="div" size="sm" weight="medium" color="primary">{student.name}</Text>
                                <Text as="div" size="xs" color="muted" className="sm:hidden">{student.rollNumber}</Text>
                                <Text as="div" size="xs" color="muted">{student.email}</Text>
                              </div>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell className="hidden sm:table-cell" style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)' }}>{student.rollNumber}</Table.Cell>
                          <Table.Cell className="hidden lg:table-cell" style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)' }}>{student.bedNumber}</Table.Cell>
                          <Table.Cell className="hidden md:table-cell" style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)' }}>{student.department}</Table.Cell>
                          <Table.Cell style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', textAlign: 'right' }}>
                            {["Admin"].includes(user.role) && (
                              <Button onClick={() => handleRemoveStudent(student.allocationId)} disabled={loading} variant="ghost" size="sm" aria-label="Remove from Room"><FaTrash /></Button>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              </div>
            ) : (
              <Surface bg="tertiary" padding={8} radius="lg" align="center">
                <FaUserAlt style={{ margin: '0 auto', fontSize: 'var(--icon-4xl)', marginBottom: 'var(--spacing-3)' }} color="var(--color-border-primary)" />
                <Text color="muted" size="base">No students allocated to this room</Text>
                {room.capacity > 0 && (
                  <Button onClick={onAllocate} variant="primary" size="md">
                    <FaUserPlus /> Allocate Student
                  </Button>
                )}
              </Surface>
            )}
          </div>
        </VStack>
      </Modal>
      {showStudentDetailModal && selectedStudentId && <StudentDetailModal selectedStudent={{ _id: selectedStudentId, userId: selectedUserId }} setShowStudentDetail={setShowStudentDetailModal} onUpdate={() => setShowStudentDetailModal(false)} />}
    </>
  )
}

export default RoomDetailModal
