import React, { useState, useEffect } from "react"
import ProfileAvatar from "./ProfileAvatar"
import ChangePasswordButton from "../passwordChange/ChangePasswordButton"
import RoomChangeForm from "../students/RoomChangeForm"
import ManageSessionsButton from "../sessions/ManageSessionsButton"
import usePwaMobile from "../../hooks/usePwaMobile"
import { MdOutlineViewSidebar, MdOutlineMenu } from "react-icons/md"

const LAYOUT_PREFERENCE_KEY = "student_layout_preference"

const ProfileHeader = ({ user, role, subtitle }) => {
  const { isPwaMobile, isStandalone } = usePwaMobile()
  const [layoutPreference, setLayoutPreference] = useState("sidebar") // Default to sidebar

  // Load layout preference from localStorage on component mount
  useEffect(() => {
    const savedPreference = localStorage.getItem(LAYOUT_PREFERENCE_KEY)
    if (savedPreference) {
      setLayoutPreference(savedPreference)
    }
  }, [])

  // Toggle layout preference and save to localStorage
  const toggleLayout = () => {
    const newPreference = layoutPreference === "sidebar" ? "bottombar" : "sidebar"
    setLayoutPreference(newPreference)
    localStorage.setItem(LAYOUT_PREFERENCE_KEY, newPreference)

    // Show notification that requires app restart
    alert("Layout preference saved. Please restart the app to apply changes.")
  }

  // Only show layout toggle for students in PWA mode
  const showLayoutToggle = role === "Student" && isPwaMobile && isStandalone

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

          {showLayoutToggle && (
            <button onClick={toggleLayout} className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-100 hover:bg-blue-200 text-[#1360AB] text-sm transition-colors">
              {layoutPreference === "sidebar" ? (
                <>
                  <MdOutlineMenu className="mr-1.5" />
                  <span>Switch to Bottom Bar</span>
                </>
              ) : (
                <>
                  <MdOutlineViewSidebar className="mr-1.5" />
                  <span>Switch to Sidebar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
