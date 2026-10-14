export const canAccessInternAccommodation = (user) =>
  ["Academics", "Hostel Supervisor", "Hostel Gate"].includes(user?.role) ||
  (user?.role === "Admin" && ["Chief Warden Office", "Chief Warden", "Accountant"].includes(user.subRole))

export const isInternAccommodationRoute = (key) => String(key || "").endsWith(".internAccommodation")
