import React, { useState } from "react"
import { FaBuilding, FaEdit, FaEnvelope, FaPhone, FaUserTie } from "react-icons/fa"
import { BsCalendarCheck } from "react-icons/bs"
import EditWardenForm from "./EditWardenForm"
import { useAdmin } from "../../../contexts/AdminProvider"
import { getMediaUrl } from "../../../utils/mediaUtils"
import Card from "../../common/Card"

const WardenCard = ({ warden, staffType = "warden", onUpdate, onDelete }) => {
  const { hostelList } = useAdmin()
  const [showEditForm, setShowEditForm] = useState(false)
  const staffTitle = staffType === "warden" ? "Warden" : staffType === "associateWarden" ? "Associate Warden" : "Hostel Supervisor"

  const getAssignedHostelNames = () => {
    if (!warden.hostelIds || warden.hostelIds.length === 0) {
      return "Not assigned"
    }
    return warden.hostelIds
      .map((hostelRef) => {
        const hostelId = typeof hostelRef === "string" ? hostelRef : hostelRef?._id
        const hostel = hostelList?.find((h) => h._id === hostelId)
        return hostel ? hostel.name : "Unknown Hostel"
      })
      .join(", ")
  }

  const isAssigned = warden.hostelIds && warden.hostelIds.length > 0
  const status = isAssigned ? "assigned" : "unassigned"

  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case "assigned":
        return { bg: "var(--color-success)", light: "var(--color-success-bg)", text: "var(--color-success-text)" }
      case "unassigned":
        return { bg: "var(--color-warning)", light: "var(--color-warning-bg)", text: "var(--color-warning-text)" }
      default:
        return { bg: "var(--color-text-muted)", light: "var(--color-bg-hover)", text: "var(--color-text-body)" }
    }
  }

  const calculateServiceYears = (joinDate) => {
    if (!joinDate) return 0
    const start = new Date(joinDate)
    const now = new Date()
    return Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000))
  }

  const serviceYears = calculateServiceYears(warden.joinDate)
  const statusColor = getStatusColor(status)

  const handleSave = () => {
    if (onUpdate) onUpdate()
    setShowEditForm(false)
  }

  const handleDelete = () => {
    if (onDelete) onDelete()
    setShowEditForm(false)
  }

  return (
    <>
      <Card className="relative overflow-hidden">
        <div style={{ position: 'absolute', top: 0, right: 0, width: 'var(--spacing-16)', height: 'var(--spacing-16)' }}>
          <div style={{ position: 'absolute', transform: 'rotate(45deg)', transformOrigin: 'bottom right', backgroundColor: statusColor.bg, color: 'var(--color-white)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', padding: 'var(--spacing-1) 0', right: '-6px', top: '-2px', width: 'var(--spacing-24)', textAlign: 'center' }}>{status === "assigned" ? "Assigned" : "Unassigned"}</div>
        </div>

        <Card.Header className="mb-0">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-shrink-0 mb-3 md:mb-0 md:mr-4">
              {warden.profileImage ? (
                <img src={getMediaUrl(warden.profileImage)} alt={warden.name} style={{ width: 'var(--avatar-lg)', height: 'var(--avatar-lg)', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: 'var(--border-2) solid var(--color-primary)', boxShadow: 'var(--shadow-sm)' }} />
              ) : (
                <div style={{ width: 'var(--avatar-lg)', height: 'var(--avatar-lg)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'var(--border-2) solid var(--color-primary)' }}>
                  <FaUserTie style={{ color: 'var(--color-primary)', fontSize: 'var(--icon-xl)' }} />
                </div>
              )}
            </div>
            <div>
              <h3 style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{warden.name}</h3>
              {warden.category && <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-0-5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{warden.category}</div>}
            </div>
          </div>
        </Card.Header>

        <Card.Body style={{ marginTop: 'var(--spacing-5)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexShrink: 0, width: 'var(--spacing-8)', display: 'flex', justifyContent: 'center' }}>
              <FaEnvelope style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-body)' }}>{warden.email}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexShrink: 0, width: 'var(--spacing-8)', display: 'flex', justifyContent: 'center' }}>
              <FaPhone style={{ color: 'var(--color-text-muted)' }} />
            </div>
            {warden.phone ? <span style={{ color: 'var(--color-text-body)' }}>{warden.phone}</span> : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Not provided</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {" "}
            <div style={{ flexShrink: 0, width: 'var(--spacing-8)', display: 'flex', justifyContent: 'center', paddingTop: 'var(--spacing-0-5)' }}>
              {" "}
              <FaBuilding style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', wordBreak: 'break-word' }}> {getAssignedHostelNames()}</span>
          </div>
        </Card.Body>

        <Card.Footer style={{ marginTop: 'var(--spacing-5)', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Joined on{" "}
            {warden.joinDate
              ? new Date(warden.joinDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              : "N/A"}
          </div>

          <button onClick={() => setShowEditForm(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-2-5)', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-all)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-bg-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary-bg)'} aria-label={`Edit ${staffTitle.toLowerCase()}`}>
            <FaEdit style={{ fontSize: 'var(--font-size-sm)' }} />
          </button>
        </Card.Footer>
      </Card>

      {showEditForm && <EditWardenForm warden={warden} staffType={staffType} onClose={() => setShowEditForm(false)} onSave={handleSave} onDelete={handleDelete} />}
    </>
  )
}

export default WardenCard
