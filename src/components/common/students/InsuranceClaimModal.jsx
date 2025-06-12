import React, { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaHospital, FaMedkit, FaCalendarAlt, FaDollarSign, FaFileAlt, FaSave, FaCalendarCheck } from "react-icons/fa"
import Modal from "../Modal"
import { useAuth } from "../../../contexts/AuthProvider"

const InsuranceClaimModal = ({ claim, onClose, onSave, onDelete, insuranceProviders, isNew = false }) => {
  const { canAccess } = useAuth()
  const [isEditing, setIsEditing] = useState(isNew)
  const [formData, setFormData] = useState({
    insuranceProvider: "",
    amount: "",
    hospitalName: "",
    description: "",
  })
  const [selectedProvider, setSelectedProvider] = useState(null)

  useEffect(() => {
    if (claim) {
      setFormData({
        insuranceProvider: claim.insuranceProvider?._id || claim.insuranceProvider || "",
        amount: claim.amount || "",
        hospitalName: claim.hospitalName || "",
        description: claim.description || "",
      })

      // Find the selected provider
      if (claim.insuranceProvider) {
        const providerId = claim.insuranceProvider?._id || claim.insuranceProvider
        const provider = insuranceProviders.find((p) => p._id === providerId)
        setSelectedProvider(provider || null)
      }
    }
  }, [claim, insuranceProviders])

  useEffect(() => {
    // Update selected provider when form data changes
    if (formData.insuranceProvider) {
      const provider = insuranceProviders.find((p) => p._id === formData.insuranceProvider)
      setSelectedProvider(provider || null)
    } else {
      setSelectedProvider(null)
    }
  }, [formData.insuranceProvider, insuranceProviders])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this insurance claim?")) {
      onDelete(claim._id)
      onClose()
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(claim?._id, formData)
    onClose()
  }

  const getProviderName = (providerId) => {
    const provider = insuranceProviders.find((p) => p._id === providerId)
    return provider ? provider.name : "Unknown Provider"
  }

  const renderViewMode = () => (
    <>
      <div className="bg-blue-50 p-5 rounded-xl mb-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaMedkit className="text-[#1360AB] mr-2" />
            Claim Information
          </h3>
          <div className="text-sm text-gray-500">
            <span className="font-medium">Submitted:</span> {formatDate(claim.createdAt)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <FaHospital className="text-[#1360AB] mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Hospital</p>
              <p className="font-medium">{claim.hospitalName}</p>
            </div>
          </div>

          <div className="flex items-start">
            <FaDollarSign className="text-[#1360AB] mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Claim Amount</p>
              <p className="font-medium">{formatCurrency(claim.amount)}</p>
            </div>
          </div>

          <div className="flex items-start">
            <FaMedkit className="text-[#1360AB] mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Insurance Provider</p>
              <p className="font-medium">{claim.insuranceProvider.name || getProviderName(claim.insuranceProvider)}</p>
            </div>
          </div>

          <div className="flex items-start">
            <FaCalendarAlt className="text-[#1360AB] mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">{formatDate(claim.updatedAt)}</p>
            </div>
          </div>

          {selectedProvider && (
            <>
              <div className="flex items-start">
                <FaCalendarCheck className="text-[#1360AB] mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Policy Start Date</p>
                  <p className="font-medium">{formatDate(selectedProvider.startDate)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaCalendarCheck className="text-[#1360AB] mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Policy End Date</p>
                  <p className="font-medium">{formatDate(selectedProvider.endDate)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex items-start">
          <FaFileAlt className="text-[#1360AB] mt-1 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-500">Description</p>
            <p className="mt-1 text-gray-700 bg-white p-3 rounded-md border border-gray-200 min-h-[80px]">{claim.description || "No description provided."}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        {canAccess("students_info", "edit") && (
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <FaEdit className="mr-2" /> Edit Claim
          </button>
        )}
        {canAccess("students_info", "edit") && (
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center">
            <FaTrash className="mr-2" /> Delete Claim
          </button>
        )}
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
          Close
        </button>
      </div>
    </>
  )

  const renderEditMode = () => (
    <form onSubmit={handleSubmit}>
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
            <select name="insuranceProvider" value={formData.insuranceProvider} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required>
              <option value="">Select Insurance Provider</option>
              {insuranceProviders.map((provider) => (
                <option key={provider._id} value={provider._id}>
                  {provider.name}
                </option>
              ))}
            </select>

            {selectedProvider && (
              <div className="mt-2 text-xs text-gray-500">
                Policy period: {formatDate(selectedProvider.startDate)} - {formatDate(selectedProvider.endDate)}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Enter claim amount" required />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
            <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Enter hospital name" required />
          </div>

          <div className="form-group md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Enter claim description" required></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button type="submit" className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <FaSave className="mr-2" /> {isNew ? "Add Claim" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (isNew) {
              onClose()
            } else {
              setIsEditing(false)
            }
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )

  return (
    <Modal title={isNew ? "Add Insurance Claim" : isEditing ? "Edit Insurance Claim" : "Insurance Claim Details"} onClose={onClose} width={600}>
      <div className="bg-white p-4">{isNew || isEditing ? renderEditMode() : renderViewMode()}</div>
    </Modal>
  )
}

export default InsuranceClaimModal
