import React from "react"
import { IoMdSchool } from "react-icons/io"
import { FaBuilding, FaEnvelope, FaIdCard, FaEye } from "react-icons/fa"
import { getMediaUrl } from "../../../utils/mediaUtils"
import Card from "../Card"
import Button from "../Button"

const StudentCard = ({ student, onClick }) => {
  return (
    <Card className="overflow-hidden" onClick={onClick}>
      <Card.Header className="mb-0">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {student.profileImage ? (
              <img src={getMediaUrl(student.profileImage)} alt={student.name} style={{ height: 'var(--avatar-lg)', width: 'var(--avatar-lg)', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: 'var(--border-2) solid var(--color-primary)', boxShadow: 'var(--shadow-sm)' }} />
            ) : (
              <div style={{ height: 'var(--avatar-lg)', width: 'var(--avatar-lg)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'var(--border-2) solid var(--color-primary)' }}>
                <IoMdSchool style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-xl)' }} />
              </div>
            )}
            <div style={{ marginLeft: 'var(--spacing-3)' }}>
              <h3 style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>{student.name}</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{student.email}</p>
            </div>
          </div>
        </div>
      </Card.Header>

      <Card.Body style={{ marginTop: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-sm)' }}>
          <div style={{ width: 'var(--spacing-6)', display: 'flex', justifyContent: 'center' }}>
            <FaIdCard style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
          </div>
          <span style={{ marginLeft: 'var(--spacing-2)', color: 'var(--color-text-body)', fontWeight: 'var(--font-weight-medium)' }}>{student.rollNumber}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-sm)' }}>
          <div style={{ width: 'var(--spacing-6)', display: 'flex', justifyContent: 'center' }}>
            <FaBuilding style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
          </div>
          <div style={{ marginLeft: 'var(--spacing-2)', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ padding: 'var(--spacing-1) var(--spacing-2)', display: 'inline-flex', fontSize: 'var(--font-size-xs)', lineHeight: 1.25, fontWeight: 'var(--font-weight-medium)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>{student.hostel || "N/A"}</span>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>{student.displayRoom || `Room not allocated`}</span>
          </div>
        </div>

        {student.department && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-sm)' }}>
            <div style={{ width: 'var(--spacing-6)', display: 'flex', justifyContent: 'center' }}>
              <IoMdSchool style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
            </div>
            <div style={{ marginLeft: 'var(--spacing-2)', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ color: 'var(--color-text-body)' }}>{student.department}</span>
              {student.year && <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-0-5) var(--spacing-2)', borderRadius: 'var(--radius-md)' }}>{student.year}</span>}
            </div>
          </div>
        )}
      </Card.Body>

      <Card.Footer style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-3)', borderTop: 'var(--border-1) solid var(--color-border-light)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button onClick={(e) => {
          e.stopPropagation()
          onClick()
        }} variant="ghost" size="small" icon={<FaEye />} aria-label="View student details" />
      </Card.Footer>
    </Card>
  )
}

export default StudentCard
