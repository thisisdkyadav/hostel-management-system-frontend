import { memo, useMemo } from "react"

const styles = {
  container: {
    border: "var(--border-1) solid var(--color-border-primary)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    backgroundColor: "var(--color-bg-primary)",
  },
  wrapper: {
    maxHeight: "360px",
    overflow: "auto",
  },
  table: {
    width: "max-content",
    minWidth: "100%",
    borderCollapse: "collapse",
    fontSize: "var(--font-size-xs)",
  },
  headerRow: {
    position: "sticky",
    top: 0,
    zIndex: 2,
    backgroundColor: "var(--color-bg-tertiary)",
  },
  headerCell: {
    padding: "var(--spacing-1-5) var(--spacing-2)",
    textAlign: "left",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-body)",
    borderBottom: "var(--border-1) solid var(--color-border-primary)",
    borderRight: "var(--border-1) solid var(--color-border-light)",
    whiteSpace: "nowrap",
    minWidth: "120px",
  },
  rowNumberHeader: {
    width: "48px",
    minWidth: "48px",
    textAlign: "center",
    position: "sticky",
    left: 0,
    zIndex: 3,
    backgroundColor: "var(--color-bg-tertiary)",
  },
  bodyRow: {
    borderBottom: "var(--border-1) solid var(--color-border-light)",
  },
  cell: {
    padding: "var(--spacing-1) var(--spacing-2)",
    color: "var(--color-text-body)",
    borderRight: "var(--border-1) solid var(--color-border-light)",
    whiteSpace: "nowrap",
    maxWidth: "220px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rowNumberCell: {
    width: "48px",
    minWidth: "48px",
    textAlign: "center",
    color: "var(--color-text-muted)",
    backgroundColor: "var(--color-bg-tertiary)",
    position: "sticky",
    left: 0,
    zIndex: 1,
    fontFamily: "var(--font-family-mono, monospace)",
  },
  empty: {
    padding: "var(--spacing-6)",
    textAlign: "center",
    color: "var(--color-text-muted)",
    fontSize: "var(--font-size-sm)",
  },
}

const normalizeValue = (value) => {
  if (value === null || value === undefined || value === "") return "—"
  return String(value)
}

const getCellStyleByValue = (column, value) => {
  const normalizedColumn = String(column || "").toLowerCase()
  const normalizedValue = String(value || "").trim().toLowerCase()

  const isStatusColumn = normalizedColumn.includes("status")
  const isReasonColumn = normalizedColumn.includes("reason")

  if (isStatusColumn) {
    if (normalizedValue === "success") {
      return {
        backgroundColor: "var(--color-success-bg)",
        color: "var(--color-success-text)",
        fontWeight: "var(--font-weight-medium)",
      }
    }
    if (normalizedValue === "failed" || normalizedValue === "error") {
      return {
        backgroundColor: "var(--color-danger-bg)",
        color: "var(--color-danger-text)",
        fontWeight: "var(--font-weight-medium)",
      }
    }
    if (normalizedValue === "pending" || normalizedValue === "processing") {
      return {
        backgroundColor: "var(--color-warning-bg)",
        color: "var(--color-warning-text)",
        fontWeight: "var(--font-weight-medium)",
      }
    }
  }

  if (isReasonColumn) {
    if (normalizedValue === "—" || normalizedValue === "-" || normalizedValue === "ok") {
      return {
        backgroundColor: "var(--color-success-bg-light)",
        color: "var(--color-success-text)",
      }
    }
    if (
      normalizedValue.includes("fail")
      || normalizedValue.includes("error")
      || normalizedValue.includes("not imported")
      || normalizedValue.includes("already exists")
      || normalizedValue.includes("missing")
      || normalizedValue.includes("invalid")
    ) {
      return {
        backgroundColor: "var(--color-danger-bg-light)",
        color: "var(--color-danger-text)",
      }
    }
  }

  return null
}

const SheetPreviewTable = ({ rows = [] }) => {
  const columns = useMemo(() => {
    if (!rows.length) return []

    const ordered = []
    const seen = new Set()

    rows.forEach((row) => {
      Object.keys(row || {}).forEach((key) => {
        if (!seen.has(key)) {
          seen.add(key)
          ordered.push(key)
        }
      })
    })

    return ordered
  }, [rows])

  if (!rows.length || !columns.length) {
    return <div style={styles.empty}>No rows to preview</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={{ ...styles.headerCell, ...styles.rowNumberHeader }}>#</th>
              {columns.map((column) => (
                <th key={column} style={styles.headerCell}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`preview-row-${index}`} style={styles.bodyRow} className="sheet-preview-row">
                <td style={{ ...styles.cell, ...styles.rowNumberCell }}>{index + 1}</td>
                {columns.map((column) => (
                  <td
                    key={`${column}-${index}`}
                    style={{ ...styles.cell, ...getCellStyleByValue(column, normalizeValue(row?.[column])) }}
                    title={normalizeValue(row?.[column])}
                  >
                    {normalizeValue(row?.[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`.sheet-preview-row:hover { background-color: var(--color-bg-hover); }`}</style>
    </div>
  )
}

export default memo(SheetPreviewTable)
