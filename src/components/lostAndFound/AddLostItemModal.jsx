import React, { useState } from "react"
import { lostAndFoundApi } from "../../services/apiService"
import { uploadApi } from "../../services/uploadApi"
import Modal from "../common/Modal"
import { FaCalendarAlt, FaClipboardList, FaBoxOpen, FaImage, FaTimes } from "react-icons/fa"

const AddLostItemModal = ({ show, onClose, onItemAdded }) => {
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    dateFound: new Date().toISOString().split("T")[0],
    status: "Active",
    images: [],
  })
  const [uploading, setUploading] = useState(false)
  const [previewImages, setPreviewImages] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const uploadedUrls = []
    const previews = []

    try {
      for (const file of files) {
        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          previews.push(reader.result)
          if (previews.length === files.length) {
            setPreviewImages((prev) => [...prev, ...previews])
          }
        }
        reader.readAsDataURL(file)

        // Upload to server
        const formData = new FormData()
        formData.append("image", file)
        const response = await uploadApi.uploadLostAndFoundImage(formData)
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
    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const newItem = await lostAndFoundApi.addLostItem(formData)
      if (!newItem) {
        alert("Failed to add item. Please try again.")
        return
      }
      alert(`Item "${newItem.itemName}" added successfully!`)
      onItemAdded && onItemAdded()
      onClose()
    } catch (error) {
      console.error("Error adding lost item:", error)
      alert("Failed to add item. Please try again.")
    }
  }

  if (!show) return null

  return (
    <Modal title="Add Lost Item" onClose={onClose} width={600}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
          <div>
            <label style={{
              display: 'block',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 'var(--spacing-2)'
            }}>Item Name</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: 'var(--spacing-3)',
                top: 'var(--spacing-3)',
                color: 'var(--color-text-placeholder)'
              }}>
                <FaClipboardList />
              </div>
              <input 
                type="text" 
                name="itemName" 
                value={formData.itemName} 
                onChange={handleChange} 
                style={{
                  width: '100%',
                  padding: 'var(--spacing-3)',
                  paddingLeft: 'var(--spacing-10)',
                  border: `var(--border-1) solid var(--color-border-input)`,
                  borderRadius: 'var(--radius-lg)',
                  outline: 'none',
                  transition: 'var(--transition-all)'
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = 'var(--input-focus-ring)';
                  e.target.style.borderColor = 'var(--input-border-focus)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = 'var(--color-border-input)';
                }}
                placeholder="Enter item name" 
                required 
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 'var(--spacing-2)'
            }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              style={{
                width: '100%',
                padding: 'var(--spacing-3)',
                border: `var(--border-1) solid var(--color-border-input)`,
                borderRadius: 'var(--radius-lg)',
                outline: 'none',
                transition: 'var(--transition-all)',
                resize: 'none'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = 'var(--input-focus-ring)';
                e.target.style.borderColor = 'var(--input-border-focus)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = 'var(--color-border-input)';
              }}
              placeholder="Describe the item, condition, where it was found, etc."
              required
            ></textarea>
          </div>

          <div>
            <label style={{
              display: 'block',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 'var(--spacing-2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaImage style={{ marginRight: 'var(--spacing-2)' }} />
                Item Images (Optional)
              </div>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-3)',
                  border: `var(--border-1) solid var(--color-border-input)`,
                  borderRadius: 'var(--radius-lg)',
                  outline: 'none',
                  transition: 'var(--transition-all)'
                }}
                onFocus={(e) => e.target.style.outline = 'none'}
                onBlur={(e) => e.target.style.outline = 'none'}
              />
              {uploading && (
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-info-text)',
                  marginTop: 'var(--spacing-2)'
                }}>Uploading images...</p>
              )}
            </div>

            {previewImages.length > 0 && (
              <div style={{
                marginTop: 'var(--spacing-3)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--gap-sm)'
              }}>
                {previewImages.map((preview, index) => (
                  <div key={index} style={{ position: 'relative' }} className="group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      style={{
                        width: '100%',
                        height: '6rem',
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
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap-md)' }}>
            <div>
              <label style={{
                display: 'block',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--spacing-2)'
              }}>Date Found</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 'var(--spacing-3)',
                  top: 'var(--spacing-3)',
                  color: 'var(--color-text-placeholder)'
                }}>
                  <FaCalendarAlt />
                </div>
                <input 
                  type="date" 
                  name="dateFound" 
                  value={formData.dateFound} 
                  onChange={handleChange} 
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-3)',
                    paddingLeft: 'var(--spacing-10)',
                    border: `var(--border-1) solid var(--color-border-input)`,
                    borderRadius: 'var(--radius-lg)',
                    outline: 'none',
                    transition: 'var(--transition-all)'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = 'var(--input-focus-ring)';
                    e.target.style.borderColor = 'var(--input-border-focus)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = 'var(--color-border-input)';
                  }}
                  required 
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--spacing-2)'
              }}>Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                style={{
                  width: '100%',
                  padding: 'var(--spacing-3)',
                  border: `var(--border-1) solid var(--color-border-input)`,
                  borderRadius: 'var(--radius-lg)',
                  outline: 'none',
                  transition: 'var(--transition-all)',
                  backgroundColor: 'var(--color-bg-primary)'
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = 'var(--input-focus-ring)';
                  e.target.style.borderColor = 'var(--input-border-focus)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = 'var(--color-border-input)';
                }}
                required
              >
                <option value="Active">Active</option>
                <option value="Claimed">Claimed</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingTop: 'var(--spacing-5)',
          marginTop: 'var(--spacing-6)',
          borderTop: `var(--border-1) solid var(--color-border-light)`,
          gap: 'var(--gap-sm)'
        }}>
          <button 
            type="button" 
            style={{
              padding: 'var(--spacing-2-5) var(--spacing-5)',
              backgroundColor: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-lg)',
              transition: 'var(--transition-all)',
              fontWeight: 'var(--font-weight-medium)',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-border-gray)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            style={{
              padding: 'var(--spacing-2-5) var(--spacing-5)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              transition: 'var(--transition-all)',
              boxShadow: 'var(--shadow-sm)',
              fontWeight: 'var(--font-weight-medium)',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--color-primary-hover)';
              e.target.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--color-primary)';
              e.target.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            Add Item
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddLostItemModal
