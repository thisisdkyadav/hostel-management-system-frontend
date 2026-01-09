import React, { useState } from "react"
import { Modal, Button, VStack, HStack, Tabs, TabList, Tab } from "@/components/ui"
import { Table, Pencil, Trash2, X, TriangleAlert } from "lucide-react"
import ExistingRoomsList from "./rooms/ExistingRoomsList"
import AddRoomForm from "./rooms/AddRoomForm"
import AddRoomsCsv from "./rooms/AddRoomsCsv"
import { hostelApi } from "../../../service"
import { toast } from "react-hot-toast"
import { createPortal } from "react-dom"

const RoomManagementModal = ({ hostel, onClose, onRoomsUpdated }) => {
  const [activeTab, setActiveTab] = useState("view")
  const [inputMethod, setInputMethod] = useState("form")
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  if (!hostel) return null

  const handleDeleteAllAllocations = async () => {
    try {
      setIsLoading(true)
      await hostelApi.deleteAllAllocations(hostel.id)
      toast.success("All room allocations have been deleted successfully")
      if (onRoomsUpdated) onRoomsUpdated()
    } catch (error) {
      toast.error(error.message || "Failed to delete allocations")
    } finally {
      setIsLoading(false)
      setShowDeleteConfirmation(false)
    }
  }

  // Delete confirmation dialog
  const DeleteConfirmationDialog = () => {
    if (!showDeleteConfirmation) return null

    return createPortal(
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--color-bg-modal-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 'var(--spacing-4)' }}>
        <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-2xl)', overflow: 'auto', animation: 'fadeIn 0.2s', width: '100%', maxWidth: '28rem', boxShadow: 'var(--shadow-modal)' }}>
          <div style={{ padding: 'var(--spacing-4) var(--spacing-6)', borderBottom: 'var(--border-1) solid var(--color-border-light)' }}>
            <HStack justify="between" align="center">
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>Delete All Allocations</h3>
              <Button
                onClick={() => setShowDeleteConfirmation(false)}
                variant="ghost"
                size="small"
                icon={<X size={16} />}
              />
            </HStack>
          </div>

          <div style={{ padding: 'var(--spacing-5) var(--spacing-6)' }}>
            <VStack gap="large">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-full)' }}>
                  <TriangleAlert size={32} />
                </div>
              </div>

              <VStack gap="medium" align="center">
                <p style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>CRITICAL WARNING</p>
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  This will remove <span style={{ fontWeight: 'var(--font-weight-bold)' }}>ALL</span> student room allocations from <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{hostel.name}</span>.
                </p>
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>All students will be immediately removed from their rooms.</p>
                <p style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-weight-semibold)' }}>This action CANNOT be undone.</p>
              </VStack>

              <HStack gap="medium" justify="center">
                <Button onClick={() => setShowDeleteConfirmation(false)} variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleDeleteAllAllocations} variant="danger" disabled={isLoading} isLoading={isLoading}>
                  Delete All Allocations
                </Button>
              </HStack>
            </VStack>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return (
    <>
      <Modal isOpen={true} onClose={onClose} title={`Manage Rooms - ${hostel.name}`} width={800}>
        <VStack gap="large">
          <HStack justify="between" align="center" style={{ paddingBottom: 'var(--spacing-4)', borderBottom: 'var(--border-1) solid var(--color-border-primary)', width: '100%' }}>
            <Tabs value={activeTab} onChange={setActiveTab} variant="pills" size="small">
              <TabList>
                <Tab value="view">View Existing Rooms</Tab>
                <Tab value="add">Add New Rooms</Tab>
              </TabList>
            </Tabs>

            {activeTab === "view" && (
              <Button onClick={() => setShowDeleteConfirmation(true)} variant="danger" disabled={isLoading} animation="pulse" size="small" icon={<Trash2 size={14} />}>
                Delete All Allocations
              </Button>
            )}
          </HStack>

          {activeTab === "view" && <ExistingRoomsList hostel={hostel} onRoomsUpdated={onRoomsUpdated} setIsLoading={setIsLoading} />}

          {activeTab === "add" && (
            <VStack gap="large">
              <HStack justify="center" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }} role="group">
                  <Button
                    type="button"
                    variant={inputMethod === "form" ? "primary" : "white"}
                    size="medium"
                    icon={<Pencil size={14} />}
                    onClick={() => setInputMethod("form")}
                    style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                  >
                    Form Input
                  </Button>
                  <Button
                    type="button"
                    variant={inputMethod === "csv" ? "primary" : "white"}
                    size="medium"
                    icon={<Table size={14} />}
                    onClick={() => setInputMethod("csv")}
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  >
                    CSV Import
                  </Button>
                </div>
              </HStack>

              {inputMethod === "form" ? <AddRoomForm hostel={hostel} onRoomsUpdated={onRoomsUpdated} setIsLoading={setIsLoading} /> : <AddRoomsCsv hostel={hostel} onRoomsUpdated={onRoomsUpdated} setIsLoading={setIsLoading} />}
            </VStack>
          )}

          <HStack justify="end" style={{ paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', width: '100%' }}>
            <Button onClick={onClose} variant="outline" animation="ripple">
              Close
            </Button>
          </HStack>
        </VStack>
      </Modal>

      <DeleteConfirmationDialog />
    </>
  )
}

export default RoomManagementModal
