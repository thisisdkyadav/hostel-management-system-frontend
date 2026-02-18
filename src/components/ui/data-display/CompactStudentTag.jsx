import React from "react"
import { X, User } from "lucide-react"

/**
 * CompactStudentTag - Compact inline tag for displaying student info
 *
 * @param {string} name - Student name
 * @param {string} rollNumber - Roll number
 * @param {string} email - Student email (shown on hover)
 * @param {string} role - Student role (accused/accusing)
 * @param {function} onRemove - Optional remove handler
 * @param {boolean} selected - Show as selected
 * @param {function} onClick - Click handler
 */
const CompactStudentTag = ({
  name,
  rollNumber,
  email,
  role,
  onRemove,
  selected = false,
  onClick,
  className = "",
  style = {},
}) => {
  const getRoleColor = () => {
    if (role === "accused") return "var(--color-danger)"
    if (role === "accusing") return "var(--color-warning)"
    return "var(--color-primary)"
  }

  const getRoleBgColor = () => {
    if (role === "accused") return "var(--color-danger-bg)"
    if (role === "accusing") return "var(--color-warning-bg)"
    return "var(--color-primary-bg)"
  }

  return (
    <div
      className={className}
      onClick={onClick}
      title={email ? `${name} - ${email}` : name}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        borderRadius: "var(--radius-badge)",
        backgroundColor: selected ? getRoleBgColor() : "var(--color-bg-secondary)",
        border: `1px solid ${selected ? getRoleColor() : "var(--color-border-primary)"}`,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s ease",
        maxWidth: "100%",
        ...style,
      }}
    >
      <User
        size={12}
        style={{
          color: getRoleColor(),
          flexShrink: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {rollNumber && (
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-text-muted)",
              flexShrink: 0,
            }}
          >
            {rollNumber}
          </span>
        )}
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--color-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </span>
        {role && (
          <span
            style={{
              fontSize: "var(--font-size-2xs)",
              fontWeight: "var(--font-weight-medium)",
              color: getRoleColor(),
              backgroundColor: getRoleBgColor(),
              padding: "1px 4px",
              borderRadius: "var(--radius-xs)",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            {role === "accused" ? "ACD" : role === "accusing" ? "ACG" : role}
          </span>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            height: 16,
            padding: 0,
            border: "none",
            borderRadius: "var(--radius-full)",
            backgroundColor: "transparent",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            transition: "all 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-danger-bg)"
            e.currentTarget.style.color = "var(--color-danger)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.color = "var(--color-text-muted)"
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

/**
 * StudentTagGroup - Group of student tags with label
 */
export const StudentTagGroup = ({
  label,
  students = [],
  role,
  onRemove,
  emptyText = "None selected",
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          minHeight: 28,
        }}
      >
        {students.length === 0 ? (
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-muted)",
              fontStyle: "italic",
            }}
          >
            {emptyText}
          </span>
        ) : (
          students.map((student) => (
            <CompactStudentTag
              key={student.userId}
              name={student.name}
              rollNumber={student.rollNumber}
              email={student.email}
              role={role}
              onRemove={onRemove ? () => onRemove(student.userId) : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default CompactStudentTag
