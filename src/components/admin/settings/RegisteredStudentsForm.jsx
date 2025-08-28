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
        initialCounts[degree] = registeredStudents[degree] || 0
      })
      setCounts(initialCounts)
    }
  }, [registeredStudents, degrees])

  const handleCountChange = (degree, value) => {
    const numValue = parseInt(value) || 0
    setCounts((prev) => ({
      ...prev,
      [degree]: numValue,
    }))
  }

  const handleSubmit = () => {
    onUpdate(counts)
  }

  const hasChanges = () => {
    if (!registeredStudents) return Object.values(counts).some((count) => count > 0)

    return degrees.some((degree) => {
      const currentCount = counts[degree] || 0
      const originalCount = registeredStudents[degree] || 0
      return currentCount !== originalCount
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
        {degrees.map((degree) => (
          <div key={degree} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <div className="flex-1">
              <label htmlFor={`count-${degree}`} className="block text-sm font-medium text-gray-700 mb-1">
                {degree}
              </label>
              <div className="text-xs text-gray-500">Total registered students for this degree</div>
            </div>
            <div className="ml-4">
              <input
                type="number"
                id={`count-${degree}`}
                min="0"
                value={counts[degree] || 0}
                onChange={(e) => handleCountChange(degree, e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#1360AB] focus:border-[#1360AB] text-center"
                disabled={isLoading}
              />
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

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
        <div className="text-sm text-gray-600">Total Registered Students: {Object.values(counts).reduce((sum, count) => sum + (count || 0), 0)}</div>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {degrees.map((degree) => (
            <div key={degree} className="text-xs text-gray-500">
              {degree}: {counts[degree] || 0}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RegisteredStudentsForm
