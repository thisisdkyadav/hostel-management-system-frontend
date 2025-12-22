import { useState, useEffect, useMemo, useRef } from "react"
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
} from "@tanstack/react-table"
import { FaSearch, FaChevronDown, FaChevronUp, FaUser } from "react-icons/fa"
import { useGlobal } from "../../contexts/GlobalProvider"
import { sheetApi } from "../../services/sheetApi"

// Styles using CSS variables from theme.css - Google Sheets inspired
const styles = {
    // Main container - full height like sheets
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "var(--color-bg-page)",
        overflow: "hidden",
    },

    // Minimal toolbar
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
        width: "280px",
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
    formulaBar: {
        flex: 1,
        padding: "var(--spacing-1-5) var(--spacing-2)",
        border: "var(--border-1) solid var(--color-border-input)",
        borderRadius: "var(--radius-sm)",
        backgroundColor: "var(--color-bg-primary)",
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-muted)",
        marginLeft: "var(--spacing-2)",
    },

    // Spreadsheet container
    spreadsheetContainer: {
        flex: 1,
        overflow: "auto",
        backgroundColor: "var(--color-bg-primary)",
    },

    // Table - spreadsheet style
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
        cursor: "pointer",
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
    sortIcon: {
        fontSize: "8px",
        color: "var(--color-text-light)",
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

    // Body
    tbody: {
        backgroundColor: "var(--color-bg-primary)",
    },
    row: {
        borderBottom: "var(--border-1) solid var(--color-border-light)",
    },
    rowHover: {
        backgroundColor: "var(--color-bg-hover)",
    },
    rowSelected: {
        backgroundColor: "var(--color-primary-bg)",
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

    // Status badges inline
    statusActive: {
        color: "var(--color-success-text)",
        fontWeight: "var(--font-weight-medium)",
    },
    statusInactive: {
        color: "var(--color-danger-text)",
        fontWeight: "var(--font-weight-medium)",
    },
    allocated: {
        color: "var(--color-success)",
    },
    vacant: {
        color: "var(--color-warning)",
    },

    // Avatar small
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

    // Bottom tabs bar - like Google Sheets
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
    tabHover: {
        backgroundColor: "var(--color-bg-hover)",
    },

    // Loading and empty states
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

    // Info bar
    infoBar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--spacing-1) var(--spacing-3)",
        backgroundColor: "var(--color-bg-secondary)",
        borderTop: "var(--border-1) solid var(--color-border-light)",
        fontSize: "var(--font-size-2xs)",
        color: "var(--color-text-muted)",
        flexShrink: 0,
    },
}

// Cell renderers
const renderProfileImage = (value) => {
    if (value) {
        return <img src={value} alt="" style={styles.avatar} />
    }
    return (
        <span style={styles.avatarPlaceholder}>
            <FaUser />
        </span>
    )
}

const renderStatus = (value) => {
    if (!value) return "—"
    const isActive = value === "Active"
    return <span style={isActive ? styles.statusActive : styles.statusInactive}>{value}</span>
}

const renderAllocation = (value) => {
    return <span style={value ? styles.allocated : styles.vacant}>{value ? "Yes" : "No"}</span>
}

const renderBoolean = (value) => {
    if (value === null || value === undefined) return "—"
    return value ? "Yes" : "No"
}

const renderDate = (value) => {
    if (!value) return "—"
    return new Date(value).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

const Sheet = () => {
    const { hostelList } = useGlobal()
    const [selectedHostelId, setSelectedHostelId] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [sheetData, setSheetData] = useState(null)
    const [globalFilter, setGlobalFilter] = useState("")
    const [sorting, setSorting] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})
    const [hoveredRow, setHoveredRow] = useState(null)
    const tableRef = useRef(null)

    // Fetch data when hostel changes
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
                if (col.hidden) {
                    initialVisibility[col.accessorKey] = false
                }
            })
            setColumnVisibility(initialVisibility)
        } catch (err) {
            setError(err.message || "Failed to fetch data")
            setSheetData(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (selectedHostelId) {
            fetchSheetData(selectedHostelId)
        }
    }, [selectedHostelId])

    // Auto-select first hostel
    useEffect(() => {
        if (hostelList?.length > 0 && !selectedHostelId) {
            setSelectedHostelId(hostelList[0]._id)
        }
    }, [hostelList, selectedHostelId])

    // Build columns
    const columns = useMemo(() => {
        if (!sheetData?.columns) return []

        return sheetData.columns
            .filter((col) => !col.hidden)
            .map((col) => ({
                accessorKey: col.accessorKey,
                header: col.header,
                cell: ({ getValue }) => {
                    const value = getValue()

                    switch (col.accessorKey) {
                        case "studentProfileImage":
                            return renderProfileImage(value)
                        case "roomStatus":
                        case "studentStatus":
                            return renderStatus(value)
                        case "isAllocated":
                            return renderAllocation(value)
                        case "isDayScholar":
                            return renderBoolean(value)
                        case "admissionDate":
                            return renderDate(value)
                        default:
                            if (value === null || value === undefined || value === "") {
                                return <span style={styles.cellEmpty}>—</span>
                            }
                            return String(value)
                    }
                },
            }))
    }, [sheetData?.columns])

    // Table instance - no pagination
    const table = useReactTable({
        data: sheetData?.data || [],
        columns,
        state: {
            globalFilter,
            sorting,
            columnVisibility,
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const selectedHostel = hostelList?.find((h) => h._id === selectedHostelId)

    return (
        <div style={styles.container}>
            {/* Minimal Toolbar */}
            <div style={styles.toolbar}>
                <div style={styles.searchContainer}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        style={styles.searchInput}
                        onFocus={(e) => {
                            e.target.style.borderColor = "var(--color-primary)"
                            e.target.style.backgroundColor = "var(--color-bg-primary)"
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "var(--color-border-input)"
                            e.target.style.backgroundColor = "var(--color-bg-secondary)"
                        }}
                    />
                </div>
                <div style={styles.formulaBar}>
                    {selectedHostel ? `${selectedHostel.name} — ${sheetData?.data?.length || 0} rows` : "Select a hostel"}
                </div>
            </div>

            {/* Spreadsheet Area */}
            {loading ? (
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner} />
                </div>
            ) : error ? (
                <div style={styles.emptyMessage}>{error}</div>
            ) : !sheetData?.data?.length ? (
                <div style={styles.emptyMessage}>
                    {selectedHostelId ? "No data available for this hostel" : "Select a hostel from below"}
                </div>
            ) : (
                <div style={styles.spreadsheetContainer} ref={tableRef}>
                    <table style={styles.table}>
                        <thead style={styles.thead}>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} style={styles.headerRow}>
                                    <th style={{ ...styles.headerCell, ...styles.rowNumberHeader }}>#</th>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            style={styles.headerCell}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div style={styles.headerCellContent}>
                                                <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                                {{
                                                    asc: <FaChevronUp style={styles.sortIcon} />,
                                                    desc: <FaChevronDown style={styles.sortIcon} />,
                                                }[header.column.getIsSorted()] ?? null}
                                            </div>
                                        </th>
                                    ))}
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

            {/* Info Bar */}
            {sheetData?.data && (
                <div style={styles.infoBar}>
                    <span>
                        {table.getFilteredRowModel().rows.length} of {sheetData.data.length} rows
                        {globalFilter && " (filtered)"}
                    </span>
                    <span>{sheetData.hostel?.type || ""}</span>
                </div>
            )}

            {/* Bottom Tabs - Like Google Sheets */}
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

            {/* Keyframes */}
            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}

export default Sheet
