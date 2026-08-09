import React from "react"
import { Surface, Text } from "hzero"

/**
 * The first few parsed rows, so someone can see the file landed as expected.
 *
 * Written out once per tab before this, with the column count and the row
 * limit as the only differences — and, in three of them, Tailwind's grey
 * palette instead of the theme's surfaces.
 *
 * @param {Array<{key: string, label: string, render?: (row) => React.ReactNode}>} columns
 * @param {Array<object>} rows - Everything parsed; only `limit` are shown
 * @param {number} limit - How many rows to show
 */
const PreviewTable = ({ columns, rows = [], limit = 5 }) => {
  if (!rows.length) return null

  return (
    <Surface
      radius="lg"
      border="1px solid var(--color-border-primary)"
      style={{ marginTop: "var(--spacing-4)", overflowX: "auto" }}
    >
      <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={{
                  padding: "var(--spacing-3) var(--spacing-4)",
                  textAlign: "left",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--letter-spacing-wider)",
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ backgroundColor: "var(--color-bg-primary)" }}>
          {rows.slice(0, limit).map((row, index) => (
            <tr
              key={index}
              style={{
                borderTop: "1px solid var(--color-border-primary)",
                ...(index % 2 === 1 && { backgroundColor: "var(--color-bg-secondary)" }),
              }}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    padding: "var(--spacing-2) var(--spacing-4)",
                    whiteSpace: "nowrap",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length > limit && (
        <Surface bg="secondary" padding="var(--spacing-3) var(--spacing-4)" size="xs" color="muted">
          Showing {limit} of {rows.length} records
        </Surface>
      )}
    </Surface>
  )
}

export default PreviewTable
