import { FaEye } from "react-icons/fa"
import { getStatusColor, getPriorityColor, getTimeSince } from "../../utils/adminUtils"
import StudentDetailModal from "../common/students/StudentDetailModal"
import { useAuth } from "../../contexts/AuthProvider"
import { useState } from "react"
import BaseTable from "../common/table/BaseTable"
import { getMediaUrl } from "../../utils/mediaUtils"
const ComplaintListView = ({ complaints, onViewDetails }) => {
  const { user } = useAuth()
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const handleStudentClick = (userId) => {
    if (!userId) return
    if (!["Admin", "Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role)) return
    setSelectedStudent({ userId })
    setShowStudentDetail(true)
  }

  const columns = [
    {
      header: "ID/Title",
      key: "title",
      render: (complaint) => (
        <div className="flex flex-col">
          <div className="text-xs text-gray-500">{complaint.id?.substring(0, 8)}</div>
          <div className="font-medium text-gray-900 line-clamp-1">{complaint.title}</div>
        </div>
      ),
    },
    {
      header: "Reported",
      key: "reportedBy",
      className: "hidden md:table-cell",
      render: (complaint) => (
        <div onClick={() => handleStudentClick(complaint.reportedBy?.id)} className="flex items-center cursor-pointer">
          <div className="flex-shrink-0 h-8 w-8">
            {complaint.reportedBy?.profileImage ? (
              <img className="h-8 w-8 rounded-full object-cover" src={getMediaUrl(complaint.reportedBy.profileImage)} alt="" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-medium">{complaint.reportedBy?.name?.charAt(0) || "U"}</div>
            )}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 line-clamp-1">{complaint.reportedBy?.name}</div>
            <div className="text-xs text-gray-500">{getTimeSince(complaint.createdDate)}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      key: "location",
      className: "hidden sm:table-cell",
      render: (complaint) => (
        <div className="flex flex-col">
          <div className="font-medium text-sm truncate max-w-[150px]">{complaint.hostel || complaint.location}</div>
          {complaint.roomNumber ? <div className="text-xs text-gray-500">Room {complaint.roomNumber}</div> : complaint.hostel ? <div className="text-xs text-gray-500 truncate max-w-[150px]">{complaint.location}</div> : null}
        </div>
      ),
    },
    {
      header: "Category",
      key: "category",
      className: "hidden md:table-cell text-sm text-gray-700",
    },
    {
      header: "Status",
      key: "status",
      render: (complaint) => <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(complaint.status)}`}>{complaint.status}</span>,
    },
    {
      header: "Priority",
      key: "priority",
      className: "hidden lg:table-cell",
      render: (complaint) => <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</span>,
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (complaint) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(complaint)
          }}
          className="text-[#1360AB] hover:bg-blue-50 p-2 rounded-full transition-colors"
          aria-label="View details"
        >
          <FaEye className="h-4 w-4" />
        </button>
      ),
    },
  ]

  return (
    <>
      <BaseTable columns={columns} data={complaints} emptyMessage="No complaints to display" />
      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={() => {}} />}
    </>
  )
}

export default ComplaintListView
