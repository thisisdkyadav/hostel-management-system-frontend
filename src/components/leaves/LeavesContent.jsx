import NoResults from "../common/NoResults"
import Pagination from "../common/Pagination"
import { FaCalendarAlt } from "react-icons/fa"

const LeavesListView = ({ leaves, onViewDetails }) => {
  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leaves.map((leave, index) => (
            <tr key={leave.id || leave._id || index} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewDetails(leave)}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{leave.requestedBy?.name || leave.user?.name || leave.userId?.name || "Me"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{leave.reason}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${leave.status === "Approved" ? "bg-green-100 text-green-700" : leave.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{leave.status || "Pending"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const LeavesCardView = ({ leaves, onViewDetails }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {leaves.map((leave, index) => (
        <div key={leave.id || leave._id || index} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow cursor-pointer" onClick={() => onViewDetails(leave)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-[#1360AB]">
              <FaCalendarAlt className="mr-2" />
              <span className="font-semibold">{leave.requestedBy?.name || leave.user?.name || leave.userId?.name || "Me"}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${leave.status === "Approved" ? "bg-green-100 text-green-700" : leave.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{leave.status || "Pending"}</span>
          </div>
          <div className="mt-3 text-sm text-gray-700">{leave.reason}</div>
          <div className="mt-2 text-xs text-gray-500">
            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}

const LeavesContent = ({ loading, leaves, viewMode, filters, totalPages, updateFilter, onViewDetails, paginate }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1360AB] rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {leaves.length > 0 ? (
        <>
          <div className="mt-6">{viewMode === "list" ? <LeavesListView leaves={leaves} onViewDetails={onViewDetails} /> : <LeavesCardView leaves={leaves} onViewDetails={onViewDetails} />}</div>

          {totalPages > 1 && <Pagination currentPage={filters.page} totalPages={totalPages} paginate={paginate} />}
        </>
      ) : (
        <div className="mt-12">
          <NoResults icon={<FaCalendarAlt className="text-gray-300 text-5xl" />} message="No leaves found" suggestion="Try changing filter criteria or create a leave" />
        </div>
      )}
    </>
  )
}

export default LeavesContent
