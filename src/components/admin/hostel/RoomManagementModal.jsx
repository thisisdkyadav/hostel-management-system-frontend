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
      <div className="fixed inset-0 bg-[var(--color-bg-modal-overlay)] backdrop-blur-sm flex items-center justify-center z-[60] p-4 md:p-6">
        <div className="bg-[var(--color-bg-primary)] rounded-2xl overflow-auto animate-fadeIn w-full max-w-md" style={{ boxShadow: 'var(--shadow-modal)' }}>
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-xl md:text-2xl font-bold text-[var(--color-primary)]">Delete All Allocations</h3>
              <button onClick={() => setShowDeleteConfirmation(false)} className="text-[var(--color-text-light)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] rounded-full p-2 transition-all duration-200">
                <FaTimes className="text-lg" />
              </button>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="py-4">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-100 text-red-700 rounded-full">
                  <FiAlertTriangle size={32} />
                </div>
              </div>

              <div className="text-center space-y-4 mb-6">
                <p className="text-red-600 font-bold text-lg">CRITICAL WARNING</p>
                <p className="text-gray-800">
                  This will remove <span className="font-bold">ALL</span> student room allocations from <span className="font-bold">{hostel.name}</span>.
                </p>
                <p className="text-gray-800">All students will be immediately removed from their rooms.</p>
                <p className="text-red-600 font-semibold">This action CANNOT be undone.</p>
              </div>

              <div className="flex justify-center space-x-4 pt-4">
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
        <div className="space-y-6">
          <div className="pb-4 border-b border-gray-200 flex justify-between items-center">
            <FilterTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "view" && (
              <Button onClick={() => setShowDeleteConfirmation(true)} variant="danger" disabled={isLoading} className="flex items-center" animation="pulse" size="small">
                <FaTrash className="mr-2" />
                Delete All Allocations
              </Button>
            )}
          </div>

          {activeTab === "view" && <ExistingRoomsList hostel={hostel} onRoomsUpdated={onRoomsUpdated} setIsLoading={setIsLoading} />}

          {activeTab === "add" && (
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button type="button" className={`px-4 py-2 text-sm font-medium rounded-l-lg ${inputMethod === "form" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border border-gray-300`} onClick={() => setInputMethod("form")}>
                    <FaEdit className="inline mr-2" />
                    Form Input
                  </button>
                  <button type="button" className={`px-4 py-2 text-sm font-medium rounded-r-lg ${inputMethod === "csv" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border border-gray-300`} onClick={() => setInputMethod("csv")}>
                    <FaTable className="inline mr-2" />
                    CSV Import
                  </button>
                </div>
              </div>

              {inputMethod === "form" ? <AddRoomForm hostel={hostel} onRoomsUpdated={onRoomsUpdated} setIsLoading={setIsLoading} /> : <AddRoomsCsv hostel={hostel} onRoomsUpdated={onRoomsUpdated} setIsLoading={setIsLoading} />}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end">
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
