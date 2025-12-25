import React, { useState } from "react"
import Modal from "../common/Modal"
import Button from "../common/Button"
import PasswordChangeSuccess from "./PasswordChangeSuccess"
import PasswordStrengthBar from "./PasswordStrengthBar"
import { authApi } from "../../services/apiService"

const ChangePasswordModal = ({ onClose, email }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required"
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = "New password must be different from current password"
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password"
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await authApi.changePassword(formData.currentPassword, formData.newPassword)
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })

      setShowSuccess(true)
    } catch (error) {
      setErrors({ form: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // If showing success message, render that instead of the form
  if (showSuccess) {
    return <PasswordChangeSuccess email={email} onClose={onClose} />
  }

  return (
    <Modal title="Change Your Password" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {errors.form && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)' }}>
            {errors.form}
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>
            Current Password
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v4m6 6a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input type="password" name="currentPassword" id="currentPassword" value={formData.currentPassword} onChange={handleChange} style={{ width: '100%', padding: 'var(--input-padding)', paddingLeft: 'calc(var(--spacing-10))', border: `var(--border-1) solid ${errors.currentPassword ? 'var(--color-danger)' : 'var(--input-border)'}`, backgroundColor: errors.currentPassword ? 'var(--color-danger-bg)' : 'var(--input-bg)', borderRadius: 'var(--radius-lg)', outline: 'none', fontSize: 'var(--font-size-base)', transition: 'var(--transition-all)' }} onFocus={(e) => {
              e.target.style.boxShadow = errors.currentPassword ? 'var(--shadow-focus-danger)' : 'var(--input-focus-ring)';
              e.target.style.borderColor = errors.currentPassword ? 'var(--color-danger)' : 'var(--input-border-focus)';
            }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = errors.currentPassword ? 'var(--color-danger)' : 'var(--input-border)';
              }}
              placeholder="Enter your current password"
            />
          </div>
          {errors.currentPassword && (
            <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-text)' }}>
              {errors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>
            New Password
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <input type="password" name="newPassword" id="newPassword" value={formData.newPassword} onChange={handleChange} style={{ width: '100%', padding: 'var(--input-padding)', paddingLeft: 'calc(var(--spacing-10))', border: `var(--border-1) solid ${errors.newPassword ? 'var(--color-danger)' : 'var(--input-border)'}`, backgroundColor: errors.newPassword ? 'var(--color-danger-bg)' : 'var(--input-bg)', borderRadius: 'var(--radius-lg)', outline: 'none', fontSize: 'var(--font-size-base)', transition: 'var(--transition-all)' }} onFocus={(e) => {
              e.target.style.boxShadow = errors.newPassword ? 'var(--shadow-focus-danger)' : 'var(--input-focus-ring)';
              e.target.style.borderColor = errors.newPassword ? 'var(--color-danger)' : 'var(--input-border-focus)';
            }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = errors.newPassword ? 'var(--color-danger)' : 'var(--input-border)';
              }}
              placeholder="Enter your new password"
            />
          </div>
          {errors.newPassword ? (
            <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-text)' }}>
              {errors.newPassword}
            </p>
          ) : (
            <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Password must be at least 6 characters long
            </p>
          )}

          <div style={{ marginTop: 'var(--spacing-2)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            <PasswordStrengthBar password={formData.newPassword} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>
            Confirm New Password
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={{ width: '100%', padding: 'var(--input-padding)', paddingLeft: 'calc(var(--spacing-10))', border: `var(--border-1) solid ${errors.confirmPassword ? 'var(--color-danger)' : 'var(--input-border)'}`, backgroundColor: errors.confirmPassword ? 'var(--color-danger-bg)' : 'var(--input-bg)', borderRadius: 'var(--radius-lg)', outline: 'none', fontSize: 'var(--font-size-base)', transition: 'var(--transition-all)' }} onFocus={(e) => {
              e.target.style.boxShadow = errors.confirmPassword ? 'var(--shadow-focus-danger)' : 'var(--input-focus-ring)';
              e.target.style.borderColor = errors.confirmPassword ? 'var(--color-danger)' : 'var(--input-border-focus)';
            }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = errors.confirmPassword ? 'var(--color-danger)' : 'var(--input-border)';
              }}
              placeholder="Confirm your new password"
            />
          </div>
          {errors.confirmPassword && (
            <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-text)' }}>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div style={{ paddingTop: 'var(--spacing-4)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting} variant="primary" size="medium" isLoading={isSubmitting}>
            {isSubmitting ? "Updating Password..." : "Update Password"}
          </Button>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @media (min-width: 640px) {
            .pt-4 > div {
              flex-direction: row;
              justify-content: space-between;
            }
            .pt-4 button {
              width: auto;
            }
          }
        `}</style>
      </form>
    </Modal>
  )
}

export default ChangePasswordModal
