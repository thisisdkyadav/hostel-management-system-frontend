import { FiMail, FiShield, FiUser } from "react-icons/fi"
import { EmptyState } from "@/components/ui"
import { useAuth } from "../../contexts/AuthProvider"
import ProfileCard from "./ProfileCard"
import ProfileHeader from "./ProfileHeader"
import ProfileInfo from "./ProfileInfo"

const AcademicsProfile = () => {
  const { user } = useAuth()

  if (!user) {
    return <EmptyState icon={FiUser} title="Profile Not Found" message="We couldn't find your profile information." />
  }

  return (
    <div>
      <ProfileHeader user={user} role="Academics" subtitle="Academic reviewer workspace" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--gap-lg)", marginTop: "var(--spacing-8)" }} className="lg:grid-cols-2">
        <div>
          <ProfileCard title="Personal Information">
            <ProfileInfo label="Email Address" value={user.email || "Not provided"} icon={FiMail} />
            <ProfileInfo label="Role" value={user.role || "Academics"} icon={FiShield} />
            <ProfileInfo label="Sub Role" value={user.subRole || "Not assigned"} icon={FiUser} />
          </ProfileCard>
        </div>
      </div>
    </div>
  )
}

export default AcademicsProfile
