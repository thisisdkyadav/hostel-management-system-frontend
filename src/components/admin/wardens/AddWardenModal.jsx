import React from "react"

const AddWardenModal = ({ show, onClose }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-[20px] w-[600px] max-w-full">
        <h2 className="text-xl font-bold mb-5">Add New Warden</h2>
        <form>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Dr. Full Name" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input type="email" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="email@iiti.ac.in" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="+91 9876543210" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Department</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Academic Department" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Education</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Ph.D. Subject" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Experience (Years)</label>
              <input type="number" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Years of experience" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Join Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Assign Hostel</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg">
                <option value="">Select Hostel</option>
                <option>Hostel A</option>
                <option>Hostel B</option>
                <option>Hostel C</option>
                <option>Hostel D</option>
                <option>Hostel E</option>
                <option>Hostel F</option>
                <option>Hostel G</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Profile Image</label>
            <input type="file" className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex justify-end mt-6 space-x-3">
            <button type="button" className="px-5 py-2 bg-gray-200 rounded-lg" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-[#1360AB] text-white rounded-lg">
              Add Warden
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddWardenModal
