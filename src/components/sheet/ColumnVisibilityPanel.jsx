import { useState, useRef, useEffect } from "react"
import { FaTimes, FaEye, FaEyeSlash, FaCheck } from "react-icons/fa"

const styles = {
    // Panel container
    panel: {
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "280px",
        backgroundColor: "var(--color-bg-primary)",
        boxShadow: "var(--shadow-lg)",
        borderLeft: "var(--border-1) solid var(--color-border-primary)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
    },

    // Header
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--spacing-3) var(--spacing-4)",
        borderBottom: "var(--border-1) solid var(--color-border-primary)",
        backgroundColor: "var(--color-bg-tertiary)",
    },
    title: {
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-semibold)",
        color: "var(--color-text-primary)",
    },
    closeButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        color: "var(--color-text-muted)",
        borderRadius: "var(--radius-sm)",
    },

    // Actions
    actions: {
        display: "flex",
        gap: "var(--spacing-2)",
        padding: "var(--spacing-2) var(--spacing-4)",
        borderBottom: "var(--border-1) solid var(--color-border-light)",
    },
    actionButton: {
        flex: 1,
        padding: "var(--spacing-1-5) var(--spacing-2)",
        border: "var(--border-1) solid var(--color-border-input)",
        backgroundColor: "var(--color-bg-primary)",
        cursor: "pointer",
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-body)",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--spacing-1)",
    },

    // Category
    categoryLabel: {
        padding: "var(--spacing-2) var(--spacing-4)",
        fontSize: "var(--font-size-2xs)",
        fontWeight: "var(--font-weight-semibold)",
        color: "var(--color-text-muted)",
        textTransform: "uppercase",
        letterSpacing: "var(--letter-spacing-wide)",
        backgroundColor: "var(--color-bg-tertiary)",
        borderBottom: "var(--border-1) solid var(--color-border-light)",
    },

    // Columns list
    columnsList: {
        flex: 1,
        overflowY: "auto",
    },
    columnRow: {
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-2)",
        padding: "var(--spacing-2) var(--spacing-4)",
        cursor: "pointer",
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-body)",
        borderBottom: "var(--border-1) solid var(--color-border-light)",
        transition: "var(--transition-colors)",
    },
    columnRowHidden: {
        color: "var(--color-text-muted)",
        backgroundColor: "var(--color-bg-secondary)",
    },
    checkbox: {
        width: "16px",
        height: "16px",
        borderRadius: "var(--radius-xs)",
        border: "var(--border-1) solid var(--color-border-input)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        backgroundColor: "var(--color-bg-primary)",
        transition: "var(--transition-colors)",
    },
    checkboxChecked: {
        backgroundColor: "var(--color-primary)",
        borderColor: "var(--color-primary)",
    },
    checkIcon: {
        color: "var(--color-white)",
        fontSize: "10px",
    },
    columnName: {
        flex: 1,
    },
    visibilityIcon: {
        fontSize: "10px",
        color: "var(--color-text-light)",
    },

    // Overlay
    overlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        zIndex: 199,
    },
}

const ColumnVisibilityPanel = ({ isOpen, onClose, columns, visibility, onVisibilityChange }) => {
    const panelRef = useRef(null)
    const [hoveredColumn, setHoveredColumn] = useState(null)

    // Group columns by category
    const groupedColumns = columns.reduce((acc, col) => {
        const category = col.category || "other"
        if (!acc[category]) acc[category] = []
        acc[category].push(col)
        return acc
    }, {})

    const categoryOrder = ["location", "room", "allocation", "student", "ids", "other"]
    const sortedCategories = Object.keys(groupedColumns).sort(
        (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
    )

    if (!isOpen) return null

    const isVisible = (colKey) => visibility[colKey] !== false

    const toggleColumn = (colKey) => {
        onVisibilityChange({
            ...visibility,
            [colKey]: !isVisible(colKey),
        })
    }

    const showAll = () => {
        const newVisibility = {}
        columns.forEach((col) => {
            newVisibility[col.accessorKey] = true
        })
        onVisibilityChange(newVisibility)
    }

    const hideAll = () => {
        const newVisibility = {}
        columns.forEach((col) => {
            newVisibility[col.accessorKey] = false
        })
        onVisibilityChange(newVisibility)
    }

    const visibleCount = columns.filter((col) => isVisible(col.accessorKey)).length

    return (
        <>
            <div style={styles.overlay} onClick={onClose} />
            <div ref={panelRef} style={styles.panel}>
                {/* Header */}
                <div style={styles.header}>
                    <span style={styles.title}>
                        Columns ({visibleCount}/{columns.length})
                    </span>
                    <button style={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                    <button
                        style={styles.actionButton}
                        onClick={showAll}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-primary)")}
                    >
                        <FaEye /> Show All
                    </button>
                    <button
                        style={styles.actionButton}
                        onClick={hideAll}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-primary)")}
                    >
                        <FaEyeSlash /> Hide All
                    </button>
                </div>

                {/* Columns list by category */}
                <div style={styles.columnsList}>
                    {sortedCategories.map((category) => (
                        <div key={category}>
                            <div style={styles.categoryLabel}>{category}</div>
                            {groupedColumns[category].map((col) => {
                                const visible = isVisible(col.accessorKey)
                                return (
                                    <div
                                        key={col.accessorKey}
                                        style={{
                                            ...styles.columnRow,
                                            ...(!visible ? styles.columnRowHidden : {}),
                                            ...(hoveredColumn === col.accessorKey
                                                ? { backgroundColor: "var(--color-bg-hover)" }
                                                : {}),
                                        }}
                                        onClick={() => toggleColumn(col.accessorKey)}
                                        onMouseEnter={() => setHoveredColumn(col.accessorKey)}
                                        onMouseLeave={() => setHoveredColumn(null)}
                                    >
                                        <div
                                            style={{
                                                ...styles.checkbox,
                                                ...(visible ? styles.checkboxChecked : {}),
                                            }}
                                        >
                                            {visible && <FaCheck style={styles.checkIcon} />}
                                        </div>
                                        <span style={styles.columnName}>{col.header}</span>
                                        {visible ? (
                                            <FaEye style={styles.visibilityIcon} />
                                        ) : (
                                            <FaEyeSlash style={styles.visibilityIcon} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default ColumnVisibilityPanel
