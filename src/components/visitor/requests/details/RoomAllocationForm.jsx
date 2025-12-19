import React from "react"
import { FaBuilding, FaPlus, FaTrash } from "react-icons/fa"

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
                  <input id={`unit-${index}`} type="text" value={room[0] || ""} onChange={(e) => onRoomChange(index, 0, e.target.value)} 
                    className="w-full border focus:outline-none" 
                    style={{ 
                      padding: 'var(--input-padding)', 
                      borderColor: 'var(--input-border)', 
                      borderRadius: 'var(--radius-md)', 
                      fontSize: 'var(--font-size-sm)',
                      backgroundColor: 'var(--input-bg)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--input-border-focus)';
                      e.target.style.boxShadow = 'var(--input-focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--input-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="A" 
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor={`room-${index}`} className="block mb-1" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>
                    Room Number
                  </label>
                  <input id={`room-${index}`} type="text" value={room[1] || ""} onChange={(e) => onRoomChange(index, 1, e.target.value)} 
                    className="w-full border focus:outline-none" 
                    style={{ 
                      padding: 'var(--input-padding)', 
                      borderColor: 'var(--input-border)', 
                      borderRadius: 'var(--radius-md)', 
                      fontSize: 'var(--font-size-sm)',
                      backgroundColor: 'var(--input-bg)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--input-border-focus)';
                      e.target.style.boxShadow = 'var(--input-focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--input-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="101" 
                  />
                </div>
              </>
            ) : (
              <div className="flex-1">
                <label htmlFor={`room-${index}`} className="block mb-1" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>
                  Room Number
                </label>
                <input id={`room-${index}`} type="text" value={room[0] || ""} onChange={(e) => onRoomChange(index, 0, e.target.value)} 
                  className="w-full border focus:outline-none" 
                  style={{ 
                    padding: 'var(--input-padding)', 
                    borderColor: 'var(--input-border)', 
                    borderRadius: 'var(--radius-md)', 
                    fontSize: 'var(--font-size-sm)',
                    backgroundColor: 'var(--input-bg)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-border-focus)';
                    e.target.style.boxShadow = 'var(--input-focus-ring)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--input-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="101" 
                />
              </div>
            )}

            <div className="flex items-end space-x-1 pb-0.5">
              {index === allocatedRooms.length - 1 && (
                <button type="button" onClick={onAddRoom} className="focus:outline-none transition-all" style={{ padding: 'var(--spacing-2)', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', borderRadius: 'var(--radius-md)', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-bg-hover)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary-bg)'}
                  title="Add another room"
                >
                  <FaPlus size={14} />
                </button>
              )}
              {allocatedRooms.length > 1 && (
                <button type="button" onClick={() => onRemoveRoom(index)} 
                  className="focus:outline-none transition-all" 
                  style={{ 
                    padding: 'var(--spacing-2)', 
                    backgroundColor: 'var(--color-danger-bg)', 
                    color: 'var(--color-danger-text)', 
                    borderRadius: 'var(--radius-md)',
                    transition: 'var(--transition-colors)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-danger-bg-light)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-danger-bg)'}
                  title="Remove room"
                >
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={onCancel} className="transition-all" style={{ padding: 'var(--button-padding-md)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
        >
          Cancel
        </button>
        <button onClick={onSubmit} className="transition-all" style={{ padding: 'var(--button-padding-md)', backgroundColor: 'var(--button-primary-bg)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', transition: 'var(--transition-colors)', boxShadow: 'var(--shadow-button-primary)' }} onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--button-primary-hover)';
            e.target.style.boxShadow = 'var(--shadow-button-primary-hover)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--button-primary-bg)';
            e.target.style.boxShadow = 'var(--shadow-button-primary)';
          }}
        >
          Allocate Rooms
        </button>
      </div>
    </div>
  )
}

export default RoomAllocationForm
