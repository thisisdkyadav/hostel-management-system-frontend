import React, { useEffect, useState } from "react"
import { discoApi } from "../../../service"
import { useAuth } from "../../../contexts/AuthProvider"
import { FaPlus } from "react-icons/fa"
import DisCoActionModal from "./DisCoActionModal"
import { Button } from "@/components/ui"

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
      const res = await discoApi.getDisCoActionsByStudent(userId)
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
      await discoApi.deleteDisCoAction(actionId)
      fetchDisCoActions() // Refresh the list
    } catch (error) {
      console.error("Error deleting disciplinary action:", error)
      alert("Failed to delete disciplinary action")
    }
  }

  const handleModalSubmit = async (formData) => {
    try {
      if (isEditing) {
        await discoApi.updateDisCoAction(currentAction._id, { ...formData })
      } else {
        await discoApi.addDisCoAction({ ...formData, studentId: userId })
      }
      fetchDisCoActions() // Refresh the list
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error saving disciplinary action:", error)
      alert("Failed to save disciplinary action")
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
    container: {
      padding: "0 var(--spacing-4)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "var(--spacing-6)",
    },
    title: {
      fontSize: "var(--font-size-lg)",
      color: "var(--color-text-body)",
      fontWeight: "var(--font-weight-semibold)",
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
    dateBadge: {
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
    },
    cardText: {
      fontSize: "var(--font-size-sm)",
      color: "var(--color-text-body)",
    },
    cardTextMarginTop: {
      marginTop: "var(--spacing-2)",
    },
    cardLabel: {
      fontWeight: "var(--font-weight-semibold)",
      color: "var(--color-text-secondary)",
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
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Disciplinary Actions</h3>
        {canAccess("students_info", "create") && (
          <Button variant="primary" size="small" icon={<FaPlus />} onClick={handleAddClick}>
            Add DisCo Action
          </Button>
        )}
      </div>

      {actions.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No disciplinary actions found.</p>
          {canAccess("students_info", "create") && (
            <div style={styles.emptyAddButton}>
              <Button variant="secondary" size="small" onClick={handleAddClick}>
                Add DisCo Action
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {actions.map((action) => (
            <div key={action._id} style={styles.card} onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-md)"
            }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-sm)"
              }}
            >
              <div style={styles.cardHeader}>
                <div style={styles.cardTitleRow}>
                  <h4 style={styles.cardTitle}>{action.actionTaken}</h4>
                  <span style={styles.dateBadge}>{new Date(action.date).toLocaleDateString()}</span>
                </div>
                {canAccess("students_info", "edit") && (
                  <Button onClick={() => handleEditClick(action)} variant="secondary" size="small">
                    Edit
                  </Button>
                )}
              </div>

              <div style={styles.cardBody}>
                <p style={styles.cardText}>
                  <span style={styles.cardLabel}>Reason:</span> {action.reason}
                </p>
                {action.remarks && (
                  <p style={{ ...styles.cardText, ...styles.cardTextMarginTop }}>
                    <span style={styles.cardLabel}>Remarks:</span> {action.remarks}
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
