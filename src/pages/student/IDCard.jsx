import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { IDcardApi } from "../../services/IDcardApi"
import { HiCamera, HiInformationCircle } from "react-icons/hi"
import Button from "../../components/common/Button"
import IDCardUploadModal from "../../components/IDCardUploadModal"
import { getMediaUrl } from "../../utils/mediaUtils"
const IDCard = () => {
  const { user } = useAuth()
  const [idCardData, setIdCardData] = useState({ front: null, back: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentSide, setCurrentSide] = useState(null)

  useEffect(() => {
    const fetchIDCard = async () => {
      try {
        setLoading(true)
        const data = await IDcardApi.getIDcard(user._id)
        setIdCardData(data)
      } catch (err) {
        console.error("Error fetching ID card:", err)
        setError("Failed to load ID card data")
      } finally {
        setLoading(false)
      }
    }

    if (user?._id) {
      fetchIDCard()
    }
  }, [user])

  const handleUploadClick = (side) => {
    setCurrentSide(side)
    setIsModalOpen(true)
  }

  const handleImageUpload = (side, imageUrl) => {
    setIdCardData((prev) => ({
      ...prev,
      [side]: imageUrl,
    }))
  }

  const renderIDCardSide = (side, title) => {
    const imageUrl = idCardData[side]

    return (
      <div className="transition-all" style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-light)', transitionDuration: 'var(--transition-slow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
        <h3 className="font-semibold" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>{title}</h3>

        <div className="flex flex-col items-center justify-center">
          {imageUrl ? (
            <div className="relative w-full" style={{ marginBottom: 'var(--spacing-4)' }}>
              <img src={getMediaUrl(imageUrl)} alt={`ID Card ${title}`} className="w-full h-auto" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-primary)', boxShadow: 'var(--shadow-sm)' }} />
              <button onClick={() => handleUploadClick(side)} className="absolute rounded-full transition-colors" style={{ bottom: 'var(--spacing-3)', right: 'var(--spacing-3)', backgroundColor: 'var(--button-primary-bg)', color: 'var(--color-white)', padding: 'var(--spacing-2)', boxShadow: 'var(--shadow-md)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--button-primary-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--button-primary-bg)'}>
                <HiCamera style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)' }} />
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center" style={{ height: '12rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-4)', border: '2px dashed var(--color-border-input)' }}>
              <HiCamera style={{ width: 'var(--icon-3xl)', height: 'var(--icon-3xl)', color: 'var(--color-text-placeholder)', marginBottom: 'var(--spacing-2)' }} />
              <p className="text-center" style={{ color: 'var(--color-text-muted)' }}>No image uploaded</p>
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8" style={{ paddingTop: 'var(--spacing-6)', paddingBottom: 'var(--spacing-6)' }}>
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <h1 className="font-bold" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>Student ID Card</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Upload and manage your ID card images for verification purposes.</p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg-light)', borderLeft: '4px solid var(--color-danger)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-sm)' }}>
          <div className="flex items-center">
            <HiInformationCircle style={{ color: 'var(--color-danger)', marginRight: 'var(--spacing-2)' }} size={20} />
            <p style={{ color: 'var(--color-danger-text)' }}>{error}</p>
          </div>
        </div>
      )}

      <div className="flex items-start" style={{ backgroundColor: 'var(--color-primary-bg-light)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-6)' }}>
        <HiInformationCircle className="flex-shrink-0" style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-0-5)', marginRight: 'var(--spacing-2)' }} size={20} />
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)' }}>
          <p>Please upload clear images of both sides of your student ID card. These images will be used for verification purposes by hostel staff and security personnel.</p>
          <p className="font-medium" style={{ marginTop: 'var(--spacing-2)' }}>Maximum file size: 1MB per image</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center" style={{ height: '16rem' }}>
          <div className="animate-spin rounded-full" style={{ height: 'var(--spacing-12)', width: 'var(--spacing-12)', borderTop: '2px solid var(--color-primary)', borderBottom: '2px solid var(--color-primary)' }}></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--spacing-6)' }}>
          {renderIDCardSide("front", "ID Card Front")}
          {renderIDCardSide("back", "ID Card Back")}
        </div>
      )}

      {isModalOpen && <IDCardUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} side={currentSide} onImageUpload={(imageUrl) => handleImageUpload(currentSide, imageUrl)} userId={user._id} />}
    </div>
  )
}

export default IDCard
