import React, { useState, useCallback, use } from "react"
import Cropper from "react-easy-crop"
import Modal from "./Modal"
import Button from "./Button"
import FileInput from "./ui/FileInput"
import { HiCheckCircle, HiUpload, HiX, HiExclamation } from "react-icons/hi"
import { uploadApi } from "../../service"

const ImageUploadModal = ({ userId, isOpen, onClose, onImageUpload }) => {
  const [image, setImage] = useState(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState("")
  const MAX_FILE_SIZE = 500 * 1024 // 500KB in bytes

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File size exceeds 500KB limit. Your file is ${(file.size / 1024).toFixed(2)}KB.`)
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

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener("load", () => resolve(image))
      image.addEventListener("error", (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, "image/jpeg")
    })
  }

  const uploadImage = async () => {
    if (!croppedAreaPixels) return

    try {
      setUploading(true)

      const croppedImage = await getCroppedImg(image, croppedAreaPixels)

      // Check if cropped image exceeds size limit
      if (croppedImage.size > MAX_FILE_SIZE) {
        setError(`Cropped image exceeds 500KB limit. Try reducing zoom or using a smaller image.`)
        setUploading(false)
        return
      }

      const formData = new FormData()
      formData.append("image", croppedImage, "profile.jpg")

      const data = await uploadApi.uploadProfileImage(formData, userId)

      const imageUrl = data.url

      setUploaded(true)

      onImageUpload(imageUrl)
      handleReset()
      onClose()
    } catch (error) {
      console.error("Error uploading image:", error)
      setError("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setCroppedAreaPixels(null)
    setZoom(1)
    setCrop({ x: 0, y: 0 })
    setUploaded(false)
    setError("")
  }

  return (
    <Modal title="Upload Profile Picture" onClose={onClose} width={600}>
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
                <p className="text-[var(--color-text-muted)] text-sm">Recommended: Square image of at least 300x300 pixels</p>
                <p className="text-[var(--color-text-muted)] text-sm font-medium">Maximum file size: 500KB</p>
              </div>
              <label className="inline-block">
                <FileInput accept="image/*" onChange={handleFileChange} hidden />
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
                <p className="text-[var(--color-text-muted)]">Your profile picture has been updated.</p>
              </div>
            ) : (
              <>
                <div className="relative h-80 w-full bg-[var(--color-bg-muted)] rounded-lg overflow-hidden">
                  <Cropper image={image} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} cropShape="round" showGrid={false} />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-body)] mb-1">Zoom: {zoom.toFixed(1)}x</label>
                    <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-[var(--color-bg-muted)] rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end pt-4 space-y-3 sm:space-y-0 sm:space-x-3">
                    <Button type="button" onClick={handleReset} variant="secondary" size="medium" icon={<HiX />} className="order-last sm:order-first">
                      Reset
                    </Button>
                    <Button type="button" onClick={uploadImage} variant="primary" size="medium" icon={<HiUpload />} isLoading={uploading} disabled={uploading}>
                      {uploading ? "Uploading..." : "Upload Image"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

export default ImageUploadModal
