import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../services/inventoryApi"
import { FaSearch, FaFilter, FaUserGraduate, FaBoxes, FaEye, FaEdit, FaUndo } from "react-icons/fa"
import Pagination from "../../common/Pagination"
import Modal from "../../common/Modal"
import { useAuth } from "../../../contexts/AuthProvider"

const StudentAssignments = () => {
  const { user, canAccess } = useAuth()
  const [studentInventory, setStudentInventory] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    itemTypeId: "",
    status: "",
    rollNumber: "",
  })
  const [itemsPerPage] = useState(10)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("") // view/edit, return
  const [currentItem, setCurrentItem] = useState(null)
  const [formData, setFormData] = useState({
    status: "Issued",
    condition: "Good",
    notes: "",
  })

  // Fetch student inventory
  const fetchStudentInventory = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.getAllStudentInventory({
        page,
        limit: itemsPerPage,
        itemTypeId: filters.itemTypeId || undefined,
        status: filters.status || undefined,
        rollNumber: filters.rollNumber || undefined,
      })
      setStudentInventory(response.data)
      setTotalPages(Math.ceil(response.pagination.totalCount / itemsPerPage) || 1)
      setCurrentPage(page)
    } catch (err) {
      setError(err.message || "Failed to fetch student inventory")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentInventory(currentPage)
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
      status: "",
      rollNumber: "",
    })
  }

  // Pagination handler
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Handle view/edit item
  const handleViewEditItem = (item) => {
    setCurrentItem(item)
    setFormData({
      status: item.status,
      condition: item.condition,
      notes: item.notes || "",
    })
    setModalType("edit")
    setShowModal(true)
  }

  // Handle return item
  const handleReturnItem = (item) => {
    setCurrentItem(item)
    setFormData({
      status: "Returned",
      condition: item.condition,
      notes: "",
    })
    setModalType("return")
    setShowModal(true)
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    setCurrentItem(null)
  }

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Submit update form
  const submitUpdateForm = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await inventoryApi.updateStudentInventoryStatus(currentItem._id, formData)
      fetchStudentInventory(currentPage)
      closeModal()
    } catch (err) {
      setError(err.message || "Failed to update item")
    } finally {
      setLoading(false)
    }
  }

  // Submit return form
  const submitReturnForm = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await inventoryApi.returnStudentInventory(currentItem._id, {
        condition: formData.condition,
        notes: formData.notes,
      })
      fetchStudentInventory(currentPage)
      closeModal()
    } catch (err) {
      setError(err.message || "Failed to return item")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Student Inventory Assignments</h3>
          <p className="text-sm text-gray-500">View and manage items assigned to students</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <FaFilter className="mr-2 text-gray-500" /> Filter Assignments
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]">
              <option value="">All Statuses</option>
              <option value="Issued">Issued</option>
              <option value="Returned">Returned</option>
              <option value="Damaged">Damaged</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
            <input type="text" name="rollNumber" value={filters.rollNumber} onChange={handleFilterChange} placeholder="Enter roll number..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" />
          </div>
          <div className="flex gap-2 self-end">
            <button onClick={resetFilters} className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700">
              Reset
            </button>
            <button onClick={() => fetchStudentInventory(1)} className="px-4 py-2 bg-[#1360AB] text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
              <FaFilter /> Filter
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {loading && !studentInventory.length ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-[#1360AB] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : studentInventory.length === 0 ? (
          <div className="text-center py-12">
            <FaUserGraduate className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500">No inventory assignments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentInventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
                          <FaUserGraduate className="text-[#1360AB]" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{item.studentProfileId.userId.name}</div>
                          <div className="text-xs text-gray-500">{item.studentProfileId.rollNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
                          <FaBoxes className="text-[#1360AB]" />
                        </div>
                        <span className="font-medium text-gray-800">{item.itemTypeId.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{item.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatDate(item.issueDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === "Issued" ? "bg-green-100 text-green-800" : item.status === "Damaged" ? "bg-red-100 text-red-800" : item.status === "Lost" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {canAccess("student_inventory", "edit") && (
                        <div className="flex items-center space-x-3">
                          <button onClick={() => handleViewEditItem(item)} className="w-8 h-8 rounded-full bg-[#E4F1FF] flex items-center justify-center text-[#1360AB] hover:bg-[#1360AB] hover:text-white transition-all" title="View/Edit Details">
                            <FaEdit />
                          </button>
                          {item.status === "Issued" && (
                            <button onClick={() => handleReturnItem(item)} className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all" title="Return Item">
                              <FaUndo />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && studentInventory.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}

      {/* View/Edit Modal */}
      {showModal && modalType === "edit" && currentItem && (
        <Modal title="Inventory Item Details" onClose={closeModal}>
          <form onSubmit={submitUpdateForm} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
                  <FaUserGraduate className="text-[#1360AB]" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{currentItem.studentProfileId.userId.name}</h3>
                  <p className="text-sm text-gray-500">{currentItem.studentProfileId.rollNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Item</p>
                  <p className="font-medium">{currentItem.itemTypeId.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Count</p>
                  <p className="font-medium">{currentItem.count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p className="font-medium">{formatDate(currentItem.issueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issued By</p>
                  <p className="font-medium">{currentItem.issuedBy?.name || "Unknown"}</p>
                </div>
                {currentItem.returnDate && (
                  <div>
                    <p className="text-sm text-gray-500">Return Date</p>
                    <p className="font-medium">{formatDate(currentItem.returnDate)}</p>
                  </div>
                )}
                {currentItem.returnedBy && (
                  <div>
                    <p className="text-sm text-gray-500">Returned By</p>
                    <p className="font-medium">{currentItem.returnedBy.name}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" required>
                <option value="Issued">Issued</option>
                <option value="Damaged">Damaged</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" required>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" placeholder="Update notes..."></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-[#1360AB] text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Update Item"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Return Modal */}
      {showModal && modalType === "return" && currentItem && (
        <Modal title="Return Inventory Item" onClose={closeModal}>
          <form onSubmit={submitReturnForm} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
                  <FaBoxes className="text-[#1360AB]" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{currentItem.itemTypeId.name}</h3>
                  <div className="flex space-x-2 text-sm">
                    <span className="text-gray-500">Qty: {currentItem.count}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">Assigned to: {currentItem.studentProfileId.userId.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" required>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" placeholder="Notes about returned item..."></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Return Item"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default StudentAssignments
