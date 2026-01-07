import React, { useState } from "react"
import { FaEdit, FaEnvelope, FaPhone, FaUserShield, FaTrash } from "react-icons/fa"
import { BsCalendarCheck } from "react-icons/bs"
import EditAdminForm from "./EditAdminForm"
import { getMediaUrl } from "../../../utils/mediaUtils"
import { Card, CardHeader, CardBody, CardFooter, Button, Badge } from "@/components/ui"

const AdminCard = ({ admin, onUpdate, onDelete }) => {
  const [showEditForm, setShowEditForm] = useState(false)

  const calculateServiceYears = (createdAt) => {
    if (!createdAt) return 0
    const start = new Date(createdAt)
    const now = new Date()
    return Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000))
  }

  const serviceYears = calculateServiceYears(admin.createdAt)
  const status = admin.isActive !== false ? "active" : "inactive"

  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case "active":
        return { bg: "bg-[var(--color-success)]", light: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" }
      case "inactive":
        return { bg: "bg-[var(--color-danger)]", light: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" }
      default:
        return { bg: "bg-[var(--color-text-disabled)]", light: "bg-[var(--color-bg-muted)]", text: "text-[var(--color-text-muted)]" }
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

  return (
    <>
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-[var(--spacing-16)] h-[var(--spacing-16)]`}>
          <div className={`absolute rotate-45 transform origin-bottom-right ${statusColor.bg} text-[var(--color-white)] text-[var(--font-size-xs)] font-[var(--font-weight-medium)] py-[var(--spacing-1)] right-[-6px] top-[-2px] w-[var(--spacing-24)] text-center`}>{status === "active" ? "Active" : "Inactive"}</div>
        </div>

        <CardHeader className="mb-0">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-shrink-0 mb-[var(--spacing-3)] md:mb-0 md:mr-[var(--spacing-4)]">
              {admin.profileImage ? (
                <img src={getMediaUrl(admin.profileImage)} alt={admin.name} className="w-[var(--avatar-xl)] h-[var(--avatar-xl)] rounded-[var(--radius-full)] object-cover border-[var(--border-2)] border-[var(--color-primary)] shadow-[var(--shadow-sm)]" />
              ) : (
                <div className="w-[var(--avatar-xl)] h-[var(--avatar-xl)] rounded-[var(--radius-full)] bg-[var(--color-primary-bg)] flex items-center justify-center border-[var(--border-2)] border-[var(--color-primary)]">
                  <FaUserShield className="text-[var(--color-primary)] text-[var(--font-size-2xl)]" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-[var(--font-weight-bold)] text-[var(--font-size-lg)] text-[var(--color-text-secondary)] truncate">{admin.name}</h3>
              <div className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] mt-[var(--spacing-0-5)] truncate">{admin.category || "Admin"}</div>
            </div>
          </div>
        </CardHeader>

        <CardBody className="mt-[var(--spacing-5)] space-y-[var(--spacing-3)] text-[var(--font-size-sm)]">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-[var(--spacing-8)] flex justify-center">
              <FaEnvelope className="text-[var(--color-text-placeholder)]" />
            </div>
            <span className="truncate text-[var(--color-text-tertiary)]">{admin.email}</span>
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0 w-[var(--spacing-8)] flex justify-center">
              <FaPhone className="text-[var(--color-text-placeholder)]" />
            </div>
            {admin.phone ? <span className="text-[var(--color-text-tertiary)]">{admin.phone}</span> : <span className="text-[var(--color-text-placeholder)] italic">Not provided</span>}
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-[var(--spacing-8)] flex justify-center pt-[var(--spacing-0-5)]">
              <FaUserShield className="text-[var(--color-text-placeholder)]" />
            </div>
            <span className="font-[var(--font-weight-medium)] text-[var(--color-text-secondary)] break-words">System Administrator</span>
          </div>
        </CardBody>

        <CardFooter className="mt-[var(--spacing-5)] pt-[var(--spacing-4)] border-t border-[var(--color-border-light)] flex items-center justify-between">
          <div className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
            Added on{" "}
            {admin.createdAt
              ? new Date(admin.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              : "N/A"}
          </div>

          <div className="flex space-x-[var(--spacing-2)]">
            <Button
              onClick={() => setShowEditForm(true)}
              variant="secondary"
              size="small"
              icon={<FaEdit />}
              aria-label="Edit administrator"
            />
          </div>
        </CardFooter>
      </Card>

      {showEditForm && <EditAdminForm admin={admin} onClose={() => setShowEditForm(false)} onSave={handleSave} onDelete={handleDelete} />}
    </>
  )
}

export default AdminCard
