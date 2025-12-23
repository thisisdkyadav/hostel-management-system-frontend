import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { FaSearch, FaUser, FaFilter, FaColumns, FaTimes, FaChartBar } from "react-icons/fa"
import { useGlobal } from "../../contexts/GlobalProvider"
import { sheetApi } from "../../services/sheetApi"
import ColumnFilterDropdown from "../../components/sheet/ColumnFilterDropdown"
import ColumnVisibilityPanel from "../../components/sheet/ColumnVisibilityPanel"
import FilterChips from "../../components/sheet/FilterChips"

// Row height for virtualization
const ROW_HEIGHT = 28
const SUMMARY_TAB_ID = "__summary__"

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
        overflow: "hidden",
        backgroundColor: "var(--color-bg-primary)",
        display: "flex",
        flexDirection: "column",
    },
    tableWrapper: {
        flex: 1,
        overflow: "auto",
        position: "relative",
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
        display: "flex",
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
        display: "flex",
        alignItems: "center",
        height: `${ROW_HEIGHT}px`,
        boxSizing: "border-box",
        flex: "1 0 120px",
    },
    headerCellContent: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--spacing-1)",
        width: "100%",
    },
    headerText: {
        flex: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    filterIcon: {
        fontSize: "16px",
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
        width: "50px",
        minWidth: "50px",
        maxWidth: "50px",
        flex: "0 0 50px",
        textAlign: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg-tertiary)",
        color: "var(--color-text-muted)",
        position: "sticky",
        left: 0,
        zIndex: 11,
    },

    // Virtual body container
    virtualBody: {
        position: "relative",
        width: "100%",
    },
    row: {
        display: "flex",
        borderBottom: "var(--border-1) solid var(--color-border-light)",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: `${ROW_HEIGHT}px`,
    },
    cell: {
        padding: "var(--spacing-1) var(--spacing-2)",
        borderRight: "var(--border-1) solid var(--color-border-light)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: "var(--color-text-body)",
        fontSize: "var(--font-size-xs)",
        display: "flex",
        alignItems: "center",
        height: `${ROW_HEIGHT}px`,
        boxSizing: "border-box",
        flex: "1 0 120px",
        minWidth: "80px",
        maxWidth: "200px",
    },
    cellEmpty: {
        color: "var(--color-text-placeholder)",
    },
    rowNumberCell: {
        width: "50px",
        minWidth: "50px",
        maxWidth: "50px",
        flex: "0 0 50px",
        textAlign: "center",
        justifyContent: "center",
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
        gap: "var(--spacing-1)",
    },
    tabActive: {
        backgroundColor: "var(--color-bg-primary)",
        color: "var(--color-primary)",
        borderBottom: "var(--border-2) solid var(--color-primary)",
        fontWeight: "var(--font-weight-semibold)",
    },
    tabSummary: {
        backgroundColor: "var(--color-primary-bg)",
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

    // Summary table styles
    summaryTable: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "var(--font-size-xs)",
    },
    summaryHeaderRow: {
        backgroundColor: "var(--color-bg-tertiary)",
    },
    summaryHeaderCell: {
        padding: "var(--spacing-1-5) var(--spacing-2)",
        textAlign: "center",
        fontWeight: "var(--font-weight-semibold)",
        color: "var(--color-text-primary)",
        fontSize: "var(--font-size-xs)",
        borderRight: "var(--border-1) solid var(--color-border-primary)",
        borderBottom: "var(--border-2) solid var(--color-border-primary)",
        whiteSpace: "nowrap",
    },
    summaryLabelHeader: {
        textAlign: "left",
        minWidth: "100px",
    },
    summaryTotalHeader: {
        backgroundColor: "var(--color-primary-bg)",
        color: "var(--color-primary)",
    },
    summaryRow: {
        borderBottom: "var(--border-1) solid var(--color-border-light)",
    },
    summaryTotalRow: {
        backgroundColor: "var(--color-bg-tertiary)",
        fontWeight: "var(--font-weight-semibold)",
    },
    summaryCell: {
        padding: "var(--spacing-1) var(--spacing-2)",
        textAlign: "center",
        color: "var(--color-text-body)",
        fontSize: "var(--font-size-xs)",
        borderRight: "var(--border-1) solid var(--color-border-light)",
    },
    summaryLabelCell: {
        textAlign: "left",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--color-text-primary)",
        backgroundColor: "var(--color-bg-secondary)",
    },
    summaryTotalCell: {
        fontWeight: "var(--font-weight-semibold)",
        color: "var(--color-primary)",
        backgroundColor: "var(--color-primary-bg)",
    },
    summaryNumberCell: {
        fontFamily: "var(--font-family-mono, monospace)",
        fontWeight: "var(--font-weight-medium)",
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

// Summary Table Component
const SummaryTable = ({ data, onHostelClick }) => {
    if (!data || !data.columns || !data.data) {
        return <div style={styles.emptyMessage}>No summary data available</div>
    }

    const { columns, data: rows } = data

    return (
        <div style={{ ...styles.spreadsheetContainer, overflow: "auto" }}>
            <table style={styles.summaryTable}>
                <thead>
                    <tr style={styles.summaryHeaderRow}>
                        {columns.map((col) => {
                            const isLabel = col.category === "label"
                            const isTotal = col.category === "total"
                            return (
                                <th
                                    key={col.accessorKey}
                                    style={{
                                        ...styles.summaryHeaderCell,
                                        ...(isLabel ? styles.summaryLabelHeader : {}),
                                        ...(isTotal ? styles.summaryTotalHeader : {}),
                                    }}
                                >
                                    {col.header}
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIdx) => {
                        const isLastRow = row.degree === "Total"
                        return (
                            <tr
                                key={rowIdx}
                                className="summary-row"
                                style={{
                                    ...styles.summaryRow,
                                    ...(isLastRow ? styles.summaryTotalRow : {}),
                                }}
                            >
                                {columns.map((col) => {
                                    const value = row[col.accessorKey]
                                    const isLabel = col.category === "label"
                                    const isTotal = col.category === "total"
                                    const isHostel = col.category === "hostel"

                                    return (
                                        <td
                                            key={col.accessorKey}
                                            style={{
                                                ...styles.summaryCell,
                                                ...(isLabel ? styles.summaryLabelCell : {}),
                                                ...(isTotal ? styles.summaryTotalCell : {}),
                                                ...(!isLabel ? styles.summaryNumberCell : {}),
                                                ...(isHostel && col.hostelId ? { cursor: "pointer" } : {}),
                                            }}
                                            onClick={() => {
                                                if (isHostel && col.hostelId) {
                                                    onHostelClick(col.hostelId)
                                                }
                                            }}
                                        >
                                            {value}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

const Sheet = () => {
    const { hostelList } = useGlobal()
    const [selectedTab, setSelectedTab] = useState(SUMMARY_TAB_ID)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [sheetData, setSheetData] = useState(null)
    const [summaryData, setSummaryData] = useState(null)
    const [globalFilter, setGlobalFilter] = useState("")
    const [columnVisibility, setColumnVisibility] = useState({})
    const [columnFilters, setColumnFilters] = useState({})
    const [openFilterColumn, setOpenFilterColumn] = useState(null)
    const [showColumnsPanel, setShowColumnsPanel] = useState(false)
    const tableContainerRef = useRef(null)

    const isSummaryTab = selectedTab === SUMMARY_TAB_ID

    // Fetch hostel sheet data
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

    // Fetch summary data
    const fetchSummaryData = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await sheetApi.getHostelSheetSummary()
            setSummaryData(data)
        } catch (err) {
            setError(err.message || "Failed to fetch summary")
            setSummaryData(null)
        } finally {
            setLoading(false)
        }
    }

    // Handle tab change
    useEffect(() => {
        if (selectedTab === SUMMARY_TAB_ID) {
            fetchSummaryData()
        } else {
            fetchSheetData(selectedTab)
        }
    }, [selectedTab])

    // Data for hostel view
    const sortedData = useMemo(() => {
        return sheetData?.data || []
    }, [sheetData?.data])

    // Apply column filters
    const filteredData = useMemo(() => {
        let data = sortedData

        if (globalFilter) {
            const lower = globalFilter.toLowerCase()
            data = data.filter((row) =>
                Object.values(row).some((val) =>
                    val !== null && val !== undefined && String(val).toLowerCase().includes(lower)
                )
            )
        }

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

    // Table instance
    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const { rows } = table.getRowModel()

    // Virtualizer for rows
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => ROW_HEIGHT,
        overscan: 20,
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

    const handleHostelClick = (hostelId) => {
        setSelectedTab(hostelId)
    }

    const hasActiveFilters = Object.keys(columnFilters).length > 0 || globalFilter

    const selectedHostel = hostelList?.find((h) => h._id === selectedTab)

    return (
        <div style={styles.container}>
            {/* Toolbar */}
            <div style={styles.toolbar}>
                {!isSummaryTab && (
                    <>
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
                    </>
                )}

                <span style={styles.infoText}>
                    {isSummaryTab
                        ? `Summary — ${summaryData?.grandTotal || 0} total students across ${summaryData?.hostelCount || 0} hostels`
                        : `${selectedHostel?.name} — ${filteredData.length} of ${sortedData.length} rows`}
                </span>
            </div>

            {/* Filter chips - only for hostel view */}
            {!isSummaryTab && Object.keys(columnFilters).length > 0 && (
                <div style={styles.filterBar}>
                    <FilterChips
                        filters={columnFilters}
                        columns={sheetData?.columns || []}
                        onClearFilter={handleClearFilter}
                        onClearAll={handleClearAllFilters}
                    />
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner} />
                </div>
            ) : error ? (
                <div style={styles.emptyMessage}>{error}</div>
            ) : isSummaryTab ? (
                <SummaryTable data={summaryData} onHostelClick={handleHostelClick} />
            ) : !filteredData.length ? (
                <div style={styles.emptyMessage}>
                    {hasActiveFilters ? "No rows match the current filters" : "No data available"}
                </div>
            ) : (
                <div style={styles.spreadsheetContainer}>
                    <div ref={tableContainerRef} style={styles.tableWrapper}>
                        {/* Header */}
                        <div style={{ ...styles.headerRow, position: "sticky", top: 0, zIndex: 10 }}>
                            <div style={{ ...styles.headerCell, ...styles.rowNumberHeader }}>#</div>
                            {table.getHeaderGroups()[0]?.headers.map((header) => {
                                const colId = header.column.id
                                const hasFilter = columnFilters[colId]?.selectedValues?.length > 0

                                return (
                                    <div key={header.id} style={styles.headerCell}>
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
                                    </div>
                                )
                            })}
                        </div>

                        {/* Virtualized Body */}
                        <div
                            style={{
                                ...styles.virtualBody,
                                height: `${rowVirtualizer.getTotalSize()}px`,
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const row = rows[virtualRow.index]
                                return (
                                    <div
                                        key={row.id}
                                        className="sheet-row"
                                        style={{
                                            ...styles.row,
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                    >
                                        <div style={{ ...styles.cell, ...styles.rowNumberCell }}>
                                            {virtualRow.index + 1}
                                        </div>
                                        {row.getVisibleCells().map((cell) => (
                                            <div key={cell.id} style={styles.cell}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs bar */}
            <div style={styles.tabsBar}>
                <div style={styles.tabsList}>
                    {/* Summary Tab */}
                    <button
                        onClick={() => setSelectedTab(SUMMARY_TAB_ID)}
                        style={{
                            ...styles.tab,
                            ...(isSummaryTab ? styles.tabActive : styles.tabSummary),
                        }}
                        onMouseEnter={(e) => {
                            if (!isSummaryTab) {
                                e.currentTarget.style.backgroundColor = "var(--color-bg-hover)"
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSummaryTab) {
                                e.currentTarget.style.backgroundColor = "var(--color-primary-bg)"
                            }
                        }}
                    >
                        <FaChartBar /> Summary
                    </button>

                    {/* Hostel Tabs */}
                    {hostelList?.map((hostel) => (
                        <button
                            key={hostel._id}
                            onClick={() => setSelectedTab(hostel._id)}
                            style={{
                                ...styles.tab,
                                ...(selectedTab === hostel._id ? styles.tabActive : {}),
                            }}
                            onMouseEnter={(e) => {
                                if (selectedTab !== hostel._id) {
                                    e.currentTarget.style.backgroundColor = "var(--color-bg-hover)"
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedTab !== hostel._id) {
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
            {!isSummaryTab && (
                <ColumnVisibilityPanel
                    isOpen={showColumnsPanel}
                    onClose={() => setShowColumnsPanel(false)}
                    columns={sheetData?.columns || []}
                    visibility={columnVisibility}
                    onVisibilityChange={setColumnVisibility}
                />
            )}

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .sheet-row:hover { background-color: var(--color-bg-hover); }
        .summary-row:hover { background-color: var(--color-bg-hover); }
      `}</style>
        </div>
    )
}

export default Sheet
