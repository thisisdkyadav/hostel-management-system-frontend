import React from "react"
import { FaBuilding } from "react-icons/fa"

const NoResults = ({ icon, message = "No results found", suggestion = "Try changing your search or filter criteria" }) => {
  return (
    <div className="mt-8 text-center py-12 px-4 bg-white rounded-xl shadow-sm">
      <div className="animate-pulse mx-auto bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">{icon || <FaBuilding className="text-gray-300 text-3xl" />}</div>
      <h3 className="text-xl font-medium text-gray-600">{message}</h3>
      <p className="text-gray-400 mt-2 max-w-md mx-auto">{suggestion}</p>
    </div>
  )
}

export default NoResults
