import { useState, useEffect } from "react"
import { HiPlus, HiSave } from "react-icons/hi"
import { Input, VStack, HStack, Label } from "@/components/ui"
import { Button } from "czero/react"

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-6)",
  },
  itemsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-4)",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "var(--spacing-8) 0",
  },
  emptyText: {
    color: "var(--color-text-muted)",
    marginBottom: "var(--spacing-2)",
  },
  emptySubText: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-placeholder)",
  },
  degreeCard: {
    padding: "var(--spacing-4)",
    borderRadius: "var(--radius-lg)",
    transition: "var(--transition-all)",
  },
  degreeHeader: {
    marginBottom: "var(--spacing-3)",
  },
  degreeTitle: {
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-tertiary)",
    marginBottom: "var(--spacing-1)",
  },
  degreeSubtitle: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-muted)",
  },
  errorIcon: {
    width: "var(--icon-xs)",
    height: "var(--icon-xs)",
    marginRight: "var(--spacing-1)",
  },
  errorText: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-danger-text)",
    marginTop: "var(--spacing-1)",
    display: "flex",
    alignItems: "center",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "var(--spacing-4)",
  },
  inputLabel: {
    display: "block",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-body)",
    marginBottom: "var(--spacing-1)",
  },
  input: {
    width: "100%",
    padding: "var(--spacing-2) var(--spacing-3)",
    border: "var(--border-1) solid var(--color-border-input)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-sm)",
    textAlign: "center",
    backgroundColor: "var(--color-bg-primary)",
    color: "var(--color-text-body)",
    fontSize: "var(--font-size-base)",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "var(--spacing-4)",
    borderTop: "var(--border-1) solid var(--color-border-primary)",
  },
  button: {
    display: "flex",
    alignItems: "center",
    padding: "var(--spacing-2-5) var(--spacing-6)",
    backgroundColor: "var(--color-primary)",
    color: "var(--color-white)",
    borderRadius: "var(--radius-lg)",
    transition: "var(--transition-all)",
    cursor: "pointer",
    border: "none",
  },
  buttonIcon: {
    marginRight: "var(--spacing-2)",
    width: "var(--icon-md)",
    height: "var(--icon-md)",
  },
  spinner: {
    width: "var(--icon-md)",
    height: "var(--icon-md)",
    borderRadius: "var(--radius-full)",
    borderBottom: "var(--border-2) solid var(--color-white)",
    marginRight: "var(--spacing-2)",
    animation: "spin 1s linear infinite",
  },
  summaryContainer: {
    backgroundColor: "var(--color-bg-tertiary)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-4)",
  },
  summaryTitle: {
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-tertiary)",
    marginBottom: "var(--spacing-3)",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "var(--spacing-4)",
    marginBottom: "var(--spacing-4)",
  },
  summaryItem: {
    textAlign: "center",
  },
  summaryValue: {
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-secondary)",
  },
  summaryValueBoys: {
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-primary)",
  },
  summaryValueGirls: {
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-girls-text)",
  },
  summaryLabel: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-muted)",
  },
  degreeList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-2)",
  },
  degreeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "var(--font-size-xs)",
  },
  degreeRowLabel: {
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-tertiary)",
  },
  degreeRowValues: {
    display: "flex",
    gap: "var(--spacing-3)",
    color: "var(--color-text-body)",
  },
  boysValue: {
    color: "var(--color-primary)",
  },
  girlsValue: {
    color: "var(--color-girls-text)",
  },
}

const RegisteredStudentsForm = ({ degrees, registeredStudents, onUpdate, isLoading }) => {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    if (registeredStudents && degrees) {
      const initialCounts = {}
      degrees.forEach((degree) => {
        const existingData = registeredStudents[degree]
        if (typeof existingData === "object" && existingData !== null) {
          initialCounts[degree] = { total: existingData.total || 0, boys: existingData.boys || 0, girls: existingData.girls || 0 }
        } else {
          const numValue = parseInt(existingData) || 0
          initialCounts[degree] = { total: numValue, boys: 0, girls: 0 }
        }
      })
      setCounts(initialCounts)
    }
  }, [registeredStudents, degrees])

  const handleCountChange = (degree, field, value) => {
    const numValue = parseInt(value) || 0
    setCounts((prev) => ({ ...prev, [degree]: { ...prev[degree], [field]: numValue } }))
  }

  const validateCounts = (degreeData) => {
    const { total, boys, girls } = degreeData
    return boys + girls <= total
  }

  const handleSubmit = () => {
    const hasValidationErrors = degrees.some((degree) => {
      const degreeData = counts[degree] || { total: 0, boys: 0, girls: 0 }
      return !validateCounts(degreeData)
    })
    if (hasValidationErrors) {
      alert("Please fix validation errors before saving. Boys + Girls cannot exceed Total for any degree.")
      return
    }
    onUpdate(counts)
  }

  const hasChanges = () => {
    if (!registeredStudents) return Object.values(counts).some((count) => count?.total > 0 || count?.boys > 0 || count?.girls > 0)
    return degrees.some((degree) => {
      const currentCount = counts[degree] || { total: 0, boys: 0, girls: 0 }
      const originalData = registeredStudents[degree]
      let originalCount = { total: 0, boys: 0, girls: 0 }
      if (typeof originalData === "object" && originalData !== null) {
        originalCount = { total: originalData.total || 0, boys: originalData.boys || 0, girls: originalData.girls || 0 }
      } else {
        const numValue = parseInt(originalData) || 0
        originalCount = { total: numValue, boys: 0, girls: 0 }
      }
      return currentCount.total !== originalCount.total || currentCount.boys !== originalCount.boys || currentCount.girls !== originalCount.girls
    })
  }

  const hasValidationErrors = () => {
    return degrees.some((degree) => {
      const degreeData = counts[degree] || { total: 0, boys: 0, girls: 0 }
      return !validateCounts(degreeData)
    })
  }

  if (!degrees || degrees.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyText}>No degrees found</div>
        <div style={styles.emptySubText}>Please add degrees first in the Degrees tab</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.itemsContainer}>
        {degrees.map((degree) => {
          const degreeData = counts[degree] || { total: 0, boys: 0, girls: 0 }
          const isValid = validateCounts(degreeData)
          const borderColor = isValid ? "var(--color-border-primary)" : "var(--color-danger-border)"

          return (
            <div key={degree} style={{ ...styles.degreeCard, border: `var(--border-1) solid ${borderColor}` }}>
              <div style={styles.degreeHeader}>
                <h3 style={styles.degreeTitle}>{degree}</h3>
                <div style={styles.degreeSubtitle}>Registered students breakdown for this degree</div>
                {!isValid && (
                  <div style={styles.errorText}>
                    <svg style={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Boys + Girls ({degreeData.boys + degreeData.girls}) cannot exceed Total ({degreeData.total})
                  </div>
                )}
              </div>
              <div style={styles.inputGrid}>
                <div>
                  <label htmlFor={`total-${degree}`} style={styles.inputLabel}>Total</label>
                  <Input type="number" id={`total-${degree}`} min="0" value={counts[degree]?.total || 0} onChange={(e) => handleCountChange(degree, "total", e.target.value)} disabled={isLoading} />
                </div>
                <div>
                  <label htmlFor={`boys-${degree}`} style={styles.inputLabel}>Boys</label>
                  <Input type="number" id={`boys-${degree}`} min="0" value={counts[degree]?.boys || 0} onChange={(e) => handleCountChange(degree, "boys", e.target.value)} disabled={isLoading} />
                </div>
                <div>
                  <label htmlFor={`girls-${degree}`} style={styles.inputLabel}>Girls</label>
                  <Input type="number" id={`girls-${degree}`} min="0" value={counts[degree]?.girls || 0} onChange={(e) => handleCountChange(degree, "girls", e.target.value)} disabled={isLoading} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={styles.buttonContainer}>
        <Button onClick={handleSubmit} disabled={isLoading || !hasChanges() || hasValidationErrors()} variant="primary" size="md" loading={isLoading}>
          <HiSave /> Save Changes
        </Button>
      </div>

      <div style={styles.summaryContainer}>
        <h4 style={styles.summaryTitle}>Summary</h4>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValue}>{Object.values(counts).reduce((sum, count) => sum + (count?.total || 0), 0)}</div>
            <div style={styles.summaryLabel}>Total Students</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValueBoys}>{Object.values(counts).reduce((sum, count) => sum + (count?.boys || 0), 0)}</div>
            <div style={styles.summaryLabel}>Total Boys</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValueGirls}>{Object.values(counts).reduce((sum, count) => sum + (count?.girls || 0), 0)}</div>
            <div style={styles.summaryLabel}>Total Girls</div>
          </div>
        </div>
        <div style={styles.degreeList}>
          {degrees.map((degree) => {
            const degreeData = counts[degree] || { total: 0, boys: 0, girls: 0 }
            return (
              <div key={degree} style={styles.degreeRow}>
                <span style={styles.degreeRowLabel}>{degree}:</span>
                <div style={styles.degreeRowValues}>
                  <span>Total: {degreeData.total}</span>
                  <span style={styles.boysValue}>Boys: {degreeData.boys}</span>
                  <span style={styles.girlsValue}>Girls: {degreeData.girls}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RegisteredStudentsForm
