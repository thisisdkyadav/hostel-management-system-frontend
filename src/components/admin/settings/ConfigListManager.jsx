import { useState, useEffect } from "react"
import { HiSave, HiPlus, HiX, HiPencil, HiTrash } from "react-icons/hi"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import ConfirmationDialog from "../../common/ConfirmationDialog"

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-4)",
  },
  title: {
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-secondary)",
  },
  description: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-muted)",
    marginBottom: "var(--spacing-4)",
  },
  inputContainer: {
    marginBottom: "var(--spacing-6)",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
  },
  input: {
    flex: 1,
    border: "var(--border-1) solid var(--color-border-input)",
    borderRadius: "var(--radius-lg) 0 0 var(--radius-lg)",
    padding: "var(--spacing-2) var(--spacing-4)",
    outline: "none",
    backgroundColor: "var(--color-bg-primary)",
    color: "var(--color-text-body)",
    fontSize: "var(--font-size-base)",
  },
  addButton: {
    padding: "var(--spacing-2) var(--spacing-4)",
    backgroundColor: "var(--color-primary)",
    color: "var(--color-white)",
    borderRadius: "0 var(--radius-lg) var(--radius-lg) 0",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition-all)",
  },
  errorText: {
    color: "var(--color-danger)",
    fontSize: "var(--font-size-xs)",
    marginTop: "var(--spacing-1)",
  },
  itemsContainer: {
    backgroundColor: "var(--color-bg-tertiary)",
    borderRadius: "var(--radius-lg)",
    border: "var(--border-1) solid var(--color-border-primary)",
    padding: "var(--spacing-4)",
  },
  itemsTitle: {
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-tertiary)",
    marginBottom: "var(--spacing-3)",
  },
  emptyText: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-muted)",
  },
  itemsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--spacing-2)",
  },
  itemChip: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "var(--color-bg-primary)",
    border: "var(--border-1) solid var(--color-border-primary)",
    borderRadius: "var(--radius-full)",
    padding: "var(--spacing-1-5) var(--spacing-3)",
    cursor: "pointer",
    transition: "var(--transition-all)",
  },
  itemChipText: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    marginRight: "var(--spacing-2)",
  },
  submitContainer: {
    paddingTop: "var(--spacing-4)",
  },
  submitButton: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "var(--spacing-3) var(--spacing-4)",
    color: "var(--color-white)",
    fontWeight: "var(--font-weight-medium)",
    borderRadius: "var(--radius-lg)",
    border: "none",
    cursor: "pointer",
    transition: "var(--transition-all)",
  },
  spinner: {
    width: "var(--icon-lg)",
    height: "var(--icon-lg)",
    borderRadius: "var(--radius-full)",
    borderBottom: "var(--border-2) solid var(--color-white)",
    marginRight: "var(--spacing-2)",
    animation: "spin 1s linear infinite",
  },
  spinnerSm: {
    width: "var(--icon-md)",
    height: "var(--icon-md)",
    borderRadius: "var(--radius-full)",
    borderBottom: "var(--border-2) solid var(--color-white)",
    marginRight: "var(--spacing-1)",
    animation: "spin 1s linear infinite",
  },
  saveIcon: {
    marginRight: "var(--spacing-2)",
  },
  modalContent: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-4)",
  },
  modalText: {
    color: "var(--color-text-body)",
  },
  modalLabel: {
    display: "block",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-tertiary)",
  },
  modalInput: {
    flex: 1,
    border: "var(--border-1) solid var(--color-border-input)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-2) var(--spacing-4)",
    outline: "none",
    backgroundColor: "var(--color-bg-primary)",
    color: "var(--color-text-body)",
    fontSize: "var(--font-size-base)",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "var(--spacing-3)",
    paddingTop: "var(--spacing-4)",
  },
  cancelButton: {
    padding: "var(--spacing-2) var(--spacing-4)",
    backgroundColor: "var(--color-bg-hover)",
    color: "var(--color-text-tertiary)",
    borderRadius: "var(--radius-lg)",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    border: "none",
    cursor: "pointer",
    transition: "var(--transition-all)",
  },
  deleteButton: {
    padding: "var(--spacing-2) var(--spacing-4)",
    backgroundColor: "var(--color-danger)",
    color: "var(--color-white)",
    borderRadius: "var(--radius-lg)",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "var(--transition-all)",
  },
  renameButton: {
    padding: "var(--spacing-2) var(--spacing-4)",
    backgroundColor: "var(--color-primary)",
    color: "var(--color-white)",
    borderRadius: "var(--radius-lg)",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "var(--transition-all)",
  },
  iconSm: {
    marginRight: "var(--spacing-1)",
  },
}

const ConfigListManager = ({ items = [], onUpdate, isLoading, title, description, itemLabel, placeholder, onRename }) => {
  const [localItems, setLocalItems] = useState(items)
  const [newItem, setNewItem] = useState("")
  const [error, setError] = useState("")
  const [selectedItem, setSelectedItem] = useState(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [renameLoading, setRenameLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    setLocalItems(items)
    setHasUnsavedChanges(false)
  }, [items])

  const handleAddItem = (e) => {
    e.preventDefault()
    if (!newItem.trim()) {
      setError("Please enter a value")
      return
    }

    if (localItems.some((item) => item.toLowerCase() === newItem.trim().toLowerCase())) {
      setError(`This ${itemLabel.toLowerCase()} already exists`)
      return
    }

    setLocalItems([...localItems, newItem.trim()])
    setNewItem("")
    setError("")
    setHasUnsavedChanges(true)
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setNewItemName(item)
    setShowItemModal(true)
  }

  const handleDeleteRequest = () => {
    setShowItemModal(false)
    setShowDeleteConfirmation(true)
  }

  const handleRemoveItem = () => {
    const updatedItems = localItems.filter((item) => item !== selectedItem)
    setLocalItems(updatedItems)
    setShowDeleteConfirmation(false)
    setSelectedItem(null)
    setHasUnsavedChanges(true)
  }

  const handleRename = async () => {
    if (!newItemName.trim()) return
    if (newItemName === selectedItem) {
      setShowItemModal(false)
      return
    }

    if (localItems.some((item) => item.toLowerCase() === newItemName.trim().toLowerCase())) {
      setError(`This ${itemLabel.toLowerCase()} already exists`)
      return
    }

    setRenameLoading(true)
    try {
      if (onRename) await onRename(selectedItem, newItemName.trim())
      setShowItemModal(false)
      setSelectedItem(null)
      setError("")
    } catch (err) {
      console.error(`Error renaming ${itemLabel.toLowerCase()}:`, err)
      setError(`Failed to rename ${itemLabel.toLowerCase()}. ${err.message || ""}`)
    } finally {
      setRenameLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (hasUnsavedChanges) {
      onUpdate(localItems)
      setHasUnsavedChanges(false)
    }
  }

  const getSubmitButtonStyle = () => {
    if (isLoading) return { ...styles.submitButton, backgroundColor: "var(--color-text-disabled)", cursor: "not-allowed" }
    if (hasUnsavedChanges) return { ...styles.submitButton, backgroundColor: "var(--color-primary)" }
    return { ...styles.submitButton, backgroundColor: "var(--color-border-dark)", color: "var(--color-text-body)", cursor: "not-allowed" }
  }

  return (
    <>
      <form onSubmit={handleSubmit} style={styles.form}>
        {title && <h3 style={styles.title}>{title}</h3>}
        {description && <p style={styles.description}>{description}</p>}

        <div style={styles.inputContainer}>
          <div style={styles.inputWrapper}>
            <Input type="text" value={newItem} onChange={(e) => { setNewItem(e.target.value); setError("") }}
              placeholder={placeholder || `Enter ${itemLabel}`}
              disabled={isLoading}
            />
            <Button type="button" onClick={handleAddItem} disabled={isLoading} variant="primary" size="medium" icon={<HiPlus />} />
          </div>
          {error && <p style={styles.errorText}>{error}</p>}
        </div>

        <div style={styles.itemsContainer}>
          <h4 style={styles.itemsTitle}>Current {itemLabel}s</h4>
          {localItems.length === 0 ? (
            <p style={styles.emptyText}>No {itemLabel.toLowerCase()}s added yet</p>
          ) : (
            <div style={styles.itemsGrid}>
              {localItems.map((item, index) => (
                <div key={index} style={styles.itemChip} onClick={() => handleItemClick(item)}>
                  <span style={styles.itemChipText}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.submitContainer}>
          <Button type="submit" variant="primary" size="large" fullWidth isLoading={isLoading} disabled={isLoading || !hasUnsavedChanges} icon={!isLoading ? <HiSave size={20} /> : null}>
            {isLoading ? "Updating..." : hasUnsavedChanges ? "Save Changes" : "No Changes to Save"}
          </Button>
        </div>
      </form>

      {showItemModal && (
        <Modal title={`Manage ${itemLabel}`} onClose={() => { setShowItemModal(false); setError("") }} width={400}>
          <div style={styles.modalContent}>
            <p style={styles.modalText}>
              Current {itemLabel}: <span style={{ fontWeight: "var(--font-weight-medium)" }}>{selectedItem}</span>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
              <label style={styles.modalLabel}>Rename {itemLabel}</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Input type="text" value={newItemName} onChange={(e) => { setNewItemName(e.target.value); setError("") }}
                  placeholder={`Enter new ${itemLabel.toLowerCase()} name`}
                  disabled={renameLoading}
                />
              </div>
              {error && <p style={styles.errorText}>{error}</p>}
            </div>
            <div style={styles.modalActions}>
              <Button type="button" onClick={() => setShowItemModal(false)} variant="secondary" size="medium" disabled={renameLoading}>
                Cancel
              </Button>
              <Button type="button" onClick={handleDeleteRequest} variant="danger" size="medium" icon={<HiTrash />} disabled={renameLoading}>
                Delete
              </Button>
              <Button type="button" onClick={handleRename} variant="primary" size="medium" icon={<HiPencil />} isLoading={renameLoading} disabled={renameLoading}>
                {renameLoading ? "Renaming..." : "Rename"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmationDialog isOpen={showDeleteConfirmation} onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleRemoveItem}
        title={`Delete ${itemLabel}`}
        message={`Are you sure you want to delete "${selectedItem}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  )
}

export default ConfigListManager
