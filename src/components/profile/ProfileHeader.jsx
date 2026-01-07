import React, { useState, useEffect } from "react"
import ProfileAvatar from "./ProfileAvatar"
import ChangePasswordButton from "../passwordChange/ChangePasswordButton"
import ManageSessionsButton from "../sessions/ManageSessionsButton"
import { Button } from "@/components/ui"
import usePwaMobile from "../../hooks/usePwaMobile"
import { MdOutlineViewSidebar, MdOutlineMenu } from "react-icons/md"

const LAYOUT_PREFERENCE_KEY = "student_layout_preference"

const ProfileHeader = ({ user, role, subtitle }) => {
  const { isPwaMobile, isStandalone } = usePwaMobile()
  const [layoutPreference, setLayoutPreference] = useState("sidebar") // Default to sidebar

  // Load layout preference from localStorage on component mount
  useEffect(() => {
    try {
      const savedPreference = localStorage.getItem(LAYOUT_PREFERENCE_KEY)
      if (savedPreference && (savedPreference === "sidebar" || savedPreference === "bottombar")) {
        setLayoutPreference(savedPreference)
      }
    } catch (error) {
      console.error("Error loading layout preference:", error)
    }
  }, [])

  // Toggle layout preference and save to localStorage
  const toggleLayout = () => {
    try {
      const newPreference = layoutPreference === "sidebar" ? "bottombar" : "sidebar"
      setLayoutPreference(newPreference)
      localStorage.setItem(LAYOUT_PREFERENCE_KEY, newPreference)

      // Show notification that requires app restart
      alert("Layout preference saved. Please restart the app to apply changes.")
    } catch (error) {
      console.error("Error saving layout preference:", error)
      alert("Failed to save layout preference. Please try again.")
    }
  }

  // Only show layout toggle for students in PWA mode
  const showLayoutToggle = role === "Student" && isPwaMobile && isStandalone

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-5">
      <ProfileAvatar user={user} size="large" />
      <div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start">
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)", }} >
            {user.name}
          </h2>
          <div style={{ marginTop: "var(--spacing-1)", padding: "var(--spacing-1) var(--spacing-3)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", color: "var(--color-primary)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", }} className="sm:mt-0 sm:ml-4" >
            {role}
          </div>
        </div>
        <p style={{ color: "var(--color-text-muted)", marginTop: "var(--spacing-1)", fontSize: "var(--font-size-base)", }} >
          {subtitle}
        </p>
        <div style={{ marginTop: "var(--spacing-3)", display: "flex", flexWrap: "wrap", gap: "var(--gap-sm)", }} className="justify-center sm:justify-start" >
          <ChangePasswordButton email={user.email} />
          <ManageSessionsButton email={user.email} />
          {/* {role === "Student" && <RoomChangeForm student={user} />} */}

          {showLayoutToggle && (
            <Button onClick={toggleLayout} variant="outline" size="small" icon={layoutPreference === "sidebar" ? <MdOutlineMenu /> : <MdOutlineViewSidebar />}>
              {layoutPreference === "sidebar" ? "Switch to Bottom Bar" : "Switch to Sidebar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
