import React, { useState } from "react"
import { FaEdit } from "react-icons/fa"
import { BsCalendarDate } from "react-icons/bs"
import { MdInventory } from "react-icons/md"
import { formatDate } from "../../utils/formatters"
import { getMediaUrl } from "../../utils/mediaUtils"
import LostAndFoundEditForm from "./LostAndFoundEditForm"
import LostAndFoundDetailModal from "./LostAndFoundDetailModal"
import { lostAndFoundApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"
import { Card } from "@/components/ui"
import { Button } from "czero/react"

const LostAndFoundCard = ({ item, refresh }) => {
  const { user } = useAuth()
  const canEditLostAndFound =
    true &&
    ["Admin", "Warden", "Associate Warden", "Hostel Supervisor", "Security", "Hostel Gate"].includes(user?.role)

  const [isEditing, setIsEditing] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return {
          backgroundColor: 'var(--color-success-bg)',
          color: 'var(--color-success-text)'
        }
      case "Claimed":
        return {
          backgroundColor: 'var(--color-info-bg)',
          color: 'var(--color-info-text)'
        }
      default:
        return {
          backgroundColor: 'var(--color-bg-muted)',
          color: 'var(--color-text-tertiary)'
        }
    }
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async (updatedItem) => {
    try {
      const response = await lostAndFoundApi.updateLostItem(updatedItem._id, updatedItem)
      if (response.success) {
        alert("Item updated successfully")
        setIsEditing(false)
        refresh()
      } else {
        alert("Failed to update item")
      }
    } catch (error) {
      alert("An error occurred while updating te item")
    }
  }

  const handleDelete = async (itemId) => {
    try {
      const response = await lostAndFoundApi.deleteLostItem(itemId)
      if (response.success) {
        alert("Item deleted successfully")
        refresh()
      } else {
        alert("Failed to delete item")
      }
    } catch (error) {
      alert("An error occurred while deleting the item")
    }
  }

  const handleCardClick = () => {
    setShowDetailModal(true)
  }

  if (isEditing) {
    return <LostAndFoundEditForm item={item} onCancel={handleCancelEdit} onSave={handleSaveEdit} onDelete={handleDelete} />
  }

  return (
    <>
      <Card className="cursor-pointer" onClick={handleCardClick} >
        <Card.Header style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ ...getStatusStyle(item.status), padding: 'var(--spacing-2-5)', marginRight: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}>
                <MdInventory size={20} />
              </div>
              <div>
                <h3 style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{item.itemName}</h3>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>ID: {item._id.substring(0, 8)}</span>
              </div>
            </div>
            <span style={{ ...getStatusStyle(item.status), fontSize: 'var(--font-size-xs)', padding: 'var(--badge-padding-sm)', borderRadius: 'var(--radius-full)' }}>{item.status}</span>
          </div>
        </Card.Header>

        <Card.Body>
          {item.images && item.images.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-sm)' }}>
                {item.images.slice(0, 3).map((imageUrl, index) => (
                  <img key={index} src={getMediaUrl(imageUrl)} alt={`${item.itemName} ${index + 1}`} style={{ width: '100%', height: '5rem', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: `var(--border-1) solid var(--color-border-gray)` }} />
                ))}
              </div>
              {item.images.length > 3 && (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>+{item.images.length - 3} more images</p>
              )}
            </div>
          )}

          <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BsCalendarDate style={{ color: 'var(--color-primary)', opacity: 0.7, marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{formatDate(item.dateFound)}</span>
            </div>
            <div style={{ backgroundColor: 'var(--table-header-bg)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{item.description}</p>
            </div>
          </div>
        </Card.Body>

        <Card.Footer style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-3)', borderTop: `var(--border-1) solid var(--color-border-light)`, display: 'flex', justifyContent: 'flex-end' }}>
          {canEditLostAndFound && (
            <Button onClick={handleEditClick} variant="outline" size="sm">
              <FaEdit /> Edit
            </Button>
          )}
        </Card.Footer>
      </Card>

      {showDetailModal && <LostAndFoundDetailModal selectedItem={item} setShowDetailModal={setShowDetailModal} />}
    </>
  )
}

export default LostAndFoundCard
