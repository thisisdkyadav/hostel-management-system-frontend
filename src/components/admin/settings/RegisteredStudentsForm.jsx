import { useState, useEffect } from "react"
import { HiPlus, HiSave } from "react-icons/hi"
import Button from "../../common/Button"

const RegisteredStudentsForm = ({ degrees, registeredStudents, onUpdate, isLoading }) => {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    // Initialize counts from the registeredStudents data
    if (registeredStudents && degrees) {
      const initialCounts = {}
      degrees.forEach((degree) => {
        // Handle both old format (number) and new format (object)
        const existingData = registeredStudents[degree]
        if (typeof existingData === "object" && existingData !== null) {
          initialCounts[degree] = {
            total: existingData.total || 0,
            boys: existingData.boys || 0,
            girls: existingData.girls || 0,
          }
        } else {
          // Convert old number format to new object format
          const numValue = parseInt(existingData) || 0
          initialCounts[degree] = {
            total: numValue,
            boys: 0,
            girls: 0,
          }
        }
      })
      setCounts(initialCounts)
    }
  }, [registeredStudents, degrees])

  const handleCountChange = (degree, field, value) => {
    const numValue = parseInt(value) || 0
    setCounts((prev) => ({
      ...prev,
      [degree]: {
        ...prev[degree],
        [field]: numValue,
      },
    }))
  }

  const validateCounts = (degreeData) => {
    const { total, boys, girls } = degreeData
    return boys + girls <= total
  }

  const handleSubmit = () => {
    // Validate all degree counts before submitting
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
        originalCount = {
          total: originalData.total || 0,
          boys: originalData.boys || 0,
          girls: originalData.girls || 0,
        }
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
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">No degrees found</div>
        <div className="text-sm text-gray-400">Please add degrees first in the Degrees tab</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {degrees.map((degree) => {
          const degreeData = counts[degree] || { total: 0, boys: 0, girls: 0 }
          const isValid = validateCounts(degreeData)
          const borderColor = isValid ? "border-gray-200 hover:border-gray-300" : "border-red-200 hover:border-red-300"

          return (
            <div key={degree} className={`p-4 border ${borderColor} rounded-lg transition-colors`}>
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">{degree}</h3>
                <div className="text-xs text-gray-500">Registered students breakdown for this degree</div>
                {!isValid && (
                  <div className="text-xs text-red-600 mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Boys + Girls ({degreeData.boys + degreeData.girls}) cannot exceed Total ({degreeData.total})
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor={`total-${degree}`} className="block text-xs font-medium text-gray-600 mb-1">
                    Total
                  </label>
                  <input type="number" id={`total-${degree}`} min="0" value={counts[degree]?.total || 0} onChange={(e) => handleCountChange(degree, "total", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#1360AB] focus:border-[#1360AB] text-center"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor={`boys-${degree}`} className="block text-xs font-medium text-gray-600 mb-1">
                    Boys
                  </label>
                  <input type="number" id={`boys-${degree}`} min="0" value={counts[degree]?.boys || 0} onChange={(e) => handleCountChange(degree, "boys", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#1360AB] focus:border-[#1360AB] text-center"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor={`girls-${degree}`} className="block text-xs font-medium text-gray-600 mb-1">
                    Girls
                  </label>
                  <input type="number" id={`girls-${degree}`} min="0" value={counts[degree]?.girls || 0} onChange={(e) => handleCountChange(degree, "girls", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#1360AB] focus:border-[#1360AB] text-center"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button onClick={handleSubmit} disabled={isLoading || !hasChanges() || hasValidationErrors()} className="flex items-center px-6 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Summary</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">{Object.values(counts).reduce((sum, count) => sum + (count?.total || 0), 0)}</div>
            <div className="text-xs text-gray-500">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">{Object.values(counts).reduce((sum, count) => sum + (count?.boys || 0), 0)}</div>
            <div className="text-xs text-gray-500">Total Boys</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-pink-600">{Object.values(counts).reduce((sum, count) => sum + (count?.girls || 0), 0)}</div>
            <div className="text-xs text-gray-500">Total Girls</div>
          </div>
        </div>
        <div className="space-y-2">
          {degrees.map((degree) => {
            const degreeData = counts[degree] || { total: 0, boys: 0, girls: 0 }
            return (
              <div key={degree} className="flex justify-between items-center text-xs">
                <span className="font-medium text-gray-700">{degree}:</span>
                <div className="flex space-x-3 text-gray-600">
                  <span>Total: {degreeData.total}</span>
                  <span className="text-blue-600">Boys: {degreeData.boys}</span>
                  <span className="text-pink-600">Girls: {degreeData.girls}</span>
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
