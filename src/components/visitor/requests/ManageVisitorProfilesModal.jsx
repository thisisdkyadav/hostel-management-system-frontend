import React, { useState } from "react"
import { FaTrash, FaEdit, FaUserAlt, FaSearch, FaTimesCircle } from "react-icons/fa"
import Modal from "../../common/Modal"
import EditVisitorProfileModal from "./EditVisitorProfileModal"
import { visitorApi } from "../../../services/visitorApi"

const ManageVisitorProfilesModal = ({ isOpen, onClose, visitorProfiles, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleDeleteProfile = async (profileId) => {
    if (window.confirm("Are you sure you want to delete this visitor profile? This action cannot be undone.")) {
      try {
        await visitorApi.deleteVisitorProfile(profileId)
        onRefresh()
      } catch (error) {
        console.error("Error deleting profile:", error)
        alert("Failed to delete profile. Please try again.")
      }
    }
  }

  const handleEditProfile = (profile) => {
    setSelectedProfile(profile)
    setShowEditModal(true)
  }

  const filteredProfiles = visitorProfiles.filter(
    (profile) => profile.name.toLowerCase().includes(searchQuery.toLowerCase()) || profile.relation.toLowerCase().includes(searchQuery.toLowerCase()) || profile.email.toLowerCase().includes(searchQuery.toLowerCase()) || profile.phone.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <>
      <Modal title="Manage Visitor Profiles" onClose={onClose} width={800}>
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:border-[#1360AB] focus:ring-1 focus:ring-[#1360AB] outline-none transition"
              placeholder="Search profiles by name, relation, email, or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setSearchQuery("")}>
                <FaTimesCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="py-8 text-center">
              <FaUserAlt className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No visitor profiles found</h3>
              <p className="mt-1 text-sm text-gray-500">{searchQuery ? "No profiles match your search criteria. Try a different search." : "You have not added any visitor profiles yet."}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitor Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relation
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProfiles.map((profile) => (
                    <tr key={profile._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaUserAlt className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{profile.email}</div>
                        <div className="text-sm text-gray-500">{profile.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800">{profile.relation}</span>
                      </td>
                      {profile.requests && profile.requests.length ? (
                        <div className="">Can't edit a used Visitor.</div>
                      ) : (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEditProfile(profile)} className="text-amber-500 hover:text-amber-600 p-1 rounded-full transition-colors" title="Edit profile">
                            <FaEdit className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDeleteProfile(profile._id)} className="text-red-500 hover:text-red-600 p-1 rounded-full transition-colors ml-2" title="Delete profile">
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Close
            </button>
          </div>
        </div>
      </Modal>

      {showEditModal && selectedProfile && (
        <EditVisitorProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={selectedProfile}
          onSubmit={async (updatedData) => {
            try {
              await visitorApi.updateVisitorProfile(selectedProfile._id, updatedData)
              setShowEditModal(false)
              onRefresh()
              return true
            } catch (error) {
              console.error("Error updating profile:", error)
              return false
            }
          }}
        />
      )}
    </>
  )
}

export default ManageVisitorProfilesModal
