import React from "react"

const ProfileAvatar = ({ user, size = "medium" }) => {
  const getInitials = (name) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const sizeClasses = {
    small: "w-10 h-10 text-sm",
    medium: "w-16 h-16 text-lg",
    large: "w-24 h-24 text-2xl",
  }

  if (user?.profileImage) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0`}>
        <img src={user.profileImage} alt={`${user.name}'s avatar`} className="w-full h-full object-cover" />
      </div>
    )
  }

  const getColorClass = (name) => {
    if (!name) return "bg-blue-100 text-[#1360AB]"

    const colorOptions = ["bg-blue-100 text-[#1360AB]", "bg-purple-100 text-purple-700", "bg-green-100 text-green-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700"]

    const index = name.length % colorOptions.length
    return colorOptions[index]
  }

  return <div className={`${sizeClasses[size]} rounded-full ${getColorClass(user?.name)} flex items-center justify-center font-bold flex-shrink-0`}>{getInitials(user?.name || "User")}</div>
}

export default ProfileAvatar
