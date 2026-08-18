import { useState } from "react"
import { BedDouble, Building2, ToggleLeft, ToggleRight, Trash2, User, UserPlus, Users } from "lucide-react"
import { Avatar, Badge, Button, DetailSection, EmptyState, Grid, HStack, InfoRow, Modal, Table, Text, useConfirm, useToast, VStack } from "hzero"
import { hostelApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"
import { getMediaUrl } from "../../utils/mediaUtils"
import { isRoomActive } from "@/constants/roomStatus"
import StudentDetailModal from "../common/students/StudentDetailModal"

const occupancyBadge = (room, isActive) => {
  if (!isActive) return { variant: "danger", label: room.status }
  if (room.currentOccupancy >= room.capacity) return { variant: "success", label: "Full" }
  if (room.currentOccupancy > 0) return { variant: "primary", label: "Partially occupied" }
  return { variant: "default", label: "Empty" }
}

const RoomDetailModal = ({ room, onClose, onUpdate, onAllocate }) => {
  const { user } = useAuth()
  const confirm = useConfirm()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [viewing, setViewing] = useState(null)

  // Only "Active" rooms are operational; every other status is out of service.
  const isActive = isRoomActive(room.status)
  const isAdmin = user.role === "Admin"
  const canManageAllocations = isAdmin || user.role === "Hostel Supervisor"
  const canEditRoom = canManageAllocations
  const status = occupancyBadge(room, isActive)

  const removeStudent = async (allocationId) => {
    const ok = await confirm({
      title: "Remove this student from the room?",
      message: "Their allocation ends immediately. The bed becomes available.",
      isDestructive: true,
    })
    if (!ok) return

    try {
      setLoading(true)
      await hostelApi.deallocateRoom(allocationId)
      toast.success("Student removed from the room.")
      onUpdate()
    } catch (error) {
      console.error("Failed to remove student:", error)
      toast.error(error.message || "The student could not be removed.")
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async () => {
    const next = isActive ? "Inactive" : "Active"
    const ok = await confirm({
      title: isActive ? "Mark this room inactive?" : "Activate this room?",
      message: isActive
        ? "Every student allocated to this room will be removed."
        : "The room becomes available for allocation.",
      isDestructive: isActive,
    })
    if (!ok) return

    try {
      setLoading(true)
      await hostelApi.updateRoomStatus(room.id, next)
      toast.success(`Room marked ${next.toLowerCase()}.`)
      onUpdate()
    } catch (error) {
      console.error("Failed to update room status:", error)
      toast.error(error.message || "The room status could not be changed.")
    } finally {
      setLoading(false)
    }
  }

  const allocateButton = (variant, size) => (
    <Button onClick={onAllocate} variant={variant} size={size}>
      <UserPlus /> Allocate student
    </Button>
  )

  return (
    <>
      <Modal title={`Room ${room.roomNumber}`} onClose={onClose} width={800}>
        <VStack gap="large">
          <Grid cols={{ base: 1, md: 2 }} gap={4}>
            <DetailSection title="Room" icon={BedDouble}>
              <InfoRow label="Room number" value={room.roomNumber} />
              <InfoRow label="Type" value={room.type || "Standard"} />
              <InfoRow label="Capacity" value={`${room.capacity} students`} />
              <InfoRow label="Occupancy" value={isActive ? `${room.currentOccupancy} of ${room.capacity}` : room.status} />
              <InfoRow label="Floor" value={room.floor || "Ground"} />
            </DetailSection>

            <DetailSection title="Location" icon={Building2}>
              <InfoRow label="Hostel" value={room.hostel?.name || "Not set"} />
              <InfoRow label="Unit" value={room.unit?.name || "Not set"} />
              <InfoRow label="Status" value={<Badge variant={status.variant} size="small">{status.label}</Badge>} />
            </DetailSection>
          </Grid>

          {canEditRoom && (
            <HStack justify="start">
              <Button onClick={toggleStatus} disabled={loading} variant={isActive ? "danger" : "success"} size="md">
                {isActive ? <ToggleRight /> : <ToggleLeft />}
                {isActive ? "Mark as inactive" : "Activate room"}
              </Button>
            </HStack>
          )}

          <DetailSection
            title="Allocated students"
            icon={Users}
            plain
            actions={canManageAllocations && isActive && room.currentOccupancy < room.capacity ? allocateButton("success", "sm") : undefined}
          >
            {!isActive ? (
              <EmptyState
                icon={ToggleLeft}
                title={`This room is ${room.status.toLowerCase()}`}
                message="Rooms that are out of service cannot take allocations."
              />
            ) : room.students?.length > 0 ? (
              <Table bordered>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Student</Table.Head>
                    <Table.Head className="hidden sm:table-cell">Roll number</Table.Head>
                    <Table.Head className="hidden lg:table-cell">Bed</Table.Head>
                    <Table.Head className="hidden md:table-cell">Department</Table.Head>
                    {canManageAllocations && <Table.Head align="right">Action</Table.Head>}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {room.students.map((student, index) => (
                    <Table.Row key={student.id || index}>
                      <Table.Cell>
                        {/* The name is the control, not the row: a whole row that
                            opens a modal swallows the remove button inside it. */}
                        <button
                          type="button"
                          className="flex items-center gap-[var(--spacing-3)] text-left"
                          onClick={() => student.id && setViewing({ id: student.id, userId: student.userId })}
                        >
                          <Avatar src={student.profileImage ? getMediaUrl(student.profileImage) : undefined} name={student.name} size="small" />
                          <span className="min-w-0">
                            <Text as="div" size="sm" weight="medium" color="primary">{student.name}</Text>
                            <Text as="div" size="xs" color="muted" className="sm:hidden">{student.rollNumber}</Text>
                            <Text as="div" size="xs" color="muted">{student.email}</Text>
                          </span>
                        </button>
                      </Table.Cell>
                      <Table.Cell className="hidden sm:table-cell">{student.rollNumber}</Table.Cell>
                      <Table.Cell className="hidden lg:table-cell">{student.bedNumber}</Table.Cell>
                      <Table.Cell className="hidden md:table-cell">{student.department}</Table.Cell>
                      {canManageAllocations && (
                        <Table.Cell align="right">
                          <Button
                            onClick={() => removeStudent(student.allocationId)}
                            disabled={loading}
                            variant="ghost"
                            size="sm"
                            aria-label={`Remove ${student.name} from the room`}
                          >
                            <Trash2 />
                          </Button>
                        </Table.Cell>
                      )}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <EmptyState
                icon={User}
                title="No students allocated"
                message="This room is empty."
                action={canManageAllocations && room.capacity > 0 ? allocateButton("primary", "md") : undefined}
              />
            )}
          </DetailSection>
        </VStack>
      </Modal>

      {viewing && (
        <StudentDetailModal
          selectedStudent={{ _id: viewing.id, userId: viewing.userId }}
          setShowStudentDetail={() => setViewing(null)}
          onUpdate={() => setViewing(null)}
        />
      )}
    </>
  )
}

export default RoomDetailModal
