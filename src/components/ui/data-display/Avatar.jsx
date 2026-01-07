import React, { forwardRef, useState } from "react"
import { FaUser } from "react-icons/fa"

/**
 * Avatar Component - User avatar display
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text
 * @param {string} name - User name (for fallback initials)
 * @param {string} size - Size: xsmall, small, medium, large, xlarge, xxlarge
 * @param {string} shape - Shape: circle, square, rounded
 * @param {React.ReactNode} fallback - Custom fallback content
 * @param {boolean} showStatus - Show online/offline status
 * @param {string} status - Status: online, offline, away, busy
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Avatar = forwardRef(({
  src,
  alt = "",
  name = "",
  size = "medium",
  shape = "circle",
  fallback,
  showStatus = false,
  status = "offline",
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [imageError, setImageError] = useState(false)

  const sizes = {
    xsmall: { size: "24px", fontSize: "10px", statusSize: "6px" },
    small: { size: "32px", fontSize: "12px", statusSize: "8px" },
    medium: { size: "40px", fontSize: "14px", statusSize: "10px" },
    large: { size: "48px", fontSize: "16px", statusSize: "12px" },
    xlarge: { size: "64px", fontSize: "20px", statusSize: "14px" },
    xxlarge: { size: "96px", fontSize: "32px", statusSize: "16px" },
  }

  const shapes = {
    circle: "var(--radius-full)",
    square: "0",
    rounded: "var(--radius-md)",
  }

  const statusColors = {
    online: "var(--color-success)",
    offline: "var(--color-text-muted)",
    away: "var(--color-warning)",
    busy: "var(--color-danger)",
  }

  const currentSize = sizes[size] || sizes.medium

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return ""
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const containerStyles = {
    position: "relative",
    display: "inline-block",
    flexShrink: 0,
    ...style,
  }

  const avatarStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: currentSize.size,
    height: currentSize.size,
    borderRadius: shapes[shape] || shapes.circle,
    background: "var(--color-primary-bg)",
    color: "var(--color-primary)",
    fontSize: currentSize.fontSize,
    fontWeight: "var(--font-weight-medium)",
    overflow: "hidden",
  }

  const imageStyles = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }

  const statusStyles = {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: currentSize.statusSize,
    height: currentSize.statusSize,
    borderRadius: "var(--radius-full)",
    background: statusColors[status] || statusColors.offline,
    border: "2px solid var(--color-bg-primary)",
  }

  const renderContent = () => {
    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={alt || name}
          style={imageStyles}
          onError={() => setImageError(true)}
        />
      )
    }

    if (fallback) {
      return fallback
    }

    if (name) {
      return getInitials(name)
    }

    return <FaUser />
  }

  return (
    <div ref={ref} className={className} style={containerStyles} {...rest}>
      <div style={avatarStyles}>
        {renderContent()}
      </div>
      {showStatus && <span style={statusStyles} />}
    </div>
  )
})

Avatar.displayName = "Avatar"

// AvatarGroup - Group of avatars with overlap
export const AvatarGroup = forwardRef(({
  children,
  max = 5,
  size = "medium",
  className = "",
  style = {},
  ...rest
}, ref) => {
  const childArray = React.Children.toArray(children)
  const excess = childArray.length - max
  const visibleChildren = excess > 0 ? childArray.slice(0, max) : childArray

  const containerStyles = {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    ...style,
  }

  const itemStyles = {
    marginLeft: "-8px",
    border: "2px solid var(--color-bg-primary)",
    borderRadius: "var(--radius-full)",
  }

  return (
    <div ref={ref} className={className} style={containerStyles} {...rest}>
      {excess > 0 && (
        <Avatar
          size={size}
          name={`+${excess}`}
          style={{ ...itemStyles, background: "var(--color-bg-tertiary)", color: "var(--color-text-muted)" }}
        />
      )}
      {visibleChildren.reverse().map((child, index) => (
        <div key={index} style={itemStyles}>
          {React.cloneElement(child, { size: child.props.size || size })}
        </div>
      ))}
    </div>
  )
})

AvatarGroup.displayName = "AvatarGroup"

export default Avatar
