import React from "react"
import { Link } from "react-router-dom"
import { FaArrowRight } from "react-icons/fa"

const QuickAccessCard = ({ title, description, icon, link, color }) => {
  return (
    <Link to={link} className="bg-white rounded-lg p-6 hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
      <div className="flex items-center text-blue-600 text-sm font-medium mt-auto">
        Access
        <FaArrowRight className="ml-2 h-3 w-3" />
      </div>
    </Link>
  )
}

export default QuickAccessCard
