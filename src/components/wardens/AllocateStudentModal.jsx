import { useState, useEffect } from "react"
import { FaSearch, FaUserPlus, FaExclamationTriangle, FaBed, FaHome, FaUserGraduate } from "react-icons/fa"
import { hostelApi } from "../../service"
import { useStudents } from "../../hooks/useStudents"
import { Table, Button, Input } from "hzero"
import { Grid, HStack, IconCircle, Modal, Spinner, Surface, Text, VStack } from "@/components/ui"
const AllocateStudentModal = ({ room, isOpen, onClose, onSuccess }) => {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [allocating, setAllocating] = useState(false)
  const [error, setError] = useState(null)
  const [availableBeds, setAvailableBeds] = useState([])
  const [selectedBed, setSelectedBed] = useState(null)

  const {
    students: unallocatedStudents,
    loading,
    filters,
    updateFilter,
    fetchWithParams,
  } = useStudents({
    autoFetch: true,
    initialFilters: {
      hasAllocation: "false",
    },
  })

  useEffect(() => {
    if (isOpen) {
      calculateAvailableBeds()
    }
  }, [isOpen, fetchWithParams])

  const calculateAvailableBeds = () => {
    if (!room || !room.capacity) return
    const allBeds = Array.from({ length: room.capacity }, (_, i) => i + 1)
    const occupiedBeds = room.students?.map((student) => student.bedNumber) || []
    const available = allBeds.filter((bed) => !occupiedBeds.includes(bed))
    setAvailableBeds(available)
    if (available.length > 0) {
      setSelectedBed(available[0])
    } else {
      setSelectedBed(null)
    }
  }

  const handleSearchChange = (e) => {
    updateFilter("searchTerm", e.target.value)
  }

  const handleStudentSelect = (student) => {
    setSelectedStudent(student)
  }

  const handleBedSelect = (bedNumber) => {
    setSelectedBed(bedNumber)
  }

  const handleAllocateStudent = async () => {
    if (!selectedStudent) {
      setError("Please select a student to allocate")
      return
    }
    if (!selectedBed) {
      setError("Please select a bed number")
      return
    }
    try {
      setAllocating(true)
      setError(null)

      const response = await hostelApi.allocateRoom({
        roomId: room.id,
        hostelId: room.hostel,
        unitId: room.unit,
        studentId: selectedStudent.id,
        userId: selectedStudent.userId,
        bedNumber: selectedBed,
      })

      if (response.success) {
        onSuccess()
      } else {
        setError(response.message || "Failed to allocate room")
      }
    } catch (err) {
      setError("An error occurred while allocating the room. Please try again.")
      console.error("Error allocating room:", err)
    } finally {
      setAllocating(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal title={`Allocate Student to Room ${room.roomNumber}`} onClose={onClose} width={650}>
      <VStack gap={6}>
        <Surface bg="brand" padding={5} radius="xl">
          <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)', fontSize: 'var(--font-size-base)' }}>
            <FaHome style={{ marginRight: 'var(--spacing-2)' }} /> Room Details
          </h3>
          <Grid cols={{ base: 2, sm: 4 }} gap={4}>
            <div>
              <Text size="xs" color="muted" style={{ marginBottom: 'var(--spacing-1)' }}>Room Number</Text>
              <Text weight="medium" size="base">{room.roomNumber}</Text>
            </div>
            <div>
              <Text size="xs" color="muted" style={{ marginBottom: 'var(--spacing-1)' }}>Floor</Text>
              <Text weight="medium" size="base">{room.floorNumber || room.floor || "Ground"}</Text>
            </div>
            <div>
              <Text size="xs" color="muted" style={{ marginBottom: 'var(--spacing-1)' }}>Capacity</Text>
              <Text weight="medium" size="base">{room.capacity}</Text>
            </div>
            <div>
              <Text size="xs" color="muted" style={{ marginBottom: 'var(--spacing-1)' }}>Currently Occupied</Text>
              <Text weight="medium" size="base">
                {room.occupiedCount || room.currentOccupancy} / {room.capacity}
              </Text>
            </div>
          </Grid>

          {(room.occupiedCount >= room.capacity || room.currentOccupancy >= room.capacity) && (
            <HStack align="center" gap="none" color="warning-text" style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-3)', backgroundColor: 'var(--color-warning-bg)', borderRadius: 'var(--radius-md)' }}>
              <FaExclamationTriangle style={{ marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <Text size="sm">This room is already at full capacity.</Text>
            </HStack>
          )}
        </Surface>

        <div>
          <Input type="text" placeholder="Search student by name, ID or email..." value={filters.searchTerm} onChange={handleSearchChange} icon={<FaSearch />} />
        </div>

        {/* Bed Selection Section */}
        <div>
          <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-base)' }}>
            <FaBed style={{ marginRight: 'var(--spacing-2)' }} color="var(--color-primary)" /> Select Bed Number
          </h3>
          {availableBeds.length === 0 ? (
            <HStack align="center" gap="none" color="warning-text" style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-warning-bg-light)', borderRadius: 'var(--radius-lg)' }}>
              <FaExclamationTriangle style={{ marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <Text size="base">No beds available in this room</Text>
            </HStack>
          ) : (
            <HStack gap={2} wrap>
              {availableBeds.map((bedNumber) => (
                <button key={bedNumber} onClick={() => handleBedSelect(bedNumber)}
                  style={{
                    padding: `var(--spacing-2) var(--spacing-4)`,
                    borderRadius: 'var(--radius-lg)',
                    border: `var(--border-1) solid ${selectedBed === bedNumber ? 'var(--color-primary)' : 'var(--color-border-input)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'var(--spacing-14)',
                    transition: 'var(--transition-colors)',
                    backgroundColor: selectedBed === bedNumber ? 'var(--color-primary)' : 'var(--color-bg-primary)',
                    color: selectedBed === bedNumber ? 'var(--color-white)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBed !== bedNumber) {
                      e.target.style.backgroundColor = 'var(--color-bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBed !== bedNumber) {
                      e.target.style.backgroundColor = 'var(--color-bg-primary)';
                    }
                  }}
                >
                  {bedNumber}
                </button>
              ))}
            </HStack>
          )}
        </div>

        {error && (
          <HStack align="start" gap="none" color="danger-text" style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', borderRadius: 'var(--radius-lg)' }}>
            <FaExclamationTriangle style={{ marginTop: 'var(--spacing-0-5)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
            <Text size="base">{error}</Text>
          </HStack>
        )}

        <div>
          <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-base)' }}>
            <FaUserGraduate style={{ marginRight: 'var(--spacing-2)' }} color="var(--color-primary)" /> Unallocated Students
          </h3>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-8) 0' }}>
              <div style={{ position: 'relative', width: 'var(--spacing-12)', height: 'var(--spacing-12)' }}>
                <IconCircle size="100%" style={{ position: 'absolute', top: 0, left: 0, border: `var(--border-4) solid var(--color-border-primary)` }}></IconCircle>
                <Spinner size="100%" thickness="thick" style={{ position: 'absolute', top: 0, left: 0 }} />
              </div>
            </div>
          ) : (
            <>
              {unallocatedStudents.length === 0 ? (
                <Surface padding="var(--spacing-8) 0" color="muted" size="base" align="center">No unallocated students found</Surface>
              ) : (
                <div style={{ maxHeight: '256px', overflowY: 'auto', border: `var(--border-1) solid var(--color-border-primary)`, borderRadius: 'var(--radius-lg)' }}>
                  <Table>
                    <Table.Header style={{ position: 'sticky', top: 0 }}>
                      <Table.Row>
                        <Table.Head>Student</Table.Head>
                        <Table.Head className="hidden sm:table-cell">ID</Table.Head>
                        <Table.Head>Action</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {unallocatedStudents.map((student) => (
                        <Table.Row style={{ backgroundColor: selectedStudent?.id === student.id ? 'var(--color-primary-bg)' : 'var(--color-bg-primary)', borderTop: `var(--border-1) solid var(--color-border-primary)` }} key={student.id}  onMouseEnter={(e) => {
                          if (selectedStudent?.id !== student.id) {
                            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                          }
                        }}
                          onMouseLeave={(e) => {
                            if (selectedStudent?.id !== student.id) {
                              e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                            }
                          }}
                        >
                          <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                            <HStack gap="none" align="center">
                              <IconCircle size="var(--spacing-9)" bg="muted" color="var(--color-text-tertiary)" style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>{student.fullName?.charAt(0) || "S"}</IconCircle>
                              <div style={{ marginLeft: 'var(--spacing-3)' }}>
                                <Text as="div" size="sm" weight="medium" color="primary">{student.fullName}</Text>
                                <Text as="div" size="sm" color="muted">{student.email}</Text>
                              </div>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell className="hidden sm:table-cell" style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)' }}>{student.studentId || student.rollNumber}</Table.Cell>
                          <Table.Cell style={{ whiteSpace: 'nowrap', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                            <button onClick={() => handleStudentSelect(student)}
                              style={{
                                padding: 'var(--spacing-1) var(--spacing-3)',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: selectedStudent?.id === student.id ? 'var(--color-primary)' : 'var(--color-primary-bg)',
                                color: selectedStudent?.id === student.id ? 'var(--color-white)' : 'var(--color-primary)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'var(--transition-colors)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-medium)'
                              }}
                              onMouseEnter={(e) => {
                                if (selectedStudent?.id !== student.id) {
                                  e.target.style.backgroundColor = 'var(--color-primary-bg-hover)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedStudent?.id !== student.id) {
                                  e.target.style.backgroundColor = 'var(--color-primary-bg)';
                                }
                              }}
                            >
                              Select
                            </button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row" style={{ justifyContent: 'flex-end', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-3)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
          <Button onClick={onClose} variant="secondary" size="md">
            Cancel
          </Button>
          <Button onClick={handleAllocateStudent} disabled={!selectedStudent || !selectedBed || allocating || room.occupiedCount >= room.capacity} variant="primary" size="md" loading={allocating}>
            {!allocating && <FaUserPlus />} {allocating ? "Allocating..." : "Allocate Student"}
          </Button>
        </div>
      </VStack>
    </Modal>
  )
}

export default AllocateStudentModal
