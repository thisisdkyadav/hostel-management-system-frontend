/** "never", "just now", "5m ago", "3h ago", "2d ago", or a date for anything older. */
export const relativeTime = (value) => {
    if (!value) return "Never"
    const then = new Date(value).getTime()
    if (Number.isNaN(then)) return "Never"
    const seconds = Math.round((Date.now() - then) / 1000)
    if (seconds < 45) return "Just now"
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(then).toLocaleDateString()
}

export const exactDateTime = (value) => (value ? new Date(value).toLocaleString() : "")

export const accountIdOf = (account) => account?._id || account?.id || ""

export const scannerCountOf = (account) => account?.scannerCount ?? account?.scanners?.length ?? 0

export const errorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback
