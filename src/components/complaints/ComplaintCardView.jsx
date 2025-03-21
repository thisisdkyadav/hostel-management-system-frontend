import { FaBuilding } from "react-icons/fa"
import { BiSolidCategory } from "react-icons/bi"
import { getStatusColor, getPriorityColor, getTimeSince } from "../../utils/adminUtils"

const ComplaintCardView = ({ complaints, onViewDetails }) => {
  return (
    <div className="mt-6 grid grid-cols-3 gap-6">
      {complaints.map((complaint) => (
        <div key={complaint.id} className="bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)]">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">{complaint.id}</span>
              <h3 className="font-bold text-lg mt-1 text-gray-800">{complaint.title}</h3>
            </div>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center">
              <FaBuilding className="text-gray-400 text-sm mr-2" />
              <span className="text-sm text-gray-600">
                {complaint.hostel}, Room {complaint.roomNumber}
              </span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</span>
          </div>

          <div className="mt-4">
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 max-h-20 overflow-y-auto">{complaint.description.length > 120 ? `${complaint.description.substring(0, 120)}...` : complaint.description}</div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <BiSolidCategory className="text-gray-400 mr-2" />
              <span className="text-sm">{complaint.category}</span>
            </div>
            <span className="text-xs text-gray-500">{getTimeSince(complaint.createdDate)}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <img src={complaint.reportedBy.image} alt={complaint.reportedBy.name} className="h-8 w-8 rounded-full mr-2" />
              <div>
                <div className="text-xs font-medium">{complaint.reportedBy.name}</div>
                <div className="text-xs text-gray-500">Reporter</div>
              </div>
            </div>

            <button className="bg-[#E4F1FF] text-[#1360AB] px-3 py-1 rounded-lg text-sm hover:bg-[#1360AB] hover:text-white transition-colors" onClick={() => onViewDetails(complaint)}>
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ComplaintCardView
