import React from "react"
import { Heading, Surface } from "hzero"

const ProfileCard = ({ title, children, actionButton }) => {
  return (
    <div style={{ backgroundColor: "var(--card-bg)", borderRadius: "var(--radius-xl)", border: `var(--border-1) solid var(--color-border-primary)`, overflow: "hidden", marginBottom: "var(--spacing-6)", }} >
      <div style={{ padding: "var(--spacing-4) var(--spacing-5)", backgroundColor: "var(--color-bg-tertiary)", borderBottom: `var(--border-1) solid var(--color-border-primary)`, display: "flex", justifyContent: "space-between", alignItems: "center", }} >
        <Heading as="h3" weight="medium" color="muted" size="base">
          {title}
        </Heading>
        {actionButton && actionButton}
      </div>
      <Surface padding={5}>{children}</Surface>
    </div>
  )
}

export default ProfileCard
