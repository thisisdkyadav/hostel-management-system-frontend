import React, { useState, useEffect } from "react"
import Modal from "../../common/Modal"
import { getMediaUrl } from "../../../utils/mediaUtils"
import { FaDownload, FaFilePdf, FaImage } from "react-icons/fa"

const CertificateViewerModal = ({ isOpen, onClose, certificateUrl }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fileType, setFileType] = useState(null)

  useEffect(() => {
    if (certificateUrl && isOpen) {
      setIsLoading(true)
      setError(false)

      // Determine file type from URL
      const urlLower = certificateUrl.toLowerCase()
      if (urlLower.endsWith(".pdf")) {
        setFileType("pdf")
      } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        setFileType("image")
      } else {
        setFileType("unknown")
      }

      setIsLoading(false)
    }
  }, [certificateUrl, isOpen])

  const handleDownload = () => {
    const fullUrl = getMediaUrl(certificateUrl)
    const link = document.createElement("a")
    link.href = fullUrl
    link.download = certificateUrl.split("/").pop() || "certificate"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen || !certificateUrl) return null

  return (
    <Modal
      title={
        <div className="flex items-center justify-between w-full">
          <span>Certificate Viewer</span>
          <button onClick={handleDownload} className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm">
            <FaDownload />
            <span>Download</span>
          </button>
        </div>
      }
      onClose={onClose}
      width={900}
    >
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-t-[#1360AB] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">Failed to load certificate</p>
            <button onClick={handleDownload} className="text-blue-600 hover:underline text-sm">
              Try downloading instead
            </button>
          </div>
        ) : fileType === "pdf" ? (
          <div className="bg-gray-50 rounded-lg overflow-hidden" style={{ height: "70vh" }}>
            <iframe src={getMediaUrl(certificateUrl)} className="w-full h-full" title="Certificate PDF" onError={() => setError(true)} />
          </div>
        ) : fileType === "image" ? (
          <div className="flex justify-center bg-gray-50 rounded-lg p-4" style={{ maxHeight: "70vh", overflow: "auto" }}>
            <img src={getMediaUrl(certificateUrl)} alt="Certificate" className="max-w-full h-auto rounded-lg shadow-lg" onError={() => setError(true)} />
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">Unable to preview this file type</p>
            <button onClick={handleDownload} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Download File
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default CertificateViewerModal
