import React, { useState, useEffect } from "react";
import { FaFilter, FaSearch, FaTimes, FaClipboardList, FaPrint } from "react-icons/fa";
import apiService from "../../services/apiService";
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
  
  // Modal states for complaint details
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  // Statistics state - initialize with zeros
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  // New states for printing feature
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedPrintStatuses, setSelectedPrintStatuses] = useState([]);
  const [printComplaints, setPrintComplaints] = useState([]);

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
      const data = await apiService.maintenance.getComplaints({
        sort: 'date',
        order: 'desc'
      });
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
      const statsData = await apiService.maintenance.getStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Automatically update stats every time `complaints` changes.
  useEffect(() => {
    const newStats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === "Pending").length,
      inProgress: complaints.filter(c => c.status === "In Progress").length,
      resolved: complaints.filter(c => c.status === "Resolved").length
    };
    setStats(newStats);
  }, [complaints]);

  // Initial data fetch
  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, []);

  // Open complaint details modal
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  // Change complaint status using API then update local state
  const changeStatus = async (id, newStatus) => {
    try {
      await apiService.maintenance.updateComplaintStatus(id, newStatus);
      setComplaints(prevComplaints =>
        prevComplaints.map(complaint => 
          complaint.id === id ? { ...complaint, status: newStatus } : complaint
        )
      );
      // Update modal view if open
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating complaint status:", err);
      alert("Failed to update complaint status. Please try again.");
    }
  };

  // Clear search and filter values
  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("All");
  };

  // Instead of directly printing, open the print modal.
  const handlePrint = () => {
    setSelectedPrintStatuses([]); // reset previous selections
    setShowPrintModal(true);
  };

  // Toggle a given status in the selectedPrintStatuses array.
  const togglePrintStatus = (status) => {
    if (selectedPrintStatuses.includes(status)) {
      setSelectedPrintStatuses(selectedPrintStatuses.filter(s => s !== status));
    } else {
      setSelectedPrintStatuses([...selectedPrintStatuses, status]);
    }
  };

  // Called when user confirms print from the print modal.
  const confirmPrint = () => {
    if (selectedPrintStatuses.length === 0) {
      alert("Please select at least one complaint status to print.");
      return;
    }
    const filteredForPrint = complaints.filter(c => selectedPrintStatuses.includes(c.status));
    setPrintComplaints(filteredForPrint);
    setShowPrintModal(false);
    printComplaintsData(filteredForPrint);
  };

  // Function to print only the provided complaints data.
  const printComplaintsData = (complaintsData) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Complaints Report</title>');
    printWindow.document.write(`<style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #333; padding: 8px; text-align: left; }
      th { background: #f2f2f2; }
    </style>`);
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h2>Complaints Report</h2>');
    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr>' +
      '<th>ID</th>' +
      '<th>Title</th>' +
      '<th>Description</th>' +
      '<th>Location</th>' +
      '<th>Category</th>' +
      '<th>Status</th>' +
      '<th>Complaintee Name</th>' +
      '<th>Room</th>' +
      '<th>Hostel Name</th>' +
      '<th>Phone Number</th>' +
      '</tr></thead>');
    printWindow.document.write('<tbody>');
    complaintsData.forEach(complaint => {
      printWindow.document.write(
        `<tr>
          <td>${complaint.id}</td>
          <td>${complaint.title}</td>
          <td>${complaint.description}</td>
          <td>${complaint.location}</td>
          <td>${complaint.category}</td>
          <td>${complaint.status}</td>
          <td>${complaint.complainteeName || "N/A"}</td>
          <td>${complaint.room || "N/A"}</td>
          <td>${complaint.hostelName || "N/A"}</td>
          <td>${complaint.phoneNumber || "N/A"}</td>
        </tr>`
      );
    });
    printWindow.document.write('</tbody></table>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Styling objects for statuses (for print modal checkboxes can use similar styles)
  const printStatusOptions = ["Pending", "In Progress", "Resolved"];

  return (
    <div className="bg-white shadow-md p-6 rounded-[20px] w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Complaints Management</h3>
        <div className="flex space-x-2">
          {/* Print button visible alongside filter (exclude from print) */}
          <button 
            className="no-print bg-[#1360AB] text-white px-4 py-3 rounded-md text-sm flex items-center space-x-1"
            onClick={handlePrint}
          >
            <FaPrint className="text-sm" />
            <span>Print</span>
          </button>
        </div>
      </div>
      
      {/* Stats Display */}
      <ComplaintsStatsM stats={stats} />

      <h3 className="text-lg font-semibold mb-4">Recent Complaints</h3>
      
      {/* Search, Filter & Clear Controls */}
      <div className="mb-6 flex items-center space-x-2 no-print">
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
                  onClick={() => { setFilterStatus("All"); setShowFilterMenu(false); }}
                >
                  All
                </li>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => { setFilterStatus("Pending"); setShowFilterMenu(false); }}
                >
                  Pending
                </li>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => { setFilterStatus("In Progress"); setShowFilterMenu(false); }}
                >
                  In Progress
                </li>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => { setFilterStatus("Resolved"); setShowFilterMenu(false); }}
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 no-print">
          {error}
        </div>
      )}

      {/* Loading Spinner or Complaints List */}
      {loading ? (
        <div className="text-center py-8 no-print">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1360AB]"></div>
          <p className="mt-2 text-gray-500">Loading complaints...</p>
        </div>
      ) : (
        <>
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
            <div className="text-center py-10 no-print">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
          <div className="bg-white rounded-[20px] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Complaint Details</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowModal(false)}
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
      )}

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
          <div className="bg-white rounded-[20px] w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Select Complaint Statuses</h3>
            <div className="space-y-2">
              {printStatusOptions.map(status => (
                <label key={status} className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    checked={selectedPrintStatuses.includes(status)}
                    onChange={() => togglePrintStatus(status)}
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button 
                className="px-4 py-2 border rounded"
                onClick={() => setShowPrintModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-[#1360AB] text-white rounded"
                onClick={confirmPrint}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Section - only visible in print */}
      <div className="print-section" style={{ display: "none" }}>
        <h2>Complaints Report</h2>
        <table border="1" cellPadding="5" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Location</th>
              <th>Category</th>
              <th>Status</th>
              <th>Complaintee Name</th>
              <th>Room</th>
              <th>Hostel Name</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {printComplaints.map(complaint => (
              <tr key={complaint.id}>
                <td>{complaint.id}</td>
                <td>{complaint.title}</td>
                <td>{complaint.description}</td>
                <td>{complaint.location}</td>
                <td>{complaint.category}</td>
                <td>{complaint.status}</td>
                <td>{complaint.complainteeName || "N/A"}</td>
                <td>{complaint.room || "N/A"}</td>
                <td>{complaint.hostelName || "N/A"}</td>
                <td>{complaint.phoneNumber || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inline styles for print media */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-section {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ComplaintsM;