import React from "react"
import ProfileAvatar from "./ProfileAvatar"
import ChangePasswordButton from "../passwordChange/ChangePasswordButton"
import RoomChangeForm from "../students/RoomChangeForm"
import ManageSessionsButton from "../sessions/ManageSessionsButton"

const ProfileHeader = ({ user, role, subtitle }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-5">
      <ProfileAvatar user={user} size="large" />
      <div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start">
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <div className="mt-1 sm:mt-0 sm:ml-4 py-1 px-3 rounded-full bg-blue-100 text-[#1360AB] text-xs font-medium">{role}</div>
        </div>
        <p className="text-gray-500 mt-1">{subtitle}</p>
        <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
          <ChangePasswordButton email={user.email} />
          <ManageSessionsButton email={user.email} />
          {/* {role === "Student" && <RoomChangeForm student={user} />} */}
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
