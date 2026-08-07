import React, { useState } from "react"
import { FaTools, FaEdit, FaEnvelope, FaWrench, FaBolt, FaBuilding, FaBroom, FaWifi, FaEllipsisH, FaUserCog, FaPhone, FaEye, FaUserTie } from "react-icons/fa"
import EditMaintenanceForm from "./EditMaintenanceForm"
import MaintenanceStaffDetailsModal from "./MaintenanceStaffDetailsModal"
import { getMediaUrl } from "../../../utils/mediaUtils"
import { Badge, Card, CardBody, CardFooter, CardHeader, Heading, HStack, IconCircle, Surface, Text } from "@/components/ui"
import { Button } from "hzero"

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
        return <FaWrench color="var(--color-info)" />
      case "Electrical":
        return <FaBolt color="var(--color-warning)" />
      case "Civil":
        return <FaBuilding color="var(--color-orange-text)" />
      case "Cleanliness":
        return <FaBroom color="var(--color-success)" />
      case "Internet":
        return <FaWifi color="var(--color-purple-text)" />
      case "Attendant":
        return <FaUserTie color="var(--color-girls-text)" />
      default:
        return <FaEllipsisH color="var(--color-text-muted)" />
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
          <Surface as="span" bg={categoryColor.bg} padding="var(--spacing-1) var(--spacing-3)" radius="full" color={categoryColor.text} size="xs" weight="medium">{getCategoryDisplayLabel(staff.category)}</Surface>
        </div>

        <CardHeader className="mb-0">
          <HStack gap="none" align="center">
            <IconCircle size="var(--avatar-lg)" style={{ marginRight: "var(--spacing-4)", overflow: "hidden" }}>
              {staff.profileImage ? (
                <img src={getMediaUrl(staff.profileImage)} alt={staff.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Surface bg="var(--color-primary)" color="var(--color-white)" size="xl" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaUserCog />
                </Surface>
              )}
            </IconCircle>
            <div>
              <Heading as="h3" weight="bold" color="secondary" size="lg">{staff.name}</Heading>
              <HStack align="center" gap="none" size="sm" color="muted" style={{ marginTop: "var(--spacing-1)" }}>
                {getCategoryIcon(staff.category)}
                <span style={{ marginLeft: "var(--spacing-1-5)" }}>{getCategoryDisplayLabel(staff.category)}</span>
              </HStack>
            </div>
          </HStack>
        </CardHeader>

        <CardBody style={{ marginTop: "var(--spacing-5)", paddingTop: "var(--spacing-4)", borderTop: "var(--border-1) solid var(--color-border-light)", display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
          <HStack gap="none" align="center">
            <IconCircle size="var(--spacing-7)" bg="brand" style={{ marginRight: "var(--spacing-3)" }}>
              <FaEnvelope style={{ fontSize: "var(--font-size-xs)" }} color="var(--color-primary)" />
            </IconCircle>
            <Text as="span" size="sm" color="body" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{staff.email}</Text>
          </HStack>

          <HStack gap="none" align="center">
            <IconCircle size="var(--spacing-7)" bg="brand" style={{ marginRight: "var(--spacing-3)" }}>
              <FaPhone style={{ fontSize: "var(--font-size-xs)" }} color="var(--color-primary)" />
            </IconCircle>
            <Text as="span" size="sm" color="body" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{staff.phone || "Not provided"}</Text>
          </HStack>
        </CardBody>




        <CardFooter className="pt-4 border-t flex gap-2" style={{ borderColor: "var(--color-border-light)" }}>
          <Button onClick={() => setShowDetailsModal(true)} variant="secondary" size="md" fullWidth>
            <FaEye />
            View Details
          </Button>
          <Button onClick={() => setShowEditForm(true)} variant="secondary" size="md" fullWidth>
            <FaEdit />
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
