import React from "react"
import { FiEdit } from "react-icons/fi"
import { HStack, IconCircle, Text } from "hzero"

const ProfileInfo = ({ label, value, icon: Icon, isEditable }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", padding: "var(--spacing-3) 0", borderBottom: `var(--border-1) solid var(--color-border-light)`, }} className="last:border-0" >
      <IconCircle size="var(--avatar-md)" bg="brand">
        {Icon && <Icon style={{ height: "var(--icon-lg)", width: "var(--icon-lg)", color: "var(--color-primary)" }} />}
      </IconCircle>
      <div style={{ marginLeft: "var(--spacing-4)", flexGrow: 1 }}>
        <HStack gap="none" align="center" justify="between">
          <Text size="sm" color="muted">{label}</Text>
          {isEditable && (
            <HStack align="center" gap="none" size="xs" color="info">
              <FiEdit size={12} style={{ marginRight: "var(--spacing-1)" }} />
              <span>Editable</span>
            </HStack>
          )}
        </HStack>
        <Text weight="medium" color="secondary" size="base" style={{ marginTop: "var(--spacing-0-5)" }}>
          {value || "N/A"}
        </Text>
      </div>
    </div>
  )
}

export default ProfileInfo
