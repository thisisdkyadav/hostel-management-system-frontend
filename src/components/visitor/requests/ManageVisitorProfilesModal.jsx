import React, { useState } from "react"
import { FaTrash, FaEdit, FaUserAlt, FaSearch, FaTimesCircle } from "react-icons/fa"
import EditVisitorProfileModal from "./EditVisitorProfileModal"
import { visitorApi } from "../../../service"
import { Button, Input, Table } from "czero/react"
import { HStack, Modal, Text, useConfirm, VStack } from "@/components/ui"

const ManageVisitorProfilesModal = ({ isOpen, onClose, visitorProfiles, onRefresh }) => {
  const confirm = useConfirm()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleDeleteProfile = async (profileId) => {
    if (await confirm({ message: "Are you sure you want to delete this visitor profile? This action cannot be undone.", isDestructive: true })) {
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
        <VStack gap={6}>
          {/* Search Bar */}
          <div style={{ position: "relative" }}>
            <Input type="text" placeholder="Search profiles by name, relation, email, or phone" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<FaSearch />} />
            {searchQuery && <Button onClick={() => setSearchQuery("")} variant="ghost" size="sm" style={{ position: "absolute", top: "0", bottom: "0", right: "var(--spacing-3)", display: "flex", alignItems: "center" }}>
              <FaTimesCircle />
            </Button>}
          </div>

          {filteredProfiles.length === 0 ? (
            <div style={{ paddingTop: "var(--spacing-8)", paddingBottom: "var(--spacing-8)", textAlign: "center" }}>
              <FaUserAlt style={{ margin: "0 auto", height: "var(--icon-3xl)", width: "var(--icon-3xl)", color: "var(--color-border-primary)" }} />
              <h3 style={{ marginTop: "var(--spacing-4)", fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>No visitor profiles found</h3>
              <p style={{ marginTop: "var(--spacing-1)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{searchQuery ? "No profiles match your search criteria. Try a different search." : "You have not added any visitor profiles yet."}</p>
            </div>
          ) : (
            <div style={{ overflow: "hidden", borderRadius: "var(--radius-lg)", border: `var(--border-1) solid var(--color-border-primary)` }}>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head scope="col">
                      Visitor Details
                    </Table.Head>
                    <Table.Head scope="col">
                      Contact
                    </Table.Head>
                    <Table.Head scope="col">
                      Relation
                    </Table.Head>
                    <Table.Head scope="col">
                      Actions
                    </Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredProfiles.map((profile) => (
                    <Table.Row style={{ borderTop: `var(--border-1) solid var(--color-border-primary)` }} key={profile._id}
                      
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-hover)")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-primary)")}
                    >
                      <Table.Cell style={{ whiteSpace: "nowrap" }}>
                        <HStack gap="none" align="center">
                          <div style={{ flexShrink: "0", height: "var(--avatar-md)", width: "var(--avatar-md)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-bg-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FaUserAlt style={{ height: "var(--icon-lg)", width: "var(--icon-lg)", color: "var(--color-text-muted)" }} />
                          </div>
                          <div style={{ marginLeft: "var(--spacing-4)" }}>
                            <Text as="div" size="sm" weight="medium" color="primary">{profile.name}</Text>
                          </div>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell style={{ whiteSpace: "nowrap" }}>
                        <Text as="div" size="sm" color="primary">{profile.email}</Text>
                        <Text as="div" size="sm" color="muted">{profile.phone}</Text>
                      </Table.Cell>
                      <Table.Cell style={{ whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            padding: "var(--badge-padding-sm)",
                            display: "inline-flex",
                            fontSize: "var(--badge-font-sm)",
                            lineHeight: "var(--line-height-tight)",
                            fontWeight: "var(--font-weight-medium)",
                            borderRadius: "var(--radius-full)",
                            backgroundColor: "var(--color-primary-bg)",
                            color: "var(--color-primary)",
                          }}
                        >
                          {profile.relation}
                        </span>
                      </Table.Cell>
                      {profile.requests && profile.requests.length ? (
                        <div style={{ padding: "var(--spacing-4) var(--spacing-6)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Can't edit a used Visitor.</div>
                      ) : (
                        <Table.Cell style={{ whiteSpace: "nowrap", textAlign: "right", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
                          <Button onClick={() => handleEditProfile(profile)} variant="ghost" size="sm" aria-label="Edit profile">
                            <FaEdit />
                          </Button>
                          <Button onClick={() => handleDeleteProfile(profile._id)} variant="ghost" size="sm" aria-label="Delete profile">
                            <FaTrash />
                          </Button>
                        </Table.Cell>
                      )}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "var(--spacing-4)", borderTop: `var(--border-1) solid var(--color-border-light)` }}>
            <Button onClick={onClose} variant="secondary" size="md">
              Close
            </Button>
          </div>
        </VStack>
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
