import React from "react"
import { FaBuilding, FaPlus, FaTrash } from "react-icons/fa"
import Button from "../../../common/Button"
import Input from "../../../common/ui/Input"

const RoomAllocationForm = ({ isUnitBased, allocatedRooms, onRoomChange, onAddRoom, onRemoveRoom, onCancel, onSubmit }) => {
  return (
    <div className="border p-4 rounded-lg animate-fadeIn" style={{ backgroundColor: 'var(--color-primary-bg)', borderColor: 'var(--color-primary-pale)' }}>
      <h3 className="font-medium mb-3 flex items-center" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)' }}>
        <FaBuilding className="mr-2" /> Allocate Rooms for Visitors
      </h3>
      <p className="mb-4" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Assign rooms for the visitors.</p>

      <div className="space-y-3">
        {allocatedRooms.map((room, index) => (
          <div key={index} className="flex items-center space-x-2">
            {isUnitBased ? (
              <>
                <div className="flex-1">
                  <label htmlFor={`unit-${index}`} className="block mb-1" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>
                    Unit
                  </label>
                  <Input id={`unit-${index}`} type="text" value={room[0] || ""} onChange={(e) => onRoomChange(index, 0, e.target.value)} placeholder="A" />
                </div>
                <div className="flex-1">
                  <label htmlFor={`room-${index}`} className="block mb-1" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>
                    Room Number
                  </label>
                  <Input id={`room-${index}`} type="text" value={room[1] || ""} onChange={(e) => onRoomChange(index, 1, e.target.value)} placeholder="101" />
                </div>
              </>
            ) : (
              <div className="flex-1">
                <label htmlFor={`room-${index}`} className="block mb-1" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>
                  Room Number
                </label>
                <Input id={`room-${index}`} type="text" value={room[0] || ""} onChange={(e) => onRoomChange(index, 0, e.target.value)} placeholder="101" />
              </div>
            )}

            <div className="flex items-end space-x-1 pb-0.5">
              {index === allocatedRooms.length - 1 && (
                <Button type="button" onClick={onAddRoom} variant="outline" size="small" icon={<FaPlus size={14} />} aria-label="Add another room" />
              )}
              {allocatedRooms.length > 1 && (
                <Button type="button" onClick={() => onRemoveRoom(index)} variant="danger" size="small" icon={<FaTrash size={14} />} aria-label="Remove room" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2 mt-4" style={{ gap: 'var(--spacing-3)' }}>
        <Button onClick={onCancel} variant="secondary" size="medium">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="primary" size="medium">
          Allocate Rooms
        </Button>
      </div>
    </div>
  )
}

export default RoomAllocationForm
