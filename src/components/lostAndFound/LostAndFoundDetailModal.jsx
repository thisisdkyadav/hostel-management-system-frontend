import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, ImageIcon, Info, X } from "lucide-react"
import { Badge, Button, DetailSection, Grid, HStack, Heading, Modal, Text, VStack } from "hzero"
import { formatDate } from "../../utils/formatters"
import { getMediaUrl } from "../../utils/mediaUtils"

// Same three cases the hand-rolled pill covered, now on Badge's palette.
const statusVariant = (status) => {
  switch (status) {
    case "Active":
      return "success"
    case "Claimed":
      return "info"
    default:
      return "default"
  }
}

const LostAndFoundDetailModal = ({ selectedItem, setShowDetailModal }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  if (!selectedItem) return null

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
      <Modal title="Found item details" onClose={() => setShowDetailModal(false)} width={700}>
        <VStack gap="large">
          <HStack justify="between" align="start" gap={3}>
            <div style={{ minWidth: 0 }}>
              <Heading as="h2" size="2xl" weight="bold" color="primary">{selectedItem.itemName}</Heading>
              <HStack align="center" gap={2} size="sm" color="muted">
                <Calendar size={14} />
                <Text as="span">{formatDate(selectedItem.dateFound)}</Text>
              </HStack>
            </div>
            <Badge variant={statusVariant(selectedItem.status)} size="medium">{selectedItem.status}</Badge>
          </HStack>

          {selectedItem.images && selectedItem.images.length > 0 && (
            <DetailSection title="Item images" icon={ImageIcon} plain>
              <Grid cols={3} gap={3}>
                {selectedItem.images.map((imageUrl, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => openImageViewer(index)}
                    aria-label={`Open image ${index + 1} of ${selectedItem.images.length}`}
                    style={{ padding: 0, border: "none", background: "none", cursor: "pointer", display: "block" }}
                  >
                    <img
                      src={getMediaUrl(imageUrl)}
                      alt={`${selectedItem.itemName} ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "8rem",
                        objectFit: "cover",
                        borderRadius: "var(--radius-lg)",
                        border: "var(--border-1) solid var(--color-border-primary)",
                      }}
                    />
                  </button>
                ))}
              </Grid>
            </DetailSection>
          )}

          <DetailSection title="Description" icon={Info}>
            <Text size="sm" color="body" leading="var(--line-height-relaxed)">{selectedItem.description}</Text>
          </DetailSection>
        </VStack>
      </Modal>

      {/* Full-bleed image viewer. Bespoke on purpose — a lightbox is not a
          panel of values, so it stays a plain overlay above the modal. */}
      {selectedImageIndex !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "var(--color-bg-modal-overlay)",
            zIndex: "calc(var(--modal-z) + 10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={closeImageViewer}
        >
          <Button onClick={closeImageViewer}
            variant="ghost"
            size="sm"
            aria-label="Close image viewer"
            style={{ position: "absolute", top: "var(--spacing-4)", right: "var(--spacing-4)", color: "var(--color-on-accent)", zIndex: 10 }}
          >
            <X size={28} />
          </Button>

          <Button onClick={(e) => {
            e.stopPropagation()
            prevImage()
          }}
            variant="ghost"
            size="lg"
            aria-label="Previous image"
            style={{ position: "absolute", left: "var(--spacing-4)", color: "var(--color-on-accent)" }}
          >
            <ChevronLeft size={40} />
          </Button>

          <div style={{ maxWidth: "64rem", maxHeight: "100vh", padding: "var(--spacing-4)" }} onClick={(e) => e.stopPropagation()}>
            <img src={getMediaUrl(selectedItem.images[selectedImageIndex])} alt={`${selectedItem.itemName} ${selectedImageIndex + 1}`} style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: "var(--radius-lg)" }} />
            <Text color="var(--color-on-accent)" align="center" style={{ marginTop: "var(--spacing-4)" }}>
              Image {selectedImageIndex + 1} of {selectedItem.images.length}
            </Text>
          </div>

          <Button onClick={(e) => {
            e.stopPropagation()
            nextImage()
          }}
            variant="ghost"
            size="lg"
            aria-label="Next image"
            style={{ position: "absolute", right: "var(--spacing-4)", color: "var(--color-on-accent)" }}
          >
            <ChevronRight size={40} />
          </Button>
        </div>
      )}
    </>
  )
}

export default LostAndFoundDetailModal
