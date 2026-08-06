import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../service"
import { FaEdit, FaTrash, FaPlus, FaFilter, FaBuilding, FaBox, FaWarehouse } from "react-icons/fa"
import { Alert, Heading, HStack, IconCircle, Label, Pagination, Select, Spinner, Surface, Text, useConfirm, VStack } from "@/components/ui"
import { Button, Input, Table } from "czero/react"
import { Modal } from "@/components/ui"
import { useGlobal } from "../../../contexts/GlobalProvider"

const HostelAllocation = () => {
  const confirm = useConfirm()
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
    if (!(await confirm({ message: "Are you sure you want to delete this allocation?", isDestructive: true }))) return

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
          <Heading as="h3" size="lg" weight="medium" color="secondary">Hostel Inventory Allocation</Heading>
          <Text size="sm" color="muted">Allocate inventory items to hostels</Text>
        </div>
        <Button
          onClick={openNewAllocationModal}
          variant="primary"
          size="md"
        >
          <FaPlus />
          Allocate Items
        </Button>
      </div>

      {/* Filters */}
      <Surface bg="tertiary" padding={4} radius="lg" border="1px solid var(--color-border-light)">
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center' }}>
          <FaFilter style={{ marginRight: 'var(--spacing-2)' }} color="var(--color-text-muted)" /> Filter Allocations
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <VStack gap="xsmall" className="flex-1">
            <Label htmlFor="hostelId">Hostel</Label>
            <Select
              id="hostelId"
              name="hostelId"
              value={filters.hostelId}
              onChange={handleFilterChange}
              options={[
                { value: "", label: "All Hostels" },
                ...(hostelList || []).map((hostel) => ({ value: hostel._id, label: hostel.name })),
              ]}
            />
          </VStack>
          <VStack gap="xsmall" className="flex-1">
            <Label htmlFor="itemTypeId">Item Type</Label>
            <Select
              id="itemTypeId"
              name="itemTypeId"
              value={filters.itemTypeId}
              onChange={handleFilterChange}
              options={[
                { value: "", label: "All Item Types" },
                ...itemTypes.map((item) => ({ value: item._id, label: item.name })),
              ]}
            />
          </VStack>
          <HStack gap={2}>
            <Button onClick={resetFilters} variant="secondary" size="md">
              Reset
            </Button>
            <Button onClick={() => fetchHostelInventory(1)} variant="primary" size="md">
              <FaFilter />
              Filter
            </Button>
          </HStack>
        </div>
      </Surface>

      {error && <Alert type="error">{error}</Alert>}

      {/* Items List */}
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
        {loading && !hostelInventory.length ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-12) 0' }}>
            <Spinner size="var(--spacing-12)" thickness="thick" />
          </div>
        ) : hostelInventory.length === 0 ? (
          <Surface padding="var(--spacing-12) 0" align="center">
            <FaWarehouse style={{ margin: '0 auto', fontSize: 'var(--font-size-5xl)', marginBottom: 'var(--spacing-4)' }} color="var(--color-border-primary)" />
            <Text color="muted">No hostel inventory allocations found</Text>
            <Button
              onClick={openNewAllocationModal}
              variant="primary"
              size="sm"
              style={{ marginTop: 'var(--spacing-4)' }}
            >
              <FaPlus />
              Allocate your first item
            </Button>
          </Surface>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Hostel</Table.Head>
                  <Table.Head>Item Type</Table.Head>
                  <Table.Head>Allocated Count</Table.Head>
                  <Table.Head>Available Count</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {hostelInventory.map((allocation) => (
                  <Table.Row key={allocation._id}>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <HStack gap="none" align="center">
                        <IconCircle size="var(--spacing-8)" bg="brand" style={{ marginRight: 'var(--spacing-3)' }}>
                          <FaBuilding color="var(--color-primary)" />
                        </IconCircle>
                        <Text as="span" weight="medium" color="secondary">{allocation.hostelId.name}</Text>
                      </HStack>
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <HStack gap="none" align="center">
                        <IconCircle size="var(--spacing-8)" bg="brand" style={{ marginRight: 'var(--spacing-3)' }}>
                          <FaBox color="var(--color-primary)" />
                        </IconCircle>
                        <div>
                          <Text as="div" weight="medium" color="secondary">{allocation.itemTypeId.name}</Text>
                          <Text as="div" size="sm" color="muted">{allocation.itemTypeId.description}</Text>
                        </div>
                      </HStack>
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap', fontWeight: 'var(--font-weight-medium)' }}>{allocation.allocatedCount}</Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <Surface as="span" bg={allocation.availableCount < 10 ? 'var(--color-danger-bg)' : 'var(--color-success-bg)'} padding="var(--badge-padding-sm)" radius="full" color={allocation.availableCount < 10 ? 'var(--color-danger-text)' : 'var(--color-success-text)'} size="xs" weight="medium">{allocation.availableCount}</Surface>
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <HStack gap={3} align="center">
                        <Button onClick={() => handleEdit(allocation)} variant="secondary" size="sm"><FaEdit /></Button>
                        <Button onClick={() => handleDelete(allocation._id)} variant="danger" size="sm"><FaTrash /></Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && hostelInventory.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}

      {/* Modal */}
      <Modal isOpen={showModal} title={isEditMode ? "Edit Allocation" : "Allocate Inventory to Hostel"} onClose={closeModal}>
          <VStack as="form" gap="medium" onSubmit={handleSubmit}>
            <VStack gap="xsmall">
              <Label htmlFor="modal-hostelId" required>Hostel</Label>
              <Select id="modal-hostelId" name="hostelId" value={currentAllocation.hostelId} onChange={handleInputChange} placeholder="Select Hostel" disabled={isEditMode} options={hostelList ? hostelList.map((hostel) => ({ value: hostel._id, label: hostel.name })) : []} />
            </VStack>
            <VStack gap="xsmall">
              <Label htmlFor="modal-itemTypeId" required>Item Type</Label>
              <Select id="modal-itemTypeId" name="itemTypeId" value={currentAllocation.itemTypeId} onChange={handleInputChange} placeholder="Select Item Type" disabled={isEditMode} options={itemTypes.map((item) => ({ value: item._id, label: `${item.name} - Available: ${item.totalCount - hostelInventory.reduce((sum, allocation) => allocation.itemTypeId._id === item._id ? sum + allocation.allocatedCount : sum, 0)}` }))} />
            </VStack>
            <VStack gap="xsmall">
              <Label htmlFor="allocatedCount" required>
                Allocated Count
                {currentAllocation.itemTypeId && <Text as="span" size="sm" color="muted" style={{ marginLeft: 'var(--spacing-2)' }}>(Max: {calculateAvailableToAllocate() + (isEditMode ? currentAllocation.allocatedCount : 0)})</Text>}
              </Label>
              <Input id="allocatedCount" type="number" name="allocatedCount" value={currentAllocation.allocatedCount} onChange={handleInputChange} min={1} max={calculateAvailableToAllocate() + (isEditMode ? currentAllocation.allocatedCount : 0)} required />
            </VStack>
            <HStack gap="small" justify="end" style={{ paddingTop: 'var(--spacing-4)' }}>
              <Button type="button" onClick={closeModal} variant="secondary" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
                {isEditMode ? "Update" : "Allocate"}
              </Button>
            </HStack>
          </VStack>
        </Modal>
    </div>
  )
}

export default HostelAllocation
