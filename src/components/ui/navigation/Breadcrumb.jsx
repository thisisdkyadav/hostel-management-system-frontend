import React, { forwardRef } from "react"
import { FaChevronRight, FaHome } from "react-icons/fa"

/**
 * Breadcrumb Component - Navigation breadcrumbs
 * 
 * @param {Array} items - Breadcrumb items [{label, href, icon, onClick}]
 * @param {string} separator - Separator character or "chevron"
 * @param {boolean} showHome - Show home icon as first item
 * @param {string} homeHref - Home link href
 * @param {function} onHomeClick - Home click handler
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Breadcrumb = forwardRef(({
  items = [],
  separator = "chevron",
  showHome = false,
  homeHref = "/",
  onHomeClick,
  className = "",
  style = {},
  ...rest
}, ref) => {

  const containerStyles = {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "var(--spacing-2)",
    fontSize: "var(--font-size-sm)",
    ...style,
  }

  const separatorStyles = {
    color: "var(--color-text-muted)",
    display: "flex",
    alignItems: "center",
    fontSize: "10px",
  }

  const linkStyles = {
    color: "var(--color-text-muted)",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-1-5)",
    transition: "var(--transition-colors)",
    cursor: "pointer",
  }

  const activeLinkStyles = {
    ...linkStyles,
    color: "var(--color-text-heading)",
    fontWeight: "var(--font-weight-medium)",
    cursor: "default",
  }

  const renderSeparator = () => {
    if (separator === "chevron") {
      return <FaChevronRight />
    }
    return separator
  }

  const allItems = [...items]
  
  // Prepend home if needed
  if (showHome) {
    allItems.unshift({
      label: "",
      icon: <FaHome />,
      href: homeHref,
      onClick: onHomeClick,
    })
  }

  return (
    <nav ref={ref} className={className} style={containerStyles} aria-label="Breadcrumb" {...rest}>
      <ol style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", listStyle: "none", margin: 0, padding: 0 }}>
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          const isClickable = item.href || item.onClick

          return (
            <li key={index} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
              {index > 0 && (
                <span style={separatorStyles} aria-hidden="true">
                  {renderSeparator()}
                </span>
              )}
              
              {isLast ? (
                <span style={activeLinkStyles} aria-current="page">
                  {item.icon && <span style={{ display: "flex" }}>{item.icon}</span>}
                  {item.label}
                </span>
              ) : isClickable ? (
                <a
                  href={item.href || "#"}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault()
                      item.onClick()
                    }
                  }}
                  style={linkStyles}
                  onMouseEnter={(e) => {
                    e.target.style.color = "var(--color-primary)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "var(--color-text-muted)"
                  }}
                >
                  {item.icon && <span style={{ display: "flex" }}>{item.icon}</span>}
                  {item.label}
                </a>
              ) : (
                <span style={linkStyles}>
                  {item.icon && <span style={{ display: "flex" }}>{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
})

Breadcrumb.displayName = "Breadcrumb"

export default Breadcrumb
