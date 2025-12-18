import React, { useState } from "react"
import { FaCalendarAlt, FaInfoCircle, FaImage, FaTimes } from "react-icons/fa"
import Modal from "../common/Modal"
import { formatDate } from "../../utils/formatters"
import { getMediaUrl } from "../../utils/mediaUtils"

const LostAndFoundDetailModal = ({ selectedItem, setShowDetailModal }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  if (!selectedItem) return null

  // Helper function to get status colors using theme variables
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

  const openImageViewer = (index) => {
    setSelectedImageIndex(index)
  }

  const closeImageViewer = () => {
    setSelectedImageIndex(null)
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % selectedItem.images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + selectedItem.images.length) % selectedItem.images.length)
  }

  return (
    <>
      <Modal title="Found Item Details" onClose={() => setShowDetailModal(false)} width={700}>
        <div style={{ position: 'relative' }}>
          {/* Status Badge - Positioned at top right */}
          <div style={{ position: 'absolute', top: 0, right: 0 }}>
            <span style={{
              padding: 'var(--spacing-4) var(--spacing-4)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-sm)',
              ...getStatusStyle(selectedItem.status)
            }}>{selectedItem.status}</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 'var(--spacing-6)', paddingTop: 'var(--spacing-2)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-1)'
            }}>{selectedItem.itemName}</h2>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)' }}>
              <FaCalendarAlt style={{ marginRight: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }} />
              <span>{formatDate(selectedItem.dateFound)}</span>
            </div>
          </div>

          {/* Images Section */}
          {selectedItem.images && selectedItem.images.length > 0 && (
            <div style={{ marginBottom: 'var(--spacing-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)', color: 'var(--color-primary)' }}>
                <FaImage style={{ marginRight: 'var(--spacing-2)' }} />
                <h3 style={{ fontWeight: 'var(--font-weight-semibold)' }}>Item Images</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-sm)' }}>
                {selectedItem.images.map((imageUrl, index) => (
                  <img 
                    key={index} 
                    src={getMediaUrl(imageUrl)} 
                    alt={`${selectedItem.itemName} ${index + 1}`} 
                    onClick={() => openImageViewer(index)} 
                    style={{
                      width: '100%',
                      height: '8rem',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-lg)',
                      border: `var(--border-1) solid var(--color-border-gray)`,
                      cursor: 'pointer',
                      transition: 'var(--transition-opacity)'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{
            backgroundColor: 'var(--table-header-bg)',
            padding: 'var(--spacing-6)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--spacing-6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)', color: 'var(--color-primary)' }}>
              <FaInfoCircle style={{ marginRight: 'var(--spacing-2)' }} />
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)' }}>Description</h3>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>{selectedItem.description}</p>
          </div>
        </div>
      </Modal>

      {/* Image Viewer Modal */}
      {selectedImageIndex !== null && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} 
          onClick={closeImageViewer}
        >
          <button 
            onClick={closeImageViewer} 
            style={{
              position: 'absolute',
              top: 'var(--spacing-4)',
              right: 'var(--spacing-4)',
              color: 'var(--color-white)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--color-border-gray)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--color-white)'}
          >
            <FaTimes size={30} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            style={{
              position: 'absolute',
              left: 'var(--spacing-4)',
              color: 'var(--color-white)',
              fontSize: 'var(--font-size-6xl)',
              fontWeight: 'var(--font-weight-bold)',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--color-border-gray)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--color-white)'}
          >
            ‹
          </button>

          <div style={{ maxWidth: '64rem', maxHeight: '100vh', padding: 'var(--spacing-4)' }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={getMediaUrl(selectedItem.images[selectedImageIndex])} 
              alt={`${selectedItem.itemName} ${selectedImageIndex + 1}`} 
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-lg)'
              }} 
            />
            <p style={{
              color: 'var(--color-white)',
              textAlign: 'center',
              marginTop: 'var(--spacing-4)'
            }}>
              Image {selectedImageIndex + 1} of {selectedItem.images.length}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            style={{
              position: 'absolute',
              right: 'var(--spacing-4)',
              color: 'var(--color-white)',
              fontSize: 'var(--font-size-6xl)',
              fontWeight: 'var(--font-weight-bold)',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--color-border-gray)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--color-white)'}
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}

export default LostAndFoundDetailModal
