import { FaBuilding, FaEye } from "react-icons/fa"
import { BiSolidCategory } from "react-icons/bi"
import { getStatusColor, getPriorityColor, getTimeSince } from "../../utils/adminUtils"

const ComplaintCardView = ({ complaints, onViewDetails }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {complaints.map((complaint) => (
        <div key={complaint.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">{complaint.id?.substring(0, 8)}</span>
              <h3 className="font-bold text-lg mt-1 text-gray-800 line-clamp-1">{complaint.title}</h3>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center">
              <FaBuilding className="text-[#1360AB] text-opacity-70 text-sm mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate max-w-[150px]">
                {complaint.hostel}, Room {complaint.roomNumber}
              </span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</span>
          </div>

          <div className="mt-4">
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 line-clamp-3">{complaint.description}</div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <BiSolidCategory className="text-[#1360AB] text-opacity-70 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">{complaint.category}</span>
            </div>
            <span className="text-xs text-gray-500">{getTimeSince(complaint.createdDate)}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              {complaint.reportedBy?.profileImage ? (
                <img src={complaint.reportedBy.profileImage} alt={complaint.reportedBy.name} className="h-8 w-8 rounded-full object-cover mr-2" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-medium mr-2">{complaint.reportedBy?.name?.charAt(0) || "U"}</div>
              )}
              <div>
                <div className="text-xs font-medium line-clamp-1">{complaint.reportedBy?.name}</div>
                <div className="text-xs text-gray-500">Reporter</div>
              </div>
            </div>

            <button className="flex items-center px-3 py-1.5 bg-[#E4F1FF] text-[#1360AB] rounded-lg text-sm hover:bg-[#1360AB] hover:text-white transition-colors" onClick={() => onViewDetails(complaint)}>
              <FaEye className="mr-1.5" /> Details
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ComplaintCardView
