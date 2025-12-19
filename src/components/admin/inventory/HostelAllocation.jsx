import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../services/inventoryApi"
import { FaEdit, FaTrash, FaPlus, FaFilter, FaBuilding, FaBox, FaWarehouse } from "react-icons/fa"
import Modal from "../../common/Modal"
import Pagination from "../../common/Pagination"
import { useGlobal } from "../../../contexts/GlobalProvider"

const HostelAllocation = () => {
  const { hostelList } = useGlobal()

  const [hostelInventory, setHostelInventory] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [itemTypes, setItemTypes] = useState([])
  const [filters, setFilters] = useState({
    hostelId: "",
    itemTypeId: "",
  })
  const [showModal, setShowModal] = useState(false)
  const [currentAllocation, setCurrentAllocation] = useState({
    hostelId: "",
    itemTypeId: "",
    allocatedCount: 0,
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const [itemsPerPage] = useState(10)

  // Fetch hostel inventory
  const fetchHostelInventory = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.getAllHostelInventory({
        page,
        limit: itemsPerPage,
        hostelId: filters.hostelId || undefined,
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

  // Fetch item types
  const fetchItemTypes = async () => {
    try {
      const response = await inventoryApi.getAllItemTypes({ limit: 100 })
      setItemTypes(response.data || [])
    } catch (err) {
      console.error("Failed to fetch item types:", err)
    }
  }

  useEffect(() => {
    fetchHostelInventory(currentPage)
  }, [currentPage, filters])

  useEffect(() => {
    fetchItemTypes()
  }, [])

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
      hostelId: "",
      itemTypeId: "",
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditMode) {
        await inventoryApi.updateHostelInventory(currentAllocation._id, {
          allocatedCount: currentAllocation.allocatedCount,
        })
      } else {
        await inventoryApi.assignInventoryToHostel(currentAllocation)
      }
      fetchHostelInventory(currentPage)
      closeModal()
    } catch (err) {
      setError(err.message || "Failed to save hostel inventory allocation")
    } finally {
      setLoading(false)
    }
  }

  // Handle edit
  const handleEdit = (allocation) => {
    setCurrentAllocation({
      _id: allocation._id,
      hostelId: allocation.hostelId._id,
      itemTypeId: allocation.itemTypeId._id,
      allocatedCount: allocation.allocatedCount,
    })
    setIsEditMode(true)
    setShowModal(true)
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this allocation?")) return

    setLoading(true)
    setError(null)
    try {
      await inventoryApi.deleteHostelInventory(id)
      fetchHostelInventory(currentPage)
    } catch (err) {
      setError(err.message || "Failed to delete allocation")
    } finally {
      setLoading(false)
    }
  }

  // Open modal for new allocation
  const openNewAllocationModal = () => {
    setCurrentAllocation({
      hostelId: "",
      itemTypeId: "",
      allocatedCount: 0,
    })
    setIsEditMode(false)
    setShowModal(true)
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
  }

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentAllocation((prev) => ({
      ...prev,
      [name]: name === "allocatedCount" ? parseInt(value, 10) || 0 : value,
    }))
  }

  // Get item type details
  const getItemTypeDetails = (itemTypeId) => {
    return itemTypes.find((item) => item._id === itemTypeId) || {}
  }

  // Calculate available count to allocate
  const calculateAvailableToAllocate = () => {
    if (!currentAllocation.itemTypeId) return 0

    const itemType = getItemTypeDetails(currentAllocation.itemTypeId)
    const totalCount = itemType.totalCount || 0

    // Calculate already allocated count (excluding current allocation if editing)
    const allocatedCount = hostelInventory.reduce((sum, allocation) => {
      if (allocation.itemTypeId._id === currentAllocation.itemTypeId && (!isEditMode || allocation._id !== currentAllocation._id)) {
        return sum + allocation.allocatedCount
      }
      return sum
    }, 0)

    return totalCount - allocatedCount
  }

  // Pagination handler
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
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
          <h3 className="text-lg font-medium text-gray-800">Hostel Inventory Allocation</h3>
          <p className="text-sm text-gray-500">Allocate inventory items to hostels</p>
        </div>
        <button onClick={openNewAllocationModal} className="flex items-center justify-center gap-2 bg-[#1360AB] hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
          <FaPlus /> Allocate Items
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <FaFilter className="mr-2 text-gray-500" /> Filter Allocations
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hostel</label>
            <select name="hostelId" value={filters.hostelId} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]">
              <option value="">All Hostels</option>
              {hostelList &&
                hostelList.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
            <select name="itemTypeId" value={filters.itemTypeId} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]">
              <option value="">All Item Types</option>
              {itemTypes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
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

      {/* Items List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {loading && !hostelInventory.length ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-[#1360AB] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : hostelInventory.length === 0 ? (
          <div className="text-center py-12">
            <FaWarehouse className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500">No hostel inventory allocations found</p>
            <button onClick={openNewAllocationModal} className="mt-4 inline-flex items-center justify-center gap-2 bg-[#1360AB] hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
              <FaPlus /> Allocate your first item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hostelInventory.map((allocation) => (
                  <tr key={allocation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
                          <FaBuilding className="text-[#1360AB]" />
                        </div>
                        <span className="font-medium text-gray-800">{allocation.hostelId.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
                          <FaBox className="text-[#1360AB]" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{allocation.itemTypeId.name}</div>
                          <div className="text-sm text-gray-500">{allocation.itemTypeId.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{allocation.allocatedCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${allocation.availableCount < 10 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>{allocation.availableCount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button onClick={() => handleEdit(allocation)} className="w-8 h-8 rounded-full bg-[#E4F1FF] flex items-center justify-center text-[#1360AB] hover:bg-[#1360AB] hover:text-white transition-all">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(allocation._id)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all">
                          <FaTrash />
                        </button>
                      </div>
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

      {/* Modal */}
      {showModal && (
        <Modal title={isEditMode ? "Edit Allocation" : "Allocate Inventory to Hostel"} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hostel</label>
              <select name="hostelId" value={currentAllocation.hostelId} onChange={handleInputChange} required disabled={isEditMode} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB] disabled:bg-gray-100">
                <option value="">Select Hostel</option>
                {hostelList &&
                  hostelList.map((hostel) => (
                    <option key={hostel._id} value={hostel._id}>
                      {hostel.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
              <select name="itemTypeId" value={currentAllocation.itemTypeId} onChange={handleInputChange} required disabled={isEditMode} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB] disabled:bg-gray-100">
                <option value="">Select Item Type</option>
                {itemTypes.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} - Available:{" "}
                    {item.totalCount -
                      hostelInventory.reduce((sum, allocation) => {
                        if (allocation.itemTypeId._id === item._id) {
                          return sum + allocation.allocatedCount
                        }
                        return sum
                      }, 0)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocated Count
                {currentAllocation.itemTypeId && <span className="text-sm ml-2 text-gray-500">(Max: {calculateAvailableToAllocate() + (isEditMode ? currentAllocation.allocatedCount : 0)})</span>}
              </label>
              <input type="number" name="allocatedCount" value={currentAllocation.allocatedCount} onChange={handleInputChange} min="1" max={calculateAvailableToAllocate() + (isEditMode ? currentAllocation.allocatedCount : 0)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-[#1360AB] text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : isEditMode ? "Update" : "Allocate"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default HostelAllocation
