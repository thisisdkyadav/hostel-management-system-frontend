import React, { useState } from "react"
import { FaInfoCircle, FaChevronDown } from "react-icons/fa"
import EntryDetails from "./EntryDetails"

const EntriesTable = ({ entries, toggleViewMore }) => {
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleShowDetails = (entry) => {
    setSelectedEntry(entry)
    setShowDetails(true)
  }

  const closeDetails = () => {
    setShowDetails(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[#1360AB]">Recent Entries</h2>
        <button onClick={toggleViewMore} className="flex items-center gap-1 text-gray-600 hover:text-[#1360AB] transition">
          View More <FaChevronDown />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-[#1360AB] text-white">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg">S.No</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Room No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, index) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.room}</td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.time}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.status === "Checked In" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{entry.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button onClick={() => handleShowDetails(entry)} className="text-[#1360AB] hover:text-blue-700 transition flex items-center gap-1 mx-auto">
                    <FaInfoCircle /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetails && <EntryDetails entry={selectedEntry} onClose={closeDetails} />}
    </div>
  )
}

export default EntriesTable
