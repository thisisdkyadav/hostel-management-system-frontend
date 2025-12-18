import React from "react"

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
        <select
          id="hostel-select"
          value={selectedHostel}
          onChange={(e) => onHostelChange(e.target.value)}
          style={{
            ...inputStyle,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-primary)"
            e.target.style.boxShadow = "var(--input-focus-ring)"
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border-input)"
            e.target.style.boxShadow = "none"
          }}
          required
        >
          <option value="">Select a hostel</option>
          {hostelList.map((hostel) => (
            <option key={hostel._id} value={hostel._id}>
              {hostel.name}
            </option>
          ))}
        </select>
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
        <textarea
          id="approval-information"
          value={approvalInformation}
          onChange={(e) => onApprovalInformationChange(e.target.value)}
          style={{
            ...inputStyle,
            minHeight: "80px",
            resize: "vertical",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-primary)"
            e.target.style.boxShadow = "var(--input-focus-ring)"
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border-input)"
            e.target.style.boxShadow = "none"
          }}
          placeholder="Enter approval information"
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
        <button onClick={onCancel} style={cancelButtonStyle}>
          Cancel
        </button>
        <button onClick={onSubmit} style={submitButtonStyle}>
          Confirm Approval
        </button>
      </div>
    </div>
  )
}

export default ApprovalForm
