import React, { forwardRef, useState } from "react"

/**
 * Table Component - Base table wrapper
 * 
 * @param {React.ReactNode} children - Table content
 * @param {string} variant - Style variant: default, striped, bordered
 * @param {string} size - Size: sm, md, lg
 * @param {boolean} hoverable - Highlight row on hover
 * @param {boolean} stickyHeader - Sticky header
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Table = forwardRef(({
  children,
  variant = "default",
  size = "md",
  hoverable = true,
  stickyHeader = false,
  className = "",
  style = {},
  ...rest
}, ref) => {

  const containerStyles = {
    width: "100%",
    overflow: "auto",
    background: "var(--color-bg-primary)",
    borderRadius: "var(--radius-table)",
    border: variant === "bordered" ? "1px solid var(--color-border-primary)" : "none",
    ...style,
  }

  const tableStyles = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: size === "sm" ? "var(--font-size-xs)" : size === "lg" ? "var(--font-size-base)" : "var(--font-size-sm)",
  }

  // Provide context to children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { variant, size, hoverable, stickyHeader })
    }
    return child
  })

  return (
    <div style={containerStyles}>
      <table ref={ref} className={className} style={tableStyles} {...rest}>
        {childrenWithProps}
      </table>
    </div>
  )
})

Table.displayName = "Table"

/**
 * TableHead Component - Table header section
 */
export const TableHead = forwardRef(({
  children,
  stickyHeader,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const theadStyles = {
    background: "var(--color-bg-secondary)",
    ...(stickyHeader && {
      position: "sticky",
      top: 0,
      zIndex: 1,
    }),
    ...style,
  }

  return (
    <thead ref={ref} className={className} style={theadStyles} {...rest}>
      {children}
    </thead>
  )
})

TableHead.displayName = "TableHead"

/**
 * TableBody Component - Table body section
 */
export const TableBody = forwardRef(({
  children,
  variant,
  hoverable,
  className = "",
  style = {},
  ...rest
}, ref) => {
  // Pass props to rows
  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        variant, 
        hoverable,
        isEven: index % 2 === 0,
      })
    }
    return child
  })

  return (
    <tbody ref={ref} className={className} style={style} {...rest}>
      {childrenWithProps}
    </tbody>
  )
})

TableBody.displayName = "TableBody"

/**
 * TableRow Component - Table row
 */
export const TableRow = forwardRef(({
  children,
  variant,
  hoverable,
  isEven,
  selected = false,
  onClick,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [isHovered, setIsHovered] = useState(false)

  const rowStyles = {
    borderBottom: "1px solid var(--color-border-primary)",
    background: selected 
      ? "var(--color-primary-bg)"
      : variant === "striped" && isEven 
        ? "var(--color-bg-secondary)" 
        : isHovered && hoverable 
          ? "var(--color-bg-hover)" 
          : "transparent",
    cursor: onClick ? "pointer" : "default",
    transition: "var(--transition-colors)",
    ...style,
  }

  return (
    <tr
      ref={ref}
      className={className}
      style={rowStyles}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {children}
    </tr>
  )
})

TableRow.displayName = "TableRow"

/**
 * TableHeader Component - Table header cell
 */
export const TableHeader = forwardRef(({
  children,
  align = "left",
  sortable = false,
  sortDirection,
  onSort,
  width,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [isHovered, setIsHovered] = useState(false)

  const thStyles = {
    padding: "var(--spacing-3) var(--spacing-4)",
    textAlign: align,
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-muted)",
    whiteSpace: "nowrap",
    cursor: sortable ? "pointer" : "default",
    userSelect: sortable ? "none" : "auto",
    background: isHovered && sortable ? "var(--color-bg-hover)" : "transparent",
    width: width,
    transition: "var(--transition-colors)",
    ...style,
  }

  const handleClick = () => {
    if (sortable && onSort) {
      onSort()
    }
  }

  const getSortIcon = () => {
    if (!sortable) return null
    if (sortDirection === "asc") return " ↑"
    if (sortDirection === "desc") return " ↓"
    return " ↕"
  }

  return (
    <th
      ref={ref}
      className={className}
      style={thStyles}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {children}
      {sortable && <span style={{ opacity: 0.5 }}>{getSortIcon()}</span>}
    </th>
  )
})

TableHeader.displayName = "TableHeader"

/**
 * TableCell Component - Table data cell
 */
export const TableCell = forwardRef(({
  children,
  align = "left",
  className = "",
  style = {},
  ...rest
}, ref) => {
  const tdStyles = {
    padding: "var(--spacing-3) var(--spacing-4)",
    textAlign: align,
    color: "var(--color-text-body)",
    ...style,
  }

  return (
    <td ref={ref} className={className} style={tdStyles} {...rest}>
      {children}
    </td>
  )
})

TableCell.displayName = "TableCell"

export default Table
