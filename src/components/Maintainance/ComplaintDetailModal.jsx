import React from "react";
import { FaTimes } from "react-icons/fa";

const ComplaintDetailModal = ({
  showModal,
  selectedComplaint,
  onClose,
  changeStatus,
  categoryBg,
  statusColor,
  priorityColor
}) => {
  if (!showModal || !selectedComplaint) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
      <div className="bg-white rounded-[20px] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Complaint Details</h3>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Complaint ID</p>
              <p>{selectedComplaint.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reported On</p>
              <p>{new Date(selectedComplaint.date).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p>{selectedComplaint.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className={`inline-block px-2 py-1 rounded text-sm ${categoryBg[selectedComplaint.category] || categoryBg.Other}`}>
                {selectedComplaint.category}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${priorityColor[selectedComplaint.priority]}`}></div>
                <p>{selectedComplaint.priority}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={`inline-block px-2 py-1 border rounded text-sm ${statusColor[selectedComplaint.status]}`}>
                {selectedComplaint.status}
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">{selectedComplaint.title}</h4>
            <p className="text-gray-700 whitespace-pre-line">{selectedComplaint.description}</p>
          </div>
          
          {selectedComplaint.imageUrls && selectedComplaint.imageUrls.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Attached Images</h4>
              <div className="grid grid-cols-3 gap-2">
                {selectedComplaint.imageUrls.map((url, index) => (
                  <img 
                    key={index} 
                    src={url} 
                    alt={`Complaint image ${index + 1}`} 
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Update Status</h4>
            <div className="flex space-x-2">
              {["Pending", "In Progress", "Resolved"].map(status => (
                <button
                  key={status}
                  className={`px-3 py-2 rounded text-sm ${
                    selectedComplaint.status === status
                      ? "bg-gray-200 font-medium"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => changeStatus(selectedComplaint.id, status)}
                  disabled={selectedComplaint.status === status}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailModal;