import React, { useState, useEffect } from "react"
import { adminApi } from "../../../services/adminApi"
import { FaPlus } from "react-icons/fa"
import Button from "../../common/Button"
import FamilyMemberModal from "./FamilyMemberModal"
import { useAuth } from "../../../contexts/AuthProvider"

const FamilyDetails = ({ userId }) => {
  const { canAccess } = useAuth()
  const [familyDetails, setFamilyDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchFamilyDetails()
  }, [userId])

  const fetchFamilyDetails = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getFamilyDetails(userId)
      setFamilyDetails(response.data)
    } catch (error) {
      setError(error)
      console.error("Error fetching family details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setCurrentMember(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEditClick = (member) => {
    setCurrentMember(member)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (memberId) => {
    if (window.confirm("Are you sure you want to delete this family member?")) {
      try {
        await adminApi.deleteFamilyMember(memberId)
        fetchFamilyDetails() // Refresh the list
      } catch (error) {
        console.error("Error deleting family member:", error)
        alert("Failed to delete family member")
      }
    }
  }

  const handleModalSubmit = async (formData) => {
    try {
      if (isEditing) {
        await adminApi.updateFamilyMember(currentMember.id, formData)
      } else {
        await adminApi.addFamilyMember(userId, formData)
      }
      fetchFamilyDetails() // Refresh the list
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error saving family member:", error)
      alert("Failed to save family member")
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
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Family Information</h3>
        {canAccess("students_info", "create") && (
          <Button variant="primary" size="small" icon={<FaPlus />} onClick={handleAddClick}>
            Add Family Member
          </Button>
        )}
      </div>

      {familyDetails && familyDetails.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {familyDetails.map((member) => (
            <div key={member.id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <h4 className="text-md font-semibold text-gray-800">{member.name}</h4>
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{member.relationship}</span>
                </div>
                {canAccess("students_info", "edit") && (
                  <button onClick={() => handleEditClick(member)} className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                    Edit
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <span className="text-sm">{member.phone}</span>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span className="text-sm">{member.email || "N/A"}</span>
                </div>

                <div className="flex items-center md:col-span-2">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">{member.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-600">No family members added yet.</p>
          <Button variant="secondary" size="small" className="mt-3" onClick={handleAddClick}>
            Add Family Member
          </Button>
        </div>
      )}

      {isModalOpen && <FamilyMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} initialData={currentMember} isEditing={isEditing} onDelete={isEditing ? handleDeleteClick : null} />}
    </div>
  )
}

export default FamilyDetails
