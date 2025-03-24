import React from "react"
import { FaCalendarAlt } from "react-icons/fa"

const SimpleDatePicker = ({ selectedDate, onChange, placeholder, minDate }) => {
  const formatDateForInput = (date) => {
    if (!date) return ""

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  const handleChange = (e) => {
    const value = e.target.value
    if (!value) {
      onChange(null)
      return
    }

    const newDate = new Date(value)
    onChange(newDate)
  }

  const getMinDate = () => {
    if (minDate) {
      return formatDateForInput(minDate)
    }
    return null
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
        <FaCalendarAlt className="h-4 w-4" />
      </div>
      <input
        type="date"
        value={formatDateForInput(selectedDate)}
        onChange={handleChange}
        min={getMinDate()}
        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] transition-colors"
        placeholder={placeholder}
      />
    </div>
  )
}

export default SimpleDatePicker
