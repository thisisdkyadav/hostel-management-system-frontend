import { useState } from "react"
import { FaUserGraduate, FaEye, FaFileExport, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa"
import { MdFilterAlt, MdClearAll } from "react-icons/md"
import NoResults from "../../components/admin/NoResults"
import StudentStats from "../../components/admin/students/StudentStats"
import StudentFilterSection from "../../components/admin/students/StudentFilterSection"
import StudentCard from "../../components/admin/students/StudentCard"
import StudentDetailModal from "../../components/admin/students/StudentDetailModal"
import { filterStudents } from "../../utils/adminUtils"

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
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [viewMode, setViewMode] = useState("table") // table or card
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Sample data for departments, years, and hostels
  const departments = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Mathematics", "Physics", "Chemistry", "Humanities"]
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"]
  const hostels = ["Hostel A", "Hostel B", "Hostel C", "Hostel D", "Hostel E", "Hostel F", "Hostel G"]

  // Sample student data
  const allStudents = [
    {
      id: "S12345",
      name: "Rahul Sharma",
      email: "rahul.sharma@students.iiti.ac.in",
      gender: "Male",
      department: "Computer Science",
      year: "3rd Year",
      hostel: "Hostel A",
      room: "A-203",
      phone: "9876543201",
      status: "Active",
      address: "123 Main St, Mumbai, Maharashtra",
      guardian: "Rajesh Sharma",
      guardianPhone: "9876543222",
      admissionDate: "2020-08-15",
      image: "https://randomuser.me/api/portraits/men/11.jpg",
    },
  ]

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

  return (
    <div className="px-10 py-6 flex-1">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
        <h1 className="text-2xl px-3 font-bold">Student Management</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-2 text-gray-600 bg-white rounded-[12px] hover:bg-gray-100" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <MdClearAll className="mr-2" /> : <MdFilterAlt className="mr-2" />}
            {showFilters ? "Hide Filters" : "Show Filters"}
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

      {/* Results Count and View Toggle */}
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

      {/* Students List - Table View */}
      {viewMode === "table" && (
        <div className="mt-4 bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)] overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("name")}>
                  <div className="flex items-center">
                    Name
                    {sortField === "name" && (sortDirection === "asc" ? <FaSortAmountUp className="ml-2" /> : <FaSortAmountDown className="ml-2" />)}
                  </div>
                </th>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("department")}>
                  <div className="flex items-center">
                    Department
                    {sortField === "department" && (sortDirection === "asc" ? <FaSortAmountUp className="ml-2" /> : <FaSortAmountDown className="ml-2" />)}
                  </div>
                </th>
                <th className="px-6 py-3">Year</th>
                <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("hostel")}>
                  <div className="flex items-center">
                    Hostel
                    {sortField === "hostel" && (sortDirection === "asc" ? <FaSortAmountUp className="ml-2" /> : <FaSortAmountDown className="ml-2" />)}
                  </div>
                </th>
                <th className="px-6 py-3">Room</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={student.image} alt={student.name} className="h-8 w-8 rounded-full mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.year}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.hostel}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.room}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${student.status === "Active" ? "bg-green-100 text-green-800" : student.status === "Inactive" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-[#1360AB] hover:text-blue-800" onClick={() => viewStudentDetails(student)}>
                      <FaEye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Students List - Card View */}
      {viewMode === "card" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentStudents.map((student) => (
            <StudentCard key={student.id} student={student} onClick={() => viewStudentDetails(student)} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
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

      {/* Student Detail Modal */}
      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} />}
    </div>
  )
}

export default Students
