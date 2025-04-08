import React from "react"
import { Link } from "react-router-dom"
import { FiSearch } from "react-icons/fi"
import { CgSearchFound } from "react-icons/cg"

const LostFoundSummary = ({ lostAndFoundStats }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800 text-sm flex items-center">
          <FiSearch className="mr-1.5 text-[#1360AB]" /> Lost & Found
        </h3>
        <Link to="lost-and-found" className="text-xs text-[#1360AB] hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-orange-50 rounded-lg p-2.5 flex flex-col items-center justify-center text-center">
          <div className="bg-orange-100 p-1.5 rounded-full mb-1">
            <CgSearchFound className="text-orange-500 text-lg" />
          </div>
          <span className="text-xl font-bold text-orange-500">{lostAndFoundStats?.active || 0}</span>
          <span className="text-[10px] text-gray-600">Active Items</span>
        </div>

        <div className="bg-green-50 rounded-lg p-2.5 flex flex-col items-center justify-center text-center">
          <div className="bg-green-100 p-1.5 rounded-full mb-1">
            <FiSearch className="text-green-500 text-lg" />
          </div>
          <span className="text-xl font-bold text-green-500">{lostAndFoundStats?.claimed || 0}</span>
          <span className="text-[10px] text-gray-600">Claimed Items</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100">
        <Link to="lost-and-found" className="block w-full text-center bg-[#E4F1FF] text-[#1360AB] py-1.5 rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300 text-xs font-medium">
          Browse Active Items
        </Link>
      </div>
    </div>
  )
}

export default LostFoundSummary
