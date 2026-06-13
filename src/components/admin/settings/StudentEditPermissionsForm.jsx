import { useState, useEffect } from "react"
import { HiSave, HiLockClosed, HiPencil } from "react-icons/hi"
import { Switch } from "@/components/ui"
import { Button } from "czero/react"

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

  const allowedCount = localPermissions.filter((permission) => permission.allowed).length
  const allowedPercent = localPermissions.length > 0 ? Math.round((allowedCount / localPermissions.length) * 100) : 0

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Summary strip */}
      <div className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] px-4 py-2.5">
        <span className="text-sm text-[var(--color-text-body)]">
          <span className="font-semibold text-[var(--color-primary)]">{allowedCount}</span> of {localPermissions.length} fields editable by students
        </span>
        <div className="flex items-center gap-2">
          <div className="w-24 sm:w-32 h-1.5 rounded-[var(--radius-full)] bg-[var(--color-bg-muted)] overflow-hidden">
            <div className="h-full rounded-[var(--radius-full)] bg-[var(--color-primary)] transition-all duration-300" style={{ width: `${allowedPercent}%` }}></div>
          </div>
          <span className="text-xs text-[var(--color-text-muted)] tabular-nums">{allowedPercent}%</span>
        </div>
      </div>

      {/* Permission cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {localPermissions.map((permission) => (
          <div
            key={permission.field}
            className={`flex items-center justify-between gap-3 p-3 rounded-[var(--radius-lg)] border transition-[var(--transition-all)] ${permission.allowed
              ? "bg-[var(--color-primary-bg)] border-[var(--color-primary-pale)]"
              : "bg-[var(--color-bg-tertiary)] border-[var(--color-border-primary)]"}`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <span className="text-xl leading-none mt-0.5" aria-hidden="true">{getFieldIcon(permission.field)}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">{permission.label}</p>
                  {permission.allowed ? (
                    <HiPencil className="h-3 w-3 shrink-0 text-[var(--color-primary)]" title="Editable by students" />
                  ) : (
                    <HiLockClosed className="h-3 w-3 shrink-0 text-[var(--color-text-muted)]" title="Locked for students" />
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-snug">{getFieldDescription(permission.field)}</p>
              </div>
            </div>
            <Switch
              checked={permission.allowed}
              onChange={() => handleTogglePermission(permission.field)}
              disabled={isLoading}
            />
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading} disabled={isLoading}>
          {!isLoading && <HiSave size={20} />}
          {isLoading ? "Updating..." : "Update Permissions"}
        </Button>
      </div>
    </form>
  )
}

export default StudentEditPermissionsForm
