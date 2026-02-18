import React from "react"

/**
 * CompactEventSection - Compact section card for event details
 * Uses tighter spacing and cleaner visual hierarchy
 *
 * @param {React.ReactNode} icon - Section icon (lucide-react)
 * @param {string} title - Section title
 * @param {string} accentColor - Accent color for icon
 * @param {React.ReactNode} headerAction - Optional action in header
 * @param {React.ReactNode} children - Section content
 */
export const CompactEventSection = ({
  icon: Icon,
  title,
  accentColor = "var(--color-primary)",
  headerAction,
  children,
  className = "",
  style = {},
}) => (
  <div
    className={className}
    style={{
      backgroundColor: "var(--color-bg-primary)",
      border: "1px solid var(--color-border-primary)",
      borderRadius: "var(--radius-card-sm)",
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--spacing-2)",
        padding: "var(--spacing-2) var(--spacing-3)",
        borderBottom: "1px solid var(--color-border-primary)",
        backgroundColor: "var(--color-bg-secondary)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-2)",
        }}
      >
        {Icon && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: "var(--radius-sm)",
              backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
              color: accentColor,
            }}
          >
            <Icon size={14} />
          </span>
        )}
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-heading)",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
          }}
        >
          {title}
        </span>
      </div>
      {headerAction}
    </div>
    <div style={{ padding: "var(--spacing-3)" }}>{children}</div>
  </div>
)

/**
 * CompactInfoRow - Compact label-value display row
 *
 * @param {string} label - Row label
 * @param {React.ReactNode} value - Row value
 * @param {string} valueColor - Optional value color
 */
export const CompactInfoRow = ({
  label,
  value,
  valueColor,
  style = {},
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "var(--spacing-2)",
      padding: "var(--spacing-1) 0",
      ...style,
    }}
  >
    <span
      style={{
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-muted)",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-medium)",
        color: valueColor || "var(--color-text-body)",
        textAlign: "right",
      }}
    >
      {value}
    </span>
  </div>
)

/**
 * EventMetaChip - Compact inline metadata chip
 *
 * @param {React.ReactNode} icon - Chip icon
 * @param {string} text - Chip text
 * @param {string} variant - success | warning | danger | info | default
 */
export const EventMetaChip = ({
  icon: Icon,
  text,
  variant = "default",
  style = {},
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: "var(--color-success-bg)",
          color: "var(--color-success)",
          borderColor: "transparent",
        }
      case "warning":
        return {
          backgroundColor: "var(--color-warning-bg)",
          color: "var(--color-warning)",
          borderColor: "transparent",
        }
      case "danger":
        return {
          backgroundColor: "var(--color-danger-bg)",
          color: "var(--color-danger)",
          borderColor: "transparent",
        }
      case "info":
        return {
          backgroundColor: "var(--color-info-bg)",
          color: "var(--color-info)",
          borderColor: "transparent",
        }
      default:
        return {
          backgroundColor: "var(--color-bg-secondary)",
          color: "var(--color-text-muted)",
          borderColor: "var(--color-border-primary)",
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-medium)",
        borderRadius: "var(--radius-badge)",
        border: `1px solid ${variantStyles.borderColor}`,
        backgroundColor: variantStyles.backgroundColor,
        color: variantStyles.color,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {Icon && <Icon size={12} style={{ flexShrink: 0 }} />}
      {text}
    </span>
  )
}

/**
 * CompactInfoGrid - Grid layout for multiple info items
 *
 * @param {Array} items - Array of { label, value, valueColor } objects
 * @param {number} columns - Number of columns (default: 2)
 */
export const CompactInfoGrid = ({
  items = [],
  columns = 2,
  style = {},
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: "var(--spacing-2) var(--spacing-4)",
      ...style,
    }}
  >
    {items.map((item, index) => (
      <div key={item.label || index}>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
            marginBottom: 2,
          }}
        >
          {item.label}
        </div>
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            color: item.valueColor || "var(--color-text-body)",
          }}
        >
          {item.value}
        </div>
      </div>
    ))}
  </div>
)

/**
 * SectionDivider - Visual divider with optional label
 *
 * @param {string} label - Optional divider label
 */
export const SectionDivider = ({ label }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-2)",
      margin: "var(--spacing-3) 0",
    }}
  >
    <div
      style={{
        flex: 1,
        height: 1,
        backgroundColor: "var(--color-border-primary)",
      }}
    />
    {label && (
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </span>
    )}
    <div
      style={{
        flex: 1,
        height: 1,
        backgroundColor: "var(--color-border-primary)",
      }}
    />
  </div>
)

/**
 * CompactFormField - Compact form field with inline label
 *
 * @param {string} label - Field label
 * @param {React.ReactNode} children - Input element
 * @param {string} hint - Optional hint text
 * @param {boolean} required - Show required indicator
 * @param {boolean} inline - Use inline layout
 */
export const CompactFormField = ({
  label,
  children,
  hint,
  required = false,
  inline = false,
  style = {},
}) => (
  <div
    style={{
      display: inline ? "flex" : "block",
      alignItems: inline ? "center" : undefined,
      gap: inline ? "var(--spacing-2)" : undefined,
      ...style,
    }}
  >
    {label && (
      <label
        style={{
          display: "block",
          fontSize: "var(--font-size-xs)",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--color-text-muted)",
          marginBottom: inline ? 0 : "var(--spacing-1)",
          minWidth: inline ? 100 : undefined,
          flexShrink: 0,
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--color-danger)", marginLeft: 2 }}>*</span>
        )}
      </label>
    )}
    <div style={{ flex: inline ? 1 : undefined }}>{children}</div>
    {hint && (
      <p
        style={{
          margin: "var(--spacing-1) 0 0 0",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-muted)",
        }}
      >
        {hint}
      </p>
    )}
  </div>
)

export default {
  CompactEventSection,
  CompactInfoRow,
  EventMetaChip,
  CompactInfoGrid,
  SectionDivider,
  CompactFormField,
}
