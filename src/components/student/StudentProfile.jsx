import React from "react"
import { FaUser, FaGraduationCap, FaIdCard } from "react-icons/fa"
import { getMediaUrl } from "../../utils/mediaUtils"

const StudentProfile = ({ profile }) => {
  if (!profile) return null

  return (
    <div style={{ 
      backgroundColor: 'var(--color-bg-primary)', 
      borderRadius: 'var(--radius-xl)', 
      boxShadow: 'var(--shadow-sm)', 
      padding: 'var(--spacing-5)', 
      border: `var(--border-1) solid var(--color-border-light)`, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }} className="md:flex-row">
      <div style={{ marginBottom: 'var(--spacing-4)' }} className="md:mb-0 md:mr-6">
        <div style={{ 
          width: 'var(--avatar-2xl)', 
          height: 'var(--avatar-2xl)', 
          borderRadius: 'var(--radius-full)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: 'var(--icon-2xl)', 
          backgroundColor: 'var(--color-info-bg)', 
          color: 'var(--color-primary)' 
        }}>
          {profile.profileImage ? (
            <img 
              src={getMediaUrl(profile.profileImage)} 
              alt="Profile" 
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: 'var(--radius-full)', 
                objectFit: 'cover' 
              }} 
            />
          ) : (
            <FaUser />
          )}
        </div>
      </div>

      <div style={{ flex: 1, textAlign: 'center' }} className="md:text-left">
        <h2 style={{ 
          fontSize: 'var(--font-size-2xl)', 
          fontWeight: 'var(--font-weight-bold)', 
          color: 'var(--color-text-secondary)' 
        }}>{profile.name}</h2>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          fontSize: 'var(--font-size-sm)', 
          color: 'var(--color-text-tertiary)', 
          marginTop: 'var(--spacing-1)', 
          gap: 'var(--spacing-1)' 
        }} className="md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="md:justify-start">
            <FaIdCard style={{ marginRight: 'var(--spacing-1)', fontSize: 'var(--icon-sm)' }} /> {profile.rollNumber}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="md:justify-start">
            <FaGraduationCap style={{ marginRight: 'var(--spacing-1)', fontSize: 'var(--icon-sm)' }} /> {profile.degree}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', gap: 'var(--gap-sm)' }} className="md:mt-0">
        <div style={{ 
          padding: `var(--spacing-1) var(--spacing-3)`, 
          borderRadius: 'var(--radius-full)', 
          fontSize: 'var(--font-size-xs)', 
          backgroundColor: 'var(--color-success-bg)', 
          color: 'var(--color-success-text)' 
        }}>{profile.hostelName}</div>
      </div>
    </div>
  )
}

export default StudentProfile
