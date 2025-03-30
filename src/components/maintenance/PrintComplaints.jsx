import React, { useState } from "react";
import { FaPrint, FaTimes } from "react-icons/fa";

const PrintComplaints = ({ complaints }) => {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedPrintStatuses, setSelectedPrintStatuses] = useState([]);
  const [printComplaints, setPrintComplaints] = useState([]);

  // Available status options for printing
  const printStatusOptions = ["Pending", "In Progress", "Resolved"];

  // Open the print modal
  const handlePrint = () => {
    setSelectedPrintStatuses([]); // reset previous selections
    setShowPrintModal(true);
  };

  // Toggle a given status in the selectedPrintStatuses array
  const togglePrintStatus = (status) => {
    if (selectedPrintStatuses.includes(status)) {
      setSelectedPrintStatuses(selectedPrintStatuses.filter(s => s !== status));
    } else {
      setSelectedPrintStatuses([...selectedPrintStatuses, status]);
    }
  };

  // Handle print confirmation
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

  // Function to compute location info as shown in ComplaintItemM
  const getLocationInfo = (complaint) =>
    complaint.hostel
      ? `Hostel: ${complaint.hostel}, Room: ${complaint.roomNumber || "N/A"}`
      : `Location: ${complaint.location}`;

  // Function to print only the provided complaints data
  const printComplaintsData = (complaintsData) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Complaints Report</title>');
    printWindow.document.write(`<style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #333; padding: 8px; text-align: left; }
      th { background: #f2f2f2; }
      @media print {
        @page { size: landscape; }
      }
      @media screen and (max-width: 768px) {
        th, td { padding: 4px; font-size: 12px; }
      }
    </style>`);
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h2>Complaints Report</h2>');
    printWindow.document.write('<div style="overflow-x:auto;">'); // For horizontal scrolling on small screens
    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr>' +
      '<th>ID</th>' +
      '<th>Date</th>' +
      '<th>Title</th>' +
      '<th>Description</th>' +
      '<th>Location Info</th>' +
      '<th>Category</th>' +
      '<th>Status</th>' +
      '<th>Priority</th>' +
      '</tr></thead>');
    printWindow.document.write('<tbody>');
    complaintsData.forEach(complaint => {
      printWindow.document.write(
        `<tr>
          <td>${complaint.id}</td>
          <td>${new Date(complaint.date).toLocaleDateString()}</td>
          <td>${complaint.title}</td>
          <td>${complaint.description}</td>
          <td>${getLocationInfo(complaint)}</td>
          <td>${complaint.category}</td>
          <td>${complaint.status}</td>
          <td>${complaint.priority}</td>
        </tr>`
      );
    });
    printWindow.document.write('</tbody></table>');
    printWindow.document.write('</div>'); // Close the overflow div
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <>
      {/* Print Button */}
      <button 
        className="no-print bg-[#1360AB] text-white px-3 py-2 md:px-4 md:py-3 rounded-md text-sm flex items-center space-x-1"
        onClick={handlePrint}
      >
        <FaPrint className="text-sm" />
        <span className="hidden sm:inline">Print</span>
      </button>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print p-4">
          <div className="bg-white rounded-[20px] w-full max-w-sm p-6 relative">
            <button 
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            
            <h3 className="text-lg font-semibold mb-4">Select Complaint Statuses</h3>
            <div className="space-y-2">
              {printStatusOptions.map(status => (
                <label key={status} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input 
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selectedPrintStatuses.includes(status)}
                    onChange={() => togglePrintStatus(status)}
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button 
                className="px-4 py-2 border rounded w-full sm:w-auto"
                onClick={() => setShowPrintModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-[#1360AB] text-white rounded w-full sm:w-auto"
                onClick={confirmPrint}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrintComplaints;