import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../../contexts/AuthProvider"
import { idCardApi } from "../../service"
import { queryKeys } from "../../lib/query"
import { Camera, Info } from "lucide-react"
import { Button } from "hzero"
import IDCardUploadModal from "../../components/IDCardUploadModal"
import { getMediaUrl } from "../../utils/mediaUtils"

const IDCardPage = () => {
  const { user } = useAuth()
  const [uploadedSides, setUploadedSides] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentSide, setCurrentSide] = useState(null)

  const { data, isLoading: loading, isError, error } = useQuery({
    queryKey: queryKeys.idCard.mine(user?._id),
    queryFn: async () => {
      try {
        return await idCardApi.getIDcard(user._id)
      } catch (err) {
        console.error("Error fetching ID card:", err)
        throw new Error("Failed to load ID card data")
      }
    },
    enabled: Boolean(user?._id),
  })

  const idCardData = { front: null, back: null, ...data, ...uploadedSides }

  const handleUploadClick = (side) => {
    setCurrentSide(side)
    setIsModalOpen(true)
  }

  const handleImageUpload = (side, imageUrl) => {
    setUploadedSides((prev) => ({
      ...prev,
      [side]: imageUrl,
    }))
  }

  const styles = {
    container: {
      maxWidth: "var(--container-xl)",
      margin: "0 auto",
      padding: "var(--spacing-6) var(--spacing-4)",
    },
    header: {
      marginBottom: "var(--spacing-6)",
    },
    title: {
      fontSize: "var(--font-size-3xl)",
      fontWeight: "var(--font-weight-bold)",
      color: "var(--color-text-secondary)",
      marginBottom: "var(--spacing-2)",
    },
    subtitle: {
      color: "var(--color-text-muted)",
      fontSize: "var(--font-size-base)",
    },
    errorBox: {
      backgroundColor: "var(--color-danger-bg-light)",
      borderLeft: "var(--border-4) solid var(--color-danger)",
      padding: "var(--spacing-4)",
      marginBottom: "var(--spacing-6)",
      borderRadius: "var(--radius-sm)",
    },
    errorContent: {
      display: "flex",
      alignItems: "center",
    },
    errorIcon: {
      color: "var(--color-danger)",
      marginRight: "var(--spacing-2)",
    },
    errorText: {
      color: "var(--color-danger-text)",
    },
    infoBox: {
      display: "flex",
      alignItems: "flex-start",
      backgroundColor: "var(--color-primary-bg-light)",
      padding: "var(--spacing-4)",
      borderRadius: "var(--radius-lg)",
      marginBottom: "var(--spacing-6)",
    },
    infoIcon: {
      flexShrink: 0,
      color: "var(--color-primary)",
      marginTop: "var(--spacing-0-5)",
      marginRight: "var(--spacing-2)",
    },
    infoContent: {
      fontSize: "var(--font-size-sm)",
      color: "var(--color-text-body)",
    },
    infoNote: {
      fontWeight: "var(--font-weight-medium)",
      marginTop: "var(--spacing-2)",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "16rem",
    },
    spinner: {
      height: "var(--spacing-12)",
      width: "var(--spacing-12)",
      borderRadius: "var(--radius-full)",
      borderTop: "var(--border-2) solid var(--color-primary)",
      borderBottom: "var(--border-2) solid var(--color-primary)",
      animation: "spin 1s linear infinite",
    },
    grid: {
      display: "grid",
      gap: "var(--spacing-6)",
    },
    card: {
      backgroundColor: "var(--color-bg-primary)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--spacing-6)",
      boxShadow: "var(--shadow-sm)",
      border: "var(--border-1) solid var(--color-border-light)",
      transition: "var(--transition-shadow)",
    },
    cardTitle: {
      fontSize: "var(--font-size-lg)",
      fontWeight: "var(--font-weight-semibold)",
      color: "var(--color-text-secondary)",
      marginBottom: "var(--spacing-4)",
    },
    imageContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    imageWrapper: {
      position: "relative",
      width: "100%",
      marginBottom: "var(--spacing-4)",
    },
    image: {
      width: "100%",
      height: "auto",
      borderRadius: "var(--radius-lg)",
      border: "var(--border-1) solid var(--color-border-primary)",
      boxShadow: "var(--shadow-sm)",
    },
    cameraButton: {
      position: "absolute",
      bottom: "var(--spacing-3)",
      right: "var(--spacing-3)",
      backgroundColor: "var(--button-primary-bg)",
      color: "var(--color-white)",
      padding: "var(--spacing-2)",
      borderRadius: "var(--radius-full)",
      boxShadow: "var(--shadow-md)",
      border: "none",
      cursor: "pointer",
      transition: "var(--transition-colors)",
    },
    cameraIcon: {
      width: "var(--icon-lg)",
      height: "var(--icon-lg)",
    },
    placeholder: {
      width: "100%",
      height: "12rem",
      backgroundColor: "var(--color-bg-secondary)",
      borderRadius: "var(--radius-lg)",
      marginBottom: "var(--spacing-4)",
      border: "var(--border-2) dashed var(--color-border-input)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    placeholderIcon: {
      width: "var(--icon-3xl)",
      height: "var(--icon-3xl)",
      color: "var(--color-text-placeholder)",
      marginBottom: "var(--spacing-2)",
    },
    placeholderText: {
      textAlign: "center",
      color: "var(--color-text-muted)",
    },
  }

  const renderIDCardSide = (side, title) => {
    const imageUrl = idCardData[side]

    return (
      <div style={styles.card} className="transition-shadow hover:shadow-[var(--shadow-md)]">
        <h3 style={styles.cardTitle}>{title}</h3>

        <div style={styles.imageContainer}>
          {imageUrl ? (
            <div style={styles.imageWrapper}>
              <img src={getMediaUrl(imageUrl)} alt={`ID Card ${title}`} style={styles.image} />
              <Button onClick={() => handleUploadClick(side)}
                variant="primary"
                size="sm"
                style={styles.cameraButton}
                aria-label="Change image"
              >
                <Camera style={styles.cameraIcon} />
              </Button>
            </div>
          ) : (
            <div style={styles.placeholder}>
              <Camera style={styles.placeholderIcon} />
              <p style={styles.placeholderText}>No image uploaded</p>
            </div>
          )}

          <Button onClick={() => handleUploadClick(side)} variant={imageUrl ? "secondary" : "primary"} fullWidth>
            {imageUrl ? "Change Image" : "Upload Image"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Student ID Card</h1>
        <p style={styles.subtitle}>Upload and manage your ID card images for verification purposes.</p>
      </div>

      {isError && (
        <div style={styles.errorBox}>
          <div style={styles.errorContent}>
            <Info style={styles.errorIcon} size={20} />
            <p style={styles.errorText}>{error?.message ?? "Failed to load ID card data"}</p>
          </div>
        </div>
      )}

      <div style={styles.infoBox}>
        <Info style={styles.infoIcon} size={20} />
        <div style={styles.infoContent}>
          <p>Please upload clear images of both sides of your student ID card. These images will be used for verification purposes by hostel staff and security personnel.</p>
          <p style={styles.infoNote}>Maximum file size: 1MB per image</p>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
        </div>
      ) : (
        <div style={styles.grid} className="id-card-grid">
          {renderIDCardSide("front", "ID Card Front")}
          {renderIDCardSide("back", "ID Card Back")}
        </div>
      )}

      {isModalOpen && <IDCardUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} side={currentSide} onImageUpload={(imageUrl) => handleImageUpload(currentSide, imageUrl)} userId={user._id} />}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .id-card-grid { display: grid; grid-template-columns: 1fr; gap: var(--spacing-6); }
        @media (min-width: 768px) { .id-card-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  )
}

export default IDCardPage

