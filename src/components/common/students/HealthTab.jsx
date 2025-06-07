import React, { useState, useEffect } from "react"
import { FaPlus, FaHeartbeat, FaHospital, FaMedkit, FaEye, FaEdit, FaCalendarCheck, FaCog } from "react-icons/fa"
import { healthApi } from "../../../services/healthApi"
import { Link } from "react-router-dom"
// import { toast } from "react-toastify"
import InsuranceClaimModal from "./InsuranceClaimModal"

const HealthTab = ({ userId }) => {
  const [healthData, setHealthData] = useState(null)
  const [insuranceClaims, setInsuranceClaims] = useState([])
  const [insuranceProviders, setInsuranceProviders] = useState([])
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingClaims, setLoadingClaims] = useState(true)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [isNewClaim, setIsNewClaim] = useState(false)
  const [editHealthData, setEditHealthData] = useState(false)
  const [healthFormData, setHealthFormData] = useState({
    bloodGroup: "",
    insuranceProvider: "",
    insuranceNumber: "",
  })

  // Fetch health data
  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const response = await healthApi.getStudentHealth(userId)
      setHealthData(response.health)
      setHealthFormData({
        bloodGroup: response.health.bloodGroup || "",
        insuranceProvider: response.health.insurance?.insuranceProvider?._id || "",
        insuranceNumber: response.health.insurance?.insuranceNumber || "",
      })

      // Find the selected provider
      if (response.health.insurance?.insuranceProvider) {
        const providerId = response.health.insurance.insuranceProvider._id || response.health.insurance.insuranceProvider
        const provider = insuranceProviders.find((p) => p._id === providerId)
        setSelectedProvider(provider || null)
      }
    } catch (error) {
      console.error("Error fetching health data:", error)
      // toast.error("Failed to load health information")
    } finally {
      setLoading(false)
    }
  }

  // Fetch insurance claims
  const fetchInsuranceClaims = async () => {
    try {
      setLoadingClaims(true)
      const response = await healthApi.getInsuranceClaims(userId)
      setInsuranceClaims(response.insuranceClaims || [])
    } catch (error) {
      console.error("Error fetching insurance claims:", error)
      // toast.error("Failed to load insurance claims")
    } finally {
      setLoadingClaims(false)
    }
  }

  // Fetch insurance providers
  const fetchInsuranceProviders = async () => {
    try {
      const response = await healthApi.getInsuranceProviders()
      setInsuranceProviders(response.insuranceProviders || [])
    } catch (error) {
      console.error("Error fetching insurance providers:", error)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchInsuranceProviders()
    }
  }, [userId])

  useEffect(() => {
    if (userId && insuranceProviders.length > 0) {
      fetchHealthData()
      fetchInsuranceClaims()
    }
  }, [userId, insuranceProviders])

  // Update selected provider when form data changes
  useEffect(() => {
    if (healthFormData.insuranceProvider && insuranceProviders.length > 0) {
      const provider = insuranceProviders.find((p) => p._id === healthFormData.insuranceProvider)
      setSelectedProvider(provider || null)
    }
  }, [healthFormData.insuranceProvider, insuranceProviders])

  // Handle health form input changes
  const handleHealthInputChange = (e) => {
    const { name, value } = e.target
    setHealthFormData({
      ...healthFormData,
      [name]: value,
    })
  }

  // Update health information
  const handleUpdateHealth = async (e) => {
    e.preventDefault()
    try {
      const updatedHealthData = {
        bloodGroup: healthFormData.bloodGroup,
        insurance: {
          insuranceProvider: healthFormData.insuranceProvider !== "" ? healthFormData.insuranceProvider : null,
          insuranceNumber: healthFormData.insuranceNumber !== "" ? healthFormData.insuranceNumber : null,
        },
      }

      await healthApi.updateStudentHealth(userId, updatedHealthData)
      // toast.success("Health information updated successfully")
      fetchHealthData()
      setEditHealthData(false)
    } catch (error) {
      console.error("Error updating health data:", error)
      // toast.error("Failed to update health information")
    }
  }

  // Handle saving a claim (create or update)
  const handleSaveClaim = async (claimId, claimData) => {
    try {
      const newClaimData = {
        ...claimData,
        userId,
      }

      if (claimId) {
        await healthApi.updateInsuranceClaim(claimId, newClaimData)
        // toast.success("Insurance claim updated successfully")
      } else {
        await healthApi.createInsuranceClaim(newClaimData)
        // toast.success("Insurance claim added successfully")
      }

      fetchInsuranceClaims()
    } catch (error) {
      console.error("Error with insurance claim:", error)
      // toast.error(claimId ? "Failed to update claim" : "Failed to add claim")
    }
  }

  // Delete insurance claim
  const handleDeleteClaim = async (claimId) => {
    try {
      await healthApi.deleteInsuranceClaim(claimId)
      // toast.success("Insurance claim deleted successfully")
      fetchInsuranceClaims()
    } catch (error) {
      console.error("Error deleting insurance claim:", error)
      // toast.error("Failed to delete insurance claim")
    }
  }

  // Open modal to add a new claim
  const handleAddClaim = () => {
    setSelectedClaim(null)
    setIsNewClaim(true)
    setShowClaimModal(true)
  }

  // Open modal to view a claim
  const handleViewClaim = (claim) => {
    setSelectedClaim(claim)
    setIsNewClaim(false)
    setShowClaimModal(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Find provider name by ID
  const getProviderName = (providerId) => {
    const provider = insuranceProviders.find((p) => p._id === providerId)
    return provider ? provider.name : "Unknown Provider"
  }

  return (
    <div className="bg-white">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <FaHeartbeat className="text-[#1360AB] mr-2" />
            Health Information
          </h3>
          <div className="flex space-x-2">
            <Link to="/admin/others" className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors flex items-center">
              <FaCog className="mr-1" /> Manage Providers
            </Link>
            {!editHealthData && (
              <button onClick={() => setEditHealthData(true)} className="px-3 py-1.5 bg-[#1360AB] text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center">
                <FaEdit className="mr-1" /> Edit
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1360AB]"></div>
          </div>
        ) : editHealthData ? (
          <form onSubmit={handleUpdateHealth} className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select name="bloodGroup" value={healthFormData.bloodGroup} onChange={handleHealthInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                <select name="insuranceProvider" value={healthFormData.insuranceProvider} onChange={handleHealthInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Number</label>
                <input type="text" name="insuranceNumber" value={healthFormData.insuranceNumber} onChange={handleHealthInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Enter insurance number" />
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button type="button" onClick={() => setEditHealthData(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-[#1360AB] text-white rounded hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 p-5 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="font-medium">{healthData?.bloodGroup || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Insurance Provider</p>
                <p className="font-medium">{healthData?.insurance?.insuranceProvider?.name || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Insurance Number</p>
                <p className="font-medium">{healthData?.insurance?.insuranceNumber || "Not specified"}</p>
              </div>

              {selectedProvider && (
                <>
                  <div className="flex items-center">
                    <FaCalendarCheck className="text-[#1360AB] mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Policy Start Date</p>
                      <p className="font-medium">{formatDate(selectedProvider.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarCheck className="text-[#1360AB] mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Policy End Date</p>
                      <p className="font-medium">{formatDate(selectedProvider.endDate)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <FaMedkit className="text-[#1360AB] mr-2" />
            Insurance Claims
          </h3>
          <button onClick={handleAddClaim} className="px-3 py-1.5 bg-[#1360AB] text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center">
            <FaPlus className="mr-1" /> Add Claim
          </button>
        </div>

        {loadingClaims ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1360AB]"></div>
          </div>
        ) : insuranceClaims.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <FaHospital className="mx-auto text-gray-300 mb-2 text-4xl" />
            <p className="text-gray-500">No insurance claims found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {insuranceClaims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(claim.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.insuranceProvider.name || getProviderName(claim.insuranceProvider)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.hospitalName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Intl.NumberFormat("en-US", { style: "currency", currency: "INR" }).format(claim.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={() => handleViewClaim(claim)} className="text-[#1360AB] hover:text-blue-800 flex items-center">
                        <FaEye className="mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showClaimModal && <InsuranceClaimModal claim={selectedClaim} onClose={() => setShowClaimModal(false)} onSave={handleSaveClaim} onDelete={handleDeleteClaim} insuranceProviders={insuranceProviders} isNew={isNewClaim} />}
    </div>
  )
}

export default HealthTab
