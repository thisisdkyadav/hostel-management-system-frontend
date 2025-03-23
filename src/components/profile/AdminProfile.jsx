import React from "react"
import { FiMail, FiPhone, FiCalendar, FiMapPin, FiUser, FiShield, FiLock } from "react-icons/fi"
import ProfileHeader from "./ProfileHeader"
import ProfileCard from "./ProfileCard"
import ProfileInfo from "./ProfileInfo"

const AdminProfile = ({ user, activeTab }) => {
  // Dummy admin data
  const adminData = {
    name: "Priya Kapoor",
    email: "priya.kapoor@example.com",
    phone: "+91 9876543216",
    role: "System Administrator",
    joiningDate: "12 March 2019",
    address: "321 Tech Park, Hyderabad, Telangana",
    department: "IT Administration",
    accessLevel: "Full Access",
    lastLogin: "Today at 09:45 AM",
    twoFactorEnabled: "Yes",
  }

  if (activeTab === "profile") {
    return (
      <div>
        <ProfileHeader user={adminData} role="Administrator" subtitle={`${adminData.department} | ${adminData.role}`} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div>
            <ProfileCard title="Personal Information">
              <ProfileInfo label="Email Address" value={adminData.email} icon={FiMail} />
              <ProfileInfo label="Phone Number" value={adminData.phone} icon={FiPhone} />
              <ProfileInfo label="Address" value={adminData.address} icon={FiMapPin} />
            </ProfileCard>
          </div>

          <div>
            <ProfileCard title="System Access">
              <ProfileInfo label="Department" value={adminData.department} icon={FiUser} />
              <ProfileInfo label="Joining Date" value={adminData.joiningDate} icon={FiCalendar} />
              <ProfileInfo label="Access Level" value={adminData.accessLevel} icon={FiShield} />
              <ProfileInfo label="Last Login" value={adminData.lastLogin} icon={FiCalendar} />
              <ProfileInfo label="Two-Factor Authentication" value={adminData.twoFactorEnabled} icon={FiLock} />
            </ProfileCard>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-8 text-gray-500">
      {activeTab === "security" && "Security settings will be displayed here"}
      {activeTab === "notifications" && "Notification preferences will be displayed here"}
    </div>
  )
}

export default AdminProfile
