import React, { useState } from "react"
import { FaPrint } from "react-icons/fa"
import { Checkbox } from "@/components/ui"
import { Button, Modal } from "czero/react"

const PrintComplaints = ({ complaints }) => {
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [selectedPrintStatuses, setSelectedPrintStatuses] = useState([])
  const [printComplaints, setPrintComplaints] = useState([])

  // Available status options for printing
  const printStatusOptions = ["Pending", "In Progress", "Resolved"]

  // Open the print modal
  const handlePrint = () => {
    setSelectedPrintStatuses([]) // reset previous selections
    setShowPrintModal(true)
  }

  // Toggle a given status in the selectedPrintStatuses array
  const togglePrintStatus = (status) => {
    if (selectedPrintStatuses.includes(status)) {
      setSelectedPrintStatuses(selectedPrintStatuses.filter(s => s !== status))
    } else {
      setSelectedPrintStatuses([...selectedPrintStatuses, status])
    }
  }

  // Handle print confirmation
  const confirmPrint = () => {
    if (selectedPrintStatuses.length === 0) {
      alert("Please select at least one complaint status to print.")
      return
    }
    const filteredForPrint = complaints.filter(c => selectedPrintStatuses.includes(c.status))
    setPrintComplaints(filteredForPrint)
    setShowPrintModal(false)
    printComplaintsData(filteredForPrint)
  }

  // Function to compute location info as shown in ComplaintItemM
  const getLocationInfo = (complaint) =>
    complaint.hostel
      ? `Hostel: ${complaint.hostel}, Room: ${complaint.roomNumber || "N/A"}`
      : `Location: ${complaint.location}`

  // Function to print only the provided complaints data
  const printComplaintsData = (complaintsData) => {
    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow.document.write('<html><head><title>Complaints Report</title>')
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
    </style>`)
    printWindow.document.write('</head><body>')
    printWindow.document.write('<h2>Complaints Report</h2>')
    printWindow.document.write('<div style="overflow-x:auto;">') // For horizontal scrolling on small screens
    printWindow.document.write('<table>')
    printWindow.document.write('<thead><tr>' +
      '<th>ID</th>' +
      '<th>Date</th>' +
      '<th>Title</th>' +
      '<th>Description</th>' +
      '<th>Location Info</th>' +
      '<th>Category</th>' +
      '<th>Status</th>' +
      '</tr></thead>')
    printWindow.document.write('<tbody>')
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
        </tr>`
      )
    })
    printWindow.document.write('</tbody></table>')
    printWindow.document.write('</div>') // Close the overflow div
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <>
      {/* Print Button */}
      <Button variant="primary" size="sm" onClick={handlePrint} className="no-print">
        <FaPrint /><span style={{ display: 'none' }}>Print</span>
      </Button>

      {/* Print Modal */}
      {showPrintModal && (
        <Modal title="Select Complaint Statuses" onClose={() => setShowPrintModal(false)}
          width={450}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {printStatusOptions.map(status => (
                <Checkbox key={status} checked={selectedPrintStatuses.includes(status)} onChange={() => togglePrintStatus(status)} label={status} />
              ))}
            </div>

            <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', flexDirection: 'row', gap: 'var(--gap-sm)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button variant="secondary" size="md" onClick={() => setShowPrintModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={confirmPrint}>
                <FaPrint /> Print
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default PrintComplaints
