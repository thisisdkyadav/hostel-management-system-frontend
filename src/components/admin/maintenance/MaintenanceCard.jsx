import React, { useState } from "react"
import { FaTools, FaEdit, FaEnvelope, FaWrench, FaBolt, FaBuilding, FaBroom, FaWifi, FaEllipsisH, FaUserCog, FaPhone, FaEye, FaUserTie } from "react-icons/fa"
import EditMaintenanceForm from "./EditMaintenanceForm"
import MaintenanceStaffDetailsModal from "./MaintenanceStaffDetailsModal"
import { getMediaUrl } from "../../../utils/mediaUtils"
import { Card, CardHeader, CardBody, CardFooter, Button, Badge } from "@/components/ui"

const CATEGORY_DISPLAY_LABELS = {
  Plumbing: "Plumber",
  Electrical: "Electrician",
  Civil: "Carpenter",
  Cleanliness: "House Keeping",
  Internet: "IT Technician",
  Attendant: "Attendant",
  Other: "Other",
}
const getCategoryDisplayLabel = (value) => CATEGORY_DISPLAY_LABELS[value] || value
const MaintenanceCard = ({ staff, onUpdate, onDelete }) => {
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Plumbing":
        return <FaWrench style={{ color: "var(--color-info)" }} />
      case "Electrical":
        return <FaBolt style={{ color: "var(--color-warning)" }} />
      case "Civil":
        return <FaBuilding style={{ color: "var(--color-orange-text)" }} />
      case "Cleanliness":
        return <FaBroom style={{ color: "var(--color-success)" }} />
      case "Internet":
        return <FaWifi style={{ color: "var(--color-purple-text)" }} />
      case "Attendant":
        return <FaUserTie style={{ color: "var(--color-girls-text)" }} />
      default:
        return <FaEllipsisH style={{ color: "var(--color-text-muted)" }} />
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "Plumbing":
        return { bg: "var(--color-info-bg)", text: "var(--color-info-text)" }
      case "Electrical":
        return { bg: "var(--color-warning-bg)", text: "var(--color-warning-text)" }
      case "Civil":
        return { bg: "var(--color-orange-bg)", text: "var(--color-orange-text)" }
      case "Cleanliness":
        return { bg: "var(--color-success-bg)", text: "var(--color-success-text)" }
      case "Internet":
        return { bg: "var(--color-purple-light-bg)", text: "var(--color-purple-text)" }
      case "Attendant":
        return { bg: "var(--color-girls-bg)", text: "var(--color-girls-text)" }
      default:
        return { bg: "var(--color-bg-hover)", text: "var(--color-text-body)" }
    }
  }

  const categoryColor = getCategoryColor(staff.category)

  return (
    <>
      <Card className="group relative">
        <div style={{ position: "absolute", top: "var(--spacing-3)", right: "var(--spacing-3)" }}>
          <span style={{ padding: "var(--spacing-1) var(--spacing-3)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", backgroundColor: categoryColor.bg, color: categoryColor.text }}>{getCategoryDisplayLabel(staff.category)}</span>
        </div>

        <CardHeader className="mb-0">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "var(--avatar-lg)", height: "var(--avatar-lg)", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-4)", overflow: "hidden" }}>
              {staff.profileImage ? (
                <img src={getMediaUrl(staff.profileImage)} alt={staff.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", backgroundColor: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-white)", fontSize: "var(--font-size-xl)" }}>
                  <FaUserCog />
                </div>
              )}
            </div>
            <div>
              <h3 style={{ fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)", fontSize: "var(--font-size-lg)" }}>{staff.name}</h3>
              <div style={{ display: "flex", alignItems: "center", marginTop: "var(--spacing-1)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                {getCategoryIcon(staff.category)}
                <span style={{ marginLeft: "var(--spacing-1-5)" }}>{getCategoryDisplayLabel(staff.category)}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody style={{ marginTop: "var(--spacing-5)", paddingTop: "var(--spacing-4)", borderTop: "var(--border-1) solid var(--color-border-light)", display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "var(--spacing-7)", height: "var(--spacing-7)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-3)" }}>
              <FaEnvelope style={{ color: "var(--color-primary)", fontSize: "var(--font-size-xs)" }} />
            </div>
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{staff.email}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "var(--spacing-7)", height: "var(--spacing-7)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-3)" }}>
              <FaPhone style={{ color: "var(--color-primary)", fontSize: "var(--font-size-xs)" }} />
            </div>
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{staff.phone || "Not provided"}</span>
          </div>
        </CardBody>




        <CardFooter className="pt-4 border-t flex gap-2" style={{ borderColor: "var(--color-border-light)" }}>
          <Button onClick={() => setShowDetailsModal(true)} variant="secondary" size="medium" icon={<FaEye />} fullWidth>
            View Details
          </Button>
          <Button onClick={() => setShowEditForm(true)} variant="secondary" size="medium" icon={<FaEdit />} fullWidth>
            Edit
          </Button>
        </CardFooter>
      </Card>

      {showEditForm && <EditMaintenanceForm staff={staff} onClose={() => setShowEditForm(false)} onUpdate={onUpdate} onDelete={onDelete} />}
      {showDetailsModal && <MaintenanceStaffDetailsModal staff={staff} onClose={() => setShowDetailsModal(false)} />}
    </>
  )
}

export default MaintenanceCard
