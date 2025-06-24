import React from "react"
import { FaCalendarAlt, FaInfoCircle, FaBuilding, FaUserFriends, FaMapMarkerAlt } from "react-icons/fa"
import { BsClock } from "react-icons/bs"
import Modal from "../common/Modal"
import { formatDateTime, isUpcoming } from "../../utils/dateUtils"

const EventDetailModal = ({ selectedEvent, setShowDetailModal }) => {
  if (!selectedEvent) return null

  const isEventUpcoming = isUpcoming(selectedEvent.dateAndTime)
  const { date, time } = formatDateTime(selectedEvent.dateAndTime)

  return (
    <Modal title="Event Details" onClose={() => setShowDetailModal(false)} width={700}>
      <div className="relative">
        {/* Status Badge - Positioned at top right */}
        <div className="absolute top-0 right-0">
          <span className={`px-4 py-1.5 text-sm font-medium rounded-full shadow-sm ${isEventUpcoming ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"}`}>{isEventUpcoming ? "Upcoming" : "Past"}</span>
        </div>

        {/* Header */}
        <div className="mb-6 pt-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">{selectedEvent.eventName}</h2>

          <div className="flex flex-wrap gap-y-2">
            <div className="flex items-center mr-4">
              <FaCalendarAlt className="text-[#1360AB] text-opacity-80 mr-2 flex-shrink-0" />
              <span className="text-gray-700">{date}</span>
            </div>
            <div className="flex items-center mr-4">
              <BsClock className="text-[#1360AB] text-opacity-80 mr-2 flex-shrink-0" />
              <span className="text-gray-700">{time}</span>
            </div>
            {selectedEvent.venue && (
              <div className="flex items-center mr-4">
                <FaMapMarkerAlt className="text-[#1360AB] text-opacity-80 mr-2 flex-shrink-0" />
                <span className="text-gray-700">{selectedEvent.venue}</span>
              </div>
            )}
            <div className="flex items-center mr-4">
              <FaBuilding className="text-[#1360AB] text-opacity-80 mr-2 flex-shrink-0" />
              <span className="text-gray-700">{selectedEvent.hostel?.name || "All Hostels"}</span>
            </div>
            {selectedEvent.gender && (
              <div className="flex items-center">
                <FaUserFriends className="text-[#1360AB] text-opacity-80 mr-2 flex-shrink-0" />
                <span className="text-gray-700">{selectedEvent.gender.charAt(0).toUpperCase() + selectedEvent.gender.slice(1) + " Only"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <div className="flex items-center mb-3 text-[#1360AB]">
            <FaInfoCircle className="mr-2" />
            <h3 className="font-semibold">Description</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
        </div>

        {/* Organizer */}
        {selectedEvent.organizer && (
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center mb-3 text-[#1360AB]">
              <FaUserFriends className="mr-2" />
              <h3 className="font-semibold">Organizer</h3>
            </div>
            <p className="text-gray-700">{selectedEvent.organizer}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default EventDetailModal
