import { useState, useEffect } from "react"
import { HiSave, HiExclamationCircle } from "react-icons/hi"
import { Button, Input } from "czero/react"

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
      <div className="text-center py-10">
        <p className="text-[var(--color-text-muted)] mb-1.5">No degrees found</p>
        <p className="text-sm text-[var(--color-text-placeholder)]">Please add degrees first in the Degrees section</p>
      </div>
    )
  }

  const totals = Object.values(counts).reduce(
    (acc, count) => {
      acc.total += count?.total || 0
      acc.boys += count?.boys || 0
      acc.girls += count?.girls || 0
      return acc
    },
    { total: 0, boys: 0, girls: 0 }
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-center">
          <p className="text-lg font-semibold text-[var(--color-text-secondary)] tabular-nums">{totals.total}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Total Students</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-center">
          <p className="text-lg font-semibold text-[var(--color-primary)] tabular-nums">{totals.boys}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Total Boys</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-center">
          <p className="text-lg font-semibold text-[var(--color-girls-text)] tabular-nums">{totals.girls}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Total Girls</p>
        </div>
      </div>

      {/* Degree table */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 items-center bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-primary)] px-4 py-2">
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Degree</span>
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--color-text-muted)] text-center">Total</span>
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--color-primary)] text-center">Boys</span>
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--color-girls-text)] text-center">Girls</span>
        </div>

        {degrees.map((degree, index) => {
          const degreeData = counts[degree] || { total: 0, boys: 0, girls: 0 }
          const isValid = validateCounts(degreeData)

          return (
            <div key={degree} className={`${index > 0 ? "border-t border-[var(--color-border-light)]" : ""} ${!isValid ? "bg-[var(--color-danger-bg)]" : ""}`}>
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 items-center px-4 py-2.5">
                <span className="text-sm font-medium text-[var(--color-text-secondary)] truncate">{degree}</span>
                <Input type="number" id={`total-${degree}`} min="0" value={counts[degree]?.total || 0} onChange={(e) => handleCountChange(degree, "total", e.target.value)} disabled={isLoading} />
                <Input type="number" id={`boys-${degree}`} min="0" value={counts[degree]?.boys || 0} onChange={(e) => handleCountChange(degree, "boys", e.target.value)} disabled={isLoading} />
                <Input type="number" id={`girls-${degree}`} min="0" value={counts[degree]?.girls || 0} onChange={(e) => handleCountChange(degree, "girls", e.target.value)} disabled={isLoading} />
              </div>
              {!isValid && (
                <p className="flex items-center gap-1 px-4 pb-2 text-xs text-[var(--color-danger-text)]">
                  <HiExclamationCircle className="h-3.5 w-3.5 shrink-0" />
                  Boys + Girls ({degreeData.boys + degreeData.girls}) cannot exceed Total ({degreeData.total})
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-end pt-1">
        <Button onClick={handleSubmit} disabled={isLoading || !hasChanges() || hasValidationErrors()} variant="primary" size="md" loading={isLoading}>
          <HiSave /> Save Changes
        </Button>
      </div>
    </div>
  )
}

export default RegisteredStudentsForm
