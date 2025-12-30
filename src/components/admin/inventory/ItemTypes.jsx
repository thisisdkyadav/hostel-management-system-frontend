import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../service"
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBoxOpen } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Pagination from "../../common/Pagination"
import Input from "../../common/ui/Input" // Added Input component

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flex: 1, maxWidth: '500px' }}>
          <Input type="text" placeholder="Search item types..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} icon={<FaSearch />} />
          <Button onClick={handleSearch} variant="ghost" size="small">
            Search
          </Button>
        </div>
        <Button onClick={openNewItemModal} variant="primary" size="medium" icon={<FaPlus />}>
          Add New Item
        </Button>
      </div>

      {error && <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}>{error}</div>}

      {/* Items List */}
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
        {loading && !itemTypes.length ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-12) 0' }}>
            <div style={{ width: 'var(--spacing-12)', height: 'var(--spacing-12)', border: '4px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : itemTypes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-12) 0' }}>
            <FaBoxOpen style={{ margin: '0 auto', color: 'var(--color-border-primary)', fontSize: 'var(--font-size-5xl)', marginBottom: 'var(--spacing-4)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>No inventory item types found</p>
            <Button onClick={openNewItemModal} variant="primary" size="small" icon={<FaPlus />}>
              Add your first item
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Name</th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Description</th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Total Count</th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--color-bg-primary)', borderTop: '1px solid var(--table-border)' }}>
                {itemTypes.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--table-border)', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--table-row-hover)')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>{item.name}</td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', color: 'var(--color-text-tertiary)' }}>{item.description}</td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                      <Button onClick={() => handleUpdateCount(item._id, item.totalCount)} variant="ghost" size="small">
                        {item.totalCount}
                      </Button>
                    </td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                        <Button onClick={() => handleEdit(item)} variant="secondary" size="small" icon={<FaEdit />} />
                        <Button onClick={() => handleDelete(item._id)} variant="danger" size="small" icon={<FaTrash />} />
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
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Name</label>
              <Input type="text" name="name" value={currentItemType.name} onChange={handleInputChange} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Description</label>
              <textarea name="description" value={currentItemType.description} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', border: '1px solid var(--color-border-input)', borderRadius: 'var(--radius-md)', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-primary)' }} onFocus={(e) => (e.currentTarget.style.boxShadow = 'var(--input-focus-ring)')} onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}></textarea>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Total Count</label>
              <Input type="number" name="totalCount" value={currentItemType.totalCount} onChange={handleInputChange} min="0" required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)' }}>
              <Button type="button" onClick={closeModal} variant="secondary" size="medium">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="medium" isLoading={loading} disabled={loading}>
                {isEditMode ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default ItemTypes
