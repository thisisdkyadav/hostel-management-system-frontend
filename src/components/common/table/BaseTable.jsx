import React, { useState } from "react"

const BaseTable = ({ columns, data, onRowClick, emptyMessage = "No data to display", isLoading = false, stickyHeader = false, title, className = "" }) => {
  const [hoveredRow, setHoveredRow] = useState(null)

  const containerStyle = {
    borderRadius: 'var(--radius-2xl)',
    overflow: 'hidden',
    border: 'var(--border-1) solid var(--color-border-light)',
    backgroundColor: 'var(--color-bg-primary)',
    boxShadow: 'var(--shadow-xs)'
  }

  const titleStyle = {
    padding: 'var(--spacing-4) var(--spacing-6)',
    borderBottom: 'var(--border-1) solid var(--color-border-light)',
    backgroundColor: 'var(--color-bg-tertiary)'
  }

  const titleTextStyle = {
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-secondary)'
  }

  const headerRowStyle = {
    backgroundColor: 'var(--color-bg-tertiary)',
    ...(stickyHeader && { position: 'sticky', top: 0, zIndex: 10 })
  }

  const headerCellStyle = {
    padding: 'var(--spacing-3) var(--spacing-6)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: 'var(--border-1) solid var(--color-border-light)'
  }

  const loadingCellStyle = {
    padding: 'var(--spacing-6) var(--spacing-12)',
    textAlign: 'center',
    backgroundColor: 'var(--color-bg-primary)'
  }

  const dataCellStyle = {
    padding: 'var(--spacing-4) var(--spacing-6)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-body)'
  }

  const emptyStateStyle = {
    textAlign: 'center',
    padding: 'var(--spacing-12) var(--spacing-4)',
    backgroundColor: 'var(--color-bg-primary)'
  }

  const getRowStyle = (index) => ({
    transition: 'var(--transition-colors)',
    borderBottom: 'var(--border-1) solid var(--color-border-light)',
    cursor: onRowClick ? 'pointer' : 'default',
    backgroundColor: hoveredRow === index ? 'var(--color-primary-bg)' : (index % 2 === 0 ? 'var(--color-bg-primary)' : 'var(--color-bg-tertiary)')
  })

  return (
    <div className={className} style={containerStyle}>
      {title && (
        <div style={titleStyle}>
          <h3 style={titleTextStyle}>{title}</h3>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={headerRowStyle}>
              {columns.map((column, index) => (
                <th key={index} className={column.className || ""} style={{ ...headerCellStyle, textAlign: column.align === "right" ? "right" : "left" }}>
                  {column.customHeaderRender ? column.customHeaderRender() : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} style={loadingCellStyle}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg style={{ animation: 'spin 1s linear infinite', height: 'var(--spacing-6)', width: 'var(--spacing-6)', color: 'var(--color-primary)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <div style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Loading...</div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <tr key={item.id || index} onClick={() => onRowClick && onRowClick(item)}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={getRowStyle(index)}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={column.className || ""} style={{ ...dataCellStyle, textAlign: column.align === "right" ? "right" : "left" }}>
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : null}
          </tbody>
        </table>
      </div>
      {!isLoading && data.length === 0 && (
        <div style={emptyStateStyle}>
          <svg style={{ margin: '0 auto', height: 'var(--spacing-10)', width: 'var(--spacing-10)', color: 'var(--color-text-disabled)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}

export default BaseTable
