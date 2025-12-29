import { useState, useEffect } from "react"
import { FaSearch, FaUserPlus, FaExclamationTriangle, FaBed, FaHome, FaUserGraduate } from "react-icons/fa"
import { hostelApi } from "../../services/hostelApi"
import { useStudents } from "../../hooks/useStudents"
import Modal from "../common/Modal"
import Button from "../common/Button"
import Input from "../common/ui/Input"

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)', fontSize: 'var(--font-size-base)' }}>
            <FaHome style={{ marginRight: 'var(--spacing-2)' }} /> Room Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-4)' }} className="sm:grid-cols-4">
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>Room Number</p>
              <p style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>{room.roomNumber}</p>
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>Floor</p>
              <p style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>{room.floorNumber || room.floor || "Ground"}</p>
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>Capacity</p>
              <p style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>{room.capacity}</p>
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>Currently Occupied</p>
              <p style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>
                {room.occupiedCount || room.currentOccupancy} / {room.capacity}
              </p>
            </div>
          </div>

          {(room.occupiedCount >= room.capacity || room.currentOccupancy >= room.capacity) && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--spacing-4)', padding: 'var(--spacing-3)', backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)', borderRadius: 'var(--radius-md)' }}>
              <FaExclamationTriangle style={{ marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <p style={{ fontSize: 'var(--font-size-sm)' }}>This room is already at full capacity.</p>
            </div>
          )}
        </div>

        <div>
          <Input type="text" placeholder="Search student by name, ID or email..." value={filters.searchTerm} onChange={handleSearchChange} icon={<FaSearch />} />
        </div>

        {/* Bed Selection Section */}
        <div>
          <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-base)' }}>
            <FaBed style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-primary)' }} /> Select Bed Number
          </h3>
          {availableBeds.length === 0 ? (
            <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-warning-bg-light)', color: 'var(--color-warning-text)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center' }}>
              <FaExclamationTriangle style={{ marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <p style={{ fontSize: 'var(--font-size-base)' }}>No beds available in this room</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
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
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start' }}>
            <FaExclamationTriangle style={{ marginTop: 'var(--spacing-0-5)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
            <p style={{ fontSize: 'var(--font-size-base)' }}>{error}</p>
          </div>
        )}

        <div>
          <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-base)' }}>
            <FaUserGraduate style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-primary)' }} /> Unallocated Students
          </h3>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-8) 0' }}>
              <div style={{ position: 'relative', width: 'var(--spacing-12)', height: 'var(--spacing-12)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: `var(--border-4) solid var(--color-border-primary)`, borderRadius: 'var(--radius-full)' }}></div>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: `var(--border-4) solid var(--color-primary)`, borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite', borderTopColor: 'transparent' }}></div>
              </div>
            </div>
          ) : (
            <>
              {unallocatedStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-8) 0', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>No unallocated students found</div>
              ) : (
                <div style={{ maxHeight: '256px', overflowY: 'auto', border: `var(--border-1) solid var(--color-border-primary)`, borderRadius: 'var(--radius-lg)' }}>
                  <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--color-bg-tertiary)', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Student</th>
                        <th className="hidden sm:table-cell" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>ID</th>
                        <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'right', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                      {unallocatedStudents.map((student) => (
                        <tr key={student.id} style={{ transition: 'var(--transition-colors)', backgroundColor: selectedStudent?.id === student.id ? 'var(--color-primary-bg)' : 'var(--color-bg-primary)', borderTop: `var(--border-1) solid var(--color-border-primary)` }} onMouseEnter={(e) => {
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
                          <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ height: 'var(--spacing-9)', width: 'var(--spacing-9)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>{student.fullName?.charAt(0) || "S"}</div>
                              <div style={{ marginLeft: 'var(--spacing-3)' }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{student.fullName}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell" style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{student.studentId || student.rollNumber}</td>
                          <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row" style={{ justifyContent: 'flex-end', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-3)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
          <Button onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button onClick={handleAllocateStudent} disabled={!selectedStudent || !selectedBed || allocating || room.occupiedCount >= room.capacity} variant="primary" size="medium" isLoading={allocating} icon={allocating ? null : <FaUserPlus />}>
            {allocating ? "Allocating..." : "Allocate Student"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AllocateStudentModal
