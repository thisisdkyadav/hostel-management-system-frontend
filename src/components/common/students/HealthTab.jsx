import React, { useState, useEffect } from "react"
import { Plus, Heart, Hospital, Pill, Eye, Edit, CalendarCheck, Settings } from "lucide-react"
import { healthApi } from "../../../service"
import { Link } from "react-router-dom"
import { Select } from "@/components/ui"
import { Button, Input } from "czero/react"
// import { toast } from "react-toastify"
import InsuranceClaimModal from "./InsuranceClaimModal"
import { useAuth } from "../../../contexts/AuthProvider"
import useAuthz from "../../../hooks/useAuthz"
const HealthTab = ({ userId }) => {
  const { user } = useAuth()
  const { can } = useAuthz()
  const canEditHealth = can("cap.students.edit.health")
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
    <div style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-body)', display: 'flex', alignItems: 'center' }}>
            <Heart size={20} style={{ color: 'var(--color-primary)', marginRight: 'var(--spacing-2)' }} />
            Health Information
          </h3>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            {user.role === "Admin" && (
              <Link to="/admin/others" style={{ padding: 'var(--spacing-1) var(--spacing-3)', backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-body)', fontSize: 'var(--font-size-xs)', borderRadius: 'var(--radius-md)', transition: 'var(--transition-all)', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <Settings size={14} style={{ marginRight: 'var(--spacing-1)' }} /> Manage Providers
              </Link>
            )}
            {canEditHealth && !editHealthData && (
              <Button onClick={() => setEditHealthData(true)} variant="primary" size="sm">
                <Edit size={16} /> Edit
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-6) 0' }}>
            <div style={{ width: 'var(--avatar-sm)', height: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', borderBottom: 'var(--border-2) solid var(--color-primary)', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : editHealthData ? (
          <form onSubmit={handleUpdateHealth} style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Blood Group</label>
                <Select name="bloodGroup" value={healthFormData.bloodGroup} onChange={handleHealthInputChange}
                  options={[
                    { value: "", label: "Select Blood Group" },
                    { value: "A+", label: "A+" },
                    { value: "A-", label: "A-" },
                    { value: "B+", label: "B+" },
                    { value: "B-", label: "B-" },
                    { value: "AB+", label: "AB+" },
                    { value: "AB-", label: "AB-" },
                    { value: "O+", label: "O+" },
                    { value: "O-", label: "O-" },
                  ]}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Insurance Provider</label>
                <Select name="insuranceProvider" value={healthFormData.insuranceProvider} onChange={handleHealthInputChange}
                  options={[
                    { value: "", label: "Select Insurance Provider" },
                    ...insuranceProviders.map((provider) => ({ value: provider._id, label: provider.name }))
                  ]}
                />

                {selectedProvider && (
                  <div style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    Policy period: {formatDate(selectedProvider.startDate)} - {formatDate(selectedProvider.endDate)}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Insurance Number</label>
                <Input type="text" name="insuranceNumber" value={healthFormData.insuranceNumber} onChange={handleHealthInputChange} placeholder="Enter insurance number" />
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' }}>
              <Button type="button" onClick={() => setEditHealthData(false)} variant="secondary" size="sm">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', rowGap: 'var(--spacing-4)' }}>
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Blood Group</p>
                <p style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>{healthData?.bloodGroup || "Not specified"}</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Insurance Provider</p>
                <p style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>{healthData?.insurance?.insuranceProvider?.name || "Not specified"}</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Insurance Number</p>
                <p style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>{healthData?.insurance?.insuranceNumber || "Not specified"}</p>
              </div>

              {selectedProvider && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarCheck size={18} style={{ color: 'var(--color-primary)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Policy Start Date</p>
                      <p style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>{formatDate(selectedProvider.startDate)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarCheck size={18} style={{ color: 'var(--color-primary)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Policy End Date</p>
                      <p style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>{formatDate(selectedProvider.endDate)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'var(--spacing-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-body)', display: 'flex', alignItems: 'center' }}>
            <Pill size={20} style={{ color: 'var(--color-primary)', marginRight: 'var(--spacing-2)' }} />
            Insurance Claims
          </h3>
          {canEditHealth && (
            <Button onClick={handleAddClaim} variant="primary" size="sm">
              <Plus size={16} /> Add Claim
            </Button>
          )}
        </div>

        {loadingClaims ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-6) 0' }}>
            <div style={{ width: 'var(--avatar-sm)', height: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', borderBottom: 'var(--border-2) solid var(--color-primary)', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : insuranceClaims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-10) 0', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            <Hospital size={48} style={{ margin: '0 auto', color: 'var(--color-text-disabled)', marginBottom: 'var(--spacing-2)', display: 'block' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>No insurance claims found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Date</th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Provider</th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Hospital</th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Amount</th>
                  <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                {insuranceClaims.map((claim) => (
                  <tr key={claim._id} style={{ borderTop: 'var(--border-1) solid var(--color-border-primary)' }}>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{formatDate(claim.createdAt)}</td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{claim.insuranceProvider.name || getProviderName(claim.insuranceProvider)}</td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{claim.hospitalName}</td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{new Intl.NumberFormat("en-US", { style: "currency", currency: "INR" }).format(claim.amount)}</td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                      <Button onClick={() => handleViewClaim(claim)} variant="ghost" size="sm">
                        <Eye size={16} /> View
                      </Button>
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
