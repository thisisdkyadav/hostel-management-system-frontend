import React, { useState, useEffect } from "react"
import Modal from "../../common/Modal"
import { FaTable, FaEdit } from "react-icons/fa"
import Button from "../../common/Button"
import FilterTabs from "../../common/FilterTabs"
import ExistingRoomsList from "./rooms/ExistingRoomsList"
import AddRoomForm from "./rooms/AddRoomForm"
import AddRoomsCsv from "./rooms/AddRoomsCsv"

const RoomManagementModal = ({ hostel, onClose, onRoomsUpdated }) => {
  const [activeTab, setActiveTab] = useState("view")
  const [inputMethod, setInputMethod] = useState("form")
  const [isLoading, setIsLoading] = useState(false)

  if (!hostel) return null

  const tabs = [
    { label: "View Existing Rooms", value: "view" },
    { label: "Add New Rooms", value: "add" },
  ]

  return (
    <Modal title={`Manage Rooms - ${hostel.name}`} onClose={onClose} width={800}>
      <div className="space-y-6">
        <div className="pb-4 border-b border-gray-200">
          <FilterTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
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
  )
}

export default RoomManagementModal
