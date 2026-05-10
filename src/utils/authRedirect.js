export const REDIRECT_QUERY_PARAM = "redirect"

const normalizeSubRole = (subRole = "") =>
  String(subRole || "").trim().toLowerCase().replace(/\s+/g, " ")

export const sanitizeRedirectTarget = (target, fallback = "/") => {
  if (typeof target !== "string") return fallback

  const trimmedTarget = target.trim()
  if (!trimmedTarget.startsWith("/")) return fallback
  if (trimmedTarget.startsWith("//")) return fallback
  if (trimmedTarget.startsWith("/login")) return fallback

  return trimmedTarget
}

export const buildRedirectTarget = (location) => {
  if (!location || typeof location !== "object") return "/"

  const pathname = typeof location.pathname === "string" ? location.pathname : "/"
  const search = typeof location.search === "string" ? location.search : ""
  const hash = typeof location.hash === "string" ? location.hash : ""

  return sanitizeRedirectTarget(`${pathname}${search}${hash}`)
}

export const buildLoginRedirectPath = (location) => {
  const redirectTarget = buildRedirectTarget(location)
  const searchParams = new URLSearchParams()

  searchParams.set(REDIRECT_QUERY_PARAM, redirectTarget)

  return `/login?${searchParams.toString()}`
}

export const getPostLoginRedirect = (searchParams, fallbackPath) => {
  const redirectTarget = searchParams?.get(REDIRECT_QUERY_PARAM)
  return sanitizeRedirectTarget(redirectTarget, fallbackPath)
}

export const getDefaultHomeRoute = (user) => {
  if (!user) return "/login"

  switch (user.role) {
    case "Student":
      return "/student"
    case "Warden":
      return "/warden"
    case "Security":
      return "/guard"
    case "Hostel Gate":
      return "/hostel-gate"
    case "Admin":
      return "/admin"
    case "Super Admin":
      return "/super-admin"
    case "Maintenance Staff":
      return "/maintenance"
    case "Associate Warden":
      return "/associate-warden"
    case "Hostel Supervisor":
      return "/hostel-supervisor"
    case "Gymkhana":
      return normalizeSubRole(user.subRole) === "club" ? "/gymkhana/club" : "/gymkhana"
    default:
      return "/login"
  }
}
