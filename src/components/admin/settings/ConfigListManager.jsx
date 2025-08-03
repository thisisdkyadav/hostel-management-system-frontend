import { useState, useEffect } from "react"
import { HiSave, HiPlus, HiX, HiPencil, HiTrash } from "react-icons/hi"
import Modal from "../../common/Modal"
import ConfirmationDialog from "../../common/ConfirmationDialog"

const ConfigListManager = ({ items = [], onUpdate, isLoading, title, description, itemLabel, placeholder, onRename }) => {
  const [localItems, setLocalItems] = useState(items)
  const [newItem, setNewItem] = useState("")
  const [error, setError] = useState("")
  const [selectedItem, setSelectedItem] = useState(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [renameLoading, setRenameLoading] = useState(false)

  // Update local items when props change
  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const handleAddItem = (e) => {
    e.preventDefault()
    if (!newItem.trim()) {
      setError("Please enter a value")
      return
    }

    // Check for duplicates
    if (localItems.some((item) => item.toLowerCase() === newItem.trim().toLowerCase())) {
      setError(`This ${itemLabel.toLowerCase()} already exists`)
      return
    }

    setLocalItems([...localItems, newItem.trim()])
    setNewItem("")
    setError("")
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
  }

  const handleRename = async () => {
    if (!newItemName.trim()) {
      return
    }

    if (newItemName === selectedItem) {
      setShowItemModal(false)
      return
    }

    // Check for duplicates
    if (localItems.some((item) => item.toLowerCase() === newItemName.trim().toLowerCase())) {
      setError(`This ${itemLabel.toLowerCase()} already exists`)
      return
    }

    setRenameLoading(true)
    try {
      if (onRename) {
        await onRename(selectedItem, newItemName.trim())
      }

      // Update the local items list with the renamed item
      const updatedItems = localItems.map((item) => (item === selectedItem ? newItemName.trim() : item))

      setLocalItems(updatedItems)
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
    onUpdate(localItems)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {title && <h3 className="text-lg font-medium text-gray-800">{title}</h3>}
        {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}

        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="text"
              value={newItem}
              onChange={(e) => {
                setNewItem(e.target.value)
                setError("")
              }}
              placeholder={placeholder || `Enter ${itemLabel}`}
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              disabled={isLoading}
            />
            <button type="button" onClick={handleAddItem} disabled={isLoading} className={`px-4 py-2 ${isLoading ? "bg-gray-400" : "bg-[#1360AB] hover:bg-[#0d4b86]"} text-white rounded-r-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}>
              <HiPlus />
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Current {itemLabel}s</h4>

          {localItems.length === 0 ? (
            <p className="text-sm text-gray-500">No {itemLabel.toLowerCase()}s added yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {localItems.map((item, index) => (
                <div key={index} className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1.5 cursor-pointer hover:bg-gray-100" onClick={() => handleItemClick(item)}>
                  <span className="text-sm text-gray-800 mr-2">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className={`w-full flex justify-center items-center px-4 py-3 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#1360AB] hover:bg-[#0d4b86]"} text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <HiSave className="mr-2" size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Item Management Modal */}
      {showItemModal && (
        <Modal
          title={`Manage ${itemLabel}`}
          onClose={() => {
            setShowItemModal(false)
            setError("")
          }}
          width={400}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Current {itemLabel}: <span className="font-medium">{selectedItem}</span>
            </p>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Rename {itemLabel}</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => {
                    setNewItemName(e.target.value)
                    setError("")
                  }}
                  placeholder={`Enter new ${itemLabel.toLowerCase()} name`}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  disabled={renameLoading}
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => setShowItemModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors" disabled={renameLoading}>
                Cancel
              </button>
              <button type="button" onClick={handleDeleteRequest} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center" disabled={renameLoading}>
                <HiTrash className="mr-1" />
                Delete
              </button>
              <button type="button" onClick={handleRename} className="px-4 py-2 bg-[#1360AB] hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center" disabled={renameLoading}>
                {renameLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                    Renaming...
                  </>
                ) : (
                  <>
                    <HiPencil className="mr-1" />
                    Rename
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
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
