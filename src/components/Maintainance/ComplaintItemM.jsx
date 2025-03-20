import React from "react";
import { FaRegClock, FaExclamationCircle, FaCheck } from "react-icons/fa";

const ComplaintItemM = ({ complaint, changeStatus, onViewDetails, categoryBg, statusColor, priorityColor }) => {
  // Format createdDate for display
  const formattedDate = new Date(complaint.createdDate).toLocaleDateString();

  return (
    <div className="p-4 bg-[#E4F1FF] rounded-md shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-lg font-semibold">{complaint.title}</h4>
            <span className={`${categoryBg[complaint.category]} px-2 py-0.5 rounded-full text-xs`}>
              {complaint.category}
            </span>
            <span className={`${statusColor[complaint.status]} px-2 py-0.5 rounded-full text-xs`}>
              {complaint.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            {complaint.description}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Location:</span> {complaint.hostel} - {complaint.roomNumber}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Date:</span> {formattedDate}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`${priorityColor[complaint.priority]} text-white px-3 py-1 rounded-full text-xs`}>
            {complaint.priority} Priority
          </span>
          <div className="flex space-x-2">
            <button 
              onClick={() => changeStatus(complaint.id, "Pending")}
              className={`px-2 py-1 rounded ${complaint.status === "Pending" ? "bg-[#1360AB] text-white" : "bg-gray-200"}`}
              title="Set as Pending"
            >
              <FaRegClock />
            </button>
            <button 
              onClick={() => changeStatus(complaint.id, "In Progress")}
              className={`px-2 py-1 rounded ${complaint.status === "In Progress" ? "bg-[#1360AB] text-white" : "bg-gray-200"}`}
              title="Set as In Progress"
            >
              <FaExclamationCircle />
            </button>
            <button 
              onClick={() => changeStatus(complaint.id, "Resolved")}
              className={`px-2 py-1 rounded ${complaint.status === "Resolved" ? "bg-[#1360AB] text-white" : "bg-gray-200"}`}
              title="Set as Resolved"
            >
              <FaCheck />
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <span className="font-medium">Assigned to:</span> {complaint.assignedTo || "Not Assigned"}
        </p>
        <button 
          onClick={() => onViewDetails(complaint)}
          className="text-sm text-[#1360AB] font-semibold hover:underline"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ComplaintItemM;