import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../service"
import { Alert, Button, Field, HStack, Input, Label, Modal, Pagination, Spinner, Surface, Table, Text, Textarea, useConfirm, useToast, VStack } from "hzero"
import { PackageOpen, Pencil, Plus, Search, Trash2 } from "lucide-react"
const ItemTypes = () => {
  const { toast } = useToast()
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
  // Was window.prompt, which is a blocking browser dialog that cannot be
  // styled, cannot be dismissed with the rest of the UI, and on mobile
  // Safari can be suppressed entirely.
  const [countEdit, setCountEdit] = useState(null)
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
  const handleUpdateCount = async () => {
    const parsedCount = parseInt(countEdit?.value, 10)
    if (isNaN(parsedCount) || parsedCount < 0) {
      toast.error("Please enter a valid number")
      return
    }
    const id = countEdit.id

    setCountEdit(null)
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
          <Input type="text" placeholder="Search item types..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} icon={<Search size="1em" />} />
          <Button onClick={handleSearch} variant="ghost" size="sm">
            Search
          </Button>
        </div>
        <Button onClick={openNewItemModal} variant="primary" size="md">
          <Plus size="1em" />
          Add New Item
        </Button>
      </div>

      {error && <Text as="div" color="danger-text" style={{ backgroundColor: 'var(--color-danger-bg)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}>{error}</Text>}

      {/* Items List */}
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
        {loading && !itemTypes.length ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-12) 0' }}>
            <Spinner size="var(--spacing-12)" thickness="thick" />
          </div>
        ) : itemTypes.length === 0 ? (
          <Surface padding="var(--spacing-12) 0" align="center">
            <PackageOpen size={32} style={{ margin: '0 auto', marginBottom: 'var(--spacing-4)' }} color="var(--color-border-primary)" />
            <Text color="muted">No inventory item types found</Text>
            <Button onClick={openNewItemModal} variant="primary" size="sm">
              <Plus size="1em" />
              Add your first item
            </Button>
          </Surface>
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
                      <Button onClick={() => setCountEdit({ id: item._id, value: String(item.totalCount) })} variant="ghost" size="sm">
                        {item.totalCount}
                      </Button>
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <HStack gap={3} align="center">
                        <Button onClick={() => handleEdit(item)} variant="secondary" size="sm"><Pencil size="1em" /></Button>
                        <Button onClick={() => handleDelete(item._id)} variant="danger" size="sm"><Trash2 size="1em" /></Button>
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

      {/* Update count */}
      {countEdit && (
        <Modal isOpen title="Update Count" onClose={() => setCountEdit(null)} width={420}>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateCount() }}>
            <VStack gap="large">
              <Field label="New count" htmlFor="newCount" required>
                <Input
                  type="number"
                  id="newCount"
                  min="0"
                  value={countEdit.value}
                  onChange={(e) => setCountEdit((prev) => ({ ...prev, value: e.target.value }))}
                  autoFocus
                  required
                />
              </Field>
              <HStack gap="small" justify="end" style={{ paddingTop: 'var(--spacing-4)' }}>
                <Button type="button" onClick={() => setCountEdit(null)} variant="secondary" size="md">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
                  Update
                </Button>
              </HStack>
            </VStack>
          </form>
        </Modal>
      )}

      {/* Modal */}
      {showModal && (
        <Modal isOpen={showModal} title={isEditMode ? "Edit Item Type" : "Add New Item Type"} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            <VStack gap="large">
              <Field label="Name" htmlFor="name" required>
                <Input type="text" id="name" name="name" value={currentItemType.name} onChange={handleInputChange} required />
              </Field>
              <Field label="Description" htmlFor="description">
                <Textarea id="description" name="description" value={currentItemType.description} onChange={handleInputChange} rows={3} />
              </Field>
              <Field label="Total Count" htmlFor="totalCount" required>
                <Input type="number" id="totalCount" name="totalCount" value={currentItemType.totalCount} onChange={handleInputChange} min="0" required />
              </Field>
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
