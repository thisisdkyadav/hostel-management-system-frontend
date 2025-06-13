import React, { useState, useRef } from "react"
import Cropper from "react-cropper"
import "cropperjs/dist/cropper.css"
import Modal from "./common/Modal"
import { HiCheckCircle, HiUpload, HiX } from "react-icons/hi"
import { uploadApi } from "../services/uploadApi"
import { IDcardApi } from "../services/IDcardApi"

const IDCardUploadModal = ({ userId, isOpen, onClose, onImageUpload, side }) => {
  const [image, setImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const cropperRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const uploadImage = async () => {
    try {
      setUploading(true)

      const cropper = cropperRef.current?.cropper
      if (!cropper) return

      // Get cropped image as blob
      const croppedCanvas = cropper.getCroppedCanvas()
      const croppedImage = await new Promise((resolve) => {
        croppedCanvas.toBlob((blob) => resolve(blob), "image/jpeg")
      })

      const formData = new FormData()
      formData.append("image", croppedImage, `idcard-${side}.jpg`)

      // First upload the image
      const uploadResponse = await uploadApi.uploadIDcard(formData, side)
      const imageUrl = uploadResponse.url

      // Get current ID card data to preserve the other side
      const currentData = await IDcardApi.getIDcard(userId)

      // Then update the ID card record with the new image URL
      // while preserving the other side
      await IDcardApi.updateIDcard(userId, side === "front" ? imageUrl : currentData.front, side === "back" ? imageUrl : currentData.back)

      setUploaded(true)
      onImageUpload(imageUrl)

      setTimeout(() => {
        handleReset()
        onClose()
      }, 1500)
    } catch (error) {
      console.error(`Error uploading ID card ${side}:`, error)
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setUploaded(false)
  }

  const sideTitle = side === "front" ? "Front Side" : "Back Side"

  return (
    <Modal title={`Upload ID Card - ${sideTitle}`} onClose={onClose} width={600}>
      <div className="space-y-5">
        {!image ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <HiUpload className="w-8 h-8 text-[#1360AB]" />
              </div>
              <div>
                <p className="text-gray-700 mb-2">Drag and drop an image or click to browse</p>
                <p className="text-gray-500 text-sm">For best results, use a clear, well-lit image of your ID card</p>
              </div>
              <label className="inline-block">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                <span className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] cursor-pointer inline-block transition-colors">Select Image</span>
              </label>
            </div>
          </div>
        ) : (
          <>
            {uploaded ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <HiCheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Image Uploaded Successfully!</h3>
                <p className="text-gray-600">Your ID card image has been updated.</p>
              </div>
            ) : (
              <>
                <div className="relative h-80 w-full bg-gray-100 rounded-lg overflow-hidden">
                  <Cropper ref={cropperRef} src={image} style={{ height: 320, width: "100%" }} guides={true} viewMode={1} minCropBoxHeight={10} minCropBoxWidth={10} background={false} responsive={true} autoCropArea={1} checkOrientation={false} />
                </div>

                <div className="flex flex-col sm:flex-row justify-end pt-4 space-y-3 sm:space-y-0 sm:space-x-3">
                  <button type="button" onClick={handleReset} className="order-last sm:order-first flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium">
                    <HiX className="mr-1.5" /> Reset
                  </button>
                  <button type="button" onClick={uploadImage} disabled={uploading} className="flex items-center justify-center px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow font-medium disabled:bg-blue-300 disabled:cursor-not-allowed">
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <HiUpload className="mr-1.5" /> Upload Image
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

export default IDCardUploadModal
