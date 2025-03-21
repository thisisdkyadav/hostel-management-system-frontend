import { useState, useEffect } from "react"
import { FaUserGraduate, FaEye, FaFileExport, FaFileImport } from "react-icons/fa"
import { MdFilterAlt, MdClearAll } from "react-icons/md"
import NoResults from "../components/admin/NoResults"
import StudentStats from "../components/common/students/StudentStats"
import StudentFilterSection from "../components/common/students/StudentFilterSection"
import StudentCard from "../components/common/students/StudentCard"
import StudentDetailModal from "../components/common/students/StudentDetailModal"
import ImportStudentModal from "../components/common/students/ImportStudentModal"
import StudentTableView from "../components/common/students/StudentTableView"
import Pagination from "../components/common/Pagination"
import { studentApi } from "../services/apiService"
import { useStudentFilters } from "../hooks/useStudentFilters"
import { useGlobal } from "../contexts/GlobalProvider"
import { useAuth } from "../contexts/AuthProvider"

const Students = () => {
  const { user } = useAuth()
  const { hostelList = [], unitList = [] } = useGlobal()
  const hostels = hostelList
  const units = unitList?.map((unit) => ({ id: unit.id, name: unit.name })) || []

  const [showFilters, setShowFilters] = useState(true)
  const [viewMode, setViewMode] = useState("table")
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [allStudents, setAllStudents] = useState([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [loading, setLoading] = useState(false)
  const [studentsPerPage] = useState(10)

  const departments = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Mathematics", "Physics", "Chemistry", "Humanities"]
  const years = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
    { value: "5", label: "5th Year" },
  ]
  const degrees = ["B.Tech", "M.Tech", "PhD", "BSc", "MSc", "MBA", "BBA"]

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const queryParams = filterState.buildQueryParams()
      const response = await studentApi.getStudents(queryParams)
      console.log(response, "Students from API")

      setAllStudents(response?.data || [])
      setTotalStudents(response?.meta?.total || 0)
    } catch (error) {
      alert(`An error occurred: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const filterState = useStudentFilters(fetchStudents)

  const handleImportStudents = async (importedStudents) => {
    try {
      const response = await studentApi.importStudents(importedStudents)
      if (response?.error) {
        alert(`Error importing students: ${response.error.message}`)
        return false
      }
      alert("Students imported successfully")
      fetchStudents()
      return true
    } catch (error) {
      alert(`An error occurred: ${error.message}`)
    }
  }

  const viewStudentDetails = (student) => {
    setSelectedStudent(student)
    setShowStudentDetail(true)
  }

  const paginate = (pageNumber) => filterState.pagination.setCurrentPage(pageNumber)

  const totalPages = Math.ceil(totalStudents / studentsPerPage)

  useEffect(() => {
    fetchStudents()
  }, [filterState.pagination.currentPage, filterState.sorting.sortField, filterState.sorting.sortDirection])

  return (
    <div className="px-10 py-6 flex-1">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
        <h1 className="text-2xl px-3 font-bold">Student Management</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-2 text-gray-600 bg-white rounded-[12px] hover:bg-gray-100" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <MdClearAll className="mr-2" /> : <MdFilterAlt className="mr-2" />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {["Warden"].includes(user?.role) && (
            <button className="flex items-center px-3 py-2 text-gray-600 bg-white rounded-[12px] hover:bg-gray-100" onClick={() => setShowImportModal(true)}>
              <FaFileImport className="mr-2" /> Import
            </button>
          )}
          <button className="flex items-center px-3 py-2 text-gray-600 bg-white rounded-[12px] hover:bg-gray-100">
            <FaFileExport className="mr-2" /> Export
          </button>
        </div>
      </header>

      <StudentStats students={allStudents} totalCount={totalStudents} />

      {showFilters && <StudentFilterSection filters={filterState.filters} resetFilters={filterState.resetFilters} hostels={hostels} units={units} years={years} departments={departments} degrees={degrees} />}

      <div className="mt-6 flex justify-between items-center">
        <div className="text-gray-600">
          Showing <span className="font-semibold">{allStudents.length}</span> out of <span className="font-semibold">{totalStudents}</span> students
        </div>

        <div className="flex space-x-2">
          <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg ${viewMode === "table" ? "bg-[#1360AB] text-white" : "bg-white text-gray-600"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button onClick={() => setViewMode("card")} className={`p-2 rounded-lg ${viewMode === "card" ? "bg-[#1360AB] text-white" : "bg-white text-gray-600"}`}>
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1360AB]"></div>
        </div>
      ) : (
        <>
          {viewMode === "table" && <StudentTableView currentStudents={allStudents} sortField={filterState.sorting.sortField} sortDirection={filterState.sorting.sortDirection} handleSort={filterState.sorting.handleSort} viewStudentDetails={viewStudentDetails} />}

          {viewMode === "card" && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allStudents.map((student) => (
                <StudentCard key={student.id} student={student} onClick={() => viewStudentDetails(student)} />
              ))}
            </div>
          )}

          {allStudents.length === 0 && !loading && <NoResults icon={<FaUserGraduate className="mx-auto text-gray-300 text-5xl mb-4" />} message="No students found" suggestion="Try changing your search or filter criteria" />}
        </>
      )}

      {allStudents.length > 0 && <Pagination currentPage={filterState.pagination.currentPage} totalPages={totalPages} paginate={paginate} />}

      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={fetchStudents} />}

      {["Warden"].includes(user?.role) && <ImportStudentModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImport={handleImportStudents} />}
    </div>
  )
}

export default Students
