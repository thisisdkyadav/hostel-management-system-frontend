import React, { useState } from "react"
import { FaEdit, FaTrash, FaDoorOpen } from "react-icons/fa"
import EditHostelModal from "./EditHostelModal"
import RoomManagementModal from "./RoomManagementModal"
import Button from "../../common/Button"

const HostelListItem = ({ hostel, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRoomManagementModal, setShowRoomManagementModal] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <h3 className="text-xl font-semibold text-gray-800">{hostel.name}</h3>

          <div className="flex space-x-2">
            <Button size="small" variant="outline" icon={<FaDoorOpen />} animation="ripple" onClick={() => setShowRoomManagementModal(true)}>
              Manage Rooms
            </Button>

            <Button size="small" variant="secondary" icon={<FaEdit />} animation="ripple" onClick={() => setShowEditModal(true)}>
              Edit
            </Button>

            <Button size="small" variant="danger" icon={<FaTrash />} animation="shake" onClick={() => onDelete(hostel.id)}>
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-sm">{hostel.gender}</span>
          <span className="bg-gray-50 text-gray-700 px-2.5 py-1 rounded-md text-sm">{hostel.type === "unit-based" ? "Unit-based Layout" : "Room-only Layout"}</span>
          <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-sm">{hostel.rooms?.length || 0} Rooms</span>
          <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-sm">Capacity: {hostel.totalCapacity || 0} Students</span>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditHostelModal
          hostel={hostel}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedHostel) => {
            onUpdate(updatedHostel)
            setShowEditModal(false)
          }}
        />
      )}

      {showRoomManagementModal && <RoomManagementModal hostel={hostel} onClose={() => setShowRoomManagementModal(false)} onRoomsUpdated={() => onUpdate({ ...hostel })} />}
    </div>
  )
}

export default HostelListItem
