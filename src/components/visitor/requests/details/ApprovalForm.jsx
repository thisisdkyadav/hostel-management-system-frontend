import React from "react"
import { Select, Textarea } from "@/components/ui"
import { Button } from "czero/react"

const ApprovalForm = ({ selectedHostel, onHostelChange, approvalInformation, onApprovalInformationChange, onCancel, onSubmit, hostelList }) => {
  const containerStyle = {
    backgroundColor: "var(--color-success-bg)",
    border: `var(--border-1) solid var(--color-success-bg-light)`,
    padding: "var(--spacing-4)",
    borderRadius: "var(--radius-lg)",
    animation: "fadeIn 0.3s ease-in-out",
  }

  const headingStyle = {
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-success-text)",
    marginBottom: "var(--spacing-3)",
    fontSize: "var(--font-size-base)",
  }

  const labelStyle = {
    display: "block",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-secondary)",
    marginBottom: "var(--spacing-1)",
  }

  const inputStyle = {
    width: "100%",
    padding: "var(--spacing-2)",
    border: `var(--border-1) solid var(--color-border-input)`,
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
    outline: "none",
    transition: "var(--transition-colors)",
  }

  const buttonBaseStyle = {
    padding: "var(--spacing-2) var(--spacing-4)",
    borderRadius: "var(--radius-lg)",
    fontSize: "var(--font-size-base)",
    fontWeight: "var(--font-weight-medium)",
    border: "none",
    cursor: "pointer",
    transition: "var(--transition-colors)",
  }

  const cancelButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "var(--color-bg-muted)",
    color: "var(--color-text-secondary)",
  }

  const submitButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "var(--color-success-hover)",
    color: "var(--color-white)",
  }

  return (
    <div style={containerStyle}>
      <h3 style={headingStyle}>Approve Visitor Request</h3>

      {/* Hostel Selection */}
      <div style={{ marginBottom: "var(--spacing-3)" }}>
        <label htmlFor="hostel-select" style={labelStyle}>
          Assign Hostel <span style={{ color: "var(--color-danger)" }}>*</span>
        </label>
        <Select id="hostel-select" value={selectedHostel} onChange={(e) => onHostelChange(e.target.value)} placeholder="Select a hostel" options={hostelList.map((hostel) => ({ value: hostel._id, label: hostel.name }))} />
      </div>

      {/* Payment Amount (Optional) */}
      {/* <div style={{ marginBottom: "var(--spacing-4)" }}>
        <label htmlFor="payment-amount" style={labelStyle}>
          Payment Amount (Optional)
        </label>
        <input type="number" id="payment-amount" value={paymentAmount} onChange={(e) => onPaymentAmountChange(e.target.value)} style={inputStyle} placeholder="Enter amount (e.g., 1000)" min="0" />
      </div> */}

      {/* Approval Information */}
      <div style={{ marginBottom: "var(--spacing-4)" }}>
        <label htmlFor="approval-information" style={labelStyle}>
          Approval Information
        </label>
        <Textarea id="approval-information" value={approvalInformation} onChange={(e) => onApprovalInformationChange(e.target.value)} placeholder="Enter approval information" rows={3} resize="vertical" />
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
        <Button onClick={onCancel} variant="secondary" size="md">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="success" size="md">
          Confirm Approval
        </Button>
      </div>
    </div>
  )
}

export default ApprovalForm
