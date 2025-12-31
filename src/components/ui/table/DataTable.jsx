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
    background: "var(--color-bg-primary)",
    borderRadius: "var(--radius-xl)",
    border: "none",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
    overflow: "hidden",
    ...style,
  }

  const paginationStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "transparent",
    borderTop: "1px solid color-mix(in srgb, var(--color-text-muted) 12%, transparent)",
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-muted)",
  }

  const pageButtonStyles = (disabled) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "transparent",
    border: "none",
    color: disabled ? "var(--color-text-muted)" : "var(--color-text-body)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.38 : 1,
    transition: "background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  })

  // Loading state
  if (loading) {
    return (
      <div ref={ref} className={className} style={containerStyles} {...rest}>
        <Table variant={variant}>
          <TableHead>
            <TableRow>
              {selectable && <TableHeader width="48px" />}
              {columns.map((col) => (
                <TableHeader key={col.key} align={col.align} width={col.width}>
                  {col.header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i} isLast={i === 4}>
                {selectable && (
                  <TableCell>
                    <div style={{ 
                      width: 18, 
                      height: 18, 
                      background: "linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-hover) 50%, var(--color-bg-tertiary) 75%)",
                      backgroundSize: "200% 100%",
                      borderRadius: 4,
                      animation: "shimmer 1.5s infinite"
                    }} />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <div style={{ 
                      width: `${40 + Math.random() * 40}%`, 
                      height: 14, 
                      background: "linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-hover) 50%, var(--color-bg-tertiary) 75%)",
                      backgroundSize: "200% 100%",
                      borderRadius: "var(--radius-sm)",
                      animation: "shimmer 1.5s infinite"
                    }} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <style>
          {`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
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
          <div style={{ 
            padding: "var(--spacing-12) var(--spacing-6)", 
            textAlign: "center", 
            color: "var(--color-text-muted)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--spacing-2)"
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-medium)" }}>
              {emptyMessage || "No data available"}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className={className} style={containerStyles} {...rest}>
      <Table variant={variant} hoverable elevated={false}>
        <TableHead>
          <TableRow>
            {selectable && (
              <TableHeader width="48px">
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
          {paginatedData.map((row, index) => {
            const rowId = getRowId(row)
            const isSelected = selectedRows.includes(rowId)
            const isLast = index === paginatedData.length - 1

            return (
              <TableRow
                key={rowId}
                selected={isSelected}
                isLast={isLast}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
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
          <span style={{ color: "var(--color-text-body)" }}>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.length)} of {data.length}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              style={pageButtonStyles(page <= 1)}
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              onMouseEnter={(e) => { if (page > 1) e.target.style.background = "color-mix(in srgb, var(--color-text-muted) 8%, transparent)" }}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
              aria-label="Previous page"
            >
              <FaChevronLeft size={16} />
            </button>
            <button
              style={pageButtonStyles(page >= totalPages)}
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              onMouseEnter={(e) => { if (page < totalPages) e.target.style.background = "color-mix(in srgb, var(--color-text-muted) 8%, transparent)" }}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
              aria-label="Next page"
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

DataTable.displayName = "DataTable"

export default DataTable
