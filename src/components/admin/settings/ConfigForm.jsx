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

  const renderInput = (key, value) => {
    const inputType = getInputType(value)

    if (inputType === "checkbox") {
      return <input type="checkbox" id={`config-${key}`} checked={formData[key] || false} onChange={(e) => handleInputChange(key, e.target.checked)} className="w-4 h-4 text-[#1360AB] bg-gray-100 border-gray-300 rounded focus:ring-[#1360AB] focus:ring-2" disabled={isLoading} />
    }

    if (inputType === "number") {
      return (
        <input type="number" id={`config-${key}`} value={formData[key] || 0} onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#1360AB] focus:border-[#1360AB] text-sm" disabled={isLoading} />
      )
    }

    // Text input for strings and other types
    return <input type="text" id={`config-${key}`} value={formData[key] || ""} onChange={(e) => handleInputChange(key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#1360AB] focus:border-[#1360AB] text-sm" disabled={isLoading} />
  }

  if (!config || Object.keys(config).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">No configuration found</div>
        <div className="text-sm text-gray-400">The general configuration object is empty or not available</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 text-amber-700 rounded-lg p-4 mb-6 flex items-start">
        <HiInformationCircle className="flex-shrink-0 mt-0.5 mr-3 h-5 w-5" />
        <div>
          <p className="text-sm font-medium mb-1">Configuration Editor</p>
          <p className="text-sm">Only existing configuration keys can be modified. You cannot add or remove keys from this interface.</p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label htmlFor={`config-${key}`} className="block text-sm font-medium text-gray-700 mb-1">
                  {key}
                </label>
                <div className="text-xs text-gray-500">
                  Type: {typeof value} | Current: {typeof value === "boolean" ? value.toString() : value}
                </div>
              </div>
              <div className="sm:ml-4 sm:w-64">{renderInput(key, value)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button onClick={handleSubmit} disabled={isLoading || !hasChanges()} className="flex items-center px-6 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            <div className="flex items-center">
              <HiSave className="mr-2 h-4 w-4" />
              Save Changes
            </div>
          )}
        </Button>
      </div>

      {/* Configuration Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Configuration Summary</h4>
        <div className="text-sm text-gray-600 mb-2">Total Configuration Keys: {Object.keys(config).length}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="text-xs text-gray-500 p-2 bg-white rounded border">
              <div className="font-medium truncate">{key}</div>
              <div className="truncate">{typeof value === "object" ? JSON.stringify(value) : value.toString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConfigForm
