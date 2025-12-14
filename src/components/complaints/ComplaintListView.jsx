import { getStatusColor, getPriorityColor, getTimeSince } from "../../utils/adminUtils"
import { useAuth } from "../../contexts/AuthProvider"
import BaseTable from "../common/table/BaseTable"
import { getMediaUrl } from "../../utils/mediaUtils"

const ComplaintListView = ({ complaints, onViewDetails }) => {
  const { user } = useAuth()

  const columns = [
    {
      header: "ID/Title",
      key: "title",
      render: (complaint) => (
        <div className="flex flex-col">
          <div className="text-xs text-[#8fa3c4]">{complaint.id?.substring(0, 8)}</div>
          <div className="font-medium text-[#0a1628] line-clamp-1">{complaint.title}</div>
        </div>
      ),
    },
    {
      header: "Reported",
      key: "reportedBy",
      className: "hidden md:table-cell",
      render: (complaint) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            {complaint.reportedBy?.profileImage ? (
              <img className="h-8 w-8 rounded-lg object-cover" src={getMediaUrl(complaint.reportedBy.profileImage)} alt="" />
            ) : (
              <div 
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-medium"
                style={{ background: 'linear-gradient(135deg, #0b57d0, #3b7de8)' }}
              >
                {complaint.reportedBy?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-[#0a1628] line-clamp-1">{complaint.reportedBy?.name}</div>
            <div className="text-xs text-[#8fa3c4]">{getTimeSince(complaint.createdDate)}</div>
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
  ]

  return <BaseTable columns={columns} data={complaints} emptyMessage="No complaints to display" onRowClick={onViewDetails} />
}

export default ComplaintListView
