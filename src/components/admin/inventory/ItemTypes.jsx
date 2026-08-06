import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../service"
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBoxOpen } from "react-icons/fa"
import { Alert, HStack, Label, Pagination, Text, Textarea, useConfirm, VStack } from "@/components/ui"
import { Button, Input, Table } from "czero/react"
import { Modal } from "@/components/ui"
const ItemTypes = () => {
  const confirm = useConfirm()
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
    if (!(await confirm({ message: "Are you sure you want to delete this item type?", isDestructive: true }))) return

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
          <Button onClick={handleSearch} variant="ghost" size="sm">
            Search
          </Button>
        </div>
        <Button onClick={openNewItemModal} variant="primary" size="md">
          <FaPlus />
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
            <Text color="muted">No inventory item types found</Text>
            <Button onClick={openNewItemModal} variant="primary" size="sm">
              <FaPlus />
              Add your first item
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Name</Table.Head>
                  <Table.Head>Description</Table.Head>
                  <Table.Head>Total Count</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {itemTypes.map((item) => (
                  <Table.Row key={item._id}>
                    <Table.Cell style={{ whiteSpace: 'nowrap', fontWeight: 'var(--font-weight-medium)' }}>{item.name}</Table.Cell>
                    <Table.Cell>{item.description}</Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <Button onClick={() => handleUpdateCount(item._id, item.totalCount)} variant="ghost" size="sm">
                        {item.totalCount}
                      </Button>
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <HStack gap={3} align="center">
                        <Button onClick={() => handleEdit(item)} variant="secondary" size="sm"><FaEdit /></Button>
                        <Button onClick={() => handleDelete(item._id)} variant="danger" size="sm"><FaTrash /></Button>
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
      {!loading && itemTypes.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}

      {/* Modal */}
      {showModal && (
        <Modal isOpen={showModal} title={isEditMode ? "Edit Item Type" : "Add New Item Type"} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            <VStack gap="large">
              <div>
                <Label htmlFor="name" required>Name</Label>
                <Input type="text" id="name" name="name" value={currentItemType.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={currentItemType.description} onChange={handleInputChange} rows={3} />
              </div>
              <div>
                <Label htmlFor="totalCount" required>Total Count</Label>
                <Input type="number" id="totalCount" name="totalCount" value={currentItemType.totalCount} onChange={handleInputChange} min="0" required />
              </div>
              <HStack gap="small" justify="end" style={{ paddingTop: 'var(--spacing-4)' }}>
                <Button type="button" onClick={closeModal} variant="secondary" size="md">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </HStack>
            </VStack>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default ItemTypes
