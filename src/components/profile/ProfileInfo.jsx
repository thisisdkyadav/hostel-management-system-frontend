import React from "react"
import { FiEdit } from "react-icons/fi"

const ProfileInfo = ({ label, value, icon: Icon, isEditable }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", padding: "var(--spacing-3) 0", borderBottom: `var(--border-1) solid var(--color-border-light)`, }} className="last:border-0" >
      <div style={{ width: "var(--avatar-md)", height: "var(--avatar-md)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, }} >
        {Icon && <Icon style={{ height: "var(--icon-lg)", width: "var(--icon-lg)", color: "var(--color-primary)" }} />}
      </div>
      <div style={{ marginLeft: "var(--spacing-4)", flexGrow: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{label}</p>
          {isEditable && (
            <div style={{ display: "flex", alignItems: "center", fontSize: "var(--font-size-xs)", color: "var(--color-info)", }} >
              <FiEdit size={12} style={{ marginRight: "var(--spacing-1)" }} />
              <span>Editable</span>
            </div>
          )}
        </div>
        <p style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginTop: "var(--spacing-0-5)", fontSize: "var(--font-size-base)", }} >
          {value || "N/A"}
        </p>
      </div>
    </div>
  )
}

export default ProfileInfo
