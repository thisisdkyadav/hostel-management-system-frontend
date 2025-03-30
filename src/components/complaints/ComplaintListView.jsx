import { FaEye } from "react-icons/fa"
import { getStatusColor, getPriorityColor, getTimeSince } from "../../utils/adminUtils"

const ComplaintListView = ({ complaints, onViewDetails }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID/Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Reported</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {complaints.map((complaint, index) => (
              <tr key={complaint.id || index} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-xs text-gray-500">{complaint.id?.substring(0, 8)}</div>
                    <div className="font-medium text-gray-900 line-clamp-1">{complaint.title}</div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                  <div className="flex flex-col">
                    <div className="font-medium text-sm">{complaint.hostel}</div>
                    <div className="text-xs text-gray-500">Room {complaint.roomNumber}</div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">{complaint.category}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      {complaint.reportedBy?.profileImage ? (
                        <img className="h-8 w-8 rounded-full object-cover" src={complaint.reportedBy.profileImage} alt="" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-medium">{complaint.reportedBy?.name?.charAt(0) || "U"}</div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">{complaint.reportedBy?.name}</div>
                      <div className="text-xs text-gray-500">{getTimeSince(complaint.createdDate)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <button onClick={() => onViewDetails(complaint)} className="text-[#1360AB] hover:bg-blue-50 p-2 rounded-full transition-colors" aria-label="View details">
                    <FaEye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {complaints.length === 0 && <div className="text-center py-8 text-gray-500">No complaints to display</div>}
    </div>
  )
}

export default ComplaintListView
