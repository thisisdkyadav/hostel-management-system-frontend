import { useEffect, useState } from "react"
import { Button, Input } from "czero/react"
import { HiPlus, HiSave } from "react-icons/hi"
import { createCustomCategoryDefinition } from "@/components/gymkhana/events-page/shared"

const panelStyles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-4)",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-2)",
  },
  title: {
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-secondary)",
  },
  description: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-muted)",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "var(--spacing-3)",
    alignItems: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
    padding: "var(--spacing-1) var(--spacing-2)",
    borderRadius: "var(--radius-full)",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)",
    backgroundColor: "var(--color-bg-secondary)",
    color: "var(--color-text-muted)",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-3)",
    padding: "var(--spacing-4)",
    borderRadius: "var(--radius-lg)",
    border: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-tertiary)",
  },
  addSection: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "var(--spacing-3)",
    alignItems: "center",
  },
  footer: {
    paddingTop: "var(--spacing-2)",
  },
  error: {
    color: "var(--color-danger)",
    fontSize: "var(--font-size-xs)",
  },
}

const GymkhanaCategoryManager = ({
  categories = [],
  onUpdate,
  isLoading = false,
}) => {
  const [localCategories, setLocalCategories] = useState(categories)
  const [newCategoryLabel, setNewCategoryLabel] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setLocalCategories(categories)
    setHasUnsavedChanges(false)
    setError("")
  }, [categories])

  const hasDuplicateLabel = (label, currentKey = null) =>
    localCategories.some(
      (category) =>
        category.key !== currentKey &&
        String(category.label || "").trim().toLowerCase() === String(label || "").trim().toLowerCase()
    )

  const handleLabelChange = (categoryKey, nextLabel) => {
    setLocalCategories((current) =>
      current.map((category) =>
        category.key === categoryKey ? { ...category, label: nextLabel } : category
      )
    )
    setHasUnsavedChanges(true)
    setError("")
  }

  const handleAddCategory = () => {
    const nextLabel = String(newCategoryLabel || "").trim()
    if (!nextLabel) {
      setError("Enter a category name before adding it.")
      return
    }

    if (hasDuplicateLabel(nextLabel)) {
      setError("That category already exists.")
      return
    }

    const nextCategory = createCustomCategoryDefinition(nextLabel, localCategories)
    setLocalCategories((current) => [...current, nextCategory])
    setNewCategoryLabel("")
    setHasUnsavedChanges(true)
    setError("")
  }

  const handleSave = (event) => {
    event.preventDefault()

    if (localCategories.some((category) => !String(category.label || "").trim())) {
      setError("Every category needs a label before saving.")
      return
    }

    const labelSet = new Set()
    for (const category of localCategories) {
      const normalizedLabel = String(category.label || "").trim().toLowerCase()
      if (labelSet.has(normalizedLabel)) {
        setError("Category labels must be unique.")
        return
      }
      labelSet.add(normalizedLabel)
    }

    setError("")
    onUpdate?.(localCategories)
  }

  return (
    <form onSubmit={handleSave} style={panelStyles.wrapper}>
      <div style={panelStyles.header}>
        <h3 style={panelStyles.title}>Gymkhana Categories</h3>
        <p style={panelStyles.description}>
          Manage the global Gymkhana category catalog used across calendars, stats, and category-based budget caps. The four base categories stay in the system, but you can rename them and add more.
        </p>
      </div>

      <div style={panelStyles.list}>
        {localCategories.map((category) => (
          <div key={category.key} style={panelStyles.row}>
            <Input
              value={category.label || ""}
              onChange={(event) => handleLabelChange(category.key, event.target.value)}
              placeholder="Category label"
              disabled={isLoading}
            />
            <span style={panelStyles.badge}>
              {category.isDefault ? "Default" : "Custom"}
            </span>
          </div>
        ))}
      </div>

      <div style={panelStyles.addSection}>
        <Input
          value={newCategoryLabel}
          onChange={(event) => {
            setNewCategoryLabel(event.target.value)
            setError("")
          }}
          placeholder="Add new Gymkhana category"
          disabled={isLoading}
        />
        <Button type="button" variant="secondary" onClick={handleAddCategory} disabled={isLoading}>
          <HiPlus /> Add
        </Button>
      </div>

      {error ? <p style={panelStyles.error}>{error}</p> : null}

      <div style={panelStyles.footer}>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading || !hasUnsavedChanges}
        >
          {!isLoading ? <HiSave size={20} /> : null}{" "}
          {isLoading ? "Saving..." : hasUnsavedChanges ? "Save Changes" : "No Changes to Save"}
        </Button>
      </div>
    </form>
  )
}

export default GymkhanaCategoryManager
