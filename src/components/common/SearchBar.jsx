import React, { useState } from "react"
import { FaSearch, FaTimes } from "react-icons/fa"
import { Button } from "czero/react"
import Input from "./ui/Input"

const SearchBar = ({ value, onChange, placeholder = "Search...", className }) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleClear = () => {
    const event = { target: { value: "" } }
    onChange(event)
  }

  return (
    <div className={`relative ${className}`}>
      <Input type="text" placeholder={placeholder} value={value} onChange={onChange} icon={<FaSearch size={14} />} />

      {/* Clear Button */}
      {value && (
        <Button onClick={handleClear}
          variant="ghost"
          size="sm"
          aria-label="Clear search"
          style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}
        ><FaTimes size={14} /></Button>
      )}
    </div>
  )
}

export default SearchBar
