import React from "react"
import { getMediaUrl } from "../../utils/mediaUtils"
const ProfileAvatar = ({ user, size = "medium" }) => {
  const getInitials = (name) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const sizeStyles = {
    small: {
      width: "var(--avatar-sm)",
      height: "var(--avatar-sm)",
      fontSize: "var(--font-size-sm)",
    },
    medium: {
      width: "var(--avatar-xl)",
      height: "var(--avatar-xl)",
      fontSize: "var(--font-size-lg)",
    },
    large: {
      width: "var(--avatar-3xl)",
      height: "var(--avatar-3xl)",
      fontSize: "var(--font-size-2xl)",
    },
  }

  if (user?.profileImage) {
    return (
      <div style={{ ...sizeStyles[size], borderRadius: "var(--radius-avatar)", overflow: "hidden", backgroundColor: "var(--color-bg-muted)", flexShrink: 0, }} >
        <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s avatar`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    )
  }

  const getColorStyle = (name) => {
    if (!name)
      return {
        backgroundColor: "var(--color-primary-bg)",
        color: "var(--color-primary)",
      }

    const colorOptions = [
      { backgroundColor: "var(--color-primary-bg)", color: "var(--color-primary)" },
      { backgroundColor: "var(--color-purple-light-bg)", color: "var(--color-purple-text)" },
      { backgroundColor: "var(--color-success-bg)", color: "var(--color-success-text)" },
      { backgroundColor: "var(--color-warning-bg)", color: "var(--color-warning-text)" },
      { backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)" },
    ]

    const index = name.length % colorOptions.length
    return colorOptions[index]
  }

  return (
    <div style={{ ...sizeStyles[size], ...getColorStyle(user?.name), borderRadius: "var(--radius-avatar)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--font-weight-bold)", flexShrink: 0, }} >
      {getInitials(user?.name || "User")}
    </div>
  )
}

export default ProfileAvatar
