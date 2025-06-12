import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../services/inventoryApi"
import { FaFilter, FaChartPie, FaBuilding, FaUserGraduate, FaListAlt, FaBox, FaBoxes } from "react-icons/fa"
import { useGlobal } from "../../../contexts/GlobalProvider"

const InventoryReports = () => {
  const { hostelList } = useGlobal()
  const [activeTab, setActiveTab] = useState("hostel")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedHostel, setSelectedHostel] = useState("")
  const [hostelSummary, setHostelSummary] = useState([])
  const [studentSummary, setStudentSummary] = useState([])
  const [itemTypeSummary, setItemTypeSummary] = useState([])

  // Fetch hostel summary
  const fetchHostelSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.getInventorySummaryByHostel()
      setHostelSummary(response)
    } catch (err) {
      setError(err.message || "Failed to fetch hostel inventory summary")
    } finally {
      setLoading(false)
    }
  }

  // Fetch student summary
  const fetchStudentSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.getInventorySummaryByStudent({
        hostelId: selectedHostel || undefined,
      })
      setStudentSummary(response)
    } catch (err) {
      setError(err.message || "Failed to fetch student inventory summary")
    } finally {
      setLoading(false)
    }
  }

  // Fetch item type summary
  const fetchItemTypeSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.getInventorySummaryByItemType({
        hostelId: selectedHostel || undefined,
      })
      setItemTypeSummary(response)
    } catch (err) {
      setError(err.message || "Failed to fetch item type inventory summary")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "hostel") {
      fetchHostelSummary()
    } else if (activeTab === "student") {
      fetchStudentSummary()
    } else if (activeTab === "itemType") {
      fetchItemTypeSummary()
    }
  }, [activeTab, selectedHostel])

  // Handle hostel filter change
  const handleHostelChange = (e) => {
    setSelectedHostel(e.target.value)
  }

  // Get hostel name
  const getHostelName = (id) => {
    if (!hostelList) return "Unknown Hostel"
    const hostel = hostelList.find((h) => h._id === id)
    return hostel ? hostel.name : "Unknown Hostel"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Inventory Reports</h3>
          <p className="text-sm text-gray-500">View inventory distribution across hostels and students</p>
        </div>

        {/* Hostel Filter (only for student and item type tabs) */}
        {activeTab !== "hostel" && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter by Hostel:</label>
            <select value={selectedHostel} onChange={handleHostelChange} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]">
              <option value="">All Hostels</option>
              {hostelList &&
                hostelList.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab("hostel")} className={`py-4 px-1 flex items-center font-medium text-sm border-b-2 ${activeTab === "hostel" ? "border-[#1360AB] text-[#1360AB]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            <FaBuilding className="mr-2" /> By Hostel
          </button>
          <button onClick={() => setActiveTab("student")} className={`py-4 px-1 flex items-center font-medium text-sm border-b-2 ${activeTab === "student" ? "border-[#1360AB] text-[#1360AB]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            <FaUserGraduate className="mr-2" /> By Student
          </button>
          <button onClick={() => setActiveTab("itemType")} className={`py-4 px-1 flex items-center font-medium text-sm border-b-2 ${activeTab === "itemType" ? "border-[#1360AB] text-[#1360AB]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            <FaListAlt className="mr-2" /> By Item Type
          </button>
        </nav>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-12 h-12 border-4 border-[#1360AB] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Hostel Summary */}
      {activeTab === "hostel" && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostelSummary.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FaBoxes className="mx-auto text-gray-300 text-5xl mb-4" />
              <p className="text-gray-500">No hostel inventory data available</p>
            </div>
          ) : (
            hostelSummary.map((hostel) => (
              <div key={hostel._id} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
                    <FaBuilding className="text-[#1360AB]" />
                  </div>
                  <div className="text-lg font-medium text-gray-800">{hostel.hostelName}</div>
                </div>
                <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">Total Allocated</div>
                    <div className="text-lg font-semibold">{hostel.totalAllocated}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Available</div>
                    <div className="text-lg font-semibold text-green-600">{hostel.totalAvailable}</div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Item Distribution</div>
                  <div className="space-y-2">
                    {hostel.items.map((item) => (
                      <div key={item.itemTypeId} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-2">
                            <FaBox className="text-[#1360AB] text-xs" />
                          </div>
                          <span className="text-sm">{item.itemName}</span>
                        </div>
                        <div className="text-sm">
                          <span className={`font-medium ${item.available < 10 ? "text-red-500" : "text-green-500"}`}>{item.available}</span>
                          <span className="text-gray-500"> / {item.allocated}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Student Summary */}
      {activeTab === "student" && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {studentSummary.length === 0 ? (
            <div className="text-center py-12">
              <FaUserGraduate className="mx-auto text-gray-300 text-5xl mb-4" />
              <p className="text-gray-500">No student inventory data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentSummary.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{student.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{student.rollNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{student.totalItems}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {student.items.map((item) => (
                            <div key={item.id} className="flex items-center text-sm">
                              <div className="w-6 h-6 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-2">
                                <FaBox className="text-[#1360AB] text-xs" />
                              </div>
                              <span className="font-medium text-gray-700">{item.itemName}</span>
                              <span className="mx-1 text-gray-400">•</span>
                              <span className="text-gray-600">{item.count}</span>
                              <span className="mx-1 text-gray-400">•</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "Issued" ? "bg-green-100 text-green-800" : item.status === "Damaged" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>{item.status}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Item Type Summary */}
      {activeTab === "itemType" && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {itemTypeSummary.length === 0 ? (
            <div className="text-center py-12">
              <FaBox className="mx-auto text-gray-300 text-5xl mb-4" />
              <p className="text-gray-500">No item type summary data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Assigned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Count</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {itemTypeSummary.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
                            <FaBox className="text-[#1360AB]" />
                          </div>
                          <span className="font-medium text-gray-800">{item.itemName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{item.totalAssigned}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{item.studentCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InventoryReports
