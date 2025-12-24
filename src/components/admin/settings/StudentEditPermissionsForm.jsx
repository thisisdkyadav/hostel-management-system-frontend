import { useState, useEffect } from "react"
import { HiSave, HiLockClosed, HiPencil } from "react-icons/hi"
import Button from "../../common/Button"

const getFieldDescription = (field) => {
  const descriptions = {
    profileImage: "Allow students to update their profile photo.",
    name: "Allow students to modify their displayed name.",
    dateOfBirth: "Allow students to update their date of birth.",
    address: "Allow students to change their address information.",
    gender: "Allow students to update their gender information.",
    familyMembers: "Allow students to add, edit, and manage their family members.",
    phone: "Allow students to update their phone number.",
    emergencyContact: "Allow students to update their emergency contact information.",
    bloodGroup: "Allow students to update their blood group information.",
    admissionDate: "Allow students to update their admission date information.",
  }
  return descriptions[field] || `Allow students to edit their ${field}.`
}

const getFieldIcon = (field) => {
  const icons = {
    profileImage: "📷",
    name: "👤",
    dateOfBirth: "🗓️",
    address: "🏠",
    gender: "⚧️",
    familyMembers: "👪",
    phone: "📞",
    emergencyContact: "🚨",
    bloodGroup: "🩸",
    admissionDate: "📅",
  }
  return icons[field] || "✏️"
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-4)",
  },
  itemsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-3)",
  },
  permissionCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "var(--spacing-4)",
    borderRadius: "var(--radius-lg)",
    transition: "var(--transition-all)",
  },
  permissionCardActive: {
    backgroundColor: "var(--color-primary-bg)",
    border: "var(--border-1) solid var(--color-primary-pale)",
  },
  permissionCardInactive: {
    backgroundColor: "var(--color-bg-tertiary)",
    border: "var(--border-1) solid var(--color-border-primary)",
  },
  contentWrapper: {
    display: "flex",
    alignItems: "flex-start",
    gap: "var(--spacing-3)",
  },
  icon: {
    fontSize: "var(--font-size-3xl)",
  },
  labelContainer: {
    display: "flex",
    flexDirection: "column",
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
  },
  label: {
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-secondary)",
  },
  badgeActive: {
    marginLeft: "var(--spacing-2)",
    padding: "var(--spacing-1) var(--spacing-2)",
    fontSize: "var(--font-size-xs)",
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--color-primary-bg)",
    color: "var(--color-primary)",
  },
  badgeInactive: {
    marginLeft: "var(--spacing-2)",
    padding: "var(--spacing-1) var(--spacing-2)",
    fontSize: "var(--font-size-xs)",
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--color-bg-muted)",
    color: "var(--color-text-tertiary)",
  },
  description: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-muted)",
    marginTop: "var(--spacing-1)",
  },
  statusActive: {
    marginTop: "var(--spacing-2)",
    display: "flex",
    alignItems: "center",
    fontSize: "var(--font-size-xs)",
    color: "var(--color-primary)",
  },
  statusInactive: {
    marginTop: "var(--spacing-2)",
    display: "flex",
    alignItems: "center",
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-muted)",
  },
  statusIcon: {
    marginRight: "var(--spacing-1)",
  },
  toggleLabel: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
  },
  toggleLabelDisabled: {
    opacity: "var(--opacity-disabled)",
    cursor: "not-allowed",
  },
  toggleInput: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
  toggleTrack: {
    width: "44px",
    height: "24px",
    borderRadius: "var(--radius-full)",
    position: "relative",
    transition: "var(--transition-all)",
  },
  toggleTrackActive: {
    backgroundColor: "var(--color-primary)",
  },
  toggleTrackInactive: {
    backgroundColor: "var(--color-bg-muted)",
  },
  toggleThumb: {
    position: "absolute",
    top: "2px",
    width: "20px",
    height: "20px",
    backgroundColor: "var(--color-white)",
    borderRadius: "var(--radius-full)",
    transition: "var(--transition-all)",
    border: "var(--border-1) solid var(--color-border-input)",
  },
  toggleThumbActive: {
    left: "22px",
  },
  toggleThumbInactive: {
    left: "2px",
  },
  submitContainer: {
    paddingTop: "var(--spacing-4)",
  },
  submitButton: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "var(--spacing-3) var(--spacing-4)",
    color: "var(--color-white)",
    fontWeight: "var(--font-weight-medium)",
    borderRadius: "var(--radius-lg)",
    border: "none",
    cursor: "pointer",
    transition: "var(--transition-all)",
  },
  spinner: {
    width: "var(--icon-lg)",
    height: "var(--icon-lg)",
    borderRadius: "var(--radius-full)",
    borderBottom: "var(--border-2) solid var(--color-white)",
    marginRight: "var(--spacing-2)",
    animation: "spin 1s linear infinite",
  },
  saveIcon: {
    marginRight: "var(--spacing-2)",
  },
}

const StudentEditPermissionsForm = ({ permissions, onUpdate, isLoading }) => {
  const [localPermissions, setLocalPermissions] = useState(permissions)

  useEffect(() => {
    setLocalPermissions(permissions)
  }, [permissions])

  const handleTogglePermission = (field) => {
    const updatedPermissions = localPermissions.map((permission) => (permission.field === field ? { ...permission, allowed: !permission.allowed } : permission))
    setLocalPermissions(updatedPermissions)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdate(localPermissions)
  }

  const getSubmitButtonStyle = () => {
    if (isLoading) return { ...styles.submitButton, backgroundColor: "var(--color-text-disabled)", cursor: "not-allowed" }
    return { ...styles.submitButton, backgroundColor: "var(--color-primary)" }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.itemsContainer}>
        {localPermissions.map((permission) => (
          <div key={permission.field} style={{ ...styles.permissionCard, ...(permission.allowed ? styles.permissionCardActive : styles.permissionCardInactive) }}>
            <div style={styles.contentWrapper}>
              <div style={styles.icon}>{getFieldIcon(permission.field)}</div>
              <div style={styles.labelContainer}>
                <div style={styles.labelRow}>
                  <p style={styles.label}>{permission.label}</p>
                  <span style={permission.allowed ? styles.badgeActive : styles.badgeInactive}>{permission.allowed ? "Editable" : "Locked"}</span>
                </div>
                <p style={styles.description}>{getFieldDescription(permission.field)}</p>
                <div style={permission.allowed ? styles.statusActive : styles.statusInactive}>
                  {permission.allowed ? (
                    <><HiPencil style={styles.statusIcon} />Students can modify this field</>
                  ) : (
                    <><HiLockClosed style={styles.statusIcon} />Students cannot modify this field</>
                  )}
                </div>
              </div>
            </div>
            <label style={{ ...styles.toggleLabel, ...(isLoading ? styles.toggleLabelDisabled : {}) }}>
              <input type="checkbox" checked={permission.allowed} onChange={() => handleTogglePermission(permission.field)} style={styles.toggleInput} disabled={isLoading} />
              <div style={{ ...styles.toggleTrack, ...(permission.allowed ? styles.toggleTrackActive : styles.toggleTrackInactive) }}>
                <div style={{ ...styles.toggleThumb, ...(permission.allowed ? styles.toggleThumbActive : styles.toggleThumbInactive) }}></div>
              </div>
            </label>
          </div>
        ))}
      </div>

      <div style={styles.submitContainer}>
        <Button type="submit" variant="primary" size="large" fullWidth isLoading={isLoading} disabled={isLoading} icon={!isLoading ? <HiSave size={20} /> : null}>
          {isLoading ? "Updating..." : "Update Permissions"}
        </Button>
      </div>
    </form>
  )
}

export default StudentEditPermissionsForm
