import { useState } from "react"
import { HiExclamationCircle, HiShieldExclamation } from "react-icons/hi"
import Modal from "../../common/Modal"

const ROLES = ["Student", "Maintenance Staff", "Warden", "Associate Warden", "Admin", "Security", "Super Admin", "Hostel Supervisor", "Hostel Gate"]

const styles = {
  spaceY6: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  warningBanner: {
    backgroundColor: 'var(--color-warning-bg)',
    borderLeft: '4px solid var(--color-warning)',
    padding: 'var(--spacing-4)',
    marginBottom: 'var(--spacing-4)',
  },
  bannerFlex: {
    display: 'flex',
  },
  iconWrapper: {
    flexShrink: 0,
  },
  warningIcon: {
    height: 'var(--icon-lg)',
    width: 'var(--icon-lg)',
    color: 'var(--color-warning)',
  },
  bannerContent: {
    marginLeft: 'var(--spacing-3)',
  },
  bannerText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-warning-text)',
  },
  formGroup: {},
  label: {
    display: 'block',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-body)',
    marginBottom: 'var(--spacing-1)',
  },
  select: {
    marginTop: 'var(--spacing-1)',
    display: 'block',
    width: '100%',
    paddingLeft: 'var(--spacing-3)',
    paddingRight: 'var(--spacing-10)',
    paddingTop: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-2)',
    fontSize: 'var(--font-size-base)',
    borderColor: 'var(--color-border-input)',
    border: 'var(--border-1) solid var(--color-border-input)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    transition: 'var(--transition-colors)',
  },
  selectFocus: {
    borderColor: 'var(--color-primary)',
    boxShadow: 'var(--input-focus-ring)',
  },
  errorBanner: {
    backgroundColor: 'var(--color-danger-bg)',
    borderLeft: '4px solid var(--color-danger)',
    padding: 'var(--spacing-4)',
  },
  errorIcon: {
    height: 'var(--icon-lg)',
    width: 'var(--icon-lg)',
    color: 'var(--color-danger)',
  },
  errorText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-danger-text)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--spacing-3)',
    paddingTop: 'var(--spacing-4)',
    borderTop: 'var(--border-1) solid var(--color-border-light)',
  },
  cancelButton: {
    padding: 'var(--spacing-2) var(--spacing-4)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-body)',
    backgroundColor: 'var(--color-bg-primary)',
    border: 'var(--border-1) solid var(--color-border-input)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'var(--transition-colors)',
  },
  cancelButtonHover: {
    backgroundColor: 'var(--color-bg-tertiary)',
  },
  cancelButtonDisabled: {
    opacity: 'var(--opacity-disabled)',
    cursor: 'not-allowed',
  },
  proceedButton: {
    padding: 'var(--spacing-2) var(--spacing-4)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-white)',
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'var(--transition-colors)',
  },
  proceedButtonHover: {
    backgroundColor: 'var(--color-primary-hover)',
  },
  proceedButtonDisabled: {
    backgroundColor: 'var(--color-primary-muted)',
    cursor: 'not-allowed',
  },
  dangerBanner: {
    backgroundColor: 'var(--color-danger-bg)',
    borderLeft: '4px solid var(--color-danger)',
    padding: 'var(--spacing-4)',
    marginBottom: 'var(--spacing-4)',
  },
  dangerIcon: {
    height: 'var(--icon-lg)',
    width: 'var(--icon-lg)',
    color: 'var(--color-danger)',
  },
  dangerTitle: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-danger-text)',
  },
  dangerContent: {
    marginTop: 'var(--spacing-2)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-danger-text)',
  },
  confirmBox: {
    backgroundColor: 'var(--color-bg-tertiary)',
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-lg)',
  },
  confirmText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
  },
  confirmInput: {
    marginTop: 'var(--spacing-2)',
    display: 'block',
    width: '100%',
    padding: 'var(--spacing-2) var(--spacing-3)',
    border: 'var(--border-1) solid var(--color-border-input)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
    fontSize: 'var(--font-size-sm)',
    outline: 'none',
    backgroundColor: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    transition: 'var(--transition-colors)',
  },
  confirmInputFocus: {
    borderColor: 'var(--color-primary)',
    boxShadow: 'var(--input-focus-ring)',
  },
  dangerButton: {
    padding: 'var(--spacing-2) var(--spacing-4)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-white)',
    backgroundColor: 'var(--color-danger)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'var(--transition-colors)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  dangerButtonHover: {
    backgroundColor: 'var(--color-danger-hover)',
  },
  dangerButtonDisabled: {
    backgroundColor: 'var(--color-danger-light)',
    cursor: 'not-allowed',
  },
  spinner: {
    width: 'var(--spacing-4)',
    height: 'var(--spacing-4)',
    border: 'var(--border-2) solid var(--color-white)',
    borderTopColor: 'transparent',
    borderRadius: 'var(--radius-full)',
    animation: 'spin 1s linear infinite',
  },
}

const RemovePasswordsByRoleModal = ({ isOpen, onClose, onRemove }) => {
  const [selectedRole, setSelectedRole] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value)
    setError("")
  }

  const handleConfirmTextChange = (e) => {
    setConfirmText(e.target.value)
  }

  const handleProceed = () => {
    if (!selectedRole) {
      setError("Please select a role")
      return
    }
    setIsConfirming(true)
    setConfirmText("")
  }

  const handleConfirmRemove = async () => {
    setIsProcessing(true)
    setError("")

    try {
      await onRemove(selectedRole)
      onClose()
      setSelectedRole("")
      setConfirmText("")
      setIsConfirming(false)
    } catch (error) {
      setError(error.message || "Failed to remove passwords")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    setIsConfirming(false)
  }

  const handleClose = () => {
    setSelectedRole("")
    setConfirmText("")
    setIsConfirming(false)
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal title="Remove Passwords by Role" onClose={handleClose} width={500}>
      {!isConfirming ? (
        <div style={styles.spaceY6}>
          <div style={styles.warningBanner}>
            <div style={styles.bannerFlex}>
              <div style={styles.iconWrapper}>
                <HiExclamationCircle style={styles.warningIcon} />
              </div>
              <div style={styles.bannerContent}>
                <p style={styles.bannerText}>
                  This action will remove passwords for <strong>all users</strong> with the selected role. Users will need to use password recovery to regain access.
                </p>
              </div>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="role" style={styles.label}>
              Select Role
            </label>
            <select id="role" name="role" value={selectedRole} onChange={handleRoleChange} style={styles.select}>
              <option value="">Select a role</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <div style={styles.bannerFlex}>
                <div style={styles.iconWrapper}>
                  <HiExclamationCircle style={styles.errorIcon} />
                </div>
                <div style={styles.bannerContent}>
                  <p style={styles.errorText}>{error}</p>
                </div>
              </div>
            </div>
          )}

          <div style={styles.footer}>
            <button onClick={handleClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={!selectedRole}
              style={{
                ...styles.proceedButton,
                ...(!selectedRole ? styles.proceedButtonDisabled : {})
              }}
            >
              Proceed
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.spaceY6}>
          <div style={styles.dangerBanner}>
            <div style={styles.bannerFlex}>
              <div style={styles.iconWrapper}>
                <HiShieldExclamation style={styles.dangerIcon} />
              </div>
              <div style={styles.bannerContent}>
                <h3 style={styles.dangerTitle}>Warning: This action cannot be undone</h3>
                <div style={styles.dangerContent}>
                  <p>
                    You are about to remove passwords for <strong>all {selectedRole}</strong> users. They will need to use password recovery to regain access.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.confirmBox}>
            <p style={styles.confirmText}>
              Please type <strong>{selectedRole}</strong> below to confirm:
            </p>
            <input
              type="text"
              style={styles.confirmInput}
              placeholder={`Type "${selectedRole}" to confirm`}
              value={confirmText}
              onChange={handleConfirmTextChange}
            />
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <div style={styles.bannerFlex}>
                <div style={styles.iconWrapper}>
                  <HiExclamationCircle style={styles.errorIcon} />
                </div>
                <div style={styles.bannerContent}>
                  <p style={styles.errorText}>{error}</p>
                </div>
              </div>
            </div>
          )}

          <div style={styles.footer}>
            <button
              onClick={handleBack}
              disabled={isProcessing}
              style={{
                ...styles.cancelButton,
                ...(isProcessing ? styles.cancelButtonDisabled : {})
              }}
            >
              Back
            </button>
            <button
              onClick={handleConfirmRemove}
              disabled={isProcessing || confirmText !== selectedRole}
              style={{
                ...styles.dangerButton,
                ...(isProcessing || confirmText !== selectedRole ? styles.dangerButtonDisabled : {})
              }}
            >
              {isProcessing ? (
                <>
                  <div style={styles.spinner}></div>
                  Processing...
                </>
              ) : (
                "Remove Passwords"
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default RemovePasswordsByRoleModal
