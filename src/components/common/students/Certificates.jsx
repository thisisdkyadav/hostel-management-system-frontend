import React, { useEffect, useState } from "react"
import { FaPlus, FaFileAlt, FaFilePdf, FaImage } from "react-icons/fa"
import { getCertificatesByStudent, deleteCertificate } from "../../../services/certificatesApi"
import { useAuth } from "../../../contexts/AuthProvider"
import Button from "../Button"
import CertificateModal from "./CertificateModal"
import CertificateViewerModal from "./CertificateViewerModal"

const Certificates = ({ userId }) => {
  const { canAccess } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentCertificate, setCurrentCertificate] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewerModalOpen, setViewerModalOpen] = useState(false)
  const [viewerUrl, setViewerUrl] = useState(null)

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const res = await getCertificatesByStudent(userId)
      setCertificates(res.certificates)
    } catch (err) {
      setError(err)
      console.error("Failed to fetch certificates:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchCertificates()
    }
  }, [userId])

  const handleAddClick = () => {
    setCurrentCertificate(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEditClick = (certificate) => {
    setCurrentCertificate(certificate)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleViewClick = (certificateUrl) => {
    setViewerUrl(certificateUrl)
    setViewerModalOpen(true)
  }

  const handleDeleteClick = async (certificateId) => {
    try {
      await deleteCertificate(certificateId)
      fetchCertificates() // Refresh the list
    } catch (error) {
      console.error("Error deleting certificate:", error)
      alert("Failed to delete certificate")
    }
  }

  const handleModalSubmit = async (formData) => {
    try {
      await formData.onSubmit()
      fetchCertificates() // Refresh the list
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error saving certificate:", error)
      throw error
    }
  }

  const getFileIcon = (url) => {
    if (!url) return <FaFileAlt />
    const urlLower = url.toLowerCase()
    if (urlLower.endsWith(".pdf")) {
      return <FaFilePdf className="text-red-500" />
    } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return <FaImage className="text-blue-500" />
    }
    return <FaFileAlt />
  }

  if (loading)
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-t-[#1360AB] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    )
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error: {error.message}</div>

  return (
    <div className="px-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg text-gray-700 font-semibold">Certificates Issued</h3>
        {canAccess("students_info", "create") && (
          <Button variant="primary" size="small" icon={<FaPlus />} onClick={handleAddClick}>
            Add Certificate
          </Button>
        )}
      </div>

      {certificates.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-600">No certificates found.</p>
          {canAccess("students_info", "create") && (
            <Button variant="secondary" size="small" className="mt-3" onClick={handleAddClick}>
              Add Certificate
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {certificates.map((certificate) => (
            <div key={certificate._id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-start flex-1">
                  <div className="text-2xl mr-3 mt-1">{getFileIcon(certificate.certificateUrl)}</div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-md font-semibold text-gray-800">{certificate.certificateType}</h4>
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{new Date(certificate.issueDate).toLocaleDateString()}</span>
                    </div>
                    {certificate.remarks && (
                      <p className="text-sm text-gray-700 mt-2">
                        <span className="font-semibold text-gray-800">Remarks:</span> {certificate.remarks}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleViewClick(certificate.certificateUrl)} className="px-3 py-1 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                    View
                  </button>
                  {canAccess("students_info", "edit") && (
                    <button onClick={() => handleEditClick(certificate)} className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && <CertificateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} initialData={currentCertificate} isEditing={isEditing} onDelete={isEditing ? handleDeleteClick : null} studentId={userId} />}

      {viewerModalOpen && <CertificateViewerModal isOpen={viewerModalOpen} onClose={() => setViewerModalOpen(false)} certificateUrl={viewerUrl} />}
    </div>
  )
}

export default Certificates
