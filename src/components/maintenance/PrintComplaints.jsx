import React, { useState } from "react"
import { FaPrint } from "react-icons/fa"
import Modal from "../common/Modal"
import Button from "../common/Button"

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
      '<th>Priority</th>' +
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
          <td>${complaint.priority}</td>
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
      <Button 
        variant="primary"
        size="small"
        onClick={handlePrint}
        icon={<FaPrint />}
        style={{ display: 'none' }}
        className="no-print"
      >
        <span style={{ display: 'none' }}>Print</span>
      </Button>
      <button 
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-white)',
          padding: 'var(--spacing-2) var(--spacing-3)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--gap-xs)',
          border: 'none',
          cursor: 'pointer',
          transition: 'var(--transition-all)',
          fontWeight: 'var(--font-weight-medium)'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-hover)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
        onClick={handlePrint}
        className="no-print"
      >
        <FaPrint style={{ fontSize: 'var(--font-size-sm)' }} />
        <span style={{ display: 'none' }}>Print</span>
      </button>

      {/* Print Modal */}
      {showPrintModal && (
        <Modal 
          title="Select Complaint Statuses" 
          onClose={() => setShowPrintModal(false)}
          width={450}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {printStatusOptions.map(status => (
                <label 
                  key={status} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-2)',
                    padding: 'var(--spacing-2)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'var(--transition-colors)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input 
                    type="checkbox"
                    style={{
                      width: 'var(--icon-md)',
                      height: 'var(--icon-md)',
                      cursor: 'pointer',
                      accentColor: 'var(--color-primary)'
                    }}
                    checked={selectedPrintStatuses.includes(status)}
                    onChange={() => togglePrintStatus(status)}
                  />
                  <span style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-body)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}>{status}</span>
                </label>
              ))}
            </div>
            
            <div style={{
              marginTop: 'var(--spacing-6)',
              display: 'flex',
              flexDirection: 'row',
              gap: 'var(--gap-sm)',
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}>
              <button 
                style={{
                  padding: 'var(--button-padding-md)',
                  border: `var(--border-1) solid var(--color-border-input)`,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer',
                  transition: 'var(--transition-all)',
                  minWidth: '100px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-primary)'}
                onClick={() => setShowPrintModal(false)}
              >
                Cancel
              </button>
              <button 
                style={{
                  padding: 'var(--button-padding-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-white)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'var(--transition-all)',
                  minWidth: '100px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
                onClick={confirmPrint}
              >
                Print
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default PrintComplaints