import React, { useState } from "react"

import { Button, Field, Input, Label, Modal, Surface, Text, VStack } from "hzero"
import PasswordChangeSuccess from "./PasswordChangeSuccess"
import PasswordStrengthBar from "./PasswordStrengthBar"
import { authApi } from "../../service"

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
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
        {errors.form && <Surface bg="danger" padding={4} radius="lg" color="danger-text" size="sm">{errors.form}</Surface>}

        <Field label="Current Password" color="secondary" spacing={2}>
          <Input type="password" name="currentPassword" id="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="Enter your current password" error={errors.currentPassword} />
          {errors.currentPassword && <Text size="sm" color="danger-text" style={{ marginTop: "var(--spacing-1-5)" }}>{errors.currentPassword}</Text>}
        </Field>

        <Field label="New Password" color="secondary" spacing={2}>
          <Input type="password" name="newPassword" id="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Enter your new password" error={errors.newPassword} />
          {errors.newPassword ? (
            <Text size="sm" color="danger-text" style={{ marginTop: "var(--spacing-1-5)" }}>{errors.newPassword}</Text>
          ) : (
            <Text size="xs" color="muted" style={{ marginTop: "var(--spacing-1-5)" }}>Password must be at least 6 characters long</Text>
          )}

          <VStack gap={1} style={{ marginTop: "var(--spacing-2)" }}>
            <PasswordStrengthBar password={formData.newPassword} />
          </VStack>
        </Field>

        <Field label="Confirm New Password" color="secondary" spacing={2}>
          <Input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your new password" error={errors.confirmPassword} />
          {errors.confirmPassword && <Text size="sm" color="danger-text" style={{ marginTop: "var(--spacing-1-5)" }}>{errors.confirmPassword}</Text>}
        </Field>

        <div style={{ paddingTop: "var(--spacing-4)", display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)" }}>
          <Button type="button" onClick={onClose} variant="secondary" size="md">
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting} variant="primary" size="md" loading={isSubmitting}>
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
