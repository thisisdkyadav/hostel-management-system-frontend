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
          <h3 style={{ fontSize: 'var(--text-heading-3)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>Student Inventory Assignments</h3>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>View and manage items assigned to students</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: `var(--border-1) solid var(--color-border-light)` }}>
        <h3 className="flex items-center" style={{ fontSize: 'var(--text-body-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-3)' }}>
          <FaFilter style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-text-muted)' }} /> Filter Assignments
        </h3>
        <div className="flex flex-col md:flex-row items-end" style={{ gap: 'var(--gap-md)' }}>
          <div className="flex-1">
            <label className="block" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full" style={{ padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)'; }}>
              <option value="">All Statuses</option>
              <option value="Issued">Issued</option>
              <option value="Returned">Returned</option>
              <option value="Damaged">Damaged</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Roll Number</label>
            <input type="text" name="rollNumber" value={filters.rollNumber} onChange={handleFilterChange} placeholder="Enter roll number..." className="w-full" style={{ padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)'; }} />
          </div>
          <div className="flex self-end" style={{ gap: 'var(--gap-sm)' }}>
            <button onClick={resetFilters} style={{ padding: 'var(--button-padding-md)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-button-rect)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-body)', cursor: 'pointer', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-primary)'}>
              Reset
            </button>
            <button onClick={() => fetchStudentInventory(1)} className="flex items-center" style={{ padding: 'var(--button-padding-md)', backgroundColor: 'var(--button-primary-bg)', color: 'var(--color-white)', borderRadius: 'var(--radius-button-rect)', border: 'none', cursor: 'pointer', gap: 'var(--gap-sm)', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-primary-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--button-primary-bg)'}>
              <FaFilter /> Filter
            </button>
          </div>
        </div>
      </div>

      {error && <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}>{error}</div>}

      {/* Students List */}
      <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: `var(--border-1) solid var(--color-border-light)` }}>
        {loading && !studentInventory.length ? (
          <div className="flex justify-center items-center" style={{ paddingTop: 'var(--spacing-12)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="animate-spin" style={{ width: 'var(--icon-3xl)', height: 'var(--icon-3xl)', border: `var(--border-4) solid var(--color-primary)`, borderTopColor: 'transparent', borderRadius: 'var(--radius-full)' }}></div>
          </div>
        ) : studentInventory.length === 0 ? (
          <div className="text-center" style={{ paddingTop: 'var(--spacing-12)', paddingBottom: 'var(--spacing-12)' }}>
            <FaUserGraduate className="mx-auto" style={{ color: 'var(--color-border-dark)', fontSize: 'var(--icon-4xl)', marginBottom: 'var(--spacing-4)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>No inventory assignments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full" style={{ borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
                <tr>
                  <th className="text-left uppercase" style={{ padding: 'var(--table-cell-padding-md)', fontSize: 'var(--text-caption)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', letterSpacing: 'var(--letter-spacing-wider)' }}>Student</th>
                  <th className="text-left uppercase" style={{ padding: 'var(--table-cell-padding-md)', fontSize: 'var(--text-caption)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', letterSpacing: 'var(--letter-spacing-wider)' }}>Item</th>
                  <th className="text-left uppercase" style={{ padding: 'var(--table-cell-padding-md)', fontSize: 'var(--text-caption)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', letterSpacing: 'var(--letter-spacing-wider)' }}>Count</th>
                  <th className="text-left uppercase" style={{ padding: 'var(--table-cell-padding-md)', fontSize: 'var(--text-caption)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', letterSpacing: 'var(--letter-spacing-wider)' }}>Issue Date</th>
                  <th className="text-left uppercase" style={{ padding: 'var(--table-cell-padding-md)', fontSize: 'var(--text-caption)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', letterSpacing: 'var(--letter-spacing-wider)' }}>Status</th>
                  <th className="text-left uppercase" style={{ padding: 'var(--table-cell-padding-md)', fontSize: 'var(--text-caption)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', letterSpacing: 'var(--letter-spacing-wider)' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                {studentInventory.map((item) => (
                  <tr key={item._id} style={{ borderTop: `var(--border-1) solid var(--table-border)`, transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="whitespace-nowrap" style={{ padding: 'var(--table-cell-padding-md)' }}>
                      <div className="flex items-center">
                        <div className="flex items-center justify-center" style={{ width: 'var(--avatar-sm)', height: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', marginRight: 'var(--spacing-3)' }}>
                          <FaUserGraduate style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>{item.studentProfileId.userId.name}</div>
                          <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>{item.studentProfileId.rollNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap" style={{ padding: 'var(--table-cell-padding-md)' }}>
                      <div className="flex items-center">
                        <div className="flex items-center justify-center" style={{ width: 'var(--avatar-sm)', height: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', marginRight: 'var(--spacing-3)' }}>
                          <FaBoxes style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>{item.itemTypeId.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap" style={{ padding: 'var(--table-cell-padding-md)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>{item.count}</td>
                    <td className="whitespace-nowrap" style={{ padding: 'var(--table-cell-padding-md)', color: 'var(--color-text-tertiary)' }}>{formatDate(item.issueDate)}</td>
                    <td className="whitespace-nowrap" style={{ padding: 'var(--table-cell-padding-md)' }}>
                      <span style={{ padding: 'var(--badge-padding-md)', borderRadius: 'var(--radius-full)', fontSize: 'var(--badge-font-md)', fontWeight: 'var(--font-weight-medium)', backgroundColor: item.status === "Issued" ? 'var(--color-success-bg)' : item.status === "Damaged" ? 'var(--color-danger-bg)' : item.status === "Lost" ? 'var(--color-purple-light-bg)' : 'var(--color-bg-muted)', color: item.status === "Issued" ? 'var(--color-success-text)' : item.status === "Damaged" ? 'var(--color-danger-text)' : item.status === "Lost" ? 'var(--color-purple-text)' : 'var(--color-text-secondary)' }}>
                        {item.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap" style={{ padding: 'var(--table-cell-padding-md)' }}>
                      {canAccess("student_inventory", "edit") && (
                        <div className="flex items-center" style={{ gap: 'var(--gap-sm)' }}>
                          <button onClick={() => handleViewEditItem(item)} className="flex items-center justify-center" style={{ width: 'var(--avatar-sm)', height: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: 'none', cursor: 'pointer', transition: 'var(--transition-all)' }} onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--color-primary)'; e.target.style.color = 'var(--color-white)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'var(--color-primary-bg)'; e.target.style.color = 'var(--color-primary)'; }} title="View/Edit Details">
                            <FaEdit />
                          </button>
                          {item.status === "Issued" && (
                            <button onClick={() => handleReturnItem(item)} className="flex items-center justify-center" style={{ width: 'var(--avatar-sm)', height: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-success-bg-light)', color: 'var(--color-success)', border: 'none', cursor: 'pointer', transition: 'var(--transition-all)' }} onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--color-success)'; e.target.style.color = 'var(--color-white)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'var(--color-success-bg-light)'; e.target.style.color = 'var(--color-success)'; }} title="Return Item">
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
            <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
              <div className="flex items-center" style={{ marginBottom: 'var(--spacing-4)' }}>
                <div className="flex items-center justify-center" style={{ width: 'var(--avatar-md)', height: 'var(--avatar-md)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', marginRight: 'var(--spacing-3)' }}>
                  <FaUserGraduate style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{currentItem.studentProfileId.userId.name}</h3>
                  <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>{currentItem.studentProfileId.rollNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--gap-md)', marginBottom: 'var(--spacing-4)' }}>
                <div>
                  <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>Item</p>
                  <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{currentItem.itemTypeId.name}</p>
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>Count</p>
                  <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{currentItem.count}</p>
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>Issue Date</p>
                  <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{formatDate(currentItem.issueDate)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>Issued By</p>
                  <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{currentItem.issuedBy?.name || "Unknown"}</p>
                </div>
                {currentItem.returnDate && (
                  <div>
                    <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>Return Date</p>
                    <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{formatDate(currentItem.returnDate)}</p>
                  </div>
                )}
                {currentItem.returnedBy && (
                  <div>
                    <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>Returned By</p>
                    <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{currentItem.returnedBy.name}</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label className="block" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Status</label>
              <select name="status" value={formData.status} onChange={handleFormChange} className="w-full" style={{ padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)'; }} required>
                <option value="Issued">Issued</option>
                <option value="Damaged">Damaged</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label className="block" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Condition</label>
              <select name="condition" value={formData.condition} onChange={handleFormChange} className="w-full" style={{ padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)'; }} required>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label className="block" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows="3" className="w-full" style={{ padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)'; }} placeholder="Update notes..."></textarea>
            </div>

            <div className="flex justify-end" style={{ gap: 'var(--gap-sm)' }}>
              <button type="button" onClick={closeModal} style={{ padding: 'var(--button-padding-md)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-button-rect)', border: 'none', cursor: 'pointer', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-border-dark)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ padding: 'var(--button-padding-md)', backgroundColor: 'var(--button-primary-bg)', color: 'var(--color-white)', borderRadius: 'var(--radius-button-rect)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 'var(--opacity-disabled)' : '1', minWidth: '100px', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-hover)')} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--button-primary-bg)'}>
                {loading ? <div className="animate-spin" style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', border: `var(--border-2) solid var(--color-white)`, borderTopColor: 'transparent', borderRadius: 'var(--radius-full)' }}></div> : "Update Item"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Return Modal */}
      {showModal && modalType === "return" && currentItem && (
        <Modal title="Return Inventory Item" onClose={closeModal}>
          <form onSubmit={submitReturnForm} className="space-y-4">
            <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-4)' }}>
              <div className="flex items-center" style={{ marginBottom: 'var(--spacing-3)' }}>
                <div className="flex items-center justify-center" style={{ width: 'var(--avatar-md)', height: 'var(--avatar-md)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', marginRight: 'var(--spacing-3)' }}>
                  <FaBoxes style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{currentItem.itemTypeId.name}</h3>
                  <div className="flex" style={{ gap: 'var(--gap-sm)', fontSize: 'var(--text-body-sm)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Qty: {currentItem.count}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Assigned to: {currentItem.studentProfileId.userId.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label className="block" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Condition</label>
              <select name="condition" value={formData.condition} onChange={handleFormChange} className="w-full" style={{ padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)'; }} required>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label className="block" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows="3" className="w-full" style={{ padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)'; }} placeholder="Notes about returned item..."></textarea>
            </div>

            <div className="flex justify-end" style={{ gap: 'var(--gap-sm)' }}>
              <button type="button" onClick={closeModal} style={{ padding: 'var(--button-padding-md)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-button-rect)', border: 'none', cursor: 'pointer', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-border-dark)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex items-center justify-center" style={{ padding: 'var(--button-padding-md)', backgroundColor: 'var(--color-success)', color: 'var(--color-white)', borderRadius: 'var(--radius-button-rect)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 'var(--opacity-disabled)' : '1', minWidth: '100px', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--color-success-hover)')} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-success)'}>
                {loading ? <div className="animate-spin" style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', border: `var(--border-2) solid var(--color-white)`, borderTopColor: 'transparent', borderRadius: 'var(--radius-full)' }}></div> : "Return Item"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default StudentAssignments
