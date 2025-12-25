import React, { useState } from "react"
import { FaTrash, FaEdit, FaUserAlt, FaSearch, FaTimesCircle } from "react-icons/fa"
import Modal from "../../common/Modal"
import EditVisitorProfileModal from "./EditVisitorProfileModal"
import { visitorApi } from "../../../services/visitorApi"
import Button from "../../common/Button"

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '0', bottom: '0', left: 'var(--spacing-3)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <FaSearch style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)', color: 'var(--color-text-placeholder)' }} />
            </div>
            <input type="text" style={{ display: 'block', width: '100%', paddingLeft: 'var(--spacing-10)', paddingRight: 'var(--spacing-10)', paddingTop: 'var(--spacing-3)', paddingBottom: 'var(--spacing-3)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-colors)', fontSize: 'var(--font-size-base)' }} placeholder="Search profiles by name, relation, email, or phone" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)'
                e.target.style.boxShadow = 'var(--input-focus-ring)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border-input)'
                e.target.style.boxShadow = 'none'
              }}
            />
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")} variant="ghost" size="small" icon={<FaTimesCircle />} style={{ position: 'absolute', top: '0', bottom: '0', right: 'var(--spacing-3)', display: 'flex', alignItems: 'center' }} />
            )}
          </div>

          {filteredProfiles.length === 0 ? (
            <div style={{ paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-8)', textAlign: 'center' }}>
              <FaUserAlt style={{ margin: '0 auto', height: 'var(--icon-3xl)', width: 'var(--icon-3xl)', color: 'var(--color-border-primary)' }} />
              <h3 style={{ marginTop: 'var(--spacing-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>No visitor profiles found</h3>
              <p style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{searchQuery ? "No profiles match your search criteria. Try a different search." : "You have not added any visitor profiles yet."}</p>
            </div>
          ) : (
            <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: `var(--border-1) solid var(--color-border-primary)` }}>
              <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <tr>
                    <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                      Visitor Details
                    </th>
                    <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                      Contact
                    </th>
                    <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                      Relation
                    </th>
                    <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'right', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  {filteredProfiles.map((profile) => (
                    <tr key={profile._id} style={{ borderTop: `var(--border-1) solid var(--color-border-primary)`, transition: 'var(--transition-colors)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'}
                    >
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ flexShrink: '0', height: 'var(--avatar-md)', width: 'var(--avatar-md)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaUserAlt style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)', color: 'var(--color-text-muted)' }} />
                          </div>
                          <div style={{ marginLeft: 'var(--spacing-4)' }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{profile.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{profile.email}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{profile.phone}</div>
                      </td>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                        <span style={{ padding: 'var(--badge-padding-sm)', display: 'inline-flex', fontSize: 'var(--badge-font-sm)', lineHeight: 'var(--line-height-tight)', fontWeight: 'var(--font-weight-medium)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>{profile.relation}</span>
                      </td>
                      {profile.requests && profile.requests.length ? (
                        <div style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Can't edit a used Visitor.</div>
                      ) : (
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          <Button onClick={() => handleEditProfile(profile)} variant="ghost" size="small" icon={<FaEdit />} aria-label="Edit profile" />
                          <Button onClick={() => handleDeleteProfile(profile._id)} variant="ghost" size="small" icon={<FaTrash />} aria-label="Delete profile" style={{ marginLeft: 'var(--spacing-2)' }} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
            <Button onClick={onClose} variant="secondary" size="medium">
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {showEditModal && selectedProfile && (
        <EditVisitorProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)}
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
