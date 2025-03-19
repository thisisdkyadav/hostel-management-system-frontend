import React from "react"
import { FaSearch } from "react-icons/fa"

const SearchBar = ({ value, onChange, placeholder = "Search...", className }) => {
  return (
    <div className={`relative ${className}`}>
      <input type="text" placeholder={placeholder} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1360AB]" value={value} onChange={onChange} />
      <FaSearch className="absolute left-3 top-3 text-gray-400" />
    </div>
  )
}

export default SearchBar
