import React from "react"
import { useOnlineUsersList } from "../../hooks/useOnlineUsers"
import { Avatar, Spinner, Surface, Text } from "@/components/ui"

/**
 * Popup content showing latest online users filtered by role
 * Used inside Popover component for hover display
 */
const OnlineUsersPopupContent = ({ role, roleLabel }) => {
    const { users, loading, error } = useOnlineUsersList({
        role,
        limit: 10,
    })

    // Format relative time from connectedAt
    const getRelativeTime = (connectedAt) => {
        if (!connectedAt) return ""
        const now = new Date()
        const connected = new Date(connectedAt)
        const diffMs = now - connected
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h ago`
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays}d ago`
    }

    return (
        <div
            style={{
                minWidth: "220px",
                maxWidth: "280px",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "var(--spacing-2)",
                    borderBottom: "1px solid var(--color-border-primary)",
                    marginBottom: "var(--spacing-2)",
                }}
            >
                <Text
                    style={{
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--color-text-secondary)",
                        fontSize: "var(--font-size-sm)",
                    }}
                >
                    {roleLabel} Online
                </Text>
                <Text as="span" color="success-text" size="xs" weight="semibold" style={{ padding: "var(--spacing-0-5) var(--spacing-2)", background: "var(--color-success-bg)", borderRadius: "var(--radius-full)" }}>
                    {users.length}
                </Text>
            </div>

            {/* Content */}
            {loading ? (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "var(--spacing-4)",
                    }}
                >
                    <Spinner size="small" />
                </div>
            ) : error ? (
                <Surface padding={3} color="danger" size="xs" align="center">
                    Failed to load
                </Surface>
            ) : users.length === 0 ? (
                <Surface padding={4} color="muted" size="sm" align="center">
                    No {roleLabel.toLowerCase()} online
                </Surface>
            ) : (
                <ul
                    style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--spacing-1)",
                    }}
                >
                    {users.map((user) => (
                        <li
                            key={user.userId}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--spacing-2)",
                                padding: "var(--spacing-1-5) var(--spacing-1)",
                                borderRadius: "var(--radius-md)",
                                transition: "var(--transition-fast)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--color-bg-hover)"
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent"
                            }}
                        >
                            <Avatar
                                name={user.userName || user.userEmail}
                                size="xsmall"
                                showStatus
                                status="online"
                            />
                            <div
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    overflow: "hidden",
                                }}
                            >
                                <Text as="div" size="sm" weight="medium" color="primary" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {user.userName || "Unknown"}
                                </Text>
                            </div>
                            <Text as="span" size="xs" color="muted" style={{ whiteSpace: "nowrap" }}>
                                {getRelativeTime(user.connectedAt)}
                            </Text>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default OnlineUsersPopupContent
