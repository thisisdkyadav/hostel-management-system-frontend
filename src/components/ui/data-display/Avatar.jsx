import React, { forwardRef } from "react"
import { Avatar as C0Avatar } from "czero/react"

/**
 * Avatar — C0-backed compatibility adapter.
 *
 * Wraps czero's `Avatar` while preserving the legacy HMS API so existing call
 * sites keep working unchanged:
 *  - `name` (or `fallback`/`alt`) drives the initials, `src` the image
 *  - sizes xsmall | small | medium | large | xlarge | xxlarge
 *  - shapes circle | square | rounded
 *  - `showStatus` / `status` render the corner presence dot
 *
 * czero's sm/md are 32/40px, matching the legacy small/medium; the other steps
 * are driven by an explicit box size and font size.
 *
 * Prefer importing `Avatar` from `@/components/ui`.
 *
 * @param {string} src
 * @param {string} alt
 * @param {string} name - used for the fallback initials
 * @param {"xsmall"|"small"|"medium"|"large"|"xlarge"|"xxlarge"} size
 * @param {"circle"|"square"|"rounded"} shape
 * @param {boolean} showStatus
 * @param {"online"|"offline"|"away"|"busy"} status
 * @param {string} className
 * @param {object} style
 */
const SIZE = {
  xsmall: { box: "24px", font: "10px", dot: "6px", cz: "sm" },
  small: { box: "32px", font: "12px", dot: "8px", cz: "sm" },
  medium: { box: "40px", font: "14px", dot: "10px", cz: "md" },
  large: { box: "48px", font: "16px", dot: "12px", cz: "md" },
  xlarge: { box: "64px", font: "20px", dot: "14px", cz: "lg" },
  xxlarge: { box: "96px", font: "32px", dot: "16px", cz: "lg" },
}
const SHAPE = { circle: "var(--radius-full)", square: "0", rounded: "var(--radius-md)" }
const STATUS_COLOR = {
  online: "var(--color-success)",
  offline: "var(--color-text-muted)",
  away: "var(--color-warning)",
  busy: "var(--color-danger)",
}

const Avatar = forwardRef(
  (
    { src, alt = "", name = "", size = "medium", shape = "circle", fallback, showStatus = false, status = "offline", className = "", style = {}, ...rest },
    ref
  ) => {
    const s = SIZE[size] || SIZE.medium

    const avatar = (
      <C0Avatar
        ref={ref}
        src={src}
        alt={alt}
        fallback={fallback || name || alt}
        size={s.cz}
        className={className}
        // explicit box/font keeps every legacy step exact, and shape is a radius
        style={{ width: s.box, height: s.box, fontSize: s.font, borderRadius: SHAPE[shape] || SHAPE.circle, ...style }}
        {...rest}
      />
    )

    if (!showStatus) return avatar

    return (
      <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
        {avatar}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: s.dot,
            height: s.dot,
            borderRadius: "var(--radius-full)",
            background: STATUS_COLOR[status] || STATUS_COLOR.offline,
            border: "2px solid var(--color-bg-primary)",
            boxSizing: "content-box",
          }}
        />
      </span>
    )
  }
)

Avatar.displayName = "Avatar"

// AvatarGroup — group of avatars with overlap. Unchanged from the legacy
// implementation; it composes the Avatar above, so it inherits czero's styling.
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

  const itemStyles = {
    marginLeft: "-8px",
    border: "2px solid var(--color-bg-primary)",
    borderRadius: "var(--radius-full)",
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "flex-end", ...style }}
      {...rest}
    >
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
