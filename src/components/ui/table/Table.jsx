import React, { forwardRef, useState } from "react"

/**
 * Table Component - Base table wrapper with Material UI inspired design
 * 
 * @param {React.ReactNode} children - Table content
 * @param {string} variant - Style variant: default, striped, bordered
 * @param {string} size - Size: sm, md, lg
 * @param {boolean} hoverable - Highlight row on hover
 * @param {boolean} stickyHeader - Sticky header
 * @param {boolean} elevated - Add elevation/shadow to table
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Table = forwardRef(({
  children,
  variant = "default",
  size = "md",
  hoverable = true,
  stickyHeader = false,
  elevated = true,
  className = "",
  style = {},
  ...rest
}, ref) => {

  const containerStyles = {
    width: "100%",
    overflow: "hidden",
    background: "var(--color-bg-primary)",
    borderRadius: "var(--radius-xl)",
    border: "none",
    boxShadow: elevated ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)" : "none",
    ...style,
  }

  const scrollContainerStyles = {
    width: "100%",
    overflowX: "auto",
    overflowY: "visible",
  }

  const tableStyles = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
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
      <div style={scrollContainerStyles}>
        <table ref={ref} className={className} style={tableStyles} {...rest}>
          {childrenWithProps}
        </table>
      </div>
    </div>
  )
})

Table.displayName = "Table"

/**
 * TableHead Component - Table header section with Material UI styling
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
      zIndex: 2,
      backdropFilter: "blur(8px)",
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
        isLast: index === React.Children.count(children) - 1,
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
 * TableRow Component - Table row with enhanced hover states
 */
export const TableRow = forwardRef(({
  children,
  variant,
  hoverable,
  isEven,
  isLast = false,
  selected = false,
  onClick,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [isHovered, setIsHovered] = useState(false)

  const getBackground = () => {
    if (selected) return "color-mix(in srgb, var(--color-primary) 8%, transparent)"
    if (variant === "striped" && isEven) return "var(--color-bg-secondary)"
    if (isHovered && hoverable) return "color-mix(in srgb, var(--color-text-primary) 4%, transparent)"
    return "transparent"
  }

  const rowStyles = {
    borderBottom: isLast ? "none" : "1px solid color-mix(in srgb, var(--color-text-muted) 12%, transparent)",
    background: getBackground(),
    cursor: onClick ? "pointer" : "default",
    transition: "background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
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
 * TableHeader Component - Table header cell with modern styling
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
    padding: "14px 16px",
    textAlign: align,
    fontWeight: "500",
    color: "var(--color-text-muted)",
    fontSize: "var(--font-size-xs)",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
    cursor: sortable ? "pointer" : "default",
    userSelect: sortable ? "none" : "auto",
    background: isHovered && sortable ? "color-mix(in srgb, var(--color-text-muted) 6%, transparent)" : "transparent",
    width: width,
    transition: "background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    borderBottom: "1px solid color-mix(in srgb, var(--color-text-muted) 12%, transparent)",
    ...style,
  }

  const handleClick = () => {
    if (sortable && onSort) {
      onSort()
    }
  }

  const getSortIcon = () => {
    if (!sortable) return null
    const iconStyle = {
      marginLeft: "var(--spacing-1)",
      opacity: sortDirection ? 1 : 0.4,
      display: "inline-flex",
      verticalAlign: "middle",
      fontSize: "0.75em",
    }
    if (sortDirection === "asc") return <span style={iconStyle}>↑</span>
    if (sortDirection === "desc") return <span style={iconStyle}>↓</span>
    return <span style={iconStyle}>↕</span>
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
      <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)" }}>
        {children}
        {getSortIcon()}
      </span>
    </th>
  )
})

TableHeader.displayName = "TableHeader"

/**
 * TableCell Component - Table data cell with M3 list item spacing
 */
export const TableCell = forwardRef(({
  children,
  align = "left",
  className = "",
  style = {},
  ...rest
}, ref) => {
  const tdStyles = {
    padding: "14px 16px",
    textAlign: align,
    color: "var(--color-text-body)",
    verticalAlign: "middle",
    lineHeight: "1.43",
    fontSize: "var(--font-size-sm)",
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
