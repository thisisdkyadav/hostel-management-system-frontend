import React from "react"
import { Link } from "react-router-dom"
import { FiSearch } from "react-icons/fi"
import { CgSearchFound } from "react-icons/cg"

const LostFoundSummary = ({ lostAndFoundStats }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-800 flex items-center">
          <FiSearch className="mr-2 text-[#1360AB]" /> Lost & Found
        </h3>
        <Link to="lost-and-found" className="text-xs text-[#1360AB] hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orange-50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
          <div className="bg-orange-100 p-2 rounded-full mb-2">
            <CgSearchFound className="text-orange-500 text-xl" />
          </div>
          <span className="text-2xl font-bold text-orange-500">{lostAndFoundStats?.active || 0}</span>
          <span className="text-xs text-gray-600 mt-1">Active Items</span>
        </div>

        <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
          <div className="bg-green-100 p-2 rounded-full mb-2">
            <FiSearch className="text-green-500 text-xl" />
          </div>
          <span className="text-2xl font-bold text-green-500">{lostAndFoundStats?.claimed || 0}</span>
          <span className="text-xs text-gray-600 mt-1">Claimed Items</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <Link to="lost-and-found" className="block w-full text-center bg-[#E4F1FF] text-[#1360AB] py-2 rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300 text-sm font-medium">
          Browse Active Items
        </Link>
      </div>
    </div>
  )
}

export default LostFoundSummary
