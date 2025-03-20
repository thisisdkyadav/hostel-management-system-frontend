import React from "react"
import { FaTimes, FaUserCircle, FaDoorOpen, FaClock, FaCalendarAlt } from "react-icons/fa"

const EntryDetails = ({ entry, onClose }) => {
  if (!entry) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1360AB]">Entry Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-4">
            <div className="bg-[#1360AB] p-3 rounded-full text-white mr-4">
              <FaUserCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{entry.name}</h3>
              <p className="text-gray-500 text-sm">{entry.id}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <FaDoorOpen className="text-[#1360AB] mr-3" />
              <div>
                <p className="text-sm text-gray-500">Room Number</p>
                <p className="font-medium">{entry.room}</p>
              </div>
            </div>

            <div className="flex items-center">
              <FaCalendarAlt className="text-[#1360AB] mr-3" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{entry.date}</p>
              </div>
            </div>

            <div className="flex items-center">
              <FaClock className="text-[#1360AB] mr-3" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{entry.time}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-gray-500">Status</p>
              <span className={`mt-1 px-3 py-1 inline-flex text-sm font-semibold rounded-full ${entry.status === "Checked In" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{entry.status}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default EntryDetails
