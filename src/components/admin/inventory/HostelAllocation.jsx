import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../services/inventoryApi"
import { FaEdit, FaTrash, FaPlus, FaFilter, FaBuilding, FaBox, FaWarehouse } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Pagination from "../../common/Pagination"
import { useGlobal } from "../../../contexts/GlobalProvider"
import Input from "../../common/ui/Input"
import Select from "../../common/ui/Select"

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
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>Hostel Inventory Allocation</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Allocate inventory items to hostels</p>
        </div>
        <Button
          onClick={openNewAllocationModal}
          variant="primary"
          size="medium"
          icon={<FaPlus />}
        >
          Allocate Items
        </Button>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-light)' }}>
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center' }}>
          <FaFilter style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-text-muted)' }} /> Filter Allocations
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Hostel</label>
            <Select
              name="hostelId"
              value={filters.hostelId}
              onChange={handleFilterChange}
              options={[
                { value: "", label: "All Hostels" },
                ...(hostelList || []).map((hostel) => ({ value: hostel._id, label: hostel.name })),
              ]}
            />
          </div>
          <div className="flex-1">
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Item Type</label>
            <Select
              name="itemTypeId"
              value={filters.itemTypeId}
              onChange={handleFilterChange}
              options={[
                { value: "", label: "All Item Types" },
                ...itemTypes.map((item) => ({ value: item._id, label: item.name })),
              ]}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={resetFilters} variant="secondary" size="medium">
              Reset
            </Button>
            <Button onClick={() => fetchHostelInventory(1)} variant="primary" size="medium" icon={<FaFilter />}>
              Filter
            </Button>
          </div>
        </div>
      </div>

      {error && <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}>{error}</div>}

      {/* Items List */}
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
        {loading && !hostelInventory.length ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-12) 0' }}>
            <div style={{ width: 'var(--spacing-12)', height: 'var(--spacing-12)', border: '4px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : hostelInventory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-12) 0' }}>
            <FaWarehouse style={{ margin: '0 auto', color: 'var(--color-border-primary)', fontSize: 'var(--font-size-5xl)', marginBottom: 'var(--spacing-4)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>No hostel inventory allocations found</p>
            <Button
              onClick={openNewAllocationModal}
              variant="primary"
              size="small"
              icon={<FaPlus />}
              style={{ marginTop: 'var(--spacing-4)' }}
            >
              Allocate your first item
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Hostel</th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Item Type</th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Allocated Count</th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Available Count</th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--color-bg-primary)', borderTop: '1px solid var(--table-border)' }}>
                {hostelInventory.map((allocation) => (
                  <tr key={allocation._id} style={{ borderBottom: '1px solid var(--table-border)', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--table-row-hover)')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 'var(--spacing-8)', height: 'var(--spacing-8)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-3)' }}>
                          <FaBuilding style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>{allocation.hostelId.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 'var(--spacing-8)', height: 'var(--spacing-8)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-3)' }}>
                          <FaBox style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>{allocation.itemTypeId.name}</div>
                          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{allocation.itemTypeId.description}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>{allocation.allocatedCount}</td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: 'var(--badge-padding-sm)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', backgroundColor: allocation.availableCount < 10 ? 'var(--color-danger-bg)' : 'var(--color-success-bg)', color: allocation.availableCount < 10 ? 'var(--color-danger-text)' : 'var(--color-success-text)' }}>{allocation.availableCount}</span>
                    </td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                        <Button onClick={() => handleEdit(allocation)} variant="secondary" size="small" icon={<FaEdit />} />
                        <Button onClick={() => handleDelete(allocation._id)} variant="danger" size="small" icon={<FaTrash />} />
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
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Hostel</label>
              <select name="hostelId" value={currentAllocation.hostelId} onChange={handleInputChange} required disabled={isEditMode} style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', border: '1px solid var(--color-border-input)', borderRadius: 'var(--radius-md)', outline: 'none', backgroundColor: isEditMode ? 'var(--color-bg-disabled)' : 'var(--input-bg)', color: 'var(--color-text-primary)' }} onFocus={(e) => !isEditMode && (e.currentTarget.style.boxShadow = 'var(--input-focus-ring)')} onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}>
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
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Item Type</label>
              <select name="itemTypeId" value={currentAllocation.itemTypeId} onChange={handleInputChange} required disabled={isEditMode} style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', border: '1px solid var(--color-border-input)', borderRadius: 'var(--radius-md)', outline: 'none', backgroundColor: isEditMode ? 'var(--color-bg-disabled)' : 'var(--input-bg)', color: 'var(--color-text-primary)' }} onFocus={(e) => !isEditMode && (e.currentTarget.style.boxShadow = 'var(--input-focus-ring)')} onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}>
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
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>
                Allocated Count
                {currentAllocation.itemTypeId && <span style={{ fontSize: 'var(--font-size-sm)', marginLeft: 'var(--spacing-2)', color: 'var(--color-text-muted)' }}>(Max: {calculateAvailableToAllocate() + (isEditMode ? currentAllocation.allocatedCount : 0)})</span>}
              </label>
              <input type="number" name="allocatedCount" value={currentAllocation.allocatedCount} onChange={handleInputChange} min="1" max={calculateAvailableToAllocate() + (isEditMode ? currentAllocation.allocatedCount : 0)} required style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', border: '1px solid var(--color-border-input)', borderRadius: 'var(--radius-md)', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-primary)' }} onFocus={(e) => (e.currentTarget.style.boxShadow = 'var(--input-focus-ring)')} onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)' }}>
              <Button type="button" onClick={closeModal} variant="secondary" size="medium">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="medium" isLoading={loading} disabled={loading}>
                {isEditMode ? "Update" : "Allocate"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default HostelAllocation
