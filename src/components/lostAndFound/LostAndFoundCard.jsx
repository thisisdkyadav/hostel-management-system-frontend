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
import { Card, Grid, Heading, HStack, Surface, Text, VStack } from "@/components/ui"
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
          <HStack gap="none" align="start" justify="between">
            <HStack gap="none" align="center">
              <Surface padding="var(--spacing-2-5)" radius="lg" style={{ marginRight: 'var(--spacing-3)' }}>
                <MdInventory size={20} />
              </Surface>
              <div>
                <Heading as="h3" weight="bold" color="primary" size="base" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{item.itemName}</Heading>
                <Text as="span" size="xs" color="muted">ID: {item._id.substring(0, 8)}</Text>
              </div>
            </HStack>
            <span style={{ ...getStatusStyle(item.status), fontSize: 'var(--font-size-xs)', padding: 'var(--badge-padding-sm)', borderRadius: 'var(--radius-full)' }}>{item.status}</span>
          </HStack>
        </Card.Header>

        <Card.Body>
          {item.images && item.images.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-4)' }}>
              <Grid cols={3} gap="var(--gap-sm)">
                {item.images.slice(0, 3).map((imageUrl, index) => (
                  <img key={index} src={getMediaUrl(imageUrl)} alt={`${item.itemName} ${index + 1}`} style={{ width: '100%', height: '5rem', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: `var(--border-1) solid var(--color-border-gray)` }} />
                ))}
              </Grid>
              {item.images.length > 3 && (
                <Text size="xs" color="muted" style={{ marginTop: 'var(--spacing-2)' }}>+{item.images.length - 3} more images</Text>
              )}
            </div>
          )}

          <VStack gap="var(--gap-sm)" style={{ marginTop: 'var(--spacing-4)' }}>
            <HStack gap="none" align="center">
              <BsCalendarDate style={{ opacity: 0.7, marginRight: 'var(--spacing-2)', flexShrink: 0 }} color="var(--color-primary)" />
              <Text as="span" size="sm" color="secondary">{formatDate(item.dateFound)}</Text>
            </HStack>
            <Surface bg="var(--table-header-bg)" padding={3} radius="lg">
              <Text size="sm" color="secondary" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{item.description}</Text>
            </Surface>
          </VStack>
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
