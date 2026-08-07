import React, { useState } from "react"
import { FaBuilding, FaEdit, FaEnvelope, FaPhone, FaUserTie } from "react-icons/fa"
import EditWardenForm from "./EditWardenForm"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { getMediaUrl } from "../../../utils/mediaUtils"
import { Card, CardBody, CardFooter, CardHeader, Heading, HStack, IconCircle, InfoRow, Text } from "@/components/ui"
import { Button } from "hzero"

const WardenCard = ({ warden, staffType = "warden", onUpdate, onDelete }) => {
  const { hostelList } = useGlobal()
  const [showEditForm, setShowEditForm] = useState(false)
  const isGymkhana = staffType === "gymkhana"
  const isAcademics = staffType === "academics"
  const staffTitle = staffType === "warden" ? "Warden" : staffType === "associateWarden" ? "Associate Warden" : staffType === "hostelSupervisor" ? "Hostel Supervisor" : staffType === "gymkhana" ? "Gymkhana" : "Academics"

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

  const statusColor = getStatusColor(status)

  const handleSave = () => {
    if (onUpdate) onUpdate()
    setShowEditForm(false)
  }

  const handleDelete = () => {
    if (onDelete) onDelete()
    setShowEditForm(false)
  }

  const gymkhanaCategoryText = Array.isArray(warden.categoryLabels) && warden.categoryLabels.length > 0
    ? warden.categoryLabels.join(", ")
    : Array.isArray(warden.categories) && warden.categories.length > 0
      ? warden.categories.join(", ")
      : "Not assigned"

  if (isGymkhana) {
    return (
      <>
        <Card className="relative overflow-hidden">
          <CardHeader className="mb-0">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 mb-3 md:mb-0 md:mr-4">
                <IconCircle size="var(--avatar-lg)" bg="brand" style={{ border: 'var(--border-2) solid var(--color-primary)' }}>
                  <FaUserTie style={{ fontSize: 'var(--icon-xl)' }} color="var(--color-primary)" />
                </IconCircle>
              </div>
              <div>
                <Heading as="h3" weight="bold" size="lg" color="secondary">{warden.name}</Heading>
                <Text as="div" size="sm" color="tertiary" style={{ marginTop: 'var(--spacing-0-5)' }}>
                  {warden.position || warden.subRole || 'No sub role assigned'}
                </Text>
              </div>
            </div>
          </CardHeader>

          <CardBody style={{ marginTop: 'var(--spacing-5)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>
            <InfoRow label="Email" value={warden.email || 'Not available'} />
            <InfoRow label="Role" value={warden.role || 'Gymkhana'} />
            <InfoRow label="Sub Role" value={warden.subRole || 'Not assigned'} />
            <InfoRow label="Position" value={warden.position || 'Not set'} />
            <InfoRow label="Categories" value={gymkhanaCategoryText} />
          </CardBody>

          <CardFooter style={{ marginTop: 'var(--spacing-5)', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text as="div" size="xs" color="muted">Gymkhana user</Text>
            <Button onClick={() => setShowEditForm(true)} variant="ghost" size="sm" aria-label={`Edit ${staffTitle.toLowerCase()}`}><FaEdit /></Button>
          </CardFooter>
        </Card>

        {showEditForm && <EditWardenForm warden={warden} staffType={staffType} onClose={() => setShowEditForm(false)} onSave={handleSave} onDelete={handleDelete} />}
      </>
    )
  }

  if (isAcademics) {
    return (
      <>
        <Card className="relative overflow-hidden">
          <CardHeader className="mb-0">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 mb-3 md:mb-0 md:mr-4">
                <IconCircle size="var(--avatar-lg)" bg="brand" style={{ border: 'var(--border-2) solid var(--color-primary)' }}>
                  <FaUserTie style={{ fontSize: 'var(--icon-xl)' }} color="var(--color-primary)" />
                </IconCircle>
              </div>
              <div>
                <Heading as="h3" weight="bold" size="lg" color="secondary">{warden.name}</Heading>
                <Text as="div" size="sm" color="tertiary" style={{ marginTop: 'var(--spacing-0-5)' }}>
                  {warden.subRole || 'No sub role assigned'}
                </Text>
              </div>
            </div>
          </CardHeader>

          <CardBody style={{ marginTop: 'var(--spacing-5)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>
            <InfoRow label="Email" value={warden.email || 'Not available'} />
            <InfoRow label="Role" value={warden.role || 'Academics'} />
            <InfoRow label="Sub Role" value={warden.subRole || 'Not assigned'} />
          </CardBody>

          <CardFooter style={{ marginTop: 'var(--spacing-5)', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text as="div" size="xs" color="muted">Academics user</Text>
            <Button onClick={() => setShowEditForm(true)} variant="ghost" size="sm" aria-label={`Edit ${staffTitle.toLowerCase()}`}><FaEdit /></Button>
          </CardFooter>
        </Card>

        {showEditForm && <EditWardenForm warden={warden} staffType={staffType} onClose={() => setShowEditForm(false)} onSave={handleSave} onDelete={handleDelete} />}
      </>
    )
  }

  return (
    <>
      <Card className="relative overflow-hidden">
        <div style={{ position: 'absolute', top: 0, right: 0, width: 'var(--spacing-16)', height: 'var(--spacing-16)' }}>
          <Text as="div" color="var(--color-white)" size="xs" weight="medium" align="center" style={{ position: 'absolute', transform: 'rotate(45deg)', transformOrigin: 'bottom right', backgroundColor: statusColor.bg, padding: 'var(--spacing-1) 0', right: '-6px', top: '-2px', width: 'var(--spacing-24)' }}>{status === "assigned" ? "Assigned" : "Unassigned"}</Text>
        </div>

        <CardHeader className="mb-0">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-shrink-0 mb-3 md:mb-0 md:mr-4">
              {warden.profileImage ? (
                <img src={getMediaUrl(warden.profileImage)} alt={warden.name} style={{ width: 'var(--avatar-lg)', height: 'var(--avatar-lg)', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: 'var(--border-2) solid var(--color-primary)', boxShadow: 'var(--shadow-sm)' }} />
              ) : (
                <IconCircle size="var(--avatar-lg)" bg="brand" style={{ border: 'var(--border-2) solid var(--color-primary)' }}>
                  <FaUserTie style={{ fontSize: 'var(--icon-xl)' }} color="var(--color-primary)" />
                </IconCircle>
              )}
            </div>
            <div>
              <Heading as="h3" weight="bold" size="lg" color="secondary" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{warden.name}</Heading>
              {warden.category && <Text as="div" size="sm" color="tertiary" style={{ marginTop: 'var(--spacing-0-5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{warden.category}</Text>}
            </div>
          </div>
        </CardHeader>

        <CardBody style={{ marginTop: 'var(--spacing-5)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>
          <HStack gap="none" align="center">
            <div style={{ flexShrink: 0, width: 'var(--spacing-8)', display: 'flex', justifyContent: 'center' }}>
              <FaEnvelope color="var(--color-text-muted)" />
            </div>
            <Text as="span" color="body" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{warden.email}</Text>
          </HStack>

          <HStack gap="none" align="center">
            <div style={{ flexShrink: 0, width: 'var(--spacing-8)', display: 'flex', justifyContent: 'center' }}>
              <FaPhone color="var(--color-text-muted)" />
            </div>
            {warden.phone ? <Text as="span" color="body">{warden.phone}</Text> : <Text as="span" color="muted" style={{ fontStyle: 'italic' }}>Not provided</Text>}
          </HStack>

          <HStack gap="none" align="start">
            {" "}
            <div style={{ flexShrink: 0, width: 'var(--spacing-8)', display: 'flex', justifyContent: 'center', paddingTop: 'var(--spacing-0-5)' }}>
              {" "}
              <FaBuilding color="var(--color-text-muted)" />
            </div>
            <Text as="span" weight="medium" color="secondary" style={{ wordBreak: 'break-word' }}> {getAssignedHostelNames()}</Text>
          </HStack>
        </CardBody>

        <CardFooter style={{ marginTop: 'var(--spacing-5)', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text as="div" size="xs" color="muted">
            Joined on{" "}
            {warden.joinDate
              ? new Date(warden.joinDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              : "N/A"}
          </Text>

          <Button onClick={() => setShowEditForm(true)} variant="ghost" size="sm" aria-label={`Edit ${staffTitle.toLowerCase()}`}><FaEdit /></Button>
        </CardFooter>
      </Card>

      {showEditForm && <EditWardenForm warden={warden} staffType={staffType} onClose={() => setShowEditForm(false)} onSave={handleSave} onDelete={handleDelete} />}
    </>
  )
}

export default WardenCard
