import React from "react"
import { FaBuilding } from "react-icons/fa"

const NoResults = ({ icon, message = "No results found", suggestion = "Try changing your search or filter criteria" }) => {
  return (
    <div className="mt-10 text-center py-16 bg-white rounded-[20px] shadow-[0px_1px_20px_rgba(0,0,0,0.06)]">
      {icon || <FaBuilding className="mx-auto text-gray-300 text-5xl mb-4" />}
      <h3 className="text-xl font-medium text-gray-500">{message}</h3>
      <p className="text-gray-400 mt-2">{suggestion}</p>
    </div>
  )
}

export default NoResults
