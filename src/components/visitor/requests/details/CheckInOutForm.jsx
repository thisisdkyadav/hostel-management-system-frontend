import React, { useState } from "react"
import { format } from "date-fns"

const CheckInOutForm = ({ requestId, visitorInfo, checkInTime, checkOutTime, onCheckIn, onCheckOut, onUpdateTimes, onCancel }) => {
  const today = new Date()
  const formattedDate = format(today, "yyyy-MM-dd")
  const formattedTime = format(today, "HH:mm")

  const [newCheckInDate, setNewCheckInDate] = useState(checkInTime ? format(new Date(checkInTime), "yyyy-MM-dd") : formattedDate)
  const [newCheckInTime, setNewCheckInTime] = useState(checkInTime ? format(new Date(checkInTime), "HH:mm") : formattedTime)
  const [newCheckOutDate, setNewCheckOutDate] = useState(checkOutTime ? format(new Date(checkOutTime), "yyyy-MM-dd") : formattedDate)
  const [newCheckOutTime, setNewCheckOutTime] = useState(checkOutTime ? format(new Date(checkOutTime), "HH:mm") : formattedTime)
  const [notes, setNotes] = useState("")

  // Determine the current state
  const isCheckedIn = !!checkInTime
  const isCheckedOut = !!checkOutTime
  const isEditMode = isCheckedIn // We're in edit mode if already checked in

  const handleCheckIn = () => {
    const checkInDateTime = `${newCheckInDate}T${newCheckInTime}:00`
    onCheckIn({
      checkInTime: checkInDateTime,
      notes,
    })
  }

  const handleCheckOut = () => {
    const checkOutDateTime = `${newCheckOutDate}T${newCheckOutTime}:00`
    onCheckOut({
      checkOutTime: checkOutDateTime,
      notes,
    })
  }

  const handleUpdateTimes = () => {
    const checkInDateTime = `${newCheckInDate}T${newCheckInTime}:00`
    const checkOutDateTime = isCheckedOut ? `${newCheckOutDate}T${newCheckOutTime}:00` : null

    onUpdateTimes({
      checkInTime: checkInDateTime,
      checkOutTime: checkOutDateTime,
      notes,
    })
  }

  // Dynamic title based on the current state
  const getFormTitle = () => {
    if (!isCheckedIn) return "Security Check-in"
    if (isCheckedOut) return "Update Check-in/Check-out Information"
    return "Security Check-out"
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{getFormTitle()}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name(s)</label>
          <div className="p-2 bg-gray-100 rounded text-sm">{visitorInfo}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
          <input
            type="date"
            value={newCheckInDate}
            onChange={(e) => setNewCheckInDate(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!isEditMode && isCheckedIn} // Only editable if in edit mode
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
          <input
            type="time"
            value={newCheckInTime}
            onChange={(e) => setNewCheckInTime(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!isEditMode && isCheckedIn} // Only editable if in edit mode
          />
        </div>
      </div>

      {/* Show check-out fields if already checked in or checked out */}
      {isCheckedIn && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
            <input type="date" value={newCheckOutDate} onChange={(e) => setNewCheckOutDate(e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
            <input type="time" value={newCheckOutTime} onChange={(e) => setNewCheckOutTime(e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Security Notes (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Add any security notes about the visitors..."></textarea>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Cancel
        </button>

        {/* Show appropriate action button based on the current state */}
        {!isCheckedIn ? (
          // Case 1: Initial check-in (not checked in yet)
          <button type="button" onClick={handleCheckIn} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Check-in Visitor
          </button>
        ) : isCheckedOut ? (
          // Case 2: Already checked out, only edit allowed
          <button type="button" onClick={handleUpdateTimes} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Update Times
          </button>
        ) : (
          // Case 3: Checked in but not checked out, show both options
          <div className="flex space-x-3">
            <button type="button" onClick={handleUpdateTimes} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Update Check-in
            </button>
            <button type="button" onClick={handleCheckOut} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Check-out Visitor
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckInOutForm
