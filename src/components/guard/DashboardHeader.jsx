import React from "react"
import { FaSearch, FaUserCircle } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"

const DashboardHeader = () => {
  const { user } = useAuth()

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <header className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row md:justify-between items-center">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-[#1360AB]">Security Dashboard</h1>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0 bg-gray-50 px-4 py-2 rounded-lg">
          <FaUserCircle className="text-[#1360AB]" size={25} />
          <div>
            <p className="font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
