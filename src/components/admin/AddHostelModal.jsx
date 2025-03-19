import React from "react"

const AddHostelModal = ({ show, onClose }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-[20px] w-[500px] max-w-full">
        <h2 className="text-xl font-bold mb-5">Add New Hostel</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Hostel Name</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Enter hostel name" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Type</label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>Boys</option>
              <option>Girls</option>
              <option>Research Scholars</option>
              <option>International</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Total Rooms</label>
            <input type="number" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Enter total rooms" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Assign Warden</label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>Select Warden</option>
              <option>Dr. Rajesh Kumar</option>
              <option>Dr. Amit Sharma</option>
              <option>Dr. Priya Singh</option>
              <option>Dr. Meera Patel</option>
            </select>
          </div>
          <div className="flex justify-end mt-6 space-x-3">
            <button type="button" className="px-5 py-2 bg-gray-200 rounded-lg" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-[#1360AB] text-white rounded-lg">
              Add Hostel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddHostelModal
