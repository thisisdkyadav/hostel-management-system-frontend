import React, { useState } from "react";
import { FaPrint } from "react-icons/fa";

const PrintComplaintsModal = ({ complaints }) => {
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

  // Function to print only the provided complaints data
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

  return (
    <>
      {/* Print Button */}
      <button 
        className="no-print bg-[#1360AB] text-white px-4 py-3 rounded-md text-sm flex items-center space-x-1"
        onClick={handlePrint}
      >
        <FaPrint className="text-sm" />
        <span>Print</span>
      </button>

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
    </>
  );
};

export default PrintComplaintsModal;