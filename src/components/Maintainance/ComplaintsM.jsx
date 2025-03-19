import React, { useState, useEffect, useCallback } from "react";
import { FaFilter, FaSearch, FaTimes, FaClipboardList, FaEdit } from "react-icons/fa";
import { maintenanceApi } from "../../services/apiService";
import ComplaintItemM from "./ComplaintItemM";
import ComplaintsStatsM from "./ComplaintsStatsM";

const ComplaintsM = () => {
  // State for complaints data
  const [complaints, setComplaints] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  
  // Statistics state - initialize with zeros
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  // Styling objects for categories, statuses, and priorities
  const categoryBg = {
    "Electrical": "bg-yellow-100 text-yellow-800",
    "Plumbing": "bg-blue-100 text-blue-800",
    "Civil": "bg-stone-100 text-stone-800",
    "Water": "bg-cyan-100 text-cyan-800",
    "Other": "bg-gray-100 text-gray-800"
  };
  
  const statusColor = {
    "Pending": "border-amber-500 text-amber-500",
    "In Progress": "border-blue-500 text-blue-500",
    "Resolved": "border-green-500 text-green-500"
  };
  
  const priorityColor = {
    "Low": "bg-green-500",
    "Medium": "bg-amber-500",
    "High": "bg-red-500"
  };

  // Filter complaints based on search term and status filter
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === "All" || 
      complaint.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Fetch complaints from API
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      
      // Get complaints from API
      const data = await maintenanceApi.getComplaints({
        sort: 'date',
        order: 'desc'
      });
      
      // Set complaints with data from API
      setComplaints(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      const statsData = await maintenanceApi.getStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
      // Calculate stats from complaints if API fails
      updateStatsFromComplaints();
    }
  };

  // Calculate stats from complaints array
  const updateStatsFromComplaints = () => {
    const newStats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === "Pending").length,
      inProgress: complaints.filter(c => c.status === "In Progress").length,
      resolved: complaints.filter(c => c.status === "Resolved").length
    };
    setStats(newStats);
  };

  // Initial data fetch
  useEffect(() => {
    fetchComplaints();
    fetchStats();
    
    // Subscribe to real-time updates
    const socket = maintenanceApi.subscribeToUpdates(
      (data) => {
        if (data.type === 'new_complaint') {
          // Add new complaint to the list
          setComplaints(prev => [data.complaint, ...prev]);
        } else if (data.type === 'complaint_updated') {
          // Update existing complaint
          setComplaints(prev => 
            prev.map(c => c.id === data.complaintId ? { ...c, ...data.updates } : c)
          );
        }
        // Recalculate stats when complaints change
        updateStatsFromComplaints();
      },
      (error) => console.error("WebSocket error:", error)
    );
    
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  // Open complaint details modal
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setIsEditing(false);
    setEditedFields({});
    setShowModal(true);
  };

  // Change complaint status
  const changeStatus = async (id, newStatus) => {
    try {
      // Update complaint status via API
      await maintenanceApi.updateComplaintStatus(id, newStatus);
      
      // Update local state
      setComplaints(complaints.map(complaint => {
        if (complaint.id === id) {
          return { ...complaint, status: newStatus };
        }
        return complaint;
      }));
      
      // If currently viewing this complaint in the modal, update it
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
      
      // Recalculate stats
      updateStatsFromComplaints();
    } catch (err) {
      console.error("Error updating complaint status:", err);
      alert("Failed to update complaint status. Please try again.");
    }
  };

  // Handle partial complaint updates
  const updateComplaintField = async (field, value) => {
    setEditedFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save all edited fields
  const saveComplaintUpdates = async () => {
    if (Object.keys(editedFields).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      // Update complaint via API with partial fields
      await maintenanceApi.updateComplaint(selectedComplaint.id, editedFields);
      
      // Update local state
      setComplaints(complaints.map(complaint => {
        if (complaint.id === selectedComplaint.id) {
          return { ...complaint, ...editedFields };
        }
        return complaint;
      }));
      
      // Update selected complaint in modal
      setSelectedComplaint({ ...selectedComplaint, ...editedFields });
      
      // Exit edit mode and clear edited fields
      setIsEditing(false);
      setEditedFields({});
      
      // Recalculate stats if status was updated
      if (editedFields.status) {
        updateStatsFromComplaints();
      }
    } catch (err) {
      console.error("Error updating complaint:", err);
      alert("Failed to update complaint. Please try again.");
    }
  };

  // Clear search and filter
  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("All");
  };

  return (
    <div className="bg-white shadow-md p-6 rounded-[20px] w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Complaints Management</h3>
      </div>
      
      {/* Stats display */}
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
        
        {(searchTerm || filterStatus !== "All") && (
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={clearFilters}
          >
            <FaTimes className="text-lg" />
          </button>
        )}
      </div>

      {/* Show error message if there is one */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Show loading spinner */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1360AB]"></div>
          <p className="mt-2 text-gray-500">Loading complaints...</p>
        </div>
      ) : (
        <>
          {/* Show complaints list or empty state */}
          {filteredComplaints.length > 0 ? (
            <div className="mt-4 space-y-4">
              {filteredComplaints.map(complaint => (
                <ComplaintItemM
                  key={complaint.id}
                  complaint={complaint}
                  onViewDetails={handleViewDetails}
                  onChangeStatus={changeStatus}
                  categoryBg={categoryBg}
                  statusColor={statusColor}
                  priorityColor={priorityColor}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <FaClipboardList className="mx-auto text-4xl text-gray-300" />
              <p className="mt-2 text-gray-500">No complaints match your filters</p>
              {(searchTerm || filterStatus !== "All") && (
                <button 
                  className="mt-2 text-blue-500 hover:underline"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Complaint Detail Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Complaint Details</h3>
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <button 
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit className="text-lg" />
                  </button>
                )}
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      defaultValue={selectedComplaint.title}
                      onChange={(e) => updateComplaintField('title', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="4"
                      defaultValue={selectedComplaint.description}
                      onChange={(e) => updateComplaintField('description', e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      className="w-full p-2 border rounded"
                      defaultValue={selectedComplaint.priority}
                      onChange={(e) => updateComplaintField('priority', e.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full p-2 border rounded"
                      defaultValue={selectedComplaint.status}
                      onChange={(e) => updateComplaintField('status', e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      className="px-4 py-2 bg-gray-300 rounded"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedFields({});
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                      onClick={saveComplaintUpdates}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsM;