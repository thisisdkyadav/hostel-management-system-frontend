import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../services/inventoryApi"
import { FaBoxes, FaFilter, FaSearch } from "react-icons/fa"
import Pagination from "../../common/Pagination"
import Button from "../../common/Button"

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
          <h3 style={{ fontSize: 'var(--text-heading-3)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>Available Hostel Inventory</h3>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>View inventory items available for assignment to students</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: `var(--border-1) solid var(--color-border-light)` }}>
        <h3 className="flex items-center" style={{ fontSize: 'var(--text-body-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-3)' }}>
          <FaFilter style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-text-muted)' }} /> Filter Inventory
        </h3>
        <div className="flex flex-col md:flex-row items-end" style={{ gap: 'var(--gap-md)' }}>
          <div className="relative flex-1">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by item name..." style={{ paddingLeft: 'var(--spacing-10)', paddingRight: 'var(--spacing-4)', paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', width: '100%', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)'; }} />
            <FaSearch className="absolute" style={{ left: 'var(--spacing-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-placeholder)' }} />
          </div>
          <div className="flex" style={{ gap: 'var(--gap-sm)' }}>
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

      {/* Inventory List */}
      <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: `var(--border-1) solid var(--color-border-light)` }}>
        {loading && !hostelInventory.length ? (
          <div className="flex justify-center items-center" style={{ paddingTop: 'var(--spacing-12)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="animate-spin" style={{ width: 'var(--icon-3xl)', height: 'var(--icon-3xl)', border: `var(--border-4) solid var(--color-primary)`, borderTopColor: 'transparent', borderRadius: 'var(--radius-full)' }}></div>
          </div>
        ) : hostelInventory.length === 0 ? (
          <div className="text-center" style={{ paddingTop: 'var(--spacing-12)', paddingBottom: 'var(--spacing-12)' }}>
            <FaBoxes className="mx-auto" style={{ color: 'var(--color-border-dark)', fontSize: 'var(--icon-4xl)', marginBottom: 'var(--spacing-4)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>No inventory items found in your hostel</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full" style={{ borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
                <tr>
                  <th className="text-left uppercase" style={{ padding: 'var(--table-cell-padding-md)', fontSize: 'var(--text-caption)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', letterSpacing: 'var(--letter-spacing-wider)' }}>Item</th>
                  <th className="text-left uppercase" style={{ padding: 'var(--table-cell-padding-md)', fontSize: 'var(--text-caption)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', letterSpacing: 'var(--letter-spacing-wider)' }}>Description</th>
                  <th className="text-left uppercase" style={{ padding: 'var(--table-cell-padding-md)', fontSize: 'var(--text-caption)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', letterSpacing: 'var(--letter-spacing-wider)' }}>Total Allocated</th>
                  <th className="text-left uppercase" style={{ padding: 'var(--table-cell-padding-md)', fontSize: 'var(--text-caption)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', letterSpacing: 'var(--letter-spacing-wider)' }}>Available</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                {hostelInventory.map((item) => (
                  <tr key={item._id} style={{ borderTop: `var(--border-1) solid var(--table-border)`, transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="whitespace-nowrap" style={{ padding: 'var(--table-cell-padding-md)' }}>
                      <div className="flex items-center">
                        <div className="flex items-center justify-center" style={{ width: 'var(--avatar-sm)', height: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', marginRight: 'var(--spacing-3)' }}>
                          <FaBoxes style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>{item.itemTypeId.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--table-cell-padding-md)', color: 'var(--color-text-tertiary)' }}>{item.itemTypeId.description}</td>
                    <td className="whitespace-nowrap" style={{ padding: 'var(--table-cell-padding-md)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>{item.allocatedCount}</td>
                    <td className="whitespace-nowrap" style={{ padding: 'var(--table-cell-padding-md)' }}>
                      <span style={{ padding: 'var(--badge-padding-md)', borderRadius: 'var(--radius-full)', fontSize: 'var(--badge-font-md)', fontWeight: 'var(--font-weight-medium)', backgroundColor: item.availableCount < 10 ? 'var(--color-danger-bg)' : 'var(--color-success-bg)', color: item.availableCount < 10 ? 'var(--color-danger-text)' : 'var(--color-success-text)' }}>{item.availableCount}</span>
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
