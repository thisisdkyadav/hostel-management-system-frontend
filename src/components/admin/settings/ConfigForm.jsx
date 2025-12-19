import { useState, useEffect } from "react"
import { HiSave, HiInformationCircle } from "react-icons/hi"
import Button from "../../common/Button"

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

  const styles = {
    checkbox: {
      width: "var(--icon-md)",
      height: "var(--icon-md)",
      accentColor: "var(--color-primary)",
      backgroundColor: "var(--color-bg-muted)",
      borderColor: "var(--color-border-input)",
      borderRadius: "var(--radius-sm)",
    },
    input: {
      width: "100%",
      padding: "var(--spacing-2) var(--spacing-3)",
      border: "var(--border-1) solid var(--color-border-input)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-sm)",
      fontSize: "var(--font-size-sm)",
      backgroundColor: "var(--color-bg-primary)",
      color: "var(--color-text-body)",
      transition: "var(--transition-all)",
      outline: "none",
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
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--spacing-6)",
    },
    infoBox: {
      backgroundColor: "var(--color-warning-bg-light)",
      color: "var(--color-warning-text)",
      borderRadius: "var(--radius-lg)",
      padding: "var(--spacing-4)",
      marginBottom: "var(--spacing-6)",
      display: "flex",
      alignItems: "flex-start",
    },
    infoIcon: {
      flexShrink: 0,
      marginTop: "var(--spacing-0-5)",
      marginRight: "var(--spacing-3)",
      width: "var(--icon-lg)",
      height: "var(--icon-lg)",
    },
    infoTitle: {
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)",
      marginBottom: "var(--spacing-1)",
    },
    infoDescription: {
      fontSize: "var(--font-size-sm)",
    },
    itemsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--spacing-4)",
    },
    configItem: {
      border: "var(--border-1) solid var(--color-border-primary)",
      borderRadius: "var(--radius-lg)",
      padding: "var(--spacing-4)",
      transition: "var(--transition-all)",
    },
    configItemInner: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--spacing-3)",
    },
    configLabel: {
      display: "block",
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--color-text-tertiary)",
      marginBottom: "var(--spacing-1)",
    },
    configMeta: {
      fontSize: "var(--font-size-xs)",
      color: "var(--color-text-muted)",
    },
    inputWrapper: {
      marginLeft: "0",
      width: "100%",
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
      marginBottom: "var(--spacing-2)",
    },
    summaryCount: {
      fontSize: "var(--font-size-sm)",
      color: "var(--color-text-body)",
      marginBottom: "var(--spacing-2)",
    },
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(1, 1fr)",
      gap: "var(--spacing-2)",
    },
    summaryItem: {
      fontSize: "var(--font-size-xs)",
      color: "var(--color-text-muted)",
      padding: "var(--spacing-2)",
      backgroundColor: "var(--color-bg-primary)",
      borderRadius: "var(--radius-md)",
      border: "var(--border-1) solid var(--color-border-primary)",
    },
    summaryItemLabel: {
      fontWeight: "var(--font-weight-medium)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    summaryItemValue: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  }

  const renderInput = (key, value) => {
    const inputType = getInputType(value)

    if (inputType === "checkbox") {
      return <input type="checkbox" id={`config-${key}`} checked={formData[key] || false} onChange={(e) => handleInputChange(key, e.target.checked)} style={styles.checkbox} disabled={isLoading} />
    }

    if (inputType === "number") {
      return (
        <input type="number" id={`config-${key}`} value={formData[key] || 0} onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || 0)} style={styles.input} disabled={isLoading} />
      )
    }

    // Text input for strings and other types
    return <input type="text" id={`config-${key}`} value={formData[key] || ""} onChange={(e) => handleInputChange(key, e.target.value)} style={styles.input} disabled={isLoading} />
  }

  if (!config || Object.keys(config).length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyText}>No configuration found</div>
        <div style={styles.emptySubText}>The general configuration object is empty or not available</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.infoBox}>
        <HiInformationCircle style={styles.infoIcon} />
        <div>
          <p style={styles.infoTitle}>Configuration Editor</p>
          <p style={styles.infoDescription}>Only existing configuration keys can be modified. You cannot add or remove keys from this interface.</p>
        </div>
      </div>

      <div style={styles.itemsContainer}>
        {Object.entries(config).map(([key, value]) => (
          <div key={key} style={styles.configItem}>
            <div style={styles.configItemInner}>
              <div style={{ flex: 1 }}>
                <label htmlFor={`config-${key}`} style={styles.configLabel}>
                  {key}
                </label>
                <div style={styles.configMeta}>
                  Type: {typeof value} | Current: {typeof value === "boolean" ? value.toString() : value}
                </div>
              </div>
              <div style={styles.inputWrapper}>{renderInput(key, value)}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.buttonContainer}>
        <Button onClick={handleSubmit} disabled={isLoading || !hasChanges()} style={{ ...styles.button, opacity: isLoading || !hasChanges() ? "var(--opacity-disabled)" : 1, cursor: isLoading || !hasChanges() ? "not-allowed" : "pointer" }}>
          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={styles.spinner}></div>
              Saving...
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center" }}>
              <HiSave style={styles.buttonIcon} />
              Save Changes
            </div>
          )}
        </Button>
      </div>

      {/* Configuration Summary */}
      <div style={styles.summaryContainer}>
        <h4 style={styles.summaryTitle}>Configuration Summary</h4>
        <div style={styles.summaryCount}>Total Configuration Keys: {Object.keys(config).length}</div>
        <div style={styles.summaryGrid}>
          {Object.entries(config).map(([key, value]) => (
            <div key={key} style={styles.summaryItem}>
              <div style={styles.summaryItemLabel}>{key}</div>
              <div style={styles.summaryItemValue}>{typeof value === "object" ? JSON.stringify(value) : value.toString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConfigForm
