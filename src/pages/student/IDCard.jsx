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
        console.log(user._id)
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
      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

        <div className="flex flex-col items-center justify-center">
          {imageUrl ? (
            <div className="relative mb-4 w-full">
              <img src={getMediaUrl(imageUrl)} alt={`ID Card ${title}`} className="w-full h-auto rounded-lg border border-gray-200 shadow-sm" />
              <button onClick={() => handleUploadClick(side)} className="absolute bottom-3 right-3 bg-[#1360AB] text-white p-2 rounded-full hover:bg-[#0F4C81] transition-colors shadow-md">
                <HiCamera className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center mb-4 border-2 border-dashed border-gray-300">
              <HiCamera className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-gray-500 text-center">No image uploaded</p>
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
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Student ID Card</h1>
        <p className="text-gray-600">Upload and manage your ID card images for verification purposes.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex items-center">
            <HiInformationCircle className="text-red-500 mr-2" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
        <HiInformationCircle className="text-[#1360AB] mt-0.5 mr-2 flex-shrink-0" size={20} />
        <p className="text-sm text-gray-700">Please upload clear images of both sides of your student ID card. These images will be used for verification purposes by hostel staff and security personnel.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1360AB]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderIDCardSide("front", "ID Card Front")}
          {renderIDCardSide("back", "ID Card Back")}
        </div>
      )}

      {isModalOpen && <IDCardUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} side={currentSide} onImageUpload={(imageUrl) => handleImageUpload(currentSide, imageUrl)} userId={user._id} />}
    </div>
  )
}

export default IDCard
