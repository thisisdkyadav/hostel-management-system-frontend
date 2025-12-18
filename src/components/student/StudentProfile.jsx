import React from "react"
import { FaUser, FaGraduationCap, FaIdCard } from "react-icons/fa"
import { getMediaUrl } from "../../utils/mediaUtils"

const StudentProfile = ({ profile }) => {
  if (!profile) return null

  return (
    <>
      <style>{`
        .student-profile-container {
          background-color: var(--color-bg-primary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          padding: var(--spacing-5);
          border: var(--border-1) solid var(--color-border-light);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        @media (min-width: 768px) {
          .student-profile-container {
            flex-direction: row;
            align-items: center;
          }
        }
        
        .student-profile-avatar-wrapper {
          margin-bottom: var(--spacing-4);
        }
        
        @media (min-width: 768px) {
          .student-profile-avatar-wrapper {
            margin-bottom: 0;
            margin-right: var(--spacing-6);
          }
        }
        
        .student-profile-info {
          flex: 1;
          text-align: center;
        }
        
        @media (min-width: 768px) {
          .student-profile-info {
            text-align: left;
          }
        }
        
        .student-profile-details {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: var(--font-size-sm);
          color: var(--color-text-tertiary);
          margin-top: var(--spacing-1);
          gap: var(--spacing-1);
        }
        
        @media (min-width: 768px) {
          .student-profile-details {
            flex-direction: row;
            align-items: center;
            gap: var(--spacing-4);
          }
        }
        
        .student-profile-detail-item {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (min-width: 768px) {
          .student-profile-detail-item {
            justify-content: flex-start;
          }
        }
        
        .student-profile-badge-wrapper {
          margin-top: var(--spacing-4);
          display: flex;
          gap: var(--gap-sm);
        }
        
        @media (min-width: 768px) {
          .student-profile-badge-wrapper {
            margin-top: 0;
          }
        }
      `}</style>
      
      <div className="student-profile-container">
        <div className="student-profile-avatar-wrapper">
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

        <div className="student-profile-info">
          <h2 style={{ 
            fontSize: 'var(--font-size-2xl)', 
            fontWeight: 'var(--font-weight-bold)', 
            color: 'var(--color-text-secondary)' 
          }}>{profile.name}</h2>
          <div className="student-profile-details">
            <span className="student-profile-detail-item">
              <FaIdCard style={{ marginRight: 'var(--spacing-1)', fontSize: 'var(--icon-sm)' }} /> {profile.rollNumber}
            </span>
            <span className="student-profile-detail-item">
              <FaGraduationCap style={{ marginRight: 'var(--spacing-1)', fontSize: 'var(--icon-sm)' }} /> {profile.degree}
            </span>
          </div>
        </div>

        <div className="student-profile-badge-wrapper">
          <div style={{ 
            padding: `var(--spacing-1) var(--spacing-3)`, 
            borderRadius: 'var(--radius-full)', 
            fontSize: 'var(--font-size-xs)', 
            backgroundColor: 'var(--color-success-bg)', 
            color: 'var(--color-success-text)' 
          }}>{profile.hostelName}</div>
        </div>
      </div>
    </>
  )
}

export default StudentProfile
