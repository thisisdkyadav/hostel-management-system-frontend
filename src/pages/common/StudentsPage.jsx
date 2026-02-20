import { useMemo, useState } from "react"
import { GraduationCap } from "lucide-react"
import NoResults from "../../components/common/NoResults"
import PageFooter from "../../components/common/PageFooter"
import StudentStats from "../../components/common/students/StudentStats"
import StudentFilterSection from "../../components/common/students/StudentFilterSection"
import StudentDetailModal from "../../components/common/students/StudentDetailModal"
import ImportStudentModal from "../../components/common/students/ImportStudentModal"
import UpdateStudentsModal from "../../components/common/students/UpdateStudentsModal"
import StudentTableView from "../../components/common/students/StudentTableView"
import { Pagination } from "@/components/ui"
import { Button } from "czero/react"
import StudentsHeader from "../../components/headers/StudentsHeader"
import { useStudents } from "../../hooks/useStudents"
import { useGlobal } from "../../contexts/GlobalProvider"
import { useAuth } from "../../contexts/AuthProvider"
import useAuthz from "../../hooks/useAuthz"
import { studentApi } from "../../service"
import { hostelApi } from "../../service"
import UpdateAllocationModal from "../../components/common/students/UpdateAllocationModal"

// Shimmer loader components
const ShimmerLoader = ({ height, width = "100%", className = "" }) => (
  <div
    className={className}
    style={{
      height,
      width,
      background: `linear - gradient(90deg, var(--skeleton - base) 25 %, var(--skeleton - highlight) 50 %, var(--skeleton - base) 75 %)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer var(--skeleton-animation-duration) infinite',
      borderRadius: 'var(--radius-lg)'
    }}
  ></div>
)

const TableRowShimmer = () => (
  <div style={{ display: 'flex', padding: 'var(--spacing-3) var(--spacing-4)', borderBottom: 'var(--border-1) solid var(--color-border-light)' }}>
    {[...Array(5)].map((_, i) => (
      <div key={i} style={{ flex: 1, padding: '0 var(--spacing-2)' }}>
        <ShimmerLoader height="1rem" width={i === 0 ? "80%" : "60%"} />
      </div>
    ))}
  </div>
)

const TableShimmer = ({ rows = 10 }) => (
  <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
    <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-3) var(--spacing-4)', display: 'flex', borderBottom: 'var(--border-1) solid var(--color-border-primary)' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ flex: 1, padding: '0 var(--spacing-2)' }}>
          <ShimmerLoader height="1rem" width="100px" />
        </div>
      ))}
    </div>
    {[...Array(rows)].map((_, i) => (
      <TableRowShimmer key={i} />
    ))}
  </div>
)

const StudentsPage = () => {
  const { user } = useAuth()
  const { getConstraint } = useAuthz()
  const { hostelList = [] } = useGlobal()
  const constrainedHostelIds = getConstraint("constraint.students.scope.hostelIds", [])
  const onlyOwnHostelScope = Boolean(
    getConstraint("constraint.students.scope.onlyOwnHostel", false)
  )
  const hostels = useMemo(() => {
    if (!["Admin"].includes(user.role)) {
      return []
    }

    if (onlyOwnHostelScope) {
      const ownHostelId = user?.hostel?._id
      if (!ownHostelId) return []
      return hostelList.filter((hostel) => hostel._id === ownHostelId)
    }

    if (!Array.isArray(constrainedHostelIds) || constrainedHostelIds.length === 0) {
      return hostelList
    }

    const allowedHostelIds = new Set(
      constrainedHostelIds
        .map((hostelId) => (typeof hostelId === "string" ? hostelId.trim() : ""))
        .filter(Boolean)
    )
    return hostelList.filter((hostel) => allowedHostelIds.has(hostel._id))
  }, [constrainedHostelIds, hostelList, onlyOwnHostelScope, user?.hostel?._id, user.role])

  const canViewStudentsList = true || true
  const canViewStudentsDetail = true || true
  const canImportStudents = ["Admin"].includes(user?.role) && true
  const canBulkUpdateStudents = ["Admin"].includes(user?.role) && true
  const canUpdateStudentAllocations = ["Admin"].includes(user?.role) && true
  const canExportStudents = true || true

  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showAllocateModal, setShowAllocateModal] = useState(false)

  const { students, totalCount, loading, error, filters, updateFilter, pagination, totalPages, setCurrentPage, setPageSize, sorting, handleSort, resetFilters, refreshStudents, importStudents, missingOptions } = useStudents({
    perPage: 10,
    autoFetch: canViewStudentsList,
  })

  const handleImportStudents = async (importedStudents) => {
    if (!canImportStudents) {
      alert("You do not have permission to import students.")
      return false
    }

    try {
      const result = await importStudents(importedStudents)
      if (result.error) {
        alert(`Error importing students: ${result.error.message} `)
        return false
      }
      alert("Students imported successfully")
      return true
    } catch (error) {
      alert(`An error occurred: ${error.message} `)
      return false
    }
  }

  const handleUpdateStudents = async (updatedStudents) => {
    if (!canBulkUpdateStudents) {
      alert("You do not have permission to bulk update students.")
      return false
    }

    try {
      await studentApi.updateStudents(updatedStudents)
      alert("Students updated successfully")
      refreshStudents()
      return true
    } catch (error) {
      alert(`An error occurred: ${error.message} `)
      return false
    }
  }

  const handleUpdateAllocations = async (allocations, hostelId) => {
    if (!canUpdateStudentAllocations) {
      alert("You do not have permission to update allocations.")
      return false
    }

    try {
      const response = await hostelApi.updateRoomAllocations(allocations, hostelId)
      if (response.success) {
        refreshStudents()
        const errors = response.errors || []
        if (errors.length > 0) {
          alert(`Some allocations failed: ${errors.map((error) => `${error.rollNumber}: ${error.message}`).join(", ")} `)
        } else {
          alert("Allocations updated successfully")
        }
        setShowAllocateModal(false)
        return true
      } else {
        alert("Failed to update allocations")
        return false
      }
    } catch (error) {
      alert("An error occurred while updating allocations")
      return false
    }
  }

  const viewStudentDetails = (student) => {
    if (!canViewStudentsDetail) {
      alert("You do not have permission to view student details.")
      return
    }

    setSelectedStudent(student)
    setShowStudentDetail(true)
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const fetchFullStudentDetails = async (userIds) => {
    try {
      const response = await studentApi.getStudentsByIds(userIds)
      return response.data
    } catch (error) {
      console.error("Error fetching student details:", error)
      throw error
    }
  }

  const handleExportStudents = async () => {
    if (!canExportStudents) {
      alert("You do not have permission to export students.")
      return
    }

    const userIds = students.map((student) => student.userId)
    if (userIds.length === 0) {
      alert("No students to export")
      return
    }
    const studentsDetails = await fetchFullStudentDetails(userIds)

    if (studentsDetails.length === 0) {
      alert("No students to export")
      return
    }

    try {
      const firstStudent = studentsDetails[0]
      const headers = Object.keys(firstStudent).filter((key) => !["id", "userId", "allocationId"].includes(key))

      let csvContent = headers.join(",") + "\n"

      studentsDetails.forEach((student) => {
        const row = headers
          .map((header) => {
            const value = student[header] !== null && student[header] !== undefined ? student[header] : ""

            if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(",")

        csvContent += row + "\n"
      })

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      const date = new Date().toISOString().split("T")[0]

      link.href = url
      link.setAttribute("download", `students_export_${date}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting students:", error)
      alert("Failed to export students: " + error.message)
    }
  }

  if (!canViewStudentsList) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ backgroundColor: 'var(--color-danger-bg)', borderLeft: 'var(--border-4) solid var(--color-danger)', color: 'var(--color-danger-text)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Access Denied</p>
          <p>You do not have permission to view students.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', borderLeft: 'var(--border-4) solid var(--color-danger)', color: 'var(--color-danger-text)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Error:</p>
          <p>{error}</p>
        </div>
      )}

      <StudentsHeader
        onImport={() => setShowImportModal(true)}
        onBulkUpdate={() => setShowUpdateModal(true)}
        onUpdateAllocations={() => setShowAllocateModal(true)}
        onExport={handleExportStudents}
        userRole={user?.role}
        canImport={canImportStudents}
        canBulkUpdate={canBulkUpdateStudents}
        canUpdateAllocations={canUpdateStudentAllocations}
        canExport={canExportStudents}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-6) var(--spacing-8)' }}>

        <StudentStats />

        <StudentFilterSection filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} hostels={hostels} setPageSize={setPageSize} missingOptions={missingOptions} />



        {loading ? (
          <TableShimmer rows={pagination.pageSize || 10} />
        ) : (
          <>
            <div style={{ marginTop: 'var(--spacing-4)' }}>
              <StudentTableView currentStudents={students} sortField={sorting.sortField} sortDirection={sorting.sortDirection} handleSort={handleSort} viewStudentDetails={viewStudentDetails} />
            </div>

          </>
        )}

        {showStudentDetail && selectedStudent && canViewStudentsDetail && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={refreshStudents} />}

        {["Admin"].includes(user?.role) && canImportStudents && <ImportStudentModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImport={handleImportStudents} />}
        {["Admin"].includes(user?.role) && canBulkUpdateStudents && <UpdateStudentsModal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} onUpdate={handleUpdateStudents} />}
        {["Admin"].includes(user?.role) && canUpdateStudentAllocations && showAllocateModal && <UpdateAllocationModal isOpen={showAllocateModal} onClose={() => setShowAllocateModal(false)} onAllocate={handleUpdateAllocations} />}
      </div>

      <PageFooter
        leftContent={[
          <span key="count" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Showing <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{loading ? 0 : students.length}</span> of <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{loading ? 0 : totalCount}</span> students
          </span>
        ]}
        rightContent={[
          <Pagination key="pagination" currentPage={pagination.currentPage || 1} totalPages={totalPages || 0} paginate={paginate} compact showPageInfo={false} />
        ]}
      />
    </div>
  )
}

export default StudentsPage
