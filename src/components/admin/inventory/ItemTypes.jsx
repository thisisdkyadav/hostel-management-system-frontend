import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../services/inventoryApi"
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBoxOpen } from "react-icons/fa"
import Modal from "../../common/Modal"
import Pagination from "../../common/Pagination"

const ItemTypes = () => {
  const [itemTypes, setItemTypes] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [currentItemType, setCurrentItemType] = useState({
    name: "",
    description: "",
    totalCount: 0,
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const [itemsPerPage] = useState(10)

  // Fetch item types
  const fetchItemTypes = async (page = 1, search = "") => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.getAllItemTypes({
        page,
        limit: itemsPerPage,
        search,
      })
      setItemTypes(response.data)
      setTotalPages(Math.ceil(response.pagination.totalCount / itemsPerPage) || 1)
      setCurrentPage(page)
    } catch (err) {
      setError(err.message || "Failed to fetch item types")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItemTypes(currentPage, searchTerm)
  }, [currentPage])

  // Handle search
  const handleSearch = () => {
    fetchItemTypes(1, searchTerm)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditMode) {
        await inventoryApi.updateItemType(currentItemType._id, currentItemType)
      } else {
        await inventoryApi.createItemType(currentItemType)
      }
      fetchItemTypes(currentPage, searchTerm)
      closeModal()
    } catch (err) {
      setError(err.message || "Failed to save item type")
    } finally {
      setLoading(false)
    }
  }

  // Handle edit
  const handleEdit = (itemType) => {
    setCurrentItemType(itemType)
    setIsEditMode(true)
    setShowModal(true)
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item type?")) return

    setLoading(true)
    setError(null)
    try {
      await inventoryApi.deleteItemType(id)
      fetchItemTypes(currentPage, searchTerm)
    } catch (err) {
      setError(err.message || "Failed to delete item type")
    } finally {
      setLoading(false)
    }
  }

  // Open modal for new item
  const openNewItemModal = () => {
    setCurrentItemType({
      name: "",
      description: "",
      totalCount: 0,
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
    setCurrentItemType((prev) => ({
      ...prev,
      [name]: name === "totalCount" ? parseInt(value, 10) || 0 : value,
    }))
  }

  // Handle update count
  const handleUpdateCount = async (id, currentCount) => {
    const newCount = window.prompt("Enter new count:", currentCount)
    if (newCount === null) return

    const parsedCount = parseInt(newCount, 10)
    if (isNaN(parsedCount) || parsedCount < 0) {
      alert("Please enter a valid number")
      return
    }

    setLoading(true)
    setError(null)
    try {
      await inventoryApi.updateItemTypeCount(id, parsedCount)
      fetchItemTypes(currentPage, searchTerm)
    } catch (err) {
      setError(err.message || "Failed to update count")
    } finally {
      setLoading(false)
    }
  }

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative">
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search items..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1360AB] focus:border-[#1360AB] w-full md:w-64" />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <button onClick={handleSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#1360AB] hover:text-blue-700">
            Search
          </button>
        </div>
        <button onClick={openNewItemModal} className="flex items-center justify-center gap-2 bg-[#1360AB] hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
          <FaPlus /> Add New Item
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

      {/* Items List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {loading && !itemTypes.length ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-[#1360AB] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : itemTypes.length === 0 ? (
          <div className="text-center py-12">
            <FaBoxOpen className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500">No inventory item types found</p>
            <button onClick={openNewItemModal} className="mt-4 inline-flex items-center justify-center gap-2 bg-[#1360AB] hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
              <FaPlus /> Add your first item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {itemTypes.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleUpdateCount(item._id, item.totalCount)} className="font-medium text-[#1360AB] hover:underline">
                        {item.totalCount}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button onClick={() => handleEdit(item)} className="w-8 h-8 rounded-full bg-[#E4F1FF] flex items-center justify-center text-[#1360AB] hover:bg-[#1360AB] hover:text-white transition-all">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all">
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
      {!loading && itemTypes.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}

      {/* Modal */}
      {showModal && (
        <Modal title={isEditMode ? "Edit Item Type" : "Add New Item Type"} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" name="name" value={currentItemType.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={currentItemType.description} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Count</label>
              <input type="number" name="totalCount" value={currentItemType.totalCount} onChange={handleInputChange} min="0" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-[#1360AB] text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : isEditMode ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default ItemTypes
