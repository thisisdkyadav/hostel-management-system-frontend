import { useState } from "react"
import { HiKey, HiUpload, HiTrash, HiExclamation, HiInformationCircle } from "react-icons/hi"
import UpdatePasswordForm from "../../components/admin/password/UpdatePasswordForm"
import BulkPasswordUpdateModal from "../../components/admin/password/BulkPasswordUpdateModal"
import RemovePasswordsByRoleModal from "../../components/admin/password/RemovePasswordsByRoleModal"
import { useAuth } from "../../contexts/AuthProvider"
import { adminApi } from "../../services/apiService"
import CommonSuccessModal from "../../components/common/CommonSuccessModal"
import UpdatePasswordHeader from "../../components/headers/UpdatePasswordHeader"
import Card from "../../components/common/Card"

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  maxWidthContainer: {
    maxWidth: '42rem',
    margin: '0 auto',
  },
  accessDeniedContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  accessDeniedBox: {
    backgroundColor: 'var(--color-danger-bg)',
    color: 'var(--color-danger-text)',
    padding: 'var(--spacing-6)',
    borderRadius: 'var(--radius-lg)',
  },
  accessDeniedTitle: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-bold)',
  },
  accessDeniedText: {
    marginTop: 'var(--spacing-2)',
  },
  accessDeniedFullContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg-tertiary)',
    padding: 'var(--spacing-4)',
  },
  accessDeniedCard: {
    backgroundColor: 'var(--color-bg-primary)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-md)',
    padding: 'var(--spacing-6)',
    maxWidth: '28rem',
    width: '100%',
    border: 'var(--border-1) solid var(--color-danger-border)',
  },
  accessDeniedIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-danger-bg)',
    color: 'var(--color-danger)',
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: 'var(--radius-full)',
    marginBottom: 'var(--spacing-6)',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  accessDeniedIcon: {
    height: 'var(--icon-xl)',
    width: 'var(--icon-xl)',
  },
  accessDeniedTitleFull: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 'var(--font-weight-bold)',
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-2)',
  },
  accessDeniedTextFull: {
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    marginBottom: 'var(--spacing-6)',
  },
  accessDeniedButtonWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  accessDeniedButton: {
    padding: 'var(--spacing-2-5) var(--spacing-5)',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    textDecoration: 'none',
    transition: 'var(--transition-colors)',
    boxShadow: 'var(--shadow-sm)',
    border: 'none',
    cursor: 'pointer',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-medium)',
  },
  accessDeniedButtonHover: {
    backgroundColor: 'var(--color-primary-hover)',
  },
  infoBanner: {
    backgroundColor: 'var(--color-info-bg)',
    color: 'var(--color-info-text)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-4)',
    marginBottom: 'var(--spacing-6)',
    display: 'flex',
    alignItems: 'flex-start',
  },
  infoIconWrapper: {
    flexShrink: 0,
    marginTop: '2px',
    marginRight: 'var(--spacing-3)',
  },
  infoIcon: {
    height: 'var(--icon-lg)',
    width: 'var(--icon-lg)',
  },
  infoText: {
    fontSize: 'var(--font-size-sm)',
  },
  cardBody: {
    padding: 'var(--spacing-6)',
  },
}

const UpdatePassword = () => {
  const { user } = useAuth()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showRemoveByRoleModal, setShowRemoveByRoleModal] = useState(false)
  const [updatedEmail, setUpdatedEmail] = useState("")
  const [bulkUpdateResults, setBulkUpdateResults] = useState(null)
  const [bulkSuccessModalOpen, setBulkSuccessModalOpen] = useState(false)
  const [removeByRoleResults, setRemoveByRoleResults] = useState(null)
  const [removeByRoleSuccessModalOpen, setRemoveByRoleSuccessModalOpen] = useState(false)

  if (user?.role !== "Admin") {
    return (
      <div style={styles.accessDeniedContainer}>
        <div style={styles.accessDeniedBox}>
          <h2 style={styles.accessDeniedTitle}>Access Denied</h2>
          <p style={styles.accessDeniedText}>You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const handlePasswordUpdate = async (email, newPassword) => {
    const confirmUpdate = window.confirm("Are you sure you want to update this user's password?")
    if (!confirmUpdate) return
    try {
      const response = await adminApi.updateUserPassword(email, newPassword)
      if (response.success) {
        setUpdatedEmail(email)
        setShowSuccessModal(true)
      } else {
        alert("Failed to update password. Please try again.")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      alert("An error occurred while updating the password. Please try again.")
    }
  }

  const handleBulkPasswordUpdate = async (passwordUpdates) => {
    try {
      const response = await adminApi.bulkUpdatePasswords(passwordUpdates)

      if (response) {
        setBulkUpdateResults(response.results)
        setBulkSuccessModalOpen(true)
        return true
      }
      return false
    } catch (error) {
      console.error("Error in bulk password update:", error)
      alert("An error occurred during bulk password update. Please try again.")
      return false
    }
  }

  const handleRemovePasswordsByRole = async (role) => {
    try {
      const response = await adminApi.removePasswordsByRole(role)

      if (response) {
        setRemoveByRoleResults({
          role,
          count: response.count,
          message: response.message,
        })
        setRemoveByRoleSuccessModalOpen(true)
        return true
      }
      return false
    } catch (error) {
      console.error("Error removing passwords by role:", error)
      throw error
    }
  }

  if (user?.role !== "Admin") {
    return (
      <div style={styles.accessDeniedFullContainer}>
        <div style={styles.accessDeniedCard}>
          <div style={styles.accessDeniedIconWrapper}>
            <HiExclamation style={styles.accessDeniedIcon} />
          </div>
          <h2 style={styles.accessDeniedTitleFull}>Access Denied</h2>
          <p style={styles.accessDeniedTextFull}>You do not have permission to access this page. Please contact an administrator if you believe this is an error.</p>
          <div style={styles.accessDeniedButtonWrapper}>
            <a href="/" style={styles.accessDeniedButton}>
              Return to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.pageContainer}>
      <UpdatePasswordHeader onBulkUpdate={() => setShowBulkModal(true)}
        onRemoveByRole={() => setShowRemoveByRoleModal(true)}
      />

      <div style={styles.contentContainer}>

        <div style={styles.maxWidthContainer}>
          <Card className="overflow-hidden">

            <Card.Body style={styles.cardBody}>
              <div style={styles.infoBanner}>
                <div style={styles.infoIconWrapper}>
                  <HiInformationCircle style={styles.infoIcon} />
                </div>
                <p style={styles.infoText}>As an administrator, you can reset the password for any user. This action cannot be undone, and the user will be required to use this new password for their next login.</p>
              </div>

              <UpdatePasswordForm onSubmit={handlePasswordUpdate} />
            </Card.Body>
          </Card>
        </div>

        {/* Single Password Update Success Modal */}
        {showSuccessModal && (
          <CommonSuccessModal show={showSuccessModal} onClose={() => setShowSuccessModal(false)}
            title="Password Updated Successfully"
            message="The password has been successfully updated. The user will need to use this new password for their next login."
            infoText={updatedEmail}
            infoIcon={HiKey}
            buttonText="Done"
          />
        )}

        {/* Bulk Password Update Modal */}
        <BulkPasswordUpdateModal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} onUpdate={handleBulkPasswordUpdate} />

        {/* Remove Passwords by Role Modal */}
        <RemovePasswordsByRoleModal isOpen={showRemoveByRoleModal} onClose={() => setShowRemoveByRoleModal(false)} onRemove={handleRemovePasswordsByRole} />

        {/* Bulk Update Success Modal */}
        {bulkSuccessModalOpen && bulkUpdateResults && (
          <CommonSuccessModal show={bulkSuccessModalOpen} onClose={() => setBulkSuccessModalOpen(false)}
            title="Bulk Password Update Completed"
            message={`Successfully updated ${bulkUpdateResults.successful.length} user passwords. ${bulkUpdateResults.failed.length > 0 ? `Failed to update ${bulkUpdateResults.failed.length} users.` : ""}`}
            infoText={`${bulkUpdateResults.successful.length} updates successful, ${bulkUpdateResults.failed.length} failed`}
            infoIcon={HiKey}
            buttonText="Done"
            width={600}
          />
        )}

        {/* Remove by Role Success Modal */}
        {removeByRoleSuccessModalOpen && removeByRoleResults && (
          <CommonSuccessModal show={removeByRoleSuccessModalOpen} onClose={() => setRemoveByRoleSuccessModalOpen(false)}
            title="Passwords Removed by Role"
            message={removeByRoleResults.message}
            infoText={`${removeByRoleResults.count} users with role: ${removeByRoleResults.role}`}
            infoIcon={HiTrash}
            buttonText="Done"
            width={600}
          />
        )}
      </div>
    </div>
  )
}

export default UpdatePassword
