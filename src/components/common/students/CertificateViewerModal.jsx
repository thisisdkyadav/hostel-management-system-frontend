import React, { useState, useEffect } from "react"
import Modal from "../../common/Modal"
import { getMediaUrl } from "../../../utils/mediaUtils"
import { FaFileAlt, FaExternalLinkAlt, FaDownload, FaSpinner } from "react-icons/fa"

const CertificateViewerModal = ({ isOpen, onClose, certificateUrl }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fileType, setFileType] = useState(null)

  useEffect(() => {
    if (certificateUrl && isOpen) {
      setIsLoading(true)
      setError(false)

      // Determine file type from URL or extension
      const url = certificateUrl.toLowerCase()
      if (url.includes(".pdf") || url.includes("pdf")) {
        setFileType("pdf")
      } else if (url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png") || url.includes(".gif") || url.includes(".webp")) {
        setFileType("image")
      } else {
        setFileType("pdf") // Default to PDF
      }
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

  const fullUrl = getMediaUrl(certificateUrl)

  return (
    <Modal title="Certificate Document" onClose={onClose} width={900} fullHeight={true}>
      <div className="space-y-4 h-full">
        {/* Header with action buttons */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaFileAlt className="w-5 h-5 text-[#1360AB]" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Certificate Document</h3>
              <p className="text-sm text-gray-600">Issued Certificate</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleDownload} className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              <FaDownload className="w-4 h-4" />
              <span>Download</span>
            </button>
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <FaExternalLinkAlt className="w-4 h-4" />
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 bg-white border-2 border-gray-200 rounded-lg overflow-hidden" style={{ height: "calc(100% - 100px)" }}>
          {fileType === "image" ? (
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
              <img src={fullUrl} alt="Certificate Document" className="w-full h-auto object-contain" onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError(true)
                  setIsLoading(false)
                }}
              />
            </div>
          ) : (
            // For PDF files, we'll use object tag with fallback
            <div className="w-full h-full relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FaSpinner className="w-5 h-5 text-[#1360AB] animate-spin" />
                    <span className="text-gray-600">Loading document...</span>
                  </div>
                </div>
              )}

              <object data={fullUrl} type="application/pdf" className="w-full h-full" onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError(true)
                  setIsLoading(false)
                }}
              >
                {/* Fallback for when PDF object fails */}
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <FaFileAlt className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Cannot display PDF in browser</h3>
                  <p className="text-gray-500 mb-6">Your browser doesn't support embedded PDFs. Please download the file or open it in a new tab.</p>
                  <div className="flex space-x-3">
                    <button onClick={handleDownload} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <FaDownload className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                    <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <FaExternalLinkAlt className="w-4 h-4" />
                      <span>Open in New Tab</span>
                    </a>
                  </div>
                </div>
              </object>
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium mb-2">Unable to load document</p>
              <p className="text-red-600 text-sm mb-4">There was an error loading the document. Please try downloading it instead.</p>
              <button onClick={handleDownload} className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <FaDownload className="w-4 h-4" />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default CertificateViewerModal
