import React, { useState } from "react"
import Modal from "../../common/Modal"
import { FaTable, FaEdit, FaTrash, FaTimes } from "react-icons/fa"
import { FiAlertTriangle } from "react-icons/fi"
import Button from "../../common/Button"
import FilterTabs from "../../common/FilterTabs"
import ExistingRoomsList from "./rooms/ExistingRoomsList"
import AddRoomForm from "./rooms/AddRoomForm"
import AddRoomsCsv from "./rooms/AddRoomsCsv"
import { hostelApi } from "../../../services/hostelApi"
import { toast } from "react-hot-toast"
import { createPortal } from "react-dom"

const RoomManagementModal = ({ hostel, onClose, onRoomsUpdated }) => {
  const [activeTab, setActiveTab] = useState("view")
  const [inputMethod, setInputMethod] = useState("form")
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  if (!hostel) return null

  const tabs = [
    { label: "View Existing Rooms", value: "view" },
    { label: "Add New Rooms", value: "add" },
  ]

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>Delete All Allocations</h3>
              <Button
                onClick={() => setShowDeleteConfirmation(false)}
                variant="ghost"
                size="small"
                icon={<FaTimes />}
              />
            </div>
          </div>

          <div style={{ padding: 'var(--spacing-5) var(--spacing-6)' }}>
            <div style={{ padding: 'var(--spacing-4) 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-6)' }}>
                <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-full)' }}>
                  <FiAlertTriangle size={32} />
                </div>
              </div>

              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
                <p style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>CRITICAL WARNING</p>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  This will remove <span style={{ fontWeight: 'var(--font-weight-bold)' }}>ALL</span> student room allocations from <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{hostel.name}</span>.
                </p>
                <p style={{ color: 'var(--color-text-secondary)' }}>All students will be immediately removed from their rooms.</p>
                <p style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-weight-semibold)' }}>This action CANNOT be undone.</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)' }}>
                <Button onClick={() => setShowDeleteConfirmation(false)} variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleDeleteAllAllocations} variant="danger" disabled={isLoading} isLoading={isLoading}>
                  Delete All Allocations
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return (
    <>
      <Modal title={`Manage Rooms - ${hostel.name}`} onClose={onClose} width={800}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          <div style={{ paddingBottom: 'var(--spacing-4)', borderBottom: 'var(--border-1) solid var(--color-border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FilterTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "view" && (
              <Button onClick={() => setShowDeleteConfirmation(true)} variant="danger" disabled={isLoading} animation="pulse" size="small" icon={<FaTrash />}>
                Delete All Allocations
              </Button>
            )}
          </div>

          {activeTab === "view" && <ExistingRoomsList hostel={hostel} onRoomsUpdated={onRoomsUpdated} setIsLoading={setIsLoading} />}

          {activeTab === "add" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-6)' }}>
                <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }} role="group">
                  <Button
                    type="button"
                    variant={inputMethod === "form" ? "primary" : "white"}
                    size="medium"
                    icon={<FaEdit />}
                    onClick={() => setInputMethod("form")}
                    style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                  >
                    Form Input
                  </Button>
                  <Button
                    type="button"
                    variant={inputMethod === "csv" ? "primary" : "white"}
                    size="medium"
                    icon={<FaTable />}
                    onClick={() => setInputMethod("csv")}
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  >
                    CSV Import
                  </Button>
                </div>
              </div>

              {inputMethod === "form" ? <AddRoomForm hostel={hostel} onRoomsUpdated={onRoomsUpdated} setIsLoading={setIsLoading} /> : <AddRoomsCsv hostel={hostel} onRoomsUpdated={onRoomsUpdated} setIsLoading={setIsLoading} />}
            </div>
          )}

          <div style={{ paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} variant="outline" animation="ripple">
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <DeleteConfirmationDialog />
    </>
  )
}

export default RoomManagementModal
