import React from "react"
import { Surface } from "@/components/ui"

const ProfileCard = ({ title, children, actionButton }) => {
  return (
    <div style={{ backgroundColor: "var(--card-bg)", borderRadius: "var(--radius-xl)", border: `var(--border-1) solid var(--color-border-primary)`, overflow: "hidden", marginBottom: "var(--spacing-6)", }} >
      <div style={{ padding: "var(--spacing-4) var(--spacing-5)", backgroundColor: "var(--color-bg-tertiary)", borderBottom: `var(--border-1) solid var(--color-border-primary)`, display: "flex", justifyContent: "space-between", alignItems: "center", }} >
        <h3 style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", fontSize: "var(--font-size-base)", }} >
          {title}
        </h3>
        {actionButton && actionButton}
      </div>
      <Surface padding={5}>{children}</Surface>
    </div>
  )
}

export default ProfileCard
