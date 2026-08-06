import React from "react"
import { getMediaUrl } from "../../../../utils/mediaUtils"
import { Heading, Text } from "@/components/ui"
const StudentDetails = ({ studentName, studentEmail, studentProfileImage }) => {
  return (
    <div className="rounded-md p-4 border" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-primary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-4)' }}>
      <Heading as="h3" size="sm" weight="medium" color="muted" style={{ marginBottom: 'var(--spacing-3)' }} className="font-medium mb-3">Student Information</Heading>
      <div className="flex items-center">
        {studentProfileImage ? (
          <img src={getMediaUrl(studentProfileImage)} alt={studentName} className="rounded-full object-cover mr-4" style={{ width: 'var(--avatar-lg)', height: 'var(--avatar-lg)', borderRadius: 'var(--radius-avatar)' }} />
        ) : (
          <div className="rounded-full flex items-center justify-center mr-4" style={{ width: 'var(--avatar-lg)', height: 'var(--avatar-lg)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-avatar)' }} >
            <Text as="span" color="placeholder" size="lg" weight="medium">
              {studentName ? studentName.charAt(0).toUpperCase() : "?"}
            </Text>
          </div>
        )}
        <div>
          <Text weight="medium" color="primary" size="base">
            {studentName || "Not provided"}
          </Text>
          <Text size="sm" color="placeholder">
            {studentEmail || "Email not provided"}
          </Text>
        </div>
      </div>
    </div>
  )
}

export default StudentDetails
