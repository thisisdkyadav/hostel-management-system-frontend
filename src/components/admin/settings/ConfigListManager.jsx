import { useState, useEffect } from "react"
import { HiSave, HiPlus, HiX, HiTrash } from "react-icons/hi"

const ConfigListManager = ({ items = [], onUpdate, isLoading, title, description, itemLabel, placeholder }) => {
  const [localItems, setLocalItems] = useState(items)
  const [newItem, setNewItem] = useState("")
  const [error, setError] = useState("")

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

  const handleRemoveItem = (index) => {
    const updatedItems = [...localItems]
    updatedItems.splice(index, 1)
    setLocalItems(updatedItems)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdate(localItems)
  }

  return (
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
              <div key={index} className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1.5">
                <span className="text-sm text-gray-800 mr-2">{item}</span>
                <button type="button" onClick={() => handleRemoveItem(index)} disabled={isLoading} className="text-gray-500 hover:text-red-500">
                  <HiX size={16} />
                </button>
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
  )
}

export default ConfigListManager
