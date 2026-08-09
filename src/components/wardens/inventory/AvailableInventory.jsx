import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../service"
import { FaBoxes, FaFilter, FaSearch } from "react-icons/fa"
import { Button, Heading, IconCircle, Input, Pagination, Spinner, Surface, Table, Text } from "hzero"

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
          <Heading as="h3" size="var(--text-heading-3)" weight="medium" color="secondary">Available Hostel Inventory</Heading>
          <Text size="var(--text-body-sm)" color="muted">View inventory items available for assignment to students</Text>
        </div>
      </div>

      {/* Filters */}
      <Surface bg="tertiary" padding={4} radius="lg" border="var(--border-1) solid var(--color-border-light)">
        <Heading as="h3" size="var(--text-body-sm)" weight="medium" color="body" style={{ marginBottom: 'var(--spacing-3)' }} className="flex items-center">
          <FaFilter style={{ marginRight: 'var(--spacing-2)' }} color="var(--color-text-muted)" /> Filter Inventory
        </Heading>
        <div className="flex flex-col md:flex-row items-end" style={{ gap: 'var(--gap-md)' }}>
          <div className="flex-1">
            <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by item name..." icon={<FaSearch />} />
          </div>
          <div className="flex" style={{ gap: 'var(--gap-sm)' }}>
            <Button onClick={resetFilters} variant="secondary" size="md">
              Reset
            </Button>
            <Button onClick={() => fetchHostelInventory(1)} variant="primary" size="md">
              <FaFilter /> Filter
            </Button>
          </div>
        </div>
      </Surface>

      {error && <Text as="div" color="danger-text" style={{ backgroundColor: 'var(--color-danger-bg)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}>{error}</Text>}

      {/* Inventory List */}
      <Surface bg="primary" radius="lg" shadow="sm" border="var(--border-1) solid var(--color-border-light)">
        {loading && !hostelInventory.length ? (
          <div className="flex justify-center items-center" style={{ paddingTop: 'var(--spacing-12)', paddingBottom: 'var(--spacing-12)' }}>
            <Spinner size={40} thickness="thick" />
          </div>
        ) : hostelInventory.length === 0 ? (
          <div className="text-center" style={{ paddingTop: 'var(--spacing-12)', paddingBottom: 'var(--spacing-12)' }}>
            <FaBoxes className="mx-auto" style={{ fontSize: 'var(--icon-4xl)', marginBottom: 'var(--spacing-4)' }} color="var(--color-border-dark)" />
            <Text color="muted">No inventory items found in your hostel</Text>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head className="text-left uppercase">Item</Table.Head>
                  <Table.Head className="text-left uppercase">Description</Table.Head>
                  <Table.Head className="text-left uppercase">Total Allocated</Table.Head>
                  <Table.Head className="text-left uppercase">Available</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {hostelInventory.map((item) => (
                  <Table.Row style={{ borderTop: `var(--border-1) solid var(--table-border)` }} key={item._id}  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Table.Cell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <IconCircle size="var(--avatar-sm)" bg="brand" style={{ marginRight: 'var(--spacing-3)' }} className="flex items-center justify-center">
                          <FaBoxes color="var(--color-primary)" />
                        </IconCircle>
                        <Text as="span" weight="medium" color="secondary">{item.itemTypeId.name}</Text>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{item.itemTypeId.description}</Table.Cell>
                    <Table.Cell className="whitespace-nowrap" style={{ fontWeight: 'var(--font-weight-medium)' }}>{item.allocatedCount}</Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      <Surface as="span" bg={item.availableCount < 10 ? 'var(--color-danger-bg)' : 'var(--color-success-bg)'} padding="var(--badge-padding-md)" radius="full" color={item.availableCount < 10 ? 'var(--color-danger-text)' : 'var(--color-success-text)'} size="var(--badge-font-md)" weight="medium">{item.availableCount}</Surface>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Surface>

      {/* Pagination */}
      {!loading && hostelInventory.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}
    </div>
  )
}

export default AvailableInventory
