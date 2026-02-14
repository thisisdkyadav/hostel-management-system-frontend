import React from "react"
import { FaCalendarAlt } from "react-icons/fa"
import { Input } from "czero/react"

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
      <Input type="date" value={formatDateForInput(selectedDate)} onChange={handleChange} min={getMinDate()} icon={<FaCalendarAlt className="h-4 w-4" />} placeholder={placeholder} />
    </div>
  )
}

export default SimpleDatePicker
