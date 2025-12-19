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
              <button onClick={() => setShowDeleteConfirmation(false)} style={{ color: 'var(--color-text-light)', borderRadius: 'var(--radius-full)', padding: 'var(--spacing-2)', transition: 'var(--transition-all)' }} onMouseEnter={(e) => { e.target.style.color = 'var(--color-text-muted)'; e.target.style.backgroundColor = 'var(--color-bg-hover)'; }} onMouseLeave={(e) => { e.target.style.color = 'var(--color-text-light)'; e.target.style.backgroundColor = 'transparent'; }}>
                <FaTimes style={{ fontSize: 'var(--font-size-lg)' }} />
              </button>
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
              <Button onClick={() => setShowDeleteConfirmation(true)} variant="danger" disabled={isLoading} style={{ display: 'flex', alignItems: 'center' }} animation="pulse" size="small">
                <FaTrash style={{ marginRight: 'var(--spacing-2)' }} />
                Delete All Allocations
              </Button>
            )}
          </div>

          {activeTab === "view" && <ExistingRoomsList hostel={hostel} onRoomsUpdated={onRoomsUpdated} setIsLoading={setIsLoading} />}

          {activeTab === "add" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-6)' }}>
                <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }} role="group">
                  <button type="button" style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', borderTopLeftRadius: 'var(--radius-lg)', borderBottomLeftRadius: 'var(--radius-lg)', backgroundColor: inputMethod === "form" ? 'var(--color-primary)' : 'var(--color-bg-primary)', color: inputMethod === "form" ? 'var(--color-white)' : 'var(--color-text-body)', border: 'var(--border-1) solid var(--color-border-input)', transition: 'var(--transition-colors)' }} onClick={() => setInputMethod("form")} onMouseEnter={(e) => { if (inputMethod !== "form") e.target.style.backgroundColor = 'var(--color-bg-hover)'; }} onMouseLeave={(e) => { if (inputMethod !== "form") e.target.style.backgroundColor = 'var(--color-bg-primary)'; }}>
                    <FaEdit style={{ display: 'inline', marginRight: 'var(--spacing-2)' }} />
                    Form Input
                  </button>
                  <button type="button" style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', borderTopRightRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)', backgroundColor: inputMethod === "csv" ? 'var(--color-primary)' : 'var(--color-bg-primary)', color: inputMethod === "csv" ? 'var(--color-white)' : 'var(--color-text-body)', border: 'var(--border-1) solid var(--color-border-input)', transition: 'var(--transition-colors)' }} onClick={() => setInputMethod("csv")} onMouseEnter={(e) => { if (inputMethod !== "csv") e.target.style.backgroundColor = 'var(--color-bg-hover)'; }} onMouseLeave={(e) => { if (inputMethod !== "csv") e.target.style.backgroundColor = 'var(--color-bg-primary)'; }}>
                    <FaTable style={{ display: 'inline', marginRight: 'var(--spacing-2)' }} />
                    CSV Import
                  </button>
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
