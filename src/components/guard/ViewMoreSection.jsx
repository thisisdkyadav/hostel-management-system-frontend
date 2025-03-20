import React, { useState } from "react"
import { FaPlus, FaTrash, FaFileExport, FaFilter } from "react-icons/fa"

const ViewMoreSection = ({ entries, onDelete }) => {
  const [selectedEntries, setSelectedEntries] = useState([])
  const [filterStatus, setFilterStatus] = useState("All")

  const handleSelect = (id) => {
    if (selectedEntries.includes(id)) {
      setSelectedEntries(selectedEntries.filter((entryId) => entryId !== id))
    } else {
      setSelectedEntries([...selectedEntries, id])
    }
  }

  const handleDeleteSelected = () => {
    selectedEntries.forEach((id) => onDelete(id))
    setSelectedEntries([])
  }

  const filteredEntries = filterStatus === "All" ? entries : entries.filter((entry) => entry.status === filterStatus)

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[#1360AB] mb-3 md:mb-0">Manage Entries</h2>

        <div className="flex space-x-3">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1360AB] focus:outline-none">
            <option value="All">All Statuses</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
          </select>

          <button className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition">
            <FaFileExport /> Export
          </button>

          <button onClick={handleDeleteSelected} disabled={selectedEntries.length === 0} className={`flex items-center gap-1 px-3 py-2 rounded-lg transition ${selectedEntries.length > 0 ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEntries(filteredEntries.map((entry) => entry.id))
                    } else {
                      setSelectedEntries([])
                    }
                  }}
                  className="rounded text-[#1360AB] focus:ring-[#1360AB]"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" checked={selectedEntries.includes(entry.id)} onChange={() => handleSelect(entry.id)} className="rounded text-[#1360AB] focus:ring-[#1360AB]" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.room}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.date} | {entry.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.status === "Checked In" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{entry.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ViewMoreSection
