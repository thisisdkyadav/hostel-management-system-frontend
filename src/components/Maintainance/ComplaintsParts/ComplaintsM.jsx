import React, { useState } from "react";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import ComplaintsStatsM from "./ComplaintsStatsM";
import ComplaintItemM from "./ComplaintItemM";

const ComplaintsM = ({ complaints, setComplaints, stats }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter complaints based on search term and filter status
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === "All" || complaint.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Change complaint status
  const changeStatus = (id, newStatus) => {
    setComplaints(complaints.map(complaint => {
      if (complaint.id === id) {
        return { ...complaint, status: newStatus };
      }
      return complaint;
    }));
  };

  // Handle view details
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  // Priority color mapping
  const priorityColor = {
    "High": "bg-[#1360AB]",
    "Medium": "bg-[#1360AB] bg-opacity-70",
    "Low": "bg-[#1360AB] bg-opacity-50"
  };

  // Status color mapping
  const statusColor = {
    "Pending": "bg-[#fff9f0] text-[#1360AB]",
    "In Progress": "bg-[#f0f7ff] text-[#1360AB]",
    "Resolved": "bg-[#f0fff7] text-[#1360AB]"
  };

  // Category mapping to background colors
  const categoryBg = {
    "Civil": "bg-gray-200",
    "Water": "bg-blue-200",
    "Electrical": "bg-yellow-200"
  };

  return (
    <div className="bg-white shadow-md p-6 rounded-[20px] w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Complaints Management</h3>
      </div>
      
      {/* Complaints Statistics */}
      <ComplaintsStatsM stats={stats} />

      <h3 className="text-lg font-semibold mb-4">Recent Complaints</h3>
      
      <div className="mb-6 flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search complaints..."
            className="w-full p-3 pr-10 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <div className="relative">
          <button 
            className="bg-[#1360AB] text-white px-4 py-3 rounded-md text-sm flex items-center space-x-1"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <FaFilter className="text-sm" />
            <span>Filter: {filterStatus}</span>
          </button>
          
          {showFilterMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white border rounded-md shadow-lg z-10">
              <ul>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFilterStatus("All");
                    setShowFilterMenu(false);
                  }}
                >
                  All
                </li>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFilterStatus("Pending");
                    setShowFilterMenu(false);
                  }}
                >
                  Pending
                </li>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFilterStatus("In Progress");
                    setShowFilterMenu(false);
                  }}
                >
                  In Progress
                </li>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFilterStatus("Resolved");
                    setShowFilterMenu(false);
                  }}
                >
                  Resolved
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map(complaint => (
            <ComplaintItemM 
              key={complaint.id}
              complaint={complaint}
              changeStatus={changeStatus}
              onViewDetails={handleViewDetails}
              categoryBg={categoryBg}
              statusColor={statusColor}
              priorityColor={priorityColor}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 bg-white rounded-md shadow-sm">
            <FaSearch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No complaints match your search or filter criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("All");
              }}
              className="mt-2 text-[#1360AB]"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-3/4 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold">{selectedComplaint.title}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between mb-4">
                <span className={`${categoryBg[selectedComplaint.category]} px-3 py-1 rounded-full`}>
                  {selectedComplaint.category}
                </span>
                <span className={`${priorityColor[selectedComplaint.priority]} text-white px-3 py-1 rounded-full`}>
                  {selectedComplaint.priority} Priority
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-base">{selectedComplaint.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-base">{selectedComplaint.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-base">{selectedComplaint.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date Reported</p>
                    <p className="text-base">{selectedComplaint.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assigned To</p>
                    <p className="text-base">{selectedComplaint.assignedTo}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      changeStatus(selectedComplaint.id, "Pending");
                      setSelectedComplaint({...selectedComplaint, status: "Pending"});
                    }}
                    className={`px-4 py-2 rounded ${selectedComplaint.status === "Pending" ? "bg-[#1360AB] text-white" : "bg-gray-200"}`}
                  >
                    Pending
                  </button>
                  <button 
                    onClick={() => {
                      changeStatus(selectedComplaint.id, "In Progress");
                      setSelectedComplaint({...selectedComplaint, status: "In Progress"});
                    }}
                    className={`px-4 py-2 rounded ${selectedComplaint.status === "In Progress" ? "bg-[#1360AB] text-white" : "bg-gray-200"}`}
                  >
                    In Progress
                  </button>
                  <button 
                    onClick={() => {
                      changeStatus(selectedComplaint.id, "Resolved");
                      setSelectedComplaint({...selectedComplaint, status: "Resolved"});
                    }}
                    className={`px-4 py-2 rounded ${selectedComplaint.status === "Resolved" ? "bg-[#1360AB] text-white" : "bg-gray-200"}`}
                  >
                    Resolved
                  </button>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="bg-[#1360AB] text-white px-4 py-2 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsM;