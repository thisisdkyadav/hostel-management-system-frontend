import React, { useState, useRef } from "react"
import Cropper from "react-cropper"
import "cropperjs/dist/cropper.css"
import Modal from "./common/Modal"
import Button from "./common/Button"
import { HiCheckCircle, HiUpload, HiX, HiExclamation } from "react-icons/hi"
import { uploadApi } from "../services/uploadApi"
import { IDcardApi } from "../services/IDcardApi"

const IDCardUploadModal = ({ userId, isOpen, onClose, onImageUpload, side }) => {
  const [image, setImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState("")
  const cropperRef = useRef(null)
  const MAX_FILE_SIZE = 1024 * 1024 // 1MB in bytes

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File size exceeds 1MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`)
        return
      }

      setError("") // Clear any previous errors
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result)
      }
      reader.readAsDataURL(file)
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

      // Check if cropped image exceeds size limit
      if (croppedImage.size > MAX_FILE_SIZE) {
        setError(`Cropped image exceeds 1MB limit. Try reducing quality or using a smaller image.`)
        setUploading(false)
        return
      }

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
      setError("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setUploaded(false)
    setError("")
  }

  const sideTitle = side === "front" ? "Front Side" : "Back Side"

  return (
    <Modal title={`Upload ID Card - ${sideTitle}`} onClose={onClose} width={600}>
      <div className="space-y-5">
        {error && (
          <div className="bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-light)] text-[var(--color-danger)] px-4 py-3 rounded-lg flex items-start">
            <HiExclamation className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!image ? (
          <div className="border-2 border-dashed border-[var(--color-border-primary)] rounded-lg p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-[var(--color-primary-bg)] rounded-full flex items-center justify-center">
                <HiUpload className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-[var(--color-text-body)] mb-2">Drag and drop an image or click to browse</p>
                <p className="text-[var(--color-text-muted)] text-sm">For best results, use a clear, well-lit image of your ID card</p>
                <p className="text-[var(--color-text-muted)] text-sm font-medium">Maximum file size: 1MB</p>
              </div>
              <label className="inline-block">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                <span className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] cursor-pointer inline-block transition-colors">Select Image</span>
              </label>
            </div>
          </div>
        ) : (
          <>
            {uploaded ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-[var(--color-success-bg-light)] rounded-full flex items-center justify-center mb-4">
                  <HiCheckCircle className="w-10 h-10 text-[var(--color-success)]" />
                </div>
                <h3 className="text-lg font-medium text-[var(--color-text-secondary)] mb-2">Image Uploaded Successfully!</h3>
                <p className="text-[var(--color-text-muted)]">Your ID card image has been updated.</p>
              </div>
            ) : (
              <>
                <div className="relative h-80 w-full bg-[var(--color-bg-muted)] rounded-lg overflow-hidden">
                  <Cropper ref={cropperRef} src={image} style={{ height: 320, width: "100%" }} guides={true} viewMode={1} minCropBoxHeight={10} minCropBoxWidth={10} background={false} responsive={true} autoCropArea={1} checkOrientation={false} />
                </div>

                <div className="flex flex-col sm:flex-row justify-end pt-4 space-y-3 sm:space-y-0 sm:space-x-3">
                  <Button type="button" onClick={handleReset} variant="secondary" size="medium" icon={<HiX />} className="order-last sm:order-first">
                    Reset
                  </Button>
                  <Button type="button" onClick={uploadImage} disabled={uploading} variant="primary" size="medium" icon={<HiUpload />} isLoading={uploading}>
                    {uploading ? "Uploading..." : "Upload Image"}
                  </Button>
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
