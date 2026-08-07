import React from "react"
import { FaBuilding, FaPlus, FaTrash } from "react-icons/fa"
import { Button, Input } from "hzero"
import { Heading, Text } from "@/components/ui"

const RoomAllocationForm = ({ isUnitBased, allocatedRooms, onRoomChange, onAddRoom, onRemoveRoom, onCancel, onSubmit }) => {
  return (
    <div className="border p-4 rounded-lg animate-fadeIn" style={{ backgroundColor: 'var(--color-primary-bg)', borderColor: 'var(--color-primary-pale)' }}>
      <Heading as="h3" color="brand" size="lg" weight="medium" className="font-medium mb-3 flex items-center">
        <FaBuilding className="mr-2" /> Allocate Rooms for Visitors
      </Heading>
      <Text size="sm" color="muted" className="mb-4">Assign rooms for the visitors.</Text>

      <div className="space-y-3">
        {allocatedRooms.map((room, index) => (
          <div key={index} className="flex items-center space-x-2">
            {isUnitBased ? (
              <>
                <div className="flex-1">
                  <Text as="label" size="xs" weight="medium" color="secondary" htmlFor={`unit-${index}`} className="block mb-1">
                    Unit
                  </Text>
                  <Input id={`unit-${index}`} type="text" value={room[0] || ""} onChange={(e) => onRoomChange(index, 0, e.target.value)} placeholder="A" />
                </div>
                <div className="flex-1">
                  <Text as="label" size="xs" weight="medium" color="secondary" htmlFor={`room-${index}`} className="block mb-1">
                    Room Number
                  </Text>
                  <Input id={`room-${index}`} type="text" value={room[1] || ""} onChange={(e) => onRoomChange(index, 1, e.target.value)} placeholder="101" />
                </div>
              </>
            ) : (
              <div className="flex-1">
                <Text as="label" size="xs" weight="medium" color="secondary" htmlFor={`room-${index}`} className="block mb-1">
                  Room Number
                </Text>
                <Input id={`room-${index}`} type="text" value={room[0] || ""} onChange={(e) => onRoomChange(index, 0, e.target.value)} placeholder="101" />
              </div>
            )}

            <div className="flex items-end space-x-1 pb-0.5">
              {index === allocatedRooms.length - 1 && (
                <Button type="button" onClick={onAddRoom} variant="outline" size="sm" aria-label="Add another room"><FaPlus size={14} /></Button>
              )}
              {allocatedRooms.length > 1 && (
                <Button type="button" onClick={() => onRemoveRoom(index)} variant="danger" size="sm" aria-label="Remove room"><FaTrash size={14} /></Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2 mt-4" style={{ gap: 'var(--spacing-3)' }}>
        <Button onClick={onCancel} variant="secondary" size="md">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="primary" size="md">
          Allocate Rooms
        </Button>
      </div>
    </div>
  )
}

export default RoomAllocationForm
