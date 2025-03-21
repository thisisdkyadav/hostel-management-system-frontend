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
      <input type="date" value={formatDateForInput(selectedDate)} onChange={handleChange} min={getMinDate()} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" placeholder={placeholder} />
      <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
    </div>
  )
}

export default SimpleDatePicker
