import React, { useState, useEffect } from "react"
import { adminApi } from "../../../service"
import { Plus } from "lucide-react"
import FamilyMemberModal from "./FamilyMemberModal"
import { useAuth } from "../../../contexts/AuthProvider"
import { Button } from "czero/react"

const FamilyDetails = ({ userId }) => {
  const { canAccess } = useAuth()
  const [familyDetails, setFamilyDetails] = useState([])
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
      const members = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : []

      setFamilyDetails(
        members.map((member) => ({
          ...member,
          id: member.id || member._id,
        }))
      )
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

  const styles = {
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "var(--spacing-8)",
    },
    spinner: {
      width: "var(--avatar-sm)",
      height: "var(--avatar-sm)",
      border: "var(--border-4) solid transparent",
      borderTopColor: "var(--color-primary)",
      borderRadius: "var(--radius-full)",
      animation: "spin 1s linear infinite",
    },
    errorContainer: {
      padding: "var(--spacing-4)",
      backgroundColor: "var(--color-danger-bg-light)",
      color: "var(--color-danger)",
      borderRadius: "var(--radius-lg)",
      fontSize: "var(--font-size-base)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "var(--spacing-6)",
    },
    title: {
      fontSize: "var(--font-size-lg)",
      fontWeight: "var(--font-weight-semibold)",
      color: "var(--color-text-body)",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(1, 1fr)",
      gap: "var(--spacing-4)",
    },
    card: {
      backgroundColor: "var(--color-bg-primary)",
      border: "var(--border-1) solid var(--color-border-primary)",
      padding: "var(--spacing-4)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      transition: "var(--transition-all)",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardTitleRow: {
      display: "flex",
      alignItems: "center",
    },
    cardTitle: {
      fontSize: "var(--font-size-md)",
      fontWeight: "var(--font-weight-semibold)",
      color: "var(--color-text-secondary)",
    },
    badge: {
      marginLeft: "var(--spacing-2)",
      padding: "var(--spacing-0-5) var(--spacing-2)",
      backgroundColor: "var(--color-primary-bg)",
      color: "var(--color-primary)",
      fontSize: "var(--font-size-xs)",
      borderRadius: "var(--radius-full)",
    },
    editButton: {
      padding: "var(--spacing-1) var(--spacing-3)",
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--color-primary)",
      backgroundColor: "var(--color-primary-bg)",
      borderRadius: "var(--radius-md)",
      transition: "var(--transition-all)",
      border: "none",
      cursor: "pointer",
    },
    cardBody: {
      marginTop: "var(--spacing-3)",
      display: "grid",
      gridTemplateColumns: "repeat(1, 1fr)",
      gap: "var(--spacing-3)",
    },
    infoRow: {
      display: "flex",
      alignItems: "center",
    },
    iconWrapperBlue: {
      width: "var(--avatar-sm)",
      height: "var(--avatar-sm)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-full)",
      backgroundColor: "var(--color-primary-bg)",
      color: "var(--color-primary)",
      marginRight: "var(--spacing-2)",
    },
    iconWrapperGreen: {
      width: "var(--avatar-sm)",
      height: "var(--avatar-sm)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-full)",
      backgroundColor: "var(--color-success-bg-light)",
      color: "var(--color-success)",
      marginRight: "var(--spacing-2)",
    },
    iconWrapperAmber: {
      width: "var(--avatar-sm)",
      height: "var(--avatar-sm)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-full)",
      backgroundColor: "var(--color-warning-bg-light)",
      color: "var(--color-warning)",
      marginRight: "var(--spacing-2)",
    },
    icon: {
      height: "var(--icon-md)",
      width: "var(--icon-md)",
    },
    infoText: {
      fontSize: "var(--font-size-sm)",
      color: "var(--color-text-body)",
    },
    emptyState: {
      backgroundColor: "var(--color-bg-tertiary)",
      padding: "var(--spacing-8)",
      textAlign: "center",
      borderRadius: "var(--radius-lg)",
      border: "var(--border-1) solid var(--color-border-primary)",
    },
    emptyText: {
      color: "var(--color-text-muted)",
      fontSize: "var(--font-size-base)",
    },
    emptyAddButton: {
      marginTop: "var(--spacing-3)",
    },
  }

  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    )
  if (error) return <div style={styles.errorContainer}>Error: {error.message}</div>

  return (
    <div>
      <div style={styles.header}>
        <h3 style={styles.title}>Family Information</h3>
        {canAccess("students_info", "create") && (
          <Button variant="primary" size="sm" onClick={handleAddClick}>
            <Plus size={16} />
            Add Family Member
          </Button>
        )}
      </div>

      {familyDetails.length > 0 ? (
        <div style={styles.grid}>
          {familyDetails.map((member) => (
            <div key={member.id} style={styles.card} onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-md)"
            }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-sm)"
              }}
            >
              <div style={styles.cardHeader}>
                <div style={styles.cardTitleRow}>
                  <h4 style={styles.cardTitle}>{member.name}</h4>
                  <span style={styles.badge}>{member.relationship}</span>
                </div>
                {canAccess("students_info", "edit") && (
                  <Button onClick={() => handleEditClick(member)} variant="secondary" size="sm">
                    Edit
                  </Button>
                )}
              </div>

              <div style={{ ...styles.cardBody, gridTemplateColumns: "repeat(2, 1fr)" }}>
                <div style={styles.infoRow}>
                  <div style={styles.iconWrapperBlue}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <span style={styles.infoText}>{member.phone}</span>
                </div>

                <div style={styles.infoRow}>
                  <div style={styles.iconWrapperGreen}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span style={styles.infoText}>{member.email || "N/A"}</span>
                </div>

                <div style={{ ...styles.infoRow, gridColumn: "span 2" }}>
                  <div style={styles.iconWrapperAmber}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span style={styles.infoText}>{member.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No family members added yet.</p>
          <div style={styles.emptyAddButton}>
            <Button variant="secondary" size="sm" onClick={handleAddClick}>
              Add Family Member
            </Button>
          </div>
        </div>
      )}

      {isModalOpen && <FamilyMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} initialData={currentMember} isEditing={isEditing} onDelete={isEditing ? handleDeleteClick : null} />}
    </div>
  )
}

export default FamilyDetails
