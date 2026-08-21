export const useCalendarPermissions = ({ user }) => {
  const isGymkhanaRole = user?.role === "Gymkhana"
  const isAdminLevel = user?.role === "Admin" || user?.role === "Super Admin"
  const isSuperAdmin = user?.role === "Super Admin"
  const isGS = user?.subRole === "GS Gymkhana"
  const isPresident = user?.subRole === "President Gymkhana"
  const canViewEventsCapability = true
  const canCreateEventsCapability = true
  const canApproveEventsCapability = true
  const maxApprovalAmount = null

  return {
    isGymkhanaRole,
    isAdminLevel,
    isSuperAdmin,
    isGS,
    isPresident,
    canViewEventsCapability,
    canCreateEventsCapability,
    canApproveEventsCapability,
    maxApprovalAmount,
  }
}

export default useCalendarPermissions
