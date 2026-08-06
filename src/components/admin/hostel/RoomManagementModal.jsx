import React, { useState } from "react"
import { HStack, useConfirm, VStack } from "@/components/ui"
import { Tabs, Button } from "czero/react"
import { Modal } from "@/components/ui"
import { Table, Pencil, Trash2 } from "lucide-react"
import ExistingRoomsList from "./rooms/ExistingRoomsList"
import AddRoomForm from "./rooms/AddRoomForm"
import AddRoomsCsv from "./rooms/AddRoomsCsv"
import { hostelApi } from "../../../service"
import { useToast } from "@/components/ui/feedback"

const RoomManagementModal = ({ hostel, onClose, onRoomsUpdated }) => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("view")
  const [inputMethod, setInputMethod] = useState("form")
  const [isLoading, setIsLoading] = useState(false)

  if (!hostel) return null

  const handleDeleteAllAllocations = async () => {
    const confirmed = await confirm({
      title: "Delete All Allocations",
      confirmText: "Delete all allocations",
      isDestructive: true,
      message: (
        <VStack gap="medium" align="center">
          <p style={{ color: "var(--color-danger)", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-lg)" }}>CRITICAL WARNING</p>
          <p>
            This will remove <strong>ALL</strong> student room allocations from <strong>{hostel.name}</strong>.
          </p>
          <p>All students will be immediately removed from their rooms.</p>
          <p style={{ color: "var(--color-danger)", fontWeight: "var(--font-weight-semibold)" }}>This action CANNOT be undone.</p>
        </VStack>
      ),
    })
    if (!confirmed) return

    try {
      setIsLoading(true)
      await hostelApi.deleteAllAllocations(hostel.id)
      toast.success("All room allocations have been deleted successfully")
      if (onRoomsUpdated) onRoomsUpdated()
    } catch (error) {
      toast.error(error.message || "Failed to delete allocations")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Modal isOpen={true} onClose={onClose} title={`Manage Rooms - ${hostel.name}`} width={800}>
        <VStack gap="large">
          <HStack justify="between" align="center" style={{ paddingBottom: 'var(--spacing-4)', borderBottom: 'var(--border-1) solid var(--color-border-primary)', width: '100%' }}>
            <Tabs value={activeTab} onChange={setActiveTab} variant="pills" size="small">
              <Tabs.List>
                <Tabs.Trigger value="view">View Existing Rooms</Tabs.Trigger>
                <Tabs.Trigger value="add">Add New Rooms</Tabs.Trigger>
              </Tabs.List>
            </Tabs>

            {activeTab === "view" && (
              <Button onClick={handleDeleteAllAllocations} variant="danger" disabled={isLoading} animation="pulse" size="sm">
                <Trash2 size={14} /> Delete All Allocations
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
                    size="md"
                    onClick={() => setInputMethod("form")}
                    style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                  >
                    <Pencil size={14} /> Form Input
                  </Button>
                  <Button
                    type="button"
                    variant={inputMethod === "csv" ? "primary" : "white"}
                    size="md"
                    onClick={() => setInputMethod("csv")}
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  >
                    <Table size={14} /> CSV Import
                  </Button>
                </div>
              </HStack>

              {inputMethod === "form" ? <AddRoomForm hostel={hostel} onRoomsUpdated={onRoomsUpdated} setIsLoading={setIsLoading} /> : <AddRoomsCsv hostel={hostel} onRoomsUpdated={onRoomsUpdated} setIsLoading={setIsLoading} />}
            </VStack>
          )}

          <HStack justify="end" style={{ paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', width: '100%' }}>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </HStack>
        </VStack>
      </Modal>

    </>
  )
}

export default RoomManagementModal
