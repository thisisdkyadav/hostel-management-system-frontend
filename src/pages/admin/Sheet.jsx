import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table"
import { FaSearch, FaUser, FaFilter, FaColumns, FaTimes } from "react-icons/fa"
import { useGlobal } from "../../contexts/GlobalProvider"
import { sheetApi } from "../../services/sheetApi"
import ColumnFilterDropdown from "../../components/sheet/ColumnFilterDropdown"
import ColumnVisibilityPanel from "../../components/sheet/ColumnVisibilityPanel"
import FilterChips from "../../components/sheet/FilterChips"

// Styles
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "var(--color-bg-page)",
        overflow: "hidden",
    },

    // Toolbar
    toolbar: {
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-2)",
        padding: "var(--spacing-2) var(--spacing-3)",
        backgroundColor: "var(--color-bg-primary)",
        borderBottom: "var(--border-1) solid var(--color-border-primary)",
        flexShrink: 0,
    },
    searchContainer: {
        position: "relative",
        width: "220px",
    },
    searchIcon: {
        position: "absolute",
        left: "var(--spacing-2)",
        top: "50%",
        transform: "translateY(-50%)",
        color: "var(--color-text-muted)",
        fontSize: "var(--font-size-xs)",
    },
    searchInput: {
        width: "100%",
        padding: "var(--spacing-1-5) var(--spacing-2)",
        paddingLeft: "var(--spacing-7)",
        border: "var(--border-1) solid var(--color-border-input)",
        borderRadius: "var(--radius-sm)",
        backgroundColor: "var(--color-bg-secondary)",
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-primary)",
        outline: "none",
    },
    toolbarButton: {
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-1)",
        padding: "var(--spacing-1-5) var(--spacing-2)",
        border: "var(--border-1) solid var(--color-border-input)",
        borderRadius: "var(--radius-sm)",
        backgroundColor: "var(--color-bg-primary)",
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-body)",
        cursor: "pointer",
        transition: "var(--transition-colors)",
    },
    toolbarButtonActive: {
        backgroundColor: "var(--color-primary-bg)",
        borderColor: "var(--color-primary)",
        color: "var(--color-primary)",
    },
    infoText: {
        flex: 1,
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-muted)",
        textAlign: "right",
        paddingRight: "var(--spacing-2)",
    },

    // Filter bar
    filterBar: {
        backgroundColor: "var(--color-bg-secondary)",
        borderBottom: "var(--border-1) solid var(--color-border-light)",
        flexShrink: 0,
    },

    // Spreadsheet
    spreadsheetContainer: {
        flex: 1,
        overflow: "auto",
        backgroundColor: "var(--color-bg-primary)",
    },
    table: {
        width: "max-content",
        minWidth: "100%",
        borderCollapse: "collapse",
        fontSize: "var(--font-size-xs)",
    },
    thead: {
        position: "sticky",
        top: 0,
        zIndex: 10,
    },
    headerRow: {
        backgroundColor: "var(--color-bg-tertiary)",
    },
    headerCell: {
        padding: "var(--spacing-1) var(--spacing-2)",
        textAlign: "left",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--color-text-body)",
        fontSize: "var(--font-size-2xs)",
        borderRight: "var(--border-1) solid var(--color-border-primary)",
        borderBottom: "var(--border-1) solid var(--color-border-primary)",
        whiteSpace: "nowrap",
        userSelect: "none",
        minWidth: "80px",
        maxWidth: "200px",
        backgroundColor: "var(--color-bg-tertiary)",
        position: "relative",
    },
    headerCellContent: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--spacing-1)",
    },
    headerText: {
        flex: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    filterIcon: {
        fontSize: "12px",
        color: "var(--color-text-light)",
        cursor: "pointer",
        padding: "2px",
        borderRadius: "var(--radius-xs)",
    },
    filterIconActive: {
        color: "var(--color-primary)",
        backgroundColor: "var(--color-primary-bg)",
    },
    rowNumberHeader: {
        width: "40px",
        minWidth: "40px",
        maxWidth: "40px",
        textAlign: "center",
        backgroundColor: "var(--color-bg-tertiary)",
        color: "var(--color-text-muted)",
        position: "sticky",
        left: 0,
        zIndex: 11,
    },

    tbody: {
        backgroundColor: "var(--color-bg-primary)",
    },
    row: {
        borderBottom: "var(--border-1) solid var(--color-border-light)",
    },
    rowHover: {
        backgroundColor: "var(--color-bg-hover)",
    },
    cell: {
        padding: "var(--spacing-1) var(--spacing-2)",
        borderRight: "var(--border-1) solid var(--color-border-light)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "200px",
        color: "var(--color-text-body)",
        fontSize: "var(--font-size-xs)",
    },
    cellEmpty: {
        color: "var(--color-text-placeholder)",
    },
    rowNumberCell: {
        width: "40px",
        minWidth: "40px",
        maxWidth: "40px",
        textAlign: "center",
        backgroundColor: "var(--color-bg-tertiary)",
        color: "var(--color-text-muted)",
        fontSize: "var(--font-size-2xs)",
        fontWeight: "var(--font-weight-medium)",
        position: "sticky",
        left: 0,
        borderRight: "var(--border-1) solid var(--color-border-primary)",
    },

    // Status styles
    statusActive: { color: "var(--color-success-text)", fontWeight: "var(--font-weight-medium)" },
    statusInactive: { color: "var(--color-danger-text)", fontWeight: "var(--font-weight-medium)" },
    allocated: { color: "var(--color-success)" },
    vacant: { color: "var(--color-warning)" },

    avatar: {
        width: "18px",
        height: "18px",
        borderRadius: "var(--radius-full)",
        objectFit: "cover",
    },
    avatarPlaceholder: {
        width: "18px",
        height: "18px",
        borderRadius: "var(--radius-full)",
        backgroundColor: "var(--color-bg-muted)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-muted)",
        fontSize: "8px",
    },

    // Tabs bar
    tabsBar: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "var(--color-bg-tertiary)",
        borderTop: "var(--border-1) solid var(--color-border-primary)",
        padding: "0",
        flexShrink: 0,
        height: "36px",
        overflowX: "auto",
        overflowY: "hidden",
    },
    tabsList: {
        display: "flex",
        alignItems: "stretch",
        height: "100%",
        gap: "0",
    },
    tab: {
        display: "flex",
        alignItems: "center",
        padding: "0 var(--spacing-4)",
        height: "100%",
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--color-text-muted)",
        backgroundColor: "transparent",
        border: "none",
        borderRight: "var(--border-1) solid var(--color-border-primary)",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "var(--transition-colors)",
        minWidth: "100px",
        justifyContent: "center",
    },
    tabActive: {
        backgroundColor: "var(--color-bg-primary)",
        color: "var(--color-primary)",
        borderBottom: "var(--border-2) solid var(--color-primary)",
        fontWeight: "var(--font-weight-semibold)",
    },

    // States
    loadingContainer: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg-primary)",
    },
    spinner: {
        width: "24px",
        height: "24px",
        borderRadius: "var(--radius-full)",
        border: "var(--border-2) solid var(--color-border-primary)",
        borderTopColor: "var(--color-primary)",
        animation: "spin 1s linear infinite",
    },
    emptyMessage: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-muted)",
        fontSize: "var(--font-size-sm)",
        backgroundColor: "var(--color-bg-primary)",
    },
}

// Cell renderers
const renderProfileImage = (value) => {
    if (value) return <img src={value} alt="" style={styles.avatar} />
    return <span style={styles.avatarPlaceholder}><FaUser /></span>
}

const renderStatus = (value) => {
    if (!value) return "—"
    return <span style={value === "Active" ? styles.statusActive : styles.statusInactive}>{value}</span>
}

const renderAllocation = (value) => <span style={value ? styles.allocated : styles.vacant}>{value ? "Yes" : "No"}</span>

const renderBoolean = (value) => (value === null || value === undefined ? "—" : value ? "Yes" : "No")

const renderDate = (value) => {
    if (!value) return "—"
    return new Date(value).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
}

const Sheet = () => {
    const { hostelList } = useGlobal()
    const [selectedHostelId, setSelectedHostelId] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [sheetData, setSheetData] = useState(null)
    const [globalFilter, setGlobalFilter] = useState("")
    const [columnVisibility, setColumnVisibility] = useState({})
    const [columnFilters, setColumnFilters] = useState({})
    const [openFilterColumn, setOpenFilterColumn] = useState(null)
    const [showColumnsPanel, setShowColumnsPanel] = useState(false)
    const [hoveredRow, setHoveredRow] = useState(null)
    const tableRef = useRef(null)

    // Fetch data
    const fetchSheetData = async (hostelId) => {
        if (!hostelId) return
        try {
            setLoading(true)
            setError(null)
            const data = await sheetApi.getHostelSheetData(hostelId)
            setSheetData(data)

            // Hide ID columns by default
            const initialVisibility = {}
            data.columns?.forEach((col) => {
                if (col.hidden) initialVisibility[col.accessorKey] = false
            })
            setColumnVisibility(initialVisibility)
            setColumnFilters({})
            setOpenFilterColumn(null)
        } catch (err) {
            setError(err.message || "Failed to fetch data")
            setSheetData(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (selectedHostelId) fetchSheetData(selectedHostelId)
    }, [selectedHostelId])

    useEffect(() => {
        if (hostelList?.length > 0 && !selectedHostelId) {
            setSelectedHostelId(hostelList[0]._id)
        }
    }, [hostelList, selectedHostelId])

    // Data is already sorted by API: unit, room, bed ascending
    // No additional sorting needed - use API order directly
    const sortedData = useMemo(() => {
        return sheetData?.data || []
    }, [sheetData?.data])

    // Apply column filters
    const filteredData = useMemo(() => {
        let data = sortedData

        // Global filter
        if (globalFilter) {
            const lower = globalFilter.toLowerCase()
            data = data.filter((row) =>
                Object.values(row).some((val) =>
                    val !== null && val !== undefined && String(val).toLowerCase().includes(lower)
                )
            )
        }

        // Column filters
        Object.entries(columnFilters).forEach(([colId, filter]) => {
            if (filter?.selectedValues && filter.selectedValues.length > 0) {
                data = data.filter((row) => {
                    let value = row[colId]
                    if (value === null || value === undefined || value === "") {
                        value = "(Blank)"
                    } else if (typeof value === "boolean") {
                        value = value ? "Yes" : "No"
                    } else {
                        value = String(value)
                    }
                    return filter.selectedValues.includes(value)
                })
            }
        })

        return data
    }, [sortedData, globalFilter, columnFilters])

    // Build columns
    const columns = useMemo(() => {
        if (!sheetData?.columns) return []

        return sheetData.columns
            .filter((col) => columnVisibility[col.accessorKey] !== false)
            .map((col) => ({
                accessorKey: col.accessorKey,
                header: col.header,
                cell: ({ getValue }) => {
                    const value = getValue()
                    switch (col.accessorKey) {
                        case "studentProfileImage": return renderProfileImage(value)
                        case "roomStatus":
                        case "studentStatus": return renderStatus(value)
                        case "isAllocated": return renderAllocation(value)
                        case "isDayScholar": return renderBoolean(value)
                        case "admissionDate": return renderDate(value)
                        default:
                            if (value === null || value === undefined || value === "") {
                                return <span style={styles.cellEmpty}>—</span>
                            }
                            return String(value)
                    }
                },
            }))
    }, [sheetData?.columns, columnVisibility])

    // Table instance - no sorting
    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    // Filter handlers
    const handleApplyFilter = useCallback((columnId, filter) => {
        setColumnFilters((prev) => {
            if (!filter || !filter.selectedValues) {
                const { [columnId]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [columnId]: filter }
        })
    }, [])

    const handleClearFilter = useCallback((columnId) => {
        setColumnFilters((prev) => {
            const { [columnId]: _, ...rest } = prev
            return rest
        })
    }, [])

    const handleClearAllFilters = useCallback(() => {
        setColumnFilters({})
        setGlobalFilter("")
    }, [])

    const hasActiveFilters = Object.keys(columnFilters).length > 0 || globalFilter

    const selectedHostel = hostelList?.find((h) => h._id === selectedHostelId)

    return (
        <div style={styles.container}>
            {/* Toolbar */}
            <div style={styles.toolbar}>
                <div style={styles.searchContainer}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search all..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>

                <button
                    style={{
                        ...styles.toolbarButton,
                        ...(showColumnsPanel ? styles.toolbarButtonActive : {}),
                    }}
                    onClick={() => setShowColumnsPanel(!showColumnsPanel)}
                >
                    <FaColumns /> Columns
                </button>

                {hasActiveFilters && (
                    <button
                        style={{ ...styles.toolbarButton, color: "var(--color-danger)" }}
                        onClick={handleClearAllFilters}
                    >
                        <FaTimes /> Clear Filters
                    </button>
                )}

                <span style={styles.infoText}>
                    {selectedHostel?.name} — {filteredData.length} of {sortedData.length} rows
                </span>
            </div>

            {/* Filter chips */}
            {Object.keys(columnFilters).length > 0 && (
                <div style={styles.filterBar}>
                    <FilterChips
                        filters={columnFilters}
                        columns={sheetData?.columns || []}
                        onClearFilter={handleClearFilter}
                        onClearAll={handleClearAllFilters}
                    />
                </div>
            )}

            {/* Spreadsheet */}
            {loading ? (
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner} />
                </div>
            ) : error ? (
                <div style={styles.emptyMessage}>{error}</div>
            ) : !filteredData.length ? (
                <div style={styles.emptyMessage}>
                    {selectedHostelId
                        ? hasActiveFilters
                            ? "No rows match the current filters"
                            : "No data available"
                        : "Select a hostel from below"}
                </div>
            ) : (
                <div style={styles.spreadsheetContainer} ref={tableRef}>
                    <table style={styles.table}>
                        <thead style={styles.thead}>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} style={styles.headerRow}>
                                    <th style={{ ...styles.headerCell, ...styles.rowNumberHeader }}>#</th>
                                    {headerGroup.headers.map((header) => {
                                        const colId = header.column.id
                                        const hasFilter = columnFilters[colId]?.selectedValues?.length > 0

                                        return (
                                            <th key={header.id} style={styles.headerCell}>
                                                <div style={styles.headerCellContent}>
                                                    <span style={styles.headerText}>
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                    </span>
                                                    <FaFilter
                                                        style={{
                                                            ...styles.filterIcon,
                                                            ...(hasFilter || openFilterColumn === colId ? styles.filterIconActive : {}),
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setOpenFilterColumn(openFilterColumn === colId ? null : colId)
                                                        }}
                                                    />
                                                </div>

                                                {/* Filter dropdown */}
                                                {openFilterColumn === colId && (
                                                    <ColumnFilterDropdown
                                                        column={header.column.columnDef.header}
                                                        columnId={colId}
                                                        data={sortedData}
                                                        isOpen={true}
                                                        onClose={() => setOpenFilterColumn(null)}
                                                        onApplyFilter={handleApplyFilter}
                                                        currentFilter={columnFilters[colId]}
                                                    />
                                                )}
                                            </th>
                                        )
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody style={styles.tbody}>
                            {table.getRowModel().rows.map((row, idx) => (
                                <tr
                                    key={row.id}
                                    style={{
                                        ...styles.row,
                                        ...(hoveredRow === row.id ? styles.rowHover : {}),
                                    }}
                                    onMouseEnter={() => setHoveredRow(row.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td style={styles.rowNumberCell}>{idx + 1}</td>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} style={styles.cell}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tabs bar */}
            <div style={styles.tabsBar}>
                <div style={styles.tabsList}>
                    {hostelList?.map((hostel) => (
                        <button
                            key={hostel._id}
                            onClick={() => setSelectedHostelId(hostel._id)}
                            style={{
                                ...styles.tab,
                                ...(selectedHostelId === hostel._id ? styles.tabActive : {}),
                            }}
                            onMouseEnter={(e) => {
                                if (selectedHostelId !== hostel._id) {
                                    e.currentTarget.style.backgroundColor = "var(--color-bg-hover)"
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedHostelId !== hostel._id) {
                                    e.currentTarget.style.backgroundColor = "transparent"
                                }
                            }}
                        >
                            {hostel.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Column visibility panel */}
            <ColumnVisibilityPanel
                isOpen={showColumnsPanel}
                onClose={() => setShowColumnsPanel(false)}
                columns={sheetData?.columns || []}
                visibility={columnVisibility}
                onVisibilityChange={setColumnVisibility}
            />

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

export default Sheet
