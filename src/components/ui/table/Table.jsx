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
    borderRadius: "var(--radius-card)",
    border: variant === "bordered" ? "1px solid var(--color-border-primary)" : "none",
    boxShadow: elevated ? "var(--shadow-card)" : "none",
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
    background: "var(--table-header-bg)",
    ...(stickyHeader && {
      position: "sticky",
      top: 0,
      zIndex: 10,
      backdropFilter: "blur(8px)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
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
    if (selected) return "var(--color-primary-bg)"; // Selected state
    if (variant === "striped" && isEven) return "var(--table-stripe-bg)";
    if (isHovered && hoverable) return "var(--table-row-hover)";
    return "transparent"
  }

  const rowStyles = {
    borderBottom: isLast ? "none" : "1px solid var(--color-border-light)",
    background: getBackground(),
    cursor: onClick ? "pointer" : "default",
    transition: "background-color var(--transition-fast) ease",
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
    padding: "var(--spacing-3) var(--spacing-4)",
    textAlign: align,
    fontWeight: "var(--font-weight-medium)",
    color: "var(--table-header-text)",
    fontSize: "var(--font-size-xs)",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    cursor: sortable ? "pointer" : "default",
    userSelect: sortable ? "none" : "auto",
    background: isHovered && sortable ? "var(--color-bg-hover)" : "transparent",
    width: width,
    transition: "background-color var(--transition-fast) ease",
    borderBottom: "1px solid var(--color-border-primary)",
    ...style,
  }

  const handleClick = () => {
    if (sortable && onSort) {
      onSort()
    }
  }

  // Determine sort icon
  // If children provides its own icon logic, this might be redundant, 
  // but often TableHeader is used directly. 
  // We'll let DataTable handle specific icons usually, but provide a slot or default here.
  const getSortIcon = () => {
    if (!sortable) return null
    // We expect the icon to be passed as a child or handled by the parent using this component.
    // However, for standalone usage:
    return null;
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
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
        gap: "var(--spacing-1)"
      }}>
        {children}
        {getSortIcon()}
      </div>
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
    padding: "var(--spacing-3-5) var(--spacing-4)",
    textAlign: align,
    color: "var(--color-text-body)",
    verticalAlign: "middle",
    lineHeight: "1.5",
    fontSize: "var(--font-size-sm)",
    borderBottom: "1px solid var(--color-border-light)",
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
