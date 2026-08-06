import React, { useState } from "react"
import { FaBuilding, FaEdit, FaEnvelope, FaShieldAlt, FaIdCard, FaCircle, FaEye } from "react-icons/fa"
import EditSecurityForm from "./EditSecurityForm"
import SecurityStaffDetailsModal from "./SecurityStaffDetailsModal"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { Card, CardBody, CardFooter, CardHeader, Heading, HStack, IconCircle, Text } from "@/components/ui"
import { Button } from "czero/react"

const SecurityCard = ({ security, onUpdate, onDelete }) => {
  const { hostelList } = useGlobal()
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
          <IconCircle size="var(--spacing-3)" bg={statusColor.bg}></IconCircle>

          <Text as="span" size="xs" weight="medium" color={statusColor.text} style={{ marginLeft: 'var(--spacing-1-5)' }}>{security.hostelId ? "Assigned" : "Unassigned"}</Text>
        </div>

        <CardHeader style={{ marginBottom: 0 }}>
          <HStack gap="none" align="center">
            <IconCircle size="var(--avatar-lg)" bg="var(--color-primary)" color="var(--color-white)" style={{ fontSize: 'var(--font-size-xl)', marginRight: 'var(--spacing-4)' }} className="sm:w-16 sm:h-16">
              <FaShieldAlt />
            </IconCircle>
            <div>
              <Heading as="h3" weight="bold" color="primary" size="lg">{security.name}</Heading>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                <FaIdCard style={{ marginRight: 'var(--spacing-1-5)', color: 'var(--color-primary)', opacity: 'var(--opacity-70)' }} />
                <span>Security Staff</span>
              </div>
            </div>
          </HStack>
        </CardHeader>

        <CardBody style={{ marginTop: 'var(--spacing-5)', paddingTop: 'var(--spacing-4)', borderTop: `var(--border-1) solid var(--color-border-light)`, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <HStack gap="none" align="center">
            <IconCircle size="var(--spacing-7)" bg="brand" style={{ marginRight: 'var(--spacing-3)' }}>
              <FaEnvelope style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-xs)' }} />
            </IconCircle>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{security.email}</span>
          </HStack>

          <HStack gap="none" align="center">
            <IconCircle size="var(--spacing-7)" bg="brand" style={{ marginRight: 'var(--spacing-3)' }}>
              <FaBuilding style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-xs)' }} />
            </IconCircle>
            <div>
              <Text as="span" size="sm" color="body" weight="medium">{hostelName}</Text>
            </div>
          </HStack>
        </CardBody>

        <CardFooter style={{ marginTop: 'var(--spacing-5)', paddingTop: 'var(--spacing-4)', borderTop: `var(--border-1) solid var(--color-border-light)`, display: 'flex', gap: 'var(--spacing-2)' }}>
          <Button onClick={() => setShowDetailsModal(true)} variant="secondary" size="sm" fullWidth>
            <FaEye /> View Details
          </Button>
          <Button onClick={() => setShowEditForm(true)} variant="secondary" size="sm" fullWidth>
            <FaEdit /> Edit
          </Button>
        </CardFooter>
      </Card>

      {showEditForm && <EditSecurityForm security={security} onClose={() => setShowEditForm(false)} onUpdate={onUpdate} onDelete={onDelete} />}
      {showDetailsModal && <SecurityStaffDetailsModal staff={security} onClose={() => setShowDetailsModal(false)} />}
    </>
  )
}

export default SecurityCard
