import React, { forwardRef, useState, useMemo } from "react"
import Table, { TableHead, TableBody, TableRow, TableHeader, TableCell } from "./Table"
import { FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import Checkbox from "../form/Checkbox"

/**
 * DataTable Component - Full-featured data table
 * 
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions [{key, header, render, sortable, align, width}]
 * @param {boolean} selectable - Enable row selection
 * @param {Array} selectedRows - Controlled selected row ids
 * @param {function} onSelectionChange - Selection change handler
 * @param {boolean} sortable - Enable sorting
 * @param {string} defaultSortKey - Default sort column key
 * @param {string} defaultSortDir - Default sort direction: asc, desc
 * @param {boolean} pagination - Enable pagination
 * @param {number} pageSize - Rows per page
 * @param {number} currentPage - Controlled current page
 * @param {function} onPageChange - Page change handler
 * @param {boolean} loading - Loading state
 * @param {React.ReactNode} emptyState - Custom empty state
 * @param {function} onRowClick - Row click handler
 * @param {function} getRowId - Function to get unique row id (default: row.id)
 * @param {string} variant - Table variant: default, striped, bordered
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const DataTable = forwardRef(({
  data = [],
  columns = [],
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortable = false,
  defaultSortKey = null,
  defaultSortDir = "asc",
  pagination = false,
  pageSize = 10,
  currentPage: controlledPage,
  onPageChange,
  loading: loadingProp = false,
  isLoading: isLoadingProp = false,
  emptyState,
  emptyMessage,
  onRowClick,
  getRowId = (row) => row.id,
  variant = "default",
  className = "",
  style = {},
  ...rest
}, ref) => {
  // Support both loading and isLoading props
  const loading = loadingProp || isLoadingProp
  
  const [sortKey, setSortKey] = useState(defaultSortKey)
  const [sortDir, setSortDir] = useState(defaultSortDir)
  const [internalPage, setInternalPage] = useState(1)

  const page = controlledPage !== undefined ? controlledPage : internalPage
  const setPage = (p) => {
    if (controlledPage !== undefined) {
      onPageChange?.(p)
    } else {
      setInternalPage(p)
    }
  }

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey || !sortable) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = aVal < bVal ? -1 : 1
      return sortDir === "asc" ? comparison : -comparison
    })
  }, [data, sortKey, sortDir, sortable])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData
    const start = (page - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, pagination, page, pageSize])

  const totalPages = Math.ceil(data.length / pageSize)

  // Handle sort
  const handleSort = (key) => {
    if (!sortable) return
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  // Handle selection
  const allSelected = paginatedData.length > 0 && paginatedData.every((row) => selectedRows.includes(getRowId(row)))
  const someSelected = paginatedData.some((row) => selectedRows.includes(getRowId(row)))

  const handleSelectAll = (checked) => {
    if (!onSelectionChange) return
    if (checked) {
      const newSelection = [...new Set([...selectedRows, ...paginatedData.map(getRowId)])]
      onSelectionChange(newSelection)
    } else {
      const pageIds = paginatedData.map(getRowId)
      onSelectionChange(selectedRows.filter((id) => !pageIds.includes(id)))
    }
  }

  const handleSelectRow = (rowId, checked) => {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange([...selectedRows, rowId])
    } else {
      onSelectionChange(selectedRows.filter((id) => id !== rowId))
    }
  }

  // Styles
  const containerStyles = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-4)",
    ...style,
  }

  const paginationStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "var(--spacing-3) var(--spacing-4)",
    borderTop: "1px solid var(--color-border-primary)",
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-muted)",
  }

  const pageButtonStyles = (disabled) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "var(--radius-sm)",
    background: "transparent",
    border: "1px solid var(--color-border-primary)",
    color: disabled ? "var(--color-text-muted)" : "var(--color-text-secondary)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "var(--transition-colors)",
  })

  // Loading state
  if (loading) {
    return (
      <div ref={ref} className={className} style={containerStyles} {...rest}>
        <Table variant={variant}>
          <TableHead>
            <TableRow>
              {selectable && <TableHeader width="40px" />}
              {columns.map((col) => (
                <TableHeader key={col.key} align={col.align} width={col.width}>
                  {col.header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {selectable && (
                  <TableCell>
                    <div style={{ width: 16, height: 16, background: "var(--color-bg-tertiary)", borderRadius: 4 }} />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <div style={{ width: "60%", height: 16, background: "var(--color-bg-tertiary)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div ref={ref} className={className} style={containerStyles} {...rest}>
        {emptyState || (
          <div style={{ padding: "var(--spacing-8)", textAlign: "center", color: "var(--color-text-muted)" }}>
            {emptyMessage || "No data available"}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className={className} style={containerStyles} {...rest}>
      <Table variant={variant} hoverable>
        <TableHead>
          <TableRow>
            {selectable && (
              <TableHeader width="40px">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHeader>
            )}
            {columns.map((col) => (
              <TableHeader
                key={col.key}
                align={col.align}
                width={col.width}
                sortable={sortable && col.sortable !== false}
                sortDirection={sortKey === col.key ? sortDir : null}
                onSort={() => handleSort(col.key)}
              >
                {col.customHeaderRender ? col.customHeaderRender() : col.header}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((row) => {
            const rowId = getRowId(row)
            const isSelected = selectedRows.includes(rowId)

            return (
              <TableRow
                key={rowId}
                selected={isSelected}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {selectable && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align} className={col.className}>
                    {col.render ? col.render(row, row[col.key]) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {pagination && totalPages > 1 && (
        <div style={paginationStyles}>
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data.length)} of {data.length} results
          </span>
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <button
              style={pageButtonStyles(page <= 1)}
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <FaChevronLeft size={12} />
            </button>
            <span style={{ display: "flex", alignItems: "center", padding: "0 var(--spacing-2)" }}>
              Page {page} of {totalPages}
            </span>
            <button
              style={pageButtonStyles(page >= totalPages)}
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

DataTable.displayName = "DataTable"

export default DataTable
