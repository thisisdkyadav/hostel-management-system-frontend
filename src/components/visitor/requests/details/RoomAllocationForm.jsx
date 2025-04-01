import React from "react"
import { FaBuilding, FaPlus, FaTrash } from "react-icons/fa"

const RoomAllocationForm = ({ isUnitBased, allocatedRooms, onRoomChange, onAddRoom, onRemoveRoom, onCancel, onSubmit }) => {
  return (
    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg animate-fadeIn">
      <h3 className="font-medium text-blue-800 mb-3 flex items-center">
        <FaBuilding className="mr-2" /> Allocate Rooms for Visitors
      </h3>
      <p className="text-sm text-gray-600 mb-4">Assign rooms for the visitors.</p>

      <div className="space-y-3">
        {allocatedRooms.map((room, index) => (
          <div key={index} className="flex items-center space-x-2">
            {isUnitBased ? (
              <>
                <div className="flex-1">
                  <label htmlFor={`unit-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input id={`unit-${index}`} type="text" value={room[0] || ""} onChange={(e) => onRoomChange(index, 0, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="A" />
                </div>
                <div className="flex-1">
                  <label htmlFor={`room-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Room Number
                  </label>
                  <input id={`room-${index}`} type="text" value={room[1] || ""} onChange={(e) => onRoomChange(index, 1, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="101" />
                </div>
              </>
            ) : (
              <div className="flex-1">
                <label htmlFor={`room-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                  Room Number
                </label>
                <input id={`room-${index}`} type="text" value={room[0] || ""} onChange={(e) => onRoomChange(index, 0, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="101" />
              </div>
            )}

            <div className="flex items-end space-x-1 pb-0.5">
              {index === allocatedRooms.length - 1 && (
                <button type="button" onClick={onAddRoom} className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none" title="Add another room">
                  <FaPlus size={14} />
                </button>
              )}
              {allocatedRooms.length > 1 && (
                <button type="button" onClick={() => onRemoveRoom(index)} className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none" title="Remove room">
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button onClick={onSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Allocate Rooms
        </button>
      </div>
    </div>
  )
}

export default RoomAllocationForm
