import { useState, useEffect } from "react"
import { FaUserGraduate, FaEye, FaFileExport, FaFileImport, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa"
import { MdFilterAlt, MdClearAll } from "react-icons/md"
import NoResults from "../../components/admin/NoResults"
import StudentStats from "../../components/admin/students/StudentStats"
import StudentFilterSection from "../../components/admin/students/StudentFilterSection"
import StudentCard from "../../components/admin/students/StudentCard"
import StudentDetailModal from "../../components/admin/students/StudentDetailModal"
import ImportStudentModal from "../../components/admin/students/ImportStudentModal"
import { filterStudents } from "../../utils/adminUtils"
import StudentTableView from "../../components/admin/students/StudentTableView"
import { studentApi } from "../../services/apiService"

const Students = () => {
  // State for filters and search
  const [showFilters, setShowFilters] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedHostel, setSelectedHostel] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [studentsPerPage] = useState(10)
  const [sortField, setSortField] = useState("rollNumber")
  const [sortDirection, setSortDirection] = useState("asc")
  const [viewMode, setViewMode] = useState("table") // table or card
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [allStudents, setAllStudents] = useState([])

  // Sample data for departments, years, and hostels
  const departments = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Mathematics", "Physics", "Chemistry", "Humanities"]
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"]
  const hostels = ["Hostel A", "Hostel B", "Hostel C", "Hostel D", "Hostel E", "Hostel F", "Hostel G"]

  // Sample student data
  // const allStudents = [
  //   {
  //     id: "S12345",
  //     name: "Rahul Sharma",
  //     email: "rahul.sharma@students.iiti.ac.in",
  //     gender: "Male",
  //     department: "Computer Science",
  //     year: "3rd Year",
  //     hostel: "Hostel A",
  //     room: "A-203",
  //     phone: "9876543201",
  //     status: "Active",
  //     address: "123 Main St, Mumbai, Maharashtra",
  //     guardian: "Rajesh Sharma",
  //     guardianPhone: "9876543222",
  //     admissionDate: "2020-08-15",
  //     image: "https://randomuser.me/api/portraits/men/11.jpg",
  //   },
  // ]

  const handleImportStudents = async (importedStudents) => {
    try {
      const response = await studentApi.importStudents(importedStudents)
      if (response?.error) {
        alert(`Error importing students: ${response.error.message}`)
        return false
      }
      alert("Students imported successfully")
      return true
    } catch (error) {
      alert(`An error occurred: ${error.message}`)
    }
  }

  const filteredStudents = filterStudents(allStudents, selectedHostel, selectedYear, selectedDepartment, selectedStatus, selectedGender, searchTerm, sortField, sortDirection)

  const indexOfLastStudent = currentPage * studentsPerPage
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent)
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle reset filters
  const resetFilters = () => {
    setSearchTerm("")
    setSelectedHostel("")
    setSelectedYear("")
    setSelectedDepartment("")
    setSelectedStatus("")
    setSelectedGender("")
    setCurrentPage(1)
  }

  // View student details
  const viewStudentDetails = (student) => {
    setSelectedStudent(student)
    setShowStudentDetail(true)
  }

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const fetchStudents = async () => {
    try {
      const response = await studentApi.getStudents()
      console.log(response, "Students from API")

      setAllStudents(response?.data || [])
    } catch (error) {
      alert(`An error occurred: ${error.message}`)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return (
    <div className="px-10 py-6 flex-1">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
        <h1 className="text-2xl px-3 font-bold">Student Management</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-2 text-gray-600 bg-white rounded-[12px] hover:bg-gray-100" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <MdClearAll className="mr-2" /> : <MdFilterAlt className="mr-2" />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <button className="flex items-center px-3 py-2 text-gray-600 bg-white rounded-[12px] hover:bg-gray-100" onClick={() => setShowImportModal(true)}>
            <FaFileImport className="mr-2" /> Import
          </button>
          <button className="flex items-center px-3 py-2 text-gray-600 bg-white rounded-[12px] hover:bg-gray-100">
            <FaFileExport className="mr-2" /> Export
          </button>
        </div>
      </header>

      <StudentStats students={allStudents} />

      {showFilters && (
        <StudentFilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          resetFilters={resetFilters}
          selectedHostel={selectedHostel}
          setSelectedHostel={setSelectedHostel}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          hostels={hostels}
          years={years}
          departments={departments}
        />
      )}

      <div className="mt-6 flex justify-between items-center">
        <div className="text-gray-600">
          Showing <span className="font-semibold">{filteredStudents.length}</span> students
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

      {viewMode === "table" && <StudentTableView currentStudents={currentStudents} sortField={sortField} sortDirection={sortDirection} handleSort={handleSort} viewStudentDetails={viewStudentDetails} />}

      {viewMode === "card" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentStudents.map((student) => (
            <StudentCard key={student.id} student={student} onClick={() => viewStudentDetails(student)} />
          ))}
        </div>
      )}

      {filteredStudents.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} entries
          </div>

          <nav className="flex space-x-2">
            <button onClick={() => paginate(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`px-3 py-1 rounded-md ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-600 hover:bg-[#1360AB] hover:text-white"}`}>
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
              // Logic to show pages around current page
              let pageNum
              if (totalPages <= 5) {
                pageNum = index + 1
              } else if (currentPage <= 3) {
                pageNum = index + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + index
              } else {
                pageNum = currentPage - 2 + index
              }

              return (
                <button key={pageNum} onClick={() => paginate(pageNum)} className={`px-3 py-1 rounded-md ${currentPage === pageNum ? "bg-[#1360AB] text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
                  {pageNum}
                </button>
              )
            })}

            <button onClick={() => paginate(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`px-3 py-1 rounded-md ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-600 hover:bg-[#1360AB] hover:text-white"}`}>
              Next
            </button>
          </nav>
        </div>
      )}

      {filteredStudents.length === 0 && <NoResults icon={<FaUserGraduate className="mx-auto text-gray-300 text-5xl mb-4" />} message="No students found" suggestion="Try changing your search or filter criteria" />}

      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} />}
      <ImportStudentModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImport={handleImportStudents} />
    </div>
  )
}

export default Students
