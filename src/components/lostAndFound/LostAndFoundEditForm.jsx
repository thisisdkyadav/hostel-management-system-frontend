import React, { useState } from "react"
import { MdInventory, MdSave, MdCancel, MdDelete } from "react-icons/md"
import { BsCalendarDate } from "react-icons/bs"
import { FaImage, FaTimes } from "react-icons/fa"
import { uploadApi } from "../../services/uploadApi"
import { getMediaUrl } from "../../utils/mediaUtils"

const LostAndFoundEditForm = ({ item, onCancel, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    itemName: item.itemName,
    description: item.description,
    status: item.status,
    dateFound: item.dateFound.split("T")[0],
    images: item.images || [],
  })
  const [uploading, setUploading] = useState(false)

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...item,
      ...formData,
    })
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      onDelete(item._id)
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const uploadedUrls = []

    try {
      for (const file of files) {
        const imageFormData = new FormData()
        imageFormData.append("image", file)
        const response = await uploadApi.uploadLostAndFoundImage(imageFormData)
        uploadedUrls.push(response.url)
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }))
    } catch (error) {
      console.error("Error uploading images:", error)
      alert("Failed to upload some images. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-primary)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--spacing-5)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'var(--transition-shadow)',
      border: `var(--border-1) solid var(--color-border-light)`
    }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
          <div style={{
            ...getStatusStyle(formData.status),
            padding: 'var(--spacing-2-5)',
            marginRight: 'var(--spacing-3)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <MdInventory size={20} />
          </div>
          <div style={{ width: '100%' }}>
            <input 
              type="text" 
              name="itemName" 
              value={formData.itemName} 
              onChange={handleChange} 
              style={{
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--font-size-xl)',
                width: '100%',
                borderBottom: `var(--border-1) solid var(--color-border-input)`,
                outline: 'none',
                paddingBottom: 'var(--spacing-1)',
                border: 'none',
                borderBottom: `var(--border-1) solid var(--color-border-input)`
              }}
              onFocus={(e) => e.target.style.borderBottomColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'var(--color-border-input)'}
              required 
            />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>ID: {item._id.substring(0, 8)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BsCalendarDate style={{ 
              color: 'var(--color-primary)', 
              opacity: 0.7, 
              marginRight: 'var(--spacing-2)', 
              flexShrink: 0 
            }} />
            <input 
              type="date" 
              name="dateFound" 
              value={formData.dateFound} 
              onChange={handleChange} 
              style={{
                fontSize: 'var(--font-size-sm)',
                border: `var(--border-1) solid var(--color-border-input)`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-3) var(--spacing-3)',
                outline: 'none',
                width: '100%'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = 'var(--input-focus-ring)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border-input)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--spacing-1-5)'
            }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              style={{
                width: '100%',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                border: `var(--border-1) solid var(--color-border-input)`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-3)',
                outline: 'none',
                resize: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = 'var(--input-focus-ring)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border-input)';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Item description"
            ></textarea>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--spacing-1-5)'
            }}>Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange} 
              style={{
                width: '100%',
                padding: 'var(--spacing-2-5)',
                border: `var(--border-1) solid var(--color-border-input)`,
                borderRadius: 'var(--radius-lg)',
                outline: 'none',
                backgroundColor: 'var(--color-bg-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = 'var(--input-focus-ring)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border-input)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="Active">Active</option>
              <option value="Claimed">Claimed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--spacing-1-5)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaImage style={{ marginRight: 'var(--spacing-2)' }} />
                Item Images
              </div>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
              style={{
                width: '100%',
                padding: 'var(--spacing-2)',
                fontSize: 'var(--font-size-sm)',
                border: `var(--border-1) solid var(--color-border-input)`,
                borderRadius: 'var(--radius-lg)',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.outline = 'none'}
              onBlur={(e) => e.target.style.outline = 'none'}
            />
            {uploading && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-info-text)', marginTop: 'var(--spacing-1)' }}>Uploading...</p>}

            {formData.images && formData.images.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-2)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-sm)' }}>
                {formData.images.map((imageUrl, index) => (
                  <div key={index} style={{ position: 'relative' }} className="group">
                    <img 
                      src={getMediaUrl(imageUrl)} 
                      alt={`Item ${index + 1}`} 
                      style={{
                        width: '100%',
                        height: '5rem',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-lg)',
                        border: `var(--border-1) solid var(--color-border-gray)`
                      }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)} 
                      style={{
                        position: 'absolute',
                        top: 'var(--spacing-1)',
                        right: 'var(--spacing-1)',
                        backgroundColor: 'var(--color-danger)',
                        color: 'var(--color-white)',
                        borderRadius: 'var(--radius-full)',
                        padding: 'var(--spacing-1)',
                        opacity: 0,
                        transition: 'var(--transition-opacity)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      className="group-hover:opacity-100"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{
          marginTop: 'var(--spacing-5)',
          paddingTop: 'var(--spacing-3)',
          borderTop: `var(--border-1) solid var(--color-border-light)`,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--gap-sm)',
          flexWrap: 'wrap'
        }}>
          <button 
            type="button" 
            onClick={handleDelete} 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--spacing-2) var(--spacing-4)',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger-text)',
              borderRadius: 'var(--radius-lg)',
              transition: 'var(--transition-colors)',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-danger-bg-light)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-danger-bg)'}
          >
            <MdDelete style={{ marginRight: 'var(--spacing-2)' }} /> Delete
          </button>

          <div style={{ display: 'flex', gap: 'var(--gap-sm)' }}>
            <button 
              type="button" 
              onClick={onCancel} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-2) var(--spacing-4)',
                backgroundColor: 'var(--color-bg-muted)',
                color: 'var(--color-text-secondary)',
                borderRadius: 'var(--radius-lg)',
                transition: 'var(--transition-colors)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-border-gray)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
            >
              <MdCancel style={{ marginRight: 'var(--spacing-2)' }} /> Cancel
            </button>
            <button 
              type="submit" 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-2) var(--spacing-4)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                transition: 'var(--transition-colors)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
            >
              <MdSave style={{ marginRight: 'var(--spacing-2)' }} /> Save
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LostAndFoundEditForm
