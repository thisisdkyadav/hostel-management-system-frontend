import { useState } from "react"
import { FaUserGraduate, FaTable, FaThLarge } from "react-icons/fa"
import NoResults from "../components/common/NoResults"
import StudentStats from "../components/common/students/StudentStats"
import StudentFilterSection from "../components/common/students/StudentFilterSection"
import StudentCard from "../components/common/students/StudentCard"
import StudentDetailModal from "../components/common/students/StudentDetailModal"
import ImportStudentModal from "../components/common/students/ImportStudentModal"
import UpdateStudentsModal from "../components/common/students/UpdateStudentsModal"
import StudentTableView from "../components/common/students/StudentTableView"
import { Pagination, Button, ToggleButtonGroup } from "@/components/ui"
import StudentsHeader from "../components/headers/StudentsHeader"
import { useStudents } from "../hooks/useStudents"
import { useGlobal } from "../contexts/GlobalProvider"
import { useAuth } from "../contexts/AuthProvider"
import { studentApi } from "../service"
import { hostelApi } from "../service"
import UpdateAllocationModal from "../components/common/students/UpdateAllocationModal"

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

const CardShimmer = () => (
  <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-4)', border: 'var(--border-1) solid var(--color-border-light)' }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
      <div style={{ width: 'var(--avatar-lg)', height: 'var(--avatar-lg)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--skeleton-base)', marginRight: 'var(--spacing-3)' }}></div>
      <div style={{ flex: 1 }}>
        <ShimmerLoader height="1.2rem" width="70%" className="mb-2" />
        <ShimmerLoader height="0.9rem" width="50%" />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ShimmerLoader height="0.8rem" width="40%" />
          <ShimmerLoader height="0.8rem" width="30%" />
        </div>
      ))}
    </div>
    <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-3)', borderTop: 'var(--border-1) solid var(--color-border-light)', display: 'flex', justifyContent: 'flex-end' }}>
      <ShimmerLoader height="2rem" width="30%" />
    </div>
  </div>
)

const CardsGridShimmer = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--gap-md)' }} className="sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <CardShimmer key={i} />
    ))}
  </div>
)

const Students = () => {
  const { user } = useAuth()
  const { hostelList = [], unitList = [] } = useGlobal()
  const hostels = ["Admin"].includes(user.role) ? hostelList : []
  const units = unitList?.map((unit) => ({ id: unit.id, name: unit.name })) || []

  const [showFilters, setShowFilters] = useState(true)
  const [viewMode, setViewMode] = useState("table")
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showAllocateModal, setShowAllocateModal] = useState(false)

  const { students, totalCount, loading, error, filters, updateFilter, pagination, totalPages, setCurrentPage, setPageSize, sorting, handleSort, resetFilters, refreshStudents, importStudents, missingOptions } = useStudents({
    perPage: 10,
    autoFetch: true,
  })

  const departments = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Mathematics", "Physics", "Chemistry", "Humanities"]

  const years = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
    { value: "5", label: "5th Year" },
  ]

  const degrees = ["B.Tech", "M.Tech", "PhD", "BSc", "MSc", "MBA", "BBA"]

  const dayScholarOptions = [
    { value: "", label: "All Students" },
    { value: "true", label: "Day Scholar" },
    { value: "false", label: "Hosteller" },
  ]

  const handleImportStudents = async (importedStudents) => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', borderLeft: 'var(--border-4) solid var(--color-danger)', color: 'var(--color-danger-text)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Error:</p>
          <p>{error}</p>
        </div>
      )}

      <StudentsHeader showFilters={showFilters} onToggleFilters={() => setShowFilters(!showFilters)}
        onImport={() => setShowImportModal(true)}
        onBulkUpdate={() => setShowUpdateModal(true)}
        onUpdateAllocations={() => setShowAllocateModal(true)}
        onExport={handleExportStudents}
        userRole={user?.role}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-6) var(--spacing-8)' }}>

        <StudentStats />

        {showFilters && (
          <StudentFilterSection filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} hostels={hostels} units={units} years={years} departments={departments} degrees={degrees} setPageSize={setPageSize} dayScholarOptions={dayScholarOptions} missingOptions={missingOptions} />
        )}

        <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-3)' }} className="sm:flex-row sm:items-center sm:gap-0">
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Showing <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{students.length}</span> out of <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{totalCount}</span> students
          </div>

          <ToggleButtonGroup
            options={[
              { value: "table", icon: <FaTable />, ariaLabel: "Table view" },
              { value: "card", icon: <FaThLarge />, ariaLabel: "Card view" },
            ]}
            value={viewMode}
            onChange={setViewMode}
            shape="rounded"
            size="medium"
            variant="muted"
            hideLabelsOnMobile={false}
          />
        </div>

        {loading ? (
          viewMode === "table" ? (
            <TableShimmer rows={pagination.pageSize || 10} />
          ) : (
            <CardsGridShimmer />
          )
        ) : (
          <>
            <div style={{ marginTop: 'var(--spacing-4)' }}>
              {viewMode === "table" && <StudentTableView currentStudents={students} sortField={sorting.sortField} sortDirection={sorting.sortDirection} handleSort={handleSort} viewStudentDetails={viewStudentDetails} />}

              {viewMode === "card" && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--gap-md)' }} className="sm:grid-cols-2 lg:grid-cols-3">
                  {students.map((student) => (
                    <StudentCard key={student.id} student={student} onClick={() => viewStudentDetails(student)} />
                  ))}
                </div>
              )}
            </div>

            <Pagination currentPage={pagination.currentPage} totalPages={totalPages} paginate={paginate} />

            {students.length === 0 && !loading && <NoResults icon={<FaUserGraduate style={{ color: 'var(--color-text-placeholder)', fontSize: 'var(--font-size-4xl)' }} />} message="No students found" suggestion="Try changing your search or filter criteria" />}
          </>
        )}

        {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={refreshStudents} />}

        {["Admin"].includes(user?.role) && <ImportStudentModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImport={handleImportStudents} />}
        {["Admin"].includes(user?.role) && <UpdateStudentsModal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} onUpdate={handleUpdateStudents} />}
        {["Admin"].includes(user?.role) && showAllocateModal && <UpdateAllocationModal isOpen={showAllocateModal} onClose={() => setShowAllocateModal(false)} onAllocate={handleUpdateAllocations} />}
      </div>
    </div>
  )
}

export default Students
