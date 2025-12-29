import React, { useState } from "react"
import { FaBuilding, FaEdit, FaEnvelope, FaShieldAlt, FaIdCard, FaCircle, FaEye } from "react-icons/fa"
import EditSecurityForm from "./EditSecurityForm"
import SecurityStaffDetailsModal from "./SecurityStaffDetailsModal"
import { useAdmin } from "../../../contexts/AdminProvider"
import Card from "../../common/Card"
import Button from "../../common/Button"

const SecurityCard = ({ security, onUpdate, onDelete }) => {
  const { hostelList } = useAdmin()
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const getHostelName = (hostelId) => {
    const hostel = hostelList?.find((hostel) => hostel._id === hostelId)
    return hostel ? hostel.name : "Not assigned to any hostel"
  }

  const getStatusColor = () => {
    return security.hostelId ? { bg: 'var(--color-success)', light: 'var(--color-success-bg)', text: 'var(--color-success-text)' } : { bg: 'var(--color-warning)', light: 'var(--color-warning-bg)', text: 'var(--color-warning-text)' }
  }

  const statusColor = getStatusColor()
  const hostelName = getHostelName(security.hostelId)

  return (
    <>
      <Card className="group relative">
        <div style={{ position: 'absolute', top: 'var(--spacing-3)', right: 'var(--spacing-3)', display: 'flex', alignItems: 'center' }}>
          <div style={{ height: 'var(--spacing-3)', width: 'var(--spacing-3)', borderRadius: 'var(--radius-full)', backgroundColor: statusColor.bg }}></div>

          <span style={{ marginLeft: 'var(--spacing-1-5)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: statusColor.text }}>{security.hostelId ? "Assigned" : "Unassigned"}</span>
        </div>

        <Card.Header style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 'var(--avatar-lg)', height: 'var(--avatar-lg)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-white)', fontSize: 'var(--font-size-xl)', marginRight: 'var(--spacing-4)' }} className="sm:w-16 sm:h-16">
              <FaShieldAlt />
            </div>
            <div>
              <h3 style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-lg)' }}>{security.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                <FaIdCard style={{ marginRight: 'var(--spacing-1-5)', color: 'var(--color-primary)', opacity: 'var(--opacity-70)' }} />
                <span>Security Staff</span>
              </div>
            </div>
          </div>
        </Card.Header>

        <Card.Body style={{ marginTop: 'var(--spacing-5)', paddingTop: 'var(--spacing-4)', borderTop: `var(--border-1) solid var(--color-border-light)`, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 'var(--spacing-7)', height: 'var(--spacing-7)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-3)' }}>
              <FaEnvelope style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-xs)' }} />
            </div>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{security.email}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 'var(--spacing-7)', height: 'var(--spacing-7)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-3)' }}>
              <FaBuilding style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-xs)' }} />
            </div>
            <div>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)', fontWeight: 'var(--font-weight-medium)' }}>{hostelName}</span>
            </div>
          </div>
        </Card.Body>

        <Card.Footer style={{ marginTop: 'var(--spacing-5)', paddingTop: 'var(--spacing-4)', borderTop: `var(--border-1) solid var(--color-border-light)`, display: 'flex', gap: 'var(--spacing-2)' }}>
          <Button onClick={() => setShowDetailsModal(true)} variant="secondary" size="small" icon={<FaEye />} fullWidth>
            View Details
          </Button>
          <Button onClick={() => setShowEditForm(true)} variant="secondary" size="small" icon={<FaEdit />} fullWidth>
            Edit
          </Button>
        </Card.Footer>
      </Card>

      {showEditForm && <EditSecurityForm security={security} onClose={() => setShowEditForm(false)} onUpdate={onUpdate} onDelete={onDelete} />}
      {showDetailsModal && <SecurityStaffDetailsModal staff={security} onClose={() => setShowDetailsModal(false)} />}
    </>
  )
}

export default SecurityCard
