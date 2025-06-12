import React, { useEffect, useState, useRef } from "react"
import { addDisCoAction, getDisCoActionsByStudent, updateDisCoAction } from "../../../services/apiService.js"
import { useAuth } from "../../../contexts/AuthProvider"

const DisCoActions = ({ userId }) => {
  const { canAccess } = useAuth()
  const [actions, setActions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    reason: "",
    actionTaken: "",
    date: "",
    remarks: "",
  })
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const dateInputRef = useRef(null)

  const handleFocus = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker()
    }
  }

  const fetchDisCoActions = async () => {
    try {
      const res = await getDisCoActionsByStudent(userId)
      setActions(res.actions)
    } catch (err) {
      console.error("Failed to fetch DisCo actions:", err)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchDisCoActions()
    }
  }, [userId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const handleEdit = (action) => {
    setFormData({
      reason: action.reason,
      actionTaken: action.actionTaken,
      date: action.date.split("T")[0],
      remarks: action.remarks || "",
    })
    setEditingId(action._id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await updateDisCoAction(editingId, { ...formData })
        alert("DisCo action updated successfully!")
      } else {
        await addDisCoAction({ ...formData, studentId: userId })
        alert("DisCo action added successfully!")
      }

      setEditingId(null)
      setFormData({
        reason: "",
        actionTaken: "",
        date: "",
        remarks: "",
      })
      setShowForm(false)

      fetchDisCoActions()
    } catch (err) {
      console.error("Failed to submit DisCo action:", err)
      alert("Failed to submit DisCo action. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 ">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg text-gray-700 font-semibold">Disciplinary Actions</h2>
        {canAccess("students_info", "create") && (
          <button className="bg-[#1360AB] text-white px-4 py-2 mb-2 rounded-lg hover:bg-blue-500" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded mb-6">
          <div className="mb-2">
            <label className="block mb-1 text-gray-700 font-medium">Action Taken</label>
            <input type="text" name="actionTaken" value={formData.actionTaken} onChange={handleChange} required className="w-full border border-gray-300 focus:border-[#1360AB] focus:ring-1 focus:ring-blue-300 p-2 rounded-lg outline-none" />
          </div>
          <div className="mb-2">
            <label className="block mb-1 text-gray-700 font-medium">Reason</label>
            <input type="text" name="reason" value={formData.reason} onChange={handleChange} required className="w-full border border-gray-300 focus:border-[#1360AB] focus:ring-1 focus:ring-blue-300 p-2 rounded-lg outline-none" />
          </div>

          <div className="mb-2">
            <label className="block mb-1 text-gray-700 font-medium">Date</label>
            <input ref={dateInputRef} type="date" name="date" value={formData.date} onChange={handleChange} onFocus={handleFocus} className="w-full border border-gray-300 focus:border-[#1360AB] focus:ring-1 focus:ring-blue-300 p-2 rounded-lg outline-none" />
          </div>

          <div className="mb-4 mt-3">
            <label className="block mb-1 text-gray-700 font-medium">Remarks (Optional)</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="w-full h-25 border border-gray-300 focus:border-[#1360AB] focus:ring-1 focus:ring-blue-300 p-2 rounded-lg outline-none resize-none" />
          </div>

          <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            {loading ? (editingId ? "Saving..." : "Submitting...") : editingId ? "Save Changes" : "Submit"}
          </button>
        </form>
      )}

      <div>
        {actions.length === 0 ? (
          <div className="bg-gray-50 h-34 flex items-center justify-center">
            <p className="text-gray-500">No DisCo actions found.</p>
          </div>
        ) : (
          <ul className="space-y-3 bg-gray-50">
            {actions.map((action) => (
              <li key={action._id} className=" border bg-gray-50 border-gray-200 shadow px-5 pt-4 rounded-xl hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-800">Action Taken:</span> {action.actionTaken}
                  </p>
                  <span className="text-sm text-gray-800">{new Date(action.date).toLocaleDateString()}</span>
                </div>

                <div className=" mt-3 mb-2 flex justify-between items-start">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-800">Reason:</span> {action.reason}
                  </p>
                  {canAccess("students_info", "edit") && editingId !== action._id && (
                    <button className="bg-[#1360AB] text-white px-3 py-1 mb-2 rounded-lg hover:bg-blue-500 text-sm" onClick={() => handleEdit(action)}>
                      Edit
                    </button>
                  )}
                </div>

                {action.remarks && (
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-800">Remarks:</span> {action.remarks}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default DisCoActions
