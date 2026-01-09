import { X, Filter } from "lucide-react"

const styles = {
    container: {
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-2)",
        padding: "var(--spacing-1) var(--spacing-2)",
        flexWrap: "wrap",
    },
    label: {
        fontSize: "var(--font-size-2xs)",
        color: "var(--color-text-muted)",
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-1)",
    },
    chip: {
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--spacing-1)",
        padding: "var(--spacing-0-5) var(--spacing-2)",
        backgroundColor: "var(--color-primary-bg)",
        border: "var(--border-1) solid var(--color-primary-pale)",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--font-size-2xs)",
        color: "var(--color-primary)",
        fontWeight: "var(--font-weight-medium)",
    },
    chipText: {
        maxWidth: "120px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    clearButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "14px",
        height: "14px",
        padding: 0,
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        color: "var(--color-primary)",
        borderRadius: "var(--radius-full)",
    },
    clearAllButton: {
        padding: "var(--spacing-0-5) var(--spacing-2)",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        fontSize: "var(--font-size-2xs)",
        color: "var(--color-danger)",
        borderRadius: "var(--radius-sm)",
        fontWeight: "var(--font-weight-medium)",
    },
}

const FilterChips = ({ filters, columns, onClearFilter, onClearAll }) => {
    // Get active filters
    const activeFilters = Object.entries(filters).filter(
        ([key, value]) => value && value.selectedValues && value.selectedValues.length > 0
    )

    if (activeFilters.length === 0) return null

    const getColumnHeader = (colId) => {
        const col = columns.find((c) => c.accessorKey === colId)
        return col ? col.header : colId
    }

    const getFilterSummary = (filter) => {
        if (!filter.selectedValues) return ""
        const count = filter.selectedValues.length
        if (count === 1) return filter.selectedValues[0]
        return `${count} values`
    }

    return (
        <div style={styles.container}>
            <span style={styles.label}>
                <Filter size={8} />
                Filters:
            </span>
            {activeFilters.map(([colId, filter]) => (
                <div key={colId} style={styles.chip}>
                    <span style={styles.chipText}>
                        {getColumnHeader(colId)}: {getFilterSummary(filter)}
                    </span>
                    <button
                        style={styles.clearButton}
                        onClick={() => onClearFilter(colId)}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-pale)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                        <X size={8} />
                    </button>
                </div>
            ))}
            {activeFilters.length > 1 && (
                <button
                    style={styles.clearAllButton}
                    onClick={onClearAll}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-danger-bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                    Clear All
                </button>
            )}
        </div>
    )
}

export default FilterChips
