import React from "react";
import { FaEye } from "react-icons/fa";

const ComplaintItemM = ({ 
  complaint, 
  onViewDetails, 
  onChangeStatus,
  categoryBg,
  statusColor,
  priorityColor
}) => {
  // Use hostel and roomNumber if available; fallback to complaint.location
  const locationInfo = complaint.hostel 
    ? `Hostel: ${complaint.hostel}, Room: ${complaint.roomNumber || 'N/A'}`
    : `Location: ${complaint.location}`;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <span className={`inline-block px-2 py-1 rounded text-xs ${categoryBg[complaint.category] || categoryBg.Other}`}>
              {complaint.category}
            </span>
            <span className="text-gray-500 text-sm">
              {new Date(complaint.createdDate).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${priorityColor[complaint.priority]}`}></span>
              <span className="text-xs">{complaint.priority} Priority</span>
            </span>
          </div>
          
          <h4 className="font-medium mb-1 line-clamp-1">{complaint.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{complaint.description}</p>
          
          <div className="text-sm text-gray-500">
            {locationInfo}
          </div>
        </div>
        
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
          <div className={`border px-3 py-1 rounded-full text-xs ${statusColor[complaint.status]}`}>
            {complaint.status}
          </div>
          
          <button 
            onClick={() => onViewDetails(complaint)}
            className="bg-[#1360AB] text-white px-3 py-1 rounded-md text-xs flex items-center"
          >
            <FaEye className="mr-1" /> View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintItemM;