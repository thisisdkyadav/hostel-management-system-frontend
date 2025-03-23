import React from "react"
import { FaBed } from "react-icons/fa"

const BedSelectionComponent = ({ roomDetails, selectedBed, onSelectBed }) => {
  if (!roomDetails) {
    return <div>Loading room details...</div>
  }

  const calculateAvailableBeds = () => {
    if (!roomDetails || !roomDetails.capacity) return []
    const allBeds = Array.from({ length: roomDetails.capacity }, (_, i) => i + 1)
    const occupiedBeds = roomDetails.students?.map((student) => student.bedNumber) || []
    return allBeds.filter((bed) => !occupiedBeds.includes(bed))
  }

  const availableBeds = calculateAvailableBeds()

  return (
    <div>
      {availableBeds.length === 0 ? (
        <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md">No beds available in this room</div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-3">Select a bed number for the student in the new room:</p>
          <div className="flex flex-wrap gap-2">
            {availableBeds.map((bedNumber) => (
              <button
                key={bedNumber}
                onClick={() => onSelectBed(bedNumber)}
                className={`flex items-center justify-center w-16 px-4 py-2 rounded-md border transition-colors ${selectedBed === bedNumber ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
              >
                <FaBed className={`mr-1 ${selectedBed === bedNumber ? "text-white" : "text-gray-500"}`} />
                {bedNumber}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default BedSelectionComponent
