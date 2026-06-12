import { FaUserCircle } from "react-icons/fa"
import { getMediaUrl } from "../../utils/mediaUtils"

const Avatar = ({ user, isActive, sizeClass }) => (
  <div
    className={`${sizeClass} rounded-xl flex items-center justify-center overflow-hidden ring-2 transition-all duration-200 ${
      isActive ? "ring-white/30" : "ring-[var(--color-border-primary)]"
    }`}
  >
    {user.profileImage ? (
      <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-full h-full object-cover" />
    ) : user.name?.charAt(0).toUpperCase() ? (
      <div
        className={`w-full h-full flex items-center justify-center font-semibold text-sm ${
          isActive ? "bg-white text-[var(--color-primary)]" : "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white"
        }`}
      >
        {user.name.charAt(0).toUpperCase()}
      </div>
    ) : (
      <FaUserCircle className={`text-2xl ${isActive ? "text-white" : "text-[var(--color-primary)]"}`} />
    )}
  </div>
)

/**
 * Profile + logout block at the bottom of the sidebar.
 * Expanded: avatar, name/email and a logout button. Collapsed: avatar only.
 */
const ProfileCard = ({ user, isOpen, profileItem, logoutItem, isActive, onNavigate }) => {
  if (!user) return null

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => profileItem && onNavigate(profileItem)}
        title={user.name || "Profile"}
        aria-label="Profile"
        aria-current={isActive ? "page" : undefined}
        className={`
          group w-full rounded-xl transition-colors duration-200 cursor-pointer p-2 flex justify-center
          outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
          ${isActive ? "bg-[var(--color-primary)] shadow-md shadow-[var(--color-primary)]/25" : "hover:bg-[var(--color-bg-hover)]"}
        `}
      >
        <Avatar user={user} isActive={isActive} sizeClass="w-10 h-10" />
      </button>
    )
  }

  return (
    <div
      onClick={() => profileItem && onNavigate(profileItem)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
          event.preventDefault()
          if (profileItem) onNavigate(profileItem)
        }
      }}
      aria-label="Profile"
      className={`
        group relative rounded-2xl transition-colors duration-200 cursor-pointer
        outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
        ${isActive ? "bg-[var(--color-primary)] shadow-md shadow-[var(--color-primary)]/20" : "bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)]"}
      `}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center flex-1 min-w-0">
          <div className="relative mr-3 flex-shrink-0">
            <Avatar user={user} isActive={isActive} sizeClass="w-10 h-10" />
          </div>

          <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
            <span className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-[var(--color-text-primary)]"}`}>
              {user.name || "User"}
            </span>
            {user.email && (
              <span className={`text-xs truncate ${isActive ? "text-white/75" : "text-[var(--color-text-muted)]"}`}>{user.email}</span>
            )}
          </div>
        </div>

        {logoutItem && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onNavigate(logoutItem)
            }}
            title="Logout"
            aria-label="Logout"
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ml-2 transition-colors duration-200
              outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)]/40
              ${isActive
                ? "text-white/80 hover:text-white hover:bg-white/15"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"}
            `}
          >
            <logoutItem.icon size={18} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  )
}

export default ProfileCard
