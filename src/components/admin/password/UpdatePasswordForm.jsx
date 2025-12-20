import { useState } from "react"
import { HiMail, HiLockClosed, HiExclamationCircle, HiExclamation } from "react-icons/hi"

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  formGroup: {},
  label: {
    display: 'block',
    color: 'var(--color-text-body)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    marginBottom: 'var(--spacing-2)',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 'var(--spacing-3)',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-disabled)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    paddingTop: 'var(--spacing-3)',
    paddingBottom: 'var(--spacing-3)',
    paddingRight: 'var(--spacing-3)',
    paddingLeft: '2.75rem',
    border: 'var(--border-1) solid var(--color-border-input)',
    borderRadius: 'var(--radius-lg)',
    outline: 'none',
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-bg-primary)',
    transition: 'var(--transition-colors)',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: 'var(--color-primary)',
    boxShadow: 'var(--input-focus-ring)',
  },
  inputError: {
    borderColor: 'var(--color-danger)',
    backgroundColor: 'var(--color-danger-bg)',
  },
  inputErrorFocus: {
    boxShadow: 'var(--shadow-focus-danger)',
  },
  errorMessage: {
    color: 'var(--color-danger)',
    fontSize: 'var(--font-size-sm)',
    marginTop: 'var(--spacing-1-5)',
    display: 'flex',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: 'var(--spacing-1-5)',
    flexShrink: 0,
  },
  hintText: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-light)',
    marginTop: 'var(--spacing-1-5)',
    marginLeft: 'var(--spacing-1)',
  },
  footer: {
    paddingTop: 'var(--spacing-4)',
  },
  footerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-4)',
  },
  warningText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-light)',
    maxWidth: '22rem',
    order: 2,
  },
  warningContent: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  warningIcon: {
    height: 'var(--icon-lg)',
    width: 'var(--icon-lg)',
    color: 'var(--color-warning)',
    marginRight: 'var(--spacing-1-5)',
    flexShrink: 0,
    marginTop: '2px',
  },
  submitButton: {
    width: '100%',
    padding: 'var(--spacing-3) var(--spacing-6)',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-white)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'var(--transition-colors)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    order: 1,
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-medium)',
  },
  submitButtonHover: {
    backgroundColor: 'var(--color-primary-hover)',
    boxShadow: 'var(--shadow-md)',
  },
  submitButtonDisabled: {
    backgroundColor: 'var(--color-primary-muted)',
    cursor: 'not-allowed',
  },
  spinner: {
    width: 'var(--icon-lg)',
    height: 'var(--icon-lg)',
    border: 'var(--border-2) solid var(--color-white)',
    borderTopColor: 'transparent',
    borderRadius: 'var(--radius-full)',
    animation: 'spin 1s linear infinite',
    marginRight: 'var(--spacing-2)',
  },
}

const UpdatePasswordForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData.email, formData.newPassword)
      setFormData({
        email: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error in form submission:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInputStyle = (hasError) => ({
    ...styles.input,
    ...(hasError ? styles.inputError : {}),
  })

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Email Address</label>
        <div style={styles.inputWrapper}>
          <div style={styles.inputIcon}>
            <HiMail size={20} />
          </div>
          <input type="email" name="email" value={formData.email} onChange={handleChange} style={getInputStyle(errors.email)} placeholder="Enter user's email address" />
        </div>
        {errors.email && (
          <p style={styles.errorMessage}>
            <HiExclamationCircle style={styles.errorIcon} /> {errors.email}
          </p>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>New Password</label>
        <div style={styles.inputWrapper}>
          <div style={styles.inputIcon}>
            <HiLockClosed size={20} />
          </div>
          <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} style={getInputStyle(errors.newPassword)} placeholder="Enter new password" />
        </div>
        {errors.newPassword ? (
          <p style={styles.errorMessage}>
            <HiExclamationCircle style={styles.errorIcon} /> {errors.newPassword}
          </p>
        ) : (
          <p style={styles.hintText}>Password must be at least 6 characters long</p>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Confirm New Password</label>
        <div style={styles.inputWrapper}>
          <div style={styles.inputIcon}>
            <HiLockClosed size={20} />
          </div>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={getInputStyle(errors.confirmPassword)} placeholder="Confirm new password" />
        </div>
        {errors.confirmPassword && (
          <p style={styles.errorMessage}>
            <HiExclamationCircle style={styles.errorIcon} /> {errors.confirmPassword}
          </p>
        )}
      </div>

      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.warningText}>
            <p style={styles.warningContent}>
              <HiExclamation style={styles.warningIcon} />
              This action will immediately change the user's password
            </p>
          </div>

          <button type="submit" disabled={isSubmitting} style={{ ...styles.submitButton, ...(isSubmitting ? styles.submitButtonDisabled : {}) }} >
            {isSubmitting ? (
              <>
                <div style={styles.spinner}></div>
                Processing...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

export default UpdatePasswordForm
