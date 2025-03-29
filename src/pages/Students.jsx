import { useState } from "react"
import { FaUserGraduate, FaFileExport, FaFileImport, FaEdit } from "react-icons/fa"
import { MdFilterAlt, MdClearAll } from "react-icons/md"
import NoResults from "../components/common/NoResults"
import StudentStats from "../components/common/students/StudentStats"
import StudentFilterSection from "../components/common/students/StudentFilterSection"
import StudentCard from "../components/common/students/StudentCard"
import StudentDetailModal from "../components/common/students/StudentDetailModal"
import ImportStudentModal from "../components/common/students/ImportStudentModal"
import UpdateStudentsModal from "../components/common/students/UpdateStudentsModal"
import StudentTableView from "../components/common/students/StudentTableView"
import Pagination from "../components/common/Pagination"
import { useStudents } from "../hooks/useStudents"
import { useGlobal } from "../contexts/GlobalProvider"
import { useAuth } from "../contexts/AuthProvider"
import { studentApi } from "../services/apiService"

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

  const { students, totalCount, loading, error, filters, updateFilter, pagination, totalPages, setCurrentPage, setPageSize, sorting, handleSort, resetFilters, refreshStudents, importStudents } = useStudents({
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

  const handleImportStudents = async (importedStudents) => {
    try {
      const result = await importStudents(importedStudents)
      if (result.error) {
        alert(`Error importing students: ${result.error.message}`)
        return false
      }
      alert("Students imported successfully")
      return true
    } catch (error) {
      alert(`An error occurred: ${error.message}`)
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
      alert(`An error occurred: ${error.message}`)
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
      console.log("Fetched student details:", response)

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
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Student Management</h1>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center px-3 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <MdClearAll className="mr-2" /> : <MdFilterAlt className="mr-2" />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {["Admin"].includes(user?.role) && (
            <>
              <button className="flex items-center px-3 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700" onClick={() => setShowImportModal(true)}>
                <FaFileImport className="mr-2" /> Import
              </button>
              <button className="flex items-center px-3 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700" onClick={() => setShowUpdateModal(true)}>
                <FaEdit className="mr-2" /> Bulk Update
              </button>
            </>
          )}

          <button onClick={handleExportStudents} className="flex items-center px-3 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700">
            <FaFileExport className="mr-2" /> Export
          </button>
        </div>
      </header>

      <StudentStats students={students} totalCount={totalCount} />

      {showFilters && <StudentFilterSection filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} hostels={hostels} units={units} years={years} departments={departments} degrees={degrees} setPageSize={setPageSize} />}

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{students.length}</span> out of <span className="font-semibold">{totalCount}</span> students
        </div>

        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-[#1360AB] text-white shadow-sm" : "bg-transparent text-gray-600 hover:bg-gray-200"}`} aria-label="Table view">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>

          <button onClick={() => setViewMode("card")} className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-[#1360AB] text-white shadow-sm" : "bg-transparent text-gray-600 hover:bg-gray-200"}`} aria-label="Card view">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1360AB] rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4">
            {viewMode === "table" && <StudentTableView currentStudents={students} sortField={sorting.sortField} sortDirection={sorting.sortDirection} handleSort={handleSort} viewStudentDetails={viewStudentDetails} />}

            {viewMode === "card" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {students.map((student) => (
                  <StudentCard key={student.id} student={student} onClick={() => viewStudentDetails(student)} />
                ))}
              </div>
            )}
          </div>

          <Pagination currentPage={pagination.currentPage} totalPages={totalPages} paginate={paginate} />

          {students.length === 0 && !loading && <NoResults icon={<FaUserGraduate className="text-gray-300 text-4xl" />} message="No students found" suggestion="Try changing your search or filter criteria" />}
        </>
      )}

      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={refreshStudents} />}

      {["Admin"].includes(user?.role) && <ImportStudentModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImport={handleImportStudents} />}
      {["Admin"].includes(user?.role) && <UpdateStudentsModal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} onUpdate={handleUpdateStudents} />}
    </div>
  )
}

export default Students
