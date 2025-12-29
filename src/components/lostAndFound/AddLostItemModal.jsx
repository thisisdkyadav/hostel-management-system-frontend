import React, { useState } from "react"
import { lostAndFoundApi } from "../../services/apiService"
import { uploadApi } from "../../services/uploadApi"
import Modal from "../common/Modal"
import Button from "../common/Button"
import Input from "../common/ui/Input"
import Select from "../common/ui/Select"
import FileInput from "../common/ui/FileInput"
import { FaCalendarAlt, FaClipboardList, FaBoxOpen, FaImage, FaTimes, FaPlus } from "react-icons/fa"

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
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Item Name</label>
            <Input type="text" name="itemName" value={formData.itemName} onChange={handleChange} icon={<FaClipboardList />} placeholder="Enter item name" required />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" style={{ width: '100%', padding: 'var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', resize: 'none' }} placeholder="Describe the item, condition, where it was found, etc." required></textarea>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaImage style={{ marginRight: 'var(--spacing-2)' }} />
                Item Images (Optional)
              </div>
            </label>
            <div style={{ position: 'relative' }}>
              <FileInput accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
              {uploading && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-info-text)', marginTop: 'var(--spacing-2)' }}>Uploading images...</p>
              )}
            </div>

            {previewImages.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-3)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-sm)' }}>
                {previewImages.map((preview, index) => (
                  <div key={index} style={{ position: 'relative' }} className="group">
                    <img src={preview} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '6rem', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: `var(--border-1) solid var(--color-border-gray)` }} />
                    <Button type="button" onClick={() => removeImage(index)}
                      variant="danger"
                      size="small"
                      icon={<FaTimes size={12} />}
                      aria-label="Remove image"
                      className="group-hover:opacity-100"
                      style={{
                        position: 'absolute',
                        top: 'var(--spacing-1)',
                        right: 'var(--spacing-1)',
                        opacity: 0,
                        padding: 'var(--spacing-1)'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap-md)' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Date Found</label>
              <Input type="date" name="dateFound" value={formData.dateFound} onChange={handleChange} icon={<FaCalendarAlt />} required />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Status</label>
              <Select name="status" value={formData.status} onChange={handleChange} options={[
                { value: "Active", label: "Active" },
                { value: "Claimed", label: "Claimed" }
              ]} required />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: `var(--border-1) solid var(--color-border-light)`, gap: 'var(--gap-sm)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium" icon={<FaPlus />}>
            Add Item
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddLostItemModal
