import React, { useEffect, useState } from "react"
import { addDisCoAction, getDisCoActionsByStudent, updateDisCoAction, deleteDisCoAction } from "../../../services/apiService.js"
import { useAuth } from "../../../contexts/AuthProvider"
import { FaPlus } from "react-icons/fa"
import Button from "../../common/Button"
import DisCoActionModal from "./DisCoActionModal"

const DisCoActions = ({ userId }) => {
  const { canAccess } = useAuth()
  const [actions, setActions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDisCoActions = async () => {
    try {
      setLoading(true)
      const res = await getDisCoActionsByStudent(userId)
      setActions(res.actions)
    } catch (err) {
      setError(err)
      console.error("Failed to fetch DisCo actions:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchDisCoActions()
    }
  }, [userId])

  const handleAddClick = () => {
    setCurrentAction(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEditClick = (action) => {
    setCurrentAction(action)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (actionId) => {
    try {
      await deleteDisCoAction(actionId)
      fetchDisCoActions() // Refresh the list
    } catch (error) {
      console.error("Error deleting disciplinary action:", error)
      alert("Failed to delete disciplinary action")
    }
  }

  const handleModalSubmit = async (formData) => {
    try {
      if (isEditing) {
        await updateDisCoAction(currentAction._id, { ...formData })
      } else {
        await addDisCoAction({ ...formData, studentId: userId })
      }
      fetchDisCoActions() // Refresh the list
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error saving disciplinary action:", error)
      alert("Failed to save disciplinary action")
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-t-[#1360AB] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    )
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error: {error.message}</div>

  return (
    <div className="px-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg text-gray-700 font-semibold">Disciplinary Actions</h3>
        {canAccess("students_info", "create") && (
          <Button variant="primary" size="small" icon={<FaPlus />} onClick={handleAddClick}>
            Add DisCo Action
          </Button>
        )}
      </div>

      {actions.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-600">No disciplinary actions found.</p>
          {canAccess("students_info", "create") && (
            <Button variant="secondary" size="small" className="mt-3" onClick={handleAddClick}>
              Add DisCo Action
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {actions.map((action) => (
            <div key={action._id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <h4 className="text-md font-semibold text-gray-800">{action.actionTaken}</h4>
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{new Date(action.date).toLocaleDateString()}</span>
                </div>
                {canAccess("students_info", "edit") && (
                  <button onClick={() => handleEditClick(action)} className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                    Edit
                  </button>
                )}
              </div>

              <div className="mt-3">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-800">Reason:</span> {action.reason}
                </p>
                {action.remarks && (
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-semibold text-gray-800">Remarks:</span> {action.remarks}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && <DisCoActionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} initialData={currentAction} isEditing={isEditing} onDelete={isEditing ? handleDeleteClick : null} />}
    </div>
  )
}

export default DisCoActions
