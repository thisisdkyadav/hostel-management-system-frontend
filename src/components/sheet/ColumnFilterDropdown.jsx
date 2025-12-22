import { useState, useRef, useEffect, useMemo } from "react"
import { FaFilter, FaCheck, FaSearch, FaTimes, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa"

const styles = {
    // Filter button in header
    filterButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "16px",
        height: "16px",
        padding: "0",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        color: "var(--color-text-light)",
        borderRadius: "var(--radius-xs)",
        transition: "var(--transition-colors)",
    },
    filterButtonActive: {
        color: "var(--color-primary)",
        backgroundColor: "var(--color-primary-bg)",
    },

    // Dropdown container
    dropdown: {
        position: "absolute",
        top: "100%",
        left: "0",
        marginTop: "var(--spacing-1)",
        minWidth: "220px",
        maxWidth: "280px",
        backgroundColor: "var(--color-bg-primary)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        border: "var(--border-1) solid var(--color-border-primary)",
        zIndex: 100,
        overflow: "hidden",
    },

    // Header
    dropdownHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--spacing-2) var(--spacing-3)",
        borderBottom: "var(--border-1) solid var(--color-border-light)",
        backgroundColor: "var(--color-bg-tertiary)",
    },
    dropdownTitle: {
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-semibold)",
        color: "var(--color-text-primary)",
    },
    closeButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "20px",
        height: "20px",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        color: "var(--color-text-muted)",
        borderRadius: "var(--radius-xs)",
    },

    // Sort section
    sortSection: {
        padding: "var(--spacing-2) var(--spacing-3)",
        borderBottom: "var(--border-1) solid var(--color-border-light)",
    },
    sortButton: {
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-2)",
        width: "100%",
        padding: "var(--spacing-1-5) var(--spacing-2)",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-body)",
        borderRadius: "var(--radius-sm)",
        transition: "var(--transition-colors)",
    },
    sortButtonActive: {
        backgroundColor: "var(--color-primary-bg)",
        color: "var(--color-primary)",
    },

    // Search
    searchContainer: {
        padding: "var(--spacing-2) var(--spacing-3)",
        borderBottom: "var(--border-1) solid var(--color-border-light)",
    },
    searchInputWrapper: {
        position: "relative",
    },
    searchIcon: {
        position: "absolute",
        left: "var(--spacing-2)",
        top: "50%",
        transform: "translateY(-50%)",
        color: "var(--color-text-muted)",
        fontSize: "10px",
    },
    searchInput: {
        width: "100%",
        padding: "var(--spacing-1-5) var(--spacing-2)",
        paddingLeft: "var(--spacing-6)",
        border: "var(--border-1) solid var(--color-border-input)",
        borderRadius: "var(--radius-sm)",
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-primary)",
        backgroundColor: "var(--color-bg-primary)",
        outline: "none",
    },

    // Values list
    valuesList: {
        maxHeight: "200px",
        overflowY: "auto",
        padding: "var(--spacing-1) 0",
    },
    selectAllRow: {
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-2)",
        padding: "var(--spacing-1-5) var(--spacing-3)",
        borderBottom: "var(--border-1) solid var(--color-border-light)",
        cursor: "pointer",
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--color-text-body)",
    },
    valueRow: {
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-2)",
        padding: "var(--spacing-1) var(--spacing-3)",
        cursor: "pointer",
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-body)",
        transition: "var(--transition-colors)",
    },
    valueRowHover: {
        backgroundColor: "var(--color-bg-hover)",
    },
    checkbox: {
        width: "14px",
        height: "14px",
        borderRadius: "var(--radius-xs)",
        border: "var(--border-1) solid var(--color-border-input)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        backgroundColor: "var(--color-bg-primary)",
    },
    checkboxChecked: {
        backgroundColor: "var(--color-primary)",
        borderColor: "var(--color-primary)",
    },
    checkIcon: {
        color: "var(--color-white)",
        fontSize: "8px",
    },
    valueText: {
        flex: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    valueCount: {
        fontSize: "var(--font-size-2xs)",
        color: "var(--color-text-muted)",
        backgroundColor: "var(--color-bg-tertiary)",
        padding: "0 var(--spacing-1)",
        borderRadius: "var(--radius-xs)",
    },

    // Footer
    footer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--spacing-2) var(--spacing-3)",
        borderTop: "var(--border-1) solid var(--color-border-light)",
        backgroundColor: "var(--color-bg-tertiary)",
    },
    clearButton: {
        padding: "var(--spacing-1) var(--spacing-2)",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-muted)",
        borderRadius: "var(--radius-sm)",
    },
    applyButton: {
        padding: "var(--spacing-1) var(--spacing-3)",
        border: "none",
        backgroundColor: "var(--color-primary)",
        cursor: "pointer",
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--color-white)",
        borderRadius: "var(--radius-sm)",
    },

    noResults: {
        padding: "var(--spacing-4)",
        textAlign: "center",
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-muted)",
    },
}

const ColumnFilterDropdown = ({
    column,
    columnId,
    data,
    isOpen,
    onClose,
    onApplyFilter,
    currentFilter,
    onSort,
    sortDirection,
}) => {
    const dropdownRef = useRef(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedValues, setSelectedValues] = useState(new Set())
    const [hoveredValue, setHoveredValue] = useState(null)

    // Get unique values with counts
    const uniqueValues = useMemo(() => {
        const valueCounts = {}
        data.forEach((row) => {
            let value = row[columnId]
            // Normalize value for display
            if (value === null || value === undefined || value === "") {
                value = "(Blank)"
            } else if (typeof value === "boolean") {
                value = value ? "Yes" : "No"
            } else {
                value = String(value)
            }
            valueCounts[value] = (valueCounts[value] || 0) + 1
        })

        return Object.entries(valueCounts)
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => a.value.localeCompare(b.value))
    }, [data, columnId])

    // Filter values by search
    const filteredValues = useMemo(() => {
        if (!searchTerm) return uniqueValues
        const lower = searchTerm.toLowerCase()
        return uniqueValues.filter((v) => v.value.toLowerCase().includes(lower))
    }, [uniqueValues, searchTerm])

    // Initialize selected values from current filter
    useEffect(() => {
        if (currentFilter?.selectedValues) {
            setSelectedValues(new Set(currentFilter.selectedValues))
        } else {
            // Select all by default
            setSelectedValues(new Set(uniqueValues.map((v) => v.value)))
        }
    }, [currentFilter, uniqueValues])

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onClose()
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const allSelected = selectedValues.size === uniqueValues.length
    const noneSelected = selectedValues.size === 0

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedValues(new Set())
        } else {
            setSelectedValues(new Set(uniqueValues.map((v) => v.value)))
        }
    }

    const toggleValue = (value) => {
        const newSet = new Set(selectedValues)
        if (newSet.has(value)) {
            newSet.delete(value)
        } else {
            newSet.add(value)
        }
        setSelectedValues(newSet)
    }

    const handleApply = () => {
        const isFiltered = selectedValues.size < uniqueValues.length
        onApplyFilter(columnId, {
            selectedValues: isFiltered ? Array.from(selectedValues) : null,
            searchTerm: "",
        })
        onClose()
    }

    const handleClear = () => {
        setSelectedValues(new Set(uniqueValues.map((v) => v.value)))
        setSearchTerm("")
        onApplyFilter(columnId, null)
        onClose()
    }

    return (
        <div ref={dropdownRef} style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={styles.dropdownHeader}>
                <span style={styles.dropdownTitle}>{column}</span>
                <button style={styles.closeButton} onClick={onClose}>
                    <FaTimes />
                </button>
            </div>

            {/* Sort options */}
            <div style={styles.sortSection}>
                <button
                    style={{
                        ...styles.sortButton,
                        ...(sortDirection === "asc" ? styles.sortButtonActive : {}),
                    }}
                    onClick={() => onSort(columnId, "asc")}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-hover)")}
                    onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                        sortDirection === "asc" ? "var(--color-primary-bg)" : "transparent")
                    }
                >
                    <FaSortAmountUp style={{ fontSize: "10px" }} />
                    Sort A → Z
                </button>
                <button
                    style={{
                        ...styles.sortButton,
                        ...(sortDirection === "desc" ? styles.sortButtonActive : {}),
                    }}
                    onClick={() => onSort(columnId, "desc")}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-hover)")}
                    onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                        sortDirection === "desc" ? "var(--color-primary-bg)" : "transparent")
                    }
                >
                    <FaSortAmountDown style={{ fontSize: "10px" }} />
                    Sort Z → A
                </button>
            </div>

            {/* Search */}
            <div style={styles.searchContainer}>
                <div style={styles.searchInputWrapper}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search values..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
            </div>

            {/* Select All */}
            <div style={styles.selectAllRow} onClick={toggleSelectAll}>
                <div style={{ ...styles.checkbox, ...(allSelected ? styles.checkboxChecked : {}) }}>
                    {allSelected && <FaCheck style={styles.checkIcon} />}
                </div>
                <span>(Select All)</span>
            </div>

            {/* Values list */}
            <div style={styles.valuesList}>
                {filteredValues.length === 0 ? (
                    <div style={styles.noResults}>No matching values</div>
                ) : (
                    filteredValues.map(({ value, count }) => (
                        <div
                            key={value}
                            style={{
                                ...styles.valueRow,
                                ...(hoveredValue === value ? styles.valueRowHover : {}),
                            }}
                            onClick={() => toggleValue(value)}
                            onMouseEnter={() => setHoveredValue(value)}
                            onMouseLeave={() => setHoveredValue(null)}
                        >
                            <div
                                style={{
                                    ...styles.checkbox,
                                    ...(selectedValues.has(value) ? styles.checkboxChecked : {}),
                                }}
                            >
                                {selectedValues.has(value) && <FaCheck style={styles.checkIcon} />}
                            </div>
                            <span style={styles.valueText}>{value}</span>
                            <span style={styles.valueCount}>{count}</span>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div style={styles.footer}>
                <button
                    style={styles.clearButton}
                    onClick={handleClear}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-body)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                >
                    Clear
                </button>
                <button
                    style={{
                        ...styles.applyButton,
                        ...(noneSelected ? { opacity: 0.5, cursor: "not-allowed" } : {}),
                    }}
                    onClick={handleApply}
                    disabled={noneSelected}
                >
                    Apply
                </button>
            </div>
        </div>
    )
}

export default ColumnFilterDropdown
