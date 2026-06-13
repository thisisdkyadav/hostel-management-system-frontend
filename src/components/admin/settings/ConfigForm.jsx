import { useState, useEffect } from "react"
import { HiSave } from "react-icons/hi"
import { Checkbox, Alert } from "@/components/ui"
import { Button, Input } from "czero/react"

// "maxLeaveDays" / "max_leave_days" -> "Max Leave Days" (display only)
const formatKeyLabel = (key) =>
  String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

const ConfigForm = ({ config, onUpdate, isLoading }) => {
  const [formData, setFormData] = useState({})

  useEffect(() => {
    // Initialize form data with config values
    if (config && typeof config === "object") {
      setFormData({ ...config })
    }
  }, [config])

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = () => {
    onUpdate(formData)
  }

  const hasChanges = () => {
    if (!config) return false

    return Object.keys(config).some((key) => {
      const originalValue = config[key]
      const currentValue = formData[key]
      return originalValue !== currentValue
    })
  }

  const getInputType = (value) => {
    if (typeof value === "number") return "number"
    if (typeof value === "boolean") return "checkbox"
    return "text"
  }

  const renderInput = (key, value) => {
    const inputType = getInputType(value)

    if (inputType === "checkbox") {
      return <Checkbox id={`config-${key}`} checked={formData[key] || false} onChange={(e) => handleInputChange(key, e.target.checked)} disabled={isLoading} />
    }

    if (inputType === "number") {
      return (
        <Input type="number" id={`config-${key}`} value={formData[key] || 0} onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || 0)} disabled={isLoading} />
      )
    }

    // Text input for strings and other types
    return <Input type="text" id={`config-${key}`} value={formData[key] || ""} onChange={(e) => handleInputChange(key, e.target.value)} disabled={isLoading} />
  }

  if (!config || Object.keys(config).length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-[var(--color-text-muted)] mb-1.5">No configuration found</p>
        <p className="text-sm text-[var(--color-text-placeholder)]">The general configuration object is empty or not available</p>
      </div>
    )
  }

  const modifiedCount = Object.keys(config).filter((key) => formData[key] !== config[key]).length

  return (
    <div className="flex flex-col gap-5">
      <Alert type="warning" title="Configuration Editor">
        Only existing configuration keys can be modified — keys cannot be added or removed here. {Object.keys(config).length} keys loaded.
      </Alert>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] divide-y divide-[var(--color-border-light)] overflow-hidden">
        {Object.entries(config).map(([key, value]) => {
          const isModified = formData[key] !== value
          const inputType = getInputType(value)

          return (
            <div
              key={key}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 transition-[var(--transition-colors)] ${isModified ? "bg-[var(--color-primary-bg)]" : "bg-[var(--color-bg-primary)]"}`}
            >
              <div className="flex-1 min-w-0">
                <label htmlFor={`config-${key}`} className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                  {formatKeyLabel(key)}
                  <span className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-bg-muted)] text-[0.6rem] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{typeof value}</span>
                  {isModified && (
                    <span className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-warning-bg)] text-[0.6rem] font-bold uppercase tracking-wide text-[var(--color-warning-text)]">Modified</span>
                  )}
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-mono truncate">
                  {key}
                  {isModified && <span className="ml-2 font-sans">was: {typeof value === "boolean" ? value.toString() : String(value)}</span>}
                </p>
              </div>
              <div className={inputType === "checkbox" ? "shrink-0" : "w-full sm:w-64 shrink-0"}>{renderInput(key, value)}</div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-end gap-3 pt-1">
        {modifiedCount > 0 && (
          <span className="text-xs text-[var(--color-warning-text)]">{modifiedCount} unsaved change{modifiedCount === 1 ? "" : "s"}</span>
        )}
        <Button onClick={handleSubmit} disabled={isLoading || !hasChanges()} variant="primary" size="md" loading={isLoading}>
          <HiSave /> Save Changes
        </Button>
      </div>
    </div>
  )
}

export default ConfigForm
