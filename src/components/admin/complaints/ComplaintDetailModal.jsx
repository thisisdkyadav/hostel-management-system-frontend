import React from "react"
import { RiUserSettingsFill } from "react-icons/ri"
import { getStatusColor, getPriorityColor } from "../../../utils/adminUtils"

const ComplaintDetailModal = ({ selectedComplaint, setShowDetailModal }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-[20px] w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-xs text-gray-500">{selectedComplaint.id}</span>
            <h2 className="text-xl font-bold">{selectedComplaint.title}</h2>
          </div>
          <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedComplaint.status)}`}>{selectedComplaint.status}</span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedComplaint.priority)}`}>{selectedComplaint.priority}</span>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">{selectedComplaint.category}</span>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Location Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Hostel:</span>
                <span className="font-medium">{selectedComplaint.hostel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Room Number:</span>
                <span className="font-medium">{selectedComplaint.roomNumber}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Reported By</h4>
            <div className="flex items-center">
              <img src={selectedComplaint.reportedBy.image} alt={selectedComplaint.reportedBy.name} className="h-12 w-12 rounded-full mr-4" />
              <div>
                <div className="font-medium">{selectedComplaint.reportedBy.name}</div>
                <div className="text-sm text-gray-500">Email: {selectedComplaint.reportedBy.email}</div>
                <div className="text-sm text-gray-500">{selectedComplaint.reportedBy.phone}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-500 mb-3">Description</h4>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-700">{selectedComplaint.description}</div>
        </div>

        {selectedComplaint.images.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Images</h4>
            <div className="grid grid-cols-3 gap-4">
              {selectedComplaint.images.map((image, index) => (
                <div key={index} className="relative h-40 rounded-lg overflow-hidden">
                  <img src={image} alt={`Complaint ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-500 mb-3">Assignment</h4>
          {selectedComplaint.assignedTo ? (
            <div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <RiUserSettingsFill className="text-[#1360AB] text-xl mr-3" />
              <div>
                <div className="font-medium">{selectedComplaint.assignedTo.name}</div>
                <div className="text-sm text-gray-500">{selectedComplaint.assignedTo.role}</div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg flex items-center text-gray-500">
              <RiUserSettingsFill className="text-xl mr-3" />
              <span>Not assigned yet</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-500 mb-3">Resolution Notes</h4>
          {selectedComplaint.resolutionNotes ? <div className="bg-gray-50 p-4 rounded-lg text-gray-700">{selectedComplaint.resolutionNotes}</div> : <div className="bg-gray-50 p-4 rounded-lg text-gray-500 italic">No resolution notes yet.</div>}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
          <div>Created: {new Date(selectedComplaint.createdDate).toLocaleString()}</div>
          {selectedComplaint.lastUpdated !== selectedComplaint.createdDate && <div>Last Updated: {new Date(selectedComplaint.lastUpdated).toLocaleString()}</div>}
        </div>

        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Delete</button>
          </div>

          <div className="space-x-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
            <button className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700">{selectedComplaint.status === "Pending" ? "Assign & Process" : "Update Status"}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplaintDetailModal
