import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../services/inventoryApi"
import { FaBoxes, FaFilter, FaSearch } from "react-icons/fa"
import Pagination from "../../common/Pagination"

const AvailableInventory = () => {
  const [hostelInventory, setHostelInventory] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [itemsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    itemTypeId: "",
  })

  // Fetch hostel inventory
  const fetchHostelInventory = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.getAllHostelInventory({
        page,
        limit: itemsPerPage,
        itemTypeId: filters.itemTypeId || undefined,
      })
      setHostelInventory(response.data)
      setTotalPages(Math.ceil(response.pagination.totalCount / itemsPerPage) || 1)
      setCurrentPage(page)
    } catch (err) {
      setError(err.message || "Failed to fetch hostel inventory")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostelInventory(currentPage)
  }, [currentPage, filters])

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
    setCurrentPage(1)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      itemTypeId: "",
    })
  }

  // Handle search
  const handleSearch = () => {
    fetchHostelInventory(1)
  }

  // Pagination handler
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Available Hostel Inventory</h3>
          <p className="text-sm text-gray-500">View inventory items available for assignment to students</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <FaFilter className="mr-2 text-gray-500" /> Filter Inventory
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="relative flex-1">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by item name..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB] focus:border-[#1360AB]" />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex gap-2">
            <button onClick={resetFilters} className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700">
              Reset
            </button>
            <button onClick={() => fetchHostelInventory(1)} className="px-4 py-2 bg-[#1360AB] text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
              <FaFilter /> Filter
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

      {/* Inventory List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {loading && !hostelInventory.length ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-[#1360AB] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : hostelInventory.length === 0 ? (
          <div className="text-center py-12">
            <FaBoxes className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500">No inventory items found in your hostel</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Allocated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hostelInventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
                          <FaBoxes className="text-[#1360AB]" />
                        </div>
                        <span className="font-medium text-gray-800">{item.itemTypeId.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.itemTypeId.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{item.allocatedCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.availableCount < 10 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>{item.availableCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && hostelInventory.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}
    </div>
  )
}

export default AvailableInventory
